import { Facebook, Instagram, Linkedin, Loader2, Mail, MapPin, Send } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/motion/Reveal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { club } from "@/data/site";
import { useToast } from "@/hooks/use-toast";

const socials = [
  { icon: Facebook, href: club.social.facebook, label: "Facebook" },
  { icon: Instagram, href: club.social.instagram, label: "Instagram" },
  { icon: Linkedin, href: club.social.linkedin, label: "LinkedIn" },
];

const empty = { name: "", email: "", subject: "", message: "" };

const Contact = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [form, setForm] = useState(empty);
  const [sending, setSending] = useState(false);

  const set = (key: keyof typeof empty) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast({ title: t("contactPage.required"), variant: "destructive" });
      return;
    }
    setSending(true);
    // No backend yet — the form validates and confirms locally.
    await new Promise((r) => setTimeout(r, 700));
    setSending(false);
    toast({ title: t("contactPage.sent"), description: t("contactPage.sentDesc") });
    setForm(empty);
  };

  return (
    <Layout>
      <PageHeader
        eyebrow={t("contactPage.eyebrow")}
        title={t("contactPage.title")}
        lede={t("contactPage.lede")}
      />

      <section className="py-20 sm:py-24">
        <div className="container">
          <div className="grid gap-6 lg:grid-cols-5">
            {/* Form */}
            <Reveal className="lg:col-span-3">
              <form
                onSubmit={handleSubmit}
                className="card-glow rounded-2xl border border-border/70 bg-card p-7 sm:p-8"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="name">
                      {t("contactPage.name")} <span className="text-brand">*</span>
                    </Label>
                    <Input id="name" value={form.name} onChange={set("name")} placeholder={t("contactPage.namePlaceholder")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">
                      {t("contactPage.email")} <span className="text-brand">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={set("email")}
                      placeholder={t("contactPage.emailPlaceholder")}
                    />
                  </div>
                </div>
                <div className="mt-5 space-y-2">
                  <Label htmlFor="subject">{t("contactPage.subject")}</Label>
                  <Input
                    id="subject"
                    value={form.subject}
                    onChange={set("subject")}
                    placeholder={t("contactPage.subjectPlaceholder")}
                  />
                </div>
                <div className="mt-5 space-y-2">
                  <Label htmlFor="message">
                    {t("contactPage.message")} <span className="text-brand">*</span>
                  </Label>
                  <Textarea
                    id="message"
                    value={form.message}
                    onChange={set("message")}
                    placeholder={t("contactPage.messagePlaceholder")}
                    rows={6}
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="mt-7 inline-flex h-11 items-center gap-2 rounded-2xl bg-brand px-6 text-sm font-semibold text-white shadow-[0_14px_36px_-16px_hsl(var(--brand))] transition-colors hover:bg-brand-bright disabled:opacity-70"
                >
                  {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {sending ? t("contactPage.sending") : t("contactPage.send")}
                </button>
              </form>
            </Reveal>

            {/* Details */}
            <Reveal delay={0.12} className="lg:col-span-2">
              <div className="relative h-full overflow-hidden rounded-2xl bg-ink p-8 text-white">
                <div
                  aria-hidden
                  className="pointer-events-none absolute -end-20 -top-20 h-60 w-60 rounded-full blur-3xl"
                  style={{ background: "radial-gradient(circle, hsl(var(--brand) / 0.45), transparent 70%)" }}
                />
                <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-30" />

                <div className="relative">
                  <h3 className="font-display text-xl font-bold">{t("contactPage.getInTouch")}</h3>
                  <ul className="mt-6 space-y-4 text-sm">
                    <li>
                      <a
                        href={`mailto:${club.email}`}
                        className="group flex items-start gap-3 text-white/70 transition-colors hover:text-white"
                      >
                        <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] ring-1 ring-inset ring-white/10 transition-colors group-hover:bg-brand">
                          <Mail size={15} />
                        </span>
                        <span className="min-w-0 break-words pt-1.5">{club.email}</span>
                      </a>
                    </li>
                    <li className="flex items-start gap-3 text-white/70">
                      <span className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/[0.07] ring-1 ring-inset ring-white/10">
                        <MapPin size={15} />
                      </span>
                      <span className="pt-1.5">{club.location}</span>
                    </li>
                  </ul>

                  <h3 className="mt-10 font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">
                    {t("contactPage.followUs")}
                  </h3>
                  <div className="mt-4 flex gap-2">
                    {socials.map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-white/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand hover:bg-brand hover:text-white"
                      >
                        <s.icon size={17} />
                      </a>
                    ))}
                  </div>

                  <p className="mt-10 border-t border-white/10 pt-6 text-xs leading-relaxed text-white/40">
{t("contactPage.note")}
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
