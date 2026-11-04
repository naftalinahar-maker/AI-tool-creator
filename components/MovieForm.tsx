"use client";

import { useState } from "react";
import { GENRE_LABELS, Movie, MOOD_LABELS, Genre, Mood } from "@/lib/types";
import { generateScriptOffline } from "@/lib/scriptGenerator";

interface MovieFormProps {
  onGenerated: (movie: Movie, source: "claude" | "offline") => void;
}

const GENRES = Object.keys(GENRE_LABELS) as Genre[];
const MOODS = Object.keys(MOOD_LABELS) as Mood[];

export default function MovieForm({ onGenerated }: MovieFormProps) {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState<Genre>("sci-fi");
  const [mood, setMood] = useState<Mood>("epic");
  const [plotIdea, setPlotIdea] = useState("");
  const [numScenes, setNumScenes] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!plotIdea.trim()) {
      setError("יש לתאר את רעיון העלילה כדי ליצור תסריט.");
      return;
    }
    setLoading(true);
    setError(null);
    const movieRequest = { title, genre, mood, plotIdea, numScenes };
    try {
      let res: Response | null = null;
      try {
        res = await fetch("/api/generate-script", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(movieRequest),
        });
      } catch {
        res = null;
      }
      const data = res && (res.headers.get("content-type") ?? "").includes("application/json") ? await res.json() : null;
      if (!res || !data) {
        // No API server (e.g. a static deployment): generate the script in the browser.
        onGenerated(
          generateScriptOffline({
            ...movieRequest,
            title: title.trim().slice(0, 80) || "סרט ללא שם",
            plotIdea: plotIdea.trim().slice(0, 600),
          }),
          "offline"
        );
        return;
      }
      if (!res.ok) {
        throw new Error(data.error || "משהו השתבש ביצירת התסריט.");
      }
      onGenerated(data.movie as Movie, data.source);
    } catch (err) {
      setError(err instanceof Error ? err.message : "משהו השתבש ביצירת התסריט.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} dir="rtl" className="flex flex-col gap-5">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-300">שם הסרט</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="לדוגמה: המסע האחרון"
          maxLength={80}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">ז&apos;אנר</label>
          <select
            value={genre}
            onChange={(e) => setGenre(e.target.value as Genre)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none"
          >
            {GENRES.map((g) => (
              <option key={g} value={g}>
                {GENRE_LABELS[g]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-zinc-300">אווירה כללית</label>
          <select
            value={mood}
            onChange={(e) => setMood(e.target.value as Mood)}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white focus:border-violet-500 focus:outline-none"
          >
            {MOODS.map((m) => (
              <option key={m} value={m}>
                {MOOD_LABELS[m]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-300">רעיון העלילה</label>
        <textarea
          value={plotIdea}
          onChange={(e) => setPlotIdea(e.target.value)}
          placeholder="תארו במשפט או שניים את סיפור הסרט..."
          rows={4}
          maxLength={600}
          className="resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-violet-500 focus:outline-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-zinc-300">
          מספר סצנות: <span className="text-white">{numScenes}</span>
        </label>
        <input
          type="range"
          min={3}
          max={8}
          value={numScenes}
          onChange={(e) => setNumScenes(Number(e.target.value))}
          className="accent-violet-500"
        />
      </div>

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-full bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
      >
        {loading ? "יוצר תסריט..." : "צור תסריט בעזרת AI"}
      </button>
    </form>
  );
}
