# Quick Plan: Parker Vector XL reader-copy repair

## Goal

把已批准、已有来源支撑的 Teal `2159746` 事实补回 Parker Vector XL 公共正文：M 不锈钢尖、闭合 135 mm、插帽 157 mm、最大径 11.5 mm、20 g，以及 converter 兼容但需另购；同时明确这些数字只绑定该 SKU，不外推到 `2159744` Black CT 或整个 XL 家族。

## Scope

- Target entity: `parker-vector-xl-fountain-pen` (`P7LgZR6-DDPi`)
- Target story: `curated-story-97b95ce7ec0256c7a429c051`
- Reviewed copy: `.planning/content-research/parker-vector-xl-publishable-content-2026-07-19.md`
- No changes to links, references, media, model specs, variants, or retired entities.
- Apply only to an owned checkpoint copy; never select Turso or the protected real catalog during tests.

## Verification

1. Disposable-copy test rejects remote environment selection, publishes once, replays as noop, preserves relation/reference/media/spec/variant fingerprints, and leaves the protected catalog hash unchanged.
2. Read-back asserts the public story includes the exact `2159746` measurements and converter boundary, and that `2159744`/other SKU scope remains explicit.
3. Run Biome, TypeScript, focused test, publication/readiness and content-quality checks on the disposable copy.
4. Only after commit and push, create a formal local migration checkpoint and atomically replace `data/fpkg.db`; record before/after hashes and rerun local gates.

## Explicit boundary

This does not prove Turso/online rendering or human traversal of every page. The current local route sweep remains the only full automatic render evidence until the remote rows-read quota is available.
