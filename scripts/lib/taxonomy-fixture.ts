import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createClient, type Client } from "@libsql/client";
import { migrateDatabase } from "../../src/lib/db";

const ROOT = process.cwd();
const PROTECTED_CATALOG_PATH = path.resolve(ROOT, "data", "fpkg.db");
const TEMP_PREFIX = "fpkg-taxonomy-";

export interface TaxonomyFixture {
  readonly tempRoot: string;
  readonly databasePath: string;
  readonly databaseUrl: string;
  readonly client: Client;
  readonly env: NodeJS.ProcessEnv;
}

type ManagedTaxonomyFixture = TaxonomyFixture & {
  readonly rootDevice: number;
  readonly rootInode: number;
  cleaned: boolean;
};

const knownFixtures = new WeakSet<ManagedTaxonomyFixture>();
const ownedRoots = new Map<string, { device: number; inode: number }>();

function canonicalizePotentialPath(inputPath: string): string {
  let ancestor = path.resolve(inputPath);
  const missing: string[] = [];
  while (!fs.existsSync(ancestor)) {
    const parent = path.dirname(ancestor);
    if (parent === ancestor) break;
    missing.unshift(path.basename(ancestor));
    ancestor = parent;
  }
  const canonicalAncestor = fs.existsSync(ancestor)
    ? fs.realpathSync.native(ancestor)
    : ancestor;
  return path.join(canonicalAncestor, ...missing);
}

function fileUrlPath(databaseUrl: string): string | null {
  if (!databaseUrl.startsWith("file:") || /[?#]/.test(databaseUrl)) return null;
  const rawPath = databaseUrl.startsWith("file://")
    ? fileURLToPath(databaseUrl)
    : decodeURIComponent(databaseUrl.slice("file:".length));
  return rawPath ? canonicalizePotentialPath(rawPath) : null;
}

function isExternalBaseUrl(value: string | undefined): boolean {
  const candidate = value?.trim();
  if (!candidate) return false;
  try {
    const hostname = new URL(candidate).hostname;
    return !["127.0.0.1", "localhost", "::1"].includes(hostname);
  } catch {
    return true;
  }
}

export function assertTaxonomyFixtureEnvironment(
  env: NodeJS.ProcessEnv = process.env,
): void {
  if (env.TAXONOMY_FIXTURE !== "1") {
    throw new Error("Taxonomy fixture requires TAXONOMY_FIXTURE=1.");
  }
  if (env.TURSO_DATABASE_URL?.trim() || env.TURSO_AUTH_TOKEN?.trim()) {
    throw new Error("Taxonomy fixture forbids remote database credentials.");
  }
  if (isExternalBaseUrl(env.E2E_BASE_URL)) {
    throw new Error("Taxonomy fixture forbids an external E2E_BASE_URL.");
  }

  const inheritedDatabaseUrl = env.FPKG_DATABASE_URL?.trim();
  if (inheritedDatabaseUrl) {
    const inheritedPath = fileUrlPath(inheritedDatabaseUrl);
    if (inheritedPath === PROTECTED_CATALOG_PATH) {
      throw new Error("Taxonomy fixture forbids the protected data/fpkg.db catalog.");
    }
    throw new Error(
      "Taxonomy fixture rejects inherited, aliased, or outside-root database destinations.",
    );
  }
}

export async function createTaxonomyFixture(
  inputEnv: NodeJS.ProcessEnv = process.env,
): Promise<TaxonomyFixture> {
  assertTaxonomyFixtureEnvironment(inputEnv);

  const tempRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), TEMP_PREFIX)),
  );
  const rootStat = fs.statSync(tempRoot);
  ownedRoots.set(tempRoot, { device: rootStat.dev, inode: rootStat.ino });

  const databasePath = path.join(tempRoot, "taxonomy.db");
  const databaseUrl = `file:${databasePath}`;
  const env: NodeJS.ProcessEnv = {
    ...inputEnv,
    TAXONOMY_FIXTURE: "1",
    TURSO_DATABASE_URL: "",
    TURSO_AUTH_TOKEN: "",
    FPKG_DATABASE_URL: databaseUrl,
    E2E_BASE_URL: "",
  };

  let client: Client | undefined;
  try {
    if (canonicalizePotentialPath(path.dirname(databasePath)) !== tempRoot) {
      throw new Error("Taxonomy fixture database escaped its owned root.");
    }
    client = createClient({ url: databaseUrl });
    await migrateDatabase(client);
    const fixture: ManagedTaxonomyFixture = {
      tempRoot,
      databasePath,
      databaseUrl,
      client,
      env,
      rootDevice: rootStat.dev,
      rootInode: rootStat.ino,
      cleaned: false,
    };
    knownFixtures.add(fixture);
    return fixture;
  } catch (error) {
    client?.close();
    const owned = ownedRoots.get(tempRoot);
    if (owned?.device === rootStat.dev && owned.inode === rootStat.ino) {
      fs.rmSync(tempRoot, { recursive: true, force: true });
      ownedRoots.delete(tempRoot);
    }
    throw error;
  }
}

export async function cleanupTaxonomyFixture(
  fixture: TaxonomyFixture,
): Promise<void> {
  if (!knownFixtures.has(fixture as ManagedTaxonomyFixture)) {
    throw new Error("Taxonomy cleanup rejected an unmanaged fixture.");
  }
  const managed = fixture as ManagedTaxonomyFixture;
  if (managed.cleaned) return;

  managed.client.close();
  const registered = ownedRoots.get(managed.tempRoot);
  let current: fs.Stats | undefined;
  try {
    current = fs.lstatSync(managed.tempRoot);
  } catch {
    current = undefined;
  }
  if (
    !registered ||
    !current?.isDirectory() ||
    current.isSymbolicLink() ||
    registered.device !== managed.rootDevice ||
    registered.inode !== managed.rootInode ||
    current.dev !== managed.rootDevice ||
    current.ino !== managed.rootInode ||
    fs.realpathSync.native(managed.tempRoot) !== managed.tempRoot ||
    path.dirname(canonicalizePotentialPath(managed.databasePath)) !==
      managed.tempRoot
  ) {
    throw new Error("Taxonomy cleanup refused an uncertain or non-owned root.");
  }

  fs.rmSync(managed.tempRoot, { recursive: true, force: true });
  ownedRoots.delete(managed.tempRoot);
  managed.cleaned = true;
}
