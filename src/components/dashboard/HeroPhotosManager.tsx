import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, Sparkles, Trash2, Upload } from "lucide-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { HERO_LIMIT, createHeroPhoto, deletePhoto, fetchHeroPhotos } from "@/lib/content";
import { describeError } from "@/lib/errors";

const MAX_MB = 10;

const HeroPhotosManager = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const [caption, setCaption] = useState("");
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ["hero-photos"],
    queryFn: fetchHeroPhotos,
  });

  const remaining = HERO_LIMIT - photos.length;

  const reset = () => {
    setFiles([]);
    setCaption("");
    if (fileInput.current) fileInput.current.value = "";
  };

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["hero-photos"] });
    queryClient.invalidateQueries({ queryKey: ["photos"] });
  };

  const upload = useMutation({
    mutationFn: async () => {
      let done = 0;
      setProgress({ done: 0, total: files.length });
      for (const file of files) {
        await createHeroPhoto(file, caption.trim() || null);
        done += 1;
        setProgress({ done, total: files.length });
      }
      return done;
    },
    onSuccess: (count) => {
      refresh();
      toast({ title: t("dashboard.photos.uploaded", { count }) });
      reset();
    },
    onError: (error) =>
      toast({
        title: t("dashboard.photos.uploadError"),
        description: describeError(error),
        variant: "destructive",
      }),
    onSettled: () => setProgress(null),
  });

  const removal = useMutation({
    mutationFn: deletePhoto,
    onSuccess: () => {
      refresh();
      toast({ title: t("dashboard.photos.deleted") });
    },
    onError: (error) =>
      toast({ title: t("common.error"), description: describeError(error), variant: "destructive" }),
  });

  const pickFiles = (list: FileList | null) => {
    if (!list) return;
    const accepted: File[] = [];
    for (const file of Array.from(list)) {
      if (file.size > MAX_MB * 1024 * 1024) {
        toast({
          title: t("dashboard.photos.tooLarge", { name: file.name, max: MAX_MB }),
          variant: "destructive",
        });
        continue;
      }
      // Never let the deck exceed its slot count.
      if (accepted.length >= remaining) {
        toast({ title: t("dashboard.hero.full", { max: HERO_LIMIT }), variant: "destructive" });
        break;
      }
      accepted.push(file);
    }
    setFiles(accepted);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (files.length === 0) {
      toast({ title: t("dashboard.photos.filesRequired"), variant: "destructive" });
      return;
    }
    upload.mutate();
  };

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">{t("dashboard.hero.title")}</h2>
          <p className="mt-1 max-w-xl text-sm text-muted-foreground">{t("dashboard.hero.subtitle")}</p>
        </div>
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] ${
            remaining === 0 ? "bg-accent/15 text-accent" : "bg-brand/10 text-brand"
          }`}
        >
          <Sparkles size={13} />
          {photos.length} / {HERO_LIMIT}
        </span>
      </div>

      {/* Live order preview */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {Array.from({ length: HERO_LIMIT }).map((_, slot) => {
          const photo = photos[slot];
          if (isLoading) {
            return <div key={slot} className="aspect-[4/5] animate-pulse rounded-2xl bg-muted" />;
          }
          if (!photo) {
            return (
              <div
                key={slot}
                className="flex aspect-[4/5] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border text-muted-foreground/50"
              >
                <ImagePlus size={20} />
                <span className="font-mono text-[10px]">{slot + 1}</span>
              </div>
            );
          }
          return (
            <figure
              key={photo.id}
              className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-border/70"
            >
              <img src={photo.image_url} alt={photo.caption ?? ""} className="h-full w-full object-cover" />
              <span className="absolute start-2 top-2 inline-flex h-6 w-6 items-center justify-center rounded-md bg-ink/70 font-mono text-[10px] text-white backdrop-blur">
                {slot + 1}
              </span>
              {photo.caption && (
                <figcaption
                  dir="auto"
                  className="absolute inset-x-0 bottom-0 line-clamp-2 bg-gradient-to-t from-ink/90 to-transparent p-2 text-[11px] text-white"
                >
                  {photo.caption}
                </figcaption>
              )}
              <button
                onClick={() => {
                  if (window.confirm(t("dashboard.photos.confirmDelete"))) removal.mutate(photo);
                }}
                aria-label={t("dashboard.members.delete")}
                className="absolute end-2 top-2 inline-flex h-7 w-7 items-center justify-center rounded-md bg-ink/70 text-white opacity-0 backdrop-blur transition-all duration-300 hover:bg-destructive group-hover:opacity-100"
              >
                <Trash2 size={13} />
              </button>
            </figure>
          );
        })}
      </div>

      {/* Uploader */}
      <form onSubmit={submit} className="mt-8 rounded-2xl border border-border/70 bg-card p-6">
        {remaining === 0 ? (
          <p className="text-sm text-muted-foreground">{t("dashboard.hero.full", { max: HERO_LIMIT })}</p>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="hero-files">
                {t("dashboard.photos.files")} <span className="text-brand">*</span>
              </Label>
              <Input
                ref={fileInput}
                id="hero-files"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => pickFiles(e.target.files)}
                className="file:me-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1 file:text-xs file:font-medium"
              />
              <p className="text-xs text-muted-foreground">
                {t("dashboard.hero.slotsLeft", { count: remaining })}
              </p>
            </div>

            <div className="mt-5 space-y-2">
              <Label htmlFor="hero-caption">{t("dashboard.photos.caption")}</Label>
              <Input
                id="hero-caption"
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder={t("dashboard.hero.captionPlaceholder")}
              />
            </div>

            {files.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {files.map((file) => (
                  <span
                    key={file.name}
                    className="max-w-[14rem] truncate rounded-lg border border-border/70 bg-muted px-2.5 py-1 font-mono text-[11px] text-muted-foreground"
                  >
                    {file.name}
                  </span>
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={upload.isPending}
              className="mt-7 inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-bright disabled:opacity-60"
            >
              {upload.isPending ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
              {progress
                ? t("dashboard.photos.uploading", { done: progress.done, total: progress.total })
                : t("dashboard.photos.upload")}
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default HeroPhotosManager;
