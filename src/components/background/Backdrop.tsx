/**
 * The site's dark backdrop.
 *
 * Deliberately static: every layer is a painted gradient or a tiled pattern, so
 * the compositor rasterises it once and then does nothing. It replaces an
 * animated canvas particle field and three 70vmax blurred blobs, which together
 * re-rasterised a full-viewport blurred surface on every frame of every page.
 *
 * `tone="panel"` is the shallower version for inner-page headers.
 */
const Backdrop = ({ tone = "hero" }: { tone?: "hero" | "panel" }) => (
  <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
    {/* Base wash — a cool navy that deepens toward the bottom. */}
    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(180deg, hsl(216 44% 11%) 0%, hsl(215 46% 8%) 45%, hsl(215 42% 6%) 100%)",
      }}
    />

    {/* Brand light from the upper left, and a cooler counter-light at the right. */}
    <div
      className="absolute inset-0"
      style={{
        background: `
          radial-gradient(70rem 42rem at 8% -10%, hsl(var(--brand) / ${tone === "hero" ? 0.3 : 0.2}), transparent 62%),
          radial-gradient(52rem 34rem at 108% 18%, hsl(214 90% 52% / ${tone === "hero" ? 0.18 : 0.12}), transparent 60%)
        `,
      }}
    />

    {/* Blueprint grid — the engineering cue, drawn once as a tiled pattern. */}
    <div
      className="absolute inset-0"
      style={{
        backgroundImage: `
          linear-gradient(hsl(210 100% 85% / 0.05) 1px, transparent 1px),
          linear-gradient(90deg, hsl(210 100% 85% / 0.05) 1px, transparent 1px)
        `,
        backgroundSize: "64px 64px",
        maskImage: "radial-gradient(130% 100% at 50% 0%, #000 35%, transparent 85%)",
        WebkitMaskImage: "radial-gradient(130% 100% at 50% 0%, #000 35%, transparent 85%)",
      }}
    />

    {/* A single accent rule where the light falls off — reads as a horizon. */}
    {tone === "hero" && (
      <div
        className="absolute inset-x-0 top-[62%] h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent, hsl(var(--brand) / 0.35) 35%, hsl(var(--brand) / 0.12) 65%, transparent)",
        }}
      />
    )}

    {/* Fine grain, so the large gradients don't band on wide screens. */}
    <div
      className="absolute inset-0 opacity-[0.035] mix-blend-screen"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />

    {/* Vignette, to settle the edges and keep focus on the copy. */}
    <div
      className="absolute inset-0"
      style={{
        background: "radial-gradient(120% 90% at 50% 40%, transparent 55%, hsl(215 45% 5% / 0.55) 100%)",
      }}
    />
  </div>
);

export default Backdrop;
