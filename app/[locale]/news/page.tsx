import { getTranslations } from "next-intl/server";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Newspaper,
  Trophy,
} from "lucide-react";

type NewsItem = {
  id: string;
  title: string;
  title_ar: string;
  excerpt: string | null;
  excerpt_ar: string | null;
  image_url: string | null;
  published_at: string | null;
};

export default async function NewsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations("news");
  const supabase = await createClient();

  const { data: news, error } = await supabase
  .from("news")
  .select(
    "id, title, title_ar, excerpt, excerpt_ar, image_url, published_at, competition_id"
  )
  .eq("published", true)
  .eq(
    "competition_id",
    "812b117a-df69-40ce-b4b2-62ae9ca3e8cf"
  )
  .order("published_at", { ascending: false });

  if (error) {
    console.error("NEWS LOAD ERROR:", error);

    return (
      <main className="min-h-screen bg-white px-6 py-12 text-gray-950 dark:bg-gray-950 dark:text-white">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-3xl border border-red-200 bg-red-50 p-12 text-center dark:border-red-500/20 dark:bg-red-500/5">
            <p className="text-sm font-semibold text-red-600 dark:text-red-400">
              {t("loadError")}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const typedNews: NewsItem[] = news ?? [];

  const featuredNews = typedNews[0];
  const secondaryNews = typedNews.slice(1);

  function formatDate(dateString: string) {
    return new Intl.DateTimeFormat(
      locale === "ar" ? "ar-SA" : "en-US",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Riyadh",
      }
    ).format(new Date(dateString));
  }

  return (
    <main className="min-h-screen overflow-hidden bg-white text-gray-950 dark:bg-gray-950 dark:text-white">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative isolate overflow-hidden border-b border-gray-200 dark:border-white/10">

        {/* Light background */}
        <div className="absolute inset-0 -z-20 bg-gradient-to-br from-emerald-50 via-white to-white dark:hidden" />

        {/* Dark background */}
        <div className="absolute inset-0 -z-20 hidden bg-gradient-to-br from-emerald-950 via-[#07100b] to-black dark:block" />

        {/* Light grid */}
        <div
          className="absolute inset-0 -z-10 opacity-[0.035] dark:hidden"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.6) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        {/* Dark grid */}
        <div
          className="absolute inset-0 -z-10 hidden opacity-[0.055] dark:block"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.5) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />

        {/* Glows */}

        <div className="pointer-events-none absolute -left-40 top-0 h-[500px] w-[500px] rounded-full bg-emerald-500/10 blur-[140px] dark:bg-emerald-500/20" />

        <div className="pointer-events-none absolute -right-40 bottom-[-20%] h-[500px] w-[500px] rounded-full bg-amber-400/10 blur-[140px]" />

        <div className="relative mx-auto max-w-7xl px-6 pb-12 pt-8 sm:pb-16 sm:pt-12">

          <div className="max-w-4xl">

            {/* Eyebrow */}

            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.25em] text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">

              <Newspaper className="h-3.5 w-3.5" />

              <span>
                {t("eyebrow")}
              </span>

            </div>

            {/* Title */}

            <h1 className="mt-4 text-5xl font-black tracking-[-0.06em] text-gray-950 dark:text-white sm:text-6xl lg:text-7xl">
              {t("title")}
            </h1>

            {/* Description */}

            <p className="mt-5 max-w-2xl text-sm leading-7 text-gray-600 dark:text-white/55 sm:text-base">
              {t("description")}
            </p>

          </div>

          {/* Header stats */}

          <div className="mt-10 flex flex-wrap gap-3">

            {/* Articles */}

            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white/80 px-5 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 dark:bg-emerald-400/10">
                <Newspaper className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-white/35">
                  {locale === "ar" ? "الأخبار" : "Articles"}
                </p>

                <p className="text-lg font-black text-gray-950 dark:text-white">
                  {typedNews.length}
                </p>
              </div>

            </div>

            {/* Tournament */}

            <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white/80 px-5 py-3 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none">

              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 dark:bg-amber-400/10">
                <Trophy className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500 dark:text-white/35">
                  {locale === "ar" ? "البطولة" : "Tournament"}
                </p>

                <p className="text-sm font-black text-gray-950 dark:text-white">
                  NWIS Football
                </p>
              </div>

            </div>

          </div>

        </div>

      </section>

      {/* =====================================================
          NEWS CONTENT
      ===================================================== */}

      <section className="relative overflow-hidden">

        {/* Background glows */}

        <div className="pointer-events-none absolute left-[-15%] top-[15%] h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-[140px] dark:bg-emerald-500/10" />

        <div className="pointer-events-none absolute right-[-15%] bottom-[10%] h-[500px] w-[500px] rounded-full bg-amber-400/5 blur-[140px] dark:bg-amber-400/10" />

        <div className="relative mx-auto max-w-7xl px-6 py-12 sm:py-16">

          {/* Empty state */}

          {typedNews.length === 0 ? (

            <div className="rounded-[2rem] border border-dashed border-gray-300 bg-gray-50 p-16 text-center dark:border-gray-800 dark:bg-white/[0.02]">

              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-white/[0.06]">
                <Newspaper className="h-7 w-7 text-gray-400 dark:text-gray-500" />
              </div>

              <h2 className="mt-5 text-xl font-black text-gray-950 dark:text-white">
                {t("noNews")}
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600 dark:text-gray-400">
                {t("noNewsDescription")}
              </p>

            </div>

          ) : (

            <>

              {/* =================================================
                  FEATURED ARTICLE
              ================================================= */}

              {featuredNews && (

                <Link
                  href={`/${locale}/news/${featuredNews.id}`}
                  className="group relative mb-8 block min-h-[500px] overflow-hidden rounded-[2rem] border border-gray-200 bg-black shadow-2xl dark:border-white/10"
                >

                  {/* Image */}

                  {featuredNews.image_url ? (

                    <img
                      src={featuredNews.image_url}
                      alt={
                        locale === "ar"
                          ? featuredNews.title_ar
                          : featuredNews.title
                      }
                      className="absolute inset-0 h-full w-full object-cover transition duration-1000 group-hover:scale-105"
                    />

                  ) : (

                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-[#07100c] to-black">

                      <div className="absolute inset-0 flex items-center justify-center opacity-10">
                        <Newspaper className="h-48 w-48 text-white" />
                      </div>

                    </div>

                  )}

                  {/* Overlay */}

                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-black/10" />

                  <div className="absolute inset-0 bg-gradient-to-r from-black/25 via-transparent to-transparent" />

                  {/* Featured badge */}

                  <div className="absolute left-6 top-6 sm:left-8 sm:top-8">

                    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/35 px-4 py-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/80 backdrop-blur-md">

                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />

                      {locale === "ar"
                        ? "أحدث الأخبار"
                        : "Latest News"}

                    </span>

                  </div>

                  {/* Content */}

                  <div className="absolute inset-x-0 bottom-0 p-7 sm:p-10 lg:p-12">

                    {featuredNews.published_at && (

                      <div className="mb-5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">

                        <CalendarDays className="h-3.5 w-3.5" />

                        {formatDate(featuredNews.published_at)}

                      </div>

                    )}

                    <h2 className="max-w-4xl text-3xl font-black leading-[1.05] tracking-[-0.035em] text-white sm:text-5xl lg:text-6xl">
                      {locale === "ar"
                        ? featuredNews.title_ar
                        : featuredNews.title}
                    </h2>

                    {(locale === "ar"
                      ? featuredNews.excerpt_ar ||
                        featuredNews.excerpt
                      : featuredNews.excerpt) && (

                      <p className="mt-5 max-w-2xl line-clamp-2 text-sm leading-7 text-white/55 sm:text-base">
                        {locale === "ar"
                          ? featuredNews.excerpt_ar ||
                            featuredNews.excerpt
                          : featuredNews.excerpt}
                      </p>

                    )}

                    <div className="mt-7 flex items-center gap-2 text-sm font-bold text-white">

                      <span>
                        {t("readMore")}
                      </span>

                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />

                    </div>

                  </div>

                </Link>

              )}

              {/* =================================================
                  MORE NEWS HEADER
              ================================================= */}

              {secondaryNews.length > 0 && (

                <div className="mb-7 flex items-end justify-between gap-5">

                  <div>

                    <div className="mb-3 flex items-center gap-3">

                      <span className="h-px w-8 bg-emerald-500" />

                      <span className="text-[9px] font-black uppercase tracking-[0.25em] text-emerald-600 dark:text-emerald-400">
                        {locale === "ar"
                          ? "آخر التحديثات"
                          : "More Updates"}
                      </span>

                    </div>

                    <h2 className="text-3xl font-black tracking-[-0.04em] text-gray-950 dark:text-white sm:text-4xl">
                      {locale === "ar"
                        ? "أخبار البطولة"
                        : "Tournament News"}
                    </h2>

                  </div>

                </div>

              )}

              {/* =================================================
                  ARTICLE GRID
              ================================================= */}

              {secondaryNews.length > 0 && (

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                  {secondaryNews.map((item, index) => {

                    const title =
                      locale === "ar"
                        ? item.title_ar
                        : item.title;

                    const excerpt =
                      locale === "ar"
                        ? item.excerpt_ar || item.excerpt
                        : item.excerpt;

                    return (

                      <Link
                        key={item.id}
                        href={`/${locale}/news/${item.id}`}
                        className="group relative overflow-hidden rounded-[1.5rem] border border-gray-200 bg-white shadow-sm transition-all duration-500 hover:-translate-y-1.5 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-950/10 dark:border-white/10 dark:bg-gray-900/70 dark:shadow-none dark:hover:border-emerald-400/30"
                      >

                        {/* Top accent */}

                        <div className="absolute inset-x-0 top-0 z-10 h-1 bg-gradient-to-r from-emerald-500 via-green-400 to-amber-400 opacity-60 transition-opacity group-hover:opacity-100" />

                        {/* Image */}

                        <div className="relative aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-white/[0.04]">

                          {item.image_url ? (

                            <img
                              src={item.image_url}
                              alt={title}
                              className="h-full w-full object-cover transition duration-700 group-hover:scale-110"
                            />

                          ) : (

                            <div className="flex h-full items-center justify-center bg-gradient-to-br from-emerald-950 to-black">

                              <Newspaper className="h-10 w-10 text-white/20" />

                            </div>

                          )}

                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                          {/* Number */}

                          <div className="absolute bottom-4 left-4 flex h-8 w-8 items-center justify-center rounded-lg border border-white/15 bg-black/40 text-[10px] font-black text-white backdrop-blur-md">

                            {String(index + 2).padStart(2, "0")}

                          </div>

                        </div>

                        {/* Content */}

                        <div className="p-6">

                          {item.published_at && (

                            <div className="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.18em] text-amber-600 dark:text-amber-400">

                              <CalendarDays className="h-3 w-3" />

                              {formatDate(item.published_at)}

                            </div>

                          )}

                          <h3 className="mt-3 line-clamp-2 text-xl font-black leading-snug tracking-tight text-gray-950 transition-colors group-hover:text-emerald-600 dark:text-white dark:group-hover:text-emerald-400">

                            {title}

                          </h3>

                          {excerpt && (

                            <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600 dark:text-gray-400">
                              {excerpt}
                            </p>

                          )}

                          <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-5 dark:border-white/10">

                            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                              {t("readMore")}
                            </span>

                            <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-500 transition-all duration-300 group-hover:border-emerald-500/30 group-hover:bg-emerald-500/10 group-hover:text-emerald-600 dark:border-white/10 dark:bg-gray-950/60 dark:text-gray-400 dark:group-hover:text-emerald-400">

                              <ChevronRight className="h-4 w-4 rtl:rotate-180" />

                            </span>

                          </div>

                        </div>

                      </Link>

                    );

                  })}

                </div>

              )}

            </>

          )}

        </div>

      </section>

      {/* =====================================================
          BOTTOM STRIP
      ===================================================== */}

      <section className="border-t border-gray-200 bg-gray-950 text-white dark:border-white/10">

        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">

          <div>

            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-emerald-400">
              NWIS Football
            </p>

            <p className="mt-2 text-lg font-black">
              {locale === "ar"
                ? "ابقَ على اطلاع بآخر أخبار البطولة."
                : "Stay up to date with the tournament."}
            </p>

          </div>

          <Link
            href={`/${locale}/matches`}
            className="group flex items-center gap-2 text-sm font-bold text-white/55 transition hover:text-white"
          >

            <span>
              {locale === "ar"
                ? "عرض المباريات"
                : "View matches"}
            </span>

            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1" />

          </Link>

        </div>

      </section>

    </main>
  );
}