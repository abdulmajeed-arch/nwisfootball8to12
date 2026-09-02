import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin";
import { AddMatchStatsForm } from "@/components/admin/AddMatchStatsForm";

type Team = {
  id: string;
  name: string;
  grade: number;
  section: string;
};

type Match = {
  id: string;
  competition_id: string;
  home_team_id: string;
  away_team_id: string;
  match_date: string;
  status: string;
  home_score: number;
  away_score: number;
};

type Player = {
  id: string;
  full_name: string;
  position: string;
  team_id: string;
};

export default async function AddMatchStatsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  await requireAdmin(locale);

  const supabase = await createClient();
  const t = await getTranslations("adminMatches");

  const { data: match, error: matchError } = await supabase
    .from("matches")
    .select(
      `
        id,
        competition_id,
        home_team_id,
        away_team_id,
        match_date,
        status,
        home_score,
        away_score
      `
    )
    .eq("id", id)
    .single();

  if (matchError || !match) {
    console.error("Match error:", matchError);
    notFound();
  }

  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select("id, name, grade, section")
    .in("id", [match.home_team_id, match.away_team_id]);

  const { data: players, error: playersError } = await supabase
    .from("players")
    .select("id, full_name, position, team_id")
    .in("team_id", [match.home_team_id, match.away_team_id])
    .order("full_name");

  if (teamsError || playersError) {
    console.error("Stats loading error:", teamsError, playersError);
  }

  const homeTeam =
    teams?.find((team) => team.id === match.home_team_id) ?? null;

  const awayTeam =
    teams?.find((team) => team.id === match.away_team_id) ?? null;

  if (!homeTeam || !awayTeam) {
    notFound();
  }

  const typedMatch: Match = {
    id: match.id,
    competition_id: match.competition_id,
    home_team_id: match.home_team_id,
    away_team_id: match.away_team_id,
    match_date: match.match_date,
    status: match.status,
    home_score: match.home_score,
    away_score: match.away_score,
  };

  const typedPlayers: Player[] = (players ?? []).map((player) => ({
    id: player.id,
    full_name: player.full_name,
    position: player.position,
    team_id: player.team_id,
  }));

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/${locale}/admin/matches`}
          className="text-sm text-blue-600 hover:underline"
        >
          ← {t("backToMatches")}
        </Link>

        <h1 className="mt-4 text-4xl font-bold">
          {t("addStats")}
        </h1>

        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {t("addStatsDescription")}
        </p>

        <AddMatchStatsForm
          locale={locale}
          match={typedMatch}
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          players={typedPlayers}
        />
      </div>
    </main>
  );
}