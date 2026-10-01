import { Building2, Handshake } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import Magnetic from "@/components/motion/Magnetic";
import Reveal from "@/components/motion/Reveal";
import TiltCard from "@/components/motion/TiltCard";
import { partners } from "@/data/site";

const Partners = () => {
  const { t } = useTranslation();

  return (
  <Layout>
    <PageHeader
      eyebrow={t("partnersPage.eyebrow")}
      title={t("partnersPage.title")}
      lede={t("partnersPage.lede")}
    />

    <section className="py-20 sm:py-24">
      <div className="container">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.07}>
              <TiltCard max={5} className="h-full">
                <div className="card-glow group flex h-full items-center gap-5 rounded-2xl border border-border/70 bg-card p-6 transition-shadow duration-500 hover:shadow-[0_18px_46px_-26px_hsl(var(--brand)/0.55)]">
                  <div className="inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand/10 ring-1 ring-inset ring-brand/15 transition-transform duration-500 group-hover:scale-105">
                    <Building2 className="text-brand" size={22} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-display font-semibold leading-snug">{p.name}</h3>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                      {p.type}
                    </p>
                  </div>
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </div>

        {/* Become a partner */}
        <Reveal className="mt-16">
          <div className="relative overflow-hidden rounded-3xl border border-border/70 bg-muted/40 px-8 py-12 text-center">
            <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-50" />
            <div className="relative">
              <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand/10 ring-1 ring-inset ring-brand/15">
                <Handshake className="text-brand" size={24} />
              </div>
              <h2 className="mt-6 font-display text-2xl font-bold tracking-tight sm:text-3xl">
                {t("partnersPage.ctaTitle")}
              </h2>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
{t("partnersPage.ctaLede")}
              </p>
              <Magnetic strength={0.25} className="mt-7">
                <Link
                  to="/contact"
                  className="inline-flex h-11 items-center gap-2 rounded-2xl bg-brand px-6 text-sm font-semibold text-white shadow-[0_14px_36px_-16px_hsl(var(--brand))] transition-colors hover:bg-brand-bright"
                >
                  {t("partnersPage.ctaButton")}
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

export default Partners;
