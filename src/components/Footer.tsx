import { ArrowUpRight, Facebook, Instagram, Linkedin, Mail, MapPin } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import Logo from "./Logo";
import { club, navLinks } from "@/data/site";

const socials = [
  { icon: Facebook, href: club.social.facebook, label: "Facebook" },
  { icon: Instagram, href: club.social.instagram, label: "Instagram" },
  { icon: Linkedin, href: club.social.linkedin, label: "LinkedIn" },
];

const Footer = () => {
  const { t } = useTranslation();

  return (
  <footer className="relative overflow-hidden bg-ink text-white/80">
    {/* brand wash + blueprint grid */}
    <div
      aria-hidden
      className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[120%] -translate-x-1/2 rounded-full blur-[120px]"
      style={{ background: "radial-gradient(circle, hsl(var(--brand) / 0.35), transparent 65%)" }}
    />
    <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-[0.35] mask-fade-b" />

    <div className="container relative py-16">
      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr]">
        {/* Brand */}
        <div>
          <Link to="/" className="inline-flex items-center gap-3">
            <Logo variant="white" className="h-11 w-11" />
            <span className="font-display text-lg font-bold text-white">{club.name}</span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
{t("footer.blurb")}
          </p>
          <div className="mt-6 flex gap-2">
            {socials.map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-brand/40 hover:bg-brand hover:text-white"
              >
                <s.icon size={17} />
              </a>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div>
          <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">{t("footer.navigate")}</h4>
          <ul className="mt-5 space-y-3 text-sm">
            {navLinks.slice(1).map((l) => (
              <li key={l.path}>
                <Link
                  to={l.path}
                  className="group inline-flex items-center gap-1.5 text-white/65 transition-colors hover:text-white"
                >
                  {t(`nav.${l.key}`)}
                  <ArrowUpRight
                    size={13}
                    className="opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="font-mono text-[11px] uppercase tracking-[0.18em] text-white/40">{t("footer.reach")}</h4>
          <ul className="mt-5 space-y-3 text-sm text-white/65">
            <li>
              <a
                href={`mailto:${club.email}`}
                className="inline-flex items-center gap-2.5 transition-colors hover:text-white"
              >
                <Mail size={15} className="text-brand-bright" /> {club.email}
              </a>
            </li>
            <li className="inline-flex items-center gap-2.5">
              <MapPin size={15} className="text-brand-bright" /> {club.location}
            </li>
          </ul>
          <Link
            to="/contact"
            className="mt-6 inline-flex h-10 items-center gap-2 rounded-xl bg-white/[0.06] px-4 text-sm font-semibold text-white ring-1 ring-inset ring-white/10 transition-all duration-300 hover:bg-brand hover:ring-brand"
          >
            {t("footer.startConversation")} <ArrowUpRight size={15} />
          </Link>
        </div>
      </div>

      <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/40 sm:flex-row">
        <span>
          © {new Date().getFullYear()} {club.name} Club · {club.nameAr}
        </span>
        <span className="font-mono">{t("footer.rights")}</span>
      </div>
    </div>
    </footer>
  );
};

export default Footer;
