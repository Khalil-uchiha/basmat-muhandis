import { AnimatePresence, motion } from "framer-motion";
import { Code } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import Layout from "@/components/Layout";
import PageHeader from "@/components/PageHeader";
import Reveal from "@/components/motion/Reveal";
import TiltCard from "@/components/motion/TiltCard";
import { categoryIcons, projectCategories, projects } from "@/data/site";

const Projects = () => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string>("All");
  const filtered = filter === "All" ? projects : projects.filter((p) => p.cat === filter);

  return (
    <Layout>
      <PageHeader
        eyebrow={t("projectsPage.eyebrow")}
        title={t("projectsPage.title")}
        lede={t("projectsPage.lede")}
      />

      <section className="py-20 sm:py-24">
        <div className="container">
          {/* Filter pills with a sliding indicator */}
          <Reveal className="mb-12 flex flex-wrap gap-2">
            {projectCategories.map((c) => {
              const active = filter === c;
              return (
                <button
                  key={c}
                  onClick={() => setFilter(c)}
                  className={`relative rounded-xl px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                    active ? "text-white" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="filter-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      className="absolute inset-0 -z-10 rounded-xl bg-brand shadow-[0_10px_28px_-12px_hsl(var(--brand))]"
                    />
                  )}
                  {!active && (
                    <span className="absolute inset-0 -z-10 rounded-xl border border-border/70 bg-card" />
                  )}
                  {c === "All" ? t("projectsPage.all") : t(`categories.${c}`)}
                </button>
              );
            })}
          </Reveal>

          <motion.div layout className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filtered.map((p, i) => {
                const Icon = categoryIcons[p.cat] || Code;
                return (
                  <motion.div
                    key={p.title}
                    layout
                    initial={{ opacity: 0, y: 24, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -12, scale: 0.97 }}
                    transition={{ duration: 0.4, delay: i * 0.04, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <TiltCard className="h-full" max={6}>
                      <article className="card-glow group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card p-7">
                        <div
                          aria-hidden
                          className="pointer-events-none absolute -end-14 -top-14 h-40 w-40 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
                          style={{
                            background: "radial-gradient(circle, hsl(var(--brand) / 0.3), transparent 70%)",
                          }}
                        />
                        <div className="relative flex items-start justify-between">
                          <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 ring-1 ring-inset ring-brand/15">
                            <Icon className="text-brand" size={20} />
                          </div>
                          <span className="font-mono text-xs text-muted-foreground">{p.year}</span>
                        </div>
                        <span className="relative mt-5 w-fit rounded-full bg-muted px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          {t(`categories.${p.cat}`)}
                        </span>
                        <h3 className="relative mt-3 font-display text-lg font-semibold leading-snug">
                          {p.title}
                        </h3>
                        <p className="relative mt-2.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                          {p.desc}
                        </p>
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
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Projects;
