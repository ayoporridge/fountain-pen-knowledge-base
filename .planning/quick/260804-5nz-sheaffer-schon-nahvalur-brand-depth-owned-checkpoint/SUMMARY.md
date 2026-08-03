# Phase 446 摘要：Sheaffer、Schon DSGN、Nahvalur 品牌页深化

## 交付范围

本阶段只深化三个已有品牌实体，没有新增品牌或型号，也没有改写其它 agent 的 research、`.next-phase*` 或受保护的 Montblanc quick 目录。

- Sheaffer：把 1913 Fort Madison、杠杆填充、1924 White Dot、Balance／Touchdown／Snorkel／PFM／Targa 与现行 Icon／100 分层；保留 Imperial／Legacy 等身份边界。
- Schon DSGN：把 Pocket Six 作为唯一已核验钢笔入口，区分短杆、#6 尖、短国际墨囊以及铝、黄铜、铜、阳极氧化和多色版本；不把圆珠、滚珠并入钢笔。
- Nahvalur：把 Narwhal→Nahvalur 名称过渡与 Original／Original Plus／Schuylkill／Nautilus／Nautilus Ti 的供墨、材料和版本边界分开；当前官方首页只作集合导航，不把库存卡片变成重复实体。

正文来源采用品牌官网、官方集合／产品页、Richard’s Pens、PenHero、Vintage Pens、长期钢笔评测和经销商历史记录；三份正文 markdown 均超过 3500 字符，发布正文均超过 2600 字符。

## 阶段证据

- 定向测试：`pnpm exec tsx --test tests/content/phase446-sheaffer-schon-nahvalur-brand-depth.test.ts` 通过；测试覆盖 Phase 445 checkpoint 作为输入、remote 选择拒绝、审核—发布、primary media、唯一品牌关系、内容 hash、replay noop 与真实资料库快照不变，约 30 秒。
- 阶段 apply 首次发布三项；第二次 replay 三项均为 `noop`，内容 hash 稳定：
  - Sheaffer `sha256:v3:78e438ffdeb4a2426d537ae73df0ecbcf68412c623f5111f9f83a2c344addcdb`
  - Schon DSGN `sha256:v3:28de57199c90a3d80d354ac904241288c7dfa48eb898edabd55b6f72ffe37911`
  - Nahvalur `sha256:v3:a0f636bf3a8914f91f4e9e00baea68cd1a0a3e208db11ec26a81483b2b030fdc`
- checkpoint SHA-256：`f5d5a2e1b7ab58c551041470526ce8051e15f419a95a47562832d656658025c3`。
- 真实 `data/fpkg.db` SHA-256：`e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`，阶段前后未变；阶段 checkpoint `PRAGMA integrity_check`：`ok`。

## 三个品牌回读

| brand | 发布正文字符 | approved refs | 独立来源组 | primary media | status | 已发布型号反向导航 |
| --- | ---: | ---: | ---: | ---: | --- | ---: |
| 犀飞利 Sheaffer | 2719 | 7 | 6 | 1 | published | 14/14（另有历史文章导航） |
| Schon DSGN | 2711 | 6 | 4 | 1 | published | 1/1 |
| Nahvalur（原 Narwhal） | 2715 | 13 | 8 | 1 | published | 3/3 |

阶段 checkpoint 总量：981 entities、935 public entities、673 published publications。

## 全库定向审计

- Entity quality：690 audited entities，668 active，22 retired lineage excluded；duplicate name groups 0、suspicious pen articles 0、thin brand/model entities 0、`made_by` relationship blockers 0。
- Library contract：sources 2726、sourceItems 4470、claims 4092、citations 11076、stories 718、events 884、diagrams 9、media 986、community 2、exhibits 6、externalIds 61、aliases 2405、commonsMedia 4；contract OK。
- Library coverage diagnostic：brands 115/119 ready、4 gap、平均 97；models 553/571 ready、16 gap、平均 97。剩余 gap 是全量目标的真实未完成边界，本阶段没有把阶段通过冒充全站完成。
- Biome：本阶段 data/apply/test 文件 check 通过。`git diff --check` 通过。
- TypeScript：全仓仍只有既有基线 3 项错误（`phase346-jinhao-x450-x750.test.ts` 两个 TS7022；`sync-local-catalog-to-turso.test.ts` 缺少 `NODE_ENV` 的 TS2741），本阶段没有新增错误。

## 未完成边界

Phase 446 只是三家已有品牌页的深化，不代表 Fountain Pen Knowledge Graph 全量目标完成。仍需继续处理剩余 gap、薄内容与缺失的重要型号／品牌，之后才可正式迁移真实资料库，做全站自动检查、真人遍历、生产部署和线上逐条复查。goal 继续保持 active。
