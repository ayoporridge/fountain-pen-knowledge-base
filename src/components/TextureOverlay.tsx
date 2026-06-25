"use client";

/**
 * TextureOverlay — procedural paper grain effect
 *
 * Inspired by hermes-agent.nousresearch.com's multi-layer canvas texture system.
 * Simplified to SVG feTurbulence + CSS blend modes for performance.
 *
 * The SVG filter generates fractalNoise on the div's own background color,
 * then blend modes composite it with the page beneath.
 */
export function TextureOverlay() {
  return (
    <>
      {/* SVG filter definitions — hidden */}
      <svg className="fixed inset-0 w-0 h-0" aria-hidden="true">
        <defs>
          {/* Coarse grain — like aged paper fiber */}
          <filter id="grain-coarse" x="0%" y="0%" width="100%" height="100%">
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
          {/* Fine grain — like ink spread micro-texture */}
          <filter id="grain-fine" x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="1.5"
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

      {/* Layer 1: Coarse grain — multiply blend darkens parchment */}
      <div
        className="texture-layer fixed inset-0 pointer-events-none"
        style={{
          zIndex: 101,
          backgroundColor: "var(--color-surface)",
          filter: "url(#grain-coarse)",
          mixBlendMode: "multiply",
          opacity: 0.04,
        }}
      />

      {/* Layer 2: Fine grain — overlay blend adds contrast */}
      <div
        className="texture-layer fixed inset-0 pointer-events-none"
        style={{
          zIndex: 102,
          backgroundColor: "var(--color-surface)",
          filter: "url(#grain-fine)",
          mixBlendMode: "overlay",
          opacity: 0.03,
        }}
      />

      {/* Layer 3: Warm corner glow — soft-light for natural warmth */}
      <div
        className="texture-layer fixed inset-0 pointer-events-none"
        style={{
          zIndex: 100,
          background:
            "radial-gradient(ellipse at 80% 10%, rgba(196, 163, 90, 0.15) 0%, transparent 50%)",
          mixBlendMode: "soft-light",
        }}
      />

      {/* Dark mode: switch blend modes for inverted noise effect */}
      <style>{`
        .dark .texture-layer[style*="z-index: 101"] {
          mix-blend-mode: color-dodge !important;
          opacity: 0.07 !important;
        }
        .dark .texture-layer[style*="z-index: 102"] {
          mix-blend-mode: difference !important;
          opacity: 0.05 !important;
        }
        .dark .texture-layer[style*="z-index: 100"] {
          background: radial-gradient(ellipse at 80% 10%, rgba(196, 163, 90, 0.2) 0%, transparent 50%) !important;
          mix-blend-mode: lighten !important;
        }
      `}</style>
    </>
  );
}
