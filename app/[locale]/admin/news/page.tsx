import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { requireAdmin } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

type News = {
  id: string;
  title: string;
  title_ar: string;
  excerpt: string | null;
  excerpt_ar: string | null;
  content: string;
  content_ar: string;
  image_url: string | null;
  published: boolean;
  published_at: string | null;
  created_at: string;
};

export default async function AdminNewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  await requireAdmin(locale);

  const t = await getTranslations("adminNews");
  const supabase = await createClient();

  const { data: news, error } = await supabase
  .from("news")
  .select(`
    id,
    title,
    title_ar,
    excerpt,
    excerpt_ar,
    content,
    content_ar,
    image_url,
    published,
    published_at,
    created_at,
    competition_id
  `)
  .eq(
    "competition_id",
    "812b117a-df69-40ce-b4b2-62ae9ca3e8cf"
  )
  .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="mx-auto max-w-7xl px-6 py-12">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {t("loadError")}
        </div>
      </main>
    );
  }

  const typedNews = (news ?? []) as News[];

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat(
      locale === "ar" ? "ar-SA" : "en-US",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Riyadh",
      }
    ).format(new Date(dateString));
  };

  return (
    <main className="mx-auto max-w-7xl px-6 py-12">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Link
            href={`/${locale}/admin`}
            className="text-sm font-medium text-gray-500 hover:underline"
          >
            {t("backToAdmin")}
          </Link>

          <h1 className="mt-3 text-4xl font-extrabold tracking-tight">
            {t("title")}
          </h1>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {t("subtitle")}
          </p>
        </div>

        <Link
          href={`/${locale}/admin/news/new`}
          className="rounded-xl bg-gray-950 px-5 py-3 text-center font-semibold text-white transition hover:scale-[1.02] dark:bg-white dark:text-gray-950"
        >
          {t("addNews")}
        </Link>
      </div>

      {/* Empty state */}
      {typedNews.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 p-10 text-center dark:border-gray-800">
          <div className="text-5xl">📰</div>

          <h2 className="mt-4 text-xl font-bold">
            {t("noNews")}
          </h2>

          <p className="mt-2 text-gray-500 dark:text-gray-400">
            {t("noNewsDescription")}
          </p>

          <Link
            href={`/${locale}/admin/news/new`}
            className="mt-6 inline-block rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white dark:bg-white dark:text-gray-950"
          >
            {t("addNews")}
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {typedNews.map((article) => (
            <article
              key={article.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-950"
            >
              {/* Image */}
              <div className="aspect-video overflow-hidden bg-gray-100 dark:bg-gray-900">
                {article.image_url ? (
                  <img
                    src={article.image_url}
                    alt={article.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-5xl">
                    📰
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      article.published
                        ? "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300"
                        : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                    }`}
                  >
                    {article.published
                      ? t("published")
                      : t("draft")}
                  </span>

                  {article.published_at && (
                    <span className="text-xs text-gray-500">
                      {formatDate(article.published_at)}
                    </span>
                  )}
                </div>

                <h2 className="mt-4 text-lg font-bold">
                  {locale === "ar"
                    ? article.title_ar
                    : article.title}
                </h2>

                {(locale === "ar"
                  ? article.excerpt_ar
                  : article.excerpt) && (
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-500 dark:text-gray-400">
                    {locale === "ar"
                      ? article.excerpt_ar
                      : article.excerpt}
                  </p>
                )}

                <div className="mt-5 flex gap-2">
                  <Link
                    href={`/${locale}/admin/news/${article.id}/edit`}
                    className="flex-1 rounded-lg border border-black/10 px-4 py-2 text-center text-sm font-medium hover:bg-gray-50 dark:border-white/10 dark:hover:bg-gray-900"
                  >
                    {t("edit")}
                  </Link>

                  <Link
                    href={`/${locale}/news/${article.id}`}
                    target="_blank"
                    className="flex-1 rounded-lg bg-gray-950 px-4 py-2 text-center text-sm font-medium text-white hover:opacity-90 dark:bg-white dark:text-gray-950"
                  >
                    {t("view")}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </main>
  );
}