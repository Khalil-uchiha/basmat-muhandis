import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, ImageOff, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/motion/Reveal";
import { type Photo, fetchPhotos, groupIntoAlbums } from "@/lib/content";

const ALL = "__all__";

const Lightbox = ({
  photos,
  index,
  onClose,
  onStep,
}: {
  photos: Photo[];
  index: number;
  onClose: () => void;
  onStep: (delta: number) => void;
}) => {
  const { t } = useTranslation();
  const photo = photos[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onStep(1);
      if (e.key === "ArrowLeft") onStep(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onStep]);

  if (!photo) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/95 backdrop-blur-xl"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        aria-label={t("gallery.close")}
        className="absolute end-5 top-5 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/15 bg-white/[0.06] text-white transition-colors hover:bg-white/15"
      >
        <X size={20} />
      </button>

      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStep(-1);
            }}
            aria-label={t("gallery.previous")}
            className="absolute start-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white transition-colors hover:bg-white/15 sm:start-8"
          >
            <ChevronLeft size={22} className="rtl:rotate-180" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStep(1);
            }}
            aria-label={t("gallery.next")}
            className="absolute end-4 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-white transition-colors hover:bg-white/15 sm:end-8"
          >
            <ChevronRight size={22} className="rtl:rotate-180" />
          </button>
        </>
      )}

      <motion.figure
        key={photo.id}
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto flex max-h-[86vh] max-w-5xl flex-col items-center px-14 sm:px-20"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={photo.image_url}
          alt={photo.caption ?? photo.album}
          className="max-h-[72vh] w-auto rounded-2xl object-contain shadow-2xl"
        />
        <figcaption className="mt-5 text-center">
          <p className="font-display text-sm font-semibold text-white">{photo.album}</p>
          {photo.caption && <p className="mt-1 text-sm text-white/60">{photo.caption}</p>}
          <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.16em] text-white/35">
            {t("gallery.counter", { current: index + 1, total: photos.length })}
          </p>
        </figcaption>
      </motion.figure>
    </motion.div>
  );
};

const Gallery = () => {
  const { t } = useTranslation();
  const [album, setAlbum] = useState<string>(ALL);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ["photos"],
    queryFn: fetchPhotos,
  });

  const albums = useMemo(() => groupIntoAlbums(photos), [photos]);
  const visible = useMemo(
    () => (album === ALL ? photos : photos.filter((p) => p.album === album)),
    [photos, album]
  );

  const step = useCallback(
    (delta: number) =>
      setLightbox((current) =>
        current === null ? null : (current + delta + visible.length) % visible.length
      ),
    [visible.length]
  );

  // Changing album while the lightbox is open would point at the wrong photo.
  useEffect(() => setLightbox(null), [album]);

  return (
    <Layout>
      <PageHeader eyebrow={t("gallery.eyebrow")} title={t("gallery.title")} lede={t("gallery.lede")} />

      <section className="py-20 sm:py-24">
        <div className="container">
          {albums.length > 1 && (
            <Reveal className="mb-12 flex flex-wrap gap-2">
              {[{ name: ALL, count: photos.length }, ...albums.map((a) => ({ name: a.name, count: a.photos.length }))].map(
                (entry) => {
                  const active = album === entry.name;
                  return (
                    <button
                      key={entry.name}
                      onClick={() => setAlbum(entry.name)}
                      className={`relative rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                        active ? "text-white" : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="album-pill"
                          transition={{ type: "spring", stiffness: 380, damping: 32 }}
                          className="absolute inset-0 -z-10 rounded-xl bg-brand shadow-[0_10px_28px_-12px_hsl(var(--brand))]"
                        />
                      )}
                      {!active && (
                        <span className="absolute inset-0 -z-10 rounded-xl border border-border/70 bg-card" />
                      )}
                      {entry.name === ALL ? t("gallery.allAlbums") : entry.name}
                      <span className={`ms-2 font-mono text-[11px] ${active ? "text-white/70" : "text-muted-foreground"}`}>
                        {entry.count}
                      </span>
                    </button>
                  );
                }
              )}
            </Reveal>
          )}

          {isLoading ? (
            <div className="columns-2 gap-4 md:columns-3 lg:columns-4 [&>*]:mb-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl bg-muted"
                  style={{ height: `${160 + ((i * 47) % 130)}px` }}
                />
              ))}
            </div>
          ) : visible.length === 0 ? (
            <Reveal className="rounded-2xl border border-dashed border-border py-20 text-center">
              <ImageOff className="mx-auto mb-4 text-muted-foreground/50" size={34} />
              <p className="mx-auto max-w-sm text-sm text-muted-foreground">{t("gallery.empty")}</p>
            </Reveal>
          ) : (
            /* Masonry via CSS columns — keeps portrait and landscape shots uncropped */
            <div className="columns-2 gap-4 md:columns-3 lg:columns-4 [&>*]:mb-4">
              {visible.map((photo, i) => (
                <motion.button
                  key={photo.id}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, delay: Math.min(i, 8) * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setLightbox(i)}
                  className="group relative block w-full break-inside-avoid overflow-hidden rounded-2xl border border-border/70 bg-card"
                >
                  <img
                    src={photo.image_url}
                    alt={photo.caption ?? photo.album}
                    loading="lazy"
                    className="w-full transition-transform duration-700 ease-smooth group-hover:scale-[1.04]"
                  />
                  <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/5 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-4 text-start opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                    <span className="block font-display text-sm font-semibold text-white">{photo.album}</span>
                    {photo.caption && (
                      <span className="mt-0.5 block text-xs text-white/70">{photo.caption}</span>
                    )}
                  </span>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </section>

      <AnimatePresence>
        {lightbox !== null && (
          <Lightbox
            photos={visible}
            index={lightbox}
            onClose={() => setLightbox(null)}
            onStep={step}
          />
        )}
      </AnimatePresence>
    </Layout>
  );
};

export default Gallery;
