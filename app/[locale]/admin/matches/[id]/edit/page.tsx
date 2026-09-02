
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Pencil,
  ShieldCheck,
  Trophy,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin";
import { EditMatchForm } from "@/components/admin/EditMatchForm";

type Competition = {
  id: string;
  name: string;
  name_ar: string;
};

type Team = {
  id: string;
  competition_id: string;
  name: string;
  grade: number;
  section: string;
};

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

export default async function EditMatchPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  await requireAdmin(locale);

  const supabase = await createClient();
  const t = await getTranslations("adminMatches");

  // Get match
  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select(
      `
        id,
        competition_id,
        home_team_id,
        away_team_id,
        match_date,
        status,
        home_score,
        away_score
      `
    )
    .eq("id", id)
    .single();

  if (matchError || !match) {
    console.error("Match error:", matchError);
    notFound();
  }

  // Get competitions
  const {
    data: competitions,
    error: competitionsError,
  } = await supabase
    .from("competitions")
    .select("id, name, name_ar")
    .order("name");

  // Get teams
  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select(
      `
        id,
        competition_id,
        name,
        grade,
        section
      `
    )
    .order("grade")
    .order("section");

  if (competitionsError) {
    console.error("Competitions error:", competitionsError);
  }

  if (teamsError) {
    console.error("Teams error:", teamsError);
  }

  const typedMatch: Match = {
    id: match.id,
    competition_id: match.competition_id,
    home_team_id: match.home_team_id,
    away_team_id: match.away_team_id,
    match_date: match.match_date,
    status: match.status,
    home_score: match.home_score,
    away_score: match.away_score,
  };

  const typedCompetitions: Competition[] = (competitions ?? []).map(
    (competition) => ({
      id: competition.id,
      name: competition.name,
      name_ar: competition.name_ar,
    })
  );

  const typedTeams: Team[] = (teams ?? []).map((team) => ({
    id: team.id,
    competition_id: team.competition_id,
    name: team.name,
    grade: team.grade,
    section: team.section,
  }));

  const isArabic = locale === "ar";

  const homeTeam = typedTeams.find(
    (team) => team.id === typedMatch.home_team_id
  );

  const awayTeam = typedTeams.find(
    (team) => team.id === typedMatch.away_team_id
  );

  const competition = typedCompetitions.find(
    (item) => item.id === typedMatch.competition_id
  );

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

        <div className="mx-auto max-w-5xl px-6 pb-12 pt-8 sm:pb-16 sm:pt-12">
          {/* Back */}
          <Link
            href={`/${locale}/admin/matches`}
            className="group inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white/80 px-3.5 py-2 text-sm font-semibold text-gray-700 backdrop-blur transition-all hover:-translate-x-0.5 hover:border-gray-400 hover:bg-white dark:border-gray-700 dark:bg-gray-900/70 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-900"
          >
            {isArabic ? (
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            ) : (
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            )}

            {t("backToMatches")}
          </Link>

          {/* Header */}
          <div className="mt-8">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="h-4 w-4" />
              {isArabic ? "لوحة الإدارة" : "Admin Panel"}
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-950 text-white shadow-lg dark:bg-white dark:text-gray-950">
                <Pencil className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                  {t("editMatch")}
                </h1>

                <p className="mt-2 max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-400">
                  {t("editMatchDescription")}
                </p>
              </div>
            </div>
          </div>

          {/* Match Preview */}
          <div className="mt-10 overflow-hidden rounded-3xl border border-gray-200 bg-white/85 shadow-xl backdrop-blur dark:border-gray-800 dark:bg-gray-900/80">
            <div className="border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />

                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                  {locale === "ar"
                    ? competition?.name_ar ?? t("noCompetition")
                    : competition?.name ?? t("noCompetition")}
                </p>
              </div>

              <div className="mt-1 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <CalendarDays className="h-4 w-4" />

                <span>
                  {new Intl.DateTimeFormat(
                    locale === "ar" ? "ar-SA" : "en-US",
                    {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }
                  ).format(new Date(typedMatch.match_date))}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 px-5 py-7 sm:gap-10 sm:px-8 sm:py-9">
              {/* Home */}
              <div className="min-w-0 flex-1 text-right">
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

              <div className="shrink-0 rounded-2xl bg-gray-950 px-4 py-2 text-sm font-extrabold text-white shadow-lg dark:bg-white dark:text-gray-950">
                {typedMatch.status === "finished"
                  ? `${typedMatch.home_score} - ${typedMatch.away_score}`
                  : "VS"}
              </div>

              {/* Away */}
              <div className="min-w-0 flex-1">
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
      </section>

      {/* Form */}
      <section className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
        {competitionsError || teamsError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {t("loadError")}
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="border-b border-gray-200 px-6 py-5 dark:border-gray-800 sm:px-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  <Pencil className="h-5 w-5" />
                </div>

                <div>
                  <h2 className="text-lg font-extrabold">
                    {isArabic ? "تفاصيل المباراة" : "Match Details"}
                  </h2>

                  <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                    {isArabic
                      ? "حدّث معلومات المباراة أدناه."
                      : "Update the match information below."}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              <EditMatchForm
                locale={locale}
                match={typedMatch}
                competitions={typedCompetitions}
                teams={typedTeams}
              />
            </div>
          </div>
        )}
      </section>

      {/* Bottom Strip */}
      <section className="bg-gray-950 text-white dark:bg-black">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
              NWIS Football
            </p>

            <p className="mt-2 text-xl font-extrabold">
              {isArabic
                ? "حدّث تفاصيل المباراة بسهولة."
                : "Keep your match schedule accurate and up to date."}
            </p>
          </div>

          <Link
            href={`/${locale}/admin/matches`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-gray-950 transition hover:bg-gray-200 dark:bg-gray-100 dark:hover:bg-white"
          >
            {t("backToMatches")}

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
