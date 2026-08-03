# Phase 449：Pilot Capless 家族三个型号页深化结果

## 结果

- 在 Phase 448 owned checkpoint 上深化了三个已有 canonical 型号：Pilot Capless 全尺寸、Pilot Capless Decimo、Pilot Capless LS。
- 复用了 Phase 43 的实体、品牌关系、Pilot 官方来源和原创事实图；没有重新建立 Capless/Decimo 混名实体，也没有把 Stripe、SE、絣、Raden 或 FCS-1 特殊合金并入普通页面。
- 三份正文补足了市场命名、FCT/FCLS 产品代码、CON-40、按动机构、clip 握持、气压携带、清洁和二手身份核对边界；研究文件和发布正文均达到阶段门槛。

## Checkpoint 与数据库保护

- owned checkpoint：`.planning/quick/260804-6np-pilot-capless-family-depth-owned-checkpoint/checkpoint.db`
- 应用后 SHA-256：`2be6604bc217d517c1eb79b4736b52201be30cdbd56c10a0ffadd5b7c744f443`
- 真实资料库 SHA-256：`e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`，阶段前后不变。
- `PRAGMA integrity_check`：`ok`。

## 发布回读

| 型号 | entity id | 正文 | approved refs | 独立来源组 | primary media | publication |
| --- | --- | ---: | ---: | ---: | ---: | --- |
| Pilot Capless | `s43PILOTCAP` | 2999 | 8 | 5 | 1 | published |
| Pilot Capless Decimo | `s43PILOTDECI` | 2795 | 7 | 6 | 1 | published |
| Pilot Capless LS | `s43PILOTLS` | 2781 | 7 | 6 | 1 | published |

三个型号均保持恰好一条 `made_by` 和一条品牌到型号的 `reverse` 导航；fact/language/media 与 publication review 均为 approved，reviewed revision、contract version 3 和 approved hash 一致。

首次 apply 返回三个 `published`，内容 hash 为：

- Capless：`sha256:v3:3275b4df7e45fb3ba523e6b44993ed9cbb3d1d0737e9c333e554fff635884864`
- Decimo：`sha256:v3:a1b377feb1b08c83b53b7fb3a4b7e1ce0df635b48665664b5cc224b1f760af65`
- LS：`sha256:v3:8d23280b41b8417008f2363890af418416bba42aeb01ff02e7d3cf15a116eb13`

第二次 replay 三个实体全部返回 `noop`。

## 审计证据

- 定向测试：`pnpm exec tsx --test tests/content/phase449-pilot-capless-family-depth.test.ts`，1/1 通过。
- Entity quality audit：690 entities，668 active，22 retired lineage excluded；duplicate name groups 0、suspicious pen articles 0、thin brand/model entities 0、made_by blockers 0。
- Library contract：通过。计数为 sources 2732、sourceItems 4476、claims 4132、citations 11115、stories 718、events 900、diagrams 9、media 986、community 2、exhibits 6、externalIds 61、aliases 2405、commonsMedia 4。
- Biome 与 `git diff --check` 通过。`tsc --noEmit` 仍只有既有基线的 3 个错误：Phase 346 Jinhao 测试两个 TS7022，以及 Turso migration 测试缺少 `NODE_ENV` 的 TS2741。

## 未完成边界

本阶段只深化三个 Pilot Capless 型号页，未迁移真实资料库，未完成其他品牌／型号研究、全量公开页面真人遍历、正式部署与线上逐条复查；长期全量 goal 继续保持 active。
