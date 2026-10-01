import Reveal from "@/components/motion/Reveal";

/** Eyebrow + title + optional lede, used at the top of every major section. */
const SectionHeading = ({
  eyebrow,
  title,
  lede,
  align = "center",
  className = "",
}: {
  eyebrow?: string;
  title: React.ReactNode;
  lede?: string;
  align?: "center" | "left";
  className?: string;
}) => (
  <Reveal className={`${align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"} ${className}`}>
    {eyebrow && (
      <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand/25 bg-brand/[0.07] px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-brand">
        <span className="h-1.5 w-1.5 rounded-full bg-brand" />
        {eyebrow}
      </span>
    )}
    <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-[2.75rem] md:leading-[1.1]">
      {title}
    </h2>
    {lede && <p className="mt-4 text-base leading-relaxed text-muted-foreground">{lede}</p>}
  </Reveal>
);

export default SectionHeading;
