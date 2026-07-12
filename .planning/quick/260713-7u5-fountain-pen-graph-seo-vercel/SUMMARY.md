---
phase: quick
plan: 260713-7u5
slug: fountain-pen-graph-seo-vercel
status: complete
completed_at: 2026-07-13
release_sha: 264c1c2fb8e126fba07d8c541f0818385fe316c5
deployment_id: dpl_68z7JdSwSu9nbjoQ8JQvaKnmR1ZY
production_url: https://fountain-pen-graph.vercel.app
---

# Fountain Pen Graph 全站体验、SEO 与 Vercel 生产优化交付总结

## 结果

本任务已完成并通过最终生产验真。现有 Warm Pen Atlas 视觉体系得到保留，首页策展入口、中文搜索、浏览首屏、媒体链路、公开可见性、详情信息层级、局部图谱、移动抽屉、键盘可访问性和逐页 SEO 均已收敛到可测试状态。

最终生产别名：<https://fountain-pen-graph.vercel.app>

- 最终产品 release SHA：`264c1c2fb8e126fba07d8c541f0818385fe316c5`
- 最终 production deployment：`dpl_68z7JdSwSu9nbjoQ8JQvaKnmR1ZY`
- immutable URL：<https://fountain-pen-graph-93dr3o9ic-aljo233.vercel.app>
- Vercel project：`prj_i046gsxTEqsWGYQzVq35D71QtaHU` / `aljo233/fountain-pen-graph`
- 最终 production E2E：`26 passed / 0 failed`

## 基线保全与发布边界

- 实施前 HEAD：`63c4e4db71d14c7d3bb49994b14fee7779c167f3`
- 基线工作树：16 个 tracked dirty、13 个 untracked；逐路径状态、tracked diff、untracked SHA-256 和既有语义成果均已写入 `BASELINE-MANIFEST.md`。
- 基线独立 production server E2E：`43 passed / 31 failed / 12 skipped`；12 个唯一 skip 的文件、标题和行号已写入 manifest。
- `RELEASE-ALLOWLIST.txt` 使用逐文件路径，无目录通配。每次提交均只显式 stage 目标文件，没有使用 `git add .`。
- 未执行 reset、checkout 覆盖、删除未跟踪文件、force push，也没有写入凭据或生产数据库。
- 最终产品发布前工作树为空，`git status --porcelain=v1 -uall` 无输出；CLI 从该干净状态的 `264c1c2` 执行。

本轮产品提交：

1. `a1fe670` — secure search, browse and media paths
2. `c8ca54c` — strengthen graph navigation and SEO
3. `da75e32` — enforce production quality gates
4. `be1cfa9` — production FTS unavailable 时受控降级
5. `264c1c2` — 固定媒体真实连接 IP，并完整隔离移动导航背景

## 主要交付

### 入口、搜索与浏览

- 首页预算问题固定进入 `/browse?type=pen&origin=origin-japan&nib_material=gold&max_price=500`；`max_price=500` 为 `price-entry OR price-mid`，金尖为五个 gold tag 的 OR。
- 活塞问题固定进入 `/concept/piston-filler`。
- 823/743 固定进入两项对比；数据库核实的 slug 是 `pilot-custom-823` 与 `百乐-pilot-custom-743`。
- 搜索先解析产地、笔尖、预算、品牌和型号意图，再执行参数化的名称/slug/alias/FTS/LIKE 召回，page 与 API 共用实现。
- 生产 Turso 没有 `entities_fts` 时，只对精确的 `no such table: entities_fts` error/cause 链执行参数化 LIKE 降级；其他 SQL、权限和可见性错误继续抛出。
- browse 首批实体、facets、typeCounts 和 total 随 SSR 返回；客户端保留筛选、history、popstate 和加载更多。

### 媒体与公开可见性

- 主图片代理只接受 approved primary/gallery media id；legacy URL 只接受 Richard's Pens 固定 HTTPS 域名。
- DNS A/AAAA 预检结果会固定到 Node `https.request` 的自定义 lookup；Host、TLS SNI 与证书校验继续使用原 hostname，socket remote address 必须等于已验证公网 IP。每次 redirect 都重新解析、校验并固定；私网/保留地址、最多 3 跳、8 秒超时、image MIME 和 8 MiB 上限均有保护。
- 媒体全量 dry-run 扫描数量为 592，与 SQL 目标数一致；最终网络检查为 239 healthy、353 fallback，零数据库写入。失败记录保留，由 UI 统一资料卡降级。
- page、entities detail/preview/tags、search、browse、links、recommendation 和 sitemap 共用 public visibility 规则。
- 四个隐藏品牌及动态 marker article 不通过 HTML、JSON、links、推荐或 sitemap 泄露。

### 详情、图谱、移动端与 SEO

- 详情页增加正确面包屑、首屏结论/规格/证据、来源层级和完整 canonical/JSON-LD；Bing 仅作为不可点击线索。
- 局部图谱移到全宽 section，支持一跳/二跳、中文关系名和“为什么关联”的列表兜底；新增 `/graph` 主导航入口。
- 推荐使用公开过滤，并显示同品牌、同系列、同价位、同笔尖或直接关系等具体理由。
- MobileNav 与 FacetPanel dialog 支持焦点进入/循环/返回、Escape、背景 inert、滚动锁定和单一标题/关闭按钮。MobileNav 打开时，外部触发器也临时变为 `inert + aria-hidden + tabIndex=-1`，关闭后完整恢复并获得焦点。
- 全局 `focus-visible`、reduced motion 和 390×844 无横向溢出已覆盖。
- root 只提供 metadataBase 和共享模板；首页独占 WebSite/SearchAction JSON-LD。可索引页面各自 canonical；search/chat/compare noindex 且不进 sitemap。

## 自动门禁

| 门禁 | 最终结果 |
|---|---|
| `pnpm lint` | 0 error；仅保留既有 `globals.css:802` `!important` warning |
| `pnpm exec tsc --noEmit` | passed |
| `pnpm verify:markdown` | 80/80，0 issues |
| `pnpm check:data-contract` | article 206、brand 69、concept 13、fill 14、nib 36、pen 244；passed |
| `pnpm check:library` | sources 140、sourceItems 894、claims 390、citations 1473、stories 320、events 73、diagrams 9、media 614、community 2、exhibits 6、externalIds 61、aliases 861、commons 28；passed |
| `pnpm audit:entity-quality` | 582 entities；0 duplicate groups、0 suspicious pen articles、0 thin entities、0 broken/self links |
| `pnpm audit:public-media` | 592/592 dry-run；0 writes |
| `pnpm build` | passed；33 routes |
| Local desktop full E2E | 87 passed / 0 failed / 12 skipped |
| Local desktop+mobile site-quality | 26 passed / 0 failed |
| Production desktop+mobile site-quality | 26 passed / 0 failed |

最终 12 个唯一 skip 与基线集合相同，没有新增 skip。测试中新增的 FTS fallback 合约验证：首个 SQL 使用 FTS、精确缺表后第二个 SQL 不使用 FTS并返回 823；`entity_tags` 等其他缺表错误不会被吞掉。

移动 dialog 在远端冷启动与 desktop 并发时曾两次出现测试点击早于 React hydration：两次均为 `25 passed / 1 failed`，对应单项立即重跑均通过。测试随后改为有限 hydration 重试；最终同样的 production 双 project 命令得到 `26 passed / 0 failed`，没有通过 skip 或删断言规避。

## Vercel 发布记录

发布前核对发现现有 Vercel project 的 Git link 指向 `ayoporridge/pen`，当前 `origin` 是 `ayoporridge/fountain-pen-knowledge-base.git`，因此 master push 不会自动触发该 project 的 production deployment。本次严格选择 CLI 路径，没有再等待或触发 Git integration deployment。

首次 CLI deployment：

- release SHA：`da75e32c8e14dce33d63f572db0bff4cc573e8fd`
- deployment：`dpl_K5N7o9BpwKXD1VPx7qhMzdsk9CaJ`
- immutable URL：<https://fountain-pen-graph-9zmifqmye-aljo233.vercel.app>
- 结果：Vercel build READY，但 live truth 暴露生产 Turso 缺少 `entities_fts`，`/api/search?q=823` 返回 500；日志为 `SQLITE_UNKNOWN: no such table: entities_fts`。该部署没有被误标为完成。

用户授权后只执行一次纠正 CLI production deployment：

- release SHA：`be1cfa9005b19a85a9ca744a309f34c350287024`
- deployment：`dpl_Cpu8qUjGvvaEnvo19PpHKFvxjbh7`
- readyState：`READY`
- alias：`fountain-pen-graph.vercel.app`
- immutable URL：<https://fountain-pen-graph-bdn5qh967-aljo233.vercel.app>

随后独立 verifier 在 `VERIFICATION.md` 留下 `gaps_found 11/14` 证据：媒体代理仍有 DNS preflight/fetch TOCTOU，MobileNav trigger 没有纳入背景隔离。该报告原样保留，没有改写成通过。

Verifier gap closure deployment：

- release SHA：`264c1c2fb8e126fba07d8c541f0818385fe316c5`
- deployment：`dpl_68z7JdSwSu9nbjoQ8JQvaKnmR1ZY`
- readyState：`READY`
- alias：`fountain-pen-graph.vercel.app`
- immutable URL：<https://fountain-pen-graph-93dr3o9ic-aljo233.vercel.app>
- production desktop+mobile：`26 passed / 0 failed`

本次只执行一次 gap closure CLI production deployment。原 verifier 报告仍保持 `gaps_found`，等待独立 verifier 基于新 release 复验并生成新的 14/14 结论。

## Production live truth

### 页面与关键路径

以下路径最终均返回 200，并由浏览器合约检查关键内容、console/page errors 和破图：

- `/`
- `/library`
- `/browse?type=pen`
- 两条 `/search`
- `/compare?items=pilot-custom-823,百乐-pilot-custom-743`
- `/graph`
- `/pen/pilot-custom-823`
- `/brand/pilot`
- `/article/the-baguio-surrender-pens`
- `/sitemap.xml`
- `/robots.txt`

### 搜索与 browse

- `/api/search?q=823&limit=50`：200、total 16，含 `pilot-custom-823`。
- `百乐 823 743`：200，同时含 `pilot-custom-823` 与 `百乐-pilot-custom-743`。
- 预算 intent：`type=pen`、`origin=origin-japan`、`nib_material=gold`、`max_price=500`，browseHref 精确匹配。
- 预算 search 与 browse 都返回 6 个型号；E2E 逐项通过 detail/tags 证明每个结果都是 pen、含 `origin-japan`、含 gold group、含 entry/mid。

### 媒体

- approved id `media-commerce-169b0fb4640bf4`：200 `image/jpeg`
- unknown id：404 JSON
- 非白名单 `example.com`：403
- 直接 `127.0.0.1`：403
- Richard's Pens legacy 样例：200 `image/jpeg`
- DNS rebinding 回归明确模拟“预检解析到 `8.8.8.8`、连接阶段报告 `127.0.0.1`”，结果为 403；redirect 到私网、redirect loop、伪造 Content-Length、实际流超限和非图片 MIME 也只用本地可注入测试验证，没有向 production 写恶意 fixture。

### 隐藏内容

- `banju`、`saier`、`shanghai`、`yongxu` 的 detail/preview/tags 共 12 个请求全部 404。
- 四个 hidden entity id 作为 links center 全部 404；公开 823 的 forward/backlinks/second-hop 四组均无隐藏 slug/id。
- 动态 marker article `万特佳` 的 page/detail/preview/tags 全部 404，search 和 sitemap 均不含该 slug。
- brand entities 列表不含四个隐藏品牌。

### SEO

- `/`、`/browse`、`/library` 及五个子页、`/exhibits`、`/timeline`、`/graph`、`/by/brand`、`/pen/pilot-custom-823` 均 canonical 到自身无参数公开 URL。
- DOM 中首页独占 WebSite JSON-LD；`/library` 无 WebSite JSON-LD。
- search/chat/compare 均为 `noindex, follow`，且不在 sitemap。
- sitemap 含 `/graph` 和公开 exhibit/detail，不含 API、工具页、隐藏实体或精确 `/new`。
- robots 禁止 `/api/`、`/admin/`、`/new`。

### 缓存与性能

连续三次请求均为 Vercel edge `HIT` 且带递增 `age`：

| Surface | 三次 TTFB | Warm median |
|---|---|---|
| Home | 0.562s / 0.619s / 0.651s | 0.619s |
| Library | 0.602s / 0.650s / 0.638s | 0.638s |
| Browse API | 0.697s / 0.663s / 0.695s | 0.695s |
| Search API | 0.610s / 0.627s / 0.668s | 0.627s |

Vercel 会消费响应中的 `s-maxage` 并向浏览器暴露安全的 `cache-control: public`；最终合约同时检查 `age` 或 `x-vercel-cache: HIT/STALE`，没有误把被平台转换后的 header 当成无缓存。

## 浏览器 QA 证据

- desktop：1440×900
- mobile：390×844，hasTouch + mobile UA
- production 配置使用 `E2E_BASE_URL`，确认 `webServer` 未启动。
- 最终截图：
  - `test-results/site-quality-site-quality--6ed40-ser-errors-or-broken-images-desktop/desktop-home.png`
  - `test-results/site-quality-site-quality--6ed40-ser-errors-or-broken-images-desktop/desktop-graph.png`
  - `test-results/site-quality-site-quality--6ed40-ser-errors-or-broken-images-mobile/mobile-home.png`
  - `test-results/site-quality-site-quality--6ed40-ser-errors-or-broken-images-mobile/mobile-graph.png`
- 最终关键 journey：0 console error、0 page error、0 broken image、0 horizontal overflow；移动导航/筛选 dialog 的 focus trap、Escape 和焦点返回通过。
- 最终 390×844 production DOM 合约还枚举全部可见 focusable：导航 dialog 打开时 dialog 外可访问控件为 0；trigger 状态为 `inert=true`、`aria-hidden=true`、`tabIndex=-1`，关闭后属性恢复且焦点返回。

## 未做的写操作与已知非阻塞项

- 没有执行 media `--apply`，没有修改本地或远程媒体状态。
- 没有为界面编造价格、规格、适合人群、库存或来源事实。
- `globals.css:802` 的 `text-decoration: none !important` 是实施前既有 lint warning，本轮没有新增 warning/error。
- production Turso 的 `entities_fts` 仍未创建；当前通过受控 LIKE fallback 保证功能可用，后续如要恢复 FTS 性能，应作为独立数据库 migration 任务处理并先做远程备份/审计。
