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

type CatchableSignal = "SIGINT" | "SIGTERM";
type LifecycleProbeStage = "construction" | "runtime";

type LifecycleScopeReport = {
  readonly probeRoot: string;
  readonly childPid: number;
  readonly descendantPid: number | null;
};

type LifecycleProbeScope = {
  createOwnedRoot(prefix: string): string;
  registerChild(child: ChildProcess): ChildProcess;
  activeChildCount(): number;
};

type WaitForProcessGroupExit = (
  pid: number,
  timeoutMs: number,
) => Promise<boolean>;

type LifecycleProbeScopeOptions = {
  readonly waitForGroupExit?: WaitForProcessGroupExit;
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

async function stopDetachedProcessGroup(
  child: ChildProcess,
  waitForGroupExit: WaitForProcessGroupExit = waitForProcessGroupExit,
): Promise<void> {
  if (!child.pid || !processGroupIsAlive(child.pid)) return;
  try {
    process.kill(-child.pid, "SIGTERM");
  } catch {
    child.kill("SIGTERM");
  }
  if (await waitForGroupExit(child.pid, 5_000)) return;
  try {
    process.kill(-child.pid, "SIGKILL");
  } catch {
    child.kill("SIGKILL");
  }
  assertCondition(
    await waitForGroupExit(child.pid, 5_000),
    `Lifecycle cleanup could not stop process group ${child.pid}.`,
  );
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

async function waitForProcessExit(
  pid: number,
  timeoutMs: number,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (!processIsAlive(pid)) return true;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  return !processIsAlive(pid);
}

async function forwardSignalToDetachedProcessGroup(
  child: ChildProcess,
  signal: CatchableSignal,
  waitForGroupExit: WaitForProcessGroupExit = waitForProcessGroupExit,
): Promise<void> {
  if (!child.pid || !processGroupIsAlive(child.pid)) return;
  try {
    process.kill(-child.pid, signal);
  } catch {
    child.kill(signal);
  }
  if (await waitForGroupExit(child.pid, 15_000)) return;
  await stopDetachedProcessGroup(child, waitForGroupExit);
}

async function withLifecycleProbeScope<T>(
  run: (scope: LifecycleProbeScope) => Promise<T>,
  verifyCleanup: () => void = () => undefined,
  options: LifecycleProbeScopeOptions = {},
): Promise<T> {
  const waitForGroupExit =
    options.waitForGroupExit ?? waitForProcessGroupExit;
  const children = new Set<ChildProcess>();
  let ownedRoot: string | null = null;
  let cleanupPromise: Promise<void> | null = null;
  let signalCleanupStarted = false;

  const cleanup = (signal?: CatchableSignal): Promise<void> => {
    cleanupPromise ??= (async () => {
      const failures: unknown[] = [];
      for (const child of [...children]) {
        try {
          if (signal) {
            await forwardSignalToDetachedProcessGroup(
              child,
              signal,
              waitForGroupExit,
            );
          } else {
            await stopDetachedProcessGroup(child, waitForGroupExit);
          }
          assertCondition(
            !child.pid || !processGroupIsAlive(child.pid),
            `Lifecycle cleanup left process group ${String(child.pid)} alive.`,
          );
        } catch (error) {
          failures.push(error);
        } finally {
          if (!child.pid || !processGroupIsAlive(child.pid)) {
            children.delete(child);
          }
        }
      }
      try {
        if (ownedRoot && fs.existsSync(ownedRoot)) {
          fs.rmSync(ownedRoot, { recursive: true, force: true });
        }
      } catch (error) {
        failures.push(error);
      }
      try {
        verifyCleanup();
      } catch (error) {
        failures.push(error);
      }
      if (failures.length > 0 || children.size > 0) {
        throw new AggregateError(
          failures,
          `Lifecycle probe cleanup failed with ${children.size} process group(s) still tracked.`,
        );
      }
    })();
    return cleanupPromise;
  };

  const handlers = new Map<CatchableSignal, () => void>();
  for (const [signal, exitCode] of [
    ["SIGINT", 130],
    ["SIGTERM", 143],
  ] as const) {
    const handler = () => {
      if (signalCleanupStarted) return;
      signalCleanupStarted = true;
      void cleanup(signal).then(
        () => process.exit(exitCode),
        () => process.exit(1),
      );
    };
    handlers.set(signal, handler);
    process.on(signal, handler);
  }

  const scope: LifecycleProbeScope = {
    createOwnedRoot(prefix): string {
      assertCondition(!ownedRoot, "Lifecycle probe scope already owns a root.");
      ownedRoot = fs.realpathSync.native(
        fs.mkdtempSync(path.join(os.tmpdir(), prefix)),
      );
      return ownedRoot;
    },
    registerChild(child): ChildProcess {
      assertCondition(child.pid, "Lifecycle probe child has no PID.");
      children.add(child);
      child.once("exit", () => {
        if (cleanupPromise || !child.pid) return;
        if (!processGroupIsAlive(child.pid)) {
          children.delete(child);
          return;
        }
        void stopDetachedProcessGroup(child, waitForGroupExit).then(
          () => children.delete(child),
          () => undefined,
        );
      });
      return child;
    },
    activeChildCount(): number {
      return children.size;
    },
  };

  try {
    return await run(scope);
  } finally {
    try {
      await cleanup();
    } finally {
      for (const [signal, handler] of handlers) {
        process.removeListener(signal, handler);
      }
    }
  }
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
  scope: LifecycleProbeScope,
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
    detached: true,
    stdio: ["ignore", "ignore", "ignore"],
  });
  scope.registerChild(child);
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

async function runHostileBaseUrlProbe(
  scope: LifecycleProbeScope,
  probeRoot: string,
): Promise<void> {
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
      detached: true,
      stdio: ["ignore", "ignore", "pipe"],
    },
  );
  scope.registerChild(child);
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

async function runLifecycleParentSignalProbe(
  stage: LifecycleProbeStage,
  reportFile: string,
  options: {
    readonly slowCleanup?: boolean;
    readonly forceWaitFailure?: boolean;
  } = {},
): Promise<void> {
  await withLifecycleProbeScope(async (scope) => {
    const probeRoot = scope.createOwnedRoot(
      `fpkg-phase19-lifecycle-${stage}-`,
    );
    const descendantReport = path.join(probeRoot, "descendant.pid");
    const slowCleanupProgram = options.slowCleanup
      ? [
          "let stopping = false;",
          "const stop = () => { if (stopping) return; stopping = true; setTimeout(() => process.exit(0), 300); };",
          'process.on("SIGINT", stop);',
          'process.on("SIGTERM", stop);',
        ]
      : [];
    const childProgram =
      stage === "runtime"
        ? [
            ...slowCleanupProgram,
            'const { spawn } = require("node:child_process");',
            'const fs = require("node:fs");',
            'const child = spawn(process.execPath, ["-e", "setInterval(() => {}, 1000)"], { stdio: "ignore" });',
            `fs.writeFileSync(${JSON.stringify(descendantReport)}, String(child.pid));`,
            "setInterval(() => {}, 1000);",
          ].join("\n")
        : [...slowCleanupProgram, "setInterval(() => {}, 1000);"].join(
            "\n",
          );
    const child = scope.registerChild(
      spawn(process.execPath, ["-e", childProgram], {
        cwd: ROOT,
        detached: true,
        stdio: "ignore",
      }),
    );
    assertCondition(child.pid, "Hermetic lifecycle probe child has no PID.");
    let descendantPid: number | null = null;
    if (stage === "runtime") {
      await waitForFile(descendantReport, 10_000);
      descendantPid = Number(fs.readFileSync(descendantReport, "utf8"));
      assertCondition(
        Number.isInteger(descendantPid) && processIsAlive(descendantPid),
        "Hermetic lifecycle runtime descendant did not start.",
      );
    }
    fs.writeFileSync(
      reportFile,
      JSON.stringify({
        probeRoot,
        childPid: child.pid,
        descendantPid,
      } satisfies LifecycleScopeReport),
      { encoding: "utf8", flag: "wx", mode: 0o600 },
    );
    await new Promise<never>(() => undefined);
  }, () => undefined, {
    waitForGroupExit: options.forceWaitFailure
      ? async () => false
      : undefined,
  });
}

async function assertExitedLifecycleChildUnregistered(
  scope: LifecycleProbeScope,
): Promise<void> {
  const child = scope.registerChild(
    spawn(process.execPath, ["-e", "process.exit(0)"], {
      cwd: ROOT,
      detached: true,
      stdio: "ignore",
    }),
  );
  await assertProbeExit(child, 0);
  const deadline = Date.now() + 5_000;
  while (Date.now() < deadline && scope.activeChildCount() > 0) {
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  assertCondition(
    scope.activeChildCount() === 0,
    "Exited lifecycle probe remained registered after its process group ended.",
  );
}

async function assertRepeatedLifecycleSignalCleanup(
  scope: LifecycleProbeScope,
  probeRoot: string,
): Promise<void> {
  for (const [signal, expectedExitCode] of [
    ["SIGINT", 130],
    ["SIGTERM", 143],
  ] as const) {
    const reportFile = path.join(probeRoot, `outer-double-${signal}.json`);
    const probe = await spawnProbe(
      scope,
      [
        "--lifecycle-parent-signal-probe",
        "runtime",
        "--slow-cleanup",
        "--report",
        reportFile,
      ],
      reportFile,
    );
    const report = JSON.parse(
      fs.readFileSync(reportFile, "utf8"),
    ) as LifecycleScopeReport;
    probe.kill(signal);
    await new Promise((resolve) => setTimeout(resolve, 25));
    assertCondition(
      probe.pid && processIsAlive(probe.pid),
      `${signal} repeated-signal probe exited before cleanup was exercised.`,
    );
    probe.kill(signal);
    await assertProbeExit(probe, expectedExitCode);
    assertCondition(
      (await waitForProcessExit(report.childPid, 5_000)) &&
        (!report.descendantPid ||
          (await waitForProcessExit(report.descendantPid, 5_000))) &&
        !fs.existsSync(report.probeRoot),
      `${signal} repeated-signal cleanup leaked a root, child, or descendant.`,
    );
  }
}

async function assertLifecycleCleanupFailureIsFailClosed(
  scope: LifecycleProbeScope,
  probeRoot: string,
): Promise<void> {
  const reportFile = path.join(probeRoot, "outer-forced-cleanup-failure.json");
  const probe = await spawnProbe(
    scope,
    [
      "--lifecycle-parent-signal-probe",
      "runtime",
      "--slow-cleanup",
      "--force-wait-failure",
      "--report",
      reportFile,
    ],
    reportFile,
  );
  const report = JSON.parse(
    fs.readFileSync(reportFile, "utf8"),
  ) as LifecycleScopeReport;
  probe.kill("SIGTERM");
  await assertProbeExit(probe, 1);
  assertCondition(
    (await waitForProcessExit(report.childPid, 5_000)) &&
      (!report.descendantPid ||
        (await waitForProcessExit(report.descendantPid, 5_000))) &&
      !fs.existsSync(report.probeRoot),
    "Forced lifecycle cleanup failure did not fail closed after cleaning owned resources.",
  );
}

async function assertScopedLifecycleSignalCleanup(
  scope: LifecycleProbeScope,
  probeRoot: string,
): Promise<void> {
  await assertExitedLifecycleChildUnregistered(scope);
  for (const stage of ["construction", "runtime"] as const) {
    for (const [signal, expectedExitCode] of [
      ["SIGINT", 130],
      ["SIGTERM", 143],
    ] as const) {
      const reportFile = path.join(
        probeRoot,
        `outer-${stage}-${signal}.json`,
      );
      const probe = await spawnProbe(
        scope,
        ["--lifecycle-parent-signal-probe", stage, "--report", reportFile],
        reportFile,
      );
      const report = JSON.parse(
        fs.readFileSync(reportFile, "utf8"),
      ) as LifecycleScopeReport;
      assertCondition(
        fs.existsSync(report.probeRoot) && processIsAlive(report.childPid),
        `${stage} ${signal} outer lifecycle probe did not become active.`,
      );
      if (stage === "runtime") {
        assertCondition(
          report.descendantPid && processIsAlive(report.descendantPid),
          `${stage} ${signal} outer lifecycle descendant did not become active.`,
        );
      }
      probe.kill(signal);
      await assertProbeExit(probe, expectedExitCode);
      assertCondition(
        (await waitForProcessExit(report.childPid, 5_000)) &&
          (!report.descendantPid ||
            (await waitForProcessExit(report.descendantPid, 5_000))) &&
          !fs.existsSync(report.probeRoot),
        `${stage} ${signal} outer lifecycle cleanup leaked a root, child, or descendant.`,
      );
    }
  }
  await assertRepeatedLifecycleSignalCleanup(scope, probeRoot);
  await assertLifecycleCleanupFailureIsFailClosed(scope, probeRoot);
  console.log(
    "PASS Phase 19 regression: top-level construction/runtime, repeated-signal, forced-failure, and process-group cleanup",
  );
}

async function runLifecycleScopeContractOnly(): Promise<void> {
  await withLifecycleProbeScope(async (scope) => {
    const probeRoot = scope.createOwnedRoot(
      "fpkg-phase19-regression-scope-contract-",
    );
    await assertScopedLifecycleSignalCleanup(scope, probeRoot);
  });
}

async function runLifecycleProbes(): Promise<void> {
  const realBefore = assertPhase19LockedRealCatalog(
    snapshotRealCatalogInvariant(),
  );
  await withLifecycleProbeScope(async (scope) => {
    const probeRoot = scope.createOwnedRoot(
      "fpkg-phase19-regression-probes-",
    );
    await assertScopedLifecycleSignalCleanup(scope, probeRoot);
    await runHostileBaseUrlProbe(scope, probeRoot);

    const failureReport = path.join(probeRoot, "failure.json");
    const failureChildReport = `${failureReport}.child`;
    const failure = await spawnProbe(
      scope,
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
        scope,
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
        scope,
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
  }, () => {
    assertPhase19LockedRealCatalog(
      snapshotRealCatalogInvariant(realBefore),
    );
  });
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
  if (args[0] === "--lifecycle-parent-signal-probe") {
    assertCondition(
      args[1] === "construction" || args[1] === "runtime",
      "--lifecycle-parent-signal-probe requires construction or runtime.",
    );
    await runLifecycleParentSignalProbe(args[1], reportPath(args), {
      slowCleanup: args.includes("--slow-cleanup"),
      forceWaitFailure: args.includes("--force-wait-failure"),
    });
    return;
  }
  if (args.length === 1 && args[0] === "--lifecycle-scope-contract") {
    await runLifecycleScopeContractOnly();
    return;
  }
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
