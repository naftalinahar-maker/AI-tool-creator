"use client";

// Browser-side AI helpers with free-first fallback chains:
//   ideas / screenplay: server Claude (if the server has a key)
//                       -> Claude on the viewer's own account (claude.ai artifact, free for the viewer)
//                       -> built-in offline generator
//   scene media:        server media engine (free Pollinations images first, paid video if keys exist)
import { Genre, Mood, Movie, MovieIdea, MovieRequest } from "./types";
import {
  IDEA_SCHEMA,
  SCREENPLAY_SCHEMA,
  ideaPrompt,
  normalizeIdea,
  normalizeScreenplay,
  screenplayPrompt,
  withJsonInstruction,
} from "./prompts";
import { generateIdeaOffline } from "./ideaGenerator";
import { generateScriptOffline } from "./scriptGenerator";

export type TextSource = "claude" | "offline";

interface SampleFn {
  json<T = unknown>(input: string, options?: { modelTier?: "quick" | "default" | "complex" }): Promise<T>;
}
interface ClaudeHost {
  use(name: string): Promise<unknown>;
}

let samplePromise: Promise<SampleFn | null> | null = null;

/** Claude via the claude.ai artifact runtime, or null outside claude.ai. */
export function getSample(): Promise<SampleFn | null> {
  if (typeof window === "undefined") return Promise.resolve(null);
  if (!samplePromise) {
    const host = (window as unknown as { claude?: ClaudeHost }).claude;
    samplePromise = host?.use
      ? host
          .use("sample")
          .then((s) => (s as SampleFn | null) ?? null)
          .catch(() => null)
      : Promise.resolve(null);
  }
  return samplePromise;
}

async function postJson(url: string, body: unknown): Promise<Record<string, unknown> | null> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!(res.headers.get("content-type") ?? "").includes("application/json")) return null;
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
    return data;
  } catch (err) {
    if (err instanceof TypeError) return null; // no server (static deployment)
    throw err;
  }
}

export async function generateIdea(hint?: { genre?: Genre; mood?: Mood }): Promise<{ idea: MovieIdea; source: TextSource }> {
  const server = await postJson("/api/generate-idea", hint ?? {}).catch(() => null);
  if (server?.source === "claude" && server.idea) return { idea: server.idea as MovieIdea, source: "claude" };

  const sample = await getSample();
  if (sample) {
    try {
      const raw = await sample.json(withJsonInstruction(ideaPrompt(hint), IDEA_SCHEMA), { modelTier: "quick" });
      return { idea: normalizeIdea(raw, hint), source: "claude" };
    } catch {
      /* declined / unavailable: fall through to offline */
    }
  }
  return { idea: generateIdeaOffline(hint), source: "offline" };
}

export async function generateScreenplay(req: MovieRequest): Promise<{ movie: Movie; source: TextSource }> {
  const server = await postJson("/api/generate-script", req);
  if (server?.source === "claude" && server.movie) return { movie: server.movie as Movie, source: "claude" };

  const sample = await getSample();
  if (sample) {
    try {
      const raw = await sample.json(withJsonInstruction(screenplayPrompt(req), SCREENPLAY_SCHEMA));
      return { movie: normalizeScreenplay(raw, req), source: "claude" };
    } catch {
      /* fall through */
    }
  }
  return { movie: (server?.movie as Movie) ?? generateScriptOffline(req), source: "offline" };
}

export interface MediaProvider {
  id: string;
  label: string;
  free: boolean;
  kind: "image" | "video";
  available: boolean;
}

/** Media providers the server offers, or [] when there is no server (e.g. claude.ai link). */
export async function listMediaProviders(): Promise<MediaProvider[]> {
  try {
    const res = await fetch("/api/media/providers");
    if (!(res.headers.get("content-type") ?? "").includes("application/json")) return [];
    const data = await res.json();
    return (data.providers as MediaProvider[]).filter((p) => p.available);
  } catch {
    return [];
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Generate one scene's AI media and return it as a local object URL. */
export async function generateSceneMedia(
  prompt: string,
  seconds: number,
  provider: string | undefined,
  signal?: AbortSignal
): Promise<{ url: string; kind: "image" | "video"; provider: string }> {
  const started = await postJson("/api/media/start", { prompt, seconds, provider });
  if (!started) throw new Error("אין שרת מדיה זמין בגרסה הזו.");
  const p = String(started.provider);
  const q = new URLSearchParams({ provider: p, job: String(started.job) });

  const deadline = Date.now() + 10 * 60_000;
  let kind: "image" | "video" = "image";
  for (;;) {
    if (signal?.aborted) throw new Error("בוטל.");
    const res = await fetch(`/api/media/status?${q}`, { signal });
    const st = await res.json();
    if (st.state === "done") {
      kind = st.kind;
      break;
    }
    if (st.state === "failed") throw new Error(st.error || "היצירה נכשלה.");
    if (Date.now() > deadline) throw new Error("היצירה לקחה יותר מדי זמן.");
    await sleep(5000);
  }

  const file = await fetch(`/api/media/file?${q}`, { signal });
  if (!file.ok) {
    const err = await file.json().catch(() => null);
    throw new Error(err?.error || `הורדת המדיה נכשלה (${file.status}).`);
  }
  return { url: URL.createObjectURL(await file.blob()), kind, provider: p };
}
