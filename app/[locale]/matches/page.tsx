import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  Trophy,
  Zap,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type Match = {
  id: string;
  home_team_id: string;
  away_team_id: string;
  match_date: string;
  status: string;
  home_score: number;
  away_score: number;
};

type ClassInfo = {
  id: string;
  grade: number;
  section: string;
  name: string;
};

export default async function MatchesPage() {
  const locale = await getLocale();
  const t = await getTranslations("matches");
  const common = await getTranslations("common");

  const supabase = await createClient();

  const { data: matches, error: matchesError } = await supabase
  .from("matches")
  .select(`
    id,
    home_team_id,
    away_team_id,
    match_date,
    status,
    home_score,
    away_score
  `)
  .eq(
    "competition_id",
    "812b117a-df69-40ce-b4b2-62ae9ca3e8cf"
  )
  .order("match_date", { ascending: true });

  const { data: teams, error: teamsError } = await supabase
  .from("teams")
  .select(`
    id,
    grade,
    section,
    name
  `)
  .eq(
    "competition_id",
    "812b117a-df69-40ce-b4b2-62ae9ca3e8cf"
  );

  if (matchesError) {
    console.error("Matches error:", matchesError);
  }

  if (teamsError) {
    console.error("Classes error:", teamsError);
  }

  const typedMatches: Match[] = (matches ?? []).map((match) => ({
    id: match.id,
    home_team_id: match.home_team_id,
    away_team_id: match.away_team_id,
    match_date: match.match_date,
    status: match.status,
    home_score: match.home_score,
    away_score: match.away_score,
  }));

  const typedTeams: ClassInfo[] = (teams ?? []).map((team) => ({
    id: team.id,
    grade: team.grade,
    section: team.section,
    name: team.name,
  }));

  function getClass(teamId: string) {
    return typedTeams.find((team) => team.id === teamId);
  }

  function getClassName(teamId: string) {
    const team = getClass(teamId);

    if (!team) {
      return "—";
    }

    return `${team.grade}${team.section}`;
  }

  function formatDate(dateString: string) {
    return new Intl.DateTimeFormat(
      locale === "ar" ? "ar-SA" : "en-US",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Riyadh",
      }
    ).format(new Date(dateString));
  }

  function formatShortDate(dateString: string) {
    return new Intl.DateTimeFormat(
      locale === "ar" ? "ar-SA" : "en-US",
      {
        day: "numeric",
        month: "short",
        timeZone: "Asia/Riyadh",
      }
    ).format(new Date(dateString));
  }

  function formatTime(dateString: string) {
    return new Intl.DateTimeFormat(
      locale === "ar" ? "ar-SA" : "en-US",
      {
        hour: "numeric",
        minute: "2-digit",
        timeZone: "Asia/Riyadh",
      }
    ).format(new Date(dateString));
  }

  const upcomingMatches = typedMatches.filter(
    (match) =>
      match.status === "upcoming" ||
      match.status === "live"
  );

  const finishedMatches = typedMatches.filter(
    (match) => match.status === "finished"
  );

  const featuredMatch = upcomingMatches[0];
  const remainingUpcoming = upcomingMatches.slice(1);

  return (
    <main className="min-h-screen overflow-hidden bg-white text-gray-950 transition-colors dark:bg-gray-950 dark:text-white">

      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative isolate overflow-hidden border-b border-gray-200 bg-gradient-to-br from-emerald-50 via-white to-white dark:border-white/10 dark:from-emerald-950 dark:via-[#07100b] dark:to-black">

        {/* Light mode grid */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.035] dark:hidden"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.7) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        {/* Dark mode grid */}
        <div
          className="absolute inset-0 -z-10 hidden opacity-[0.08] dark:block"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        {/* Light glow */}
        <div className="absolute -left-32 top-10 -z-10 h-96 w-96 rounded-full bg-emerald-400/15 blur-[120px] dark:hidden" />

        {/* Dark glows */}
        <div className="absolute -left-32 top-10 -z-10 hidden h-96 w-96 rounded-full bg-emerald-500/20 blur-[120px] dark:block" />
        <div className="absolute -right-32 bottom-0 -z-10 hidden h-96 w-96 rounded-full bg-amber-400/10 blur-[120px] dark:block" />

        <div className="mx-auto max-w-7xl px-6 pb-12 pt-10 sm:pb-16 sm:pt-14">
          <div className="max-w-3xl">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-600/20 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
              <CalendarDays className="h-3.5 w-3.5" />
              <span>NWIS Football</span>
            </div>

            {/* Title */}
            <h1 className="mt-5 text-5xl font-black tracking-[-0.04em] text-gray-950 sm:text-6xl lg:text-7xl dark:text-white">
              {t("title")}
            </h1>

            {/* Description */}
            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600 sm:text-lg dark:text-white/60">
              {locale === "ar"
                ? "تابع مواعيد مباريات بطولة كرة القدم ونتائج جميع الفصول."
                : "Follow every fixture and result from the NWIS Football Tournament."}
            </p>
          </div>

          {/* Header stats */}
          <div className="mt-10 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">

            {/* Upcoming */}
            <div className="rounded-2xl border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">
                {common("upcoming")}
              </p>

              <p className="mt-2 text-3xl font-black text-gray-950 dark:text-white">
                {upcomingMatches.length}
              </p>
            </div>

            {/* Finished */}
            <div className="rounded-2xl border border-gray-200 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-white/40">
                {common("finished")}
              </p>

              <p className="mt-2 text-3xl font-black text-gray-950 dark:text-white">
                {finishedMatches.length}
              </p>
            </div>

            {/* Venue */}
            <div className="col-span-2 rounded-2xl border border-amber-500/20 bg-amber-50/80 p-5 shadow-sm backdrop-blur sm:col-span-1 dark:bg-amber-400/[0.06]">
              <p className="text-xs font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-300/60">
                {locale === "ar" ? "المكان" : "Venue"}
              </p>

              <p className="mt-2 font-bold text-gray-950 dark:text-white">
                NWIS Ground
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-12 sm:py-16">

        {/* =========================================================
            UPCOMING MATCHES
        ========================================================= */}
        <section>

          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                <Zap className="h-4 w-4" />

                <span>
                  {locale === "ar" ? "القادم" : "Next up"}
                </span>
              </div>

              <h2 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl dark:text-white">
                {common("upcoming")}
              </h2>
            </div>

            {upcomingMatches.length > 0 && (
              <div className="hidden items-center gap-2 text-sm font-semibold text-gray-500 sm:flex dark:text-gray-400">
                <span>
                  {upcomingMatches.length}{" "}
                  {locale === "ar" ? "مباريات" : "fixtures"}
                </span>
              </div>
            )}
          </div>

          {upcomingMatches.length === 0 ? (
            <div className="relative overflow-hidden rounded-[2rem] border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-800 dark:bg-gray-900/40">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
                <CalendarDays className="h-7 w-7 text-emerald-500" />
              </div>

              <h3 className="mt-5 text-xl font-bold text-gray-950 dark:text-white">
                {t("noUpcoming")}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
                {locale === "ar"
                  ? "ستظهر المباريات القادمة هنا بمجرد إضافتها."
                  : "Upcoming fixtures will appear here once they are added."}
              </p>
            </div>
          ) : (
            <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">

              {/* =====================================================
                  FEATURED UPCOMING
              ===================================================== */}
              {featuredMatch && (
                <div className="group relative overflow-hidden rounded-[2rem] border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-white p-6 shadow-xl shadow-emerald-950/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl sm:p-8 dark:border-emerald-500/20 dark:from-emerald-950 dark:via-[#08120d] dark:to-black dark:shadow-emerald-950/10">

                  {/* Glow */}
                  <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl transition duration-700 group-hover:bg-emerald-400/20" />

                  <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-amber-400/10 blur-3xl dark:bg-amber-400/5" />

                  <div className="relative">

                    {/* Top row */}
                    <div className="flex items-center justify-between gap-4">

                      <div className="flex items-center gap-2 rounded-full border border-emerald-600/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500 dark:bg-emerald-400" />

                        {featuredMatch.status === "live"
                          ? common("live")
                          : common("upcoming")}
                      </div>

                      <span className="text-xs font-medium text-gray-500 dark:text-white/40">
                        {formatShortDate(featuredMatch.match_date)}
                      </span>
                    </div>

                    {/* Date */}
                    <div className="mt-8">
                      <p className="text-sm font-medium text-gray-500 dark:text-white/40">
                        {formatDate(featuredMatch.match_date)}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-white/60">
                        <Clock3 className="h-4 w-4" />
                        <span>{formatTime(featuredMatch.match_date)}</span>

                        <span className="text-gray-300 dark:text-white/20">
                          •
                        </span>

                        <MapPin className="h-4 w-4" />
                        <span>NWIS Ground</span>
                      </div>
                    </div>

                    {/* Teams */}
                    <div className="mt-10 grid grid-cols-[1fr_auto_1fr] items-center gap-4 text-center">

                      {/* Home */}
                      <div>
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-gray-200 bg-gray-100 text-3xl font-black text-gray-950 shadow-lg sm:h-24 sm:w-24 sm:text-4xl dark:border-white/10 dark:bg-white/[0.06] dark:text-white">
                          {getClassName(featuredMatch.home_team_id)}
                        </div>

                        <p className="mt-4 text-sm font-bold text-gray-700 dark:text-white/80">
                          {locale === "ar" ? "المضيف" : "Home"}
                        </p>
                      </div>

                      {/* VS */}
                      <div className="flex h-11 w-11 items-center justify-center rounded-full border border-amber-500/20 bg-amber-500/10 text-xs font-black text-amber-700 dark:text-amber-300">
                        VS
                      </div>

                      {/* Away */}
                      <div>
                        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-gray-200 bg-gray-100 text-3xl font-black text-gray-950 shadow-lg sm:h-24 sm:w-24 sm:text-4xl dark:border-white/10 dark:bg-white/[0.06] dark:text-white">
                          {getClassName(featuredMatch.away_team_id)}
                        </div>

                        <p className="mt-4 text-sm font-bold text-gray-700 dark:text-white/80">
                          {locale === "ar" ? "الضيف" : "Away"}
                        </p>
                      </div>
                    </div>

                    {/* Bottom */}
                    <div className="mt-10 flex items-center justify-between border-t border-gray-200 pt-5 dark:border-white/10">
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-white/40">
                        <Trophy className="h-4 w-4" />

                        <span>
                          {locale === "ar"
                            ? "بطولة NWIS لكرة القدم"
                            : "NWIS Football Tournament"}
                        </span>
                      </div>

                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-300">
                        {locale === "ar"
                          ? "المباراة القادمة"
                          : "Next match"}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* =====================================================
                  OTHER UPCOMING
              ===================================================== */}
              <div className="grid gap-5">
                {remainingUpcoming.length === 0 ? (
                  <div className="hidden rounded-[2rem] border border-dashed border-gray-300 p-8 lg:flex lg:items-center lg:justify-center dark:border-gray-700">
                    <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                      {locale === "ar"
                        ? "لا توجد مباريات أخرى قادمة."
                        : "No more upcoming fixtures."}
                    </p>
                  </div>
                ) : (
                  remainingUpcoming.map((match, index) => (
                    <div
                      key={match.id}
                      className="group relative overflow-hidden rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900/60"
                    >
                      {/* Accent */}
                      <div className="absolute inset-y-0 start-0 w-1 bg-gradient-to-b from-emerald-500 to-amber-400 opacity-70" />

                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black uppercase tracking-[0.18em] text-gray-400 dark:text-gray-500">
                          {String(index + 2).padStart(2, "0")}
                        </span>

                        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                          {match.status === "live"
                            ? common("live")
                            : common("upcoming")}
                        </span>
                      </div>

                      <div className="mt-6 flex items-center justify-between gap-4">

                        <div>
                          <p className="text-2xl font-black text-gray-950 dark:text-white">
                            {getClassName(match.home_team_id)}
                          </p>

                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {locale === "ar" ? "المضيف" : "Home"}
                          </p>
                        </div>

                        <span className="text-xs font-black text-gray-400 dark:text-gray-500">
                          VS
                        </span>

                        <div className="text-end">
                          <p className="text-2xl font-black text-gray-950 dark:text-white">
                            {getClassName(match.away_team_id)}
                          </p>

                          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {locale === "ar" ? "الضيف" : "Away"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center gap-4 border-t border-gray-200 pt-4 text-xs text-gray-500 dark:border-gray-800 dark:text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {formatShortDate(match.match_date)}
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatTime(match.match_date)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </section>

        {/* =========================================================
            FINISHED MATCHES
        ========================================================= */}
        <section className="mt-20 sm:mt-24">

          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
                <Trophy className="h-4 w-4" />

                <span>
                  {locale === "ar" ? "النتائج" : "Results"}
                </span>
              </div>

              <h2 className="text-3xl font-black tracking-tight text-gray-950 sm:text-4xl dark:text-white">
                {common("finished")}
              </h2>
            </div>

            {finishedMatches.length > 0 && (
              <span className="hidden text-sm font-semibold text-gray-500 sm:block dark:text-gray-400">
                {finishedMatches.length}{" "}
                {locale === "ar" ? "نتيجة" : "results"}
              </span>
            )}
          </div>

          {finishedMatches.length === 0 ? (
            <div className="rounded-[2rem] border border-gray-200 bg-gray-50 p-12 text-center dark:border-gray-800 dark:bg-gray-900/40">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
                <Trophy className="h-7 w-7 text-amber-500" />
              </div>

              <h3 className="mt-5 text-xl font-bold text-gray-950 dark:text-white">
                {t("noFinished")}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
                {locale === "ar"
                  ? "ستظهر نتائج المباريات هنا بعد انتهاء المباريات."
                  : "Match results will appear here once games are completed."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">

              {finishedMatches.map((match, index) => (
                <Link
                  key={match.id}
                  href={`/${locale}/matches/${match.id}`}
                  className="group relative block overflow-hidden rounded-[2rem] border border-gray-200 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-xl sm:p-6 dark:border-gray-800 dark:bg-gray-900/60"
                >

                  {/* Left accent */}
                  <div className="absolute inset-y-0 start-0 w-1 bg-gradient-to-b from-amber-400 via-emerald-500 to-emerald-700 opacity-70" />

                  <div className="grid gap-5 md:grid-cols-[1fr_1.6fr_auto] md:items-center">

                    {/* Date */}
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-xs font-black text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div>
                        <p className="text-sm font-bold text-gray-950 dark:text-white">
                          {formatDate(match.match_date)}
                        </p>

                        <p className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatTime(match.match_date)}
                        </p>
                      </div>
                    </div>

                    {/* Result */}
                    <div className="flex items-center justify-center gap-5 text-center sm:gap-8">

                      {/* Home */}
                      <div className="min-w-12 flex-1 text-end">
                        <p className="text-xl font-black text-gray-950 dark:text-white">
                          {getClassName(match.home_team_id)}
                        </p>

                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                          {locale === "ar" ? "المضيف" : "Home"}
                        </p>
                      </div>

                      {/* Full Time Score */}
                      <div className="shrink-0">
                        <div className="inline-flex items-center rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2 dark:border-gray-700 dark:bg-gray-800">
                          <span className="text-2xl font-black text-gray-950 dark:text-white">
                            {match.home_score}
                          </span>

                          <span className="mx-2 text-gray-300 dark:text-gray-600">
                            —
                          </span>

                          <span className="text-2xl font-black text-gray-950 dark:text-white">
                            {match.away_score}
                          </span>
                        </div>

                        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                          {t("final")}
                        </p>
                      </div>

                      {/* Away */}
                      <div className="min-w-12 flex-1 text-start">
                        <p className="text-xl font-black text-gray-950 dark:text-white">
                          {getClassName(match.away_team_id)}
                        </p>

                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                          {locale === "ar" ? "الضيف" : "Away"}
                        </p>
                      </div>
                    </div>

                    {/* View */}
                    <div className="flex items-center justify-between border-t border-gray-200 pt-4 md:justify-end md:border-0 md:pt-0 dark:border-gray-800">

                      <span className="text-xs font-semibold text-gray-500 md:hidden dark:text-gray-400">
                        {t("viewMatch")}
                      </span>

                      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-50 transition-all duration-300 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 dark:border-gray-700 dark:bg-gray-800">
                        <ChevronRight className="h-4 w-4 text-gray-600 transition-transform duration-300 group-hover:translate-x-0.5 dark:text-gray-300 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* =========================================================
            ERROR
        ========================================================= */}
        {(matchesError || teamsError) && (
          <div className="mt-8 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
            {t("loadError")}
          </div>
        )}
      </div>

      {/* =========================================================
          BOTTOM STRIP
      ========================================================= */}
      <section className="border-t border-gray-200 bg-gray-950 text-white dark:border-gray-800 dark:bg-black">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
              NWIS Football
            </p>

            <p className="mt-2 text-lg font-bold">
              {locale === "ar"
                ? "كل مباراة تبدأ هنا."
                : "Every match starts here."}
            </p>
          </div>

          <Link
            href={`/${locale}`}
            className="group inline-flex items-center gap-2 text-sm font-bold text-white/70 transition hover:text-white"
          >
            <span>
              {locale === "ar"
                ? "العودة للرئيسية"
                : "Back to home"}
            </span>

            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
          </Link>
        </div>
      </section>
    </main>
  );
}