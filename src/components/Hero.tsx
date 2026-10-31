import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Suspense, lazy, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import Logo from "./Logo";
import Backdrop from "./background/Backdrop";
import Magnetic from "./motion/Magnetic";
import { club } from "@/data/site";

/**
 * Deferred: this is the only thing in the hero that reaches for Supabase, and
 * pulling the SDK into the first-load bundle doubled it. The headline paints
 * immediately and the deck streams in behind the emblem placeholder.
 */
const HeroPhotoStack = lazy(() => import("./HeroPhotoStack"));

// Opacity and transform only. Animating `filter` here left the headline
// visibly soft while it settled and forced a repaint on every frame.
const line = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0 },
};

const Hero = () => {
  const { t } = useTranslation();
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  // The hero is a pinned stage: the section is taller than the viewport and
  // its content sticks while the visitor scrolls through it. Progress runs
  // 0→1 across that pinned stretch and drives the 3D camera and arm.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // Smoothed copy of the progress for the DOM layers. Deriving opacity
  // straight from useScroll lets Framer hand it to a native scroll timeline,
  // which proved unreliable; a spring keeps it on Framer's own loop and
  // takes the edge off fast flicks.
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 26, mass: 0.35 });

  // Copy and photo deck hand the stage to the robot in the first half…
  const contentY = useTransform(smooth, [0, 0.6], [0, -70]);
  const contentOpacity = useTransform(smooth, [0.12, 0.5], [1, 0]);
  const contentEvents = useTransform(contentOpacity, (v) => (v < 0.15 ? "none" : "auto"));
  const deckY = useTransform(smooth, [0, 0.6], [0, -50]);
  const cueOpacity = useTransform(smooth, [0, 0.08], [1, 0]);
  // …and a short closing line arrives while the camera finishes its move.
  const stageOpacity = useTransform(smooth, [0.55, 0.78, 0.96, 1], [0, 1, 1, 0.6]);
  const stageY = useTransform(smooth, [0.55, 0.8], [30, 0]);

  return (
    <section
      ref={ref}
      // Reduced-motion visitors get an ordinary hero: no pin, no long scroll.
      className={`relative bg-ink text-white ${reduceMotion ? "" : "h-[185svh]"}`}
    >
      <div className="sticky top-0 flex h-[100svh] min-h-[620px] items-center overflow-hidden">
      <Backdrop tone="hero" progress={scrollYProgress} />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity, pointerEvents: contentEvents }}
        className="container relative py-24 sm:py-32"
      >
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
        <motion.div
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.07, delayChildren: 0.05 }}
          className="max-w-2xl lg:max-w-none"
        >
          {/* Badge */}
          <motion.div
            variants={line}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
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
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="block"
            >
              <span className="md:whitespace-nowrap">
                {t("hero.titleLead")}
                <span className="text-gradient">{t("hero.titleAccent")}</span>
              </span>
            </motion.span>
            <motion.span
              variants={line}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              className="block text-white/55"
            >
              {t("hero.titleSecond")}
            </motion.span>
          </h1>

          {/* Lede */}
          <motion.p
            variants={line}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 max-w-xl text-base leading-relaxed text-white/60 sm:text-lg"
          >
{t("hero.lede")}
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={line}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
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
        </motion.div>

        {/* Photo deck — right on desktop, below the copy on phones */}
        <motion.div
          style={{ y: deckY }}
          initial={{ opacity: 0, scale: 0.94, x: 30 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto w-full max-w-sm lg:mx-0 lg:h-[26rem] lg:max-w-none"
        >
          <Suspense fallback={null}>
            <HeroPhotoStack />
          </Suspense>
        </motion.div>
        </div>
      </motion.div>

      {/* Closing line, shown once the camera has moved in on the arm */}
      {!reduceMotion && (
        <motion.div
          style={{ opacity: stageOpacity, y: stageY }}
          className="pointer-events-none absolute inset-x-0 bottom-16 sm:bottom-20"
        >
          <div className="container">
            <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-brand-bright">
              {t("hero.stageEyebrow")}
            </p>
            <p className="mt-3 max-w-xl font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
              {t("hero.stageLine")}
            </p>
          </div>
        </motion.div>
      )}

      {/* Scroll cue */}
      <motion.div
        style={{ opacity: cueOpacity }}
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
      </div>
    </section>
  );
};

export default Hero;
