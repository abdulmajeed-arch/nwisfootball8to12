"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AddNewsFormProps = {
  locale: string;
};

export function AddNewsForm({ locale }: AddNewsFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [titleAr, setTitleAr] = useState("");

  const [excerpt, setExcerpt] = useState("");
  const [excerptAr, setExcerptAr] = useState("");

  const [content, setContent] = useState("");
  const [contentAr, setContentAr] = useState("");

  const [imageUrl, setImageUrl] = useState("");
  const [published, setPublished] = useState(true);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    if (!title.trim()) {
      setError("Please enter an English title.");
      return;
    }

    if (!titleAr.trim()) {
      setError("Please enter an Arabic title.");
      return;
    }

    if (!content.trim()) {
      setError("Please enter the English content.");
      return;
    }

    if (!contentAr.trim()) {
      setError("Please enter the Arabic content.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/admin/news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          title_ar: titleAr.trim(),
          excerpt: excerpt.trim() || null,
          excerpt_ar: excerptAr.trim() || null,
          content: content.trim(),
          content_ar: contentAr.trim(),
          image_url: imageUrl.trim() || null,
          published,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create news.");
      }

      router.push(`/${locale}/admin/news`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create news."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950"
    >
      {/* English */}
      <section>
        <h2 className="text-xl font-bold">English</h2>

        <div className="mt-5 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold">
              Title
            </label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tournament begins next week"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Excerpt
            </label>

            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="A short summary of the news..."
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              Content
            </label>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write the full news article..."
              rows={10}
              className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
        </div>
      </section>

      {/* Arabic */}
      <section className="border-t border-gray-200 pt-8 dark:border-gray-800">
        <h2 className="text-xl font-bold">العربية</h2>

        <div className="mt-5 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-semibold">
              العنوان
            </label>

            <input
              type="text"
              dir="rtl"
              value={titleAr}
              onChange={(e) => setTitleAr(e.target.value)}
              placeholder="تبدأ البطولة الأسبوع القادم"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-right outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              الملخص
            </label>

            <textarea
              dir="rtl"
              value={excerptAr}
              onChange={(e) => setExcerptAr(e.target.value)}
              placeholder="ملخص قصير للخبر..."
              rows={3}
              className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-right outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-900"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold">
              المحتوى
            </label>

            <textarea
              dir="rtl"
              value={contentAr}
              onChange={(e) => setContentAr(e.target.value)}
              placeholder="اكتب محتوى الخبر الكامل..."
              rows={10}
              className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-right outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-900"
            />
          </div>
        </div>
      </section>

      {/* Image */}
      <section className="border-t border-gray-200 pt-8 dark:border-gray-800">
        <label className="mb-2 block text-sm font-semibold">
          Image Link
        </label>

        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/news-image.jpg"
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-900"
        />

        <p className="mt-2 text-xs text-gray-500">
          Optional. Enter a direct link to the news image.
        </p>
      </section>

      {/* Published */}
      <section className="border-t border-gray-200 pt-8 dark:border-gray-800">
        <label className="flex cursor-pointer items-center gap-3">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-4 w-4"
          />

          <span className="text-sm font-semibold">
            Publish this news article
          </span>
        </label>

        <p className="mt-2 text-xs text-gray-500">
          Uncheck this to save the article as a draft.
        </p>
      </section>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
        <Link
          href={`/${locale}/admin/news`}
          className="flex-1 rounded-xl border border-gray-300 px-5 py-3 text-center font-semibold hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
        >
          Cancel
        </Link>

        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-950"
        >
          {loading ? "Saving..." : "Save News"}
        </button>
      </div>
    </form>
  );
}