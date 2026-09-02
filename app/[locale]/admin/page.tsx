import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireAdmin } from "@/lib/supabase/admin";
import {
  ArrowRight,
  BarChart3,
  CalendarDays,
  Megaphone,
  Newspaper,
  Play,
  Settings,
  Trophy,
  Users,
} from "lucide-react";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  await requireAdmin(locale);

  const t = await getTranslations("admin");

  const sections = [
    {
      title: t("players"),
      description: t("playersDescription"),
      href: `/${locale}/admin/players`,
      icon: Users,
      accent: "emerald",
    },
    {
      title: t("teams"),
      description: t("teamsDescription"),
      href: `/${locale}/admin/teams`,
      icon: Trophy,
      accent: "amber",
    },
    {
      title: t("matches"),
      description: t("matchesDescription"),
      href: `/${locale}/admin/matches`,
      icon: CalendarDays,
      accent: "blue",
    },
    {
      title: t("news"),
      description: t("newsDescription"),
      href: `/${locale}/admin/news`,
      icon: Newspaper,
      accent: "violet",
    },
    {
      title: t("highlights"),
      description: t("highlightsDescription"),
      href: `/${locale}/admin/highlights`,
      icon: Play,
      accent: "rose",
    }
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-white text-gray-950 dark:bg-gray-950 dark:text-white">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative isolate overflow-hidden border-b border-gray-200 dark:border-white/10">

        {/* Light background */}
        <div className="absolute inset-0 -z-20 bg-gradient-to-br from-emerald-50 via-white to-white dark:hidden" />

        {/* Dark background */}
        <div className="absolute inset-0 -z-20 hidden bg-gradient-to-br from-emerald-950 via-[#07100b] to-black dark:block" />

        {/* Light grid */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.035] dark:hidden"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.6) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        {/* Dark grid */}
        <div
          className="absolute inset-0 -z-10 hidden opacity-[0.055] dark:block"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        {/* Glows */}
        <div className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[140px] dark:bg-emerald-500/20" />

        <div className="pointer-events-none absolute -right-40 bottom-[-20%] h-[500px] w-[500px] rounded-full bg-amber-400/10 blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-8 sm:pb-16 sm:pt-12 lg:pb-20 lg:pt-16">

          <div className="max-w-4xl">

            {/* Eyebrow */}

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">

              <Settings className="h-3.5 w-3.5" />

              <span>
                NWIS Football
              </span>

            </div>

            {/* Title */}

            <h1 className="mt-4 text-5xl font-black tracking-[-0.06em] text-gray-950 dark:text-white sm:text-6xl lg:text-7xl">
              {t("title")}
            </h1>

            {/* Description */}

            <p className="mt-5 max-w-2xl text-sm leading-7 text-gray-600 dark:text-white/55 sm:text-base">
              {t("subtitle")}
            </p>

          </div>

          {/* Admin overview */}

          <div className="mt-10 flex flex-wrap gap-3">

            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white/80 px-5 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-emerald-400/10">
                <BarChart3 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-white/35">
                  {locale === "ar" ? "الأقسام" : "Sections"}
                </p>

                <p className="text-lg font-black text-gray-950 dark:text-white">
                  {sections.length}
                </p>
              </div>

            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white/80 px-5 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 dark:bg-amber-400/10">
                <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-white/35">
                  {locale === "ar" ? "النظام" : "System"}
                </p>

                <p className="text-sm font-black text-gray-950 dark:text-white">
                  {locale === "ar" ? "لوحة الإدارة" : "Admin Panel"}
                </p>
              </div>

            </div>

          </div>

        </div>
      </section>

      {/* =====================================================
          MANAGEMENT SECTIONS
      ===================================================== */}

      <section className="relative overflow-hidden">

        {/* Background glows */}

        <div className="pointer-events-none absolute left-[-15%] top-[10%] h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[140px] dark:bg-emerald-500/10" />

        <div className="pointer-events-none absolute right-[-15%] bottom-[10%] h-[500px] w-[500px] rounded-full bg-amber-400/5 blur-[140px] dark:bg-amber-400/10" />

        <div className="relative mx-auto max-w-7xl px-6 py-12 sm:py-16">

          {/* Section heading */}

          <div className="mb-8">

            <div className="mb-3 flex items-center gap-3">

              <span className="h-px w-8 bg-emerald-500" />

              <span className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">
                {locale === "ar"
                  ? "إدارة البطولة"
                  : "Tournament Management"}
              </span>

            </div>

            <h2 className="text-3xl font-black tracking-[-0.04em] text-gray-950 dark:text-white sm:text-4xl">
              {locale === "ar"
                ? "أدوات الإدارة"
                : "Management Tools"}
            </h2>

          </div>

          {/* Cards */}

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            {sections.map((section, index) => {

              const Icon = section.icon;

              return (
                <Link
                  key={section.href}
                  href={section.href}
                  className="group relative overflow-hidden rounded-[1.75rem] border border-gray-200 bg-white p-6 shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-950/10 dark:border-white/10 dark:bg-gray-900/70 dark:shadow-none dark:hover:border-emerald-400/30"
                >

                  {/* Top accent */}

                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 opacity-60 transition-opacity group-hover:opacity-100" />

                  {/* Background glow */}

                  <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl transition duration-500 group-hover:bg-emerald-500/10" />

                  <div className="relative">

                    {/* Top row */}

                    <div className="flex items-start justify-between">

                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/[0.05]">

                        <Icon className="h-6 w-6 text-emerald-600 transition-transform duration-300 group-hover:scale-110 dark:text-emerald-400" />

                      </div>

                      <span className="text-xs font-black text-gray-300 dark:text-white/20">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                    </div>

                    {/* Content */}

                    <h3 className="mt-7 text-xl font-black tracking-tight text-gray-950 transition-colors group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">
                      {section.title}
                    </h3>

                    <p className="mt-2 min-h-[48px] text-sm leading-6 text-gray-600 dark:text-gray-400">
                      {section.description}
                    </p>

                    {/* Bottom */}

                    <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-5 dark:border-white/10">

                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {t("manage")}
                      </span>

                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-500 transition-all duration-300 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 group-hover:text-emerald-600 dark:border-white/10 dark:bg-gray-950/60 dark:text-gray-400 dark:group-hover:text-emerald-400">

                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />

                      </span>

                    </div>

                  </div>

                </Link>
              );
            })}

          </div>

        </div>

      </section>

      {/* =====================================================
          BOTTOM STRIP
      ===================================================== */}

      <section className="border-t border-gray-200 bg-gray-950 text-white dark:border-white/10">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400">
              NWIS Football
            </p>

            <p className="mt-2 text-lg font-black">
              {locale === "ar"
                ? "إدارة كل جانب من جوانب البطولة."
                : "Manage every part of the tournament."}
            </p>

          </div>

          <Link
            href={`/${locale}`}
            className="group flex items-center gap-2 text-sm font-bold text-white/55 transition hover:text-white"
          >

            <span>
              {locale === "ar"
                ? "العودة إلى الموقع"
                : "Back to website"}
            </span>

            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />

          </Link>

        </div>

      </section>

    </main>
  );
}