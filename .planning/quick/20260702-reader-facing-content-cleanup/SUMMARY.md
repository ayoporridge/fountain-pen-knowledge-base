---
status: complete
completed_at: 2026-07-03
---

# Reader-Facing Content Cleanup Summary

## Completed

- Installed `open-gsd/gsd-core` for Codex after confirming the old `gsd-sdk`
  command was not present.
- Added `scripts/apply-reader-facing-content-cleanup.ts` to rewrite public
  `brand`, `pen`, and `nib` entity/story text from source-process wording into
  reader-facing prose.
- Rewrote the reported PenBBS 金尖 / 大明尖 page so it explains PenBBS,
  related models, gold nib / 大明尖 context, and buying judgment directly to
  readers.
- Rewrote the PenBBS brand page and representative model cards so they no longer
  read like agent instructions.
- Replaced the HongDian 6013 sentence with: `人们对这支笔的第一印象，往往就是哑黑外观、金属工具感。`
- Cleaned additional source-led phrasing across brand pages and model
  introductions, including page/source phrasings exposed by wide scans.
- Synced the same cleanup to local SQLite and remote Turso.

## Verification

- Local cleanup scan: old agent/source-process target patterns are `0`.
- Remote cleanup scan: old agent/source-process target patterns are `0`.
- Wide scan now only reports 7 remaining matches, all in imported long-form
  reference articles such as Parker/Sheaffer/Chilton text (`索引`, `我能确认`),
  not generated brand/model/nib introductions.
- Live verified:
  - `/nib/坛笔-penbbs-金尖大明尖`
  - `/brand/penbbs`
  - `/pen/弘典-hongdian-6013文武黑将`
- `pnpm lint` passed with existing CSS `!important` warnings.
- `pnpm build` passed.
