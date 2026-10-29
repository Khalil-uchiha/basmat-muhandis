import Logo from "./Logo";

/**
 * Stands in for the photo deck before it loads and while it is empty.
 *
 * Shared by the Suspense fallback and the deck's own empty state so the two
 * can't drift. It is framed rather than a bare floating emblem: an empty
 * column beside the headline reads as a layout fault, a framed one reads as a
 * deliberate panel.
 */
const HeroDeckEmpty = () => (
  <div aria-hidden className="relative h-full w-full">
    <div
      className="absolute inset-0 rounded-[1.75rem] blur-[70px]"
      style={{ background: "radial-gradient(circle, hsl(var(--brand) / 0.28), transparent 70%)" }}
    />
    <div className="relative flex h-full w-full items-center justify-center rounded-[1.75rem] border border-white/10 bg-white/[0.03]">
      <Logo variant="white" priority className="h-24 w-24 opacity-[0.28] sm:h-28 sm:w-28" />
      <span
        className="absolute inset-0 rounded-[1.75rem]"
        style={{
          backgroundImage: `
            linear-gradient(hsl(210 100% 85% / 0.04) 1px, transparent 1px),
            linear-gradient(90deg, hsl(210 100% 85% / 0.04) 1px, transparent 1px)
          `,
          backgroundSize: "28px 28px",
        }}
      />
    </div>
  </div>
);

export default HeroDeckEmpty;
