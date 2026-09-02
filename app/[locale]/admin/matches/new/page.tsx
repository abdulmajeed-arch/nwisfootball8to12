import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin";

import AddMatchForm from "@/components/admin/AddMatchForm";

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

export default async function NewMatchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  await requireAdmin(locale);

  const supabase = await createClient();
  const t = await getTranslations("adminMatches");

  const { data: competitions, error: competitionsError } =
    await supabase
      .from("competitions")
      .select("id, name, name_ar")
      .order("name");

  const { data: teams, error: teamsError } = await supabase
    .from("teams")
    .select(`
      id,
      competition_id,
      grade,
      section,
      name
    `)
    .order("grade")
    .order("section");

  if (competitionsError) {
    console.error("Competitions error:", competitionsError);
  }

  if (teamsError) {
    console.error("Teams error:", teamsError);
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href={`/${locale}/admin/matches`}
          className="text-sm text-blue-600 hover:underline"
        >
          ← {t("backToMatches")}
        </Link>

        <h1 className="mt-4 text-4xl font-bold">
          {t("addMatch")}
        </h1>

        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {t("addMatchDescription")}
        </p>

        {competitionsError || teamsError ? (
          <div className="mt-8 rounded-xl border border-red-500/20 bg-red-500/10 p-5 text-red-600">
            {t("loadError")}
          </div>
        ) : (
          <AddMatchForm
            locale={locale}
            competitions={(competitions ?? []) as Competition[]}
            teams={(teams ?? []) as Team[]}
          />
        )}
      </div>
    </main>
  );
}