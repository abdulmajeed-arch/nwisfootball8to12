import { getTranslations } from "next-intl/server";

import { requireAdmin } from "@/lib/supabase/admin";
import { AddNewsForm } from "@/components/admin/AddNewsForm";

export default async function AddNewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  await requireAdmin(locale);

  const t = await getTranslations("adminNews");

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <div className="mb-8">
        <a
          href={`/${locale}/admin/news`}
          className="text-sm font-medium text-gray-500 hover:underline"
        >
          ← {t("backToNews")}
        </a>

        <h1 className="mt-4 text-4xl font-extrabold tracking-tight">
          {t("addNews")}
        </h1>

        <p className="mt-2 text-gray-500 dark:text-gray-400">
          {t("addNewsDescription")}
        </p>
      </div>

      <AddNewsForm locale={locale} />
    </main>
  );
}