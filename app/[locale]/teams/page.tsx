import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import {
  ArrowRight,
  ChevronRight,
  GraduationCap,
  Shield,
  Trophy,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type Team = {
  id: string;
  competition_id: string;
  grade: number;
  section: string;
  name: string;
  logo_url: string | null;
};

type Competition = {
  id: string;
  name: string;
  name_ar: string;
  description: string | null;
  description_ar: string | null;
};

export default async function TeamsPage() {
  const locale = await getLocale();
  const t = await getTranslations("teams");

  const supabase = await createClient();

  // =========================================================
  // COMPETITIONS
  // =========================================================

  const { data: competitions, error: competitionsError } =
    await supabase
      .from("competitions")
      .select(`
        id,
        name,
        name_ar,
        description,
        description_ar
      `)
      .order("start_date");

  // =========================================================
  // CLASSES
  // =========================================================

  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select(`
      id,
      competition_id,
      grade,
      section,
      name,
      logo_url
    `)
    .order("grade")
    .order("section");

  if (competitionsError) {
    console.error("Competitions error:", competitionsError);
  }

  if (teamsError) {
    console.error("Teams error:", teamsError);
  }

  const typedCompetitions: Competition[] = competitions ?? [];
  const typedTeams: Team[] = teams ?? [];

  const totalClasses = typedTeams.length;

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
          className="absolute inset-0 -z-10 hidden opacity-[0.07] dark:block"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        {/* Glows */}
        <div className="absolute -left-40 top-10 -z-10 h-96 w-96 rounded-full bg-emerald-500/10 blur-[130px] dark:bg-emerald-500/20" />
        <div className="absolute -right-40 bottom-0 -z-10 h-96 w-96 rounded-full bg-amber-400/10 blur-[130px]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-8 sm:pb-16 sm:pt-12 lg:pb-20 lg:pt-16">

          <div className="max-w-3xl">

            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">

              <Trophy className="h-3.5 w-3.5" />

              <span>
                NWIS Football
              </span>

            </div>

            <h1 className="mt-4 text-5xl font-black tracking-[-0.04em] text-gray-950 dark:text-white sm:text-6xl lg:text-7xl">
              {t("title")}
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-7 text-gray-600 dark:text-white/60 sm:text-lg">
              {t("subtitle")}
            </p>

          </div>

          {/* Stats */}
          <div className="mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:mt-12 sm:grid-cols-3">

            {/* Classes */}
            <div className="rounded-2xl border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-emerald-400/10">
                <Users className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>

              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">
                {locale === "ar" ? "الفصول" : "Classes"}
              </p>

              <p className="mt-1 text-3xl font-black text-gray-950 dark:text-white">
                {totalClasses}
              </p>

            </div>

            {/* Competitions */}
            <div className="rounded-2xl border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 dark:bg-amber-400/10">
                <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>

              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">
                {locale === "ar" ? "البطولات" : "Competitions"}
              </p>

              <p className="mt-1 text-3xl font-black text-gray-950 dark:text-white">
                {typedCompetitions.length}
              </p>

            </div>

            {/* School */}
            <div className="col-span-2 rounded-2xl border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none sm:col-span-1">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-100 dark:bg-white/[0.06]">
                <GraduationCap className="h-4 w-4 text-gray-600 dark:text-white/70" />
              </div>

              <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">
                {locale === "ar" ? "المدرسة" : "School"}
              </p>

              <p className="mt-1 font-black text-gray-950 dark:text-white">
                NWIS
              </p>

            </div>

          </div>
        </div>
      </section>

      {/* =====================================================
          COMPETITIONS
      ===================================================== */}

      <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16">

        {typedCompetitions.map((competition, competitionIndex) => {

          const competitionTeams = typedTeams.filter(
            (team) => team.competition_id === competition.id
          );

          const competitionName =
            locale === "ar"
              ? competition.name_ar
              : competition.name;

          const competitionDescription =
            locale === "ar"
              ? competition.description_ar
              : competition.description;

          return (
            <section
              key={competition.id}
              className="mb-16 last:mb-0 sm:mb-20"
            >

              {/* =================================================
                  COMPETITION HEADER
              ================================================= */}

              <div className="relative mb-7 overflow-hidden rounded-[2rem] border border-gray-200 bg-gradient-to-br from-gray-50 via-white to-white p-7 shadow-sm dark:border-white/10 dark:from-white/[0.06] dark:via-gray-900/80 dark:to-gray-900/80 dark:shadow-none sm:p-9">

                {/* Accent */}
                <div className="absolute inset-y-0 start-0 w-1 bg-gradient-to-b from-emerald-500 to-amber-400" />

                {/* Glow */}
                <div className="absolute -right-20 -top-20 h-48 w-48 rounded-full bg-emerald-500/5 blur-3xl" />

                <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">

                  <div>

                    <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">

                      <Trophy className="h-4 w-4" />

                      <span>
                        {locale === "ar"
                          ? `البطولة ${competitionIndex + 1}`
                          : `Competition ${competitionIndex + 1}`}
                      </span>

                    </div>

                    <h2 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white sm:text-4xl">
                      {competitionName}
                    </h2>

                    {competitionDescription && (
                      <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-600 dark:text-gray-400">
                        {competitionDescription}
                      </p>
                    )}

                  </div>

                  <div className="flex shrink-0 items-center gap-3">

                    <div className="rounded-2xl border border-gray-200 bg-white px-4 py-3 text-center shadow-sm dark:border-white/10 dark:bg-gray-950/60 dark:shadow-none">

                      <p className="text-2xl font-black text-gray-950 dark:text-white">
                        {competitionTeams.length}
                      </p>

                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-500">
                        {locale === "ar"
                          ? "فصل"
                          : "Classes"}
                      </p>

                    </div>

                  </div>

                </div>
              </div>

              {/* =================================================
                  CLASSES
              ================================================= */}

              {competitionTeams.length === 0 ? (
                <div className="rounded-[2rem] border border-dashed border-gray-300 bg-gray-50 p-12 text-center dark:border-gray-800 dark:bg-white/[0.02]">

                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/[0.06]">
                    <Shield className="h-7 w-7 text-gray-400 dark:text-gray-500" />
                  </div>

                  <p className="mt-5 font-bold text-gray-950 dark:text-white">
                    {t("noTeams")}
                  </p>

                </div>
              ) : (
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

                  {competitionTeams.map((team, index) => (

                    <Link
                      key={team.id}
                      href={`/${locale}/teams/${team.id}`}
                      className="group relative overflow-hidden rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-950/10 dark:border-white/10 dark:bg-gray-900/70 dark:shadow-none dark:hover:border-emerald-400/30 dark:hover:shadow-emerald-950/20"
                    >

                      {/* Top accent */}
                      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 opacity-70 transition-opacity group-hover:opacity-100" />

                      {/* Background glow */}
                      <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-emerald-500/5 blur-3xl transition duration-500 group-hover:bg-emerald-500/10" />

                      <div className="relative">

                        {/* Card top */}
                        <div className="flex items-start justify-between">

                          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 text-xl font-black text-gray-950 transition duration-500 group-hover:scale-105 dark:border-white/10 dark:bg-white/[0.06] dark:text-white">

                            {team.logo_url ? (
                              <img
                                src={team.logo_url}
                                alt={team.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <span>
                                {team.grade}
                                {team.section}
                              </span>
                            )}

                          </div>

                          <span className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-500 transition-all duration-300 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 group-hover:text-emerald-600 dark:border-white/10 dark:bg-gray-950/60 dark:text-gray-400 dark:group-hover:text-emerald-400">

                            <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />

                          </span>

                        </div>

                        {/* Class */}
                        <div className="mt-7 flex items-end justify-between">

                          <div>

                            <p className="text-xs font-bold uppercase tracking-[0.18em] text-gray-500 dark:text-gray-500">
                              {locale === "ar"
                                ? "الفصل"
                                : "Class"}
                            </p>

                            <h3 className="mt-1 text-4xl font-black tracking-tight text-gray-950 dark:text-white">
                              {team.grade}
                              {team.section}
                            </h3>

                          </div>

                          <span className="text-xs font-black text-gray-300 dark:text-white/20">
                            {String(index + 1).padStart(2, "0")}
                          </span>

                        </div>

                        {/* Details */}
                        <div className="mt-5 border-t border-gray-200 pt-4 dark:border-white/10">

                          <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                            {t("grade")}{" "}
                            {team.grade}

                            <span className="mx-2 text-gray-300 dark:text-white/20">
                              •
                            </span>

                            {t("section")}{" "}
                            {team.section}
                          </p>

                        </div>

                        {/* Bottom */}
                        <div className="mt-5 flex items-center justify-between">

                          <span className="text-xs font-bold text-emerald-600 transition-colors group-hover:text-emerald-500 dark:text-emerald-400">
                            {t("viewTeam")}
                          </span>

                          <ArrowRight className="h-4 w-4 text-gray-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-emerald-600 dark:text-gray-500 dark:group-hover:text-emerald-400 rtl:rotate-180 rtl:group-hover:-translate-x-1" />

                        </div>

                      </div>
                    </Link>

                  ))}

                </div>
              )}

            </section>
          );
        })}

        {/* =====================================================
            DATABASE ERROR
        ===================================================== */}

        {(competitionsError || teamsError) && (
          <div className="mt-10 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
            {locale === "ar"
              ? "تعذر تحميل بيانات الفصول."
              : "Unable to load class data."}
          </div>
        )}

      </div>

      {/* =====================================================
          BOTTOM STRIP
      ===================================================== */}

      <section className="border-t border-gray-200 bg-gray-950 text-white dark:border-white/10">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
              NWIS Football
            </p>

            <p className="mt-2 text-lg font-bold">
              {locale === "ar"
                ? "كل فصل. بطولة واحدة."
                : "Every class. One tournament."}
            </p>

          </div>

          <Link
            href={`/${locale}/matches`}
            className="group inline-flex items-center gap-2 text-sm font-bold text-white/60 transition hover:text-white"
          >

            <span>
              {locale === "ar"
                ? "عرض المباريات"
                : "View matches"}
            </span>

            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />

          </Link>

        </div>

      </section>

    </main>
  );
}