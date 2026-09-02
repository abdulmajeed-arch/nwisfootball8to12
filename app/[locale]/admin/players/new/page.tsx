import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin";
import AddPlayerForm from "@/components/admin/AddPlayerForm";

export default async function NewPlayerPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  await requireAdmin(locale);

  const supabase = await createClient();
  const t = await getTranslations("adminPlayers");

  const { data: teams, error } = await supabase
    .from("teams")
    .select("id, name, grade, section")
    .order("grade")
    .order("section");

  if (error) {
    console.error("Teams error:", error);
  }

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          href={`/${locale}/admin/players`}
          className="text-sm text-blue-600 hover:underline"
        >
          ← {t("backToPlayers")}
        </Link>

       <h1 className="mt-4 text-4xl font-bold">
  {t("addPlayer")}
</h1>

        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          {t("addPlayerDescription")}
        </p>

        <AddPlayerForm
          locale={locale}
          teams={teams ?? []}
        />
      </div>
    </main>
  );
}