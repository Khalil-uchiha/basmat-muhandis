import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import Logo from "@/components/Logo";
import Aurora from "@/components/background/Aurora";
import CircuitField from "@/components/background/CircuitField";
import Magnetic from "@/components/motion/Magnetic";

const NotFound = () => {
  const { t } = useTranslation();

  return (
  <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-6 text-center text-white">
    <Aurora />
    <div className="absolute inset-0">
      <CircuitField />
    </div>
    <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-40" />

    <div className="relative">
      <Logo variant="white" className="mx-auto h-16 w-16 animate-float-y" />
      <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">{t("notFound.code")}</p>
      <h1 className="mt-3 font-display text-5xl font-bold tracking-tight sm:text-6xl">
        {t("notFound.titleLead")}
        <span className="text-gradient">{t("notFound.titleAccent")}</span>
      </h1>
      <p className="mx-auto mt-4 max-w-md text-white/55">
{t("notFound.lede")}
      </p>
      <Magnetic strength={0.3} className="mt-9">
        <Link
          to="/"
          className="group inline-flex h-12 items-center gap-2 rounded-2xl bg-white px-6 font-semibold text-ink transition-colors duration-300 hover:bg-brand hover:text-white"
        >
          <ArrowLeft size={17} className="transition-transform duration-300 group-hover:-translate-x-1" />
          {t("notFound.back")}
        </Link>
      </Magnetic>
    </div>
    </main>
  );
};

export default NotFound;
