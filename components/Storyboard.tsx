"use client";

import { Movie, Scene } from "@/lib/types";
import SceneCard from "./SceneCard";

interface StoryboardProps {
  movie: Movie;
  source: "claude" | "offline";
  onChange: (movie: Movie) => void;
  onConfirm: () => void;
  onStartOver: () => void;
}

export default function Storyboard({ movie, source, onChange, onConfirm, onStartOver }: StoryboardProps) {
  function updateScene(index: number, scene: Scene) {
    const scenes = movie.scenes.slice();
    scenes[index] = scene;
    onChange({ ...movie, scenes });
  }

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold text-white">{movie.title}</h2>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              source === "claude" ? "bg-violet-600/20 text-violet-300" : "bg-zinc-700/50 text-zinc-300"
            }`}
          >
            {source === "claude" ? "נוצר עם Claude" : "מצב לא מקוון"}
          </span>
        </div>
        <p className="text-sm text-zinc-400">{movie.logline}</p>
        {source === "offline" && (
          <p className="text-xs text-amber-400">
            לא הוגדר מפתח ANTHROPIC_API_KEY בשרת, לכן התסריט נוצר במחולל המובנה (לא מקוון). ניתן לערוך אותו ידנית
            למטה, או להוסיף מפתח API כדי לקבל תסריטים חכמים יותר.
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {movie.scenes.map((scene, i) => (
          <SceneCard key={scene.id} scene={scene} index={i} onChange={(s) => updateScene(i, s)} />
        ))}
      </div>

      <div className="flex flex-wrap gap-3 border-t border-zinc-800 pt-5">
        <button
          onClick={onConfirm}
          className="rounded-full bg-violet-600 px-6 py-3 font-semibold text-white transition hover:bg-violet-500"
        >
          צור את הסרט 🎬
        </button>
        <button
          onClick={onStartOver}
          className="rounded-full border border-zinc-600 px-5 py-3 text-zinc-200 transition hover:bg-zinc-800"
        >
          התחל מחדש
        </button>
      </div>
    </div>
  );
}
