import { motion } from "framer-motion";
import { AlertTriangle, ImageIcon, Loader2, LogOut, Users } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import Aurora from "@/components/background/Aurora";
import CircuitField from "@/components/background/CircuitField";
import MembersManager from "@/components/dashboard/MembersManager";
import PhotosManager from "@/components/dashboard/PhotosManager";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { club } from "@/data/site";

type Tab = "members" | "photos";

const SignIn = ({ onSubmit }: { onSubmit: (email: string, password: string) => Promise<void> }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(false);
    try {
      await onSubmit(email, password);
    } catch {
      setError(true);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-ink px-6 py-16">
      <Aurora />
      <div className="absolute inset-0">
        <CircuitField />
      </div>
      <div aria-hidden className="pointer-events-none absolute inset-0 bg-grid opacity-40" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="glass-strong rounded-3xl p-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <Logo variant="white" className="h-11 w-11" />
            <span className="font-display font-bold text-white">{club.name}</span>
          </Link>

          <h1 className="mt-7 font-display text-2xl font-bold text-white">
            {t("dashboard.signInTitle")}
          </h1>
          <p className="mt-2 text-sm text-white/55">{t("dashboard.signInLede")}</p>

          <form onSubmit={submit} className="mt-7 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/70">
                {t("dashboard.email")}
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-white/15 bg-white/[0.06] text-white placeholder:text-white/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/70">
                {t("dashboard.password")}
              </Label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-white/15 bg-white/[0.06] text-white placeholder:text-white/30"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {t("dashboard.signInError")}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand font-semibold text-white transition-colors hover:bg-brand-bright disabled:opacity-60"
            >
              {busy && <Loader2 size={16} className="animate-spin" />}
              {t(busy ? "dashboard.signingIn" : "dashboard.signIn")}
            </button>
          </form>
        </div>
      </motion.div>
    </main>
  );
};

const NotConfigured = () => {
  const { t } = useTranslation();
  return (
    <main className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-lg rounded-2xl border border-accent/30 bg-accent/5 p-8 text-center">
        <AlertTriangle className="mx-auto mb-4 text-accent" size={32} />
        <h1 className="font-display text-xl font-bold">{t("dashboard.notConfiguredTitle")}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          {t("dashboard.notConfiguredBody")}
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-10 items-center rounded-xl border border-border px-5 text-sm font-semibold transition-colors hover:bg-muted"
        >
          {t("notFound.back")}
        </Link>
      </div>
    </main>
  );
};

const Dashboard = () => {
  const { t } = useTranslation();
  const { session, loading, signIn, signOut, configured } = useAuth();
  const [tab, setTab] = useState<Tab>("members");

  if (!configured) return <NotConfigured />;

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin text-brand" size={28} />
      </main>
    );
  }

  if (!session) return <SignIn onSubmit={signIn} />;

  const tabs: { id: Tab; icon: typeof Users }[] = [
    { id: "members", icon: Users },
    { id: "photos", icon: ImageIcon },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2.5">
            <Logo className="h-8 w-8" />
            <span className="font-display text-sm font-bold">{t("dashboard.title")}</span>
          </Link>

          <div className="flex items-center gap-1.5">
            <span className="me-2 hidden max-w-[16rem] truncate text-xs text-muted-foreground sm:inline">
              {t("dashboard.signedInAs")} {session.user.email}
            </span>
            <LanguageSwitcher />
            <ThemeToggle />
            <button
              onClick={signOut}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-border px-3 text-sm font-medium transition-colors hover:bg-muted"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">{t("dashboard.signOut")}</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container py-10">
        <p className="text-sm text-muted-foreground">{t("dashboard.subtitle")}</p>

        {/* Tabs */}
        <div className="mt-6 flex gap-1.5 border-b border-border">
          {tabs.map((item) => {
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setTab(item.id)}
                className={`relative inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${
                  active ? "text-brand" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <item.icon size={16} />
                {t(`dashboard.tabs.${item.id}`)}
                {active && (
                  <motion.span
                    layoutId="dash-tab"
                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                    className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-brand"
                  />
                )}
              </button>
            );
          })}
        </div>

        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="pt-10"
        >
          {tab === "members" ? <MembersManager /> : <PhotosManager />}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
