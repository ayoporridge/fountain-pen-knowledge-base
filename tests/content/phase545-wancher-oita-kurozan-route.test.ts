import assert from "node:assert/strict";
import test from "node:test";
import { getCanonicalEntityPath } from "../../src/lib/entity-redirects";

test("Phase 545 exposes the retired Oita Kurozan slug as a canonical redirect", () => {
  assert.equal(
    getCanonicalEntityPath("pen", "wancher-oita-urushi-kurozan"),
    "/pen/wancher-oita-urushi-kurozan-fountain-pen",
  );
});
