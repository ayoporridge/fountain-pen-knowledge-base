import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createClient, type Client, type Transaction } from "@libsql/client";
import {
  assertCatalogSnapshotUnchanged,
  snapshotCatalogFiles,
} from "../src/lib/audit/read-only-catalog";
import {
  computePublicationContentHash,
} from "../src/lib/publication";
import {
  applyCuratedContentPacks,
  type ApplyPhase22Options,
  type ApplyPhase22Result,
} from "./apply-phase22-content";
import {
  PHASE598_IDS,
  PHASE598_IKKAKU_ARTICLE_ID,
  PHASE598_IKKAKU_ARTICLE_SLUG,
  PHASE598_NAHVALUR_BRAND_ID,
  PHASE598_SLUGS,
  phase598IkkakuPacks,
} from "./data/phase598-ikkaku-by-nahvalur";

export {
  PHASE598_IDS,
  PHASE598_IKKAKU_ARTICLE_ID,
  PHASE598_IKKAKU_ARTICLE_SLUG,
  PHASE598_NAHVALUR_BRAND_ID,
  PHASE598_SLUGS,
} from "./data/phase598-ikkaku-by-nahvalur";

export type ApplyPhase598Options = ApplyPhase22Options;
export type ApplyPhase598Result = ApplyPhase22Result;

const ARTICLE_NAME = "IKKAKU by Nahvalur 系列导航";
const ARTICLE_MARKDOWN =
  ".planning/content-research/ikkaku-series-navigation-phase598.md";
const ARTICLE_IMAGE =
  "/images/library/site-original/phase598/nahvalur/ikkaku-series.svg";
const ACCEPTED_INITIAL_BRAND_SOURCE_PREFIX =
  "curated-content:phase597-nahvalur-brand-depth-refresh-v1:";

const TARGETS = Object.keys(PHASE598_IDS).map((key) => {
  const typedKey = key as keyof typeof PHASE598_IDS;
  const pack = phase598IkkakuPacks.find(
    (candidate) => candidate.entityId === PHASE598_IDS[typedKey],
  );
  if (!pack) throw new Error(`Phase 598 missing pack for ${typedKey}.`);
  return {
    id: PHASE598_IDS[typedKey],
    slug: PHASE598_SLUGS[typedKey],
    name: pack.canonicalName,
    aliases: pack.aliases.map(({ alias }) => alias),
  };
});

function stableId(prefix: string, value: string): string {
  return `${prefix}-${createHash("sha256").update(value).digest("hex").slice(0, 24)}`;
}

function isInside(candidate: string, root: string): boolean {
  const relative = path.relative(root, candidate);
  return (
    relative !== "" && !relative.startsWith("..") && !path.isAbsolute(relative)
  );
}

function rejectRemoteSelection(env: NodeJS.ProcessEnv): void {
  for (const key of [
    "TURSO_DATABASE_URL",
    "TURSO_AUTH_TOKEN",
    "FPKG_DATABASE_URL",
  ] as const) {
    if (env[key]?.trim()) {
      throw new Error(
        `Phase 598 refuses inherited remote database selection: ${key}.`,
      );
    }
  }
}

async function rows(
  client: Client | Transaction,
  sql: string,
  args: unknown[] = [],
): Promise<Array<Record<string, unknown>>> {
  const result = await client.execute({ sql, args: args as never[] });
  return result.rows.map((row) => ({ ...row }));
}

async function assertOwnedCatalog(
  client: Client,
  options: ApplyPhase598Options,
): Promise<void> {
  rejectRemoteSelection(options.env ?? process.env);
  if (!options.reviewer.trim()) throw new Error("Phase 598 reviewer is empty.");
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const ownedRoot = fs.realpathSync.native(options.ownedRoot);
  const databasePath = fs.realpathSync.native(options.databasePath);
  const protectedPath = fs.realpathSync.native(options.protectedCatalogPath);
  if (
    !fs.statSync(ownedRoot).isDirectory() ||
    !fs.statSync(databasePath).isFile() ||
    fs.lstatSync(options.databasePath).isSymbolicLink() ||
    !isInside(databasePath, ownedRoot)
  ) {
    throw new Error(
      "Phase 598 requires a non-symlink catalog inside the caller-owned root.",
    );
  }
  const owned = fs.statSync(databasePath, { bigint: true });
  const protectedCatalog = fs.statSync(protectedPath, { bigint: true });
  if (
    owned.nlink !== BigInt(1) ||
    databasePath === protectedPath ||
    (owned.dev === protectedCatalog.dev && owned.ino === protectedCatalog.ino)
  ) {
    throw new Error(
      "Phase 598 refuses the protected catalog, hard links, or aliases.",
    );
  }
  const databaseList = await client.execute("PRAGMA database_list");
  const main = databaseList.rows.find((row) => String(row.name) === "main");
  if (!main?.file || fs.realpathSync.native(String(main.file)) !== databasePath) {
    throw new Error("Phase 598 client is not bound to its owned copy.");
  }
  const migration = await client.execute({
    sql: "SELECT 1 FROM migrations WHERE name=? AND checksum IS NOT NULL",
    args: ["032_taxonomy_identity.sql"],
  });
  if (migration.rows.length !== 1) {
    throw new Error("Phase 598 owned copy must be migrated through 032.");
  }
}

async function assertIdentityPreflight(client: Client): Promise<void> {
  const brand = await rows(
    client,
    `SELECT entity.id,entity.type,entity.slug,entity.name,entity.source,
            publication.status,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
     FROM entities entity
     LEFT JOIN entity_publications publication ON publication.entity_id=entity.id
     LEFT JOIN public_entities public ON public.id=entity.id
     WHERE entity.id=? OR entity.slug='nahvalur'`,
    [PHASE598_NAHVALUR_BRAND_ID],
  );
  const source = String(brand[0]?.source ?? "");
  if (
    brand.length !== 1 ||
    brand[0]?.id !== PHASE598_NAHVALUR_BRAND_ID ||
    brand[0]?.type !== "brand" ||
    brand[0]?.slug !== "nahvalur" ||
    brand[0]?.name !== "Nahvalur（原 Narwhal）" ||
    (!source.startsWith(ACCEPTED_INITIAL_BRAND_SOURCE_PREFIX) &&
      !source.startsWith("curated-content:phase598-nahvalur-brand-ikkaku-refresh-v1:")) ||
    brand[0]?.status !== "published" ||
    Number(brand[0]?.is_public) !== 1
  ) {
    throw new Error(
      `Phase 598 Nahvalur brand identity mismatch: ${JSON.stringify(brand)}.`,
    );
  }

  const identities = [
    ...TARGETS.map((target) => ({ ...target, type: "pen" })),
    {
      id: PHASE598_IKKAKU_ARTICLE_ID,
      slug: PHASE598_IKKAKU_ARTICLE_SLUG,
      name: ARTICLE_NAME,
      aliases: ["IKKAKU", "IKKAKU by Nahvalur", "Nahvalur IKKAKU"],
      type: "article",
    },
  ];
  const claimed = new Map<string, string>();
  for (const identity of identities) {
    for (const value of [identity.name, ...identity.aliases]) {
      const normalized = value.trim().toLocaleLowerCase("en");
      const owner = claimed.get(normalized);
      if (owner && owner !== identity.id) {
        throw new Error(`Phase 598 pack-set name collision: ${value}.`);
      }
      claimed.set(normalized, identity.id);
    }
    const collision = await rows(
      client,
      `SELECT id,type,slug,name FROM entities
       WHERE id=? OR slug=? OR lower(name)=lower(?) ORDER BY id`,
      [identity.id, identity.slug, identity.name],
    );
    if (
      collision.length > 1 ||
      (collision.length === 1 &&
        (collision[0]?.id !== identity.id ||
          collision[0]?.type !== identity.type ||
          collision[0]?.slug !== identity.slug ||
          collision[0]?.name !== identity.name))
    ) {
      throw new Error(`Phase 598 identity collision: ${identity.slug}.`);
    }
    for (const alias of identity.aliases) {
      const aliasCollision = await rows(
        client,
        `SELECT entity.id,entity.slug,entity.name,alias.alias
         FROM entities entity
         LEFT JOIN entity_aliases alias ON alias.entity_id=entity.id
         WHERE entity.id<>? AND
           (lower(entity.name)=lower(?) OR lower(alias.alias)=lower(?))`,
        [identity.id, alias, alias],
      );
      if (aliasCollision.length > 0) {
        throw new Error(
          `Phase 598 alias collision for ${alias}: ${JSON.stringify(aliasCollision)}.`,
        );
      }
    }
  }
}

async function insertLink(
  transaction: Transaction,
  input: {
    sourceId: string;
    targetId: string;
    linkType: string;
    reason: string;
  },
): Promise<void> {
  const existing = await rows(
    transaction,
    "SELECT id FROM entity_links WHERE source_id=? AND target_id=? AND link_type=?",
    [input.sourceId, input.targetId, input.linkType],
  );
  if (existing.length === 0) {
    await transaction.execute({
      sql: "INSERT INTO entity_links(id,source_id,target_id,link_type,reason) VALUES(?,?,?,?,?)",
      args: [
        stableId(
          "phase598-link",
          `${input.sourceId}:${input.linkType}:${input.targetId}`,
        ),
        input.sourceId,
        input.targetId,
        input.linkType,
        input.reason,
      ],
    });
  } else if (existing.length !== 1) {
    throw new Error(
      `Phase 598 duplicate topology: ${input.sourceId}:${input.linkType}:${input.targetId}.`,
    );
  }
}

async function prepareIdentitiesAndTopology(client: Client): Promise<void> {
  const transaction = await client.transaction("write");
  try {
    const all = [
      ...TARGETS.map((target) => ({ ...target, type: "pen" })),
      {
        id: PHASE598_IKKAKU_ARTICLE_ID,
        slug: PHASE598_IKKAKU_ARTICLE_SLUG,
        name: ARTICLE_NAME,
        type: "article",
      },
    ];
    for (const target of all) {
      const existing = await rows(
        transaction,
        "SELECT id,type,slug,name FROM entities WHERE id=? OR slug=? ORDER BY id",
        [target.id, target.slug],
      );
      if (existing.length === 0) {
        await transaction.execute({
          sql: "INSERT INTO entities(id,type,slug,name) VALUES(?,?,?,?)",
          args: [target.id, target.type, target.slug, target.name],
        });
      } else if (
        existing.length !== 1 ||
        existing[0]?.id !== target.id ||
        existing[0]?.type !== target.type ||
        existing[0]?.slug !== target.slug ||
        existing[0]?.name !== target.name
      ) {
        throw new Error(`Phase 598 refuses identity change: ${target.slug}.`);
      }
    }

    for (const target of TARGETS) {
      const maker = await rows(
        transaction,
        "SELECT target_id FROM entity_links WHERE source_id=? AND link_type='made_by'",
        [target.id],
      );
      if (maker.length === 0) {
        await insertLink(transaction, {
          sourceId: target.id,
          targetId: PHASE598_NAHVALUR_BRAND_ID,
          linkType: "made_by",
          reason: "Phase 598 verified IKKAKU by Nahvalur maker relation",
        });
      } else if (
        maker.length !== 1 ||
        maker[0]?.target_id !== PHASE598_NAHVALUR_BRAND_ID
      ) {
        throw new Error(`Phase 598 maker conflict: ${target.slug}.`);
      }
      await insertLink(transaction, {
        sourceId: PHASE598_NAHVALUR_BRAND_ID,
        targetId: target.id,
        linkType: "reverse",
        reason: "Phase 598 Nahvalur public IKKAKU model navigation",
      });
      await insertLink(transaction, {
        sourceId: target.id,
        targetId: PHASE598_IKKAKU_ARTICLE_ID,
        linkType: "member_of_series",
        reason: "Phase 598 IKKAKU series membership",
      });
      await insertLink(transaction, {
        sourceId: PHASE598_IKKAKU_ARTICLE_ID,
        targetId: target.id,
        linkType: "reverse",
        reason: "Phase 598 IKKAKU article model navigation",
      });
    }
    await insertLink(transaction, {
      sourceId: PHASE598_IKKAKU_ARTICLE_ID,
      targetId: PHASE598_NAHVALUR_BRAND_ID,
      linkType: "related_to",
      reason: "IKKAKU is a Nahvalur luxury product line, not a second maker",
    });
    await insertLink(transaction, {
      sourceId: PHASE598_NAHVALUR_BRAND_ID,
      targetId: PHASE598_IKKAKU_ARTICLE_ID,
      linkType: "reverse",
      reason: "Nahvalur brand navigation to IKKAKU series article",
    });
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }
}

function articleCopy(): { summary: string; body: string; marker: string } {
  const markdown = fs
    .readFileSync(path.resolve(process.cwd(), ARTICLE_MARKDOWN), "utf8")
    .replace(/\r\n?/g, "\n");
  const summary = markdown.match(/^## summary\s*\n+([\s\S]*?)(?=^## )/m)?.[1].trim();
  const body = markdown
    .match(/^## body_md\s*\n+([\s\S]*?)(?=^## 来源\s*$)/m)?.[1]
    .trim();
  if (
    !summary ||
    Array.from(summary).length < 60 ||
    Array.from(summary).length > 160 ||
    !body ||
    Array.from(body).length < 2_000
  ) {
    throw new Error("Phase 598 IKKAKU article copy is incomplete.");
  }
  const marker = `curated-content:phase598-ikkaku-series-navigation-v1:${createHash("sha256").update(JSON.stringify({ summary, body })).digest("hex")}`;
  return { summary, body, marker };
}

async function sourceItemId(
  transaction: Transaction,
  url: string,
): Promise<string> {
  const found = await rows(
    transaction,
    "SELECT id FROM source_items WHERE url=? AND review_status='approved' ORDER BY id",
    [url],
  );
  if (found.length < 1) throw new Error(`Phase 598 source item missing: ${url}.`);
  return String(found[0]?.id);
}

async function rewriteArticle(client: Client): Promise<"published" | "noop"> {
  const copy = articleCopy();
  const state = await rows(
    client,
    `SELECT entity.source,publication.status,readiness.publishable,
            readiness.blocker_count,CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
     FROM entities entity
     LEFT JOIN entity_publications publication ON publication.entity_id=entity.id
     LEFT JOIN public_entity_readiness readiness
       ON readiness.entity_id=entity.id AND readiness.contract_version=3
     LEFT JOIN public_entities public ON public.id=entity.id
     WHERE entity.id=?`,
    [PHASE598_IKKAKU_ARTICLE_ID],
  );
  if (
    state.length === 1 &&
    state[0]?.source === copy.marker &&
    state[0]?.status == null &&
    Number(state[0]?.is_public) === 1
  ) {
    return "noop";
  }

  const transaction = await client.transaction("write");
  try {
    await transaction.execute({
      sql: "DELETE FROM claim_evidence WHERE claim_id IN (SELECT id FROM claims WHERE subject_entity_id=?)",
      args: [PHASE598_IKKAKU_ARTICLE_ID],
    });
    await transaction.execute({
      sql: "DELETE FROM citations WHERE (target_type='entity' AND target_id=?) OR target_id IN (SELECT id FROM stories WHERE entity_id=?) OR claim_id IN (SELECT id FROM claims WHERE subject_entity_id=?)",
      args: [
        PHASE598_IKKAKU_ARTICLE_ID,
        PHASE598_IKKAKU_ARTICLE_ID,
        PHASE598_IKKAKU_ARTICLE_ID,
      ],
    });
    for (const sql of [
      "DELETE FROM entity_references WHERE entity_id=?",
      "DELETE FROM entity_aliases WHERE entity_id=?",
      "DELETE FROM media_assets WHERE entity_id=?",
      "DELETE FROM claims WHERE subject_entity_id=?",
      "DELETE FROM stories WHERE entity_id=?",
    ]) {
      await transaction.execute({
        sql,
        args: [PHASE598_IKKAKU_ARTICLE_ID],
      });
    }
    const updated = await transaction.execute({
      sql: "UPDATE entities SET name=?,summary=?,body_md=?,source=?,updated_at=datetime('now') WHERE id=? AND type='article' AND slug=?",
      args: [
        ARTICLE_NAME,
        copy.summary,
        copy.body,
        copy.marker,
        PHASE598_IKKAKU_ARTICLE_ID,
        PHASE598_IKKAKU_ARTICLE_SLUG,
      ],
    });
    if (updated.rowsAffected !== 1) {
      throw new Error("Phase 598 article identity changed before write.");
    }

    const collectionId = await sourceItemId(
      transaction,
      "https://nahvalur.com/collections/ikkaku-by-nahvalur",
    );
    const moonId = await sourceItemId(
      transaction,
      "https://nahvalur.com/collections/ikkaku-moon-trilogy",
    );
    const gradientId = await sourceItemId(
      transaction,
      "https://www.penaddict.com/blog/2024/2/26/ikkaku-by-nahvalur-gradient-urushi-fountain-pen-review",
    );
    const imageId = await sourceItemId(transaction, ARTICLE_IMAGE);
    const references = [
      [collectionId, "official", "官方当前 IKKAKU collection 与 Nahvalur 父关系。"],
      [moonId, "official", "官方 Moon Trilogy 三款关系。"],
      [gradientId, "review", "同期专业资料补足历史 Gradient 三色与系列定位。"],
    ] as const;
    for (const [itemId, relationType, note] of references) {
      await transaction.execute({
        sql: "INSERT INTO entity_references(id,entity_id,source_item_id,relation_type,note,review_status) VALUES(?,?,?,?,?,'approved')",
        args: [
          stableId("phase598-article-reference", `${itemId}:${relationType}`),
          PHASE598_IKKAKU_ARTICLE_ID,
          itemId,
          relationType,
          note,
        ],
      });
    }
    for (const [alias, language] of [
      ["IKKAKU", "en"],
      ["IKKAKU by Nahvalur", "en"],
      ["Nahvalur IKKAKU", "en"],
      ["IKKAKU 系列", "zh"],
    ] as const) {
      await transaction.execute({
        sql: "INSERT INTO entity_aliases(id,entity_id,alias,language,source_id,alias_kind,source_item_id,review_status) VALUES(?,?,?,?,?,'alias',?,'approved')",
        args: [
          stableId("phase598-article-alias", alias),
          PHASE598_IKKAKU_ARTICLE_ID,
          alias,
          language,
          null,
          collectionId,
        ],
      });
    }
    await transaction.execute({
      sql: "INSERT INTO stories(id,entity_id,title,story_type,summary,body_md,status,source_notes) VALUES(?,?,?,'overview',?,?,'published',?)",
      args: [
        stableId("phase598-article-story", PHASE598_IKKAKU_ARTICLE_ID),
        PHASE598_IKKAKU_ARTICLE_ID,
        ARTICLE_NAME,
        copy.summary,
        copy.body,
        copy.marker,
      ],
    });
    await transaction.execute({
      sql: "INSERT INTO media_assets(id,entity_id,title,asset_type,local_path,author,license,attribution_text,source_url,source_item_id,review_status,usage_status) VALUES(?,?,?,'image',?,'Fountain Pen Graph editorial','site-original',?,?,?,'approved','primary')",
      args: [
        stableId("phase598-article-media", PHASE598_IKKAKU_ARTICLE_ID),
        PHASE598_IKKAKU_ARTICLE_ID,
        "IKKAKU by Nahvalur 系列事实导航（非产品照片）",
        ARTICLE_IMAGE,
        "本站原创事实导航图；非产品照片，不表示真实颜色、漆面、笔形、比例、商标、笔尖或内部机构。",
        ARTICLE_IMAGE,
        imageId,
      ],
    });
    await transaction.commit();
  } catch (error) {
    if (!transaction.closed) await transaction.rollback();
    throw error;
  }

  return "published";
}

async function assertTerminalState(client: Client): Promise<void> {
  const ids = [
    PHASE598_NAHVALUR_BRAND_ID,
    ...TARGETS.map((target) => target.id),
  ];
  for (const id of ids) {
    const state = await rows(
      client,
      `SELECT publication.status,readiness.publishable,readiness.blocker_count,
              CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
       FROM entity_publications publication
       LEFT JOIN public_entity_readiness readiness
         ON readiness.entity_id=publication.entity_id AND readiness.contract_version=3
       LEFT JOIN public_entities public ON public.id=publication.entity_id
       WHERE publication.entity_id=?`,
      [id],
    );
    if (
      state.length !== 1 ||
      state[0]?.status !== "published" ||
      Number(state[0]?.publishable) !== 1 ||
      Number(state[0]?.blocker_count) !== 0 ||
      Number(state[0]?.is_public) !== 1
    ) {
      throw new Error(`Phase 598 terminal publication mismatch: ${id}.`);
    }
  }
  const article = await rows(
    client,
    `SELECT entity.type,entity.slug,publication.entity_id AS governed_id,
            CASE WHEN public.id IS NULL THEN 0 ELSE 1 END AS is_public
       FROM entities entity
       LEFT JOIN entity_publications publication ON publication.entity_id=entity.id
       LEFT JOIN public_entities public ON public.id=entity.id
       WHERE entity.id=?`,
    [PHASE598_IKKAKU_ARTICLE_ID],
  );
  if (
    article.length !== 1 ||
    article[0]?.type !== "article" ||
    article[0]?.slug !== PHASE598_IKKAKU_ARTICLE_SLUG ||
    article[0]?.governed_id != null ||
    Number(article[0]?.is_public) !== 1
  ) {
    throw new Error(
      `Phase 598 terminal article mismatch: ${JSON.stringify(article)}.`,
    );
  }
  const navigation = await rows(
    client,
    `SELECT
       (SELECT count(*) FROM entity_links WHERE target_id=? AND link_type='made_by') AS maker_count,
       (SELECT count(*) FROM entity_links WHERE source_id=? AND link_type='member_of_series') AS series_count,
       (SELECT count(*) FROM entity_links WHERE source_id=? AND link_type='reverse') AS article_links`,
    [
      PHASE598_NAHVALUR_BRAND_ID,
      TARGETS[0]?.id ?? "",
      PHASE598_IKKAKU_ARTICLE_ID,
    ],
  );
  if (
    Number(navigation[0]?.maker_count) < TARGETS.length ||
    Number(navigation[0]?.series_count) !== 1 ||
    Number(navigation[0]?.article_links) !== TARGETS.length
  ) {
    throw new Error(`Phase 598 terminal topology mismatch: ${JSON.stringify(navigation)}.`);
  }
}

export async function applyPhase598IkkakuByNahvalurContent(
  client: Client,
  options: ApplyPhase598Options,
): Promise<ApplyPhase598Result> {
  await assertOwnedCatalog(client, options);
  await assertIdentityPreflight(client);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  await prepareIdentitiesAndTopology(client);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  const packed = await applyCuratedContentPacks(client, options, phase598IkkakuPacks);
  const articleOutcome = await rewriteArticle(client);
  await assertTerminalState(client);
  assertCatalogSnapshotUnchanged(options.protectedCatalogSnapshot);
  return {
    entities: [
      ...packed.entities,
      {
        entityId: PHASE598_IKKAKU_ARTICLE_ID,
        outcome: articleOutcome,
        contentHash: await computePublicationContentHash(
          client,
          PHASE598_IKKAKU_ARTICLE_ID,
        ),
      },
    ],
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
      "Usage: tsx scripts/apply-phase598-ikkaku-by-nahvalur-content.ts --database <owned-copy> --owned-root <root> --protected-catalog <protected-db> [--reviewer <name>]",
    );
  }
  const resolvedDatabase = path.resolve(database);
  const resolvedProtected = path.resolve(protectedCatalog);
  const client = createClient({ url: `file:${resolvedDatabase}` });
  try {
    const result = await applyPhase598IkkakuByNahvalurContent(client, {
      workspaceRoot: process.cwd(),
      reviewer: value("--reviewer") ?? "phase598-ikkaku-by-nahvalur",
      databasePath: resolvedDatabase,
      ownedRoot: path.resolve(ownedRoot),
      protectedCatalogPath: resolvedProtected,
      protectedCatalogSnapshot: snapshotCatalogFiles(resolvedProtected),
      env: {
        ...process.env,
        TURSO_DATABASE_URL: "",
        TURSO_AUTH_TOKEN: "",
        FPKG_DATABASE_URL: "",
      },
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
