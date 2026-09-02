import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { requireAdmin } from "@/lib/supabase/admin";
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

export default async function AdminHighlightsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  await requireAdmin(locale);

  const t = await getTranslations("adminHighlights");
  const supabase = await createClient();

  const [
    { data: highlights, error: highlightsError },
    { data: matches, error: matchesError },
    { data: teams, error: teamsError },
  ] = await Promise.all([
    supabase
      .from("highlights")
      .select(
        `
          id,
          match_id,
          title,
          description,
          video_url,
          thumbnail_url,
          created_at
        `
      )
      .order("created_at", { ascending: false }),

    supabase
      .from("matches")
      .select(
        `
          id,
          home_team_id,
          away_team_id,
          match_date,
          status,
          home_score,
          away_score
        `
      ),

    supabase
      .from("teams")
      .select("id, grade, section, name"),
  ]);

  if (highlightsError || matchesError || teamsError) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {t("loadError")}
        </div>
      </main>
    );
  }

  const typedHighlights = (highlights ?? []) as Highlight[];
  const typedMatches = (matches ?? []) as Match[];
  const typedTeams = (teams ?? []) as Team[];

  const getTeamName = (teamId: string) => {
    const team = typedTeams.find((team) => team.id === teamId);

    if (!team) {
      return t("unknownClass");
    }

    return `${team.grade}${team.section}`;
  };

  const getMatch = (matchId: string) => {
    return typedMatches.find((match) => match.id === matchId);
  };

  const formatMatchDate = (dateString: string) => {
    return new Intl.DateTimeFormat(
      locale === "ar" ? "ar-SA" : "en-US",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Riyadh",
      }
    ).format(new Date(dateString));
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href={`/${locale}/admin`}
            className="text-sm font-medium text-gray-500 hover:underline"
          >
            {t("backToAdmin")}
          </Link>

          <h1 className="mt-3 text-4xl font-extrabold tracking-tight">
            {t("title")}
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {t("subtitle")}
          </p>
        </div>

        <Link
          href={`/${locale}/admin/highlights/new`}
          className="rounded-xl bg-gray-950 px-5 py-3 text-center font-semibold text-white transition hover:scale-[1.02] dark:bg-white dark:text-gray-950"
        >
          {t("addHighlight")}
        </Link>
      </div>

      {/* Empty state */}
      {typedHighlights.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 p-10 text-center dark:border-gray-800">
          <div className="text-5xl">🎥</div>

          <h2 className="mt-4 text-xl font-bold">
            {t("noHighlights")}
          </h2>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {t("noHighlightsDescription")}
          </p>

          <Link
            href={`/${locale}/admin/highlights/new`}
            className="mt-6 inline-block rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white dark:bg-white dark:text-gray-950"
          >
            {t("addHighlight")}
          </Link>
        </div>
      ) : (
        /* Highlights */
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {typedHighlights.map((highlight) => {
            const match = getMatch(highlight.match_id);

            return (
              <article
                key={highlight.id}
                className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
              >
                {/* Thumbnail */}
                <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-gray-900">
                  {highlight.thumbnail_url ? (
                    <img
                      src={highlight.thumbnail_url}
                      alt={highlight.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl">
                      🎥
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  <h2 className="font-bold">
                    {highlight.title}
                  </h2>

                  {match && (
                    <div className="mt-3 rounded-xl bg-gray-50 p-3 dark:bg-gray-900">
                      <div className="flex items-center justify-between text-sm font-semibold">
                        <span>
                          {getTeamName(match.home_team_id)}
                        </span>

                        <span className="text-gray-500">
                          {match.home_score} - {match.away_score}
                        </span>

                        <span>
                          {getTeamName(match.away_team_id)}
                        </span>
                      </div>

                      <p className="mt-2 text-xs text-gray-500">
                        {formatMatchDate(match.match_date)}
                      </p>
                    </div>
                  )}

                  {highlight.description && (
                    <p className="mt-4 line-clamp-3 text-sm text-gray-500 dark:text-gray-400">
                      {highlight.description}
                    </p>
                  )}

                  <div className="mt-5 flex gap-2">
                    <Link
                      href={`/${locale}/admin/highlights/${highlight.id}/edit`}
                      className="flex-1 rounded-lg border border-black/10 px-4 py-2 text-center text-sm font-medium hover:bg-gray-50 dark:border-white/10 dark:hover:bg-gray-900"
                    >
                      {t("edit")}
                    </Link>

                    <Link
                      href={highlight.video_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 rounded-lg bg-gray-950 px-4 py-2 text-center text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-gray-950"
                    >
                      {t("viewVideo")}
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}