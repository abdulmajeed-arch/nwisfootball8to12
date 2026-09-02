import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  ArrowRight,
  Pencil,
  Plus,
  ShieldCheck,
  Trophy,
  UserRound,
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

type Player = {
  id: string;
  full_name: string;
  position: string;
  nationality: string | null;
  photo_url: string | null;
};

export default async function AdminTeamPage({
  params,
}: {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}) {
  const { locale, id } = await params;

  await requireAdmin(locale);

  const supabase = await createClient();
  const t = await getTranslations("adminTeams");

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .select(`
      id,
      competition_id,
      grade,
      section,
      name,
      logo_url
    `)
    .eq("id", id)
    .single();

  if (teamError || !team) {
    console.error("Team error:", teamError);
    notFound();
  }

  const { data: players, error: playersError } = await supabase
    .from("players")
    .select(`
      id,
      full_name,
      position,
      nationality,
      photo_url
    `)
    .eq("team_id", team.id)
    .order("full_name");

  if (playersError) {
    console.error("Players error:", playersError);
  }

  const typedPlayers: Player[] = players ?? [];
  const isArabic = locale === "ar";

  const positionLabel = (position: string) => {
    const labels: Record<string, { en: string; ar: string }> = {
      goalkeeper: {
        en: "Goalkeeper",
        ar: "حارس مرمى",
      },
      defender: {
        en: "Defender",
        ar: "مدافع",
      },
      midfielder: {
        en: "Midfielder",
        ar: "لاعب وسط",
      },
      forward: {
        en: "Forward",
        ar: "مهاجم",
      },
    };

    return isArabic
      ? labels[position]?.ar ?? position
      : labels[position]?.en ?? position;
  };

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
            href={`/${locale}/admin/teams`}
            className="group inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white/80 px-3.5 py-2 text-sm font-semibold text-gray-700 backdrop-blur transition-all hover:-translate-x-0.5 hover:border-gray-400 hover:bg-white dark:border-gray-700 dark:bg-gray-900/70 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-900"
          >
            {isArabic ? (
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            ) : (
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            )}

            {t("backToTeams")}
          </Link>

          {/* Class Header */}
          <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex items-center gap-5">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-3xl bg-gray-950 text-white shadow-xl dark:bg-white dark:text-gray-950 sm:h-28 sm:w-28">
                {team.logo_url ? (
                  <img
                    src={team.logo_url}
                    alt={team.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Trophy className="h-11 w-11" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck className="h-4 w-4" />
                  {isArabic ? "لوحة الإدارة" : "Admin Panel"}
                </div>

                <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
                  {team.name}
                </h1>

                <p className="mt-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                  {t("grade")} {team.grade}
                  <span className="mx-2">•</span>
                  {t("section")} {team.section}
                </p>
              </div>
            </div>

            <Link
              href={`/${locale}/admin/players/new`}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-bold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
            >
              <Plus className="h-4 w-4" />
              {t("addPlayer")}
            </Link>
          </div>

          {/* Overview */}
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-gray-200 bg-white/80 p-5 backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
                  <Users className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-2xl font-extrabold">
                    {typedPlayers.length}
                  </p>

                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {isArabic ? "اللاعبون" : "Players"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white/80 p-5 backdrop-blur dark:border-gray-800 dark:bg-gray-900/70">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                  <Trophy className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-2xl font-extrabold">
                    {team.grade}
                  </p>

                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    {isArabic ? "الصف" : "Grade"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Players */}
      <section className="mx-auto max-w-7xl px-6 py-10 sm:py-14">
        <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
              {isArabic ? "القائمة" : "Roster"}
            </p>

            <h2 className="mt-1 text-2xl font-extrabold tracking-tight">
              {t("players")}
            </h2>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {typedPlayers.length} {t("playersAssigned")}
            </p>
          </div>
        </div>

        {playersError ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {t("playersLoadError")}
          </div>
        ) : typedPlayers.length === 0 ? (
          <div className="rounded-3xl border border-gray-200 bg-white p-10 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900 sm:p-16">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <Users className="h-8 w-8" />
            </div>

            <h3 className="mt-6 text-2xl font-extrabold">
              {t("noPlayers")}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-gray-600 dark:text-gray-400">
              {t("noPlayersDescription")}
            </p>

            <Link
              href={`/${locale}/admin/players/new`}
              className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
            >
              <Plus className="h-4 w-4" />
              {t("addPlayer")}
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {typedPlayers.map((player) => (
              <div
                key={player.id}
                className="group overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900"
              >
                {/* Player */}
                <div className="flex items-center gap-4 p-5">
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800">
                    {player.photo_url ? (
                      <img
                        src={player.photo_url}
                        alt={player.full_name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <UserRound className="h-7 w-7 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3 className="truncate text-lg font-extrabold">
                      {player.full_name}
                    </h3>

                    <p className="mt-1 text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                      {positionLabel(player.position)}
                    </p>

                    {player.nationality && (
                      <p className="mt-1 truncate text-xs text-gray-500 dark:text-gray-400">
                        {player.nationality}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action */}
                <div className="border-t border-gray-200 p-4 dark:border-gray-800">
                  <Link
                    href={`/${locale}/admin/players/${player.id}/edit`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm font-bold text-gray-800 transition hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                  >
                    <Pencil className="h-4 w-4" />
                    {t("editPlayer")}
                  </Link>
                </div>
              </div>
            ))}
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
                ? "إدارة قائمة الفصل من مكان واحد."
                : "Manage this class roster from one place."}
            </p>
          </div>

          <Link
            href={`/${locale}/admin/teams`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-gray-950 transition hover:bg-gray-200 dark:bg-gray-100 dark:hover:bg-white"
          >
            {t("backToTeams")}

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