import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import type { Client } from "@libsql/client";
import {
  cleanupPhase19Fixture,
  createPhase19Fixture,
  snapshotRealCatalogInvariant,
  type Phase19Fixture,
} from "./lib/phase19-fixtures";

const ROOT = process.cwd();
const SCRIPT_PATH = path.join(ROOT, "scripts", "check-phase19-regression.ts");

type RegressionCommand = {
  readonly label: string;
  readonly command: string;
  readonly args: readonly string[];
};

type RegressionOptions = {
  readonly commands: readonly RegressionCommand[];
  readonly reportFile?: string;
  readonly holdForSignal?: boolean;
};

type ProbeReport = {
  readonly tempRoot: string;
  readonly databasePath: string;
  readonly childPid: number | null;
};

function assertCondition(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) throw new Error(message);
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
      clearTimeout(timeout);
      resolve(true);
    };
    const timeout = setTimeout(() => {
      child.off("exit", onExit);
      resolve(false);
    }, timeoutMs);
    child.once("exit", onExit);
  });
}

async function stopDetachedProcessGroup(child: ChildProcess): Promise<void> {
  if (hasExited(child) || !child.pid) return;
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    child.kill("SIGTERM");
  }
  if (await waitForChildExit(child, 5_000)) return;
  try {
    process.kill(-child.pid, "SIGKILL");
  } catch {
    child.kill("SIGKILL");
  }
  await waitForChildExit(child, 5_000);
}

async function assertCanonicalMigration031(client: Client): Promise<void> {
  const result = await client.execute(`
    SELECT name
    FROM migrations
    WHERE name GLOB '[0-9][0-9][0-9]_*.sql'
    ORDER BY CAST(substr(name, 1, 3) AS INTEGER) DESC, name DESC
    LIMIT 1
  `);
  assertCondition(
    result.rows.length === 1 &&
      result.rows[0]?.name === "031_evidence_readiness_v2.sql",
    `Regression fixture is not canonical migration 031: ${JSON.stringify(result.rows)}.`,
  );
}

function childEnvironment(fixture: Phase19Fixture): NodeJS.ProcessEnv {
  return {
    ...fixture.env,
    CI: "1",
    PLAYWRIGHT_HTML_OPEN: "never",
    TURSO_DATABASE_URL: "",
    TURSO_AUTH_TOKEN: "",
    FPKG_DATABASE_URL: fixture.databaseUrl,
    PUBLICATION_GATE_FIXTURE: "1",
  };
}

async function runCommand(
  fixture: Phase19Fixture,
  command: RegressionCommand,
  setCurrentChild: (child: ChildProcess | null) => void,
): Promise<void> {
  const child = fixture.registerChild(command.command, command.args, {
    cwd: ROOT,
    env: childEnvironment(fixture),
    detached: true,
    stdio: "inherit",
  });
  setCurrentChild(child);
  const exitCode = await new Promise<number>((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      resolve(code ?? (signal ? 1 : 0));
    });
  });
  setCurrentChild(null);
  assertCondition(
    exitCode === 0,
    `${command.label} failed with exit code ${exitCode}.`,
  );
  console.log(`PASS Phase 19 regression: ${command.label}`);
}

export async function runPhase19RegressionWithDisposableDatabase(
  options: RegressionOptions,
): Promise<void> {
  const realBefore = snapshotRealCatalogInvariant();
  const fixture = await createPhase19Fixture("fpkg-phase19-regression-");
  let currentChild: ChildProcess | null = null;
  let cleanupPromise: Promise<void> | null = null;
  let signalInProgress = false;

  const cleanup = (): Promise<void> => {
    cleanupPromise ??= (async () => {
      if (currentChild) await stopDetachedProcessGroup(currentChild);
      currentChild = null;
      await cleanupPhase19Fixture(fixture);
      snapshotRealCatalogInvariant(realBefore);
    })();
    return cleanupPromise;
  };
  const signalHandlers = new Map<NodeJS.Signals, () => void>();
  for (const [signal, exitCode] of [
    ["SIGINT", 130],
    ["SIGTERM", 143],
  ] as const) {
    const handler = () => {
      if (signalInProgress) return;
      signalInProgress = true;
      void cleanup().then(
        () => process.exit(exitCode),
        () => process.exit(1),
      );
    };
    signalHandlers.set(signal, handler);
    process.once(signal, handler);
  }

  try {
    await assertCanonicalMigration031(fixture.client);
    if (options.holdForSignal) {
      const idle = fixture.registerChild(
        process.execPath,
        ["-e", "setInterval(() => {}, 1000)"],
        {
          cwd: ROOT,
          env: childEnvironment(fixture),
          detached: true,
          stdio: "ignore",
        },
      );
      currentChild = idle;
    }
    if (options.reportFile) {
      fs.writeFileSync(
        options.reportFile,
        JSON.stringify({
          tempRoot: fixture.tempRoot,
          databasePath: fixture.databasePath,
          childPid: currentChild?.pid ?? null,
        } satisfies ProbeReport),
        { encoding: "utf8", flag: "wx", mode: 0o600 },
      );
    }
    if (options.holdForSignal) {
      await new Promise<never>(() => undefined);
    }
    for (const command of options.commands) {
      await runCommand(fixture, command, (child) => {
        currentChild = child;
      });
      snapshotRealCatalogInvariant(realBefore);
    }
  } finally {
    for (const [signal, handler] of signalHandlers) {
      process.off(signal, handler);
    }
    await cleanup();
  }
}

function processIsAlive(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function waitForFile(filePath: string, timeoutMs: number): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (fs.existsSync(filePath)) return;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error(`Timed out waiting for regression probe: ${filePath}.`);
}

async function spawnProbe(
  args: readonly string[],
  reportFile: string,
): Promise<ChildProcess> {
  const require = createRequire(import.meta.url);
  const tsxCli = require.resolve("tsx/cli");
  const child = spawn(process.execPath, [tsxCli, SCRIPT_PATH, ...args], {
    cwd: ROOT,
    env: {
      ...process.env,
      TURSO_DATABASE_URL: "",
      TURSO_AUTH_TOKEN: "",
      FPKG_DATABASE_URL: "",
      PUBLICATION_GATE_FIXTURE: "",
    },
    stdio: ["ignore", "ignore", "ignore"],
  });
  await waitForFile(reportFile, 10_000);
  return child;
}

async function assertProbeExit(
  child: ChildProcess,
  expectedExitCode: number,
): Promise<void> {
  assertCondition(
    await waitForChildExit(child, 15_000),
    "Regression lifecycle probe did not exit.",
  );
  assertCondition(
    child.exitCode === expectedExitCode,
    `Regression lifecycle probe expected exit ${expectedExitCode}, got ${String(child.exitCode)}/${String(child.signalCode)}.`,
  );
}

async function runLifecycleProbes(): Promise<void> {
  const realBefore = snapshotRealCatalogInvariant();
  const probeRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase19-regression-probes-")),
  );
  try {
    const failureReport = path.join(probeRoot, "failure.json");
    const failure = await spawnProbe(
      ["--failure-probe", "--report", failureReport],
      failureReport,
    );
    await assertProbeExit(failure, 1);
    const failed = JSON.parse(
      fs.readFileSync(failureReport, "utf8"),
    ) as ProbeReport;
    assertCondition(
      !fs.existsSync(failed.tempRoot),
      `Child failure leaked regression root: ${failed.tempRoot}.`,
    );

    for (const [signal, expectedExitCode] of [
      ["SIGINT", 130],
      ["SIGTERM", 143],
    ] as const) {
      const reportFile = path.join(probeRoot, `${signal}.json`);
      const probe = await spawnProbe(
        ["--signal-probe", signal, "--report", reportFile],
        reportFile,
      );
      const report = JSON.parse(
        fs.readFileSync(reportFile, "utf8"),
      ) as ProbeReport;
      assertCondition(
        report.childPid && processIsAlive(report.childPid),
        `${signal} probe did not start its registered child.`,
      );
      probe.kill(signal);
      await assertProbeExit(probe, expectedExitCode);
      assertCondition(
        !fs.existsSync(report.tempRoot) && !processIsAlive(report.childPid),
        `${signal} leaked its regression root or process group.`,
      );
    }
    snapshotRealCatalogInvariant(realBefore);
    console.log(
      "PASS Phase 19 regression: child failure, SIGINT, and SIGTERM cleanup",
    );
  } finally {
    fs.rmSync(probeRoot, { recursive: true, force: true });
    snapshotRealCatalogInvariant(realBefore);
  }
}

function reportPath(args: readonly string[]): string {
  const index = args.indexOf("--report");
  const value = index >= 0 ? args[index + 1] : undefined;
  assertCondition(value && path.isAbsolute(value), "Probe requires --report <absolute-path>.");
  return value;
}

async function main(): Promise<void> {
  const args = process.argv.slice(2).filter((arg) => arg !== "--");
  if (args[0] === "--failure-probe") {
    await runPhase19RegressionWithDisposableDatabase({
      reportFile: reportPath(args),
      commands: [
        {
          label: "deliberate failure",
          command: process.execPath,
          args: ["-e", "process.exit(7)"],
        },
      ],
    });
    return;
  }
  if (args[0] === "--signal-probe") {
    assertCondition(
      args[1] === "SIGINT" || args[1] === "SIGTERM",
      "--signal-probe requires SIGINT or SIGTERM.",
    );
    await runPhase19RegressionWithDisposableDatabase({
      reportFile: reportPath(args),
      holdForSignal: true,
      commands: [],
    });
    return;
  }
  if (args.length === 1 && args[0] === "--build-e2e") {
    await runLifecycleProbes();
    await runPhase19RegressionWithDisposableDatabase({
      commands: [
        { label: "build", command: "pnpm", args: ["build"] },
        {
          label: "desktop Playwright",
          command: "pnpm",
          args: ["test:e2e:desktop", "--workers=1"],
        },
        {
          label: "mobile Playwright",
          command: "pnpm",
          args: ["test:e2e:mobile", "--workers=1"],
        },
      ],
    });
    return;
  }
  throw new Error(
    "Usage: pnpm exec tsx scripts/check-phase19-regression.ts --build-e2e",
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
