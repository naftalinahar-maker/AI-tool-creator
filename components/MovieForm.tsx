"use client";

import { useState } from "react";
import { GENRE_LABELS, Movie, MOOD_LABELS, Genre, Mood } from "@/lib/types";
import { generateIdea, generateScreenplay } from "@/lib/aiClient";

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
  const [ideaLoading, setIdeaLoading] = useState(false);
  const [ideaNote, setIdeaNote] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleIdea() {
    setIdeaLoading(true);
    setError(null);
    setIdeaNote(null);
    try {
      const { idea, source } = await generateIdea({ genre, mood });
      setTitle(idea.title);
      setGenre(idea.genre);
      setMood(idea.mood);
      setPlotIdea(idea.plotIdea);
      setIdeaNote(source === "claude" ? "✨ רעיון שנוצר עם Claude" : "💡 רעיון מהמחולל המובנה (Claude לא זמין כאן)");
    } catch (err) {
      setError(err instanceof Error ? err.message : "יצירת הרעיון נכשלה.");
    } finally {
      setIdeaLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!plotIdea.trim()) {
      setError("יש לתאר את רעיון העלילה כדי ליצור תסריט.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { movie, source } = await generateScreenplay({
        title: title.trim().slice(0, 80) || "סרט ללא שם",
        genre,
        mood,
        plotIdea: plotIdea.trim().slice(0, 600),
        numScenes,
      });
      onGenerated(movie, source);
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
        <div className="flex flex-wrap items-center justify-between gap-2">
          <label className="text-sm font-medium text-zinc-300">רעיון העלילה</label>
          <button
            type="button"
            onClick={handleIdea}
            disabled={ideaLoading || loading}
            className="rounded-full border border-amber-500/60 bg-amber-500/10 px-4 py-1.5 text-sm font-medium text-amber-300 transition hover:bg-amber-500/20 disabled:opacity-50"
          >
            {ideaLoading ? "חושב על רעיון..." : "💡 תן לי רעיון בAI"}
          </button>
        </div>
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

      {ideaNote && <p className="-mt-3 text-xs text-amber-300/80">{ideaNote}</p>}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-full bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-500 disabled:opacity-50"
      >
        {loading ? "כותב תסריט... (עם Claude זה יכול לקחת עד דקה)" : "צור תסריט בעזרת AI"}
      </button>
    </form>
  );
}
