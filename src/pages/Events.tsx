import { ArrowUpRight, CalendarDays } from "lucide-react";
import { useTranslation } from "react-i18next";

import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/motion/Reveal";
import { events } from "@/data/site";

const upcoming = events.filter((e) => e.upcoming);
const past = events.filter((e) => !e.upcoming);

const EventRow = ({
  event,
  index,
  highlight,
}: {
  event: (typeof events)[number];
  index: number;
  highlight: boolean;
}) => (
  <Reveal delay={index * 0.07}>
    <article
      className={`group relative flex flex-col gap-4 rounded-2xl border p-6 transition-all duration-500 sm:flex-row sm:items-center sm:gap-7 ${
        highlight
          ? "card-glow border-brand/25 bg-card hover:-translate-y-0.5 hover:shadow-[0_20px_50px_-26px_hsl(var(--brand)/0.6)]"
          : "border-border/60 bg-card/50 hover:border-border"
      }`}
    >
      {/* Date chip */}
      <div
        className={`flex w-fit shrink-0 items-center gap-2 rounded-xl px-3 py-2 font-mono text-xs ${
          highlight ? "bg-brand/10 text-brand" : "bg-muted text-muted-foreground"
        }`}
      >
        <CalendarDays size={14} />
        {event.date}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2.5">
          <h3 className="font-display text-lg font-semibold">{event.title}</h3>
          <span className="rounded-full border border-border/70 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {event.type}
          </span>
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{event.desc}</p>
      </div>

      {highlight && (
        <ArrowUpRight
          size={18}
          className="hidden shrink-0 text-brand opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 sm:block"
        />
      )}
    </article>
  </Reveal>
);

const Events = () => {
  const { t } = useTranslation();

  return (
  <Layout>
    <PageHeader
      eyebrow={t("eventsPage.eyebrow")}
      title={t("eventsPage.title")}
      lede={t("eventsPage.lede")}
    />

    <section className="py-20 sm:py-24">
      <div className="container max-w-4xl">
        <Reveal className="mb-7 flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-70" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand" />
          </span>
          <h2 className="font-display text-2xl font-bold tracking-tight">{t("eventsPage.upcoming")}</h2>
          <span className="font-mono text-xs text-muted-foreground">
            {String(upcoming.length).padStart(2, "0")}
          </span>
        </Reveal>
        <div className="space-y-3.5">
          {upcoming.map((e, i) => (
            <EventRow key={e.title} event={e} index={i} highlight />
          ))}
        </div>

        <Reveal className="mb-7 mt-16 flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
          <h2 className="font-display text-2xl font-bold tracking-tight text-muted-foreground">
            {t("eventsPage.archive")}
          </h2>
          <span className="font-mono text-xs text-muted-foreground">
            {String(past.length).padStart(2, "0")}
          </span>
        </Reveal>
        <div className="space-y-3.5">
          {past.map((e, i) => (
            <EventRow key={e.title} event={e} index={i} highlight={false} />
          ))}
        </div>
      </div>
    </section>
    </Layout>
  );
};

export default Events;
