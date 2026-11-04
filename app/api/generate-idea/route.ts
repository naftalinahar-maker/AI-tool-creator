import { generateIdeaWithClaude, isAnthropicConfigured } from "@/lib/anthropicScript";
import { GENRES, Genre, MOODS, Mood } from "@/lib/types";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const genre = GENRES.includes(body.genre as Genre) ? (body.genre as Genre) : undefined;
  const mood = MOODS.includes(body.mood as Mood) ? (body.mood as Mood) : undefined;
  if (!isAnthropicConfigured()) {
    return Response.json({ source: "unavailable" });
  }
  try {
    return Response.json({ idea: await generateIdeaWithClaude({ genre, mood }), source: "claude" });
  } catch (err) {
    console.error("Claude idea generation failed:", err);
    return Response.json({ source: "unavailable" });
  }
}
