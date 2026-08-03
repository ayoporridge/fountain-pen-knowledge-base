# Phase 381 SUMMARY

状态：已完成（本 phase）；全量 goal 仍 ACTIVE。

本 phase 处理 Sailor KOP Maki-e Ukiyo-e “Horibe Yahei Kanemaru” 10-9891。官方产品页确认 M/B 代码、KOP 双色 21K 尖、C/C、硬橡胶、φ20×153.5 mm 与 Paulownia box；东京博物馆资料确认歌川国芳的《誠忠義士肖像 堀部矢兵衛金丸》条目。Yoseka 等专业零售商称海外限量 30 支并列市场价，但官方当前页未列数量，正文会保留差异。

已完成：

- `.planning/content-research/sailor-horibe-yahei-kanemaru-109891-phase381.md`、数据包、owned-copy 审核脚本、定向测试和原创 factual SVG。
- `pnpm exec tsx --test tests/content/phase381-sailor-horibe.test.ts`：1/1 通过；覆盖远程选择拒绝、首次发布、四项审核、来源组、媒体、品牌关系、无 fact conflict 和重放 noop。
- owned checkpoint：`.planning/quick/260803-cwi-sailor-horibe-yahei-109891/checkpoint/fpkg-copy.db`；checkpoint SHA-256 `77513d14bb95aa799aeb60fa4a19928bd626cadf181063473d0ce521275483e3`；真实 `data/fpkg.db` SHA-256 仍为 `e8985584fe66c9d0f7f4eb270ea924199f2893c7a120bdffc93c04efcf5a3c64`。
- checkpoint readback：public entity `phase381-sailor-horibe-yahei-109891` / `sailor-kop-horibe-yahei-kanemaru-109891`；2 variants、9 references、primary/secondary source groups `2/1`、fact conflicts `0`；reviews `fact/language/media/publication=approved`；maker/reverse links 均为 1。

未完成：本 phase 未写入真实资料库、Turso 或生产站点；这些仍属于全量 goal 后续阶段，不能用本 phase 完成替代全量完成。
