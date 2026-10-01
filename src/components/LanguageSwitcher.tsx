import { AnimatePresence, motion } from "framer-motion";
import { Check, Globe } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { languages } from "@/i18n";

const LanguageSwitcher = ({ tone = "default" }: { tone?: "default" | "light" }) => {
  const { i18n, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const active = languages.find((l) => l.code === i18n.resolvedLanguage) ?? languages[0];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={t("nav.language")}
        aria-expanded={open}
        className={`inline-flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-xs font-semibold transition-colors ${
          tone === "light"
            ? "text-white/70 hover:bg-white/10 hover:text-white"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        }`}
      >
        <Globe size={16} />
        <span className="font-mono tracking-wider">{active.short}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong absolute end-0 top-11 z-50 w-44 overflow-hidden rounded-xl p-1 shadow-xl"
          >
            {languages.map((l) => (
              <li key={l.code}>
                <button
                  onClick={() => {
                    i18n.changeLanguage(l.code);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors ${
                    l.code === active.code
                      ? "bg-brand/10 font-semibold text-brand"
                      : "text-foreground hover:bg-muted"
                  }`}
                  dir={l.dir}
                >
                  <span>{l.label}</span>
                  {l.code === active.code && <Check size={14} />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LanguageSwitcher;
