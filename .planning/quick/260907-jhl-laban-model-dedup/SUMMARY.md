---
quick_id: 260907-jhl
status: complete
description: 修正 Laban 325 型号页残留的品牌页重复段落，并在 caller-owned 副本完成来源、发布与全量重复扫描复核
completed: 2026-09-07
---

# Quick Task Summary: Laban 325 型号页去品牌模板

## Outcome

将 `laban-325` 型号页中与 Laban 品牌页重复的导航段落改为 325 专属的尖号、SKU、版本与核验事实；品牌页正文未改。真实 catalog 已在本地完成原子替换，旧文件与 sidecar 保存在本 quick 目录下的 `formal-local-v1/` 备份中。

## Evidence

- 全量 readiness（owned disposable copy）：929 个实体；906 个 current public；23 个既有 retired backlog；published/public blocker 均为 0。
- Phase 620 focused test：1/1 通过。首次 apply 发布 1 个模型，重放为 `noop`；三类内容 review 与 publication hash 对齐；公开 brand/pen 重复段落组为 0；real source snapshot unchanged。
- Owned-copy gates：`audit-entity-quality` 通过（duplicate name 0、suspicious pen articles 0、thin 0、made_by blockers 0）；`audit-readiness-v2` 只因既有 23 条 retired backlog 返回预期非零，published/public blockers 仍为 0。
- TypeScript、Biome、`git diff --check` 通过；使用正式 catalog 副本构建 Next 15.5.18 成功，18 个静态页面生成；本地 fixture server 的 `/brand/laban`、`/pen/laban-325`、`/api/entities/laban-325`、`/sitemap.xml` 均返回 200，并读到新 325 内容。

## Database boundary

- 所有 apply、migration、审计与构建均针对 caller-owned 副本；未直接 SQLite 打开受保护源文件。
- 本地 `data/fpkg.db` 已原子安装 formal owned copy；安装前主库 SHA-256 为 `272331bb03df6f21ab324e04c963f70755a6a5e554056a01f70baea7bd86724b`，安装后为 `f4137c9afd278fef6d267b9aadc3213836ba18e80838f12976e36343e4fd0739`。旧主库及 `-wal`/`-shm` sidecar 均在 `formal-local-v1/real-pre-phase620-fpkg.db*`。
- 未写入 Turso/远端、未部署、未进行线上 1130 页复查；23 条 retired backlog 和 Phase 20-04 media fixture debt 仍按既有边界保留。

## Changed files

- `.planning/content-research/laban-325-phase141.md`
- `scripts/data/phase620-laban-model-dedup.ts`
- `scripts/apply-phase620-laban-model-dedup.ts`
- `tests/content/phase620-laban-model-dedup.test.ts`
- `scripts/lib/phase19-fixtures.ts`（锁定本地 catalog 新 fingerprint）
