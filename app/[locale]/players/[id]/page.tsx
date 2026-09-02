import Link from "next/link";
import { getTranslations } from "next-intl/server";

import {
  ArrowLeft,
  ArrowRight,
  Award,
  CircleUserRound,
  Flag,
  Shield,
  SquareUserRound,
  Trophy,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type Player = {
  id: string;
  full_name: string;
  position: string;
  nationality: string | null;
  photo_url: string | null;
  team:
    | {
        id: string;
        name: string;
        grade: number;
        section: string;
      }
    | {
        id: string;
        name: string;
        grade: number;
        section: string;
      }[]
    | null;
};

type MatchEvent = {
  event_type: string;
  player_id: string;
  assist_player_id: string | null;
};

export default async function PlayerPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  const supabase = await createClient();
  const t = await getTranslations("player");

  const isArabic = locale === "ar";

  // Get player
  const { data: player, error } = await supabase
    .from("players")
    .select(`
      id,
      full_name,
      position,
      nationality,
      photo_url,
      team:teams (
        id,
        name,
        grade,
        section
      )
    `)
    .eq("id", id)
    .single();

  if (error || !player) {
    return (
      <main className="min-h-screen bg-white dark:bg-[#050806]">
        <section className="flex min-h-[70vh] items-center justify-center px-6">
          <div className="w-full max-w-xl rounded-3xl border border-gray-200 bg-gray-50 p-10 text-center dark:border-white/10 dark:bg-white/[0.03]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-500/10">
              <CircleUserRound className="h-9 w-9 text-emerald-500" />
            </div>

            <h1 className="mt-7 text-3xl font-black text-gray-950 dark:text-white">
              {t("notFound")}
            </h1>

            <p className="mt-3 leading-7 text-gray-500 dark:text-gray-400">
              {t("notFoundDescription")}
            </p>

            <Link
              href={`/${locale}/players`}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-600"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("backToPlayers")}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  const team = Array.isArray(player.team)
    ? player.team[0]
    : player.team;

  // Get all events involving this player.
  const { data: events, error: eventsError } = await supabase
    .from("match_events")
    .select(`
      event_type,
      player_id,
      assist_player_id
    `)
    .or(`player_id.eq.${id},assist_player_id.eq.${id}`);

  if (eventsError) {
    console.error("Player statistics error:", eventsError);
  }

  const typedEvents: MatchEvent[] = events ?? [];

  const goals = typedEvents.filter(
    (event) =>
      event.event_type === "goal" &&
      event.player_id === id
  ).length;

  const assists = typedEvents.filter(
    (event) =>
      event.event_type === "goal" &&
      event.assist_player_id === id
  ).length;

  const mvps = typedEvents.filter(
    (event) =>
      event.event_type === "mvp" &&
      event.player_id === id
  ).length;

  const yellowCards = typedEvents.filter(
    (event) =>
      event.event_type === "yellow_card" &&
      event.player_id === id
  ).length;

  const redCards = typedEvents.filter(
    (event) =>
      event.event_type === "red_card" &&
      event.player_id === id
  ).length;

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

  const stats = [
    {
      label: t("goals"),
      value: goals,
      icon: "goal",
    },
    {
      label: t("assists"),
      value: assists,
      icon: "assist",
    },
    {
      label: t("mvps"),
      value: mvps,
      icon: "mvp",
    },
    {
      label: t("yellowCards"),
      value: yellowCards,
      icon: "yellow",
    },
    {
      label: t("redCards"),
      value: redCards,
      icon: "red",
    },
  ];

  return (
    <main className="min-h-screen overflow-hidden bg-white dark:bg-[#050806]">
      {/* HERO */}
      <section className="relative overflow-hidden border-b border-gray-200 dark:border-white/10">
        {/* Background glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-[10%] top-[-220px] h-[500px] w-[500px] rounded-full bg-emerald-500/15 blur-[130px]" />
          <div className="absolute right-[-120px] top-10 h-[420px] w-[420px] rounded-full bg-yellow-400/10 blur-[120px]" />
          <div className="absolute bottom-[-250px] left-1/2 h-[450px] w-[450px] -translate-x-1/2 rounded-full bg-emerald-600/10 blur-[130px]" />
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

        <div className="relative mx-auto max-w-7xl px-6 py-8 sm:px-8 lg:px-10 lg:py-10">
          {/* Back */}
          <Link
            href={`/${locale}/players`}
            className="group inline-flex items-center gap-2 text-sm font-semibold text-gray-500 transition hover:text-gray-950 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft
              className={`h-4 w-4 transition-transform ${
                isArabic
                  ? "group-hover:translate-x-1"
                  : "group-hover:-translate-x-1"
              }`}
            />

            {t("backToPlayers")}
          </Link>

          {/* Player hero */}
          <div
            className={`mt-10 grid items-center gap-10 lg:grid-cols-[auto_1fr] ${
              isArabic ? "lg:grid-cols-[1fr_auto]" : ""
            }`}
          >
            {/* Photo */}
            <div
              className={`relative mx-auto lg:mx-0 ${
                isArabic ? "lg:order-2" : ""
              }`}
            >
              <div className="absolute inset-[-25px] rounded-[3rem] bg-emerald-500/10 blur-3xl" />

              <div className="relative h-64 w-64 overflow-hidden rounded-[3rem] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/15 via-gray-100 to-yellow-400/10 shadow-2xl dark:from-emerald-500/20 dark:via-white/[0.04] dark:to-yellow-400/10 sm:h-72 sm:w-72">
                {player.photo_url ? (
                  <img
                    src={player.photo_url}
                    alt={player.full_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <CircleUserRound className="h-24 w-24 text-emerald-500/50" />
                  </div>
                )}

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/10" />
              </div>

              {/* Position badge */}
              <div className="absolute -bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-white/20 bg-black/75 px-5 py-2.5 text-xs font-bold uppercase tracking-[0.12em] text-white shadow-xl backdrop-blur-xl">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                {positionLabel(player.position)}
              </div>
            </div>

            {/* Player details */}
            <div
              className={`text-center lg:text-left ${
                isArabic ? "lg:order-1 lg:text-right" : ""
              }`}
            >
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-400">
                <SquareUserRound className="h-3.5 w-3.5" />
                {isArabic ? "ملف اللاعب" : "Player Profile"}
              </div>

              <h1 className="max-w-4xl text-5xl font-black tracking-[-0.05em] text-gray-950 sm:text-6xl lg:text-7xl dark:text-white">
                {player.full_name}
              </h1>

              {team && (
                <Link
                  href={`/${locale}/teams/${team.id}`}
                  className="group mt-4 inline-flex items-center gap-2 text-lg font-bold text-gray-500 transition hover:text-emerald-500 dark:text-gray-400"
                >
                  <Shield className="h-5 w-5 text-emerald-500" />

                  <span>
                    {team.name}
                    <span className="ml-2 text-sm font-medium text-gray-400">
                      {team.grade}
                      {team.section}
                    </span>
                  </span>

                  <ArrowRight
                    className={`h-4 w-4 transition-transform ${
                      isArabic
                        ? "group-hover:-translate-x-1"
                        : "group-hover:translate-x-1"
                    }`}
                  />
                </Link>
              )}

              <div
                className={`mt-7 flex flex-wrap justify-center gap-3 lg:justify-start ${
                  isArabic ? "lg:justify-end" : ""
                }`}
              >
                <ProfileBadge
                  icon={<Users className="h-4 w-4" />}
                  label={
                    isArabic
                      ? `الفصل ${team?.grade ?? "—"}${team?.section ?? ""}`
                      : `Class ${team?.grade ?? "—"}${team?.section ?? ""}`
                  }
                />

                <ProfileBadge
                  icon={<Award className="h-4 w-4" />}
                  label={positionLabel(player.position)}
                />

                {player.nationality && (
                  <ProfileBadge
                    icon={<Flag className="h-4 w-4" />}
                    label={player.nationality.toUpperCase()}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Hero stats */}
          <div className="mt-14 grid grid-cols-2 overflow-hidden rounded-3xl border border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/[0.03] sm:grid-cols-5">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`p-5 text-center ${
                  index !== stats.length - 1
                    ? "border-r border-gray-200 dark:border-white/10"
                    : ""
                }`}
              >
                <p className="text-3xl font-black tracking-[-0.04em] text-gray-950 dark:text-white">
                  {stat.value}
                </p>

                <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.14em] text-gray-400">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INFORMATION */}
      <section className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          {/* About */}
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
              {isArabic ? "بيانات اللاعب" : "Player Details"}
            </p>

            <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-950 dark:text-white">
              {t("information")}
            </h2>

            <p className="mt-3 max-w-md text-sm leading-6 text-gray-500 dark:text-gray-400">
              {isArabic
                ? "معلومات اللاعب المسجلة في بطولة NWIS لكرة القدم."
                : "Official player information registered for the NWIS Football Tournament."}
            </p>
          </div>

          {/* Information cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            <InfoCard
              icon={<Award className="h-5 w-5" />}
              label={t("position")}
              value={positionLabel(player.position)}
            />

            <NationalityCard
              label={t("nationality")}
              nationality={player.nationality}
              notAvailable={t("notAvailable")}
            />

            <InfoCard
              icon={<Shield className="h-5 w-5" />}
              label={t("grade")}
              value={team ? String(team.grade) : t("notAvailable")}
            />

            <InfoCard
              icon={<Users className="h-5 w-5" />}
              label={t("section")}
              value={team ? team.section : t("notAvailable")}
            />

            <div className="sm:col-span-2">
              <InfoCard
                icon={<Shield className="h-5 w-5" />}
                label={t("team")}
                value={team?.name || t("notAvailable")}
              />
            </div>
          </div>
        </div>
      </section>

      {/* STATISTICS */}
      <section className="border-y border-gray-200 bg-gray-50/70 dark:border-white/10 dark:bg-white/[0.015]">
        <div className="mx-auto max-w-6xl px-6 py-16 sm:px-8 lg:px-10">
          <div
            className={`flex flex-col justify-between gap-5 sm:flex-row sm:items-end ${
              isArabic ? "sm:flex-row-reverse" : ""
            }`}
          >
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                {isArabic ? "أداء البطولة" : "Tournament Performance"}
              </p>

              <h2 className="mt-2 text-3xl font-black tracking-tight text-gray-950 dark:text-white">
                {t("statistics")}
              </h2>
            </div>

            <div className="flex items-center gap-2 text-sm font-semibold text-gray-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              {isArabic ? "إحصائيات رسمية" : "Official Statistics"}
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <LargeStatCard
              label={t("goals")}
              value={goals}
              icon="⚽"
            />

            <LargeStatCard
              label={t("assists")}
              value={assists}
              icon="↗"
            />

            <LargeStatCard
              label={t("mvps")}
              value={mvps}
              icon="🏆"
            />

            <LargeStatCard
              label={t("yellowCards")}
              value={yellowCards}
              icon="🟨"
            />

            <LargeStatCard
              label={t("redCards")}
              value={redCards}
              icon="🟥"
            />
          </div>
        </div>
      </section>

      {/* BOTTOM NAVIGATION */}
      <section className="border-t border-gray-200 bg-white dark:border-white/10 dark:bg-[#050806]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row sm:px-8 lg:px-10">
          <Link
            href={`/${locale}/players`}
            className="group inline-flex items-center gap-2 text-sm font-bold text-gray-500 transition hover:text-gray-950 dark:text-gray-400 dark:hover:text-white"
          >
            <ArrowLeft
              className={`h-4 w-4 transition-transform ${
                isArabic
                  ? "group-hover:translate-x-1"
                  : "group-hover:-translate-x-1"
              }`}
            />

            {t("backToPlayers")}
          </Link>

          {team && (
            <Link
              href={`/${locale}/teams/${team.id}`}
              className="group inline-flex items-center gap-2 rounded-xl border border-gray-200 px-5 py-3 text-sm font-bold text-gray-600 transition hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-500 dark:border-white/10 dark:text-gray-300"
            >
              <Shield className="h-4 w-4" />

              {isArabic ? "عرض الفصل" : "View Class"}

              <ArrowRight
                className={`h-4 w-4 transition-transform ${
                  isArabic
                    ? "group-hover:-translate-x-1"
                    : "group-hover:translate-x-1"
                }`}
              />
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}

function ProfileBadge({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-gray-300">
      <span className="text-emerald-500">{icon}</span>
      {label}
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-950/5 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
          {icon}
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
          {label}
        </p>
      </div>

      <p className="mt-4 font-bold text-gray-950 dark:text-white">
        {value}
      </p>
    </div>
  );
}

function NationalityCard({
  label,
  nationality,
  notAvailable,
}: {
  label: string;
  nationality: string | null;
  notAvailable: string;
}) {
  if (!nationality) {
    return (
      <InfoCard
        icon={<Flag className="h-5 w-5" />}
        label={label}
        value={notAvailable}
      />
    );
  }

  const countryCode = nationality.toLowerCase();

  return (
    <div className="group rounded-2xl border border-gray-200 bg-white p-5 transition hover:border-emerald-500/20 hover:shadow-lg hover:shadow-emerald-950/5 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
          <Flag className="h-5 w-5 text-emerald-500" />
        </div>

        <p className="text-xs font-bold uppercase tracking-[0.12em] text-gray-400">
          {label}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <img
          src={`https://flagcdn.com/w40/${countryCode}.png`}
          alt={nationality}
          width={40}
          height={30}
          className="h-5 w-auto rounded-sm object-cover"
        />

        <p className="font-bold text-gray-950 dark:text-white">
          {nationality.toUpperCase()}
        </p>
      </div>
    </div>
  );
}

function LargeStatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-gray-200 bg-white p-6 transition hover:-translate-y-1 hover:border-emerald-500/20 hover:shadow-xl hover:shadow-emerald-950/5 dark:border-white/10 dark:bg-white/[0.03]">
      <div className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-emerald-500/0 blur-3xl transition group-hover:bg-emerald-500/10" />

      <div className="relative">
        <div className="flex items-center justify-between">
          <span className="text-2xl">{icon}</span>

          <span className="h-2 w-2 rounded-full bg-emerald-500" />
        </div>

        <p className="mt-7 text-4xl font-black tracking-[-0.05em] text-gray-950 dark:text-white">
          {value}
        </p>

        <p className="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-gray-400">
          {label}
        </p>
      </div>
    </div>
  );
}
