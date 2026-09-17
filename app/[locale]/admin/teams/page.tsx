import Link from "next/link";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Pencil,
  Plus,
  ShieldCheck,
  Trophy,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin";

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
};

export default async function AdminTeamsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  await requireAdmin(locale);

  const supabase = await createClient();
  const t = await getTranslations("adminTeams");

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
  .eq(
    "competition_id",
    "812b117a-df69-40ce-b4b2-62ae9ca3e8cf"
  )
  .order("grade")
  .order("section");

  if (teamsError) {
    console.error("Teams error:", teamsError);
  }

  const { data: competitions, error: competitionsError } = await supabase
    .from("competitions")
    .select("id, name, name_ar");

  if (competitionsError) {
    console.error("Competitions error:", competitionsError);
  }

  const typedTeams: Team[] = teams ?? [];
  const typedCompetitions: Competition[] = competitions ?? [];

  function getCompetition(competitionId: string) {
    return typedCompetitions.find(
      (competition) => competition.id === competitionId
    );
  }

  const isArabic = locale === "ar";

  const grade8Count = typedTeams.filter((team) => team.grade === 8).length;
const grade9Count = typedTeams.filter((team) => team.grade === 9).length;
const grade10Count = typedTeams.filter((team) => team.grade === 10).length;
const grade11Count = typedTeams.filter((team) => team.grade === 11).length;
const grade12Count = typedTeams.filter((team) => team.grade === 12).length;

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
              href={`/${locale}/admin/teams/new`}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
            >
              <Plus className="h-4 w-4" />
              {t("addTeam")}
            </Link>
          </div>

          {/* Overview Stats */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            <div className="rounded-2xl border border-gray-200 bg-white/80 p-5 backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  <Trophy className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-2xl font-extrabold">
                    {typedTeams.length}
                  </p>

                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {isArabic ? "إجمالي الفصول" : "Total Classes"}
                  </p>
                </div>
              </div>
            </div>

{/* Grade 8 */}
<div className="rounded-2xl border border-gray-200 bg-white/80 p-5 backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400">
      <Users className="h-5 w-5" />
    </div>

    <div>
      <p className="text-2xl font-extrabold">{grade8Count}</p>

      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {isArabic ? "الصف الثامن" : "Grade 8"}
      </p>
    </div>
  </div>
</div>

{/* Grade 9 */}
<div className="rounded-2xl border border-gray-200 bg-white/80 p-5 backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-400">
      <Users className="h-5 w-5" />
    </div>

    <div>
      <p className="text-2xl font-extrabold">{grade9Count}</p>

      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {isArabic ? "الصف التاسع" : "Grade 9"}
      </p>
    </div>
  </div>
</div>

{/* Grade 10 */}
<div className="rounded-2xl border border-gray-200 bg-white/80 p-5 backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
      <Users className="h-5 w-5" />
    </div>

    <div>
      <p className="text-2xl font-extrabold">{grade10Count}</p>

      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {isArabic ? "الصف العاشر" : "Grade 10"}
      </p>
    </div>
  </div>
</div>

{/* Grade 11 */}
<div className="rounded-2xl border border-gray-200 bg-white/80 p-5 backdrop-blur dark:border-gray-900 dark:bg-gray-900/70">
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
      <Users className="h-5 w-5" />
    </div>

    <div>
      <p className="text-2xl font-extrabold">{grade11Count}</p>

      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {isArabic ? "الصف الحادي عشر" : "Grade 11"}
      </p>
    </div>
  </div>
</div>

{/* Grade 12 */}
<div className="rounded-2xl border border-gray-200 bg-white/80 p-5 backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
  <div className="flex items-center gap-3">
    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">
      <Users className="h-5 w-5" />
    </div>

    <div>
      <p className="text-2xl font-extrabold">{grade12Count}</p>

      <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        {isArabic ? "الصف الثاني عشر" : "Grade 12"}
      </p>
    </div>
  </div>
</div>
          </div>
        </div>
      </section>

      {/* Classes */}
      <section className="mx-auto max-w-7xl px-6 py-10 sm:py-14">
        {teamsError || competitionsError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {t("loadError")}
          </div>
        ) : typedTeams.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <Trophy className="h-8 w-8" />
            </div>

            <h2 className="mt-6 text-2xl font-extrabold">
              {t("noTeams")}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-gray-600 dark:text-gray-400">
              {t("noTeamsDescription")}
            </p>

            <Link
              href={`/${locale}/admin/teams/new`}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
            >
              <Plus className="h-4 w-4" />
              {t("addTeam")}
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-7 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
                  {isArabic ? "البطولة" : "Tournament"}
                </p>

                <h2 className="mt-1 text-2xl font-extrabold tracking-tight">
                  {isArabic ? "جميع الفصول" : "All Classes"}
                </h2>
              </div>

              <span className="rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-600 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400">
                {typedTeams.length}{" "}
                {isArabic
                  ? "فصول"
                  : typedTeams.length === 1
                    ? "class"
                    : "classes"}
              </span>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {typedTeams.map((team) => {
                const competition = getCompetition(team.competition_id);

                return (
                  <div
                    key={team.id}
                    className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
                  >
                    {/* Class Header */}
                    <div className="flex items-center gap-4 p-5">
                      <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        {team.logo_url ? (
                          <img
                            src={team.logo_url}
                            alt={team.name}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <Trophy className="h-7 w-7" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <h2 className="truncate text-xl font-extrabold">
                          {team.name}
                        </h2>

                        <p className="mt-1 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                          {t("grade")} {team.grade}{" "}
                          <span className="mx-1.5 text-gray-400">•</span>
                          {t("section")} {team.section}
                        </p>
                      </div>
                    </div>

                    {/* Competition */}
                    <div className="border-t border-gray-200 px-5 py-4 dark:border-gray-800">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                          <CalendarDays className="h-4 w-4" />
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                            {t("competition")}
                          </p>

                          <p className="mt-0.5 truncate font-bold">
                            {locale === "ar"
                              ? competition?.name_ar ?? t("noCompetition")
                              : competition?.name ?? t("noCompetition")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                

                      {/* Actions */}
{/* Actions */}
<div className="border-t border-gray-200 p-4 dark:border-gray-800">
  <Link
    href={`/${locale}/admin/teams/${team.id}`}
    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-950 px-4 py-2.5 text-sm font-bold !text-white transition hover:bg-gray-800 dark:bg-white dark:!text-gray-950 dark:hover:bg-gray-200"
  >
    <Trophy className="h-4 w-4 shrink-0" />
    <span>{t("view")}</span>
  </Link>
</div>
</div>
                  
                );
              })}
            </div>
          </>
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
                ? "إدارة جميع الفصول من مكان واحد."
                : "Manage every class from one place."}
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