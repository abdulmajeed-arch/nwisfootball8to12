import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import {
  ArrowLeft,
  ArrowRight,
  Shield,
  Users,
  UserRound,
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

type Player = {
  id: string;
  full_name: string;
  position: string;
  nationality: string | null;
  photo_url: string | null;
};

export default async function TeamPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const supabase = await createClient();
  const t = await getTranslations("team");

  const isArabic = locale === "ar";

  // Get class
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

  // Get players assigned to this class
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

  const positionLabel = (position: string) => {
    if (isArabic) {
      switch (position) {
        case "goalkeeper":
          return "حارس مرمى";
        case "defender":
          return "مدافع";
        case "midfielder":
          return "وسط";
        case "forward":
          return "مهاجم";
        default:
          return position;
      }
    }

    switch (position) {
      case "goalkeeper":
        return "Goalkeeper";
      case "defender":
        return "Defender";
      case "midfielder":
        return "Midfielder";
      case "forward":
        return "Forward";
      default:
        return position;
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-white dark:bg-[#050806]">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-gray-200 dark:border-white/10">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-[-220px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-emerald-500/15 blur-[120px]" />
          <div className="absolute right-[-120px] top-20 h-[350px] w-[350px] rounded-full bg-yellow-400/10 blur-[100px]" />
          <div className="absolute bottom-[-180px] left-[-100px] h-[350px] w-[350px] rounded-full bg-emerald-600/10 blur-[100px]" />
        </div>

        {/* Fine grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          {/* Back */}
          <Link
            href={`/${locale}/teams`}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-gray-950 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft
              className={`h-4 w-4 transition-transform ${
                isArabic
                  ? "group-hover:translate-x-1"
                  : "group-hover:-translate-x-1"
              }`}
            />
            {t("backToTeams")}
          </Link>

          <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1fr_auto]">
            {/* Class information */}
            <div className={isArabic ? "text-right" : "text-left"}>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                <Shield className="h-3.5 w-3.5" />
                {isArabic ? "الفصل" : "Class"}
              </div>

              <div className="flex flex-wrap items-end gap-4">
                <h1 className="text-6xl font-black tracking-[-0.06em] text-gray-950 sm:text-7xl lg:text-8xl dark:text-white">
                  {team.grade}
                  {team.section}
                </h1>

                <div className="mb-2 h-2.5 w-2.5 rounded-full bg-yellow-400 shadow-[0_0_18px_rgba(250,204,21,.7)]" />
              </div>

              <p className="mt-3 text-lg font-medium text-gray-500 dark:text-gray-400">
                {team.name}
              </p>

              <div
                className={`mt-6 flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 ${
                  isArabic ? "justify-end" : ""
                }`}
              >
                <span className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 py-2 dark:border-white/10 dark:bg-white/[0.04]">
                  <Users className="h-4 w-4 text-emerald-500" />
                  {typedPlayers.length} {t("players")}
                </span>

                <span className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 dark:border-white/10 dark:bg-white/[0.04]">
                  {t("grade")} {team.grade}
                </span>

                <span className="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 dark:border-white/10 dark:bg-white/[0.04]">
                  {t("section")} {team.section}
                </span>
              </div>
            </div>

            {/* Class badge */}
            <div className="relative mx-auto lg:mx-0">
              <div className="absolute inset-[-20px] rounded-[2.5rem] bg-emerald-500/10 blur-2xl" />

              <div className="relative flex h-48 w-48 items-center justify-center overflow-hidden rounded-[2.5rem] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/15 via-gray-100 to-yellow-400/10 shadow-2xl shadow-emerald-950/10 sm:h-56 sm:w-56 dark:from-emerald-500/20 dark:via-white/[0.04] dark:to-yellow-400/10">
                {team.logo_url ? (
                  <img
                    src={team.logo_url}
                    alt={team.name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <Shield className="mx-auto h-12 w-12 text-emerald-500" />
                    <p className="mt-3 text-5xl font-black tracking-[-0.06em] text-gray-950 dark:text-white">
                      {team.grade}
                      {team.section}
                    </p>
                  </div>
                )}

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/10" />
              </div>
            </div>
          </div>

          {/* Bottom stats */}
          <div className="mt-12 grid grid-cols-2 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/[0.03] sm:grid-cols-3">
            <div className="border-r border-gray-200 p-5 dark:border-white/10">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                {isArabic ? "الفصل" : "Class"}
              </p>
              <p className="mt-2 text-2xl font-black text-gray-950 dark:text-white">
                {team.grade}
                {team.section}
              </p>
            </div>

            <div className="p-5 sm:border-r sm:border-gray-200 dark:sm:border-white/10">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                {isArabic ? "اللاعبون" : "Players"}
              </p>
              <p className="mt-2 text-2xl font-black text-gray-950 dark:text-white">
                {typedPlayers.length}
              </p>
            </div>

            <div className="col-span-2 border-t border-gray-200 p-5 dark:border-white/10 sm:col-span-1 sm:border-t-0">
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-gray-400">
                {isArabic ? "الحالة" : "Status"}
              </p>
              <p className="mt-2 inline-flex items-center gap-2 text-2xl font-black text-gray-950 dark:text-white">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                {isArabic ? "مسجل" : "Registered"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ROSTER */}
      <section className="relative mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-10">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
              {isArabic ? "قائمة اللاعبين" : "Squad"}
            </div>

            <h2 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white sm:text-4xl">
              {t("roster")}
            </h2>

            <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 dark:text-gray-400">
              {t("rosterDescription")}
            </p>
          </div>

          <div className="flex h-11 w-fit items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-4 text-sm font-bold text-gray-600 dark:border-white/10 dark:bg-white/[0.03] dark:text-gray-300">
            <Users className="h-4 w-4 text-emerald-500" />
            {typedPlayers.length}
          </div>
        </div>

        {playersError ? (
          <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-10 text-center text-red-600 dark:text-red-400">
            <p className="font-bold">{t("playersLoadError")}</p>
          </div>
        ) : typedPlayers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50/50 p-14 text-center dark:border-white/10 dark:bg-white/[0.02]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
              <Users className="h-7 w-7 text-emerald-500" />
            </div>

            <p className="mt-5 font-bold text-gray-950 dark:text-white">
              {t("noPlayers")}
            </p>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
              {t("noPlayersDescription")}
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {typedPlayers.map((player, index) => (
              <Link
                key={player.id}
                href={`/${locale}/players/${player.id}`}
                className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-5 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-950/5 dark:border-white/10 dark:bg-white/[0.03] dark:hover:border-emerald-500/30"
              >
                {/* Hover glow */}
                <div className="pointer-events-none absolute -right-12 -top-12 h-28 w-28 rounded-full bg-emerald-500/0 blur-3xl transition group-hover:bg-emerald-500/10" />

                <div className="relative flex items-center gap-4">
                  {/* Player photo */}
                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 dark:border-white/10 dark:bg-white/[0.06]">
                    {player.photo_url ? (
                      <img
                        src={player.photo_url}
                        alt={player.full_name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound className="h-7 w-7 text-gray-400" />
                    )}
                  </div>

                  {/* Player info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-bold text-gray-950 dark:text-white">
                      {player.full_name}
                    </p>

                    <div className="mt-1 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {positionLabel(player.position)}
                      </p>
                    </div>

                    {player.nationality && (
                      <p className="mt-1 truncate text-xs text-gray-400">
                        {player.nationality}
                      </p>
                    )}
                  </div>

                  {/* Arrow */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-400 transition group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 dark:border-white/10">
                    <ArrowRight
                      className={`h-4 w-4 transition-transform ${
                        isArabic
                          ? "group-hover:-translate-x-0.5"
                          : "group-hover:translate-x-0.5"
                      }`}
                    />
                  </div>
                </div>

                {/* Card bottom line */}
                <div className="relative mt-5 h-px overflow-hidden bg-gray-100 dark:bg-white/10">
                  <div className="absolute inset-y-0 left-0 w-0 bg-emerald-500 transition-all duration-500 group-hover:w-full" />
                </div>

                <div className="relative mt-3 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.15em] text-gray-400">
                  <span>
                    {isArabic ? "اللاعب" : "Player"} {index + 1}
                  </span>

                  <span className="text-emerald-500 opacity-0 transition group-hover:opacity-100">
                    {isArabic ? "عرض الملف" : "View profile"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* BOTTOM BRAND STRIP */}
      <section className="border-t border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-black/20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-7 sm:flex-row sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
              <Shield className="h-4 w-4 text-emerald-500" />
            </div>

            <div>
              <p className="text-sm font-black text-gray-950 dark:text-white">
                NWIS Football
              </p>
              <p className="text-xs text-gray-400">
                {isArabic
                  ? "بطولة كرة القدم المدرسية"
                  : "School Football Tournament"}
              </p>
            </div>
          </div>

          <Link
            href={`/${locale}/teams`}
            className="group inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition hover:text-gray-950 dark:text-gray-400 dark:hover:text-white"
          >
            {t("backToTeams")}

            <ArrowRight
              className={`h-4 w-4 transition-transform ${
                isArabic
                  ? "group-hover:-translate-x-1"
                  : "group-hover:translate-x-1"
              }`}
            />
          </Link>
        </div>
      </section>
    </main>
  );
}
