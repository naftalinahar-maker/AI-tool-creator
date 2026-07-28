import Anthropic from "@anthropic-ai/sdk";
import { Movie, MovieRequest, Scene } from "./types";

const SCREENPLAY_TOOL = {
  name: "submit_screenplay",
  description: "Submit the generated short-film screenplay broken into scenes.",
  input_schema: {
    type: "object" as const,
    properties: {
      title: { type: "string" as const },
      logline: { type: "string" as const, description: "One sentence summary, in Hebrew." },
      scenes: {
        type: "array" as const,
        items: {
          type: "object" as const,
          properties: {
            heading: { type: "string" as const, description: "Short scene slug line, in Hebrew." },
            narration: { type: "string" as const, description: "2-3 sentence narrator voice-over, in Hebrew." },
            caption: { type: "string" as const, description: "Very short on-screen caption (2-5 words), in Hebrew." },
            visualPrompt: {
              type: "string" as const,
              description: "English visual description for an image generator depicting this scene.",
            },
            mood: {
              type: "string" as const,
              enum: ["tense", "joyful", "mysterious", "epic", "sad", "romantic", "comedic"],
            },
            duration: { type: "number" as const, description: "Seconds this scene should stay on screen, 6-14." },
          },
          required: ["heading", "narration", "caption", "visualPrompt", "mood", "duration"],
        },
      },
    },
    required: ["title", "logline", "scenes"],
  },
};

export function isAnthropicConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

export async function generateScriptWithClaude(req: MovieRequest): Promise<Movie> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: "claude-sonnet-5",
    max_tokens: 4096,
    tools: [SCREENPLAY_TOOL],
    tool_choice: { type: "tool", name: "submit_screenplay" },
    messages: [
      {
        role: "user",
        content:
          `כתוב תסריט קצר לסרט בעברית עם בדיוק ${req.numScenes} סצנות, על בסיס הפרטים הבאים:\n` +
          `כותרת: ${req.title}\n` +
          `ז'אנר: ${req.genre}\n` +
          `רעיון עלילה: ${req.plotIdea}\n` +
          `אווירה כללית: ${req.mood}\n\n` +
          `לכל סצנה כתוב כותרת קצרה (heading), קריינות בעברית (narration, 2-3 משפטים), ` +
          `כיתוב קצר על המסך (caption, 2-5 מילים בעברית), תיאור חזותי מפורט באנגלית עבור מחולל תמונות (visualPrompt), ` +
          `מצב רוח מהרשימה הנתונה (mood), ואורך בשניות (duration, בין 6 ל-14). ` +
          `שמור על רצף עלילתי הגיוני עם פתיחה, התפתחות, שיא וסיום.`,
      },
    ],
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    throw new Error("Claude did not return a structured screenplay.");
  }

  const data = toolUse.input as {
    title: string;
    logline: string;
    scenes: Array<{
      heading: string;
      narration: string;
      caption: string;
      visualPrompt: string;
      mood: Scene["mood"];
      duration: number;
    }>;
  };

  const scenes: Scene[] = data.scenes.map((s, i) => ({
    id: `scene-${i + 1}`,
    heading: s.heading,
    narration: s.narration,
    caption: s.caption,
    visualPrompt: s.visualPrompt,
    mood: s.mood,
    duration: Math.max(6, Math.min(14, Math.round(s.duration))),
  }));

  return {
    title: data.title || req.title,
    genre: req.genre,
    logline: data.logline,
    scenes,
  };
}
