import { useQuery } from "@tanstack/react-query";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import { useCallback, useEffect, useState } from "react";

import Logo from "./Logo";
import { fetchHeroPhotos } from "@/lib/content";

const AUTOPLAY_MS = 4200;

/** Deterministic fan-out angle — Math.random() would twitch on every render. */
const tiltFor = (index: number) => ((index * 29) % 17) - 8;

/** How far back each card sits behind the active one, in px of Z. */
const DEPTH_STEP = 55;
const MAX_DEPTH = 3;

/**
 * The stacked photo deck beside the hero headline.
 *
 * The whole deck is a single 3D object: the cards are separated along Z inside
 * a shared perspective, and the group rotates toward the cursor so the parallax
 * between cards is real rather than painted on. Falls back to the club emblem
 * while empty so the hero composition never has a hole in it.
 */
const HeroPhotoStack = () => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const reduceMotion = useReducedMotion();

  const { data: photos = [] } = useQuery({
    queryKey: ["hero-photos"],
    queryFn: fetchHeroPhotos,
  });

  /* ----------------------------------------------------- cursor-driven tilt */

  // Normalised pointer position over the deck, 0..1 on each axis.
  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);

  const spring = { stiffness: 140, damping: 16, mass: 0.6 };
  const rotateX = useSpring(useTransform(py, [0, 1], [14, -14]), spring);
  const rotateY = useSpring(useTransform(px, [0, 1], [-18, 18]), spring);

  // Specular highlight that tracks the pointer across the front card.
  const sheenX = useTransform(px, (v) => `${v * 100}%`);
  const sheenY = useTransform(py, (v) => `${v * 100}%`);
  const sheen = useMotionTemplate`radial-gradient(420px circle at ${sheenX} ${sheenY}, rgba(255,255,255,0.22), transparent 55%)`;

  const handleMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (reduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    px.set((e.clientX - rect.left) / rect.width);
    py.set((e.clientY - rect.top) / rect.height);
  };

  const resetTilt = () => {
    px.set(0.5);
    py.set(0.5);
  };

  /* ------------------------------------------------------------- autoplay */

  const step = useCallback(
    (delta: number) => setActive((i) => (i + delta + photos.length) % photos.length),
    [photos.length]
  );

  useEffect(() => setActive(0), [photos.length]);

  useEffect(() => {
    if (paused || photos.length < 2) return;
    const id = window.setInterval(() => step(1), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [paused, photos.length, step]);

  // Empty deck → the emblem keeps the composition balanced.
  if (photos.length === 0) {
    return (
      <div aria-hidden className="relative flex h-full w-full items-center justify-center">
        <div
          className="absolute h-[70%] w-[70%] rounded-full blur-[80px]"
          style={{ background: "radial-gradient(circle, hsl(var(--brand) / 0.35), transparent 70%)" }}
        />
        <Logo
          variant="white"
          className="relative h-48 w-48 animate-float-y opacity-20 sm:h-64 sm:w-64 lg:h-80 lg:w-80"
        />
      </div>
    );
  }

  const current = photos[active];

  return (
    <div
      className="relative h-full w-full"
      style={{ perspective: 1400 }}
      onPointerMove={handleMove}
      onPointerLeave={() => {
        resetTilt();
        setPaused(false);
      }}
      onPointerEnter={() => setPaused(true)}
    >
      {/* glow sits outside the 3D group so it doesn't tilt with the cards */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[2rem] blur-[70px]"
        style={{ background: "radial-gradient(circle, hsl(var(--brand) / 0.4), transparent 70%)" }}
      />

      <motion.div
        style={{
          rotateX: reduceMotion ? 0 : rotateX,
          rotateY: reduceMotion ? 0 : rotateY,
          transformStyle: "preserve-3d",
        }}
        className="relative h-full w-full"
      >
        <AnimatePresence initial={false}>
          {photos.map((photo, index) => {
            const isActive = index === active;
            const offset = (index - active + photos.length) % photos.length;
            const depth = Math.min(offset, MAX_DEPTH);

            return (
              <motion.figure
                key={photo.id}
                initial={{ opacity: 0, scale: 0.92, rotate: tiltFor(index), z: -200 }}
                animate={{
                  opacity: isActive ? 1 : 0.45 - depth * 0.07,
                  scale: isActive ? 1 : 0.94,
                  rotate: isActive ? 0 : tiltFor(index),
                  // Real depth: each card sits further back inside the shared
                  // perspective, so the tilt produces genuine parallax.
                  z: isActive ? 0 : -depth * DEPTH_STEP,
                  x: isActive ? 0 : depth * 12,
                  y: isActive ? [0, -12, 0] : depth * 10,
                  zIndex: photos.length - offset,
                }}
                exit={{ opacity: 0, scale: 0.92, z: -200 }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0 m-auto h-full w-full origin-bottom [transform-style:preserve-3d]"
              >
                <img
                  src={photo.image_url}
                  alt={photo.caption ?? ""}
                  draggable={false}
                  loading={index === 0 ? "eager" : "lazy"}
                  className="h-full w-full rounded-[1.75rem] object-cover shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/10"
                />

                {/* edge light — sells the card as a physical surface */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-white/15"
                />

                {/* specular highlight, front card only */}
                {isActive && !reduceMotion && (
                  <motion.span
                    aria-hidden
                    style={{ background: sheen }}
                    className="pointer-events-none absolute inset-0 rounded-[1.75rem] mix-blend-overlay"
                  />
                )}

                {/* readability wash under the caption */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 rounded-b-[1.75rem] bg-gradient-to-t from-ink/85 to-transparent"
                />
              </motion.figure>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {/* caption + dots stay flat so text never skews */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-50 p-5">
        <AnimatePresence mode="wait">
          {current.caption && (
            <motion.p
              key={current.id}
              dir="auto"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="mb-3 line-clamp-2 text-sm font-medium text-white/90 drop-shadow"
            >
              {current.caption}
            </motion.p>
          )}
        </AnimatePresence>

        {photos.length > 1 && (
          <div className="pointer-events-auto flex gap-1.5">
            {photos.map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => setActive(index)}
                aria-label={`${index + 1}`}
                className={`h-1 rounded-full transition-all duration-500 ${
                  index === active ? "w-7 bg-white" : "w-3 bg-white/35 hover:bg-white/60"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroPhotoStack;
