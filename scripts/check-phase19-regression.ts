import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import { createRequire } from "node:module";
import os from "node:os";
import path from "node:path";
import type { Client } from "@libsql/client";
import {
  assertPhase19LockedRealCatalog,
  cleanupPhase19Fixture,
  createPhase19Fixture,
  installPhase19FixtureSignalHandlers,
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
  readonly constructionSignalProbeReport?: string;
};

type ProbeReport = {
  readonly tempRoot: string;
  readonly databasePath: string;
  readonly childPid: number | null;
};

const FORBIDDEN_E2E_BASE_URL_MESSAGE =
  "Phase 19 regression forbids non-empty E2E_BASE_URL; browser checks must use the owned local server.";

function assertCondition(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) throw new Error(message);
}

function assertNoExternalE2EBaseUrl(
  env: NodeJS.ProcessEnv = process.env,
): void {
  assertCondition(!env.E2E_BASE_URL, FORBIDDEN_E2E_BASE_URL_MESSAGE);
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
  if (!child.pid || !processGroupIsAlive(child.pid)) return;
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    child.kill("SIGTERM");
  }
  if (await waitForProcessGroupExit(child.pid, 5_000)) return;
  try {
    process.kill(-child.pid, "SIGKILL");
  } catch {
    child.kill("SIGKILL");
  }
  await waitForProcessGroupExit(child.pid, 5_000);
}

function processGroupIsAlive(pid: number): boolean {
  try {
    process.kill(-pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function waitForProcessGroupExit(
  pid: number,
  timeoutMs: number,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!processGroupIsAlive(pid)) return true;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  return !processGroupIsAlive(pid);
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
    E2E_BASE_URL: "",
  };
}

async function runCommand(
  fixture: Phase19Fixture,
  command: RegressionCommand,
  processGroups: Set<number>,
): Promise<void> {
  const child = fixture.registerChild(command.command, command.args, {
    cwd: ROOT,
    env: childEnvironment(fixture),
    detached: true,
    stdio: "inherit",
  });
  assertCondition(child.pid, `${command.label} child has no PID.`);
  processGroups.add(child.pid);
  const exitCode = await new Promise<number>((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      resolve(code ?? (signal ? 1 : 0));
    });
  });
  if (processGroupIsAlive(child.pid)) {
    await stopDetachedProcessGroup(child);
  }
  assertCondition(
    !processGroupIsAlive(child.pid),
    `${command.label} left its detached process group alive.`,
  );
  assertCondition(
    exitCode === 0,
    `${command.label} failed with exit code ${exitCode}.`,
  );
  console.log(`PASS Phase 19 regression: ${command.label}`);
}

export async function runPhase19RegressionWithDisposableDatabase(
  options: RegressionOptions,
): Promise<void> {
  assertNoExternalE2EBaseUrl();
  installPhase19FixtureSignalHandlers();
  const realBefore = assertPhase19LockedRealCatalog(
    snapshotRealCatalogInvariant(),
  );
  const fixture = await createPhase19Fixture("fpkg-phase19-regression-", {
    constructionSignalProbeReport: options.constructionSignalProbeReport,
  });
  const processGroups = new Set<number>();
  let cleanupPromise: Promise<void> | null = null;

  const cleanup = (): Promise<void> => {
    cleanupPromise ??= (async () => {
      await cleanupPhase19Fixture(fixture);
      assertCondition(
        !fs.existsSync(fixture.tempRoot),
        `Regression cleanup left its owned root: ${fixture.tempRoot}.`,
      );
      for (const pid of processGroups) {
        assertCondition(
          !processGroupIsAlive(pid),
          `Regression cleanup left process group ${pid} alive.`,
        );
      }
      assertPhase19LockedRealCatalog(
        snapshotRealCatalogInvariant(realBefore),
      );
    })();
    return cleanupPromise;
  };

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
      assertCondition(idle.pid, "Signal probe child has no PID.");
      processGroups.add(idle.pid);
    }
    if (options.reportFile) {
      fs.writeFileSync(
        options.reportFile,
        JSON.stringify({
          tempRoot: fixture.tempRoot,
          databasePath: fixture.databasePath,
          childPid: [...processGroups].at(-1) ?? null,
        } satisfies ProbeReport),
        { encoding: "utf8", flag: "wx", mode: 0o600 },
      );
    }
    if (options.holdForSignal) {
      await new Promise<never>(() => undefined);
    }
    for (const command of options.commands) {
      await runCommand(fixture, command, processGroups);
      assertPhase19LockedRealCatalog(
        snapshotRealCatalogInvariant(realBefore),
      );
    }
  } finally {
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
      E2E_BASE_URL: "",
    },
    stdio: ["ignore", "ignore", "ignore"],
  });
  await waitForFile(reportFile, 10_000);
  return child;
}

function regressionTempRoots(): string[] {
  return fs
    .readdirSync(os.tmpdir())
    .filter((entry) => entry.startsWith("fpkg-phase19-regression-"))
    .map((entry) => path.join(os.tmpdir(), entry))
    .sort();
}

async function runHostileBaseUrlProbe(probeRoot: string): Promise<void> {
  const require = createRequire(import.meta.url);
  const tsxCli = require.resolve("tsx/cli");
  const reportFile = path.join(probeRoot, "hostile-base-url.json");
  const rootsBefore = regressionTempRoots();
  const child = spawn(
    process.execPath,
    [tsxCli, SCRIPT_PATH, "--hostile-env-probe", "--report", reportFile],
    {
      cwd: ROOT,
      env: {
        ...process.env,
        TURSO_DATABASE_URL: "",
        TURSO_AUTH_TOKEN: "",
        FPKG_DATABASE_URL: "",
        PUBLICATION_GATE_FIXTURE: "",
        E2E_BASE_URL: "https://phase19-must-not-connect.invalid",
      },
      stdio: ["ignore", "ignore", "pipe"],
    },
  );
  let stderr = "";
  child.stderr?.on("data", (chunk) => {
    stderr += String(chunk);
  });
  await assertProbeExit(child, 1);
  assertCondition(
    stderr.includes(FORBIDDEN_E2E_BASE_URL_MESSAGE),
    `Hostile E2E_BASE_URL probe did not fail for the expected reason: ${stderr}`,
  );
  assertCondition(
    !fs.existsSync(reportFile) &&
      JSON.stringify(regressionTempRoots()) === JSON.stringify(rootsBefore),
    "Hostile E2E_BASE_URL created a fixture or changed regression temp roots.",
  );
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
  const realBefore = assertPhase19LockedRealCatalog(
    snapshotRealCatalogInvariant(),
  );
  const probeRoot = fs.realpathSync.native(
    fs.mkdtempSync(path.join(os.tmpdir(), "fpkg-phase19-regression-probes-")),
  );
  try {
    await runHostileBaseUrlProbe(probeRoot);

    const failureReport = path.join(probeRoot, "failure.json");
    const failureChildReport = `${failureReport}.child`;
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
    const failureChildPid = Number(
      fs.readFileSync(failureChildReport, "utf8"),
    );
    assertCondition(
      Number.isInteger(failureChildPid) && !processIsAlive(failureChildPid),
      `Child failure leaked descendant process ${failureChildPid}.`,
    );

    for (const [signal, expectedExitCode] of [
      ["SIGINT", 130],
      ["SIGTERM", 143],
    ] as const) {
      const constructionReport = path.join(
        probeRoot,
        `${signal}-construction.json`,
      );
      const constructionProbe = await spawnProbe(
        [
          "--construction-signal-probe",
          signal,
          "--report",
          constructionReport,
        ],
        constructionReport,
      );
      const construction = JSON.parse(
        fs.readFileSync(constructionReport, "utf8"),
      ) as ProbeReport;
      constructionProbe.kill(signal);
      await assertProbeExit(constructionProbe, expectedExitCode);
      assertCondition(
        !fs.existsSync(construction.tempRoot),
        `${signal} construction window leaked ${construction.tempRoot}.`,
      );

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
    assertPhase19LockedRealCatalog(
      snapshotRealCatalogInvariant(realBefore),
    );
    console.log(
      "PASS Phase 19 regression: child failure, SIGINT, and SIGTERM cleanup",
    );
  } finally {
    fs.rmSync(probeRoot, { recursive: true, force: true });
    assertPhase19LockedRealCatalog(
      snapshotRealCatalogInvariant(realBefore),
    );
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
  assertNoExternalE2EBaseUrl();
  if (args[0] === "--failure-probe") {
    const reportFile = reportPath(args);
    const childReport = `${reportFile}.child`;
    const failureProgram = [
      'const { spawn } = require("node:child_process");',
      'const fs = require("node:fs");',
      'const child = spawn(process.execPath, ["-e", "setInterval(() => {}, 1000)"], { stdio: "ignore" });',
      `fs.writeFileSync(${JSON.stringify(childReport)}, String(child.pid));`,
      "setTimeout(() => process.exit(7), 100);",
    ].join("\n");
    await runPhase19RegressionWithDisposableDatabase({
      reportFile,
      commands: [
        {
          label: "deliberate failure",
          command: process.execPath,
          args: ["-e", failureProgram],
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
  if (args[0] === "--construction-signal-probe") {
    assertCondition(
      args[1] === "SIGINT" || args[1] === "SIGTERM",
      "--construction-signal-probe requires SIGINT or SIGTERM.",
    );
    const constructionSignalProbeReport = reportPath(args);
    await runPhase19RegressionWithDisposableDatabase({
      constructionSignalProbeReport,
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
