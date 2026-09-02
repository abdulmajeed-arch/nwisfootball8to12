``
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Pencil,
  Plus,
  ShieldCheck,
  Trophy,
  Users,
  XCircle,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin";

type Match = {
  id: string;
  competition_id: string;
  home_team_id: string;
  away_team_id: string;
  match_date: string;
  status: string;
  home_score: number;
  away_score: number;
};

type Team = {
  id: string;
  name: string;
  grade: number;
  section: string;
};

type Competition = {
  id: string;
  name: string;
  name_ar: string;
};

export default async function AdminMatchesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  await requireAdmin(locale);

  const supabase = await createClient();
  const t = await getTranslations("adminMatches");

  // Get matches
  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select(`
      id,
      competition_id,
      home_team_id,
      away_team_id,
      match_date,
      status,
      home_score,
      away_score
    `)
    .order("match_date", { ascending: true });

  if (matchesError) {
    console.error("Matches error:", matchesError);
  }

  // Get teams
  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("id, name, grade, section");

  if (teamsError) {
    console.error("Teams error:", teamsError);
  }

  // Get competitions
  const { data: competitions, error: competitionsError } = await supabase
    .from("competitions")
    .select("id, name, name_ar");

  if (competitionsError) {
    console.error("Competitions error:", competitionsError);
  }

  const typedMatches: Match[] = matches ?? [];
  const typedTeams: Team[] = teams ?? [];
  const typedCompetitions: Competition[] = competitions ?? [];

  function getTeam(teamId: string) {
    return typedTeams.find((team) => team.id === teamId);
  }

  function getCompetition(competitionId: string) {
    return typedCompetitions.find(
      (competition) => competition.id === competitionId
    );
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat(
      locale === "ar" ? "ar-SA" : "en-US",
      {
        dateStyle: "medium",
        timeStyle: "short",
      }
    ).format(new Date(date));
  }

  const isArabic = locale === "ar";

  const upcomingCount = typedMatches.filter(
    (match) =>
      match.status !== "finished" && match.status !== "cancelled"
  ).length;

  const finishedCount = typedMatches.filter(
    (match) => match.status === "finished"
  ).length;

  const cancelledCount = typedMatches.filter(
    (match) => match.status === "cancelled"
  ).length;

  function getStatusStyle(status: string) {
    if (status === "finished") {
      return {
        wrapper:
          "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
        icon: CheckCircle2,
      };
    }

    if (status === "cancelled") {
      return {
        wrapper:
          "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
        icon: XCircle,
      };
    }

    return {
      wrapper:
        "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
      icon: Clock3,
    };
  }

  return (
    <main className="min-h-screen bg-white text-gray-950 dark:bg-gray-950 dark:text-white">
      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-gray-200 dark:border-gray-800">
        <div className="absolute inset-0 -z-20 bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-emerald-950 dark:via-gray-950 dark:to-black" />

        <div
          className="absolute inset-0 -z-10 opacity-40 dark:opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(16,185,129,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.08) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />

        <div className="absolute -left-32 top-0 -z-10 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute -right-32 bottom-0 -z-10 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl dark:bg-amber-500/10" />

        <div className="mx-auto max-w-7xl px-6 pb-12 pt-8 sm:pb-16 sm:pt-12 lg:pt-16">
          {/* Back */}
          <Link
            href={`/${locale}/admin`}
            className="group inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white/80 px-3.5 py-2 text-sm font-semibold text-gray-700 backdrop-blur transition-all hover:-translate-x-0.5 hover:border-gray-400 hover:bg-white dark:border-gray-700 dark:bg-gray-900/70 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-900"
          >
            {isArabic ? (
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            ) : (
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            )}

            {t("backToAdmin")}
          </Link>

          {/* Header */}
          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                {isArabic ? "لوحة الإدارة" : "Admin Panel"}
              </div>

              <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
                {t("title")}
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-400">
                {t("subtitle")}
              </p>
            </div>

            <Link
              href={`/${locale}/admin/matches/new`}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
            >
              <Plus className="h-4 w-4" />
              {t("addMatch")}
            </Link>
          </div>

          {/* Overview Stats */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white/80 p-5 backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  <CalendarDays className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-2xl font-extrabold">
                    {typedMatches.length}
                  </p>

                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {isArabic ? "إجمالي المباريات" : "Total Matches"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white/80 p-5 backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                  <Clock3 className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-2xl font-extrabold">
                    {upcomingCount}
                  </p>

                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {isArabic ? "القادمة" : "Upcoming"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white/80 p-5 backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-2xl font-extrabold">
                    {finishedCount}
                  </p>

                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {isArabic ? "منتهية" : "Finished"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white/80 p-5 backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400">
                  <XCircle className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-2xl font-extrabold">
                    {cancelledCount}
                  </p>

                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {isArabic ? "ملغاة" : "Cancelled"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Matches */}
      <section className="mx-auto max-w-7xl px-6 py-10 sm:py-14">
        <div className="mb-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
            {isArabic ? "المباريات" : "Fixtures"}
          </p>

          <h2 className="mt-1 text-2xl font-extrabold tracking-tight">
            {t("title")}
          </h2>

          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {typedMatches.length}{" "}
            {isArabic ? "مباراة مسجلة" : "matches scheduled"}
          </p>
        </div>

        {/* Errors */}
        {matchesError || teamsError || competitionsError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            <div className="flex items-start gap-3">
              <XCircle className="mt-0.5 h-5 w-5 shrink-0" />
              <p>{t("loadError")}</p>
            </div>
          </div>
        ) : typedMatches.length === 0 ? (
          /* Empty */
          <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <CalendarDays className="h-8 w-8" />
            </div>

            <h2 className="mt-6 text-2xl font-extrabold">
              {t("noMatches")}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-600 dark:text-gray-400">
              {t("noMatchesDescription")}
            </p>

            <Link
              href={`/${locale}/admin/matches/new`}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
            >
              <Plus className="h-4 w-4" />
              {t("addMatch")}
            </Link>
          </div>
        ) : (
          /* Matches */
          <div className="space-y-5">
            {typedMatches.map((match) => {
              const homeTeam = getTeam(match.home_team_id);
              const awayTeam = getTeam(match.away_team_id);
              const competition = getCompetition(match.competition_id);

              const statusStyle = getStatusStyle(match.status);
              const StatusIcon = statusStyle.icon;

              return (
                <div
                  key={match.id}
                  className="group overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
                >
                  {/* Match Header */}
                  <div className="flex flex-col gap-4 border-b border-gray-200 px-5 py-4 dark:border-gray-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />

                        <p className="truncate text-sm font-bold text-gray-800 dark:text-gray-200">
                          {locale === "ar"
                            ? competition?.name_ar ?? t("noCompetition")
                            : competition?.name ?? t("noCompetition")}
                        </p>
                      </div>

                      <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                        <CalendarDays className="h-4 w-4 shrink-0" />
                        <span>{formatDate(match.match_date)}</span>
                      </div>
                    </div>

                    <div
                      className={`inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${statusStyle.wrapper}`}
                    >
                      <StatusIcon className="h-3.5 w-3.5" />
                      {match.status}
                    </div>
                  </div>

                  {/* Teams / Score */}
                  <div className="px-5 py-7 sm:px-8 sm:py-9">
                    <div className="flex items-center justify-center gap-4 sm:gap-10">
                      {/* Home */}
                      <div className="min-w-0 flex-1 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-lg font-extrabold sm:text-xl">
                              {homeTeam?.name ?? t("unknownTeam")}
                            </p>

                            {homeTeam && (
                              <p className="mt-1 text-xs font-semibold text-gray-500 dark:text-gray-400 sm:text-sm">
                                {t("grade")} {homeTeam.grade}
                                <span className="mx-1.5">•</span>
                                {homeTeam.section}
                              </p>
                            )}
                          </div>

                          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 sm:flex dark:bg-emerald-950 dark:text-emerald-400">
                            <Users className="h-5 w-5" />
                          </div>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="flex shrink-0 flex-col items-center">
                        <div className="rounded-2xl bg-gray-950 px-4 py-2.5 text-xl font-extrabold text-white shadow-lg dark:bg-white dark:text-gray-950 sm:px-5 sm:py-3 sm:text-2xl">
                          {match.status === "finished"
                            ? `${match.home_score} - ${match.away_score}`
                            : "VS"}
                        </div>

                        {match.status === "finished" && (
                          <span className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                            {isArabic ? "النتيجة النهائية" : "Final Score"}
                          </span>
                        )}
                      </div>

                      {/* Away */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-3">
                          <div className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-700 sm:flex dark:bg-amber-950 dark:text-amber-400">
                            <Users className="h-5 w-5" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-lg font-extrabold sm:text-xl">
                              {awayTeam?.name ?? t("unknownTeam")}
                            </p>

                            {awayTeam && (
                              <p className="mt-1 text-xs font-semibold text-gray-500 dark:text-gray-400 sm:text-sm">
                                {t("grade")} {awayTeam.grade}
                                <span className="mx-1.5">•</span>
                                {awayTeam.section}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="border-t border-gray-200 p-4 dark:border-gray-800">
                    <div className="flex flex-col gap-3 sm:flex-row">
                      {match.status !== "finished" &&
                        match.status !== "cancelled" && (
                          <Link
                            href={`/${locale}/admin/matches/${match.id}/stats`}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-3 text-sm font-bold !text-white transition-all hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:!text-gray-950 dark:hover:bg-gray-200"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            {t("addStats")}
                          </Link>
                        )}

                      <Link
                        href={`/${locale}/admin/matches/${match.id}/edit`}
                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-bold text-gray-800 transition-all hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                      >
                        <Pencil className="h-4 w-4" />
                        {t("editMatch")}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Bottom Strip */}
      <section className="bg-gray-950 text-white dark:bg-black">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
              NWIS Football
            </p>

            <p className="mt-2 text-xl font-extrabold">
              {isArabic
                ? "إدارة جميع مباريات البطولة من مكان واحد."
                : "Manage every tournament match from one place."}
            </p>
          </div>

          <Link
            href={`/${locale}/admin`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-gray-950 transition hover:bg-gray-200 dark:bg-gray-100 dark:hover:bg-white"
          >
            {t("backToAdmin")}

            {isArabic ? (
              <ArrowLeft className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </Link>
        </div>
      </section>
    </main>
  );
}
