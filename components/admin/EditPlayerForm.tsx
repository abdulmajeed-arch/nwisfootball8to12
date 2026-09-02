"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Team = {
  id: string;
  name: string;
  grade: number;
  section: string;
};

type Player = {
  id: string;
  full_name: string;
  position: string;
  nationality: string | null;
  photo_url: string | null;
  team_id: string;
};

const countries = [
  { code: "SA", name: "Saudi Arabia" },
  { code: "SY", name: "Syria" },
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "EG", name: "Egypt" },
  { code: "PK", name: "Pakistan" },
  { code: "IN", name: "India" },
  { code: "BD", name: "Bangladesh" },
  { code: "JO", name: "Jordan" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "KW", name: "Kuwait" },
  { code: "QA", name: "Qatar" },
  { code: "BH", name: "Bahrain" },
  { code: "OM", name: "Oman" },
  { code: "YE", name: "Yemen" },
  { code: "IQ", name: "Iraq" },
  { code: "TR", name: "Türkiye" },
  { code: "SD", name: "Sudan" },
  { code: "PS", name: "Palestine" },
];

export default function EditPlayerForm({
  locale,
  player,
  teams,
}: {
  locale: string;
  player: Player;
  teams: Team[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState(player.full_name);
  const [position, setPosition] = useState(player.position);
  const [nationality, setNationality] = useState(player.nationality ?? "");
  const [teamId, setTeamId] = useState(player.team_id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    const { error } = await supabase
      .from("players")
      .update({
        full_name: fullName,
        position,
        nationality: nationality || null,
        team_id: teamId,
      })
      .eq("id", player.id);

    if (error) {
      console.error(error);
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push(`/${locale}/admin/players`);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium">
          Full Name
        </label>

        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Position
        </label>

        <select
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          required
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="goalkeeper">Goalkeeper</option>
          <option value="defender">Defender</option>
          <option value="midfielder">Midfielder</option>
          <option value="forward">Forward</option>
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Team
        </label>

        <select
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
          required
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900"
        >
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name} — Grade {team.grade}{team.section}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Nationality
        </label>

        <select
          value={nationality}
          onChange={(e) => setNationality(e.target.value)}
          className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="">Select nationality</option>

          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name} — {country.code}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}