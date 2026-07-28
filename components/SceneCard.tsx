"use client";

import { MOOD_LABELS, Mood, Scene } from "@/lib/types";

const MOODS = Object.keys(MOOD_LABELS) as Mood[];

interface SceneCardProps {
  scene: Scene;
  index: number;
  onChange: (scene: Scene) => void;
}

export default function SceneCard({ scene, index, onChange }: SceneCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4" dir="rtl">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-violet-400">סצנה {index + 1}</span>
        <select
          value={scene.mood}
          onChange={(e) => onChange({ ...scene, mood: e.target.value as Mood })}
          className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-200"
        >
          {MOODS.map((m) => (
            <option key={m} value={m}>
              {MOOD_LABELS[m]}
            </option>
          ))}
        </select>
      </div>

      <input
        value={scene.heading}
        onChange={(e) => onChange({ ...scene, heading: e.target.value })}
        className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 focus:border-violet-500 focus:outline-none"
        placeholder="כותרת הסצנה"
      />

      <textarea
        value={scene.narration}
        onChange={(e) => onChange({ ...scene, narration: e.target.value })}
        rows={2}
        className="resize-none rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 focus:border-violet-500 focus:outline-none"
        placeholder="קריינות"
      />

      <input
        value={scene.caption}
        onChange={(e) => onChange({ ...scene, caption: e.target.value })}
        className="rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 focus:border-violet-500 focus:outline-none"
        placeholder="כיתוב על המסך"
      />

      <div className="flex items-center gap-2">
        <label className="text-xs text-zinc-400">משך (שניות)</label>
        <input
          type="number"
          min={4}
          max={20}
          value={scene.duration}
          onChange={(e) => onChange({ ...scene, duration: Number(e.target.value) })}
          className="w-20 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-200 focus:border-violet-500 focus:outline-none"
        />
      </div>
    </div>
  );
}
