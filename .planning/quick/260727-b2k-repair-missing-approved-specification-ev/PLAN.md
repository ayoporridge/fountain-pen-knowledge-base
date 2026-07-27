# Quick task: Pelikan M200/Twist evidence repair

## Scope

- Repair the existing Phase 248 Pelikan M200 and Pelikan Twist packs so each approved model spec has an explicit status field and nine approved evidence fields.
- Reuse the existing source-backed copy and topology; do not create duplicate entities or a new model pack.
- Run the updated replay only on an owned checkpoint copy.

## Verification

- The pack carries source-backed status values and evidence, and the existing identity/reclassification test asserts nine approved spec fields for both pens.
- TypeScript, targeted Phase 248 test, Biome, and staged diff checks pass while the real catalog remains unchanged.
