import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import {
  ArrowLeft,
  ArrowRight,
  Pencil,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/admin";
import EditPlayerForm from "@/components/admin/EditPlayerForm";

export default async function EditPlayerPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;

  await requireAdmin(locale);

  const supabase = await createClient();
  const t = await getTranslations("adminPlayers");

  const [{ data: player, error: playerError }, { data: teams, error: teamsError }] =
    await Promise.all([
      supabase
        .from("players")
        .select(`
          id,
          full_name,
          position,
          nationality,
          photo_url,
          team_id
        `)
        .eq("id", id)
        .single(),

      supabase
        .from("teams")
        .select("id, name, grade, section")
        .order("grade")
        .order("section"),
    ]);

  if (playerError || !player) {
    console.error("Player error:", playerError);
    notFound();
  }

  if (teamsError) {
    console.error("Teams error:", teamsError);
  }

  const isArabic = locale === "ar";

  return (
    <main className="min-h-screen bg-white text-gray-950 dark:bg-gray-950 dark:text-white">
      {/* Hero */}
      <section className="relative isolate overflow-hidden border-b border-gray-200 dark:border-gray-800">
        <div className="absolute inset-0 -z-20 bg-gradient-to-br from-emerald-50 via-white to-amber-50 dark:from-emerald-950 dark:via-gray-950 dark:to-black" />

        <div
          className="absolute inset-0 -z-10 opacity-40 dark:opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(16,185,129,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.08) 1px, transparent 1px)",
            backgroundSize: "42px 42px",
          }}
        />

        <div className="absolute -left-32 top-0 -z-10 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl dark:bg-emerald-500/10" />
        <div className="absolute -right-32 bottom-0 -z-10 h-72 w-72 rounded-full bg-amber-400/20 blur-3xl dark:bg-amber-500/10" />

        <div className="mx-auto max-w-7xl px-6 pb-12 pt-8 sm:pb-16 sm:pt-12 lg:pt-16">
          <Link
            href={`/${locale}/admin/players`}
            className="group inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white/80 px-3.5 py-2 text-sm font-semibold text-gray-700 backdrop-blur transition-all hover:-translate-x-0.5 hover:border-gray-400 hover:bg-white dark:border-gray-700 dark:bg-gray-900/70 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-gray-900"
          >
            {isArabic ? (
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            ) : (
              <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
            )}

            {t("backToPlayers")}
          </Link>

          <div className="mt-8 flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-950 text-white shadow-lg dark:bg-white dark:text-gray-950">
              <Pencil className="h-6 w-6" />
            </div>

            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-400">
                <ShieldCheck className="h-4 w-4" />
                {isArabic ? "لوحة الإدارة" : "Admin Panel"}
              </div>

              <h1 className="mt-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
                {t("editPlayer")}
              </h1>

              <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-400">
                {t("editPlayerDescription")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="mx-auto max-w-3xl px-6 py-10 sm:py-14">
        <div className="overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-5 dark:border-gray-800 sm:px-8">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
              <UserRound className="h-5 w-5" />
            </div>

            <div>
              <h2 className="font-bold text-gray-950 dark:text-white">
                {player.full_name}
              </h2>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                {isArabic
                  ? "تحديث معلومات اللاعب"
                  : "Update player information"}
              </p>
            </div>
          </div>

          <div className="p-6 sm:p-8">
            <EditPlayerForm
              locale={locale}
              player={player}
              teams={teams ?? []}
            />
          </div>
        </div>
      </section>

      {/* Bottom strip */}
      <section className="bg-gray-950 text-white dark:bg-black">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-400">
              NWIS Football
            </p>

            <p className="mt-2 text-xl font-extrabold">
              {isArabic
                ? "إدارة اللاعبين بسهولة."
                : "Manage your players with ease."}
            </p>
          </div>

          <Link
            href={`/${locale}/admin/players`}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-gray-950 transition hover:bg-gray-200 dark:bg-gray-100 dark:hover:bg-white"
          >
            {t("backToPlayers")}

            {isArabic ? (
              <ArrowLeft className="h-4 w-4" />
            ) : (
              <ArrowRight className="h-4 w-4" />
            )}
          </Link>
        </div>
      </section>
    </main>
  );
}