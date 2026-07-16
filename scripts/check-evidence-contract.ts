import fs from "node:fs";
import path from "node:path";
import type { Client } from "@libsql/client";
import { resolveDatabaseConnection } from "../src/lib/db";
import {
  snapshotRealCatalogInvariant,
  withPhase19Fixture,
} from "./lib/phase19-fixtures";

const ROOT = process.cwd();

function assertCondition(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) throw new Error(message);
}

function expectThrow(run: () => unknown, messageFragment: string): void {
  try {
    run();
  } catch (error) {
    assertCondition(error instanceof Error, "Expected an Error instance.");
    assertCondition(
      error.message.includes(messageFragment),
      `Expected rejection containing ${JSON.stringify(messageFragment)}, received: ${error.message}`,
    );
    return;
  }
  throw new Error(`Expected rejection containing: ${messageFragment}`);
}

async function assertClientClosed(client: Client): Promise<void> {
  try {
    await client.execute("SELECT 1");
  } catch {
    return;
  }
  throw new Error("Evidence fixture cleanup left its client usable.");
}

async function runFixtureIsolation(): Promise<void> {
  const realBefore = snapshotRealCatalogInvariant();
  const realCatalogPath = path.join(ROOT, "data", "fpkg.db");

  expectThrow(
    () =>
      resolveDatabaseConnection({
        TURSO_DATABASE_URL: "libsql://example.invalid",
        FPKG_DATABASE_URL: "file:/tmp/evidence-fixture.db",
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
        FPKG_DATABASE_URL: `file:${realCatalogPath}`,
      }),
    "may not use the real data/fpkg.db",
  );

  let successRoot = "";
  let successClient: Client | null = null;
  await withPhase19Fixture(async (fixture) => {
    successRoot = fixture.tempRoot;
    successClient = fixture.client;
    const resolved = resolveDatabaseConnection();
    assertCondition(
      resolved.localPath === fixture.databasePath,
      "Evidence checker did not resolve to the owned fixture database.",
    );
    const databaseList = await fixture.client.execute("PRAGMA database_list");
    const mainPath = String(databaseList.rows[0]?.file || "");
    assertCondition(
      fs.realpathSync.native(mainPath) === fixture.databasePath,
      "Evidence checker opened a database outside its owned temp root.",
    );
    const migrations = await fixture.client.execute(
      "SELECT COUNT(*) AS count FROM migrations",
    );
    assertCondition(
      Number(migrations.rows[0]?.count) > 0,
      "Evidence fixture did not receive canonical migrations.",
    );
  });
  assertCondition(
    !fs.existsSync(successRoot) && successClient,
    "Evidence fixture success path leaked its root or client.",
  );
  await assertClientClosed(successClient);

  let failureRoot = "";
  let deliberateFailure = false;
  try {
    await withPhase19Fixture(async (fixture) => {
      failureRoot = fixture.tempRoot;
      throw new Error("deliberate evidence fixture failure");
    });
  } catch (error) {
    deliberateFailure =
      error instanceof Error &&
      error.message === "deliberate evidence fixture failure";
  }
  assertCondition(
    deliberateFailure && !fs.existsSync(failureRoot),
    "Evidence fixture failure path leaked its owned temp root.",
  );
  snapshotRealCatalogInvariant(realBefore);

  console.log(
    "Evidence fixture isolation passed: canonical migrations stayed disposable; remote/real paths failed closed; real main/WAL/SHM unchanged.",
  );
}

async function main(): Promise<void> {
  const args = process.argv.slice(2).filter((arg) => arg !== "--");
  if (args.length === 1 && args[0] === "--fixture-isolation") {
    await runFixtureIsolation();
    return;
  }
  throw new Error(
    "Usage: pnpm exec tsx scripts/check-evidence-contract.ts --fixture-isolation",
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
