"use client";

/**
 * TextureOverlay — procedural paper grain effect
 *
 * Inspired by hermes-agent.nousresearch.com's multi-layer canvas texture system.
 * Simplified to SVG feTurbulence + CSS blend modes for performance.
 *
 * Layers (light mode):
 *   1. Noise multiply   — subtle dark grain on parchment
 *   2. Noise overlay    — mid-tone contrast
 *   3. Radial gradient  — warm amber corner glow
 *
 * Layers (dark mode):
 *   1. Noise color-dodge — bright grain on dark brown
 *   2. Noise difference  — inverted contrast
 *   3. Radial gradient   — gold corner glow
 */
export function TextureOverlay() {
  return (
    <>
      {/* SVG filter definition — hidden */}
      <svg className="fixed inset-0 w-0 h-0" aria-hidden="true">
        <defs>
          <filter id="paper-grain" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65"
              numOctaves="4"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              type="saturate"
              values="0"
              in="noise"
              result="mono"
            />
          </filter>
          <filter id="paper-grain-fine" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="1.2"
              numOctaves="3"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              type="saturate"
              values="0"
              in="noise"
              result="mono"
            />
          </filter>
        </defs>
      </svg>

      {/* Layer 1: Coarse grain — multiply (light) / color-dodge (dark) */}
      <div
        className="fixed inset-0 pointer-events-none z-[101]"
        style={{
          filter: "url(#paper-grain)",
          mixBlendMode: "multiply",
          opacity: 0.035,
        }}
      />

      {/* Layer 2: Fine grain — overlay (light) / difference (dark) */}
      <div
        className="fixed inset-0 pointer-events-none z-[102]"
        style={{
          filter: "url(#paper-grain-fine)",
          mixBlendMode: "overlay",
          opacity: 0.025,
        }}
      />

      {/* Layer 3: Warm corner glow */}
      <div
        className="fixed inset-0 pointer-events-none z-[100]"
        style={{
          background:
            "radial-gradient(ellipse at 85% 15%, rgba(196, 163, 90, 0.12) 0%, transparent 55%)",
          mixBlendMode: "soft-light",
        }}
      />

      {/* Dark mode overrides */}
      <style>{`
        .dark [style*="z-index: 101"] {
          mix-blend-mode: color-dodge !important;
          opacity: 0.06 !important;
        }
        .dark [style*="z-index: 102"] {
          mix-blend-mode: difference !important;
          opacity: 0.04 !important;
        }
        .dark [style*="z-index: 100"] {
          background: radial-gradient(ellipse at 85% 15%, rgba(196, 163, 90, 0.18) 0%, transparent 55%) !important;
          mix-blend-mode: lighten !important;
        }
      `}</style>
    </>
  );
}
