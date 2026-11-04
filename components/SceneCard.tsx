"use client";

import { MAX_CLIP_SECONDS, MIN_CLIP_SECONDS, MOOD_LABELS, Mood, Scene, clampClipSeconds } from "@/lib/types";

const MOODS = Object.keys(MOOD_LABELS) as Mood[];

interface SceneCardProps {
  scene: Scene;
  index: number;
  onPatch: (patch: Partial<Scene>) => void;
  /** Undefined when no media engine is available. */
  onGenerate?: () => void;
}

const field =
  "rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 focus:border-violet-500 focus:outline-none";

export default function SceneCard({ scene, index, onPatch, onGenerate }: SceneCardProps) {
  const generating = scene.clipStatus === "generating";

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4" dir="rtl">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-violet-400">סצנה {index + 1}</span>
        <select
          value={scene.mood}
          onChange={(e) => onPatch({ mood: e.target.value as Mood })}
          className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-200"
        >
          {MOODS.map((m) => (
            <option key={m} value={m}>
              {MOOD_LABELS[m]}
            </option>
          ))}
        </select>
      </div>

      <div className="relative aspect-video overflow-hidden rounded-lg bg-zinc-950">
        {scene.mediaUrl && scene.mediaKind === "video" && (
          <video src={scene.mediaUrl} muted loop autoPlay playsInline className="h-full w-full object-cover" />
        )}
        {scene.mediaUrl && scene.mediaKind === "image" && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={scene.mediaUrl} alt={scene.heading} className="h-full w-full object-cover" />
        )}
        {!scene.mediaUrl && (
          <div className="flex h-full items-center justify-center p-3 text-center text-xs text-zinc-500">
            {generating ? "יוצר בבינה מלאכותית..." : "עדיין אין ויזואל AI – תוצג אנימציה מובנית"}
          </div>
        )}
        {generating && scene.mediaUrl && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-white">
            יוצר מחדש...
          </div>
        )}
      </div>

      {scene.clipStatus === "error" && <p className="text-xs text-red-400">{scene.clipError}</p>}

      <input
        value={scene.heading}
        onChange={(e) => onPatch({ heading: e.target.value })}
        className={field}
        placeholder="כותרת הסצנה"
      />

      <textarea
        value={scene.narration}
        onChange={(e) => onPatch({ narration: e.target.value })}
        rows={2}
        className={`resize-none ${field}`}
        placeholder="קריינות"
      />

      <input
        value={scene.caption}
        onChange={(e) => onPatch({ caption: e.target.value })}
        className={field}
        placeholder="כיתוב על המסך"
      />

      <textarea
        value={scene.visualPrompt}
        onChange={(e) => onPatch({ visualPrompt: e.target.value })}
        rows={2}
        dir="ltr"
        className={`resize-none text-left ${field}`}
        placeholder="Visual prompt for the AI (English)"
      />

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-xs text-zinc-400">אורך (שניות)</label>
        <input
          type="number"
          min={MIN_CLIP_SECONDS}
          max={MAX_CLIP_SECONDS}
          value={Number.isFinite(scene.duration) ? scene.duration : ""}
          onChange={(e) => onPatch({ duration: Number(e.target.value) })}
          onBlur={() => onPatch({ duration: clampClipSeconds(scene.duration) })}
          className="w-16 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-200 focus:border-violet-500 focus:outline-none"
        />
        {onGenerate && (
          <button
            onClick={onGenerate}
            disabled={generating}
            className="ms-auto rounded-full border border-emerald-600/70 px-3 py-1 text-xs font-medium text-emerald-300 transition hover:bg-emerald-600/20 disabled:opacity-50"
          >
            {generating ? "יוצר..." : scene.mediaUrl ? "🔄 צור מחדש" : "🎥 צור ויזואל AI"}
          </button>
        )}
      </div>
    </div>
  );
}
