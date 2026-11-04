import Anthropic from "@anthropic-ai/sdk";
import { Genre, Mood, Movie, MovieIdea, MovieRequest } from "./types";
import {
  IDEA_SCHEMA,
  SCREENPLAY_SCHEMA,
  ideaPrompt,
  normalizeIdea,
  normalizeScreenplay,
  screenplayPrompt,
} from "./prompts";

const MODEL = "claude-opus-5-5";

export function isAnthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

/** One structured-output call: Claude's reply is constrained to `schema`. */
async function askForJson(prompt: string, schema: object, effort: "low" | "medium"): Promise<unknown> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const message = await client.beta.messages.create({
    model: MODEL,
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    // If a safety classifier declines, the API retries on a fallback model in the same call.
    fallbacks: "default",
    output_config: {
      effort,
      format: { type: "json_schema", schema: schema as Record<string, unknown> },
    },
    messages: [{ role: "user", content: prompt }],
  });

  if (message.stop_reason === "refusal") {
    throw new Error("Claude declined this request.");
  }
  const text = message.content
    .map((block) => (block.type === "text" ? block.text : ""))
    .join("");
  return JSON.parse(text);
}

export async function generateScriptWithClaude(req: MovieRequest): Promise<Movie> {
  const data = await askForJson(screenplayPrompt(req), SCREENPLAY_SCHEMA, "medium");
  return normalizeScreenplay(data, req);
}

export async function generateIdeaWithClaude(hint?: { genre?: Genre; mood?: Mood }): Promise<MovieIdea> {
  const data = await askForJson(ideaPrompt(hint), IDEA_SCHEMA, "low");
  return normalizeIdea(data, hint);
}
