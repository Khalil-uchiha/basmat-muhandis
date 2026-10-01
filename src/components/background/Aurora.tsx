/**
 * Soft drifting colour wash sitting behind the hero and page headers.
 * Pure CSS so it costs nothing on the main thread.
 */
const Aurora = ({ className = "" }: { className?: string }) => (
  <div aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
    <div
      className="absolute -left-[18%] -top-[28%] h-[70vmax] w-[70vmax] rounded-full animate-drift-a blur-[110px]"
      style={{
        background:
          "radial-gradient(circle at 35% 35%, hsl(var(--brand) / 0.55), hsl(var(--brand) / 0.12) 45%, transparent 70%)",
      }}
    />
    <div
      className="absolute -right-[22%] top-[6%] h-[62vmax] w-[62vmax] rounded-full animate-drift-b blur-[120px]"
      style={{
        background:
          "radial-gradient(circle at 60% 40%, hsl(var(--brand-bright) / 0.4), hsl(var(--brand-deep) / 0.15) 48%, transparent 72%)",
      }}
    />
    <div
      className="absolute bottom-[-30%] left-[24%] h-[52vmax] w-[52vmax] rounded-full animate-drift-a blur-[130px]"
      style={{
        animationDelay: "-8s",
        background:
          "radial-gradient(circle at 50% 50%, hsl(var(--accent) / 0.3), transparent 68%)",
      }}
    />
  </div>
);

export default Aurora;
