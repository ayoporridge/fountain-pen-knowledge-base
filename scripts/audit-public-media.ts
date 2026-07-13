import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { execute, queryAll } from "../src/lib/db";
import {
  fetchExternalImage,
  MediaFetchError,
  pickExternalMediaUrl,
} from "../src/lib/media-url";
import { publicMediaFilter } from "../src/lib/public-media";

type MediaRow = {
  id: string;
  entity_id: string | null;
  image_url: string | null;
  thumbnail_url: string | null;
  local_path: string | null;
  review_status: string;
  usage_status: string;
};

type AuditResult = {
  media_id: string;
  entity_id: string | null;
  url: string | null;
  final_url: string | null;
  status: number | "ok" | "missing" | "invalid";
  mime: string | null;
  bytes: number | null;
  error: string | null;
  checked_at: string;
};

function option(name: string): string | undefined {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

const applyChanges = process.argv.includes("--apply");
const remoteFlag = process.argv.includes("--remote");
const concurrency = Math.min(
  Math.max(Number.parseInt(option("--concurrency") || "8", 10) || 8, 1),
  24,
);
const stamp = new Date().toISOString().replace(/[:.]/g, "-");
const defaultOutputDir =
  process.env.MEDIA_AUDIT_OUTPUT_DIR ||
  path.join(os.tmpdir(), "fountain-pen-graph-media-audit");
const jsonPath = option("--json") || path.join(defaultOutputDir, `${stamp}.json`);
const markdownPath =
  option("--markdown") || path.join(defaultOutputDir, `${stamp}.md`);

function validateApplyGate() {
  if (!applyChanges) return;
  if (process.env.ALLOW_MEDIA_STATUS_WRITE !== "1") {
    throw new Error("--apply requires ALLOW_MEDIA_STATUS_WRITE=1");
  }
  const hasRemoteDatabase = Boolean(process.env.TURSO_DATABASE_URL);
  if (hasRemoteDatabase && !remoteFlag) {
    throw new Error("Remote database writes require the explicit --remote flag");
  }
  if (
    hasRemoteDatabase &&
    process.env.ALLOW_REMOTE_MEDIA_STATUS_WRITE !== "1"
  ) {
    throw new Error(
      "Remote database writes require ALLOW_REMOTE_MEDIA_STATUS_WRITE=1",
    );
  }
  if (remoteFlag && !hasRemoteDatabase) {
    throw new Error("--remote was supplied but TURSO_DATABASE_URL is not set");
  }
}

async function auditOne(row: MediaRow): Promise<AuditResult> {
  const checkedAt = new Date().toISOString();
  const localPath = row.local_path?.startsWith("public/")
    ? row.local_path.slice("public/".length)
    : row.local_path?.startsWith("/") && !row.local_path.startsWith("//")
      ? row.local_path.slice(1)
      : null;
  if (localPath) {
    const diskPath = path.join(process.cwd(), "public", localPath);
    try {
      const stat = await fs.stat(diskPath);
      return {
        media_id: row.id,
        entity_id: row.entity_id,
        url: `/${localPath}`,
        final_url: `/${localPath}`,
        status: "ok",
        mime: null,
        bytes: stat.size,
        error: null,
        checked_at: checkedAt,
      };
    } catch {
      return {
        media_id: row.id,
        entity_id: row.entity_id,
        url: `/${localPath}`,
        final_url: `/${localPath}`,
        status: "missing",
        mime: null,
        bytes: null,
        error: "Local media file does not exist",
        checked_at: checkedAt,
      };
    }
  }

  const url = pickExternalMediaUrl({
    imageUrl: row.image_url,
    thumbnailUrl: row.thumbnail_url,
  });
  if (!url) {
    return {
      media_id: row.id,
      entity_id: row.entity_id,
      url: row.thumbnail_url || row.image_url,
      final_url: null,
      status: "invalid",
      mime: null,
      bytes: null,
      error: "No on-site file or proxyable HTTPS image URL",
      checked_at: checkedAt,
    };
  }

  try {
    const result = await fetchExternalImage(url);
    return {
      media_id: row.id,
      entity_id: row.entity_id,
      url,
      final_url: result.finalUrl,
      status: result.status,
      mime: result.contentType,
      bytes: result.body.byteLength,
      error: null,
      checked_at: checkedAt,
    };
  } catch (error) {
    return {
      media_id: row.id,
      entity_id: row.entity_id,
      url,
      final_url: error instanceof MediaFetchError ? error.finalUrl || null : null,
      status: error instanceof MediaFetchError ? error.status : "invalid",
      mime: null,
      bytes: null,
      error: error instanceof Error ? error.message : String(error),
      checked_at: checkedAt,
    };
  }
}

async function mapConcurrent<T, R>(
  values: T[],
  workerCount: number,
  worker: (value: T) => Promise<R>,
): Promise<R[]> {
  const output = new Array<R>(values.length);
  let cursor = 0;
  await Promise.all(
    Array.from({ length: Math.min(workerCount, values.length) }, async () => {
      while (cursor < values.length) {
        const index = cursor;
        cursor += 1;
        output[index] = await worker(values[index]);
      }
    }),
  );
  return output;
}

function toMarkdown(
  rows: AuditResult[],
  metadata: { target: string; dryRun: boolean },
): string {
  const failed = rows.filter((row) => row.error);
  const lines = [
    "# Public media audit",
    "",
    `- Checked: ${rows.length}`,
    `- Healthy: ${rows.length - failed.length}`,
    `- Failed: ${failed.length}`,
    `- Target: ${metadata.target}`,
    `- Mode: ${metadata.dryRun ? "dry-run" : "apply"}`,
    "",
    "| media_id | entity_id | status | url | error |",
    "| --- | --- | ---: | --- | --- |",
  ];
  for (const row of rows) {
    lines.push(
      `| ${row.media_id} | ${row.entity_id || ""} | ${row.status} | ${
        row.url || ""
      } | ${(row.error || "").replaceAll("|", "\\|")} |`,
    );
  }
  return `${lines.join("\n")}\n`;
}

async function writeReports(
  rows: AuditResult[],
  metadata: { target: string; dryRun: boolean },
) {
  await Promise.all([
    fs.mkdir(path.dirname(jsonPath), { recursive: true }),
    fs.mkdir(path.dirname(markdownPath), { recursive: true }),
  ]);
  await Promise.all([
    fs.writeFile(
      jsonPath,
      `${JSON.stringify({ ...metadata, checked: rows.length, results: rows }, null, 2)}\n`,
    ),
    fs.writeFile(markdownPath, toMarkdown(rows, metadata)),
  ]);
}

async function main() {
  validateApplyGate();
  const rows = (await queryAll(
    `SELECT id, entity_id, image_url, thumbnail_url, local_path,
            review_status, usage_status
     FROM media_assets
     WHERE ${publicMediaFilter("media_assets")}
     ORDER BY id`,
  )) as MediaRow[];

  const results = await mapConcurrent(rows, concurrency, auditOne);
  const target = process.env.TURSO_DATABASE_URL ? "remote-turso" : "local-sqlite";
  await writeReports(results, { target, dryRun: !applyChanges });

  const changes: Array<{
    media_id: string;
    old_status: string;
    new_status: string;
    target: string;
  }> = [];
  if (applyChanges) {
    for (const result of results.filter((entry) => entry.error)) {
      const row = rows.find((entry) => entry.id === result.media_id);
      if (!row || row.usage_status === "hidden") continue;
      await execute(
        "UPDATE media_assets SET usage_status = 'hidden', updated_at = datetime('now') WHERE id = ? AND usage_status = ?",
        [row.id, row.usage_status],
      );
      changes.push({
        media_id: row.id,
        old_status: row.usage_status,
        new_status: "hidden",
        target,
      });
    }
    const applyLogPath = jsonPath.replace(/\.json$/i, "-apply-log.json");
    await fs.writeFile(
      applyLogPath,
      `${JSON.stringify({ target, changes }, null, 2)}\n`,
    );
  }

  console.log(
    JSON.stringify({
      scanned: results.length,
      healthy: results.filter((row) => !row.error).length,
      failed: results.filter((row) => row.error).length,
      dry_run: !applyChanges,
      target,
      json_report: jsonPath,
      markdown_report: markdownPath,
      changes,
    }),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
