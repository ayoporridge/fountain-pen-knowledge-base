import { spawn, type ChildProcess, type SpawnOptions } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import Database from "better-sqlite3";
import { migrateDatabase, resolveDatabaseConnection } from "../../src/lib/db";
import {
  assertCatalogSnapshotUnchanged,
  backupCatalogToDisposableCopy,
  openReadOnlyCatalog,
  snapshotCatalogFiles,
} from "../../src/lib/audit/read-only-catalog";
import type { CatalogSnapshot } from "../../src/lib/audit/audit-contracts";

const ROOT = process.cwd();
const REAL_CATALOG_PATH = path.join(ROOT, "data", "fpkg.db");
const FIXTURE_ENV_KEYS = [
  "TURSO_DATABASE_URL",
  "TURSO_AUTH_TOKEN",
  "FPKG_DATABASE_URL",
  "PUBLICATION_GATE_FIXTURE",
] as const;

type FixtureEnvKey = (typeof FIXTURE_ENV_KEYS)[number];

export interface Phase19Fixture {
  readonly tempRoot: string;
  readonly databasePath: string;
  readonly databaseUrl: string;
  readonly client: Client;
  readonly env: NodeJS.ProcessEnv;
  registerChild(
    command: string,
    args: readonly string[],
    options?: SpawnOptions,
  ): ChildProcess;
}

type ManagedPhase19Fixture = Phase19Fixture & {
  readonly children: Set<ChildProcess>;
  readonly realCatalogSnapshot: CatalogSnapshot;
  readonly previousEnvironment: Record<FixtureEnvKey, string | undefined>;
  cleanupPromise?: Promise<void>;
};

const activeFixtures = new Set<ManagedPhase19Fixture>();
const knownFixtures = new WeakSet<ManagedPhase19Fixture>();
const ownedRoots = new Set<string>();
let signalCleanupStarted = false;
let signalHandlersInstalled = false;

function sanitizedFixtureEnvironment(
  databaseUrl: string,
): NodeJS.ProcessEnv {
  return {
    ...process.env,
    TURSO_DATABASE_URL: "",
    TURSO_AUTH_TOKEN: "",
    FPKG_DATABASE_URL: databaseUrl,
    PUBLICATION_GATE_FIXTURE: "1",
  };
}

function snapshotEnvironment(): Record<FixtureEnvKey, string | undefined> {
  return Object.fromEntries(
    FIXTURE_ENV_KEYS.map((key) => [key, process.env[key]]),
  ) as Record<FixtureEnvKey, string | undefined>;
}

function applyFixtureEnvironment(env: NodeJS.ProcessEnv): void {
  for (const key of FIXTURE_ENV_KEYS) {
    const value = env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

function restoreEnvironment(
  previousEnvironment: Record<FixtureEnvKey, string | undefined>,
): void {
  for (const key of FIXTURE_ENV_KEYS) {
    const value = previousEnvironment[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
}

function hasExited(child: ChildProcess): boolean {
  return child.exitCode !== null || child.signalCode !== null;
}

function waitForChildExit(
  child: ChildProcess,
  timeoutMs: number,
): Promise<boolean> {
  if (hasExited(child)) return Promise.resolve(true);
  return new Promise((resolve) => {
    const onExit = () => {
      clearTimeout(timer);
      resolve(true);
    };
    const timer = setTimeout(() => {
      child.off("exit", onExit);
      resolve(false);
    }, timeoutMs);
    child.once("exit", onExit);
  });
}

async function stopChild(child: ChildProcess): Promise<void> {
  if (hasExited(child)) return;
  child.kill("SIGTERM");
  if (await waitForChildExit(child, 1_500)) return;
  child.kill("SIGKILL");
  await waitForChildExit(child, 1_500);
}

export function snapshotRealCatalogInvariant(
  before?: CatalogSnapshot,
  databasePath = REAL_CATALOG_PATH,
): CatalogSnapshot {
  const after = snapshotCatalogFiles(path.resolve(databasePath));
  if (before) assertCatalogSnapshotUnchanged(before, after);
  return after;
}

function managedFixture(fixture: Phase19Fixture): ManagedPhase19Fixture {
  if (!knownFixtures.has(fixture as ManagedPhase19Fixture)) {
    throw new Error("Phase 19 cleanup rejected an unmanaged fixture.");
  }
  return fixture as ManagedPhase19Fixture;
}

export async function cleanupPhase19Fixture(
  fixture: Phase19Fixture,
): Promise<void> {
  const managed = managedFixture(fixture);
  if (managed.cleanupPromise) return managed.cleanupPromise;

  managed.cleanupPromise = (async () => {
    const cleanupErrors: unknown[] = [];
    try {
      await Promise.all([...managed.children].map(stopChild));
      managed.children.clear();
    } catch (error) {
      cleanupErrors.push(error);
    }
    try {
      managed.client.close();
    } catch (error) {
      cleanupErrors.push(error);
    }
    try {
      if (!ownedRoots.has(managed.tempRoot)) {
        throw new Error("Phase 19 cleanup refused a non-owned temp root.");
      }
      fs.rmSync(managed.tempRoot, { recursive: true, force: true });
    } catch (error) {
      cleanupErrors.push(error);
    } finally {
      ownedRoots.delete(managed.tempRoot);
      activeFixtures.delete(managed);
      restoreEnvironment(managed.previousEnvironment);
    }
    try {
      snapshotRealCatalogInvariant(managed.realCatalogSnapshot);
    } catch (error) {
      cleanupErrors.push(error);
    }
    if (cleanupErrors.length > 0) {
      throw new AggregateError(
        cleanupErrors,
        "Phase 19 fixture cleanup failed closed.",
      );
    }
  })();
  return managed.cleanupPromise;
}

export async function createPhase19Fixture(
  prefix = "fpkg-phase19-",
): Promise<Phase19Fixture> {
  if (activeFixtures.size > 0) {
    throw new Error("Phase 19 fixtures may not overlap in one process.");
  }

  const realCatalogSnapshot = snapshotRealCatalogInvariant();
  const tempRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), prefix)),
  );
  ownedRoots.add(tempRoot);
  const sourcePath = path.join(tempRoot, "source.db");
  const databasePath = path.join(tempRoot, "fixture.db");
  const databaseUrl = `file:${databasePath}`;
  const env = sanitizedFixtureEnvironment(databaseUrl);
  const previousEnvironment = snapshotEnvironment();
  applyFixtureEnvironment(env);

  const connection = resolveDatabaseConnection(env);
  if (connection.localPath !== databasePath) {
    restoreEnvironment(previousEnvironment);
    ownedRoots.delete(tempRoot);
    fs.rmSync(tempRoot, { recursive: true, force: true });
    throw new Error("Phase 19 fixture URL did not resolve to its owned path.");
  }

  let client: Client;
  try {
    const sourceDatabase = new Database(sourcePath);
    try {
      sourceDatabase.pragma("journal_mode = DELETE");
    } finally {
      sourceDatabase.close();
    }
    const source = openReadOnlyCatalog(sourcePath, { env });
    try {
      const backup = await backupCatalogToDisposableCopy(
        source,
        databasePath,
        tempRoot,
      );
      if (
        backup.destinationPath !== databasePath ||
        backup.remainingPages !== 0
      ) {
        throw new Error(
          "Phase 19 online backup did not complete inside its owned root.",
        );
      }
    } finally {
      source.close();
    }
    client = createClient({ url: databaseUrl });
  } catch (error) {
    restoreEnvironment(previousEnvironment);
    ownedRoots.delete(tempRoot);
    fs.rmSync(tempRoot, { recursive: true, force: true });
    snapshotRealCatalogInvariant(realCatalogSnapshot);
    throw error;
  }
  const children = new Set<ChildProcess>();
  const fixture: ManagedPhase19Fixture = {
    tempRoot,
    databasePath,
    databaseUrl,
    client,
    env,
    children,
    realCatalogSnapshot,
    previousEnvironment,
    registerChild(
      command: string,
      args: readonly string[],
      options: SpawnOptions = {},
    ): ChildProcess {
      const child = spawn(command, [...args], {
        ...options,
        env: {
          ...env,
          ...options.env,
          TURSO_DATABASE_URL: "",
          TURSO_AUTH_TOKEN: "",
          FPKG_DATABASE_URL: databaseUrl,
          PUBLICATION_GATE_FIXTURE: "1",
        },
      });
      children.add(child);
      child.once("exit", () => children.delete(child));
      return child;
    },
  };
  knownFixtures.add(fixture);
  activeFixtures.add(fixture);

  try {
    await migrateDatabase(client);
    return fixture;
  } catch (error) {
    await cleanupPhase19Fixture(fixture);
    throw error;
  }
}

export async function withPhase19Fixture<T>(
  run: (fixture: Phase19Fixture) => Promise<T>,
): Promise<T> {
  const fixture = await createPhase19Fixture();
  try {
    return await run(fixture);
  } finally {
    await cleanupPhase19Fixture(fixture);
  }
}

export interface QualifiedPublicationFixtureIds {
  readonly entityId: string;
  readonly storyId: string;
  readonly scopeId: string;
  readonly primaryRegistryId: string;
  readonly secondaryRegistryId: string;
  readonly mirrorRegistryId: string;
  readonly primaryItemId: string;
  readonly secondaryItemId: string;
  readonly mirrorItemId: string;
  readonly primaryClaimId: string;
  readonly secondaryClaimId: string;
  readonly mirrorClaimId: string;
  readonly classificationClaimId: string;
  readonly primaryCitationId: string;
  readonly secondaryCitationId: string;
  readonly mirrorCitationId: string;
  readonly primaryClaimEvidenceId: string;
  readonly secondaryClaimEvidenceId: string;
  readonly mirrorClaimEvidenceId: string;
  readonly modelSpecId: string | null;
  readonly primarySpecCitationId: string | null;
  readonly secondarySpecCitationId: string | null;
  readonly primarySpecEvidenceId: string | null;
  readonly secondarySpecEvidenceId: string | null;
  readonly variantId: string | null;
  readonly conflictId: string;
  readonly conflictMemberId: string;
  readonly mediaId: string;
  readonly referenceId: string;
  readonly timelineId: string;
  readonly madeById: string | null;
}

export interface QualifiedPublicationFixtureOptions {
  readonly entityId: string;
  readonly entityType: "brand" | "pen";
  readonly brandEntityId?: string;
  readonly reverseIndependentRows?: boolean;
  readonly canonicalTextVariant?: "nfc-lf" | "nfd-crlf";
}

function ordered<T>(values: readonly T[], reverse: boolean): T[] {
  return reverse ? [...values].reverse() : [...values];
}

/**
 * Seed one fully qualified contract-v2 entity with fixed identifiers/times.
 * It deliberately includes a same-origin mirror which must not count as an
 * independent professional-secondary group.
 */
export async function seedQualifiedPublicationFixture(
  client: Client,
  options: QualifiedPublicationFixtureOptions,
): Promise<QualifiedPublicationFixtureIds> {
  if (options.entityType === "pen" && !options.brandEntityId?.trim()) {
    throw new Error("A qualified pen fixture requires brandEntityId.");
  }
  const prefix = options.entityId;
  const reverse = options.reverseIndependentRows === true;
  const nfdCrLf = options.canonicalTextVariant === "nfd-crlf";
  const text = (value: string): string =>
    nfdCrLf ? value.normalize("NFD").replace(/\n/g, "\r\n") : value;
  const ids: QualifiedPublicationFixtureIds = {
    entityId: options.entityId,
    storyId: `${prefix}-story`,
    scopeId: `${prefix}-scope`,
    primaryRegistryId: `${prefix}-registry-primary`,
    secondaryRegistryId: `${prefix}-registry-secondary`,
    mirrorRegistryId: `${prefix}-registry-mirror`,
    primaryItemId: `${prefix}-item-primary`,
    secondaryItemId: `${prefix}-item-secondary`,
    mirrorItemId: `${prefix}-item-mirror`,
    primaryClaimId: `${prefix}-claim-primary`,
    secondaryClaimId: `${prefix}-claim-secondary`,
    mirrorClaimId: `${prefix}-claim-mirror`,
    classificationClaimId: `${prefix}-claim-classification`,
    primaryCitationId: `${prefix}-citation-primary`,
    secondaryCitationId: `${prefix}-citation-secondary`,
    mirrorCitationId: `${prefix}-citation-mirror`,
    primaryClaimEvidenceId: `${prefix}-claim-evidence-primary`,
    secondaryClaimEvidenceId: `${prefix}-claim-evidence-secondary`,
    mirrorClaimEvidenceId: `${prefix}-claim-evidence-mirror`,
    modelSpecId: options.entityType === "pen" ? `${prefix}-spec` : null,
    primarySpecCitationId:
      options.entityType === "pen" ? `${prefix}-citation-spec-primary` : null,
    secondarySpecCitationId:
      options.entityType === "pen" ? `${prefix}-citation-spec-secondary` : null,
    primarySpecEvidenceId:
      options.entityType === "pen" ? `${prefix}-spec-evidence-primary` : null,
    secondarySpecEvidenceId:
      options.entityType === "pen" ? `${prefix}-spec-evidence-secondary` : null,
    variantId: options.entityType === "pen" ? `${prefix}-variant` : null,
    conflictId: `${prefix}-conflict`,
    conflictMemberId: `${prefix}-conflict-member`,
    mediaId: `${prefix}-media`,
    referenceId: `${prefix}-reference`,
    timelineId: `${prefix}-timeline`,
    madeById: options.entityType === "pen" ? `${prefix}-made-by` : null,
  };

  await client.execute({
    sql: `
      INSERT INTO entities (
        id, type, slug, name, summary, body_md, source,
        source_url, source_file, imported_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
      ids.entityId,
      options.entityType,
      ids.entityId,
      text("Café qualification fixture"),
      text("Qualified summary\nwith evidence"),
      text("Qualified body\nwith canonical text"),
      "phase19-contract-fixture",
      `https://example.invalid/entities/${ids.entityId}`,
      `${ids.entityId}.md`,
      "2026-07-16T00:00:00.000Z",
    ],
  });
  await client.execute({
    sql: `
      INSERT INTO stories (
        id, entity_id, title, story_type, summary, body_md,
        status, source_notes
      ) VALUES (?, ?, ?, ?, ?, ?, 'published', ?)
    `,
    args: [
      ids.storyId,
      ids.entityId,
      text("Café qualification story"),
      options.entityType === "brand" ? "brand_story" : "model_story",
      text("Story summary\nwith evidence"),
      text("Story body\nwith evidence"),
      text("Primary and independent secondary sources"),
    ],
  });

  const registryRows = [
    {
      id: ids.primaryRegistryId,
      name: "Primary registry",
      type: "official",
      tier: "primary",
      group: `${prefix}-origin`,
    },
    {
      id: ids.secondaryRegistryId,
      name: "Independent secondary registry",
      type: "book",
      tier: "professional_secondary",
      group: `${prefix}-secondary`,
    },
    {
      id: ids.mirrorRegistryId,
      name: "Same-origin mirror registry",
      type: "blog",
      tier: "professional_secondary",
      group: `${prefix}-origin`,
    },
  ] as const;
  for (const registry of ordered(registryRows, reverse)) {
    await client.execute({
      sql: `
        INSERT INTO source_registry (
          id, name, source_type, allowed_use, reliability, license,
          attribution, homepage_url, fetch_method, notes, last_checked_at,
          default_source_tier, default_independence_group
        ) VALUES (?, ?, ?, 'summary_only', 'medium', 'cc-by', ?, ?,
                  'manual', ?, '2026-07-16', ?, ?)
      `,
      args: [
        registry.id,
        registry.name,
        registry.type,
        `${registry.name} attribution`,
        `https://example.invalid/registries/${registry.id}`,
        "Fixed contract-v2 fixture registry",
        registry.tier,
        registry.group,
      ],
    });
  }

  const itemRows = [
    {
      id: ids.primaryItemId,
      registryId: ids.primaryRegistryId,
      title: "Primary item",
      tier: "primary",
      group: `${prefix}-origin`,
    },
    {
      id: ids.secondaryItemId,
      registryId: ids.secondaryRegistryId,
      title: "Independent secondary item",
      tier: "professional_secondary",
      group: `${prefix}-secondary`,
    },
    {
      id: ids.mirrorItemId,
      registryId: ids.mirrorRegistryId,
      title: "Same-origin mirror item",
      tier: "professional_secondary",
      group: `${prefix}-origin`,
    },
  ] as const;
  for (const item of ordered(itemRows, reverse)) {
    await client.execute({
      sql: `
        INSERT INTO source_items (
          id, source_id, title, url, item_type, license, author,
          published_at, retrieved_at, summary, raw_metadata_json,
          allowed_use, review_status, source_tier, independence_group,
          archive_url, archive_locator
        ) VALUES (?, ?, ?, ?, 'web_page', 'cc-by', ?, '2026-01-01',
                  '2026-07-16', ?, ?, 'summary_only', 'approved', ?, ?, ?, ?)
      `,
      args: [
        item.id,
        item.registryId,
        item.title,
        `https://example.invalid/items/${item.id}`,
        `${item.title} author`,
        text(`${item.title} summary\nfixed`),
        reverse ? '{"b":2,"a":1}' : '{"a":1,"b":2}',
        item.tier,
        item.group,
        `https://archive.invalid/items/${item.id}`,
        `snapshot:${item.id}`,
      ],
    });
  }

  if (ids.variantId) {
    await client.execute({
      sql: `
        INSERT INTO model_variants (
          id, model_entity_id, variant_name, release_year, notes,
          source_item_id, review_status
        ) VALUES (?, ?, ?, '2026', ?, ?, 'approved')
      `,
      args: [
        ids.variantId,
        ids.entityId,
        "Qualification variant",
        text("Variant notes\nfixed"),
        ids.mirrorItemId,
      ],
    });
  }
  await client.execute({
    sql: `
      INSERT INTO fact_scopes (
        id, entity_id, variant_id, scope_key, market, valid_from,
        valid_to, production_state, nib_scope, material_scope, edition_scope
      ) VALUES (?, ?, ?, 'global-current', 'global', '2026-01-01',
                '2026-12-31', 'current', 'all nibs', 'all materials',
                'standard edition')
    `,
    args: [ids.scopeId, ids.entityId, ids.variantId],
  });

  const claimRows = [
    {
      id: ids.primaryClaimId,
      itemId: ids.primaryItemId,
      predicate: "primary_fact",
      object: "Primary fact",
      factClass: "core",
      reviewStatus: "approved",
    },
    {
      id: ids.secondaryClaimId,
      itemId: ids.secondaryItemId,
      predicate: "secondary_fact",
      object: "Independent secondary fact",
      factClass: "core",
      reviewStatus: "approved",
    },
    {
      id: ids.mirrorClaimId,
      itemId: ids.mirrorItemId,
      predicate: "mirror_fact",
      object: "Same-origin mirror fact",
      factClass: "core",
      reviewStatus: "approved",
    },
    {
      id: ids.classificationClaimId,
      itemId: ids.primaryItemId,
      predicate: "editorial_context",
      object: "Editorial context",
      factClass: "editorial",
      reviewStatus: "approved",
    },
  ] as const;
  for (const claim of ordered(claimRows, reverse)) {
    await client.execute({
      sql: `
        INSERT INTO claims (
          id, subject_entity_id, predicate, object_text, source_item_id,
          evidence_locator, confidence, review_status, fact_class
        ) VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?)
      `,
      args: [
        claim.id,
        ids.entityId,
        claim.predicate,
        text(`${claim.object}\nCafé`),
        claim.itemId,
        `claim-locator:${claim.id}`,
        claim.reviewStatus,
        claim.factClass,
      ],
    });
  }

  const coreEvidenceRows = [
    {
      claimId: ids.primaryClaimId,
      itemId: ids.primaryItemId,
      citationId: ids.primaryCitationId,
      evidenceId: ids.primaryClaimEvidenceId,
    },
    {
      claimId: ids.secondaryClaimId,
      itemId: ids.secondaryItemId,
      citationId: ids.secondaryCitationId,
      evidenceId: ids.secondaryClaimEvidenceId,
    },
    {
      claimId: ids.mirrorClaimId,
      itemId: ids.mirrorItemId,
      citationId: ids.mirrorCitationId,
      evidenceId: ids.mirrorClaimEvidenceId,
    },
  ] as const;
  for (const evidence of ordered(coreEvidenceRows, reverse)) {
    await client.execute({
      sql: `
        INSERT INTO citations (
          id, target_type, target_id, source_item_id, claim_id, note,
          review_status, evidence_locator, scope_id
        ) VALUES (?, 'claim', ?, ?, ?, ?, 'approved', ?, ?)
      `,
      args: [
        evidence.citationId,
        evidence.claimId,
        evidence.itemId,
        evidence.claimId,
        text(`Citation note\n${evidence.claimId}`),
        `citation-locator:${evidence.claimId}`,
        ids.scopeId,
      ],
    });
    await client.execute({
      sql: `
        INSERT INTO claim_evidence (
          id, claim_id, citation_id, scope_id, evidence_locator,
          review_status
        ) VALUES (?, ?, ?, ?, ?, 'approved')
      `,
      args: [
        evidence.evidenceId,
        evidence.claimId,
        evidence.citationId,
        ids.scopeId,
        `mapping-locator:${evidence.claimId}`,
      ],
    });
  }

  if (
    ids.modelSpecId &&
    ids.primarySpecCitationId &&
    ids.secondarySpecCitationId &&
    ids.primarySpecEvidenceId &&
    ids.secondarySpecEvidenceId
  ) {
    await client.execute({
      sql: `
        INSERT INTO model_specs (
          id, entity_id, nib, review_status
        ) VALUES (?, ?, '14k medium', 'approved')
      `,
      args: [ids.modelSpecId, ids.entityId],
    });
    const specEvidenceRows = [
      {
        citationId: ids.primarySpecCitationId,
        evidenceId: ids.primarySpecEvidenceId,
        itemId: ids.primaryItemId,
      },
      {
        citationId: ids.secondarySpecCitationId,
        evidenceId: ids.secondarySpecEvidenceId,
        itemId: ids.secondaryItemId,
      },
    ];
    for (const evidence of ordered(specEvidenceRows, reverse)) {
      await client.execute({
        sql: `
          INSERT INTO citations (
            id, target_type, target_id, source_item_id, note,
            review_status, evidence_locator, scope_id
          ) VALUES (?, 'model_spec', ?, ?, ?, 'approved', ?, ?)
        `,
        args: [
          evidence.citationId,
          ids.modelSpecId,
          evidence.itemId,
          "Nib field citation",
          `spec-citation-locator:${evidence.citationId}`,
          ids.scopeId,
        ],
      });
      await client.execute({
        sql: `
          INSERT INTO spec_field_evidence (
            id, model_spec_id, field_key, citation_id, scope_id,
            evidence_locator, review_status
          ) VALUES (?, ?, 'nib', ?, ?, ?, 'approved')
        `,
        args: [
          evidence.evidenceId,
          ids.modelSpecId,
          evidence.citationId,
          ids.scopeId,
          `spec-mapping-locator:${evidence.evidenceId}`,
        ],
      });
    }
  }

  await client.execute({
    sql: `
      INSERT INTO fact_conflicts (
        id, entity_id, field_key, scope_id, conflict_kind,
        status, resolution_note
      ) VALUES (?, ?, 'release_year', ?, 'field', 'resolved', ?)
    `,
    args: [
      ids.conflictId,
      ids.entityId,
      ids.scopeId,
      text("Resolved against primary evidence\nwith secondary confirmation"),
    ],
  });
  await client.execute({
    sql: `
      INSERT INTO fact_conflict_members (
        id, conflict_id, citation_id, asserted_value
      ) VALUES (?, ?, ?, '2026')
    `,
    args: [ids.conflictMemberId, ids.conflictId, ids.primaryCitationId],
  });
  await client.execute({
    sql: `
      INSERT INTO media_assets (
        id, entity_id, title, asset_type, image_url, thumbnail_url,
        author, license, attribution_text, source_url, source_item_id,
        review_status, usage_status
      ) VALUES (?, ?, ?, 'image', ?, ?, ?, 'cc-by', ?, ?, ?,
                'approved', 'primary')
    `,
    args: [
      ids.mediaId,
      ids.entityId,
      text("Café primary image"),
      `https://example.invalid/media/${ids.mediaId}.jpg`,
      `https://example.invalid/media/${ids.mediaId}-thumb.jpg`,
      "Phase 19 fixture author",
      text("Fixture author\nCC BY"),
      `https://example.invalid/media/${ids.mediaId}`,
      ids.primaryItemId,
    ],
  });
  await client.execute({
    sql: `
      INSERT INTO entity_references (
        id, entity_id, source_item_id, relation_type, note, review_status
      ) VALUES (?, ?, ?, 'history', ?, 'approved')
    `,
    args: [
      ids.referenceId,
      ids.entityId,
      ids.secondaryItemId,
      text("Independent history reference\nfixed"),
    ],
  });
  await client.execute({
    sql: `
      INSERT INTO timeline_events (
        id, entity_id, title, event_type, start_date, circa,
        description, source_item_id, review_status
      ) VALUES (?, ?, ?, 'design_milestone', '2026-01-01', 0, ?, ?,
                'approved')
    `,
    args: [
      ids.timelineId,
      ids.entityId,
      text("Café milestone"),
      text("Milestone description\nfixed"),
      ids.primaryItemId,
    ],
  });
  if (ids.madeById) {
    await client.execute({
      sql: `
        INSERT INTO entity_links (
          id, source_id, target_id, link_type, reason
        ) VALUES (?, ?, ?, 'made_by', ?)
      `,
      args: [
        ids.madeById,
        ids.entityId,
        options.brandEntityId as string,
        text("The public brand makes this model\nfixed"),
      ],
    });
  }
  return ids;
}

export async function cleanupActivePhase19Fixtures(): Promise<void> {
  const failures: unknown[] = [];
  for (const fixture of [...activeFixtures]) {
    try {
      await cleanupPhase19Fixture(fixture);
    } catch (error) {
      failures.push(error);
    }
  }
  if (failures.length > 0) {
    throw new AggregateError(failures, "Active Phase 19 fixture cleanup failed.");
  }
}

export function installPhase19FixtureSignalHandlers(): void {
  if (signalHandlersInstalled) return;
  signalHandlersInstalled = true;
  for (const [signal, exitCode] of [
    ["SIGINT", 130],
    ["SIGTERM", 143],
  ] as const) {
    process.once(signal, () => {
      if (signalCleanupStarted) return;
      signalCleanupStarted = true;
      void (async () => {
        try {
          await cleanupActivePhase19Fixtures();
          process.exit(exitCode);
        } catch {
          process.exit(1);
        }
      })();
    });
  }
}
