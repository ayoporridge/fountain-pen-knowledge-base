# TypeScript check race note

The first TypeScript invocation was started in parallel with `pnpm run build` and exited 2 because the build was concurrently replacing generated `.next/types` files. The production build itself exited 0. After the build completed, `pnpm exec tsc --noEmit` was rerun serially and exited 0; `evidence/tsc.txt` and `evidence/tsc.exit` contain that final check.
