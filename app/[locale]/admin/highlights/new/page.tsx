import { getTranslations } from "next-intl/server";

import { requireAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { AddHighlightForm } from "@/components/admin/AddHighlightForm";

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

export default async function AddHighlightPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  await requireAdmin(locale);

  const t = await getTranslations("adminHighlights");
  const supabase = await createClient();

  const [{ data: matches, error: matchesError }, { data: teams, error: teamsError }] =
    await Promise.all([
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
        )
        .eq("status", "finished")
        .order("match_date", { ascending: false }),

      supabase
        .from("teams")
        .select("id, grade, section, name"),
    ]);

  if (matchesError || teamsError) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {t("loadError")}
        </div>
      </main>
    );
  }

  const typedMatches = (matches ?? []) as Match[];
  const typedTeams = (teams ?? []) as Team[];

  const getClassName = (teamId: string) => {
    const team = typedTeams.find((team) => team.id === teamId);

    if (!team) {
      return t("unknownClass");
    }

    return `${team.grade}${team.section}`;
  };

  const formattedMatches = typedMatches.map((match) => ({
    id: match.id,

    label: `${getClassName(match.home_team_id)} ${match.home_score} - ${match.away_score} ${getClassName(match.away_team_id)} • ${new Intl.DateTimeFormat(
      locale === "ar" ? "ar-SA" : "en-US",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Riyadh",
      }
    ).format(new Date(match.match_date))}`,
  }));

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <AddHighlightForm
        locale={locale}
        matches={formattedMatches}
      />
    </main>
  );
}