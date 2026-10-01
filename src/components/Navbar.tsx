import { AnimatePresence, motion, useScroll, useMotionValueEvent } from "framer-motion";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useLocation } from "react-router-dom";

import LanguageSwitcher from "./LanguageSwitcher";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import Magnetic from "./motion/Magnetic";
import { club, navLinks } from "@/data/site";

const Navbar = () => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 24));

  // Close the drawer on navigation and lock the body while it is open
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.header
        initial={{ y: -24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-0 top-0 z-50 px-4 pt-3 sm:px-6"
      >
        <nav
          className={`mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-3 transition-all duration-500 ease-smooth sm:px-4 ${
            scrolled
              ? "glass-strong h-14 shadow-[0_10px_40px_-18px_hsl(var(--brand)/0.45)]"
              : "h-16 border border-transparent bg-transparent"
          }`}
        >
          <Link to="/" className="group flex items-center gap-2.5 pl-1">
            <Logo className="h-9 w-9 transition-transform duration-500 ease-smooth group-hover:rotate-[12deg]" />
            <span className="hidden font-display text-[0.95rem] font-bold tracking-tight sm:inline">
              {club.name}
            </span>
          </Link>

          {/* Desktop nav with a sliding active pill */}
          <div className="hidden items-center gap-0.5 lg:flex">
            {navLinks.map((l) => {
              const active = pathname === l.path;
              return (
                <Link
                  key={l.path}
                  to={l.path}
                  className={`relative rounded-xl px-3.5 py-2 text-sm font-medium transition-colors duration-300 ${
                    active ? "text-brand" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      className="absolute inset-0 -z-10 rounded-xl bg-brand/10 ring-1 ring-inset ring-brand/20"
                    />
                  )}
                  {t(`nav.${l.key}`)}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-1.5">
            <LanguageSwitcher />
            <ThemeToggle />
            <Magnetic className="hidden sm:inline-flex" strength={0.25}>
              <Link
                to="/contact"
                className="group inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand px-4 text-sm font-semibold text-white shadow-[0_8px_24px_-10px_hsl(var(--brand))] transition-all duration-300 hover:bg-brand-bright"
              >
                {t("nav.join")}
                <ArrowUpRight
                  size={15}
                  className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                />
              </Link>
            </Magnetic>
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label={t("nav.menu")}
              aria-expanded={open}
              className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-foreground transition-colors hover:bg-muted lg:hidden"
            >
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </nav>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-background/80 backdrop-blur-xl" onClick={() => setOpen(false)} />
            <motion.nav
              initial={{ y: -18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -18, opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative mt-24 px-5"
            >
              <ul className="space-y-1">
                {navLinks.map((l, i) => (
                  <motion.li
                    key={l.path}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.05 + i * 0.05, duration: 0.4 }}
                  >
                    <Link
                      to={l.path}
                      className={`flex items-center justify-between rounded-xl px-4 py-3.5 font-display text-lg font-semibold transition-colors ${
                        pathname === l.path ? "bg-brand/10 text-brand" : "text-foreground hover:bg-muted"
                      }`}
                    >
                      {t(`nav.${l.key}`)}
                      <span className="font-mono text-xs text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
              <Link
                to="/contact"
                className="mt-5 flex h-12 items-center justify-center gap-2 rounded-xl bg-brand font-semibold text-white"
              >
                {t("nav.join")} <ArrowUpRight size={16} />
              </Link>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
