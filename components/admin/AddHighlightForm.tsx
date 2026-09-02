"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type MatchOption = {
  id: string;
  label: string;
};

type AddHighlightFormProps = {
  locale: string;
  matches: MatchOption[];
};

export function AddHighlightForm({
  locale,
  matches,
}: AddHighlightFormProps) {
  const router = useRouter();

  const [matchId, setMatchId] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setError("");

    if (!matchId) {
      setError("Please select a match.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a title.");
      return;
    }

    if (!videoUrl.trim()) {
      setError("Please enter a video link.");
      return;
    }

    if (!thumbnailUrl.trim()) {
      setError("Please enter a thumbnail link.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/admin/highlights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          match_id: matchId,
          title: title.trim(),
          description: description.trim() || null,
          video_url: videoUrl.trim(),
          thumbnail_url: thumbnailUrl.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Unable to create highlight.");
      }

      router.push(`/${locale}/admin/highlights`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to create highlight."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mb-8">
        <Link
          href={`/${locale}/admin/highlights`}
          className="text-sm font-medium text-gray-500 hover:underline"
        >
          ← Back to Highlights
        </Link>

        <h1 className="mt-4 text-4xl font-extrabold tracking-tight">
          Add Highlight
        </h1>

        <p className="mt-2 text-gray-500 dark:text-gray-400">
          Add a video highlight for a finished match.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-950"
      >
        {/* Match */}
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Match
          </label>

          <select
            value={matchId}
            onChange={(e) => setMatchId(e.target.value)}
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-900"
          >
            <option value="">Select a match</option>

            {matches.map((match) => (
              <option key={match.id} value={match.id}>
                {match.label}
              </option>
            ))}
          </select>
        </div>

        {/* Title */}
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Title
          </label>

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="5A vs 5B — Match Highlights"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-900"
          />
        </div>

        {/* Description */}
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Description
          </label>

          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Watch the highlights from this match..."
            rows={5}
            className="w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-900"
          />
        </div>

        {/* Video URL */}
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Video Link
          </label>

          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="YouTube or Google Drive link"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-900"
          />

          <p className="mt-2 text-xs text-gray-500">
            You can use a YouTube or Google Drive video link.
          </p>
        </div>

        {/* Thumbnail URL */}
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Thumbnail Link
          </label>

          <input
            type="url"
            value={thumbnailUrl}
            onChange={(e) => setThumbnailUrl(e.target.value)}
            placeholder="https://example.com/thumbnail.jpg"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 outline-none focus:border-gray-500 dark:border-gray-700 dark:bg-gray-900"
          />

          <p className="mt-2 text-xs text-gray-500">
            Enter a direct link to the thumbnail image.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-3">
          <Link
            href={`/${locale}/admin/highlights`}
            className="flex-1 rounded-xl border border-gray-300 px-5 py-3 text-center font-semibold hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-900"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={loading}
            className="flex-1 rounded-xl bg-gray-950 px-5 py-3 font-semibold text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-white dark:text-gray-950"
          >
            {loading ? "Saving..." : "Save Highlight"}
          </button>
        </div>
      </form>
    </>
  );
}