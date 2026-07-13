import { createClient } from "@libsql/client";
import { expect, test } from "@playwright/test";
import {
  createReadinessGuard,
  isTransientDatabaseError,
  retryTransientDatabaseRead,
} from "../../src/lib/db";

function transientError(status = 502) {
  return Object.assign(new Error(`HTTP ${status}`), {
    code: "SERVER_ERROR",
    cause: { status },
  });
}

test("remote read recovery is bounded and never retries permanent failures", async () => {
  expect(isTransientDatabaseError(transientError())).toBeTruthy();
  expect(isTransientDatabaseError({ cause: { status: 429 } })).toBeTruthy();
  expect(isTransientDatabaseError({ code: "SERVER_ERROR" })).toBeFalsy();
  expect(isTransientDatabaseError(transientError(401))).toBeFalsy();
  expect(isTransientDatabaseError({ code: "SQLITE_CONSTRAINT" })).toBeFalsy();

  for (const [status, transient] of [
    [502, true],
    [401, false],
  ] as const) {
    const client = createClient({
      url: "https://database.invalid",
      authToken: "test-token",
      fetch: async () => new Response("upstream", { status }),
    });
    let mappedError: unknown;
    try {
      await client.execute("SELECT 1");
    } catch (error) {
      mappedError = error;
    } finally {
      client.close();
    }
    expect(isTransientDatabaseError(mappedError)).toBe(transient);
  }

  let retryAttempts = 0;
  await expect(
    retryTransientDatabaseRead(async () => {
      retryAttempts += 1;
      if (retryAttempts < 3) throw transientError();
      return "ready";
    }, [0, 0]),
  ).resolves.toBe("ready");
  expect(retryAttempts).toBe(3);

  let exhaustedAttempts = 0;
  await expect(
    retryTransientDatabaseRead(async () => {
      exhaustedAttempts += 1;
      throw transientError();
    }, [0, 0]),
  ).rejects.toMatchObject({ cause: { status: 502 } });
  expect(exhaustedAttempts).toBe(3);

  let permanentAttempts = 0;
  await expect(
    retryTransientDatabaseRead(async () => {
      permanentAttempts += 1;
      throw Object.assign(new Error("constraint"), {
        code: "SQLITE_CONSTRAINT",
      });
    }, [0, 0]),
  ).rejects.toMatchObject({ code: "SQLITE_CONSTRAINT" });
  expect(permanentAttempts).toBe(1);

  let readinessChecks = 0;
  const recoveringGuard = createReadinessGuard(async () => {
    readinessChecks += 1;
    if (readinessChecks === 1) throw new Error("temporary failure");
  });
  await expect(recoveringGuard()).rejects.toThrow("temporary failure");
  await expect(recoveringGuard()).resolves.toBeUndefined();
  expect(readinessChecks).toBe(2);

  let concurrentChecks = 0;
  let releaseReadiness: (() => void) | undefined;
  const concurrentGuard = createReadinessGuard(
    () =>
      new Promise<void>((resolve) => {
        concurrentChecks += 1;
        releaseReadiness = resolve;
      }),
  );
  const firstReadiness = concurrentGuard();
  const secondReadiness = concurrentGuard();
  expect(concurrentChecks).toBe(1);
  releaseReadiness?.();
  await Promise.all([firstReadiness, secondReadiness]);
  await concurrentGuard();
  expect(concurrentChecks).toBe(1);
});
