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
  { code: "AF", name: "Afghanistan" },
  { code: "AL", name: "Albania" },
  { code: "AD", name: "Andorra" },
  { code: "AO", name: "Angola" },
  { code: "AR", name: "Argentina" },
  { code: "AM", name: "Armenia" },
  { code: "AT", name: "Austria" },
  { code: "AZ", name: "Azerbaijan" },
  { code: "BY", name: "Belarus" },
  { code: "BE", name: "Belgium" },
  { code: "BZ", name: "Belize" },
  { code: "BJ", name: "Benin" },
  { code: "BT", name: "Bhutan" },
  { code: "BO", name: "Bolivia" },
  { code: "BA", name: "Bosnia and Herzegovina" },
  { code: "BW", name: "Botswana" },
  { code: "BR", name: "Brazil" },
  { code: "BN", name: "Brunei" },
  { code: "BG", name: "Bulgaria" },
  { code: "BF", name: "Burkina Faso" },
  { code: "BI", name: "Burundi" },
  { code: "KH", name: "Cambodia" },
  { code: "CM", name: "Cameroon" },
  { code: "CA", name: "Canada" },
  { code: "CF", name: "Central African Republic" },
  { code: "TD", name: "Chad" },
  { code: "CL", name: "Chile" },
  { code: "CN", name: "China" },
  { code: "CO", name: "Colombia" },
  { code: "CR", name: "Costa Rica" },
  { code: "HR", name: "Croatia" },
  { code: "CZ", name: "Czechia" },
  { code: "CD", name: "Democratic Republic of the Congo" },
  { code: "DK", name: "Denmark" },
  { code: "DJ", name: "Djibouti" },
  { code: "DO", name: "Dominican Republic" },
  { code: "EC", name: "Ecuador" },
  { code: "SV", name: "El Salvador" },
  { code: "GQ", name: "Equatorial Guinea" },
  { code: "ER", name: "Eritrea" },
  { code: "EE", name: "Estonia" },
  { code: "SZ", name: "Eswatini" },
  { code: "ET", name: "Ethiopia" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "GA", name: "Gabon" },
  { code: "GM", name: "Gambia" },
  { code: "GE", name: "Georgia" },
  { code: "DE", name: "Germany" },
  { code: "GH", name: "Ghana" },
  { code: "GR", name: "Greece" },
  { code: "GT", name: "Guatemala" },
  { code: "GN", name: "Guinea" },
  { code: "GW", name: "Guinea-Bissau" },
  { code: "GY", name: "Guyana" },
  { code: "HN", name: "Honduras" },
  { code: "HU", name: "Hungary" },
  { code: "IS", name: "Iceland" },
  { code: "ID", name: "Indonesia" },
  { code: "IR", name: "Iran" },
  { code: "IE", name: "Ireland" },
  { code: "IL", name: "Israel" },
  { code: "IT", name: "Italy" },
  { code: "KZ", name: "Kazakhstan" },
  { code: "KE", name: "Kenya" },
  { code: "KP", name: "North Korea" },
  { code: "KR", name: "South Korea" },
  { code: "KG", name: "Kyrgyzstan" },
  { code: "LA", name: "Laos" },
  { code: "LV", name: "Latvia" },
  { code: "LB", name: "Lebanon" },
  { code: "LS", name: "Lesotho" },
  { code: "LR", name: "Liberia" },
  { code: "LY", name: "Libya" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lithuania" },
  { code: "LU", name: "Luxembourg" },
  { code: "MW", name: "Malawi" },
  { code: "MY", name: "Malaysia" },
  { code: "ML", name: "Mali" },
  { code: "MR", name: "Mauritania" },
  { code: "MX", name: "Mexico" },
  { code: "MD", name: "Moldova" },
  { code: "MC", name: "Monaco" },
  { code: "MN", name: "Mongolia" },
  { code: "ME", name: "Montenegro" },
  { code: "MA", name: "Morocco" },
  { code: "MZ", name: "Mozambique" },
  { code: "MM", name: "Myanmar" },
  { code: "NA", name: "Namibia" },
  { code: "NP", name: "Nepal" },
  { code: "NL", name: "Netherlands" },
  { code: "NI", name: "Nicaragua" },
  { code: "NE", name: "Niger" },
  { code: "NG", name: "Nigeria" },
  { code: "MK", name: "North Macedonia" },
  { code: "NO", name: "Norway" },
  { code: "PA", name: "Panama" },
  { code: "PY", name: "Paraguay" },
  { code: "PE", name: "Peru" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "RO", name: "Romania" },
  { code: "RU", name: "Russia" },
  { code: "RW", name: "Rwanda" },
  { code: "SM", name: "San Marino" },
  { code: "SN", name: "Senegal" },
  { code: "RS", name: "Serbia" },
  { code: "SL", name: "Sierra Leone" },
  { code: "SG", name: "Singapore" },
  { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" },
  { code: "SO", name: "Somalia" },
  { code: "ZA", name: "South Africa" },
  { code: "SS", name: "South Sudan" },
  { code: "ES", name: "Spain" },
  { code: "SR", name: "Suriname" },
  { code: "SE", name: "Sweden" },
  { code: "CH", name: "Switzerland" },
  { code: "TZ", name: "Tanzania" },
  { code: "TH", name: "Thailand" },
  { code: "TL", name: "Timor-Leste" },
  { code: "TG", name: "Togo" },
  { code: "TN", name: "Tunisia" },
  { code: "UG", name: "Uganda" },
  { code: "UA", name: "Ukraine" },
  { code: "UY", name: "Uruguay" },
  { code: "UZ", name: "Uzbekistan" },
  { code: "VA", name: "Vatican City" },
  { code: "VE", name: "Venezuela" },
  { code: "VN", name: "Vietnam" },
  { code: "EH", name: "Western Sahara" },
  { code: "ZM", name: "Zambia" },
  { code: "ZW", name: "Zimbabwe" },
];

export default function AddPlayerForm({
  locale,
  teams,
}: {
  locale: string;
  teams: Team[];
}) {
  const router = useRouter();
  const supabase = createClient();

  const [fullName, setFullName] = useState("");
  const [position, setPosition] = useState("");
  const [nationality, setNationality] = useState("");
  const [teamId, setTeamId] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setError("");

    let photoUrl: string | null = null;
    let uploadedPhotoPath: string | null = null;

    try {
      if (!fullName.trim()) {
        throw new Error("Please enter the player's name.");
      }

      if (!position) {
        throw new Error("Please select a position.");
      }

      if (!teamId) {
        throw new Error("Please select a team.");
      }

      if (photo) {
        if (!photo.type.startsWith("image/")) {
          throw new Error("Please select an image file.");
        }

        if (photo.size > 5 * 1024 * 1024) {
          throw new Error("Photo must be smaller than 5 MB.");
        }

        const extension =
          photo.name.split(".").pop()?.toLowerCase() || "jpg";

        const filePath = `${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("player-photos")
          .upload(filePath, photo, {
            contentType: photo.type,
            upsert: false,
          });

        if (uploadError) {
          throw uploadError;
        }

        uploadedPhotoPath = filePath;

        const { data } = supabase.storage
          .from("player-photos")
          .getPublicUrl(filePath);

        photoUrl = data.publicUrl;
      }

      const { error: insertError } = await supabase
        .from("players")
        .insert({
          full_name: fullName.trim(),
          position,
          nationality: nationality || null,
          team_id: teamId,
          photo_url: photoUrl,
        });

      if (insertError) {
        if (uploadedPhotoPath) {
          await supabase.storage
            .from("player-photos")
            .remove([uploadedPhotoPath]);
        }

        throw insertError;
      }

      router.push(`/${locale}/admin/players`);
      router.refresh();
    } catch (err) {
      console.error(err);

      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while adding the player."
      );

      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 space-y-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-zinc-900"
    >
      <div>
        <label className="mb-2 block text-sm font-medium">
          Full Name
        </label>

        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          className="w-full rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-zinc-800"
          placeholder="Player name"
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
          className="w-full rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-zinc-800"
        >
          <option value="">Select position</option>
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
          className="w-full rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-zinc-800"
        >
          <option value="">Select team</option>

          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name} — Grade {team.grade} {team.section}
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
          className="w-full rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-zinc-800"
        >
          <option value="">Select nationality</option>

          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name} — {country.code}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Player Photo
        </label>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setPhoto(e.target.files?.[0] ?? null);
          }}
          className="w-full rounded-xl border border-black/10 bg-zinc-50 px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 dark:border-white/10 dark:bg-zinc-800"
        />

        {photo && (
          <p className="mt-2 text-sm text-zinc-500">
            Selected: {photo.name}
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-xl bg-red-500/10 p-4 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add Player"}
      </button>
    </form>
  );
}