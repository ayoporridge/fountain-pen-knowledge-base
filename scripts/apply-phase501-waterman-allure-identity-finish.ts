import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import type { CatalogSnapshot } from "../src/lib/audit/audit-contracts";
import {
  computePublicationContentHash,
  setEntityPublicationStatus,
} from "../src/lib/publication";

const DONOR_ID = "p244WatermanAllure";
const DONOR_SLUG = "waterman-allure-fountain-pen";
const CANONICAL_ID = "phase83-pen-waterman-allure";
const CANONICAL_SLUG = "waterman-allure";
const WATERMAN_ID = "zkAu9PePDdqJ";
const DONOR_MEDIA_ID = "curated-media-0af25cd3e41db964d69131c1";
const CANONICAL_MEDIA_ID = "curated-media-8ff31e6bb42a5ccfe10aa6fd";
const ALLURE_PATH = "/images/library/site-original/phase244/waterman/allure.svg";
const LINEAGE_ID = "phase247-lineage-b50b6a78fe19abc0fe0ced06";
const REDIRECT_ID = "phase247-redirect-5760b4305ecd3a87c00ee1ec";

export interface ApplyPhase501Options {
  workspaceRoot: string;
  reviewer: string;
  databasePath: string;
  ownedRoot: string;
  protectedCatalogPath: string;
  protectedCatalogSnapshot: CatalogSnapshot;
  env?: NodeJS.ProcessEnv;
}

export interface ApplyPhase501Result {
  changed: boolean;
  donorId: string;
  canonicalId: string;
  donorMediaId: string;
  donorMediaUsage: "hidden";
  canonicalContentHash: string;
}

function inside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative);
}

function rejectRemote(env: NodeJS.ProcessEnv): void {
  for (const key of [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "FPKG_DATABASE_URL",
  ] as const) {
    if (env[key]?.trim()) {
      throw new Error(`Phase 501 refuses inherited remote database selection: ${key}.`);
    }
  }
}

async function rows(
  client: Client | Transaction,
  sql: string,
  args: unknown[] = [],
) {
  return (
    await client.execute({ sql, args: args as never[] })
  ).rows.map((row) => ({ ...row }));
}

async function assertAuthority(
  client: Client,
  options: ApplyPhase501Options,
): Promise<void> {
  rejectRemote(options.env ?? process.env);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const root = fs.realpathSync.native(options.ownedRoot);
  const database = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (
    !fs.statSync(root).isDirectory() ||
    !fs.statSync(database).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    !inside(database, root)
  ) {
    throw new Error("Phase 501 requires an owned, non-symlink catalog copy.");
  }
  const owned = fs.statSync(database, { bigint: true });
  const protectedStat = fs.statSync(protectedPath, { bigint: true });
  if (
    database === protectedPath ||
    (owned.dev === protectedStat.dev && owned.ino === protectedStat.ino)
  ) {
    throw new Error("Phase 501 refuses the protected catalog or hard-link alias.");
  }
  const listed = await client.execute("PRAGMA database_list");
  const main = listed.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== database) {
    throw new Error("Phase 501 client is not bound to the owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 501 owned copy must be migrated through 032.");
  }
}

async function assertIdentity(
  client: Client,
  workspaceRoot: string,
): Promise<void> {
  const brand = await rows(client, "SELECT type,slug FROM entities WHERE id=?", [
    WATERMAN_ID,
  ]);
  if (
    brand.length !== 1 ||
    String(brand[0]?.type) !== "brand" ||
    String(brand[0]?.slug) !== "waterman"
  ) {
    throw new Error("Phase 501 Waterman brand identity mismatch.");
  }

  for (const [entityId, slug] of [
    [DONOR_ID, DONOR_SLUG],
    [CANONICAL_ID, CANONICAL_SLUG],
  ] as const) {
    const entity = await rows(client, "SELECT type,slug FROM entities WHERE id=?", [
      entityId,
    ]);
    if (
      entity.length !== 1 ||
      String(entity[0]?.type) !== "pen" ||
      String(entity[0]?.slug) !== slug
    ) {
      throw new Error(`Phase 501 Waterman identity mismatch: ${entityId}.`);
    }
  }

  const donorPublication = await rows(
    client,
    "SELECT status,blockers_json FROM entity_publications WHERE entity_id=?",
    [DONOR_ID],
  );
  if (
    donorPublication.length !== 1 ||
    String(donorPublication[0]?.blockers_json) !== '["taxonomy_merged"]'
  ) {
    throw new Error("Phase 501 donor is not the reviewed taxonomy merge.");
  }
  const canonicalPublication = await rows(
    client,
    "SELECT status,blockers_json,reviewed_contract_version,reviewed_content_revision,content_revision FROM entity_publications WHERE entity_id=?",
    [CANONICAL_ID],
  );
  if (
    canonicalPublication.length !== 1 ||
    String(canonicalPublication[0]?.status) !== "published" ||
    String(canonicalPublication[0]?.blockers_json) !== "[]" ||
    Number(canonicalPublication[0]?.reviewed_contract_version) !== 3 ||
    Number(canonicalPublication[0]?.reviewed_content_revision) !==
      Number(canonicalPublication[0]?.content_revision)
  ) {
    throw new Error("Phase 501 canonical Allure publication is not blocker-free.");
  }

  const lineage = await rows(
    client,
    "SELECT id,batch_id,action_id,source_entity_id,target_entity_id,lineage_kind FROM entity_lineage WHERE id=?",
    [LINEAGE_ID],
  );
  if (
    lineage.length !== 1 ||
    String(lineage[0]?.source_entity_id) !== DONOR_ID ||
    String(lineage[0]?.target_entity_id) !== CANONICAL_ID ||
    String(lineage[0]?.lineage_kind) !== "merge"
  ) {
    throw new Error("Phase 501 existing Allure merge lineage is missing.");
  }

  const redirect = await rows(
    client,
    "SELECT id,target_path,redirect_kind FROM entity_redirects WHERE id=? AND source_path=?",
    [REDIRECT_ID, `/pen/${DONOR_SLUG}`],
  );
  if (
    redirect.length !== 1 ||
    String(redirect[0]?.target_path) !== `/pen/${CANONICAL_SLUG}` ||
    String(redirect[0]?.redirect_kind) !== "permanent"
  ) {
    throw new Error("Phase 501 existing Allure redirect is missing or conflicting.");
  }

  const maker = await rows(
    client,
    "SELECT id FROM entity_links WHERE source_id=? AND target_id=? AND link_type='made_by'",
    [CANONICAL_ID, WATERMAN_ID],
  );
  const reverse = await rows(
    client,
    "SELECT id FROM entity_links WHERE source_id=? AND target_id=? AND link_type='reverse'",
    [WATERMAN_ID, CANONICAL_ID],
  );
  if (maker.length !== 1 || reverse.length !== 1) {
    throw new Error("Phase 501 canonical Waterman maker relation is missing.");
  }

  const donorAliases = await rows(
    client,
    "SELECT id FROM entity_aliases WHERE entity_id=?",
    [DONOR_ID],
  );
  const donorLinks = await rows(
    client,
    "SELECT id FROM entity_links WHERE source_id=? OR target_id=?",
    [DONOR_ID, DONOR_ID],
  );
  if (donorAliases.length !== 0 || donorLinks.length !== 0) {
    throw new Error("Phase 501 donor retains aliases or graph links after merge.");
  }

  const canonicalMedia = await rows(
    client,
    "SELECT entity_id,local_path,source_item_id,review_status,usage_status FROM media_assets WHERE id=?",
    [CANONICAL_MEDIA_ID],
  );
  const donorMedia = await rows(
    client,
    "SELECT entity_id,local_path,source_item_id,review_status,usage_status FROM media_assets WHERE id=?",
    [DONOR_MEDIA_ID],
  );
  if (
    canonicalMedia.length !== 1 ||
    String(canonicalMedia[0]?.entity_id) !== CANONICAL_ID ||
    String(canonicalMedia[0]?.local_path) !== ALLURE_PATH ||
    String(canonicalMedia[0]?.review_status) !== "approved" ||
    String(canonicalMedia[0]?.usage_status) !== "primary" ||
    donorMedia.length !== 1 ||
    String(donorMedia[0]?.entity_id) !== DONOR_ID ||
    String(donorMedia[0]?.local_path) !== ALLURE_PATH ||
    String(donorMedia[0]?.source_item_id) !==
      String(canonicalMedia[0]?.source_item_id) ||
    String(donorMedia[0]?.review_status) !== "approved" ||
    !["primary", "hidden"].includes(String(donorMedia[0]?.usage_status))
  ) {
    throw new Error("Phase 501 Allure media identity is missing or conflicting.");
  }
  if (!fs.existsSync(path.resolve(workspaceRoot, "public", ALLURE_PATH.slice(1)))) {
    throw new Error(`Phase 501 Allure asset is missing: ${ALLURE_PATH}`);
  }
}

async function hideDonorMedia(client: Client): Promise<boolean> {
  const donor = await rows(
    client,
    "SELECT usage_status FROM media_assets WHERE id=? AND entity_id=?",
    [DONOR_MEDIA_ID, DONOR_ID],
  );
  if (donor.length !== 1) {
    throw new Error("Phase 501 donor media row is missing.");
  }
  if (String(donor[0]?.usage_status) === "hidden") return false;
  if (String(donor[0]?.usage_status) !== "primary") {
    throw new Error("Phase 501 donor media is neither primary nor hidden.");
  }
  const transaction = await client.transaction("write");
  try {
    const updated = await transaction.execute({
      sql: "UPDATE media_assets SET usage_status='hidden',updated_at=datetime('now') WHERE id=? AND entity_id=? AND usage_status='primary'",
      args: [DONOR_MEDIA_ID, DONOR_ID],
    });
    if (updated.rowsAffected !== 1) {
      throw new Error("Phase 501 donor media hide transition failed.");
    }
    await transaction.commit();
    return true;
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

export async function applyPhase501WatermanAllureIdentityFinish(
  client: Client,
  options: ApplyPhase501Options,
): Promise<ApplyPhase501Result> {
  if (!options.reviewer.trim()) throw new Error("Phase 501 reviewer must not be empty.");
  await assertAuthority(client, options);
  await assertIdentity(client, options.workspaceRoot);

  const donorPublication = await rows(
    client,
    "SELECT status FROM entity_publications WHERE entity_id=?",
    [DONOR_ID],
  );
  let changed = false;
  if (String(donorPublication[0]?.status) !== "retired") {
    await setEntityPublicationStatus(client, DONOR_ID, "retired");
    changed = true;
  }
  changed = (await hideDonorMedia(client)) || changed;
  await assertIdentity(client, options.workspaceRoot);
  const canonicalContentHash = await computePublicationContentHash(
    client,
    CANONICAL_ID,
  );
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return {
    changed,
    donorId: DONOR_ID,
    canonicalId: CANONICAL_ID,
    donorMediaId: DONOR_MEDIA_ID,
    donorMediaUsage: "hidden",
    canonicalContentHash,
  };
}

function value(name: string): string | null {
  const index = process.argv.indexOf(name);
  return index === -1 ? null : process.argv[index + 1] ?? null;
}

async function main(): Promise<void> {
  const database = value("--database");
  const ownedRoot = value("--owned-root");
  const protectedCatalog = value("--protected-catalog");
  if (!database || !ownedRoot || !protectedCatalog) {
    throw new Error(
      "Usage: tsx scripts/apply-phase501-waterman-allure-identity-finish.ts --database <owned-copy> --owned-root <root> --protected-catalog <real-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase501WatermanAllureIdentityFinish(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase501-waterman-allure-identity",
      databasePath: resolvedDatabase,
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: resolvedProtected,
      protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected),
      env: process.env,
    });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } finally {
    client.close();
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  void main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
  });
}
