import { spawn, type ChildProcess, type SpawnOptions } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import { migrateDatabase, resolveDatabaseConnection } from "../../src/lib/db";
import {
  assertCatalogSnapshotUnchanged,
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

async function cleanupActiveFixtures(): Promise<void> {
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

for (const [signal, exitCode] of [
  ["SIGINT", 130],
  ["SIGTERM", 143],
] as const) {
  process.once(signal, () => {
    if (signalCleanupStarted) return;
    signalCleanupStarted = true;
    void (async () => {
      try {
        await cleanupActiveFixtures();
        process.exit(exitCode);
      } catch {
        process.exit(1);
      }
    })();
  });
}
