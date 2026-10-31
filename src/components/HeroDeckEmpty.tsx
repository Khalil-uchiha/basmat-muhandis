import Logo from "./Logo";

/**
 * Stands in for the photo deck before it loads and while it is empty.
 *
 * Shared by the Suspense fallback and the deck's own empty state so the two
 * can't drift. On large screens it renders nothing: the backdrop's robot-arm
 * drawing occupies this column and is the better visual. Phones don't get the
 * arm, so there the framed emblem keeps the column from reading as a gap.
 */
const HeroDeckEmpty = () => (
  <div aria-hidden className="relative h-full w-full lg:hidden">
    <div
      className="absolute inset-0 rounded-[1.75rem] blur-[70px]"
      style={{ background: "radial-gradient(circle, hsl(var(--brand) / 0.28), transparent 70%)" }}
    />
    <div className="relative flex h-full w-full items-center justify-center rounded-[1.75rem] border border-white/10 bg-[hsl(215_44%_8%/0.92)]">
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
