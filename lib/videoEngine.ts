// "Movie engine": one interface over several AI media providers.
//
// - pollinations: FREE, no key. AI-generated image per scene; the player animates it.
// - veo / fal / replicate / runway: real AI video clips, PAID, used only when their
//   API key is set. Model ids are configurable through env vars.
//
// The engine tries the requested provider, or else every available provider in
// order (free first), and falls back to the next one when a provider fails.
//
// NOTE: the paid providers' REST shapes were written without access to their live
// docs (network-restricted build environment). Verify them against each provider's
// documentation before relying on them; the model env vars let you adjust ids.

export type ProviderId = "pollinations" | "veo" | "fal" | "replicate" | "runway";
export type MediaKind = "image" | "video";

export interface ProviderInfo {
  id: ProviderId;
  label: string;
  free: boolean;
  kind: MediaKind;
  available: boolean;
}

export type JobState =
  | { state: "pending" }
  | { state: "done"; mediaUrl: string; kind: MediaKind; headers?: Record<string, string> }
  | { state: "failed"; error: string };

interface Provider {
  info: Omit<ProviderInfo, "available">;
  available(): boolean;
  /** Starts a job and returns an opaque job id. */
  start(prompt: string, seconds: number): Promise<string>;
  status(job: string): Promise<JobState>;
}

const env = (k: string) => process.env[k]?.trim() || "";

async function json(res: Response): Promise<Record<string, unknown>> {
  const text = await res.text();
  let data: Record<string, unknown> = {};
  try {
    data = JSON.parse(text);
  } catch {
    /* non-JSON body */
  }
  if (!res.ok) {
    const msg =
      (data.error as { message?: string })?.message ?? (data.detail as string) ?? (data.error as string) ?? text;
    throw new Error(`HTTP ${res.status}: ${String(msg).slice(0, 300)}`);
  }
  return data;
}

/** Smallest supported duration >= wanted (or the largest one). */
function pickDuration(supported: number[], wanted: number): number {
  return supported.find((d) => d >= wanted) ?? supported[supported.length - 1];
}

// ---------------------------------------------------------------- pollinations (free)
const pollinations: Provider = {
  info: { id: "pollinations", label: "Pollinations (חינם – תמונות AI)", free: true, kind: "image" },
  available: () => env("DISABLE_POLLINATIONS") !== "1",
  async start(prompt) {
    const seed = Math.floor(Math.random() * 1_000_000);
    return Buffer.from(JSON.stringify({ prompt, seed })).toString("base64url");
  },
  async status(job) {
    const { prompt, seed } = JSON.parse(Buffer.from(job, "base64url").toString());
    const q = new URLSearchParams({ width: "1280", height: "720", nologo: "true", seed: String(seed) });
    const model = env("POLLINATIONS_MODEL");
    if (model) q.set("model", model);
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(
      `${prompt}, cinematic film still, 16:9`
    )}?${q}`;
    return { state: "done", mediaUrl: url, kind: "image" };
  },
};

// ---------------------------------------------------------------- Google Veo (Gemini API)
const GEMINI = "https://generativelanguage.googleapis.com/v1beta";
const veo: Provider = {
  info: { id: "veo", label: "Google Veo (בתשלום)", free: false, kind: "video" },
  available: () => Boolean(env("GEMINI_API_KEY")),
  async start(prompt, seconds) {
    const model = env("VEO_MODEL") || "veo-3.1-generate-preview";
    const data = await json(
      await fetch(`${GEMINI}/models/${model}:predictLongRunning`, {
        method: "POST",
        headers: { "x-goog-api-key": env("GEMINI_API_KEY"), "Content-Type": "application/json" },
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: { aspectRatio: "16:9", durationSeconds: pickDuration([4, 6, 8], seconds) },
        }),
      })
    );
    return String(data.name);
  },
  async status(job) {
    if (!/^[\w./-]+$/.test(job)) return { state: "failed", error: "bad job id" };
    const data = await json(await fetch(`${GEMINI}/${job}`, { headers: { "x-goog-api-key": env("GEMINI_API_KEY") } }));
    if (!data.done) return { state: "pending" };
    if (data.error) return { state: "failed", error: JSON.stringify(data.error).slice(0, 300) };
    const resp = data.response as { generateVideoResponse?: { generatedSamples?: { video?: { uri?: string } }[] } };
    const uri = resp?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri;
    if (!uri) return { state: "failed", error: "Veo returned no video (possibly filtered)." };
    return { state: "done", mediaUrl: uri, kind: "video", headers: { "x-goog-api-key": env("GEMINI_API_KEY") } };
  },
};

// ---------------------------------------------------------------- fal.ai (queue API)
const fal: Provider = {
  info: { id: "fal", label: "fal.ai (בתשלום)", free: false, kind: "video" },
  available: () => Boolean(env("FAL_KEY")),
  async start(prompt, seconds) {
    const model = env("FAL_VIDEO_MODEL") || "fal-ai/kling-video/v2.1/master/text-to-video";
    const data = await json(
      await fetch(`https://queue.fal.run/${model}`, {
        method: "POST",
        headers: { Authorization: `Key ${env("FAL_KEY")}`, "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, duration: String(pickDuration([5, 10], seconds)), aspect_ratio: "16:9" }),
      })
    );
    return Buffer.from(JSON.stringify({ s: data.status_url, r: data.response_url })).toString("base64url");
  },
  async status(job) {
    const { s, r } = JSON.parse(Buffer.from(job, "base64url").toString());
    if (![s, r].every((u: string) => typeof u === "string" && u.startsWith("https://queue.fal.run/")))
      return { state: "failed", error: "bad job id" };
    const headers = { Authorization: `Key ${env("FAL_KEY")}` };
    const st = await json(await fetch(s, { headers }));
    if (st.status === "IN_QUEUE" || st.status === "IN_PROGRESS") return { state: "pending" };
    if (st.status !== "COMPLETED") return { state: "failed", error: `fal status ${String(st.status)}` };
    const out = await json(await fetch(r, { headers }));
    const url = (out.video as { url?: string })?.url;
    return url ? { state: "done", mediaUrl: url, kind: "video" } : { state: "failed", error: "fal returned no video" };
  },
};

// ---------------------------------------------------------------- Replicate
const replicate: Provider = {
  info: { id: "replicate", label: "Replicate (בתשלום)", free: false, kind: "video" },
  available: () => Boolean(env("REPLICATE_API_TOKEN")),
  async start(prompt, seconds) {
    const model = env("REPLICATE_VIDEO_MODEL") || "minimax/hailuo-02";
    const data = await json(
      await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
        method: "POST",
        headers: { Authorization: `Bearer ${env("REPLICATE_API_TOKEN")}`, "Content-Type": "application/json" },
        body: JSON.stringify({ input: { prompt, duration: pickDuration([6, 10], seconds) } }),
      })
    );
    return String(data.id);
  },
  async status(job) {
    if (!/^\w+$/.test(job)) return { state: "failed", error: "bad job id" };
    const data = await json(
      await fetch(`https://api.replicate.com/v1/predictions/${job}`, {
        headers: { Authorization: `Bearer ${env("REPLICATE_API_TOKEN")}` },
      })
    );
    if (data.status === "succeeded") {
      const out = Array.isArray(data.output) ? data.output[0] : data.output;
      return typeof out === "string"
        ? { state: "done", mediaUrl: out, kind: "video" }
        : { state: "failed", error: "Replicate returned no video" };
    }
    if (data.status === "failed" || data.status === "canceled")
      return { state: "failed", error: String(data.error ?? data.status) };
    return { state: "pending" };
  },
};

// ---------------------------------------------------------------- Runway
const RUNWAY = "https://api.dev.runwayml.com/v1";
const runwayHeaders = () => ({
  Authorization: `Bearer ${env("RUNWAYML_API_SECRET")}`,
  "X-Runway-Version": env("RUNWAY_API_VERSION") || "2024-11-06",
  "Content-Type": "application/json",
});
const runway: Provider = {
  info: { id: "runway", label: "Runway (בתשלום)", free: false, kind: "video" },
  available: () => Boolean(env("RUNWAYML_API_SECRET")),
  async start(prompt, seconds) {
    const data = await json(
      await fetch(`${RUNWAY}/text_to_video`, {
        method: "POST",
        headers: runwayHeaders(),
        body: JSON.stringify({
          model: env("RUNWAY_VIDEO_MODEL") || "gen4.5",
          promptText: prompt.slice(0, 1000),
          ratio: "1280:720",
          duration: pickDuration([5, 10], seconds),
        }),
      })
    );
    return String(data.id);
  },
  async status(job) {
    if (!/^[\w-]+$/.test(job)) return { state: "failed", error: "bad job id" };
    const data = await json(await fetch(`${RUNWAY}/tasks/${job}`, { headers: runwayHeaders() }));
    if (data.status === "SUCCEEDED") {
      const out = Array.isArray(data.output) ? data.output[0] : undefined;
      return typeof out === "string"
        ? { state: "done", mediaUrl: out, kind: "video" }
        : { state: "failed", error: "Runway returned no video" };
    }
    if (data.status === "FAILED" || data.status === "CANCELLED")
      return { state: "failed", error: String(data.failure ?? data.status) };
    return { state: "pending" };
  },
};

// Order = fallback order. Free first.
const PROVIDERS: Provider[] = [pollinations, veo, fal, replicate, runway];

export function listProviders(): ProviderInfo[] {
  return PROVIDERS.map((p) => ({ ...p.info, available: p.available() }));
}

function getProvider(id: string): Provider | undefined {
  return PROVIDERS.find((p) => p.info.id === id);
}

/** Start a job on `preferred` (or any available provider), falling back on failure. */
export async function startJob(
  prompt: string,
  seconds: number,
  preferred?: string
): Promise<{ provider: ProviderId; job: string }> {
  const first = preferred ? getProvider(preferred) : undefined;
  const order = [first, ...PROVIDERS.filter((p) => p !== first)].filter(
    (p): p is Provider => Boolean(p && p.available())
  );
  if (order.length === 0) throw new Error("אין ספק מדיה זמין.");
  const errors: string[] = [];
  for (const p of order) {
    try {
      return { provider: p.info.id, job: await p.start(prompt, seconds) };
    } catch (err) {
      errors.push(`${p.info.id}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  throw new Error(errors.join(" | "));
}

export async function jobStatus(provider: string, job: string): Promise<JobState> {
  const p = getProvider(provider);
  if (!p || !p.available()) return { state: "failed", error: "unknown provider" };
  try {
    return await p.status(job);
  } catch (err) {
    return { state: "failed", error: err instanceof Error ? err.message : String(err) };
  }
}
