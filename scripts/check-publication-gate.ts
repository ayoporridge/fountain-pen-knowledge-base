import { spawn, type ChildProcess } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import { createClient, type Client } from "@libsql/client";
import {
  migrateDatabase,
  resolveDatabaseConnection,
} from "../src/lib/db";

const ROOT = process.cwd();
const REAL_DATABASE_PATH = path.join(ROOT, "data", "fpkg.db");
const SCRIPT_PATH = path.join(ROOT, "scripts", "check-publication-gate.ts");

interface FixtureContext {
  tempRoot: string;
  databasePath: string;
  databaseUrl: string;
  client: Client;
  children: Set<ChildProcess>;
  cleanupPromise?: Promise<void>;
}

interface FileSnapshot {
  exists: boolean;
  size?: string;
  mtimeNs?: string;
  mode?: number;
  sha256?: string;
}

let activeFixture: FixtureContext | null = null;
let signalCleanupStarted = false;

function sha256File(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function snapshotFile(filePath: string): FileSnapshot {
  if (!fs.existsSync(filePath)) return { exists: false };
  const stat = fs.statSync(filePath, { bigint: true });
  return {
    exists: true,
    size: stat.size.toString(),
    mtimeNs: stat.mtimeNs.toString(),
    mode: Number(stat.mode),
    sha256: sha256File(filePath),
  };
}

function snapshotRealDatabase(): Record<string, FileSnapshot> {
  return Object.fromEntries(
    [REAL_DATABASE_PATH, `${REAL_DATABASE_PATH}-wal`, `${REAL_DATABASE_PATH}-shm`].map(
      (filePath) => [path.basename(filePath), snapshotFile(filePath)],
    ),
  );
}

function hasExited(child: ChildProcess): boolean {
  return child.exitCode !== null || child.signalCode !== null;
}

function waitForChildExit(child: ChildProcess, timeoutMs: number): Promise<boolean> {
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

async function cleanupFixture(fixture: FixtureContext): Promise<void> {
  if (fixture.cleanupPromise) return fixture.cleanupPromise;

  fixture.cleanupPromise = (async () => {
    await Promise.all([...fixture.children].map((child) => stopChild(child)));
    fixture.children.clear();
    try {
      fixture.client.close();
    } finally {
      fs.rmSync(fixture.tempRoot, { recursive: true, force: true });
      if (activeFixture === fixture) activeFixture = null;
    }
  })();

  return fixture.cleanupPromise;
}

function registerChild(
  fixture: FixtureContext,
  command: string,
  args: string[],
  options: Parameters<typeof spawn>[2],
): ChildProcess {
  const child = spawn(command, args, options);
  fixture.children.add(child);
  child.once("exit", () => fixture.children.delete(child));
  return child;
}

async function createFixture(prefix = "fpkg-publication-"): Promise<FixtureContext> {
  const tempRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), prefix)),
  );
  const databasePath = path.join(tempRoot, "fixture.db");
  const databaseUrl = `file:${databasePath}`;
  const client = createClient({ url: databaseUrl });
  const fixture: FixtureContext = {
    tempRoot,
    databasePath,
    databaseUrl,
    client,
    children: new Set(),
  };
  activeFixture = fixture;

  try {
    await migrateDatabase(client);
    return fixture;
  } catch (error) {
    await cleanupFixture(fixture);
    throw error;
  }
}

async function withFixture<T>(
  run: (fixture: FixtureContext) => Promise<T>,
): Promise<T> {
  const fixture = await createFixture();
  try {
    return await run(fixture);
  } finally {
    await cleanupFixture(fixture);
  }
}

function processIsAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return !(
      error instanceof Error &&
      "code" in error &&
      (error as NodeJS.ErrnoException).code === "ESRCH"
    );
  }
}

async function waitForFile(filePath: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (fs.existsSync(filePath)) return;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error(`Timed out waiting for fixture report: ${filePath}`);
}

function expectThrow(run: () => unknown, messageFragment: string): void {
  try {
    run();
  } catch (error) {
    if (error instanceof Error && error.message.includes(messageFragment)) return;
    throw error;
  }
  throw new Error(`Expected rejection containing: ${messageFragment}`);
}

async function assertClientClosed(client: Client): Promise<void> {
  try {
    await client.execute("SELECT 1");
  } catch {
    return;
  }
  throw new Error("Fixture cleanup left its libSQL client usable.");
}

function idleChild(fixture: FixtureContext): ChildProcess {
  return registerChild(
    fixture,
    process.execPath,
    ["-e", "setInterval(() => {}, 1000)"],
    { cwd: ROOT, stdio: "ignore" },
  );
}

async function assertSignalCleanup(reportFile: string): Promise<void> {
  const require = createRequire(import.meta.url);
  const tsxCli = require.resolve("tsx/cli");
  const output: string[] = [];
  const child = spawn(
    process.execPath,
    [tsxCli, SCRIPT_PATH, "--signal-probe", "--report", reportFile],
    {
      cwd: ROOT,
      env: {
        ...process.env,
        TURSO_DATABASE_URL: "",
        TURSO_AUTH_TOKEN: "",
        FPKG_DATABASE_URL: "",
        PUBLICATION_GATE_FIXTURE: "",
      },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  child.stdout?.on("data", (chunk) => output.push(String(chunk)));
  child.stderr?.on("data", (chunk) => output.push(String(chunk)));

  try {
    await waitForFile(reportFile, 10_000);
    const report = JSON.parse(fs.readFileSync(reportFile, "utf8")) as {
      tempRoot: string;
      databasePath: string;
      serverPid: number;
    };
    if (!fs.existsSync(report.databasePath) || !processIsAlive(report.serverPid)) {
      throw new Error("Signal probe did not create both fixture DB and child server.");
    }

    child.kill("SIGTERM");
    if (!(await waitForChildExit(child, 8_000))) {
      child.kill("SIGKILL");
      throw new Error("Signal probe did not exit after SIGTERM.");
    }
    if (fs.existsSync(report.tempRoot)) {
      throw new Error(`SIGTERM left fixture root behind: ${report.tempRoot}`);
    }
    if (processIsAlive(report.serverPid)) {
      throw new Error(`SIGTERM left fixture server alive: ${report.serverPid}`);
    }
  } catch (error) {
    await stopChild(child);
    throw new Error(`Signal cleanup fixture failed.\n${output.join("")}`, {
      cause: error,
    });
  } finally {
    fs.rmSync(reportFile, { force: true });
  }
}

async function runFixtureIsolation(): Promise<void> {
  const before = snapshotRealDatabase();

  expectThrow(
    () =>
      resolveDatabaseConnection({
        TURSO_DATABASE_URL: "libsql://example.invalid",
        FPKG_DATABASE_URL: "file:/tmp/fixture.db",
      }),
    "mutually exclusive",
  );
  expectThrow(
    () =>
      resolveDatabaseConnection({
        PUBLICATION_GATE_FIXTURE: "1",
        TURSO_DATABASE_URL: "libsql://example.invalid",
      }),
    "requires an explicit file:",
  );
  expectThrow(
    () =>
      resolveDatabaseConnection({
        PUBLICATION_GATE_FIXTURE: "1",
        FPKG_DATABASE_URL: "libsql://example.invalid",
      }),
    "must be a file:",
  );
  for (const databaseUrl of [
    "file:data/fpkg.db",
    `file:${REAL_DATABASE_PATH}`,
    "file:data/../data/fpkg.db",
  ]) {
    expectThrow(
      () =>
        resolveDatabaseConnection({
          PUBLICATION_GATE_FIXTURE: "1",
          FPKG_DATABASE_URL: databaseUrl,
        }),
      "may not use the real data/fpkg.db",
    );
  }

  let successRoot = "";
  let successClient: Client | null = null;
  await withFixture(async (fixture) => {
    successRoot = fixture.tempRoot;
    successClient = fixture.client;
    const connection = resolveDatabaseConnection({
      PUBLICATION_GATE_FIXTURE: "1",
      FPKG_DATABASE_URL: fixture.databaseUrl,
    });
    if (connection.localPath !== fixture.databasePath) {
      throw new Error("Fixture database URL did not resolve to its disposable path.");
    }
    const migrations = await fixture.client.execute(
      "SELECT COUNT(*) AS count FROM migrations",
    );
    if (Number(migrations.rows[0]?.count) === 0) {
      throw new Error("Fixture database did not receive canonical migrations.");
    }
  });
  if (fs.existsSync(successRoot) || !successClient) {
    throw new Error("Successful fixture lifecycle did not remove its temp root.");
  }
  await assertClientClosed(successClient);

  let failureRoot = "";
  let failureClient: Client | null = null;
  let failureServerPid = 0;
  let expectedFailure = false;
  try {
    await withFixture(async (fixture) => {
      failureRoot = fixture.tempRoot;
      failureClient = fixture.client;
      const server = idleChild(fixture);
      if (!server.pid) throw new Error("Failure fixture did not start its child server.");
      failureServerPid = server.pid;
      throw new Error("deliberate fixture failure");
    });
  } catch (error) {
    expectedFailure =
      error instanceof Error && error.message === "deliberate fixture failure";
  }
  if (!expectedFailure || fs.existsSync(failureRoot) || processIsAlive(failureServerPid)) {
    throw new Error("Failed fixture lifecycle leaked its DB root or child server.");
  }
  if (!failureClient) throw new Error("Failure fixture did not expose its test client.");
  await assertClientClosed(failureClient);

  const signalReport = path.join(
    os.tmpdir(),
    `fpkg-publication-signal-${process.pid}-${Date.now()}.json`,
  );
  await assertSignalCleanup(signalReport);

  const after = snapshotRealDatabase();
  if (JSON.stringify(after) !== JSON.stringify(before)) {
    throw new Error(
      `Real database changed during fixture isolation.\nBefore: ${JSON.stringify(before)}\nAfter: ${JSON.stringify(after)}`,
    );
  }

  console.log(
    "Publication fixture isolation passed: real DB unchanged; success, failure, and SIGTERM cleaned clients, servers, and temp roots.",
  );
}

function parsePort(args: string[]): number {
  const equalsArg = args.find((arg) => arg.startsWith("--port="));
  const separateIndex = args.indexOf("--port");
  const raw = equalsArg?.slice("--port=".length) ??
    (separateIndex >= 0 ? args[separateIndex + 1] : undefined) ??
    "3107";
  const port = Number(raw);
  if (!Number.isInteger(port) || port < 1 || port > 65_535) {
    throw new Error(`Invalid --port value: ${raw}`);
  }
  return port;
}

async function serveE2E(port: number): Promise<void> {
  const fixture = await createFixture("fpkg-publication-e2e-");
  try {
    console.log(`Publication E2E fixture: ${fixture.databasePath}`);
    const server = registerChild(fixture, "pnpm", ["start", "-p", String(port)], {
      cwd: ROOT,
      env: {
        ...process.env,
        TURSO_DATABASE_URL: "",
        TURSO_AUTH_TOKEN: "",
        FPKG_DATABASE_URL: fixture.databaseUrl,
        PUBLICATION_GATE_FIXTURE: "1",
      },
      stdio: "inherit",
    });
    const exitCode = await new Promise<number>((resolve, reject) => {
      server.once("error", reject);
      server.once("exit", (code, signal) => {
        resolve(code ?? (signal ? 1 : 0));
      });
    });
    if (exitCode !== 0) process.exitCode = exitCode;
  } finally {
    await cleanupFixture(fixture);
  }
}

async function runSignalProbe(reportFile: string): Promise<void> {
  const fixture = await createFixture("fpkg-publication-signal-probe-");
  const server = idleChild(fixture);
  if (!server.pid) throw new Error("Signal probe child server has no PID.");
  fs.writeFileSync(
    reportFile,
    JSON.stringify({
      tempRoot: fixture.tempRoot,
      databasePath: fixture.databasePath,
      serverPid: server.pid,
    }),
  );
  await new Promise(() => undefined);
}

function installSignalHandlers(): void {
  for (const [signal, exitCode] of [
    ["SIGINT", 130],
    ["SIGTERM", 143],
  ] as const) {
    process.once(signal, () => {
      if (signalCleanupStarted) return;
      signalCleanupStarted = true;
      void (async () => {
        if (activeFixture) await cleanupFixture(activeFixture);
        process.exit(exitCode);
      })();
    });
  }
}

async function main(): Promise<void> {
  installSignalHandlers();
  const args = process.argv.slice(2);

  if (args.includes("--signal-probe")) {
    const reportIndex = args.indexOf("--report");
    const reportFile = reportIndex >= 0 ? args[reportIndex + 1] : undefined;
    if (!reportFile) throw new Error("--signal-probe requires --report <path>.");
    await runSignalProbe(reportFile);
    return;
  }
  if (args.includes("--fixture-isolation")) {
    await runFixtureIsolation();
    return;
  }
  if (args.includes("--serve-e2e")) {
    await serveE2E(parsePort(args));
    return;
  }

  throw new Error(
    "Usage: pnpm check:publication-gate -- --fixture-isolation | --serve-e2e --port 3107",
  );
}

main().catch(async (error) => {
  if (activeFixture) await cleanupFixture(activeFixture);
  console.error(error);
  process.exitCode = 1;
});
