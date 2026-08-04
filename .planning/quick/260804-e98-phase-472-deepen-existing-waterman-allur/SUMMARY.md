# Phase 472 Summary

## 状态

已完成并提交：`9c8c75fc feat(content): deepen waterman allure and exception`（只包含 Phase 472 拥有文件）。

## 范围

- Waterman Allure：S0037650 当前刷纹不锈钢/Fine 锚点、颜色/历史 SKU、cartridge/converter、冷水清洁和选购边界。
- Waterman Exception：SAP_2214314 Blue CT 当前锚点、方形结构、Slim/L’Essence du Bleu/Night & Day 样本分层、18K 尖与维护边界。

Phase 472 复用 checkpoint 中已存在的 Phase 398 Allure 深化包，避免用较旧 Phase 83 base 覆盖正文、claims、aliases 或 variants；Exception 也保留原有 7 个 aliases。

## 验收证据

- `checkpoint-final.db` first apply：Allure `phase83-pen-waterman-allure` 与 Exception `phase131-waterman-exception-sap-2214314` 均 `published`；replay 两项均 `noop`。
- 内容 hash：Allure `sha256:v3:d7b4c51cdda9eb78539643782aad8edf28b13beb86103d83fb8b695227e27cb7`；Exception `sha256:v3:f0f84b0465ea43b7ef2c34444a72be87dd36b1faab7c6522953bd35e646310a1`。
- published body：Allure 8845 字符；Exception 4048 字符；两页 fact/language/media/publication review 均 approved，blocker 为 0。
- 相比 Phase 471 checkpoint，Allure 保留 4 aliases、10 references、4 variants 并增加 7 claims/2 scopes；Exception 保留 7 aliases、6 references、3 variants 并增加 6 claims/1 scope，未发生 base-pack 回退。
- library contract：sources 2734、sourceItems 4478、claims 4530、citations 11513、stories 718、events 969、media 986、aliases 2405；contract OK。
- quality：690 entities、668 content_ready/public、published_blockers 0、backlog 22；duplicate/suspicious/thin/broken 全部 0。
- SQLite `integrity_check` 为 `ok`，foreign key check 无输出；真实 `data/fpkg.db` snapshot unchanged。
- 定向测试通过；Biome/diff check 通过；TypeScript 仍只有既有 3 个基线错误，未新增。
