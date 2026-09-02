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
  grade: number;
  section: string;
  name: string;
};

export default function AddMatchForm({
  locale,
  competitions,
  teams,
}: {
  locale: string;
  competitions: Competition[];
  teams: Team[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [competitionId, setCompetitionId] = useState("");
  const [homeTeamId, setHomeTeamId] = useState("");
  const [awayTeamId, setAwayTeamId] = useState("");
  const [matchDate, setMatchDate] = useState("");
  const [matchTime, setMatchTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedCompetitionTeams = teams.filter(
    (team) => team.competition_id === competitionId
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!competitionId) {
      setError("Please select a competition.");
      return;
    }

    if (!homeTeamId) {
      setError("Please select a home team.");
      return;
    }

    if (!awayTeamId) {
      setError("Please select an away team.");
      return;
    }

    if (homeTeamId === awayTeamId) {
      setError("The home team and away team must be different.");
      return;
    }

    if (!matchDate) {
      setError("Please select a match date.");
      return;
    }

    if (!matchTime) {
      setError("Please select a match time.");
      return;
    }

    setLoading(true);

    const matchDateTime = new Date(
  `${matchDate}T${matchTime}:00+03:00`
).toISOString();

    const { error: insertError } = await supabase
      .from("matches")
      .insert({
        competition_id: competitionId,
        home_team_id: homeTeamId,
        away_team_id: awayTeamId,
        match_date: matchDateTime,
        status: "upcoming",
        home_score: 0,
        away_score: 0,
      });

    if (insertError) {
      console.error("Create match error:", insertError);
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/admin/matches`);
    router.refresh();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-6"
    >
      {/* Competition */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Competition
        </label>

        <select
          value={competitionId}
          onChange={(event) => {
            setCompetitionId(event.target.value);
            setHomeTeamId("");
            setAwayTeamId("");
          }}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-black dark:border-white/10 dark:bg-zinc-900 dark:focus:border-white"
        >
          <option value="">Select competition</option>

          {competitions.map((competition) => (
            <option
              key={competition.id}
              value={competition.id}
            >
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
          disabled={!competitionId}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-zinc-900"
        >
          <option value="">
            {competitionId
              ? "Select home team"
              : "Select a competition first"}
          </option>

          {selectedCompetitionTeams.map((team) => (
            <option
              key={team.id}
              value={team.id}
            >
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
          disabled={!competitionId}
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-zinc-900"
        >
          <option value="">
            {competitionId
              ? "Select away team"
              : "Select a competition first"}
          </option>

          {selectedCompetitionTeams.map((team) => (
            <option
              key={team.id}
              value={team.id}
            >
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
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-zinc-900"
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
          className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none dark:border-white/10 dark:bg-zinc-900"
        />
      </div>

      {/* Status */}
      <div>
        <label className="mb-2 block text-sm font-medium">
          Status
        </label>

        <div className="rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:border-white/10 dark:bg-zinc-800 dark:text-zinc-300">
          Upcoming
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-black px-5 py-3 font-medium text-white hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        {loading ? "Creating..." : "Create Match"}
      </button>
    </form>
  );
}