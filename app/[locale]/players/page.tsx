import Link from "next/link";
import { getTranslations } from "next-intl/server";

import {
  ArrowRight,
  Shield,
  UserRound,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

export default async function PlayersPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  const supabase = await createClient();
  const t = await getTranslations("players");

  const isArabic = locale === "ar";

    const { data: players, error } = await supabase
    .from("players")
    .select(`
      id,
      full_name,
      position,
      nationality,
      photo_url,
      team:teams!inner (
        id,
        name,
        grade,
        section,
        competition_id
      )
    `)
    .eq(
      "team.competition_id",
      "812b117a-df69-40ce-b4b2-62ae9ca3e8cf"
    )
    .order("full_name");

  if (error) {
    console.error("Players error:", error);
  }

  const typedPlayers = players ?? [];

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
        {/* Glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[15%] top-[-180px] h-[420px] w-[420px] rounded-full bg-emerald-500/15 blur-[120px]" />
          <div className="absolute right-[-100px] top-20 h-[360px] w-[360px] rounded-full bg-yellow-400/10 blur-[110px]" />
          <div className="absolute bottom-[-220px] left-1/2 h-[400px] w-[400px] -translate-x-1/2 rounded-full bg-emerald-600/10 blur-[120px]" />
        </div>

        {/* Grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-20">
          <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
            <div className={isArabic ? "text-right" : "text-left"}>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                <Users className="h-3.5 w-3.5" />
                {isArabic ? "اللاعبون" : "Players"}
              </div>

              <h1 className="max-w-4xl text-5xl font-black tracking-[-0.05em] text-gray-950 sm:text-6xl lg:text-7xl dark:text-white">
                {t("title")}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-gray-500 dark:text-gray-400 sm:text-lg">
                {t("subtitle")}
              </p>
            </div>

            {/* Player count */}
            <div className="relative">
              <div className="absolute inset-0 rounded-3xl bg-emerald-500/10 blur-2xl" />

              <div className="relative min-w-[170px] rounded-3xl border border-gray-200 bg-gray-50 p-6 dark:border-white/10 dark:bg-white/[0.04]">
                <Users className="h-5 w-5 text-emerald-500" />

                <p className="mt-4 text-5xl font-black tracking-[-0.06em] text-gray-950 dark:text-white">
                  {typedPlayers.length}
                </p>

                <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-gray-400">
                  {isArabic ? "لاعب مسجل" : "Registered Players"}
                </p>
              </div>
            </div>
          </div>

          {/* Decorative line */}
          <div className="mt-12 flex items-center gap-3">
            <div className="h-px flex-1 bg-gradient-to-r from-emerald-500/40 to-transparent" />
            <div className="h-2 w-2 rounded-full bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,.7)]" />
            <div className="h-px w-16 bg-gray-200 dark:bg-white/10" />
          </div>
        </div>
      </section>

      {/* PLAYERS */}
      <section className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-10 lg:py-16">
        {!players || players.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50/50 p-16 text-center dark:border-white/10 dark:bg-white/[0.02]">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
              <UserRound className="h-7 w-7 text-emerald-500" />
            </div>

            <h2 className="mt-5 text-xl font-black text-gray-950 dark:text-white">
              {t("noPlayers")}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
              {t("noPlayersDescription")}
            </p>
          </div>
        ) : (
          <>
            {/* Section heading */}
            <div
              className={`mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end ${
                isArabic ? "sm:flex-row-reverse" : ""
              }`}
            >
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                  {isArabic ? "دليل البطولة" : "Tournament Directory"}
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-950 dark:text-white">
                  {isArabic ? "جميع اللاعبين" : "All Players"}
                </h2>
              </div>

              <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
                {typedPlayers.length}{" "}
                {isArabic ? "لاعب" : "players"}
              </div>
            </div>

            {/* Player grid */}
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {typedPlayers.map((player) => {
                const team = Array.isArray(player.team)
                  ? player.team[0]
                  : player.team;

                return (
                  <Link
                    key={player.id}
                    href={`/${locale}/players/${player.id}`}
                    className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1.5 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-950/5 dark:border-white/10 dark:bg-white/[0.03]"
                  >
                    {/* Photo */}
                    <div className="relative h-64 overflow-hidden bg-gradient-to-br from-gray-100 via-gray-50 to-emerald-50 dark:from-white/[0.06] dark:via-white/[0.02] dark:to-emerald-950/20">
                      {player.photo_url ? (
                        <img
                          src={player.photo_url}
                          alt={player.full_name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <div className="flex h-24 w-24 items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/10">
                            <UserRound className="h-10 w-10 text-emerald-500/70" />
                          </div>
                        </div>
                      )}

                      {/* Image gradient */}
                      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent" />

                      {/* Position badge */}
                      <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/45 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-md">
                        {positionLabel(player.position)}
                      </div>

                      {/* Class badge */}
                      {team && (
                        <div className="absolute bottom-4 right-4 flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                          <Shield className="h-3 w-3 text-emerald-400" />
                          {team.grade}
                          {team.section}
                        </div>
                      )}
                    </div>

                    {/* Information */}
                    <div className="p-5">
                      <div className={isArabic ? "text-right" : "text-left"}>
                        <h2 className="truncate text-lg font-black text-gray-950 dark:text-white">
                          {player.full_name}
                        </h2>

                        {team && (
                          <p className="mt-1 truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                            {team.name}
                          </p>
                        )}

                        {player.nationality && (
                          <p className="mt-1 truncate text-xs text-gray-400">
                            {player.nationality}
                          </p>
                        )}
                      </div>

                      {/* View profile */}
                      <div
                        className={`mt-5 flex items-center justify-between border-t border-gray-100 pt-4 text-xs font-bold uppercase tracking-[0.12em] text-gray-400 dark:border-white/10 ${
                          isArabic ? "flex-row-reverse" : ""
                        }`}
                      >
                        <span>{t("viewProfile")}</span>

                        <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 transition group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 dark:border-white/10">
                          <ArrowRight
                            className={`h-3.5 w-3.5 transition-transform ${
                              isArabic
                                ? "group-hover:-translate-x-1"
                                : "group-hover:translate-x-1"
                            }`}
                          />
                        </span>
                      </div>
                    </div>

                    {/* Hover line */}
                    <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-emerald-500 transition-all duration-500 group-hover:w-full" />
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* BOTTOM STRIP */}
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
                  ? "جميع لاعبي البطولة"
                  : "Tournament Player Directory"}
              </p>
            </div>
          </div>

          <Link
            href={`/${locale}/teams`}
            className="group inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition hover:text-gray-950 dark:text-gray-400 dark:hover:text-white"
          >
            {isArabic ? "استعرض الفصول" : "Browse Classes"}

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
