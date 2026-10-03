import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, Loader2, Trash2, Upload } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { type Photo, createPhoto, deletePhoto, fetchPhotos, groupIntoAlbums } from "@/lib/content";
import { describeError } from "@/lib/errors";

const MAX_MB = 10;

const PhotosManager = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInput = useRef<HTMLInputElement>(null);

  const [album, setAlbum] = useState("");
  const [caption, setCaption] = useState("");
  const [takenOn, setTakenOn] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  const { data: photos = [], isLoading } = useQuery({ queryKey: ["photos"], queryFn: fetchPhotos });
  const albums = useMemo(() => groupIntoAlbums(photos), [photos]);

  const reset = () => {
    setFiles([]);
    setCaption("");
    if (fileInput.current) fileInput.current.value = "";
  };

  const upload = useMutation({
    mutationFn: async () => {
      let done = 0;
      setProgress({ done: 0, total: files.length });
      for (const file of files) {
        await createPhoto(file, {
          album: album.trim(),
          caption: caption.trim() || null,
          taken_on: takenOn || null,
        });
        done += 1;
        setProgress({ done, total: files.length });
      }
      return done;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
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
      queryClient.invalidateQueries({ queryKey: ["photos"] });
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
      accepted.push(file);
    }
    setFiles(accepted);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!album.trim()) {
      toast({ title: t("dashboard.photos.albumRequired"), variant: "destructive" });
      return;
    }
    if (files.length === 0) {
      toast({ title: t("dashboard.photos.filesRequired"), variant: "destructive" });
      return;
    }
    upload.mutate();
  };

  return (
    <div>
      <h2 className="font-display text-2xl font-bold tracking-tight">{t("dashboard.photos.title")}</h2>
      <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.photos.subtitle")}</p>

      {/* Upload form */}
      <form onSubmit={submit} className="mt-6 rounded-2xl border border-border/70 bg-card p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="p-album">
              {t("dashboard.photos.album")} <span className="text-brand">*</span>
            </Label>
            <Input
              id="p-album"
              list="album-suggestions"
              value={album}
              onChange={(e) => setAlbum(e.target.value)}
              placeholder={t("dashboard.photos.albumPlaceholder")}
            />
            <datalist id="album-suggestions">
              {albums.map((a) => (
                <option key={a.name} value={a.name} />
              ))}
            </datalist>
            <p className="text-xs text-muted-foreground">{t("dashboard.photos.albumHint")}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="p-date">{t("dashboard.photos.date")}</Label>
            <Input id="p-date" type="date" value={takenOn} onChange={(e) => setTakenOn(e.target.value)} />
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <Label htmlFor="p-caption">{t("dashboard.photos.caption")}</Label>
          <Input
            id="p-caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder={t("dashboard.photos.captionPlaceholder")}
          />
        </div>

        <div className="mt-5 space-y-2">
          <Label htmlFor="p-files">
            {t("dashboard.photos.files")} <span className="text-brand">*</span>
          </Label>
          <Input
            ref={fileInput}
            id="p-files"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => pickFiles(e.target.files)}
            className="file:me-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1 file:text-xs file:font-medium"
          />
          <p className="text-xs text-muted-foreground">{t("dashboard.photos.filesHint")}</p>
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
      </form>

      {/* Existing photos, newest album first */}
      <div className="mt-12 space-y-10">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="aspect-square animate-pulse rounded-xl bg-muted" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <ImagePlus className="mx-auto mb-3 text-muted-foreground/50" size={30} />
            <p className="text-sm text-muted-foreground">{t("dashboard.photos.empty")}</p>
          </div>
        ) : (
          albums.map((a) => (
            <section key={a.name}>
              <div className="mb-4 flex items-center gap-3">
                <h3 className="font-display font-semibold">{a.name}</h3>
                <span className="font-mono text-xs text-muted-foreground">
                  {t("gallery.photoCount", { count: a.photos.length })}
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
                {a.photos.map((photo: Photo) => (
                  <div
                    key={photo.id}
                    className="group relative aspect-square overflow-hidden rounded-xl border border-border/70 bg-muted"
                  >
                    <img
                      src={photo.image_url}
                      alt={photo.caption ?? a.name}
                      loading="lazy"
                      className="h-full w-full object-cover"
                    />
                    <button
                      onClick={() => {
                        if (window.confirm(t("dashboard.photos.confirmDelete"))) removal.mutate(photo);
                      }}
                      aria-label={t("dashboard.members.delete")}
                      className="absolute end-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-ink/70 text-white opacity-0 backdrop-blur transition-all duration-300 hover:bg-destructive group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </div>
  );
};

export default PhotosManager;
