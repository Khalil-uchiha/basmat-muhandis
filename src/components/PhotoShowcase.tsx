import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CalendarDays } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import SectionHeading from "./SectionHeading";
import Reveal from "./motion/Reveal";
import { type Photo, fetchPhotos } from "@/lib/content";

const MAX_CARDS = 6;
const AUTOPLAY_MS = 5200;

/**
 * Deterministic tilt per card. Math.random() here would reshuffle on every
 * render and make the stack twitch, so the angle is derived from the index.
 */
const tiltFor = (index: number) => ((index * 37) % 21) - 10;

const formatDate = (value: string | null, locale: string) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(date);
};

/**
 * Stacked photo carousel for the landing page — the club's own event photos,
 * pulled from the same gallery the dashboard uploads to.
 */
const PhotoShowcase = () => {
  const { t, i18n } = useTranslation();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const { data: photos = [] } = useQuery({ queryKey: ["photos"], queryFn: fetchPhotos });

  // One photo per album keeps the stack varied instead of six shots of one night.
  const cards = useMemo(() => {
    const seen = new Set<string>();
    const picked: Photo[] = [];
    for (const photo of photos) {
      if (seen.has(photo.album)) continue;
      seen.add(photo.album);
      picked.push(photo);
      if (picked.length === MAX_CARDS) break;
    }
    // Fall back to simply the newest photos when everything shares one album.
    return picked.length > 1 ? picked : photos.slice(0, MAX_CARDS);
  }, [photos]);

  const step = useCallback(
    (delta: number) => setActive((i) => (i + delta + cards.length) % cards.length),
    [cards.length]
  );

  useEffect(() => setActive(0), [cards.length]);

  useEffect(() => {
    if (paused || cards.length < 2) return;
    const id = window.setInterval(() => step(1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, cards.length, step]);

  // Nothing uploaded yet — stay out of the way rather than show a hole.
  if (cards.length === 0) return null;

  const current = cards[active];
  const date = formatDate(current.taken_on ?? current.created_at, i18n.resolvedLanguage || "en");
  const isRtl = i18n.dir() === "rtl";

  return (
    <section className="relative overflow-hidden py-24 sm:py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[32rem] w-[80%] -translate-x-1/2 rounded-full blur-[130px]"
        style={{ background: "radial-gradient(circle, hsl(var(--brand) / 0.16), transparent 70%)" }}
      />

      <div className="container relative">
        <SectionHeading
          eyebrow={t("home.momentsEyebrow")}
          title={
            <>
              {t("home.momentsTitleLead")}
              <span className="text-gradient">{t("home.momentsTitleAccent")}</span>
            </>
          }
          lede={t("home.momentsLede")}
        />

        <Reveal className="mt-16">
          <div
            className="grid gap-12 md:grid-cols-2 md:gap-16"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            {/* Stack */}
            <div className="relative h-80 w-full sm:h-96">
              <AnimatePresence initial={false}>
                {cards.map((photo, index) => {
                  const isActive = index === active;
                  return (
                    <motion.div
                      key={photo.id}
                      initial={{ opacity: 0, scale: 0.9, z: -100, rotate: tiltFor(index) }}
                      animate={{
                        opacity: isActive ? 1 : 0.65,
                        scale: isActive ? 1 : 0.94,
                        z: isActive ? 0 : -100,
                        rotate: isActive ? 0 : tiltFor(index),
                        zIndex: isActive ? 40 : cards.length - Math.abs(index - active),
                        y: isActive ? [0, -40, 0] : 0,
                      }}
                      exit={{ opacity: 0, scale: 0.9, rotate: tiltFor(index) }}
                      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                      className="absolute inset-0 origin-bottom"
                    >
                      <img
                        src={photo.image_url}
                        alt={photo.caption ?? photo.album}
                        draggable={false}
                        loading={index === 0 ? "eager" : "lazy"}
                        className="h-full w-full rounded-3xl object-cover shadow-[0_28px_70px_-28px_hsl(var(--brand)/0.6)]"
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Caption + controls */}
            <div className="flex flex-col justify-between py-2">
              <AnimatePresence mode="wait">
                <motion.div
                  key={current.id}
                  initial={{ y: 18, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -18, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* dir="auto": album names and captions are often written in a
                      different script from the active UI language. */}
                  <h3 dir="auto" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                    {current.album}
                  </h3>

                  {date && (
                    <p className="mt-2.5 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-brand">
                      <CalendarDays size={13} /> {date}
                    </p>
                  )}

                  {current.caption && (
                    <motion.p dir="auto" className="mt-5 text-lg leading-relaxed text-muted-foreground">
                      {current.caption.split(" ").map((word, i) => (
                        <motion.span
                          key={`${word}-${i}`}
                          initial={{ filter: "blur(8px)", opacity: 0, y: 6 }}
                          animate={{ filter: "blur(0px)", opacity: 1, y: 0 }}
                          transition={{
                            duration: 0.22,
                            ease: "easeInOut",
                            delay: 0.015 * i,
                          }}
                          className="inline-block"
                        >
                          {word}&nbsp;
                        </motion.span>
                      ))}
                    </motion.p>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="mt-10 flex items-center gap-3">
                <button
                  onClick={() => step(-1)}
                  aria-label={t("gallery.previous")}
                  className="group inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card transition-colors hover:border-brand/40 hover:bg-brand/5"
                >
                  <ArrowLeft
                    size={17}
                    className={`text-muted-foreground transition-transform duration-300 group-hover:text-brand ${
                      isRtl ? "rotate-180 group-hover:translate-x-0.5" : "group-hover:-translate-x-0.5"
                    }`}
                  />
                </button>
                <button
                  onClick={() => step(1)}
                  aria-label={t("gallery.next")}
                  className="group inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-card transition-colors hover:border-brand/40 hover:bg-brand/5"
                >
                  <ArrowRight
                    size={17}
                    className={`text-muted-foreground transition-transform duration-300 group-hover:text-brand ${
                      isRtl ? "rotate-180 group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"
                    }`}
                  />
                </button>

                {/* Progress dots */}
                <div className="ms-2 flex items-center gap-1.5">
                  {cards.map((photo, index) => (
                    <button
                      key={photo.id}
                      onClick={() => setActive(index)}
                      aria-label={`${index + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        index === active ? "w-6 bg-brand" : "w-1.5 bg-border hover:bg-muted-foreground/50"
                      }`}
                    />
                  ))}
                </div>

                <Link
                  to="/gallery"
                  className="ms-auto inline-flex items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-bright"
                >
                  {t("home.momentsCta")}
                  <ArrowRight size={15} className="rtl:rotate-180" />
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
};

export default PhotoShowcase;
