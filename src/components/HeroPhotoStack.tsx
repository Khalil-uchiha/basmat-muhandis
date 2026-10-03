import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";

import Logo from "./Logo";
import { fetchHeroPhotos } from "@/lib/content";

const AUTOPLAY_MS = 4200;

/** Deterministic fan-out angle — Math.random() would twitch on every render. */
const tiltFor = (index: number) => ((index * 29) % 17) - 8;

/**
 * The stacked photo deck sitting beside the hero headline.
 *
 * Falls back to the club emblem while the deck is empty so the hero never has
 * a hole in it — the layout is identical either way.
 */
const HeroPhotoStack = () => {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  const { data: photos = [] } = useQuery({
    queryKey: ["hero-photos"],
    queryFn: fetchHeroPhotos,
  });

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
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* glow behind the deck */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[2rem] blur-[70px]"
        style={{ background: "radial-gradient(circle, hsl(var(--brand) / 0.4), transparent 70%)" }}
      />

      <AnimatePresence initial={false}>
        {photos.map((photo, index) => {
          const isActive = index === active;
          const offset = (index - active + photos.length) % photos.length;
          return (
            <motion.figure
              key={photo.id}
              initial={{ opacity: 0, scale: 0.92, rotate: tiltFor(index) }}
              animate={{
                opacity: isActive ? 1 : 0.4,
                scale: isActive ? 1 : 0.9 - Math.min(offset, 3) * 0.02,
                rotate: isActive ? 0 : tiltFor(index),
                x: isActive ? 0 : Math.min(offset, 3) * 10,
                y: isActive ? [0, -14, 0] : Math.min(offset, 3) * 8,
                zIndex: photos.length - offset,
              }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-0 m-auto h-full w-full origin-bottom"
            >
              <img
                src={photo.image_url}
                alt={photo.caption ?? ""}
                draggable={false}
                loading={index === 0 ? "eager" : "lazy"}
                className="h-full w-full rounded-[1.75rem] object-cover shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/10"
              />
              {/* readability wash under the caption */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 rounded-b-[1.75rem] bg-gradient-to-t from-ink/85 to-transparent"
              />
            </motion.figure>
          );
        })}
      </AnimatePresence>

      {/* caption + dots, pinned to the active card */}
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
