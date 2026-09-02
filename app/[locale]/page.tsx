import { getLocale, getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Clock3,
  MapPin,
  Newspaper,
  Play,
  Trophy,
  Zap,
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
  match_date: string;
  status: string;
  home_score: number;
  away_score: number;
};

type NewsItem = {
  id: string;
  title: string;
  title_ar: string;
  excerpt: string | null;
  excerpt_ar: string | null;
  image_url: string | null;
  published_at: string | null;
};

type Highlight = {
  id: string;
  match_id: string;
  title: string;
  title_ar: string;
  description: string | null;
  description_ar: string | null;
  thumbnail_url: string | null;
  video_url: string;
};

type HighlightMatch = {
  id: string;
  home_team_id: string;
  away_team_id: string;
  home_score: number;
  away_score: number;
  match_date: string;
};

export default async function HomePage() {
  const locale = await getLocale();

  const t = await getTranslations("home");
  const common = await getTranslations("common");

  const supabase = await createClient();

  /* =========================================================
     DATA
  ========================================================== */

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
    .in("status", ["upcoming", "live"])
    .order("match_date", { ascending: true })
    .limit(3);

  const { data: news, error: newsError } = await supabase
    .from("news")
    .select(`
      id,
      title,
      title_ar,
      excerpt,
      excerpt_ar,
      image_url,
      published_at
    `)
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(3);

  const { data: highlights, error: highlightsError } = await supabase
    .from("highlights")
    .select(`
      id,
      match_id,
      title,
      title_ar,
      description,
      description_ar,
      thumbnail_url,
      video_url
    `)
    .order("created_at", { ascending: false })
    .limit(3);

  const highlightMatchIds =
    highlights?.map((highlight) => highlight.match_id) ?? [];

  let highlightMatches: HighlightMatch[] = [];

  if (highlightMatchIds.length > 0) {
    const { data } = await supabase
      .from("matches")
      .select(`
        id,
        home_team_id,
        away_team_id,
        home_score,
        away_score,
        match_date
      `)
      .in("id", highlightMatchIds);

    highlightMatches = data ?? [];
  }

  if (teamsError) {
    console.error("Home teams error:", teamsError);
  }

  if (matchesError) {
    console.error("Home matches error:", matchesError);
  }

  if (newsError) {
    console.error("Home news error:", newsError);
  }

  if (highlightsError) {
    console.error("Home highlights error:", highlightsError);
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
    match_date: match.match_date,
    status: match.status,
    home_score: match.home_score,
    away_score: match.away_score,
  }));

  const typedNews: NewsItem[] = (news ?? []).map((item) => ({
    id: item.id,
    title: item.title,
    title_ar: item.title_ar,
    excerpt: item.excerpt,
    excerpt_ar: item.excerpt_ar,
    image_url: item.image_url,
    published_at: item.published_at,
  }));

  const typedHighlights: Highlight[] = (highlights ?? []).map((item) => ({
    id: item.id,
    match_id: item.match_id,
    title: item.title,
    title_ar: item.title_ar,
    description: item.description,
    description_ar: item.description_ar,
    thumbnail_url: item.thumbnail_url,
    video_url: item.video_url,
  }));

  function getClassName(teamId: string) {
    const team = typedTeams.find((team) => team.id === teamId);

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
        month: "short",
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

  function formatDay(dateString: string) {
    return new Intl.DateTimeFormat(
      locale === "ar" ? "ar-SA" : "en-US",
      {
        day: "2-digit",
        timeZone: "Asia/Riyadh",
      }
    ).format(new Date(dateString));
  }

  function formatMonth(dateString: string) {
    return new Intl.DateTimeFormat(
      locale === "ar" ? "ar-SA" : "en-US",
      {
        month: "short",
        timeZone: "Asia/Riyadh",
      }
    ).format(new Date(dateString));
  }

  function getHighlightMatch(matchId: string) {
    return highlightMatches.find(
      (match) => match.id === matchId
    );
  }

  const featuredNews = typedNews[0];
  const secondaryNews = typedNews.slice(1);

  const featuredHighlight = typedHighlights[0];
  const secondaryHighlights = typedHighlights.slice(1);

  const nextMatch = typedMatches[0];

  return (
    <main className="overflow-hidden bg-background">

      {/* =========================================================
          ANIMATIONS
      ========================================================== */}

      <style>{`
        @keyframes home-orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes home-orbit-reverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes home-float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-14px);
          }
        }

        @keyframes home-float-small {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-8px) rotate(2deg);
          }
        }

        @keyframes home-pulse {
          0%, 100% {
            opacity: .35;
            transform: scale(1);
          }
          50% {
            opacity: .75;
            transform: scale(1.12);
          }
        }

        @keyframes home-shine {
          0% {
            transform: translateX(-140%) skewX(-18deg);
          }
          100% {
            transform: translateX(180%) skewX(-18deg);
          }
        }

        @keyframes home-rise {
          from {
            opacity: 0;
            transform: translateY(24px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes home-marquee {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        .home-rise {
          animation: home-rise .75s cubic-bezier(.22,1,.36,1) both;
        }

        .home-rise-1 {
          animation-delay: .08s;
        }

        .home-rise-2 {
          animation-delay: .16s;
        }

        .home-rise-3 {
          animation-delay: .24s;
        }

        .home-rise-4 {
          animation-delay: .32s;
        }

        .home-float {
          animation: home-float 5s ease-in-out infinite;
        }

        .home-float-small {
          animation: home-float-small 4s ease-in-out infinite;
        }

        .home-pulse {
          animation: home-pulse 3s ease-in-out infinite;
        }

        .home-orbit {
          animation: home-orbit 30s linear infinite;
        }

        .home-orbit-reverse {
          animation: home-orbit-reverse 22s linear infinite;
        }

        .home-shine {
          animation: home-shine 4s ease-in-out infinite;
        }

        .home-marquee {
          animation: home-marquee 22s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .home-rise,
          .home-float,
          .home-float-small,
          .home-pulse,
          .home-orbit,
          .home-orbit-reverse,
          .home-shine,
          .home-marquee {
            animation: none !important;
          }
        }
      `}</style>

      {/* =========================================================
          HERO
      ========================================================== */}

      <section className="relative isolate overflow-hidden border-b border-border">

        <div className="absolute inset-0 bg-background" />

        <div className="home-pulse pointer-events-none absolute left-[-15%] top-[-25%] h-[600px] w-[600px] rounded-full bg-emerald-500/15 blur-[140px] dark:bg-emerald-500/20" />

        <div className="home-pulse pointer-events-none absolute bottom-[-30%] right-[-10%] h-[650px] w-[650px] rounded-full bg-amber-400/10 blur-[150px] dark:bg-amber-400/15" />

        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025] dark:opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)",
            backgroundSize: "80px 80px",
          }}
        />

        <div className="pointer-events-none absolute left-1/2 top-[42%] hidden h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-500/10 lg:block" />

        <div className="home-orbit pointer-events-none absolute left-1/2 top-[42%] hidden h-[620px] w-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-amber-400/10 lg:block">
          <span className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-amber-400 shadow-[0_0_25px_rgba(251,191,36,.8)]" />
        </div>

        <div className="home-orbit-reverse pointer-events-none absolute left-1/2 top-[42%] hidden h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-emerald-400/10 lg:block">
          <span className="absolute bottom-0 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-emerald-400 shadow-[0_0_20px_rgba(52,211,153,.8)]" />
        </div>

        {/* Reduced top padding */}
        <div className="relative mx-auto max-w-7xl px-6 pb-10 pt-4 sm:pb-14 sm:pt-6 lg:pt-8">

      

          {/* Reduced margin from mt-8 to mt-4 */}
          <div className="mx-auto mt-4 max-w-5xl text-center">

            <div className="home-rise home-rise-1">

              <div className="mb-4 flex items-center justify-center gap-3 text-amber-500">

                <span className="h-px w-10 bg-gradient-to-r from-transparent to-amber-400" />

                <Trophy className="h-5 w-5" />

                <span className="h-px w-10 bg-gradient-to-l from-transparent to-amber-400" />

              </div>

              <h1 className="text-[clamp(3.5rem,10vw,8.5rem)] font-black leading-[0.86] tracking-[-0.075em]">
                {t("title")}
              </h1>

            </div>

            <div className="home-rise home-rise-2 mx-auto mt-8 h-1 w-20 rounded-full bg-gradient-to-r from-emerald-500 via-green-400 to-amber-400" />

            <p className="home-rise home-rise-3 mx-auto mt-7 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              {t("subtitle")}
            </p>

            <div className="home-rise home-rise-4 mt-9 flex flex-wrap items-center justify-center gap-3">

              <Link
                href={`/${locale}/matches`}
                className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-emerald-500/20"
              >
                <span className="relative z-10 flex items-center gap-2">
                  {t("upcomingMatches")}
                  <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                </span>

                <span className="home-shine absolute inset-y-0 left-0 w-1/3 bg-white/20" />
              </Link>

              <Link
                href={`/${locale}/highlights`}
                className="group flex items-center gap-2 rounded-xl border border-border bg-card/80 px-6 py-3.5 text-sm font-semibold shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:border-amber-400/40 hover:bg-amber-400/5"
              >
                <Play className="h-4 w-4 fill-current text-amber-500 transition-transform group-hover:scale-110" />
                {t("latestHighlights")}
              </Link>

            </div>

          </div>

          {typedTeams.length > 0 && (
            <>
              <div className="home-float absolute left-[4%] top-[27%] hidden rounded-2xl border border-emerald-500/20 bg-card/80 p-4 shadow-xl backdrop-blur-xl xl:block">

                <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                  {t("class")}
                </span>

                <div className="mt-1 text-3xl font-black text-emerald-500">
                  {getClassName(typedTeams[0].id)}
                </div>

              </div>

              {typedTeams[typedTeams.length - 1] && (
                <div className="home-float-small absolute right-[4%] top-[32%] hidden rounded-2xl border border-amber-400/20 bg-card/80 p-4 shadow-xl backdrop-blur-xl xl:block">

                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                    {t("class")}
                  </span>

                  <div className="mt-1 text-3xl font-black text-amber-500">
                    {getClassName(typedTeams[typedTeams.length - 1].id)}
                  </div>

                </div>
              )}
            </>
          )}

          {/* NEXT MATCH */}

          <div className="home-rise home-rise-4 relative mx-auto mt-12 max-w-5xl">

            <div className="absolute -inset-1 rounded-[1.5rem] bg-gradient-to-r from-emerald-500/10 via-transparent to-amber-400/10 blur-xl" />

            <div className="relative overflow-hidden rounded-[1.5rem] border border-border bg-card/90 shadow-2xl backdrop-blur-xl">

              <div className="flex flex-col md:flex-row">

                <div className="flex shrink-0 items-center gap-3 border-b border-border px-6 py-5 md:w-44 md:border-b-0 md:border-e">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                    <Zap className="h-4 w-4" />
                  </div>

                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-amber-500">
                      {t("nextUp")}
                    </p>

                    <p className="mt-1 text-xs font-medium text-muted-foreground">
                      {t("matchday")}
                    </p>
                  </div>

                </div>

                {nextMatch ? (
                  <Link
                    href={`/${locale}/matches/${nextMatch.id}`}
                    className="group flex flex-1 items-center justify-between gap-5 px-6 py-5 transition hover:bg-muted/40"
                  >

                    <div className="flex min-w-0 items-center gap-4">

                      <div className="text-center">
                        <div className="text-2xl font-black tracking-tight sm:text-3xl">
                          {getClassName(nextMatch.home_team_id)}
                        </div>

                        <div className="mt-1 text-[9px] uppercase tracking-widest text-muted-foreground">
                          {t("class")}
                        </div>
                      </div>

                      <div className="flex flex-col items-center">
                        <span className="text-[9px] font-black text-muted-foreground">
                          VS
                        </span>

                        <span className="mt-2 h-px w-7 bg-gradient-to-r from-emerald-500 to-amber-400" />
                      </div>

                      <div className="text-center">
                        <div className="text-2xl font-black tracking-tight sm:text-3xl">
                          {getClassName(nextMatch.away_team_id)}
                        </div>

                        <div className="mt-1 text-[9px] uppercase tracking-widest text-muted-foreground">
                          {t("class")}
                        </div>
                      </div>

                    </div>

                    <div className="hidden items-center gap-5 sm:flex">

                      <div className="text-end">
                        <div className="flex items-center justify-end gap-2 text-xs font-medium text-muted-foreground">
                          <CalendarDays className="h-3.5 w-3.5 text-emerald-500" />
                          {formatDate(nextMatch.match_date)}
                        </div>

                        <div className="mt-1 flex items-center justify-end gap-2 text-xs font-medium text-muted-foreground">
                          <Clock3 className="h-3.5 w-3.5 text-amber-500" />
                          {formatTime(nextMatch.match_date)}
                        </div>
                      </div>

                      <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />

                    </div>

                  </Link>
                ) : (
                  <div className="flex flex-1 items-center gap-4 px-6 py-6">

                    <CalendarDays className="h-5 w-5 text-muted-foreground" />

                    <div>
                      <p className="text-sm font-semibold">
                        {t("noUpcomingMatches")}
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {t("noUpcomingMatchesDescription")}
                      </p>
                    </div>

                  </div>
                )}

              </div>

            </div>

          </div>

        </div>

        <div className="h-24 bg-gradient-to-b from-transparent to-muted/30" />

      </section>


      {/* =========================================================
          UPCOMING MATCHES
      ========================================================== */}

      <section className="relative overflow-hidden border-b border-border bg-muted/30 text-foreground dark:bg-[#050907] dark:text-white">

        <div className="pointer-events-none absolute left-[-15%] top-[15%] h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[140px]" />

        <div className="pointer-events-none absolute right-[-10%] bottom-[-20%] h-[500px] w-[500px] rounded-full bg-amber-400/5 blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-6 py-14 sm:py-20">

          <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">

            <div>

              <div className="mb-4 flex items-center gap-3">

                <span className="h-px w-10 bg-emerald-500 dark:bg-emerald-400" />

                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">
                  {t("matchday")}
                </span>

              </div>

              <h2 className="text-4xl font-black tracking-[-0.05em] sm:text-6xl">
                {t("upcomingMatches")}
              </h2>

              <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground dark:text-white/45">
                {t("subtitle")}
              </p>

            </div>

            <Link
              href={`/${locale}/matches`}
              className="group flex w-fit items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-xs font-semibold text-muted-foreground transition hover:border-emerald-400/30 hover:bg-emerald-400/10 hover:text-foreground dark:border-white/10 dark:bg-white/[0.03] dark:text-white/70 dark:hover:text-white"
            >
              {common("viewAll")}

              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
            </Link>

          </div>

          {typedMatches.length === 0 ? (

            <div className="rounded-3xl border border-dashed border-border bg-background p-14 text-center dark:border-white/10 dark:bg-white/[0.02]">

              <CalendarDays className="mx-auto h-10 w-10 text-muted-foreground dark:text-white/20" />

              <p className="mt-5 font-semibold">
                {t("noUpcomingMatches")}
              </p>

              <p className="mt-2 text-sm text-muted-foreground dark:text-white/40">
                {t("noUpcomingMatchesDescription")}
              </p>

            </div>

          ) : (

            <div className="grid gap-4">

              {typedMatches.map((match, index) => (

                <Link
                  key={match.id}
                  href={`/${locale}/matches/${match.id}`}
                  className="group relative overflow-hidden rounded-3xl border border-border bg-background transition-all duration-500 hover:-translate-y-1 hover:border-emerald-400/30 hover:shadow-2xl dark:border-white/10 dark:bg-white/[0.035] dark:hover:bg-white/[0.055] dark:hover:shadow-emerald-950/30"
                >

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-emerald-500/[0.06] via-transparent to-amber-400/[0.04] opacity-0 transition duration-500 group-hover:opacity-100" />

                  <div className="relative grid items-center md:grid-cols-[130px_1fr_190px]">

                    {/* Date */}

                    <div className="border-b border-border px-6 py-5 dark:border-white/10 md:border-b-0 md:border-e">

                      <div className="flex items-center gap-3 md:block">

                        <div className="text-3xl font-black tracking-tight">
                          {formatDay(match.match_date)}
                        </div>

                        <div className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-600 dark:text-emerald-400">
                          {formatMonth(match.match_date)}
                        </div>

                      </div>

                      <div className="mt-2 hidden items-center gap-1.5 text-[11px] text-muted-foreground dark:text-white/35 md:flex">
                        <Clock3 className="h-3 w-3" />
                        {formatTime(match.match_date)}
                      </div>

                    </div>


                    {/* Match */}

                    <div className="px-6 py-7">

                      <div className="mb-5 flex items-center justify-between">

                        <span
                          className={`rounded-full px-3 py-1 text-[9px] font-black uppercase tracking-[0.15em] ${
                            match.status === "live"
                              ? "bg-red-500/15 text-red-500 dark:text-red-400"
                              : "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400"
                          }`}
                        >
                          {match.status === "live"
                            ? t("live")
                            : t("upcoming")}
                        </span>

                        <span className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground/50 dark:text-white/20">
                          {String(index + 1).padStart(2, "0")}
                        </span>

                      </div>

                      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-5">

                        <div className="text-end">

                          <div className="text-3xl font-black tracking-tight transition duration-300 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 sm:text-4xl">
                            {getClassName(match.home_team_id)}
                          </div>

                          <div className="mt-1 text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60 dark:text-white/30">
                            {t("class")}
                          </div>

                        </div>

                        <div className="flex flex-col items-center">

                          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-muted text-[10px] font-black text-muted-foreground transition dark:border-white/10 dark:bg-black/20 dark:text-white/30 group-hover:border-amber-400/30 group-hover:text-amber-500 dark:group-hover:text-amber-400">
                            VS
                          </div>

                        </div>

                        <div className="text-start">

                          <div className="text-3xl font-black tracking-tight transition duration-300 group-hover:text-amber-500 dark:group-hover:text-amber-400 sm:text-4xl">
                            {getClassName(match.away_team_id)}
                          </div>

                          <div className="mt-1 text-[9px] font-medium uppercase tracking-[0.2em] text-muted-foreground/60 dark:text-white/30">
                            {t("class")}
                          </div>

                        </div>

                      </div>

                    </div>


                    {/* Venue */}

                    <div className="hidden items-center justify-between border-s border-border px-6 dark:border-white/10 md:flex">

                      <div>

                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground dark:text-white/50">
                          <MapPin className="h-3.5 w-3.5 text-amber-500 dark:text-amber-400" />
                          {t("venue")}
                        </div>

                        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground dark:text-white/30">
                          <Clock3 className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400" />
                          {formatTime(match.match_date)}
                        </div>

                      </div>

                      <ChevronRight className="h-5 w-5 text-muted-foreground/50 transition duration-300 group-hover:translate-x-1 group-hover:text-emerald-500 dark:text-white/20 dark:group-hover:text-emerald-400 rtl:rotate-180 rtl:group-hover:-translate-x-1" />

                    </div>

                  </div>

                </Link>

              ))}

            </div>

          )}

        </div>

      </section>


      {/* =========================================================
          NEWS
      ========================================================== */}

      <section className="relative overflow-hidden border-b border-border bg-background">

        <div className="pointer-events-none absolute right-[-10%] top-[10%] h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[130px] dark:bg-emerald-500/10" />

        <div className="relative mx-auto max-w-7xl px-6 py-14 sm:py-20">

          <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">

            <div>

              <div className="mb-4 flex items-center gap-3">

                <span className="h-px w-10 bg-amber-500" />

                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber-500">
                  {t("updates")}
                </span>

              </div>

              <h2 className="text-4xl font-black tracking-[-0.05em] sm:text-6xl">
                {t("latestNews")}
              </h2>

            </div>

            <Link
              href={`/${locale}/news`}
              className="group flex w-fit items-center gap-2 rounded-full border border-border px-5 py-2.5 text-xs font-semibold text-muted-foreground transition hover:border-amber-400/30 hover:bg-amber-400/5 hover:text-foreground"
            >
              {common("viewAll")}

              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
            </Link>

          </div>

          {featuredNews ? (

            <div className="grid gap-5 lg:grid-cols-[1.45fr_.75fr]">

              <Link
                href={`/${locale}/news/${featuredNews.id}`}
                className="group relative min-h-[480px] overflow-hidden rounded-[2rem] border border-border bg-muted shadow-sm"
              >

                {featuredNews.image_url ? (

                  <img
                    src={featuredNews.image_url}
                    alt={
                      locale === "ar"
                        ? featuredNews.title_ar
                        : featuredNews.title
                    }
                    className="absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-105"
                  />

                ) : (

                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-[#07100c] to-black" />

                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/5" />

                <div className="absolute left-6 top-6">

                  <span className="rounded-full border border-white/15 bg-black/30 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur-md">
                    {t("updates")}
                  </span>

                </div>

                <div className="absolute inset-x-0 bottom-0 p-7 sm:p-9">

                  {featuredNews.published_at && (
                    <div className="mb-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {formatDate(featuredNews.published_at)}
                    </div>
                  )}

                  <h3 className="max-w-3xl text-3xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl">
                    {locale === "ar"
                      ? featuredNews.title_ar
                      : featuredNews.title}
                  </h3>

                  {(locale === "ar"
                    ? featuredNews.excerpt_ar ||
                      featuredNews.excerpt
                    : featuredNews.excerpt) && (

                    <p className="mt-5 max-w-2xl line-clamp-2 text-sm leading-7 text-white/55">
                      {locale === "ar"
                        ? featuredNews.excerpt_ar ||
                          featuredNews.excerpt
                        : featuredNews.excerpt}
                    </p>

                  )}

                  <div className="mt-7 flex items-center gap-2 text-sm font-bold text-white">
                    {common("readMore")}

                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />
                  </div>

                </div>

              </Link>


              <div className="grid gap-5">

                {secondaryNews.map((item) => (

                  <Link
                    key={item.id}
                    href={`/${locale}/news/${item.id}`}
                    className="group flex min-h-[225px] overflow-hidden rounded-[1.5rem] border border-border bg-card transition-all duration-500 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-xl"
                  >

                    <div className="relative w-[42%] shrink-0 overflow-hidden bg-muted">

                      {item.image_url ? (

                        <img
                          src={item.image_url}
                          alt={
                            locale === "ar"
                              ? item.title_ar
                              : item.title
                          }
                          className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                        />

                      ) : (

                        <div className="flex h-full items-center justify-center bg-muted">
                          <Newspaper className="h-7 w-7 text-muted-foreground" />
                        </div>

                      )}

                      <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />

                    </div>

                    <div className="flex min-w-0 flex-1 flex-col justify-between p-5 sm:p-6">

                      <div>

                        {item.published_at && (
                          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-amber-500">
                            {formatDate(item.published_at)}
                          </p>
                        )}

                        <h3 className="mt-3 line-clamp-3 text-lg font-black leading-snug tracking-tight sm:text-xl">
                          {locale === "ar"
                            ? item.title_ar
                            : item.title}
                        </h3>

                        {(locale === "ar"
                          ? item.excerpt_ar || item.excerpt
                          : item.excerpt) && (

                          <p className="mt-3 line-clamp-2 text-xs leading-6 text-muted-foreground">
                            {locale === "ar"
                              ? item.excerpt_ar || item.excerpt
                              : item.excerpt}
                          </p>

                        )}

                      </div>

                      <div className="mt-5 flex items-center gap-2 text-xs font-bold text-emerald-500">

                        {common("readMore")}

                        <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />

                      </div>

                    </div>

                  </Link>

                ))}

              </div>

            </div>

          ) : (

            <div className="rounded-3xl border border-dashed border-border p-14 text-center">

              <Newspaper className="mx-auto h-10 w-10 text-muted-foreground" />

              <p className="mt-5 font-semibold">
                {t("noNews")}
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                {t("noNewsDescription")}
              </p>

            </div>

          )}

        </div>

      </section>


      {/* =========================================================
          HIGHLIGHTS
      ========================================================== */}

      <section className="relative overflow-hidden border-b border-border bg-muted/30">

        <div className="pointer-events-none absolute left-[-15%] top-[15%] h-[550px] w-[550px] rounded-full bg-emerald-500/5 blur-[140px] dark:bg-emerald-500/10" />

        <div className="pointer-events-none absolute right-[-10%] bottom-[-20%] h-[450px] w-[450px] rounded-full bg-amber-400/5 blur-[130px] dark:bg-amber-400/10" />

        <div className="relative mx-auto max-w-7xl px-6 py-14 sm:py-20">

          <div className="mb-10 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">

            <div>

              <div className="mb-4 flex items-center gap-3">

                <span className="h-px w-10 bg-emerald-500" />

                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-emerald-600 dark:text-emerald-400">
                  {t("videos")}
                </span>

              </div>

              <h2 className="text-4xl font-black tracking-[-0.05em] sm:text-6xl">
                {t("latestHighlights")}
              </h2>

            </div>

            <Link
              href={`/${locale}/highlights`}
              className="group flex w-fit items-center gap-2 rounded-full border border-border bg-background px-5 py-2.5 text-xs font-semibold text-muted-foreground transition hover:border-amber-400/30 hover:bg-amber-400/5 hover:text-foreground"
            >
              {common("viewAll")}

              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
            </Link>

          </div>

          {typedHighlights.length === 0 ? (

            <div className="rounded-3xl border border-dashed border-border bg-background p-14 text-center">

              <Play className="mx-auto h-10 w-10 text-muted-foreground" />

              <p className="mt-5 font-semibold">
                {t("noHighlights")}
              </p>

              <p className="mt-2 text-sm text-muted-foreground">
                {t("noHighlightsDescription")}
              </p>

            </div>

          ) : (

            <div className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">

              {featuredHighlight && (() => {

                const title =
                  locale === "ar"
                    ? featuredHighlight.title_ar
                    : featuredHighlight.title;

                const description =
                  locale === "ar"
                    ? featuredHighlight.description_ar ||
                      featuredHighlight.description
                    : featuredHighlight.description;

                const match = getHighlightMatch(
                  featuredHighlight.match_id
                );

                return (

                  <Link
                    href={`/${locale}/highlights`}
                    className="group relative min-h-[470px] overflow-hidden rounded-[2rem] border border-border bg-black shadow-xl"
                  >

                    <div className="absolute inset-0 bg-[#020504]" />

                    {featuredHighlight.thumbnail_url ? (

                      <img
                        src={featuredHighlight.thumbnail_url}
                        alt={title}
                        className="absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-105"
                      />

                    ) : (

                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-[#07100c] to-black" />

                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />

                    <div className="absolute left-6 top-6">

                      <span className="rounded-full border border-white/15 bg-black/35 px-4 py-2 text-[9px] font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur-md">
                        {t("videos")}
                      </span>

                    </div>

                    <div className="absolute inset-0 flex items-center justify-center">

                      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/25 bg-black/40 text-white shadow-2xl backdrop-blur-md transition-all duration-500 group-hover:scale-110 group-hover:border-amber-400 group-hover:bg-amber-400 group-hover:text-black">

                        <Play className="ml-1 h-7 w-7 fill-current" />

                      </div>

                    </div>

                    <div className="absolute inset-x-0 bottom-0 p-7 sm:p-9">

                      <h3 className="max-w-3xl text-3xl font-black leading-tight tracking-tight text-white sm:text-4xl">
                        {title}
                      </h3>

                      {description && (

                        <p className="mt-4 max-w-2xl line-clamp-2 text-sm leading-6 text-white/50">
                          {description}
                        </p>

                      )}

                      {match && (

                        <div className="mt-6 flex max-w-md items-center justify-between rounded-xl border border-white/10 bg-black/35 px-4 py-3 backdrop-blur-md">

                          <span className="text-sm font-black text-white">
                            {getClassName(match.home_team_id)}
                          </span>

                          <span className="text-sm font-black text-amber-400">
                            {match.home_score} — {match.away_score}
                          </span>

                          <span className="text-sm font-black text-white">
                            {getClassName(match.away_team_id)}
                          </span>

                        </div>

                      )}

                    </div>

                  </Link>

                );

              })()}

              <div className="grid gap-5">

                {secondaryHighlights.map((highlight) => {

                  const title =
                    locale === "ar"
                      ? highlight.title_ar
                      : highlight.title;

                  const description =
                    locale === "ar"
                      ? highlight.description_ar ||
                        highlight.description
                      : highlight.description;

                  const match = getHighlightMatch(
                    highlight.match_id
                  );

                  return (

                    <Link
                      key={highlight.id}
                      href={`/${locale}/highlights`}
                      className="group flex overflow-hidden rounded-[1.5rem] border border-border bg-background transition-all duration-500 hover:-translate-y-1 hover:border-amber-400/40 hover:shadow-xl"
                    >

                      <div className="relative aspect-video w-[45%] shrink-0 overflow-hidden bg-black">

                        {highlight.thumbnail_url ? (

                          <img
                            src={highlight.thumbnail_url}
                            alt={title}
                            className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                          />

                        ) : (

                          <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-950 to-black">
                            <Play className="h-7 w-7 text-white/30" />
                          </div>

                        )}

                        <div className="absolute inset-0 bg-black/20" />

                        <div className="absolute inset-0 flex items-center justify-center">

                          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur transition duration-300 group-hover:scale-110 group-hover:bg-amber-400 group-hover:text-black">

                            <Play className="ml-0.5 h-4 w-4 fill-current" />

                          </div>

                        </div>

                      </div>

                      <div className="flex min-w-0 flex-1 flex-col justify-center p-5">

                        <h3 className="line-clamp-2 text-base font-black leading-snug">
                          {title}
                        </h3>

                        {description && (

                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">
                            {description}
                          </p>

                        )}

                        {match && (

                          <div className="mt-4 flex items-center justify-between rounded-lg border border-border bg-muted/50 px-3 py-2">

                            <span className="text-xs font-black">
                              {getClassName(match.home_team_id)}
                            </span>

                            <span className="text-xs font-black text-amber-500">
                              {match.home_score} — {match.away_score}
                            </span>

                            <span className="text-xs font-black">
                              {getClassName(match.away_team_id)}
                            </span>

                          </div>

                        )}

                      </div>

                    </Link>

                  );

                })}

              </div>

            </div>

          )}

        </div>

      </section>


      {/* =========================================================
          MARQUEE
      ========================================================== */}

      <section className="overflow-hidden border-b border-border bg-background py-5">

        <div className="flex w-max home-marquee">

          {[...Array(2)].flatMap(() =>
            [
              "NWIS FOOTBALL",
              "•",
              "MATCHES",
              "•",
              "NEWS",
              "•",
              "HIGHLIGHTS",
              "•",
              "NWIS FOOTBALL",
              "•",
              "MATCHES",
              "•",
              "NEWS",
              "•",
              "HIGHLIGHTS",
              "•",
            ]
          ).map((item, index) => (

            <span
              key={index}
              className={`mx-4 text-xs font-black uppercase tracking-[0.25em] ${
                item === "•"
                  ? "text-amber-500"
                  : "text-muted-foreground/50"
              }`}
            >
              {item}
            </span>

          ))}

        </div>

      </section>


      {/* =========================================================
          FINAL CTA
      ========================================================== */}

      <section className="relative overflow-hidden">

        <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-[#07100c] to-[#0d0902] dark:from-[#020604] dark:via-[#07110d] dark:to-[#100b02]" />

        <div className="home-pulse pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-500/10 blur-[120px]" />

        <div className="relative mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">

          <div className="home-float mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10">
            <Trophy className="h-6 w-6 text-amber-400" />
          </div>

          <h2 className="mt-7 text-4xl font-black tracking-tight text-white sm:text-6xl">
            {t("title")}
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-white/50 sm:text-base">
            {t("subtitle")}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">

            <Link
              href={`/${locale}/matches`}
              className="group relative overflow-hidden rounded-xl bg-white px-6 py-3.5 text-sm font-bold text-black transition duration-300 hover:-translate-y-1 hover:bg-amber-300"
            >

              <span className="relative z-10 flex items-center gap-2">

                {t("upcomingMatches")}

                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />

              </span>

            </Link>

            <Link
              href={`/${locale}/news`}
              className="rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition hover:-translate-y-1 hover:bg-white/10"
            >
              {t("latestNews")}
            </Link>

          </div>

        </div>

      </section>

    </main>
  );
}