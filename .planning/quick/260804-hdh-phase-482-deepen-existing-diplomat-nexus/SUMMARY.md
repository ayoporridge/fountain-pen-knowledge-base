# Phase 482 Summary

## 交付对象

本批更新三个已有 pen 实体，没有新建颜色、尖材、工艺或相邻型号重复记录：

- Diplomat Nexus（`diplomat-nexus`）；
- Diplomat Aero（`diplomat-aero`）；
- Platinum Izumo PIZ-300000 #55 Hama no Matsu（`platinum-izumo-piz-300000-hama-no-matsu`）。

正文分别保留 Nexus 的 piston/pipette 与密封帽路线、官方容量级别和 Demo Chrome 145/14/55 样本；Aero 的 Zeppelin 联想、Anodized 铝款 42 g、Oxyd 黄铜 72 g、converter/短国际墨胆和 Soft Sliding Click；Hama 的 PIZ-300000 #55 Hira Maki-e、18K F/M/B、目录 33.9 g 与 Platinum Pen USA 34.1 g 的来源口径、以及 #93/#500000 #55/Aurora 边界。三者均复用既有原创 factual SVG，不冒充产品照片。

## 验证证据

- 定向测试 `tests/content/phase482-diplomat-nexus-aero-hama-depth.test.ts` 通过；覆盖 caller-owned checkpoint、远程数据库拒绝、exact identity、品牌关系、正文/来源阈值、媒体、四项当前审核、publication gate、replay noop 与真实资料库快照保护。
- 持久 Phase 482 checkpoint 首轮三项均走 `published`，重放三项均为 `noop`；内容 hash 分别为 Nexus `sha256:v3:a2565834b6d8ad49deacb6b8cc62f9bde23cc7e51d8141e4f507eb6738633ca9`、Aero `sha256:v3:9813036de0f7e0a60ddd4c69f7b1e85901c36bb1939b55fceb4e4c58438ffcd8`、Hama `sha256:v3:db38b64959592a0988cd1b16969eb03eb6ccf9f80b557ff1eec4ce9889ff9879`；试验写入仅发生在 owned checkpoint，真实 `data/fpkg.db` 快照前后一致。
- 三份 research markdown 均通过 `summary`/`body_md` 结构、来源段和内部词禁用检查；正文长度分别为 Nexus 2,922、Aero 2,812、Hama 2,879 Unicode 字符。
- 定向 Biome 通过：`scripts/apply-phase482-diplomat-nexus-aero-hama-depth.ts` 与 `tests/content/phase482-diplomat-nexus-aero-hama-depth.test.ts` 无格式或 lint 问题。
- 持久 checkpoint `PRAGMA integrity_check = ok`，`foreign_key_check` 无行；三项 SQL 正文长度为 Nexus 3,516、Aero 3,395、Hama 3,483，publication 均为 `published` 且 reviewed/content revision 相等、contract version 3。
- checkpoint library contract 通过：sources 2,804；sourceItems 4,569；claims 4,664；citations 11,874；stories 718；events 995；diagrams 9；media 986；aliases 2,407；其余 required tables 均存在。
- 全量 TypeScript 检查仍只有仓库原有 3 个基线错误：`tests/content/phase346-jinhao-x450-x750.test.ts` 两个 TS7022，以及 `tests/migration/sync-local-catalog-to-turso.test.ts` 的 `NODE_ENV` 缺失；本批未新增 TypeScript 错误。

## 未完成范围

全量内容修复仍未完成；其他低信息量页面、公开品牌与型号缺口、正式远端迁移、Turso 配额阻塞处理、生产部署、真人全站遍历和线上逐条复查，均待后续批次和最终 ship 阶段。当前 Turso Starter rows-read 已超额且 Overages disabled，不应在本批重试远端读写。
