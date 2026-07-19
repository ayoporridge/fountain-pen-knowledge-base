# Quick 260720-63p — Jinhao 159 / X159 identity split

## Result

Published Jinhao, the historical 159, and X159 as separate sourced identities. The mixed legacy slug is a hard 404 because it cannot safely choose between two different pens.

## Evidence and verification

- Commit: `9e5bf5a feat(content): split Jinhao 159 and X159`
- Used TTpen collection evidence plus a dated independent X159 review; page copy preserves material, nib, and sample-dimension boundaries.
- `node --import tsx --test tests/content/phase63-jinhao-split.test.ts` passed on an owned disposable copy; replay was `noop` and the protected catalog remained unchanged.
