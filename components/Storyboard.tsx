"use client";

import { useEffect, useRef, useState } from "react";
import { Movie, Scene } from "@/lib/types";
import { MediaProvider, generateSceneMedia, listMediaProviders } from "@/lib/aiClient";
import SceneCard from "./SceneCard";

interface StoryboardProps {
  movie: Movie;
  source: "claude" | "offline";
  onPatchScene: (id: string, patch: Partial<Scene>) => void;
  onConfirm: () => void;
  onStartOver: () => void;
}

export default function Storyboard({ movie, source, onPatchScene, onConfirm, onStartOver }: StoryboardProps) {
  const [providers, setProviders] = useState<MediaProvider[] | null>(null);
  const [provider, setProvider] = useState<string>("");
  const controllers = useRef(new Map<string, AbortController>());

  useEffect(() => {
    let alive = true;
    listMediaProviders().then((list) => {
      if (!alive) return;
      setProviders(list);
      setProvider(list[0]?.id ?? "");
    });
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const map = controllers.current;
    return () => map.forEach((c) => c.abort());
  }, []);

  async function generateFor(scene: Scene) {
    controllers.current.get(scene.id)?.abort();
    const ctl = new AbortController();
    controllers.current.set(scene.id, ctl);
    onPatchScene(scene.id, { clipStatus: "generating", clipError: undefined });
    try {
      const prompt = `${scene.visualPrompt}. Mood: ${scene.mood}.`;
      const media = await generateSceneMedia(prompt, scene.duration, provider || undefined, ctl.signal);
      if (scene.mediaUrl) URL.revokeObjectURL(scene.mediaUrl);
      onPatchScene(scene.id, {
        clipStatus: "ready",
        mediaUrl: media.url,
        mediaKind: media.kind,
        clipProvider: media.provider,
      });
    } catch (err) {
      if (ctl.signal.aborted) return;
      onPatchScene(scene.id, { clipStatus: "error", clipError: err instanceof Error ? err.message : String(err) });
    } finally {
      if (controllers.current.get(scene.id) === ctl) controllers.current.delete(scene.id);
    }
  }

  function generateAll() {
    movie.scenes.filter((s) => s.clipStatus !== "generating").forEach((s) => void generateFor(s));
  }

  const canGenerate = Boolean(providers && providers.length > 0);
  const anyGenerating = movie.scenes.some((s) => s.clipStatus === "generating");
  const selected = providers?.find((p) => p.id === provider);

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-2xl font-bold text-white">{movie.title}</h2>
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
              source === "claude" ? "bg-violet-600/20 text-violet-300" : "bg-zinc-700/50 text-zinc-300"
            }`}
          >
            {source === "claude" ? "נכתב עם Claude" : "מחולל מובנה"}
          </span>
        </div>
        <p className="text-sm text-zinc-400">{movie.logline}</p>
        {source === "offline" && (
          <p className="text-xs text-amber-400">
            Claude לא היה זמין, לכן התסריט נוצר במחולל המובנה. אפשר לערוך אותו ידנית למטה.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium text-zinc-200">🎥 ויזואלים בבינה מלאכותית</span>
          {canGenerate && (
            <>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-sm text-zinc-200"
              >
                {providers!.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.label}
                  </option>
                ))}
              </select>
              <button
                onClick={generateAll}
                disabled={anyGenerating}
                className="rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
              >
                {anyGenerating ? "יוצר..." : "צור לכל הסצנות"}
              </button>
            </>
          )}
        </div>
        <p className="text-xs text-zinc-400">
          {providers === null
            ? "בודק אילו מנועים זמינים..."
            : !canGenerate
              ? "בגרסה הזו אין שרת מדיה, לכן הסצנות יוצגו עם אנימציה מובנית. כדי ליצור תמונות/וידאו AI הריצו את האפליקציה עם השרת שלה (חינם עם Pollinations)."
              : selected?.kind === "image"
                ? "חינם: נוצרת תמונת AI לכל סצנה והנגן מנפיש אותה לאורך הסצנה (4–10 שניות)."
                : "וידאו AI אמיתי לכל סצנה (4–10 שניות). שימו לב: הספק הזה גובה תשלום לפי שימוש, ויצירה לוקחת כמה דקות."}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {movie.scenes.map((scene, i) => (
          <SceneCard
            key={scene.id}
            scene={scene}
            index={i}
            onPatch={(patch) => onPatchScene(scene.id, patch)}
            onGenerate={canGenerate ? () => void generateFor(scene) : undefined}
          />
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
