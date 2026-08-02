# Phase 366：Pilot Custom 楓、Capless 木轴与 Capless 螺鈿

## 目标

补齐 Pilot 官方目录中三个尚未有独立来源化页面的公开 SKU 路线，并保持品牌、型号、variant、媒体与审核—发布链路分层。

## 明确边界

- 只处理 `FK-2000K`、`FC-25SK／FC-2500RR`、`FCN-5MP`；不重复创建已有普通 Capless、Decimo、LS、Custom 845／槐／URUSHI。
- `F／M`、颜色／工艺和日本／国际代码留在各自型号的 variant 层。
- 所有试写只使用本目录 `checkpoint/fpkg-copy-source.db`；真实 `data/fpkg.db` 只做快照对照。
- 不直接写 `entity_publications`；通过 `recordEntityContentReview` 与 `publishEntity` 的既有 `applyCuratedContentPacks` 路径发布。

## 验证

1. 官方 exact page、支持清单、护理说明、价目表与独立评测形成来源组。
2. 每个正文包含身份、材质／工艺、尖号、供墨、规格、版本边界、维护、选购与图片边界。
3. 定向测试验证 owned copy、远程环境拒绝、四类 review、variants、spec evidence、references、maker／reverse 与 replay noop。
