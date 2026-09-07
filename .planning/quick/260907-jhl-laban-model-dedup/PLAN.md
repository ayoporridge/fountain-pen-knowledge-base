---
quick_id: 260907-jhl
status: complete
description: 修正 Laban 325 型号页残留的品牌页重复段落，并在 caller-owned 副本完成来源、发布与全量重复扫描复核
---

# Quick Plan: Laban 325 型号页去品牌模板

## Scope

- 只处理当前公开 `laban-325` 型号页正文；Laban 品牌页保持不动。
- 把一段从品牌页误复制到型号页的导航说明，改成 325 专属的尖号、版本和维护事实。
- 使用现有 `phase141` pack 结构创建窄范围 apply；所有数据库写入只落在 caller-owned checkpoint copy。

## Acceptance

- 型号页文件正文仍有完整的规格、历史、维护和选购信息，且不再与品牌页共享 >=100 字段落。
- 首次 apply 只更新 Laban 325 的正文并完成三类 review/publication；重放为 noop。
- owned-copy `check:data-contract`、`check:publication-gate`、`audit:entity-quality` 与 `verify:markdown` 通过；副本全量公开品牌/型号重复段落为 0。
- 真实 `data/fpkg.db`、远端数据库、未跟踪 research/.next-phase*/quick 资产均不改动。

## Verification

- `pnpm exec tsx --test tests/content/phase620-laban-model-dedup.test.ts`
- `pnpm exec tsc --noEmit`
- `pnpm exec biome check scripts/data/phase620-laban-model-dedup.ts scripts/apply-phase620-laban-model-dedup.ts tests/content/phase620-laban-model-dedup.test.ts`
- `git diff --check`

## Output

`.planning/quick/260907-jhl-laban-model-dedup/SUMMARY.md`
