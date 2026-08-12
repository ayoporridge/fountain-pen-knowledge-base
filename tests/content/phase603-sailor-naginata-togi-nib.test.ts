import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createClient } from "@libsql/client";
import {
  type ApplyPhase603Options,
  applyPhase603SailorNaginataTogiNibContent,
  PHASE603_NIB_ID,
  PHASE603_PEN_ID,
} from "../../scripts/apply-phase603-sailor-naginata-togi-nib-content";
import {
  copyCheckpointedCatalogToDisposableCopy,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import { HARD_404_ENTITY_PATHS } from "../../src/lib/entity-redirects";
import { computePublicationContentHash } from "../../src/lib/publication";

const ROOT = process.cwd();
const REAL = path.join(ROOT, "data/fpkg.db");
const SOURCE = path.join(
  ROOT,
  ".planning/quick/260812-tt1-split-donor-navigation/checkpoint-final/catalog.db",
);
const SOURCE_SHA =
  "c80141cabc2d9f3f46c455d1cc3ae30a7d5983db2d938585861e544ff9db36f7";
const REAL_SHA =
  "acbb5710050b5c9d6e435666dda909b66055c290a4640f04faa38860ea24d09a";

function sha(file: string): string {
  return crypto
    .createHash("sha256")
    .update(fs.readFileSync(file))
    .digest("hex");
}

function owned(prefix: string) {
  const root = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), prefix)),
  );
  const sourceSnapshot = snapshotCatalogFiles(SOURCE);
  const copy = copyCheckpointedCatalogToDisposableCopy(
    SOURCE,
    path.join(root, "catalog.db"),
    root,
    { expectedSourceSnapshot: sourceSnapshot },
  );
  return { root, database: copy.destinationPath, sourceSnapshot };
}

function guard() {
  const root = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase603-guard-")),
  );
  const database = path.join(root, "real.db");
  fs.copyFileSync(REAL, database, fs.constants.COPYFILE_EXCL);
  return { root, database, snapshot: snapshotCatalogFiles(database) };
}

function options(
  copy: ReturnType<typeof owned>,
  protectedGuard: ReturnType<typeof guard>,
): ApplyPhase603Options {
  return {
    workspaceRoot: ROOT,
    reviewer: "phase603-naginata-togi-test",
    databasePath: copy.database,
    ownedRoot: copy.root,
    protectedCatalogPath: protectedGuard.database,
    protectedCatalogSnapshot: protectedGuard.snapshot,
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
    },
  };
}

test("Phase 603 restores the sourced Naginata-Togi nib without merging the 10-7121 pen", async () => {
  assert.equal(HARD_404_ENTITY_PATHS.has("/nib/sailor-naginata-togi"), false);
  assert.equal(sha(SOURCE), SOURCE_SHA);
  assert.equal(sha(REAL), REAL_SHA);
  const sourceBefore = snapshotCatalogFiles(SOURCE);
  const realBefore = snapshotCatalogFiles(REAL);
  const protectedGuard = guard();

  for (const [label, mutate, pattern] of [
    [
      "name",
      async (database: ReturnType<typeof createClient>) => {
        await database.execute(
          "UPDATE entities SET name='写乐 Sailor Naginata-Togi（长刀研）' WHERE id='uppuHJzvuw5k'",
        );
      },
      /conflicting nib slug or canonical name/,
    ],
    [
      "alias",
      async (database: ReturnType<typeof createClient>) => {
        await database.execute(
          `INSERT INTO entity_aliases
            (id,entity_id,alias,language,source_id,alias_kind,market,valid_from,valid_to,source_item_id,review_status)
           SELECT 'phase603-collision','s39NAG7121','Naginata Togi','en',source_id,
                  alias_kind,market,valid_from,valid_to,source_item_id,'approved'
           FROM entity_aliases WHERE source_item_id IS NOT NULL LIMIT 1`,
        );
      },
      /conflicting Naginata-Togi alias/,
    ],
  ] as const) {
    const collision = owned(`fpkg-phase603-${label}-`);
    const client = createClient({ url: `file:${collision.database}` });
    try {
      await mutate(client);
      await assert.rejects(
        applyPhase603SailorNaginataTogiNibContent(
          client,
          options(collision, protectedGuard),
        ),
        pattern,
      );
    } finally {
      client.close();
      fs.rmSync(collision.root, { recursive: true, force: true });
    }
  }

  for (const key of [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "FPKG_DATABASE_URL",
  ] as const) {
    const remote = owned(`fpkg-phase603-${key.toLowerCase()}-`);
    const client = createClient({ url: `file:${remote.database}` });
    try {
      const remoteOptions = options(remote, protectedGuard);
      remoteOptions.env = {
        ...(remoteOptions.env ?? process.env),
        NODE_ENV: remoteOptions.env?.NODE_ENV ?? "test",
        [key]: "libsql://remote.invalid",
      };
      await assert.rejects(
        applyPhase603SailorNaginataTogiNibContent(client, remoteOptions),
        /refuses inherited remote database selection/,
      );
    } finally {
      client.close();
      fs.rmSync(remote.root, { recursive: true, force: true });
    }
  }

  const copy = owned("fpkg-phase603-");
  const client = createClient({ url: `file:${copy.database}` });
  try {
    const penHashBefore = await computePublicationContentHash(
      client,
      PHASE603_PEN_ID,
    );
    const first = await applyPhase603SailorNaginataTogiNibContent(
      client,
      options(copy, protectedGuard),
    );
    assert.equal(first.outcome, "published");
    const entity = await client.execute({
      sql: "SELECT type,slug,summary,body_md,source FROM entities WHERE id=?",
      args: [PHASE603_NIB_ID],
    });
    assert.equal(entity.rows[0]?.type, "nib");
    assert.equal(entity.rows[0]?.slug, "sailor-naginata-togi");
    assert.match(String(entity.rows[0]?.body_md), /Special Nib/);
    assert.match(String(entity.rows[0]?.body_md), /1991/);
    assert.match(String(entity.rows[0]?.body_md), /10-7121/);
    assert.match(String(entity.rows[0]?.source), /^curated-content:phase603/);

    const publication = await client.execute({
      sql: "SELECT status,blockers_json,approved_content_hash FROM entity_publications WHERE entity_id=?",
      args: [PHASE603_NIB_ID],
    });
    assert.equal(publication.rows[0]?.status, "published");
    assert.equal(publication.rows[0]?.blockers_json, "[]");
    assert.equal(publication.rows[0]?.approved_content_hash, first.contentHash);
    const publicMembership = await client.execute({
      sql: "SELECT type,slug FROM public_entities WHERE id=?",
      args: [PHASE603_NIB_ID],
    });
    assert.deepEqual(publicMembership.rows, [
      { type: "nib", slug: "sailor-naginata-togi" },
    ]);
    const references = await client.execute({
      sql: "SELECT COUNT(*) AS count FROM entity_references WHERE entity_id=? AND review_status='approved'",
      args: [PHASE603_NIB_ID],
    });
    assert.equal(references.rows[0]?.count, 5);
    const media = await client.execute({
      sql: "SELECT local_path,review_status,usage_status FROM media_assets WHERE entity_id=?",
      args: [PHASE603_NIB_ID],
    });
    assert.deepEqual(media.rows, [
      {
        local_path:
          "/images/library/site-original/phase603/sailor/naginata-togi.svg",
        review_status: "approved",
        usage_status: "primary",
      },
    ]);
    const links = await client.execute({
      sql: "SELECT source_id,target_id,link_type FROM entity_links WHERE (source_id=? AND target_id=?) OR (source_id=? AND target_id=?) ORDER BY link_type,source_id",
      args: [
        PHASE603_NIB_ID,
        PHASE603_PEN_ID,
        PHASE603_PEN_ID,
        PHASE603_NIB_ID,
      ],
    });
    assert.deepEqual(links.rows, [
      {
        source_id: PHASE603_NIB_ID,
        target_id: PHASE603_PEN_ID,
        link_type: "related_to",
      },
      {
        source_id: PHASE603_PEN_ID,
        target_id: PHASE603_NIB_ID,
        link_type: "reverse",
      },
    ]);
    assert.equal(
      await computePublicationContentHash(client, PHASE603_PEN_ID),
      penHashBefore,
    );

    const replay = await applyPhase603SailorNaginataTogiNibContent(
      client,
      options(copy, protectedGuard),
    );
    assert.equal(replay.outcome, "noop");
    assert.equal(replay.contentHash, first.contentHash);
    assert.deepEqual(snapshotCatalogFiles(SOURCE), sourceBefore);
    assert.deepEqual(snapshotCatalogFiles(REAL), realBefore);
    assert.deepEqual(
      snapshotCatalogFiles(protectedGuard.database),
      protectedGuard.snapshot,
    );
  } finally {
    client.close();
    fs.rmSync(copy.root, { recursive: true, force: true });
    fs.rmSync(protectedGuard.root, { recursive: true, force: true });
  }
});
