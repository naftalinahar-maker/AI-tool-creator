import { NextRequest, NextResponse } from "next/server";
import { generateScriptOffline } from "@/lib/scriptGenerator";
import { generateScriptWithClaude, isAnthropicConfigured } from "@/lib/anthropicScript";
import { Genre, Mood, MovieRequest } from "@/lib/types";

const GENRES: Genre[] = [
  "sci-fi",
  "fantasy",
  "horror",
  "drama",
  "comedy",
  "action",
  "romance",
  "mystery",
  "documentary",
];

const MOODS: Mood[] = ["tense", "joyful", "mysterious", "epic", "sad", "romantic", "comedic"];

function parseRequest(body: unknown): MovieRequest | null {
  if (typeof body !== "object" || body === null) return null;
  const b = body as Record<string, unknown>;

  const title = typeof b.title === "string" ? b.title.slice(0, 80).trim() : "";
  const plotIdea = typeof b.plotIdea === "string" ? b.plotIdea.slice(0, 600).trim() : "";
  const genre = GENRES.includes(b.genre as Genre) ? (b.genre as Genre) : "drama";
  const mood = MOODS.includes(b.mood as Mood) ? (b.mood as Mood) : "epic";
  const numScenes = Math.max(3, Math.min(8, Number(b.numScenes) || 5));

  if (!plotIdea) return null;

  return { title: title || "סרט ללא שם", plotIdea, genre, mood, numScenes };
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "גוף הבקשה אינו JSON תקין." }, { status: 400 });
  }

  const movieRequest = parseRequest(body);
  if (!movieRequest) {
    return NextResponse.json({ error: "יש לתאר את רעיון העלילה כדי ליצור תסריט." }, { status: 400 });
  }

  if (isAnthropicConfigured()) {
    try {
      const movie = await generateScriptWithClaude(movieRequest);
      return NextResponse.json({ movie, source: "claude" });
    } catch (err) {
      console.error("Claude script generation failed, falling back to offline generator:", err);
    }
  }

  const movie = generateScriptOffline(movieRequest);
  return NextResponse.json({ movie, source: "offline" });
}
