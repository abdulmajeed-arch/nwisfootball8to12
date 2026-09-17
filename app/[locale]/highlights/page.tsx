import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";

import {
  ArrowRight,
  CalendarDays,
  ExternalLink,
  Play,
  Sparkles,
  Trophy,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";

type Highlight = {
  id: string;
  match_id: string;
  title: string;
  description: string | null;
  video_url: string;
  thumbnail_url: string | null;
  created_at: string;
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

type Team = {
  id: string;
  grade: number;
  section: string;
  name: string;
};

export default async function HighlightsPage() {
  const locale = await getLocale();
  const t = await getTranslations("highlights");
  const supabase = await createClient();

  const [
    { data: highlights, error: highlightsError },
    { data: matches, error: matchesError },
    { data: teams, error: teamsError },
  ] = await Promise.all([
    supabase
  .from("highlights")
  .select(`
    id,
    match_id,
    title,
    description,
    video_url,
    thumbnail_url,
    created_at,
    match:matches!inner (
      competition_id
    )
  `)
  .eq(
    "match.competition_id",
    "812b117a-df69-40ce-b4b2-62ae9ca3e8cf"
  )
  .order("created_at", { ascending: false }),

    supabase
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
  .eq(
    "competition_id",
    "812b117a-df69-40ce-b4b2-62ae9ca3e8cf"
  ),

    supabase
  .from("teams")
  .select(`
    id,
    grade,
    section,
    name
  `)
  .eq(
    "competition_id",
    "812b117a-df69-40ce-b4b2-62ae9ca3e8cf"
  ),
  ]);

  if (highlightsError || matchesError || teamsError) {
    return (
      <main className="min-h-screen bg-white px-6 py-20 text-gray-950 dark:bg-[#050806] dark:text-white">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300">
            {t("loadError")}
          </div>
        </div>
      </main>
    );
  }

  const typedHighlights = (highlights ?? []) as Highlight[];
  const typedMatches = (matches ?? []) as Match[];
  const typedTeams = (teams ?? []) as Team[];

  const isArabic = locale === "ar";

  const getClassName = (teamId: string) => {
    const team = typedTeams.find((team) => team.id === teamId);

    if (!team) {
      return t("unknownClass");
    }

    return `${team.grade}${team.section}`;
  };

  const getMatch = (matchId: string) => {
    return typedMatches.find((match) => match.id === matchId);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(
      isArabic ? "ar-SA" : "en-US",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Riyadh",
      }
    ).format(new Date(dateString));
  };

  const getVideoEmbedUrl = (url: string) => {
    try {
      const parsed = new URL(url);

      // YouTube
      if (
        parsed.hostname.includes("youtube.com") ||
        parsed.hostname.includes("youtu.be")
      ) {
        let videoId = "";

        if (parsed.hostname.includes("youtu.be")) {
          videoId = parsed.pathname.slice(1);
        } else {
          videoId = parsed.searchParams.get("v") || "";

          if (!videoId && parsed.pathname.startsWith("/embed/")) {
            videoId = parsed.pathname.split("/embed/")[1];
          }
        }

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }

      // Google Drive
      if (parsed.hostname.includes("drive.google.com")) {
        const match = parsed.pathname.match(/\/file\/d\/([^/]+)/);

        if (match?.[1]) {
          return `https://drive.google.com/file/d/${match[1]}/preview`;
        }
      }

      return null;
    } catch {
      return null;
    }
  };

  const featuredHighlight = typedHighlights[0];
  const remainingHighlights = typedHighlights.slice(1);

  const featuredMatch = featuredHighlight
    ? getMatch(featuredHighlight.match_id)
    : null;

  return (
    <main className="min-h-screen overflow-hidden bg-white text-gray-950 dark:bg-[#050806] dark:text-white">
      {/* =========================================================
          HERO
      ========================================================= */}
      <section className="relative overflow-hidden border-b border-gray-200 dark:border-white/10">
        {/* Background grid */}
        <div
          className="absolute inset-0 opacity-[0.035] dark:opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        {/* Glow */}
        <div className="pointer-events-none absolute -left-32 top-10 h-96 w-96 rounded-full bg-emerald-500/20 blur-[120px]" />
        <div className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-yellow-400/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-6 sm:pb-20 sm:pt-10">
          <div className="max-w-4xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-300">
              <Sparkles className="h-4 w-4" />
              {t("eyebrow")}
            </div>

            <h1 className="text-5xl font-black tracking-[-0.04em] sm:text-6xl lg:text-8xl">
              {t("title")}
              <span className="mt-2 block bg-gradient-to-r from-emerald-400 via-green-300 to-yellow-300 bg-clip-text text-transparent">
                {isArabic ? "أفضل لحظات البطولة" : "The Best Moments"}
              </span>
            </h1>

            <p className="mt-7 max-w-2xl text-base leading-8 text-gray-600 dark:text-gray-400 sm:text-lg">
              {t("description")}
            </p>
          </div>

          {/* Hero stats */}
          <div className="mt-12 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-5 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-3xl font-black text-emerald-500">
                {typedHighlights.length}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {isArabic ? "فيديو" : "Videos"}
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-5 dark:border-white/10 dark:bg-white/[0.04]">
              <p className="text-3xl font-black text-yellow-400">
                {typedMatches.filter((match) => match.status === "finished").length}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {isArabic ? "مباريات مكتملة" : "Finished Matches"}
              </p>
            </div>

            <div className="hidden rounded-2xl border border-gray-200 bg-gray-50/80 p-5 dark:border-white/10 dark:bg-white/[0.04] sm:block">
              <p className="text-3xl font-black">
                {typedTeams.length}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {isArabic ? "الفصول" : "Classes"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================
          HIGHLIGHTS
      ========================================================= */}
      <section className="relative mx-auto max-w-7xl px-6 py-16 sm:py-20">
        {typedHighlights.length === 0 ? (
          <div className="rounded-[2rem] border border-gray-200 bg-gray-50 px-6 py-20 text-center dark:border-white/10 dark:bg-white/[0.03]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl border border-emerald-500/20 bg-emerald-500/10">
              <Play className="h-8 w-8 text-emerald-400" />
            </div>

            <h2 className="mt-6 text-2xl font-black">
              {t("noHighlights")}
            </h2>

            <p className="mx-auto mt-3 max-w-md text-gray-500 dark:text-gray-400">
              {t("noHighlightsDescription")}
            </p>
          </div>
        ) : (
          <>
            {/* Section heading */}
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500">
                  {isArabic ? "الفيديوهات" : "Video Archive"}
                </p>

                <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">
                  {isArabic ? "أبرز اللقطات" : "Latest Highlights"}
                </h2>
              </div>

              <div className="hidden h-px flex-1 bg-gradient-to-r from-emerald-500/40 to-transparent sm:block" />
            </div>

            {/* =====================================================
                FEATURED HIGHLIGHT
            ===================================================== */}
            {featuredHighlight && (
              <article className="group relative mb-12 overflow-hidden rounded-[2rem] border border-gray-200 bg-gray-50 shadow-2xl shadow-black/5 dark:border-white/10 dark:bg-[#0b100d] dark:shadow-black/30">
                <div className="grid lg:grid-cols-[1.45fr_0.55fr]">
                  {/* Video */}
                  <div className="relative aspect-video overflow-hidden bg-black lg:aspect-auto lg:min-h-[430px]">
                    {(() => {
                      const embedUrl = getVideoEmbedUrl(
                        featuredHighlight.video_url
                      );

                      if (embedUrl) {
                        return (
                          <iframe
                            src={embedUrl}
                            title={featuredHighlight.title}
                            className="absolute inset-0 h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        );
                      }

                      if (featuredHighlight.thumbnail_url) {
                        return (
                          <Link
                            href={featuredHighlight.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/video absolute inset-0 block"
                          >
                            <img
                              src={featuredHighlight.thumbnail_url}
                              alt={featuredHighlight.title}
                              className="h-full w-full object-cover transition duration-700 group-hover/video:scale-105"
                            />

                            <div className="absolute inset-0 bg-black/30 transition group-hover/video:bg-black/40" />

                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-black shadow-2xl transition duration-300 group-hover/video:scale-110">
                                <Play className="ml-1 h-8 w-8 fill-current" />
                              </div>
                            </div>
                          </Link>
                        );
                      }

                      return (
                        <Link
                          href={featuredHighlight.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500 text-white shadow-2xl">
                            <Play className="ml-1 h-8 w-8 fill-current" />
                          </div>
                        </Link>
                      );
                    })()}

                    {/* Featured badge */}
                    <div className="absolute left-5 top-5 z-10 inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/60 px-3 py-2 text-xs font-black uppercase tracking-wider text-white backdrop-blur-md">
                      <Sparkles className="h-3.5 w-3.5 text-yellow-300" />
                      {isArabic ? "مميز" : "Featured"}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex flex-col justify-between p-7 sm:p-9">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500">
                        {isArabic ? "أبرز اللقطات" : "Match Highlights"}
                      </p>

                      <h2 className="mt-4 text-2xl font-black leading-tight sm:text-3xl">
                        {featuredHighlight.title}
                      </h2>

                      {featuredHighlight.description && (
                        <p className="mt-5 text-sm leading-7 text-gray-500 dark:text-gray-400">
                          {featuredHighlight.description}
                        </p>
                      )}
                    </div>

                    {featuredMatch && (
                      <div className="mt-8">
                        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-black/20">
                          <div className="mb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gray-500">
                            <Trophy className="h-4 w-4 text-yellow-400" />
                            {t("final")}
                          </div>

                          <div className="flex items-center justify-between gap-4">
                            <div className="text-center">
                              <p className="text-2xl font-black">
                                {getClassName(featuredMatch.home_team_id)}
                              </p>
                            </div>

                            <div className="text-center">
                              <p className="text-3xl font-black tracking-tight">
                                {featuredMatch.home_score}
                                <span className="mx-2 text-gray-400">–</span>
                                {featuredMatch.away_score}
                              </p>
                            </div>

                            <div className="text-center">
                              <p className="text-2xl font-black">
                                {getClassName(featuredMatch.away_team_id)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                            <CalendarDays className="h-3.5 w-3.5" />
                            {formatDate(featuredMatch.match_date)}
                          </div>
                        </div>
                      </div>
                    )}

                    <Link
                      href={featuredHighlight.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3.5 text-sm font-black text-black transition hover:bg-emerald-400"
                    >
                      <Play className="h-4 w-4 fill-current" />
                      {t("watchVideo")}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </article>
            )}

            {/* =====================================================
                REMAINING HIGHLIGHTS
            ===================================================== */}
            {remainingHighlights.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {remainingHighlights.map((highlight) => {
                  const match = getMatch(highlight.match_id);
                  const embedUrl = getVideoEmbedUrl(highlight.video_url);

                  return (
                    <article
                      key={highlight.id}
                      className="group overflow-hidden rounded-[1.5rem] border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/5 dark:border-white/10 dark:bg-[#0b100d]"
                    >
                      {/* Video */}
                      <div className="relative aspect-video overflow-hidden bg-black">
                        {embedUrl ? (
                          <iframe
                            src={embedUrl}
                            title={highlight.title}
                            className="h-full w-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : highlight.thumbnail_url ? (
                          <Link
                            href={highlight.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group/video relative block h-full w-full"
                          >
                            <img
                              src={highlight.thumbnail_url}
                              alt={highlight.title}
                              className="h-full w-full object-cover transition duration-500 group-hover/video:scale-105"
                            />

                            <div className="absolute inset-0 bg-black/20 transition group-hover/video:bg-black/40" />

                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-black shadow-xl transition group-hover/video:scale-110">
                                <Play className="ml-0.5 h-6 w-6 fill-current" />
                              </div>
                            </div>
                          </Link>
                        ) : (
                          <Link
                            href={highlight.video_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-full items-center justify-center"
                          >
                            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-black">
                              <Play className="ml-0.5 h-6 w-6 fill-current" />
                            </div>
                          </Link>
                        )}
                      </div>

                      {/* Card content */}
                      <div className="p-5">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-emerald-500">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          {isArabic ? "أبرز اللقطات" : "Highlights"}
                        </div>

                        <h2 className="mt-3 line-clamp-2 text-lg font-black leading-tight">
                          {highlight.title}
                        </h2>

                        {match && (
                          <div className="mt-5 rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-white/10 dark:bg-white/[0.03]">
                            <div className="flex items-center justify-between gap-3">
                              <span className="text-sm font-black">
                                {getClassName(match.home_team_id)}
                              </span>

                              <span className="text-lg font-black">
                                {match.home_score}
                                <span className="mx-1 text-gray-400">
                                  –
                                </span>
                                {match.away_score}
                              </span>

                              <span className="text-sm font-black">
                                {getClassName(match.away_team_id)}
                              </span>
                            </div>

                            <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-gray-500">
                              <CalendarDays className="h-3 w-3" />
                              {formatDate(match.match_date)}
                            </div>
                          </div>
                        )}

                        {highlight.description && (
                          <p className="mt-4 line-clamp-2 text-sm leading-6 text-gray-500 dark:text-gray-400">
                            {highlight.description}
                          </p>
                        )}

                        <Link
                          href={highlight.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-5 flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm font-bold transition hover:border-emerald-500/40 hover:bg-emerald-500/5 dark:border-white/10"
                        >
                          <span className="flex items-center gap-2">
                            <Play className="h-4 w-4 fill-current text-emerald-400" />
                            {t("watchVideo")}
                          </span>

                          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180" />
                        </Link>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      {/* =========================================================
          BOTTOM BRAND STRIP
      ========================================================= */}
      <section className="border-t border-gray-200 dark:border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-500">
              NWIS FOOTBALL
            </p>

            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {isArabic
                ? "كل مباراة تصنع لحظة تستحق المشاهدة."
                : "Every match creates a moment worth watching."}
            </p>
          </div>

          <Link
            href={`/${locale}/matches`}
            className="inline-flex items-center gap-2 text-sm font-bold transition hover:text-emerald-400"
          >
            {isArabic ? "استكشف المباريات" : "Explore Matches"}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
          </Link>
        </div>
      </section>
    </main>
  );
}