import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";

import {
  ArrowRight,
  Award,
  BarChart3,
  Shield,
  Trophy,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type ClassInfo = {
  id: string;
  grade: number;
  section: string;
  name: string;
};

type Match = {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number;
  away_score: number;
  status: string;
};

type Player = {
  id: string;
  full_name: string;
  team_id: string;
  position: string;
  photo_url: string | null;
};

type Event = {
  id: string;
  event_type: string;
  player_id: string;
  assist_player_id: string | null;
};

type Standing = {
  team: ClassInfo;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
};

type PlayerStat = {
  player: Player;
  goals: number;
  assists: number;
  mvps: number;
  yellowCards: number;
  redCards: number;
};

export default async function StatsPage() {
  const locale = await getLocale();
  const t = await getTranslations("stats");

  const supabase = await createClient();

  const isArabic = locale === "ar";

  /*
   * Get classes
   */
  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select(`
      id,
      grade,
      section,
      name
    `)
    .order("grade")
    .order("section");

  /*
   * Get finished matches
   */
  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select(`
      id,
      home_team_id,
      away_team_id,
      home_score,
      away_score,
      status
    `)
    .eq("status", "finished");

  /*
   * Get players
   */
  const { data: players, error: playersError } = await supabase
    .from("players")
    .select(`
      id,
      full_name,
      team_id,
      position,
      photo_url
    `)
    .order("full_name");

  /*
   * Get match events
   */
  const { data: events, error: eventsError } = await supabase
    .from("match_events")
    .select(`
      id,
      event_type,
      player_id,
      assist_player_id
    `);

  if (teamsError) {
    console.error("Stats teams error:", teamsError);
  }

  if (matchesError) {
    console.error("Stats matches error:", matchesError);
  }

  if (playersError) {
    console.error("Stats players error:", playersError);
  }

  if (eventsError) {
    console.error("Stats events error:", eventsError);
  }

  const typedTeams: ClassInfo[] = (teams ?? []).map((team) => ({
    id: team.id,
    grade: team.grade,
    section: team.section,
    name: team.name,
  }));

  const typedMatches: Match[] = (matches ?? []).map((match) => ({
    id: match.id,
    home_team_id: match.home_team_id,
    away_team_id: match.away_team_id,
    home_score: match.home_score,
    away_score: match.away_score,
    status: match.status,
  }));

  const typedPlayers: Player[] = (players ?? []).map((player) => ({
    id: player.id,
    full_name: player.full_name,
    team_id: player.team_id,
    position: player.position,
    photo_url: player.photo_url,
  }));

  const typedEvents: Event[] = (events ?? []).map((event) => ({
    id: event.id,
    event_type: event.event_type,
    player_id: event.player_id,
    assist_player_id: event.assist_player_id,
  }));

  /*
   * Get class name
   */
  function getClassName(teamId: string) {
    const team = typedTeams.find((team) => team.id === teamId);

    if (!team) {
      return "—";
    }

    return `${team.grade}${team.section}`;
  }

  /*
   * CLASS STANDINGS
   */
  const standings: Standing[] = typedTeams
    .map((team) => {
      let played = 0;
      let wins = 0;
      let draws = 0;
      let losses = 0;
      let goalsFor = 0;
      let goalsAgainst = 0;
      let points = 0;

      typedMatches.forEach((match) => {
        const isHome = match.home_team_id === team.id;
        const isAway = match.away_team_id === team.id;

        if (!isHome && !isAway) {
          return;
        }

        played++;

        const scored = isHome
          ? match.home_score
          : match.away_score;

        const conceded = isHome
          ? match.away_score
          : match.home_score;

        goalsFor += scored;
        goalsAgainst += conceded;

        if (scored > conceded) {
          wins++;
          points += 3;
        } else if (scored === conceded) {
          draws++;
          points += 1;
        } else {
          losses++;
        }
      });

      return {
        team,
        played,
        wins,
        draws,
        losses,
        goalsFor,
        goalsAgainst,
        goalDifference: goalsFor - goalsAgainst,
        points,
      };
    })
    .filter((standing) => standing.played > 0)
    .sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }

      if (b.goalDifference !== a.goalDifference) {
        return b.goalDifference - a.goalDifference;
      }

      return b.goalsFor - a.goalsFor;
    });

  /*
   * PLAYER STATISTICS
   */
  const playerStats: PlayerStat[] = typedPlayers
    .map((player) => {
      const playerEvents = typedEvents.filter(
        (event) => event.player_id === player.id
      );

      const goals = playerEvents.filter(
        (event) => event.event_type === "goal"
      ).length;

      const mvps = playerEvents.filter(
        (event) => event.event_type === "mvp"
      ).length;

      const yellowCards = playerEvents.filter(
        (event) => event.event_type === "yellow_card"
      ).length;

      const redCards = playerEvents.filter(
        (event) => event.event_type === "red_card"
      ).length;

      const assists = typedEvents.filter(
        (event) =>
          event.event_type === "goal" &&
          event.assist_player_id === player.id
      ).length;

      return {
        player,
        goals,
        assists,
        mvps,
        yellowCards,
        redCards,
      };
    })
    .filter(
      (stat) =>
        stat.goals > 0 ||
        stat.assists > 0 ||
        stat.mvps > 0 ||
        stat.yellowCards > 0 ||
        stat.redCards > 0
    );

  /*
   * LEADERBOARDS
   */
  const topScorers = [...playerStats]
    .filter((stat) => stat.goals > 0)
    .sort((a, b) => {
      if (b.goals !== a.goals) {
        return b.goals - a.goals;
      }

      return a.player.full_name.localeCompare(
        b.player.full_name
      );
    });

  const topAssists = [...playerStats]
    .filter((stat) => stat.assists > 0)
    .sort((a, b) => {
      if (b.assists !== a.assists) {
        return b.assists - a.assists;
      }

      return a.player.full_name.localeCompare(
        b.player.full_name
      );
    });

  const mvpLeaders = [...playerStats]
    .filter((stat) => stat.mvps > 0)
    .sort((a, b) => {
      if (b.mvps !== a.mvps) {
        return b.mvps - a.mvps;
      }

      return a.player.full_name.localeCompare(
        b.player.full_name
      );
    });

  const discipline = [...playerStats]
    .filter(
      (stat) =>
        stat.yellowCards > 0 ||
        stat.redCards > 0
    )
    .sort((a, b) => {
      if (b.redCards !== a.redCards) {
        return b.redCards - a.redCards;
      }

      if (b.yellowCards !== a.yellowCards) {
        return b.yellowCards - a.yellowCards;
      }

      return a.player.full_name.localeCompare(
        b.player.full_name
      );
    });

  /*
   * SUMMARY NUMBERS
   */
  const totalGoals = typedMatches.reduce(
    (sum, match) =>
      sum + match.home_score + match.away_score,
    0
  );

  const totalMVPs = typedEvents.filter(
    (event) => event.event_type === "mvp"
  ).length;

  const totalCards = typedEvents.filter(
    (event) =>
      event.event_type === "yellow_card" ||
      event.event_type === "red_card"
  ).length;

  return (
    <main className="min-h-screen overflow-hidden bg-white dark:bg-[#050806]">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-gray-200 dark:border-white/10">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[10%] top-[-220px] h-[500px] w-[500px] rounded-full bg-emerald-500/15 blur-[130px]" />
          <div className="absolute right-[-120px] top-10 h-[420px] w-[420px] rounded-full bg-yellow-400/10 blur-[120px]" />
          <div className="absolute bottom-[-250px] left-1/2 h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-emerald-600/10 blur-[130px]" />
        </div>

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-8 lg:px-10 lg:py-20">
          <div
            className={`grid items-end gap-10 lg:grid-cols-[1fr_auto] ${
              isArabic ? "lg:grid-cols-[auto_1fr]" : ""
            }`}
          >
            <div
              className={`${
                isArabic
                  ? "text-right lg:order-2"
                  : "text-left lg:order-1"
              }`}
            >
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                <BarChart3 className="h-3.5 w-3.5" />
                {isArabic ? "إحصائيات البطولة" : "Tournament Stats"}
              </div>

              <h1 className="max-w-4xl text-5xl font-black tracking-[-0.05em] text-gray-950 sm:text-6xl lg:text-7xl dark:text-white">
                {t("title")}
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-7 text-gray-500 dark:text-gray-400 sm:text-lg">
                {t("description")}
              </p>
            </div>

            {/* Main stat */}
            <div
              className={`relative ${
                isArabic ? "lg:order-1" : "lg:order-2"
              }`}
            >
              <div className="absolute inset-0 rounded-[2rem] bg-emerald-500/10 blur-2xl" />

            
            </div>
          </div>

          {/* Summary */}
          <div className="mt-12 grid grid-cols-2 overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/[0.03] sm:grid-cols-4">
            <SummaryCard
              label={isArabic ? "المباريات" : "Matches"}
              value={typedMatches.length}
              icon={<BarChart3 className="h-4 w-4" />}
            />

            <SummaryCard
              label={isArabic ? "الأهداف" : "Goals"}
              value={totalGoals}
              icon={<span>⚽</span>}
            />

            <SummaryCard
              label={isArabic ? "أفضل لاعب" : "MVP Awards"}
              value={totalMVPs}
              icon={<Award className="h-4 w-4" />}
            />

            <SummaryCard
              label={isArabic ? "البطاقات" : "Cards"}
              value={totalCards}
              icon={<span>🟨</span>}
            />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8 lg:px-10 lg:py-16">
        {/* STANDINGS */}
        <section>
          <SectionHeading
            eyebrow={
              isArabic ? "ترتيب الفصول" : "Class Rankings"
            }
            title={t("standings")}
            description={
              isArabic
                ? "ترتيب الفصول حسب النقاط وفارق الأهداف."
                : "Classes ranked by points and goal difference."
            }
          />

          <div className="mt-8 overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/[0.02]">
            {standings.length === 0 ? (
              <div className="p-12 text-center">
                <Shield className="mx-auto h-8 w-8 text-gray-300 dark:text-gray-700" />

                <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
                  {t("noStandings")}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[850px] text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/[0.03]">
                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
                        #
                      </th>

                      <th className="px-5 py-4 text-left text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
                        {t("class")}
                      </th>

                      <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
                        {t("played")}
                      </th>

                      <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
                        {t("wins")}
                      </th>

                      <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
                        {t("draws")}
                      </th>

                      <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
                        {t("losses")}
                      </th>

                      <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
                        {t("goalsFor")}
                      </th>

                      <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
                        {t("goalsAgainst")}
                      </th>

                      <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
                        {t("goalDifference")}
                      </th>

                      <th className="px-5 py-4 text-center text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
                        {t("points")}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {standings.map((standing, index) => (
                      <tr
                        key={standing.team.id}
                        className="group border-b border-gray-100 transition hover:bg-emerald-500/[0.025] last:border-0 dark:border-white/[0.06]"
                      >
                        {/* Position */}
                        <td className="px-5 py-5">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black ${
                              index === 0
                                ? "bg-yellow-400/15 text-yellow-600 dark:text-yellow-400"
                                : index === 1
                                  ? "bg-gray-200 text-gray-600 dark:bg-white/10 dark:text-gray-300"
                                  : index === 2
                                    ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                                    : "text-gray-400"
                            }`}
                          >
                            {index + 1}
                          </div>
                        </td>

                        {/* Class */}
                        <td className="px-5 py-5">
                          <Link
                            href={`/${locale}/teams/${standing.team.id}`}
                            className="group/class flex items-center gap-3"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-sm font-black text-emerald-600 transition group-hover/class:bg-emerald-500 group-hover/class:text-white dark:text-emerald-400">
                              {getClassName(standing.team.id)}
                            </div>

                            <div>
                              <p className="font-bold text-gray-950 dark:text-white">
                                {standing.team.name}
                              </p>

                              <p className="text-xs text-gray-400">
                                {isArabic
                                  ? `الفصل ${getClassName(standing.team.id)}`
                                  : `Class ${getClassName(standing.team.id)}`}
                              </p>
                            </div>
                          </Link>
                        </td>

                        <td className="px-5 py-5 text-center font-semibold">
                          {standing.played}
                        </td>

                        <td className="px-5 py-5 text-center font-semibold text-emerald-600 dark:text-emerald-400">
                          {standing.wins}
                        </td>

                        <td className="px-5 py-5 text-center font-semibold">
                          {standing.draws}
                        </td>

                        <td className="px-5 py-5 text-center font-semibold">
                          {standing.losses}
                        </td>

                        <td className="px-5 py-5 text-center font-semibold">
                          {standing.goalsFor}
                        </td>

                        <td className="px-5 py-5 text-center font-semibold">
                          {standing.goalsAgainst}
                        </td>

                        <td
                          className={`px-5 py-5 text-center font-bold ${
                            standing.goalDifference > 0
                              ? "text-emerald-600 dark:text-emerald-400"
                              : standing.goalDifference < 0
                                ? "text-red-500"
                                : "text-gray-400"
                          }`}
                        >
                          {standing.goalDifference > 0
                            ? `+${standing.goalDifference}`
                            : standing.goalDifference}
                        </td>

                        <td className="px-5 py-5 text-center">
                          <span className="inline-flex min-w-10 items-center justify-center rounded-lg bg-gray-100 px-2 py-1.5 font-black text-gray-950 dark:bg-white/10 dark:text-white">
                            {standing.points}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* PLAYER STATISTICS */}
        <section className="mt-20">
          <SectionHeading
            eyebrow={
              isArabic
                ? "إحصائيات اللاعبين"
                : "Player Statistics"
            }
            title={t("playerStatistics")}
            description={
              isArabic
                ? "أفضل اللاعبين في البطولة حتى الآن."
                : "The leading performers across the tournament."
            }
          />

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <Leaderboard
              title={`⚽ ${t("topScorers")}`}
              emptyText={t("noGoals")}
              valueLabel={t("goals")}
              stats={topScorers}
              value={(stat) => stat.goals}
              locale={locale}
              getClassName={getClassName}
            />

            <Leaderboard
              title={`🅰️ ${t("topAssists")}`}
              emptyText={t("noAssists")}
              valueLabel={t("assists")}
              stats={topAssists}
              value={(stat) => stat.assists}
              locale={locale}
              getClassName={getClassName}
            />

            <Leaderboard
              title={`🏆 ${t("mvpLeaders")}`}
              emptyText={t("noMvps")}
              valueLabel={t("mvps")}
              stats={mvpLeaders}
              value={(stat) => stat.mvps}
              locale={locale}
              getClassName={getClassName}
            />

            <DisciplineCard
              title={t("discipline")}
              emptyText={t("noCards")}
              stats={discipline}
              locale={locale}
              getClassName={getClassName}
            />
          </div>
        </section>
      </div>

      {/* BOTTOM STRIP */}
      <section className="border-t border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-black/20">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row sm:px-8 lg:px-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <BarChart3 className="h-5 w-5 text-emerald-500" />
            </div>

            <div>
              <p className="text-sm font-black text-gray-950 dark:text-white">
                NWIS Football
              </p>

              <p className="text-xs text-gray-400">
                {isArabic
                  ? "إحصائيات البطولة"
                  : "Tournament Statistics"}
              </p>
            </div>
          </div>

          <Link
            href={`/${locale}/players`}
            className="group inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition hover:text-gray-950 dark:text-gray-400 dark:hover:text-white"
          >
            {isArabic ? "استعرض اللاعبين" : "Browse Players"}

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

/* =========================
   SUMMARY CARD
========================= */

function SummaryCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="border-r border-gray-200 p-5 last:border-r-0 dark:border-white/10">
      <div className="flex items-center justify-center gap-2 text-emerald-500">
        {icon}
      </div>

      <p className="mt-3 text-center text-3xl font-black tracking-[-0.04em] text-gray-950 dark:text-white">
        {value}
      </p>

      <p className="mt-1 text-center text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
        {label}
      </p>
    </div>
  );
}

/* =========================
   SECTION HEADING
========================= */

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
        {eyebrow}
      </p>

      <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-950 dark:text-white sm:text-4xl">
        {title}
      </h2>

      <p className="mt-2 max-w-2xl text-sm leading-6 text-gray-500 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}

/* =========================
   PLAYER AVATAR
========================= */

function PlayerAvatar({
  photoUrl,
  name,
}: {
  photoUrl: string | null;
  name: string;
}) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        width={48}
        height={48}
        className="h-12 w-12 shrink-0 rounded-2xl object-cover"
      />
    );
  }

  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-lg font-bold text-emerald-500">
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

/* =========================
   LEADERBOARD
========================= */

function Leaderboard({
  title,
  emptyText,
  valueLabel,
  stats,
  value,
  locale,
  getClassName,
}: {
  title: string;
  emptyText: string;
  valueLabel: string;
  stats: PlayerStat[];
  value: (stat: PlayerStat) => number;
  locale: string;
  getClassName: (teamId: string) => string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-gray-950 dark:text-white">
          {title}
        </h3>

        <Users className="h-5 w-5 text-gray-300 dark:text-gray-600" />
      </div>

      {stats.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-gray-500">
            {emptyText}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {stats.map((stat, index) => (
            <Link
              key={stat.player.id}
              href={`/${locale}/players/${stat.player.id}`}
              className="group flex items-center justify-between rounded-2xl border border-gray-100 p-3 transition hover:-translate-y-0.5 hover:border-emerald-500/20 hover:bg-emerald-500/[0.025] dark:border-white/[0.07] dark:hover:border-emerald-500/20"
            >
              <div className="flex min-w-0 items-center gap-3">
                {/* Rank */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-black ${
                    index === 0
                      ? "bg-yellow-400/15 text-yellow-600 dark:text-yellow-400"
                      : "bg-gray-100 text-gray-400 dark:bg-white/[0.06]"
                  }`}
                >
                  {index + 1}
                </div>

                <PlayerAvatar
                  photoUrl={stat.player.photo_url}
                  name={stat.player.full_name}
                />

                <div className="min-w-0">
                  <p className="truncate font-bold text-gray-950 dark:text-white">
                    {stat.player.full_name}
                  </p>

                  <p className="mt-0.5 text-xs font-medium text-gray-400">
                    {getClassName(stat.player.team_id)}
                  </p>
                </div>
              </div>

              <div className="ml-4 shrink-0 text-right">
                <p className="text-xl font-black text-gray-950 dark:text-white">
                  {value(stat)}
                </p>

                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-gray-400">
                  {valueLabel}
                </p>
              </div>

              <ArrowRight className="ml-3 hidden h-4 w-4 shrink-0 text-gray-300 transition group-hover:translate-x-1 group-hover:text-emerald-500 sm:block" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

/* =========================
   DISCIPLINE
========================= */

function DisciplineCard({
  title,
  emptyText,
  stats,
  locale,
  getClassName,
}: {
  title: string;
  emptyText: string;
  stats: PlayerStat[];
  locale: string;
  getClassName: (teamId: string) => string;
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-black text-gray-950 dark:text-white">
          🟨🟥 {title}
        </h3>

        <span className="text-sm text-gray-400">
          {stats.length}
        </span>
      </div>

      {stats.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-gray-500">
            {emptyText}
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {stats.map((stat, index) => (
            <Link
              key={stat.player.id}
              href={`/${locale}/players/${stat.player.id}`}
              className="group flex items-center justify-between rounded-2xl border border-gray-100 p-3 transition hover:-translate-y-0.5 hover:border-emerald-500/20 hover:bg-emerald-500/[0.025] dark:border-white/[0.07] dark:hover:border-emerald-500/20"
            >
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-black text-gray-400 dark:bg-white/[0.06]">
                  {index + 1}
                </div>

                <PlayerAvatar
                  photoUrl={stat.player.photo_url}
                  name={stat.player.full_name}
                />

                <div className="min-w-0">
                  <p className="truncate font-bold text-gray-950 dark:text-white">
                    {stat.player.full_name}
                  </p>

                  <p className="mt-0.5 text-xs font-medium text-gray-400">
                    {getClassName(stat.player.team_id)}
                  </p>
                </div>
              </div>

              <div className="ml-3 flex shrink-0 gap-2 text-xs font-black">
                {stat.yellowCards > 0 && (
                  <span className="rounded-lg bg-yellow-400/15 px-2 py-1 text-yellow-600 dark:text-yellow-400">
                    🟨 {stat.yellowCards}
                  </span>
                )}

                {stat.redCards > 0 && (
                  <span className="rounded-lg bg-red-500/10 px-2 py-1 text-red-500">
                    🟥 {stat.redCards}
                  </span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
