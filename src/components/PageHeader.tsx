import { motion } from "framer-motion";

import Aurora from "./background/Aurora";
import CircuitField from "./background/CircuitField";

/** Shared masthead for every inner page. */
const PageHeader = ({
  eyebrow,
  title,
  lede,
}: {
  eyebrow: string;
  title: string;
  lede: string;
}) => (
  <section className="relative overflow-hidden bg-ink pb-20 pt-36 text-white sm:pb-24 sm:pt-44">
    <Aurora className="opacity-70" />
    <div className="absolute inset-0 opacity-60">
      <CircuitField />
    </div>
    <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-40 mask-fade-b" />

    <div className="container relative">
      <motion.span
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-3.5 py-1 font-mono text-[11px] uppercase tracking-[0.18em] text-white/70 backdrop-blur"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-brand-bright" />
        {eyebrow}
      </motion.span>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="mt-5 font-display text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl"
      >
        {title}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.16, ease: [0.22, 1, 0.36, 1] }}
        className="mt-5 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg"
      >
        {lede}
      </motion.p>
    </div>
  </section>
);

export default PageHeader;
