import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CalendarDays,
  Clock3,
  MapPin,
  Shield,
  Sparkles,
  Trophy,
  UserRound,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type Team = {
  id: string;
  name: string;
  grade: number;
  section: string;
};

type Match = {
  id: string;
  home_team_id: string;
  away_team_id: string;
  match_date: string;
  status: string;
  home_score: number;
  away_score: number;
};

type Event = {
  id: string;
  event_type: string;
  player_id: string;
  assist_player_id: string | null;
};

type Player = {
  id: string;
  full_name: string;
  team_id: string;
};

export default async function MatchPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const supabase = await createClient();
  const t = await getTranslations("match");

  // =========================================================
  // MATCH
  // =========================================================

  const { data: match, error: matchError } = await supabase
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
    .eq("id", id)
    .single();

  if (matchError || !match) {
    console.error("Match error:", matchError);
    notFound();
  }

  // =========================================================
  // CLASSES
  // =========================================================

  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select(`
      id,
      name,
      grade,
      section
    `)
    .in("id", [match.home_team_id, match.away_team_id]);

  if (teamsError) {
    console.error("Classes error:", teamsError);
    notFound();
  }

  const homeTeam = teams?.find(
    (team) => team.id === match.home_team_id
  );

  const awayTeam = teams?.find(
    (team) => team.id === match.away_team_id
  );

  if (!homeTeam || !awayTeam) {
    notFound();
  }

  // =========================================================
  // PLAYERS
  // =========================================================

  const { data: players, error: playersError } = await supabase
    .from("players")
    .select(`
      id,
      full_name,
      team_id
    `)
    .in("team_id", [match.home_team_id, match.away_team_id]);

  if (playersError) {
    console.error("Players error:", playersError);
  }

  // =========================================================
  // EVENTS
  // =========================================================

  const { data: events, error: eventsError } = await supabase
    .from("match_events")
    .select(`
      id,
      event_type,
      player_id,
      assist_player_id
    `)
    .eq("match_id", id);

  if (eventsError) {
    console.error("Events error:", eventsError);
  }

  // =========================================================
  // TYPES
  // =========================================================

  const typedMatch: Match = {
    id: match.id,
    home_team_id: match.home_team_id,
    away_team_id: match.away_team_id,
    match_date: match.match_date,
    status: match.status,
    home_score: match.home_score,
    away_score: match.away_score,
  };

  const typedTeams: Team[] = (teams ?? []).map((team) => ({
    id: team.id,
    name: team.name,
    grade: team.grade,
    section: team.section,
  }));

  const typedPlayers: Player[] = (players ?? []).map((player) => ({
    id: player.id,
    full_name: player.full_name,
    team_id: player.team_id,
  }));

  const typedEvents: Event[] = (events ?? []).map((event) => ({
    id: event.id,
    event_type: event.event_type,
    player_id: event.player_id,
    assist_player_id: event.assist_player_id,
  }));

  // =========================================================
  // HELPERS
  // =========================================================

  function getPlayer(playerId: string | null) {
    if (!playerId) return null;

    return typedPlayers.find(
      (player) => player.id === playerId
    );
  }

  function getClass(teamId: string) {
    return typedTeams.find(
      (team) => team.id === teamId
    );
  }

  function getClassName(teamId: string) {
    const team = getClass(teamId);

    if (!team) return "—";

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

  // =========================================================
  // EVENT GROUPS
  // =========================================================

  const goals = typedEvents.filter(
    (event) => event.event_type === "goal"
  );

  const yellowCards = typedEvents.filter(
    (event) => event.event_type === "yellow_card"
  );

  const redCards = typedEvents.filter(
    (event) => event.event_type === "red_card"
  );

  const mvpEvent = typedEvents.find(
    (event) => event.event_type === "mvp"
  );

  const mvp = mvpEvent
    ? getPlayer(mvpEvent.player_id)
    : null;

  const isFinished = typedMatch.status === "finished";
  const isLive = typedMatch.status === "live";

  const statusLabel = isLive
    ? t("live")
    : isFinished
      ? t("finished")
      : locale === "ar"
        ? "قادمة"
        : "Upcoming";

  return (
    <main className="min-h-screen overflow-hidden bg-white text-gray-950 transition-colors dark:bg-gray-950 dark:text-white">

      {/* =====================================================
          HERO / SCOREBOARD
      ===================================================== */}

      <section className="relative isolate overflow-hidden border-b border-gray-200 bg-gradient-to-br from-emerald-50 via-white to-white dark:border-white/10 dark:from-emerald-950 dark:via-[#07100b] dark:to-black">

        {/* Light grid */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.035] dark:hidden"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,.7) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.7) 1px, transparent 1px)",
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

        {/* Light glow */}
        <div className="absolute -left-40 top-10 -z-10 h-96 w-96 rounded-full bg-emerald-400/15 blur-[130px] dark:hidden" />

        {/* Dark glows */}
        <div className="absolute -left-40 top-10 -z-10 hidden h-96 w-96 rounded-full bg-emerald-500/20 blur-[130px] dark:block" />

        <div className="absolute -right-40 bottom-0 -z-10 hidden h-96 w-96 rounded-full bg-amber-400/10 blur-[130px] dark:block" />

        <div className="mx-auto max-w-6xl px-6 pb-12 pt-8 sm:pb-16 sm:pt-10">

          {/* Back */}
          <Link
            href={`/${locale}/matches`}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-gray-950 dark:text-white/50 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1" />

            <span>{t("backToMatches")}</span>
          </Link>

          {/* =================================================
              MATCH HEADER
          ================================================= */}

          <div className="mt-10 text-center sm:mt-12">

            {/* Status */}
            <div className="flex flex-wrap items-center justify-center gap-2">

              <span
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] ${
                  isLive
                    ? "border-red-500/20 bg-red-500/10 text-red-600 dark:border-red-400/20 dark:bg-red-400/10 dark:text-red-300"
                    : isFinished
                      ? "border-emerald-600/20 bg-emerald-500/10 text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300"
                      : "border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    isLive
                      ? "animate-pulse bg-red-500 dark:bg-red-400"
                      : isFinished
                        ? "bg-emerald-500 dark:bg-emerald-400"
                        : "bg-amber-500 dark:bg-amber-400"
                  }`}
                />

                {statusLabel}
              </span>

              <span className="rounded-full border border-gray-200 bg-white/70 px-4 py-2 text-xs font-semibold text-gray-500 backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:text-white/50">
                {formatDate(typedMatch.match_date)}
              </span>

            </div>

            {/* =================================================
                SCOREBOARD
            ================================================= */}

            <div className="mt-10 grid grid-cols-[1fr_auto_1fr] items-center gap-3 sm:mt-12 sm:gap-10">

              {/* HOME */}
              <div className="text-center">

                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.6rem] border border-gray-200 bg-gray-100 text-2xl font-black text-gray-950 shadow-xl transition duration-500 hover:scale-105 sm:h-32 sm:w-32 sm:rounded-[2rem] sm:text-5xl dark:border-white/10 dark:bg-white/[0.06] dark:text-white">
                  {getClassName(typedMatch.home_team_id)}
                </div>

                <p className="mt-4 text-sm font-bold text-gray-800 dark:text-white/80">
                  {locale === "ar" ? "المضيف" : "Home"}
                </p>

                <p className="mt-1 text-xs text-gray-500 dark:text-white/35">
                  {locale === "ar"
                    ? `الصف ${homeTeam.grade}`
                    : `Grade ${homeTeam.grade}`}
                </p>

              </div>

              {/* SCORE */}
              <div className="text-center">

                <div className="flex items-center justify-center gap-2 text-4xl font-black tracking-[-0.05em] text-gray-950 sm:gap-3 sm:text-7xl dark:text-white">
                  <span>{typedMatch.home_score}</span>

                  <span className="text-gray-300 dark:text-white/20">
                    —
                  </span>

                  <span>{typedMatch.away_score}</span>
                </div>

                <div className="mt-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 sm:text-xs dark:text-white/35">
                  <Trophy className="h-3.5 w-3.5" />

                  {isFinished
                    ? t("final")
                    : isLive
                      ? t("live")
                      : locale === "ar"
                        ? "موعد المباراة"
                        : "Match scheduled"}
                </div>

              </div>

              {/* AWAY */}
              <div className="text-center">

                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[1.6rem] border border-gray-200 bg-gray-100 text-2xl font-black text-gray-950 shadow-xl transition duration-500 hover:scale-105 sm:h-32 sm:w-32 sm:rounded-[2rem] sm:text-5xl dark:border-white/10 dark:bg-white/[0.06] dark:text-white">
                  {getClassName(typedMatch.away_team_id)}
                </div>

                <p className="mt-4 text-sm font-bold text-gray-800 dark:text-white/80">
                  {locale === "ar" ? "الضيف" : "Away"}
                </p>

                <p className="mt-1 text-xs text-gray-500 dark:text-white/35">
                  {locale === "ar"
                    ? `الصف ${awayTeam.grade}`
                    : `Grade ${awayTeam.grade}`}
                </p>

              </div>
            </div>

            {/* =================================================
                MATCH INFO
            ================================================= */}

            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-gray-500 dark:text-white/40">

              <span className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                {formatDate(typedMatch.match_date)}
              </span>

              <span className="hidden text-gray-300 sm:inline dark:text-white/15">
                •
              </span>

              <span className="flex items-center gap-2">
                <Clock3 className="h-4 w-4" />
                {formatTime(typedMatch.match_date)}
              </span>

              <span className="hidden text-gray-300 sm:inline dark:text-white/15">
                •
              </span>

              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                NWIS Ground
              </span>

            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          CONTENT
      ===================================================== */}

      <div className="mx-auto max-w-6xl px-6 py-12 sm:py-16">

        {/* =====================================================
            MATCH SUMMARY
        ===================================================== */}

        <section className="grid gap-4 sm:grid-cols-3">

          {/* SCORE */}
          <div className="group rounded-[1.75rem] border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900/60">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10">
              <Trophy className="h-5 w-5 text-emerald-500" />
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
              {locale === "ar" ? "النتيجة" : "Score"}
            </p>

            <p className="mt-2 text-3xl font-black text-gray-950 dark:text-white">
              {typedMatch.home_score} — {typedMatch.away_score}
            </p>

          </div>

          {/* GOALS */}
          <div className="group rounded-[1.75rem] border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-amber-500/30 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900/60">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-500/10">
              <Award className="h-5 w-5 text-amber-500" />
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
              {locale === "ar" ? "الأهداف" : "Goals"}
            </p>

            <p className="mt-2 text-3xl font-black text-gray-950 dark:text-white">
              {goals.length}
            </p>

          </div>

          {/* MVP */}
          <div className="group rounded-[1.75rem] border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-blue-500/30 hover:shadow-xl dark:border-gray-800 dark:bg-gray-900/60">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-500/10">
              <UserRound className="h-5 w-5 text-blue-500" />
            </div>

            <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-gray-400 dark:text-gray-500">
              {locale === "ar"
                ? "أفضل لاعب"
                : "Player of the Match"}
            </p>

            <p className="mt-2 truncate text-xl font-black text-gray-950 dark:text-white">
              {mvp?.full_name ?? "—"}
            </p>

          </div>

        </section>

        {/* =====================================================
            MVP FEATURE
        ===================================================== */}

        {mvp && (
          <section className="relative mt-10 overflow-hidden rounded-[2rem] border border-amber-400/20 bg-gradient-to-br from-amber-50 via-white to-emerald-50 p-7 shadow-sm sm:p-9 dark:from-amber-500/10 dark:via-gray-950 dark:to-emerald-500/5">

            <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl" />

            <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:text-start">

              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl border border-amber-400/20 bg-amber-400/10 shadow-lg">
                <Trophy className="h-9 w-9 text-amber-500 dark:text-amber-400" />
              </div>

              <div className="flex-1">

                <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-amber-600 sm:justify-start dark:text-amber-400">
                  <Sparkles className="h-4 w-4" />

                  {t("playerOfTheMatch")}
                </div>

                <h2 className="mt-2 text-2xl font-black text-gray-950 sm:text-3xl dark:text-white">
                  {mvp.full_name}
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {getClassName(mvp.team_id)}
                </p>

              </div>

              <div className="rounded-full border border-amber-400/20 bg-amber-400/10 px-4 py-2 text-xs font-bold text-amber-600 dark:text-amber-400">
                MVP
              </div>

            </div>
          </section>
        )}

        {/* =====================================================
            GOALS
        ===================================================== */}

        <section className="mt-16">

          <div className="mb-7 flex items-end justify-between gap-4">

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                {locale === "ar"
                  ? "أحداث المباراة"
                  : "Match events"}
              </p>

              <h2 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white">
                {t("goals")}
              </h2>
            </div>

            <div className="rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              {goals.length}
            </div>

          </div>

          <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/60">

            {goals.length === 0 ? (
              <div className="p-10 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                  <Trophy className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                </div>

                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  {t("noGoals")}
                </p>

              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">

                {goals.map((goal, index) => {
                  const scorer = getPlayer(goal.player_id);
                  const assister = getPlayer(
                    goal.assist_player_id
                  );

                  const scorerClass = scorer
                    ? getClassName(scorer.team_id)
                    : "—";

                  const isHome =
                    scorer?.team_id ===
                    typedMatch.home_team_id;

                  return (
                    <div
                      key={goal.id}
                      className="group relative flex items-center gap-4 p-5 transition-colors hover:bg-gray-50 sm:gap-5 sm:p-6 dark:hover:bg-gray-800/50"
                    >

                      {/* Accent */}
                      <div
                        className={`absolute inset-y-0 start-0 w-1 ${
                          isHome
                            ? "bg-emerald-500"
                            : "bg-amber-400"
                        }`}
                      />

                      {/* Goal */}
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-xl">
                        ⚽
                      </div>

                      {/* Player */}
                      <div className="min-w-0 flex-1">

                        <div className="flex flex-wrap items-center gap-2">

                          <p className="font-black text-gray-950 dark:text-white">
                            {scorer?.full_name ?? "—"}
                          </p>

                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                            {scorerClass}
                          </span>

                        </div>

                        {assister && (
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium">
                              {t("assist")}:
                            </span>{" "}
                            {assister.full_name}
                          </p>
                        )}

                      </div>

                      {/* Side */}
                      <div className="hidden text-end sm:block">

                        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                          {isHome
                            ? getClassName(
                                typedMatch.home_team_id
                              )
                            : getClassName(
                                typedMatch.away_team_id
                              )}
                        </p>

                        <p className="mt-1 text-xs text-gray-300 dark:text-gray-600">
                          #{index + 1}
                        </p>

                      </div>

                    </div>
                  );
                })}

              </div>
            )}

          </div>
        </section>

        {/* =====================================================
            CARDS
        ===================================================== */}

        <section className="mt-16">

          <div className="mb-7 flex items-end justify-between gap-4">

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-400">
                {locale === "ar"
                  ? "الانضباط"
                  : "Discipline"}
              </p>

              <h2 className="text-3xl font-black tracking-tight text-gray-950 dark:text-white">
                {t("cards")}
              </h2>
            </div>

            <div className="rounded-full bg-gray-100 px-3 py-1.5 text-xs font-bold text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              {yellowCards.length + redCards.length}
            </div>

          </div>

          <div className="overflow-hidden rounded-[2rem] border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900/60">

            {yellowCards.length === 0 &&
            redCards.length === 0 ? (
              <div className="p-10 text-center">

                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800">
                  <Shield className="h-6 w-6 text-gray-400 dark:text-gray-500" />
                </div>

                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  {t("noCards")}
                </p>

              </div>
            ) : (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">

                {yellowCards.map((card) => {
                  const player = getPlayer(card.player_id);

                  return (
                    <div
                      key={card.id}
                      className="flex items-center gap-4 p-5 transition-colors hover:bg-gray-50 sm:p-6 dark:hover:bg-gray-800/50"
                    >

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10 text-xl">
                        🟨
                      </div>

                      <div>
                        <p className="font-bold text-gray-950 dark:text-white">
                          {player?.full_name ?? "—"}
                        </p>

                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {player
                            ? getClassName(player.team_id)
                            : "—"}
                        </p>
                      </div>

                    </div>
                  );
                })}

                {redCards.map((card) => {
                  const player = getPlayer(card.player_id);

                  return (
                    <div
                      key={card.id}
                      className="flex items-center gap-4 p-5 transition-colors hover:bg-gray-50 sm:p-6 dark:hover:bg-gray-800/50"
                    >

                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-xl">
                        🟥
                      </div>

                      <div>
                        <p className="font-bold text-gray-950 dark:text-white">
                          {player?.full_name ?? "—"}
                        </p>

                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                          {player
                            ? getClassName(player.team_id)
                            : "—"}
                        </p>
                      </div>

                    </div>
                  );
                })}

              </div>
            )}

          </div>
        </section>

        {/* =====================================================
            FOOTER NAVIGATION
        ===================================================== */}

        <div className="mt-16 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

          <Link
            href={`/${locale}/matches`}
            className="group inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-bold text-gray-800 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5 dark:border-gray-800 dark:bg-gray-900 dark:text-white dark:hover:bg-emerald-500/5"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1" />

            {t("backToMatches")}
          </Link>

          <Link
            href={`/${locale}`}
            className="group inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition-all hover:bg-emerald-500 hover:shadow-lg hover:shadow-emerald-900/20"
          >
            {locale === "ar"
              ? "العودة للرئيسية"
              : "Back to home"}

            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
          </Link>

        </div>
      </div>

      {/* =====================================================
          BOTTOM BRAND STRIP
      ===================================================== */}

      <section className="border-t border-gray-200 bg-gray-950 text-white dark:border-gray-800 dark:bg-black">

        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-9 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-center gap-3">

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
              <Sparkles className="h-4 w-4 text-emerald-400" />
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
                NWIS Football
              </p>

              <p className="mt-1 text-sm text-white/40">
                {locale === "ar"
                  ? "بطولة كرة القدم المدرسية"
                  : "School Football Tournament"}
              </p>
            </div>

          </div>

          <p className="text-xs text-white/30">
            {locale === "ar"
              ? "جميع المباريات تُلعب في ملعب NWIS"
              : "All matches are played at NWIS Ground"}
          </p>

        </div>

      </section>

    </main>
  );
}