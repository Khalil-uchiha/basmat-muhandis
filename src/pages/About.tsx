import { Eye, Target } from "lucide-react";
import { useTranslation } from "react-i18next";

import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import SectionHeading from "@/components/SectionHeading";
import Reveal from "@/components/motion/Reveal";
import TiltCard from "@/components/motion/TiltCard";
import { timeline, values } from "@/data/site";

const About = () => {
  const { t } = useTranslation();

  return (
  <Layout>
    <PageHeader
      eyebrow={t("about.eyebrow")}
      title={t("about.title")}
      lede={t("about.lede")}
    />

    {/* Vision & mission */}
    <section className="py-24 sm:py-28">
      <div className="container grid gap-6 md:grid-cols-2">
        {[
          {
            icon: Eye,
            title: t("about.visionTitle"),
            body: t("about.visionBody"),
            tone: "brand" as const,
          },
          {
            icon: Target,
            title: t("about.missionTitle"),
            body: t("about.missionBody"),
            tone: "accent" as const,
          },
        ].map((c, i) => (
          <Reveal key={c.title} delay={i * 0.12}>
            <TiltCard className="h-full" max={5}>
              <div className="card-glow h-full rounded-2xl border border-border/70 bg-card p-8">
                <div
                  className={`inline-flex h-12 w-12 items-center justify-center rounded-xl ring-1 ring-inset ${
                    c.tone === "brand" ? "bg-brand/10 ring-brand/15" : "bg-accent/15 ring-accent/20"
                  }`}
                >
                  <c.icon className={c.tone === "brand" ? "text-brand" : "text-accent"} size={22} />
                </div>
                <h2 className="mt-6 font-display text-2xl font-bold tracking-tight">{c.title}</h2>
                <p className="mt-3 leading-relaxed text-muted-foreground">{c.body}</p>
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </section>

    {/* Values */}
    <section className="relative overflow-hidden border-y border-border/60 bg-muted/40 py-24 sm:py-28">
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-50" />
      <div className="container relative">
        <SectionHeading
          eyebrow={t("about.valuesEyebrow")}
          title={
            <>
              {t("about.valuesTitleLead")}
              <span className="text-gradient">{t("about.valuesTitleAccent")}</span>
            </>
          }
        />
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <Reveal key={v.key} delay={i * 0.08}>
              <div className="card-glow group h-full rounded-2xl border border-border/70 bg-card p-6 text-center transition-transform duration-500 hover:-translate-y-1">
                <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10 ring-1 ring-inset ring-brand/15">
                  <v.icon className="text-brand" size={22} />
                </div>
                <h3 className="mt-5 font-display font-semibold">{t(`values.${v.key}.title`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {t(`values.${v.key}.desc`)}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>

    {/* Timeline */}
    <section className="py-24 sm:py-28">
      <div className="container">
        <SectionHeading
          eyebrow={t("about.timelineEyebrow")}
          title={
            <>
              {t("about.timelineTitleLead")}
              <span className="text-gradient">{t("about.timelineTitleAccent")}</span>
            </>
          }
        />

        <div className="relative mx-auto mt-16 max-w-3xl">
          {/* spine */}
          <div className="absolute bottom-0 start-[7px] top-0 w-px bg-gradient-to-b from-brand via-border to-transparent md:start-1/2" />

          {timeline.map((t, i) => (
            <Reveal key={t.year} delay={i * 0.07} direction={i % 2 === 0 ? "right" : "left"}>
              <div
                className={`relative mb-10 flex items-start md:mb-12 ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
              >
                <span className="absolute start-0 top-1.5 flex h-[15px] w-[15px] items-center justify-center md:start-1/2 md:-translate-x-1/2 md:rtl:translate-x-1/2">
                  <span className="absolute h-full w-full rounded-full bg-brand/25" />
                  <span className="h-[7px] w-[7px] rounded-full bg-brand ring-4 ring-background" />
                </span>

                <div
                  className={`ms-9 md:ms-0 md:w-1/2 ${
                    i % 2 === 0 ? "md:pe-12 md:text-end" : "md:ps-12"
                  }`}
                >
                  <span className="font-mono text-xs font-medium tracking-[0.12em] text-brand">{t.year}</span>
                  <h3 className="mt-1 font-display text-lg font-semibold">{t.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{t.desc}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
    </Layout>
  );
};

export default About;
