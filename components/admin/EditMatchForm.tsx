"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Competition = {
  id: string;
  name: string;
  name_ar: string;
};

type Team = {
  id: string;
  competition_id: string;
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

type EditMatchFormProps = {
  locale: string;
  match: Match;
  competitions: Competition[];
  teams: Team[];
};

export function EditMatchForm({
  locale,
  match,
  competitions,
  teams,
}: EditMatchFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const initialDate = new Date(match.match_date);

  const dateString = `${initialDate.getFullYear()}-${String(
    initialDate.getMonth() + 1
  ).padStart(2, "0")}-${String(initialDate.getDate()).padStart(2, "0")}`;

  const timeString = `${String(initialDate.getHours()).padStart(
    2,
    "0"
  )}:${String(initialDate.getMinutes()).padStart(2, "0")}`;

  const [competitionId, setCompetitionId] = useState(
    match.competition_id
  );

  const [homeTeamId, setHomeTeamId] = useState(
    match.home_team_id
  );

  const [awayTeamId, setAwayTeamId] = useState(
    match.away_team_id
  );

  const [matchDate, setMatchDate] = useState(dateString);
  const [matchTime, setMatchTime] = useState(timeString);
  const [status, setStatus] = useState(match.status);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedCompetitionTeams = teams.filter(
    (team) => team.competition_id === competitionId
  );

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!competitionId) {
      setError("Please select a competition.");
      return;
    }

    if (!homeTeamId || !awayTeamId) {
      setError("Please select both teams.");
      return;
    }

    if (homeTeamId === awayTeamId) {
      setError("The home team and away team must be different.");
      return;
    }

    if (!matchDate || !matchTime) {
      setError("Please select a date and time.");
      return;
    }

    setLoading(true);

    const matchDateTime = new Date(
  `${matchDate}T${matchTime}:00+03:00`
).toISOString();

    const { error: updateError } = await supabase
      .from("matches")
      .update({
        competition_id: competitionId,
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        match_date: matchDateTime,
        status,
      })
      .eq("id", match.id);

    if (updateError) {
      console.error("Update match error:", updateError);
      setError(updateError.message);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/admin/matches/${match.id}`);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900"
    >
      {/* Competition */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Competition
        </label>

        <select
          value={competitionId}
          onChange={(event) => {
            const newCompetitionId = event.target.value;

            setCompetitionId(newCompetitionId);

            const newTeams = teams.filter(
              (team) => team.competition_id === newCompetitionId
            );

            if (!newTeams.some((team) => team.id === homeTeamId)) {
              setHomeTeamId("");
            }

            if (!newTeams.some((team) => team.id === awayTeamId)) {
              setAwayTeamId("");
            }
          }}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-zinc-900"
        >
          <option value="">Select competition</option>

          {competitions.map((competition) => (
            <option key={competition.id} value={competition.id}>
              {locale === "ar"
                ? competition.name_ar
                : competition.name}
            </option>
          ))}
        </select>
      </div>

      {/* Home Team */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Home Team
        </label>

        <select
          value={homeTeamId}
          onChange={(event) => setHomeTeamId(event.target.value)}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-zinc-900"
        >
          <option value="">Select home team</option>

          {selectedCompetitionTeams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      {/* Away Team */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Away Team
        </label>

        <select
          value={awayTeamId}
          onChange={(event) => setAwayTeamId(event.target.value)}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-zinc-900"
        >
          <option value="">Select away team</option>

          {selectedCompetitionTeams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      {/* Date */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Match Date
        </label>

        <input
          type="date"
          value={matchDate}
          onChange={(event) => setMatchDate(event.target.value)}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-zinc-900"
        />
      </div>

      {/* Time */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Match Time
        </label>

        <input
          type="time"
          value={matchTime}
          onChange={(event) => setMatchTime(event.target.value)}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-zinc-900"
        />
      </div>

      {/* Status */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Status
        </label>

        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 dark:border-white/10 dark:bg-zinc-900"
        >
          <option value="upcoming">Upcoming</option>
          <option value="live">Live</option>
          <option value="finished">Finished</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-black px-5 py-3 font-semibold text-white hover:bg-zinc-800 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}