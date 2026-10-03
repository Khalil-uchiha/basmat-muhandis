import { ArrowRight, ArrowUpRight, Quote } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import Hero from "@/components/Hero";
import Layout from "@/components/Layout";
import Logo from "@/components/Logo";
import Marquee from "@/components/Marquee";
import PhotoShowcase from "@/components/PhotoShowcase";
import SectionHeading from "@/components/SectionHeading";
import Counter from "@/components/motion/Counter";
import Magnetic from "@/components/motion/Magnetic";
import Reveal from "@/components/motion/Reveal";
import TiltCard from "@/components/motion/TiltCard";
import { partners, pillars, projects, stats } from "@/data/site";

const featured = projects.slice(0, 3);

const Index = () => {
  const { t } = useTranslation();

  return (
  <Layout>
    <Hero />

    {/* Stats strip — sits half over the hero */}
    <section className="relative z-10 -mt-16 px-4 sm:px-6">
      <Reveal className="mx-auto max-w-6xl">
        <div className="glass-strong grid grid-cols-2 gap-px overflow-hidden rounded-3xl shadow-[0_24px_70px_-32px_hsl(var(--brand)/0.5)] md:grid-cols-4">
          {stats.map((item, i) => (
            <div
              key={item.key}
              className="group relative bg-card/40 px-6 py-8 text-center transition-colors duration-500 hover:bg-brand/[0.06]"
              style={{ transitionDelay: `${i * 30}ms` }}
            >
              <item.icon
                className="mx-auto mb-3 text-brand transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:scale-110"
                size={24}
              />
              <div className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                <Counter value={item.value} suffix={item.suffix} />
              </div>
              <div className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {t(`stats.${item.key}`)}
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>

    {/* What we do */}
    <section className="py-24 sm:py-32">
      <div className="container">
        <SectionHeading
          eyebrow={t("home.pillarsEyebrow")}
          title={
            <>
              {t("home.pillarsTitleLead")}
              <span className="text-gradient">{t("home.pillarsTitleAccent")}</span>
            </>
          }
          lede={t("home.pillarsLede")}
        />

        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((p, i) => (
            <Reveal key={p.key} delay={i * 0.08}>
              <TiltCard className="h-full">
                <div className="card-glow relative h-full overflow-hidden rounded-2xl border border-border/70 bg-card p-6 transition-shadow duration-500 hover:shadow-[0_18px_50px_-24px_hsl(var(--brand)/0.55)]">
                  <span className="font-mono text-[11px] text-muted-foreground/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="mt-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 ring-1 ring-inset ring-brand/15">
                    <p.icon className="text-brand" size={22} />
                  </div>
                  <h3 className="mt-5 font-display text-lg font-semibold">
                    {t(`pillars.${p.key}.title`)}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {t(`pillars.${p.key}.desc`)}
                  </p>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* Featured projects */}
    <section className="relative overflow-hidden border-y border-border/60 bg-muted/40 py-24 sm:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-[0.55]" />
      <div className="container relative">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <SectionHeading
            align="left"
            eyebrow={t("home.featuredEyebrow")}
            title={
              <>
                {t("home.featuredTitleLead")}
                <span className="text-gradient">{t("home.featuredTitleAccent")}</span>
              </>
            }
            lede={t("home.featuredLede")}
          />
          <Reveal delay={0.15}>
            <Magnetic strength={0.25}>
              <Link
                to="/projects"
                className="group inline-flex h-11 items-center gap-2 rounded-2xl border border-border bg-card px-5 text-sm font-semibold transition-colors hover:border-brand/40 hover:text-brand"
              >
                {t("home.viewAll")}
                <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Magnetic>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {featured.map((p, i) => (
            <Reveal key={p.title} delay={i * 0.1}>
              <TiltCard className="h-full" max={6}>
                <article className="card-glow group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card p-7">
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -end-14 -top-14 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                    style={{ background: "radial-gradient(circle, hsl(var(--brand) / 0.35), transparent 70%)" }}
                  />
                  <div className="relative flex items-center justify-between">
                    <span className="rounded-full bg-brand/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-brand">
                      {t(`categories.${p.cat}`)}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">{p.year}</span>
                  </div>
                  <h3 className="relative mt-6 font-display text-xl font-semibold leading-snug">{p.title}</h3>
                  <p className="relative mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
                  <div className="relative mt-6 flex flex-wrap gap-1.5">
                    {p.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-md border border-border/70 px-2 py-0.5 font-mono text-[10px] text-muted-foreground"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </article>
              </TiltCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* Club moments — real event photos from the gallery */}
    <PhotoShowcase />

    {/* Mission statement */}
    <section className="py-24 sm:py-32">
      <div className="container">
        <Reveal className="relative mx-auto max-w-3xl text-center">
          <Quote className="mx-auto mb-6 text-brand/30" size={36} />
          <p className="font-display text-2xl font-medium leading-[1.4] tracking-tight sm:text-3xl md:text-[2.15rem]">
            {t("home.quote")}
            <span className="text-gradient">{t("home.quoteAccent")}</span>.
          </p>
          <div className="mt-8 inline-flex items-center gap-3">
            <Logo className="h-9 w-9" />
            <span className="text-left">
              <span className="block font-display text-sm font-semibold">Basmat-Muhandis</span>
              <span className="block font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {t("home.charter")}
              </span>
            </span>
          </div>
        </Reveal>
      </div>
    </section>

    {/* Partners marquee */}
    <section className="border-y border-border/60 bg-muted/30 py-12">
      <p className="mb-7 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        {t("home.partnersLabel")}
      </p>
      <Marquee>
        {partners.map((p) => (
          <span
            key={p.name}
            className="mx-2 whitespace-nowrap rounded-xl border border-border/60 bg-card px-5 py-2.5 font-display text-sm font-semibold text-muted-foreground"
          >
            {p.name}
          </span>
        ))}
      </Marquee>
    </section>

    {/* Closing CTA */}
    <section className="py-24 sm:py-32">
      <div className="container">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-ink px-8 py-16 text-center text-white sm:px-14 sm:py-20">
            <div
              aria-hidden
              className="pointer-events-none absolute -top-32 left-1/2 h-72 w-[130%] -translate-x-1/2 rounded-full blur-[110px]"
              style={{ background: "radial-gradient(circle, hsl(var(--brand) / 0.55), transparent 65%)" }}
            />
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-40" />
            <div className="relative">
              <Logo variant="white" className="mx-auto h-14 w-14 animate-float-y" />
              <h2 className="mt-7 font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                {t("home.ctaTitle")}
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-white/60">
{t("home.ctaLede")}
              </p>
              <Magnetic strength={0.3} className="mt-9">
                <Link
                  to="/contact"
                  className="group inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-7 font-semibold text-ink transition-colors duration-300 hover:bg-brand hover:text-white"
                >
                  {t("home.ctaButton")}
                  <ArrowUpRight
                    size={17}
                    className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  />
                </Link>
              </Magnetic>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
    </Layout>
  );
};

export default Index;
