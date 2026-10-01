import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, Loader2, Pencil, Plus, Trash2, UserPlus, X } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  type Member,
  type MemberInput,
  createMember,
  deleteMember,
  fetchMembers,
  reorderMembers,
  updateMember,
  uploadToStorage,
} from "@/lib/content";

const blank: MemberInput = {
  name: "",
  role: "",
  bio: null,
  photo_url: null,
  facebook: null,
  instagram: null,
  linkedin: null,
  sort_order: 0,
};

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

const MemberForm = ({
  initial,
  nextOrder,
  onDone,
  onCancel,
}: {
  initial: Member | null;
  nextOrder: number;
  onDone: () => void;
  onCancel: () => void;
}) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState<MemberInput>(
    initial
      ? { ...initial }
      : { ...blank, sort_order: nextOrder }
  );
  const [uploading, setUploading] = useState(false);

  const set = (key: keyof MemberInput) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value === "" ? null : value }));

  const mutation = useMutation({
    mutationFn: async () => {
      if (!form.name.trim() || !form.role.trim()) throw new Error("validation");
      return initial ? updateMember(initial.id, form) : createMember(form);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast({ title: t(initial ? "dashboard.members.updated" : "dashboard.members.added") });
      onDone();
    },
    onError: (error: Error) => {
      toast({
        title: error.message === "validation" ? t("dashboard.members.nameRequired") : t("common.error"),
        variant: "destructive",
      });
    },
  });

  const handlePhoto = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const { url } = await uploadToStorage(file, "members");
      setForm((f) => ({ ...f, photo_url: url }));
    } catch {
      toast({ title: t("dashboard.photos.uploadError"), variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate();
      }}
      className="overflow-hidden"
    >
      <div className="rounded-2xl border border-brand/25 bg-card p-6">
        <h3 className="font-display text-lg font-semibold">
          {t(initial ? "dashboard.members.edit" : "dashboard.members.add")}
        </h3>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="m-name">
              {t("dashboard.members.name")} <span className="text-brand">*</span>
            </Label>
            <Input
              id="m-name"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="m-role">
              {t("dashboard.members.role")} <span className="text-brand">*</span>
            </Label>
            <Input
              id="m-role"
              value={form.role}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
            />
          </div>
        </div>

        <div className="mt-5 space-y-2">
          <Label htmlFor="m-bio">{t("dashboard.members.bio")}</Label>
          <Textarea
            id="m-bio"
            rows={2}
            value={form.bio ?? ""}
            onChange={(e) => set("bio")(e.target.value)}
          />
        </div>

        <div className="mt-5 space-y-2">
          <Label htmlFor="m-photo">{t("dashboard.members.photo")}</Label>
          <div className="flex items-center gap-4">
            {form.photo_url ? (
              <img
                src={form.photo_url}
                alt=""
                className="h-16 w-16 rounded-xl object-cover ring-1 ring-border"
              />
            ) : (
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-brand/10 font-display font-bold text-brand ring-1 ring-inset ring-brand/20">
                {initials(form.name) || "?"}
              </div>
            )}
            <div className="flex-1">
              <Input
                id="m-photo"
                type="file"
                accept="image/*"
                disabled={uploading}
                onChange={(e) => handlePhoto(e.target.files?.[0])}
                className="file:me-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1 file:text-xs file:font-medium"
              />
              <p className="mt-1.5 text-xs text-muted-foreground">
                {uploading ? t("common.loading") : t("dashboard.members.photoHint")}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          {(["facebook", "instagram", "linkedin"] as const).map((key) => (
            <div key={key} className="space-y-2">
              <Label htmlFor={`m-${key}`}>{t(`dashboard.members.${key}`)}</Label>
              <Input
                id={`m-${key}`}
                value={form[key] ?? ""}
                onChange={(e) => set(key)(e.target.value)}
                placeholder="https://"
              />
            </div>
          ))}
        </div>

        <div className="mt-7 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={mutation.isPending || uploading}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-bright disabled:opacity-60"
          >
            {mutation.isPending && <Loader2 size={15} className="animate-spin" />}
            {t(mutation.isPending ? "dashboard.members.saving" : "dashboard.members.save")}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex h-10 items-center rounded-xl border border-border px-5 text-sm font-semibold transition-colors hover:bg-muted"
          >
            {t("dashboard.members.cancel")}
          </button>
        </div>
      </div>
    </motion.form>
  );
};

const MembersManager = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Member | null>(null);
  const [adding, setAdding] = useState(false);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: fetchMembers,
  });

  const removal = useMutation({
    mutationFn: deleteMember,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
      toast({ title: t("dashboard.members.deleted") });
    },
    onError: () => toast({ title: t("common.error"), variant: "destructive" }),
  });

  const ordering = useMutation({
    mutationFn: reorderMembers,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["members"] }),
    onError: () => toast({ title: t("common.error"), variant: "destructive" }),
  });

  const move = (index: number, delta: number) => {
    const target = index + delta;
    if (target < 0 || target >= members.length) return;
    const next = [...members];
    [next[index], next[target]] = [next[target], next[index]];
    ordering.mutate(next);
  };

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight">
            {t("dashboard.members.title")}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">{t("dashboard.members.subtitle")}</p>
        </div>
        {!adding && !editing && (
          <button
            onClick={() => setAdding(true)}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-white transition-colors hover:bg-brand-bright"
          >
            <Plus size={16} /> {t("dashboard.members.add")}
          </button>
        )}
      </div>

      <AnimatePresence>
        {(adding || editing) && (
          <div className="mt-6">
            <MemberForm
              key={editing?.id ?? "new"}
              initial={editing}
              nextOrder={members.length}
              onDone={() => {
                setAdding(false);
                setEditing(null);
              }}
              onCancel={() => {
                setAdding(false);
                setEditing(null);
              }}
            />
          </div>
        )}
      </AnimatePresence>

      <p className="mt-6 text-xs text-muted-foreground">{t("dashboard.members.orderHint")}</p>

      <div className="mt-3 space-y-2.5">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
          ))
        ) : members.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border py-16 text-center">
            <UserPlus className="mx-auto mb-3 text-muted-foreground/50" size={30} />
            <p className="text-sm text-muted-foreground">{t("dashboard.members.empty")}</p>
          </div>
        ) : (
          members.map((m, i) => (
            <div
              key={m.id}
              className="flex items-center gap-4 rounded-2xl border border-border/70 bg-card p-4"
            >
              <div className="flex flex-col">
                <button
                  onClick={() => move(i, -1)}
                  disabled={i === 0 || ordering.isPending}
                  aria-label={t("dashboard.members.moveUp")}
                  className="rounded p-0.5 text-muted-foreground transition-colors hover:text-brand disabled:opacity-25"
                >
                  <ChevronUp size={16} />
                </button>
                <button
                  onClick={() => move(i, 1)}
                  disabled={i === members.length - 1 || ordering.isPending}
                  aria-label={t("dashboard.members.moveDown")}
                  className="rounded p-0.5 text-muted-foreground transition-colors hover:text-brand disabled:opacity-25"
                >
                  <ChevronDown size={16} />
                </button>
              </div>

              {m.photo_url ? (
                <img src={m.photo_url} alt="" className="h-12 w-12 rounded-xl object-cover" />
              ) : (
                <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-sm font-display font-bold text-brand ring-1 ring-inset ring-brand/20">
                  {initials(m.name)}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="truncate font-display font-semibold">{m.name}</p>
                <p className="truncate font-mono text-[11px] uppercase tracking-[0.14em] text-brand">
                  {m.role}
                </p>
              </div>

              {i < 2 && (
                <span className="hidden rounded-full bg-accent/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-accent sm:inline">
                  {t("teamPage.board")}
                </span>
              )}

              <button
                onClick={() => {
                  setAdding(false);
                  setEditing(m);
                }}
                aria-label={t("dashboard.members.edit")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Pencil size={15} />
              </button>
              <button
                onClick={() => {
                  if (window.confirm(t("dashboard.members.confirmDelete", { name: m.name }))) {
                    removal.mutate(m);
                  }
                }}
                aria-label={t("dashboard.members.delete")}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MembersManager;
