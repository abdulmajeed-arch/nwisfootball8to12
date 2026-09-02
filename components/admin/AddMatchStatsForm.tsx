"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { createClient } from "@/lib/supabase/client";

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

type Goal = {
  id: string;
  scorerId: string;
  assistId: string;
};

type Card = {
  id: string;
  playerId: string;
  type: "yellow_card" | "red_card";
};

type AddMatchStatsFormProps = {
  locale: string;
  match: Match;
  homeTeam: Team;
  awayTeam: Team;
  players: Player[];
};

export function AddMatchStatsForm({
  locale,
  match,
  homeTeam,
  awayTeam,
  players,
}: AddMatchStatsFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [goals, setGoals] = useState<Goal[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [mvpId, setMvpId] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const homePlayers = useMemo(
    () => players.filter((player) => player.team_id === homeTeam.id),
    [players, homeTeam.id]
  );

  const awayPlayers = useMemo(
    () => players.filter((player) => player.team_id === awayTeam.id),
    [players, awayTeam.id]
  );

  const allPlayers = useMemo(
    () => [...homePlayers, ...awayPlayers],
    [homePlayers, awayPlayers]
  );

  const homeScore = goals.filter((goal) => {
    const scorer = players.find((player) => player.id === goal.scorerId);
    return scorer?.team_id === homeTeam.id;
  }).length;

  const awayScore = goals.filter((goal) => {
    const scorer = players.find((player) => player.id === goal.scorerId);
    return scorer?.team_id === awayTeam.id;
  }).length;

  function addGoal() {
    setGoals((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        scorerId: "",
        assistId: "",
      },
    ]);
  }

  function removeGoal(id: string) {
    setGoals((current) => current.filter((goal) => goal.id !== id));
  }

  function updateGoal(
    id: string,
    field: "scorerId" | "assistId",
    value: string
  ) {
    setGoals((current) =>
      current.map((goal) => {
        if (goal.id !== id) return goal;

        if (field === "scorerId") {
          return {
            ...goal,
            scorerId: value,
            assistId: "",
          };
        }

        return {
          ...goal,
          assistId: value,
        };
      })
    );
  }

  function addCard(type: "yellow_card" | "red_card") {
    setCards((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        playerId: "",
        type,
      },
    ]);
  }

  function removeCard(id: string) {
    setCards((current) => current.filter((card) => card.id !== id));
  }

  function updateCard(id: string, playerId: string) {
    setCards((current) =>
      current.map((card) =>
        card.id === id
          ? {
              ...card,
              playerId,
            }
          : card
      )
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError("");

    for (const goal of goals) {
      if (!goal.scorerId) {
        setError("Every goal must have a scorer.");
        return;
      }

      if (goal.assistId) {
        const scorer = players.find(
          (player) => player.id === goal.scorerId
        );

        const assister = players.find(
          (player) => player.id === goal.assistId
        );

        if (!scorer || !assister || scorer.team_id !== assister.team_id) {
          setError(
            "The assister must belong to the same class as the scorer."
          );
          return;
        }
      }
    }

    for (const card of cards) {
      if (!card.playerId) {
        setError("Every card must have a player.");
        return;
      }
    }

    if (!mvpId) {
      setError("Please select an MVP.");
      return;
    }

    setLoading(true);

    try {
      const events = [
        ...goals.map((goal) => ({
          event_type: "goal",
          player_id: goal.scorerId,
          assist_player_id: goal.assistId || null,
        })),

        ...cards.map((card) => ({
          event_type: card.type,
          player_id: card.playerId,
        })),

        {
          event_type: "mvp",
          player_id: mvpId,
        },
      ];

      const { error: rpcError } = await supabase.rpc(
        "save_match_statistics",
        {
          p_match_id: match.id,
          p_events: events,
        }
      );

      if (rpcError) {
        console.error("Save statistics error:", rpcError);
        setError(rpcError.message);
        return;
      }

      router.push(`/${locale}/admin/matches`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-8">
      {/* SCORE */}
      <section className="rounded-2xl border border-black/10 p-6 dark:border-white/10">
        <p className="text-center text-sm text-zinc-500">
          Current Score
        </p>

        <div className="mt-4 flex items-center justify-center gap-6 text-center">
          <div>
            <p className="font-semibold">{homeTeam.name}</p>
            <p className="mt-2 text-5xl font-bold">{homeScore}</p>
          </div>

          <span className="text-2xl text-zinc-400">-</span>

          <div>
            <p className="font-semibold">{awayTeam.name}</p>
            <p className="mt-2 text-5xl font-bold">{awayScore}</p>
          </div>
        </div>
      </section>

      {/* GOALS */}
      <section className="rounded-2xl border border-black/10 p-6 dark:border-white/10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">⚽ Goals</h2>
            <p className="mt-1 text-sm text-zinc-500">
              Add the scorer and optional assister.
            </p>
          </div>

          <button
            type="button"
            onClick={addGoal}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
          >
            + Add Goal
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {goals.length === 0 && (
            <p className="text-sm text-zinc-500">
              No goals recorded.
            </p>
          )}

          {goals.map((goal, index) => {
            const scorer = players.find(
              (player) => player.id === goal.scorerId
            );

            const assisterOptions = scorer
              ? players.filter(
                  (player) => player.team_id === scorer.team_id
                )
              : [];

            return (
              <div
                key={goal.id}
                className="rounded-xl border border-black/10 p-4 dark:border-white/10"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">
                    Goal {index + 1}
                  </p>

                  <button
                    type="button"
                    onClick={() => removeGoal(goal.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-medium">
                      Scorer
                    </span>

                    <select
                      value={goal.scorerId}
                      onChange={(e) =>
                        updateGoal(
                          goal.id,
                          "scorerId",
                          e.target.value
                        )
                      }
                      className="mt-2 w-full rounded-lg border border-black/10 bg-transparent px-4 py-3 dark:border-white/10"
                    >
                      <option value="">Select scorer</option>

                      <optgroup label={homeTeam.name}>
                        {homePlayers.map((player) => (
                          <option key={player.id} value={player.id}>
                            {player.full_name}
                          </option>
                        ))}
                      </optgroup>

                      <optgroup label={awayTeam.name}>
                        {awayPlayers.map((player) => (
                          <option key={player.id} value={player.id}>
                            {player.full_name}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-sm font-medium">
                      Assist
                    </span>

                    <select
                      value={goal.assistId}
                      onChange={(e) =>
                        updateGoal(
                          goal.id,
                          "assistId",
                          e.target.value
                        )
                      }
                      disabled={!scorer}
                      className="mt-2 w-full rounded-lg border border-black/10 bg-transparent px-4 py-3 disabled:opacity-50 dark:border-white/10"
                    >
                      <option value="">No assist</option>

                      {assisterOptions.map((player) => (
                        <option key={player.id} value={player.id}>
                          {player.full_name}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* CARDS */}
      <section className="rounded-2xl border border-black/10 p-6 dark:border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">
              🟨🟥 Cards
            </h2>
            <p className="mt-1 text-sm text-zinc-500">
              Record yellow and red cards.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => addCard("yellow_card")}
              className="rounded-lg border border-black/10 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-zinc-900"
            >
              + Yellow
            </button>

            <button
              type="button"
              onClick={() => addCard("red_card")}
              className="rounded-lg border border-black/10 px-4 py-2 text-sm font-medium hover:bg-zinc-50 dark:border-white/10 dark:hover:bg-zinc-900"
            >
              + Red
            </button>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {cards.length === 0 && (
            <p className="text-sm text-zinc-500">
              No cards recorded.
            </p>
          )}

          {cards.map((card) => (
            <div
              key={card.id}
              className="flex items-center gap-3"
            >
              <span className="text-xl">
                {card.type === "yellow_card" ? "🟨" : "🟥"}
              </span>

              <select
                value={card.playerId}
                onChange={(e) =>
                  updateCard(card.id, e.target.value)
                }
                className="flex-1 rounded-lg border border-black/10 bg-transparent px-4 py-3 dark:border-white/10"
              >
                <option value="">Select player</option>

                <optgroup label={homeTeam.name}>
                  {homePlayers.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.full_name}
                    </option>
                  ))}
                </optgroup>

                <optgroup label={awayTeam.name}>
                  {awayPlayers.map((player) => (
                    <option key={player.id} value={player.id}>
                      {player.full_name}
                    </option>
                  ))}
                </optgroup>
              </select>

              <button
                type="button"
                onClick={() => removeCard(card.id)}
                className="text-sm text-red-600 hover:underline"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* MVP */}
      <section className="rounded-2xl border border-black/10 p-6 dark:border-white/10">
        <h2 className="text-xl font-semibold">⭐ MVP</h2>

        <p className="mt-1 text-sm text-zinc-500">
          Select the player of the match.
        </p>

        <select
          value={mvpId}
          onChange={(e) => setMvpId(e.target.value)}
          className="mt-4 w-full rounded-lg border border-black/10 bg-transparent px-4 py-3 dark:border-white/10"
        >
          <option value="">Select MVP</option>

          <optgroup label={homeTeam.name}>
            {homePlayers.map((player) => (
              <option key={player.id} value={player.id}>
                {player.full_name}
              </option>
            ))}
          </optgroup>

          <optgroup label={awayTeam.name}>
            {awayPlayers.map((player) => (
              <option key={player.id} value={player.id}>
                {player.full_name}
              </option>
            ))}
          </optgroup>
        </select>
      </section>

      {error && (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* SAVE */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-black px-6 py-4 font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-black"
      >
        {loading ? "Saving..." : "Save Statistics & Finish Match"}
      </button>
    </form>
  );
}