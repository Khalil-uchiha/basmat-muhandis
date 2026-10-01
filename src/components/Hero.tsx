import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight, MousePointerClick } from "lucide-react";
import { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import Logo from "./Logo";
import Aurora from "./background/Aurora";
import CircuitField from "./background/CircuitField";
import Magnetic from "./motion/Magnetic";
import { club } from "@/data/site";

const line = {
  hidden: { opacity: 0, y: 26, filter: "blur(8px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const Hero = () => {
  const { t } = useTranslation();
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // gentle parallax as the hero leaves the viewport
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 90]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);
  const emblemY = useTransform(scrollYProgress, [0, 1], [0, -60]);

  return (
    <section
      ref={ref}
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-ink text-white"
    >
      <Aurora />
      <div className="absolute inset-0">
        <CircuitField />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-40 mask-fade-b" />

      {/* Oversized emblem watermark */}
      <motion.div
        style={{ y: emblemY }}
        aria-hidden
        className="pointer-events-none absolute -end-24 top-1/2 hidden -translate-y-1/2 lg:block"
      >
        <Logo
          variant="white"
          className="h-[34rem] w-[34rem] animate-spin-slow opacity-[0.045]"
        />
      </motion.div>

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="container relative py-32"
      >
        <motion.div
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.11, delayChildren: 0.15 }}
          className="max-w-4xl"
        >
          {/* Badge */}
          <motion.div
            variants={line}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] py-1.5 pl-1.5 pr-4 backdrop-blur"
          >
            <Logo variant="white" className="h-6 w-6" />
            <span className="text-sm font-medium text-white/85" dir="rtl">
              {club.nameAr}
            </span>
            <span className="h-3.5 w-px bg-white/20" />
            <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-white/50">
              {t("hero.established", { year: club.founded })}
            </span>
          </motion.div>

          {/* Headline */}
          <h1 className="font-display text-[clamp(2.5rem,7vw,4.75rem)] font-bold leading-[1.04] tracking-[-0.02em]">
            <motion.span
              variants={line}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="block"
            >
              <span className="md:whitespace-nowrap">
                {t("hero.titleLead")}
                <span className="text-gradient">{t("hero.titleAccent")}</span>
              </span>
            </motion.span>
            <motion.span
              variants={line}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="block text-white/55"
            >
              {t("hero.titleSecond")}
            </motion.span>
          </h1>

          {/* Lede */}
          <motion.p
            variants={line}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg"
          >
{t("hero.lede")}
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={line}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <Magnetic strength={0.3}>
              <Link
                to="/contact"
                className="group inline-flex h-12 items-center gap-2 rounded-2xl bg-brand px-6 font-semibold text-white shadow-[0_16px_44px_-16px_hsl(var(--brand))] transition-colors duration-300 hover:bg-brand-bright"
              >
                {t("hero.ctaPrimary")}
                <ArrowUpRight
                  size={17}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </Magnetic>
            <Magnetic strength={0.25}>
              <Link
                to="/projects"
                className="group inline-flex h-12 items-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-6 font-semibold text-white backdrop-blur transition-colors duration-300 hover:border-white/30 hover:bg-white/[0.09]"
              >
                {t("hero.ctaSecondary")}
                <ArrowRight size={17} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Magnetic>
          </motion.div>

          {/* Hint that the background is alive */}
          <motion.p
            variants={line}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mt-9 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.16em] text-white/30"
          >
            <MousePointerClick size={13} /> {t("hero.hint")}
          </motion.p>
        </motion.div>
      </motion.div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.8 }}
        className="absolute inset-x-0 bottom-7 flex justify-center"
      >
        <div className="flex h-9 w-[22px] items-start justify-center rounded-full border border-white/20 p-1.5">
          <motion.span
            animate={{ y: [0, 9, 0], opacity: [1, 0.2, 1] }}
            transition={{ duration: 1.9, repeat: Infinity, ease: "easeInOut" }}
            className="h-1.5 w-1 rounded-full bg-brand-bright"
          />
        </div>
      </motion.div>
    </section>
  );
};

export default Hero;
