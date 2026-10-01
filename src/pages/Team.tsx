import { useQuery } from "@tanstack/react-query";
import { Facebook, Instagram, Linkedin, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/motion/Reveal";
import TiltCard from "@/components/motion/TiltCard";
import { type Member, fetchMembers } from "@/lib/content";

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

const Socials = ({ member, tone = "muted" }: { member: Member; tone?: "muted" | "light" }) => {
  const links = [
    { icon: Facebook, href: member.facebook, label: "Facebook" },
    { icon: Instagram, href: member.instagram, label: "Instagram" },
    { icon: Linkedin, href: member.linkedin, label: "LinkedIn" },
  ].filter((l) => l.href && l.href !== "#");

  if (links.length === 0) return null;

  return (
    <div className="flex gap-1.5">
      {links.map((l) => (
        <a
          key={l.label}
          href={l.href as string}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${member.name} on ${l.label}`}
          className={`inline-flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-300 hover:-translate-y-0.5 hover:bg-brand hover:text-white ${
            tone === "light" ? "bg-white/10 text-white/70" : "bg-muted text-muted-foreground"
          }`}
        >
          <l.icon size={15} />
        </a>
      ))}
    </div>
  );
};

/** Photo when we have one, otherwise a brand-tinted monogram. */
const Avatar = ({ member, size }: { member: Member; size: "lg" | "md" }) => {
  const box = size === "lg" ? "h-24 w-24 text-2xl" : "h-20 w-20 text-xl";

  if (member.photo_url) {
    return (
      <img
        src={member.photo_url}
        alt={member.name}
        className={`${box} shrink-0 rounded-2xl object-cover ring-1 ring-border`}
      />
    );
  }

  return (
    <div
      className={`${box} inline-flex shrink-0 items-center justify-center rounded-2xl font-display font-bold text-brand ring-1 ring-inset ring-brand/20`}
      style={{ background: "linear-gradient(145deg, hsl(var(--brand) / 0.18), hsl(var(--brand) / 0.04))" }}
      aria-hidden
    >
      {initials(member.name)}
    </div>
  );
};

const Team = () => {
  const { t } = useTranslation();
  const { data: members = [], isLoading } = useQuery({
    queryKey: ["members"],
    queryFn: fetchMembers,
  });

  const board = members.slice(0, 2);
  const rest = members.slice(2);

  return (
    <Layout>
      <PageHeader
        eyebrow={t("teamPage.eyebrow")}
        title={t("teamPage.title")}
        lede={t("teamPage.lede")}
      />

      {isLoading ? (
        <section className="py-20 sm:py-24">
          <div className="container">
            <div className="grid gap-5 md:grid-cols-2">
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-60 animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          </div>
        </section>
      ) : members.length === 0 ? (
        <section className="py-24">
          <div className="container">
            <Reveal className="rounded-2xl border border-dashed border-border py-20 text-center">
              <Users className="mx-auto mb-4 text-muted-foreground/50" size={34} />
              <p className="text-sm text-muted-foreground">{t("teamPage.empty")}</p>
            </Reveal>
          </div>
        </section>
      ) : (
        <>
          {/* Executive board */}
          <section className="py-20 sm:py-24">
            <div className="container">
              <Reveal className="mb-8 flex items-center gap-3">
                <h2 className="font-display text-2xl font-bold tracking-tight">{t("teamPage.board")}</h2>
                <span className="h-px flex-1 bg-border" />
              </Reveal>

              <div className="grid gap-5 md:grid-cols-2">
                {board.map((m, i) => (
                  <Reveal key={m.id} delay={i * 0.1}>
                    <TiltCard max={5}>
                      <article className="relative overflow-hidden rounded-2xl bg-ink p-7 text-white">
                        <div
                          aria-hidden
                          className="pointer-events-none absolute -end-16 -top-16 h-52 w-52 rounded-full blur-3xl"
                          style={{
                            background: "radial-gradient(circle, hsl(var(--brand) / 0.5), transparent 70%)",
                          }}
                        />
                        <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-30" />
                        <div className="relative flex items-center gap-5">
                          <Avatar member={m} size="lg" />
                          <div className="min-w-0">
                            <h3 className="font-display text-xl font-bold">{m.name}</h3>
                            <p className="mt-0.5 font-mono text-[11px] uppercase tracking-[0.16em] text-brand-bright">
                              {m.role}
                            </p>
                            {m.bio && <p className="mt-2 text-sm text-white/55">{m.bio}</p>}
                            <div className="mt-4">
                              <Socials member={m} tone="light" />
                            </div>
                          </div>
                        </div>
                      </article>
                    </TiltCard>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          {/* Everyone else */}
          {rest.length > 0 && (
            <section className="border-t border-border/60 bg-muted/30 py-20 sm:py-24">
              <div className="container">
                <Reveal className="mb-8 flex items-center gap-3">
                  <h2 className="font-display text-2xl font-bold tracking-tight">
                    {t("teamPage.coordinators")}
                  </h2>
                  <span className="h-px flex-1 bg-border" />
                </Reveal>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {rest.map((m, i) => (
                    <Reveal key={m.id} delay={i * 0.06}>
                      <article className="card-glow group h-full rounded-2xl border border-border/70 bg-card p-6 text-center transition-transform duration-500 hover:-translate-y-1">
                        <div className="flex justify-center">
                          <Avatar member={m} size="md" />
                        </div>
                        <h3 className="mt-5 font-display text-base font-semibold">{m.name}</h3>
                        <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-brand">
                          {m.role}
                        </p>
                        {m.bio && (
                          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">{m.bio}</p>
                        )}
                        <div className="mt-4 flex justify-center">
                          <Socials member={m} />
                        </div>
                      </article>
                    </Reveal>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}
    </Layout>
  );
};

export default Team;
