// Prompts, JSON schemas and response normalizers shared by the server-side
// Claude integration and the in-browser (claude.ai artifact) integration.
import {
  DEFAULT_CLIP_SECONDS,
  GENRE_LABELS,
  GENRES,
  Genre,
  MOOD_LABELS,
  MOODS,
  Mood,
  Movie,
  MovieIdea,
  MovieRequest,
  Scene,
} from "./types";

export const IDEA_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string", description: "Short catchy film title, in Hebrew." },
    genre: { type: "string", enum: GENRES },
    mood: { type: "string", enum: MOODS },
    plotIdea: { type: "string", description: "2-3 sentence original plot idea, in Hebrew." },
  },
  required: ["title", "genre", "mood", "plotIdea"],
  additionalProperties: false,
} as const;

export const SCREENPLAY_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    logline: { type: "string", description: "One sentence summary, in Hebrew." },
    scenes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          heading: { type: "string", description: "Short scene slug line, in Hebrew." },
          narration: { type: "string", description: "1-2 sentence narrator voice-over, in Hebrew." },
          caption: { type: "string", description: "Very short on-screen caption (2-5 words), in Hebrew." },
          visualPrompt: {
            type: "string",
            description:
              "Detailed English prompt for an AI video generator: subject, action, camera movement, lighting, style. No text in frame.",
          },
          mood: { type: "string", enum: MOODS },
        },
        required: ["heading", "narration", "caption", "visualPrompt", "mood"],
        additionalProperties: false,
      },
    },
  },
  required: ["title", "logline", "scenes"],
  additionalProperties: false,
} as const;

export function ideaPrompt(hint?: { genre?: Genre; mood?: Mood }): string {
  const parts = [
    "המצא רעיון מקורי ומפתיע לסרט קצר (סרטון AI של כמה סצנות קצרות).",
    "הרעיון צריך להיות ויזואלי מאוד, כך שאפשר להפיק ממנו קליפים קצרים בבינה מלאכותית.",
  ];
  if (hint?.genre) parts.push(`ז'אנר מועדף: ${GENRE_LABELS[hint.genre]} (${hint.genre}).`);
  if (hint?.mood) parts.push(`אווירה מועדפת: ${MOOD_LABELS[hint.mood]} (${hint.mood}).`);
  parts.push("כל הטקסטים בעברית. החזר רק את השדות המבוקשים.");
  return parts.join("\n");
}

export function screenplayPrompt(req: MovieRequest): string {
  return (
    `כתוב תסריט קצר לסרט בעברית עם בדיוק ${req.numScenes} סצנות, על בסיס הפרטים הבאים:\n` +
    `כותרת: ${req.title}\n` +
    `ז'אנר: ${req.genre}\n` +
    `רעיון עלילה: ${req.plotIdea}\n` +
    `אווירה כללית: ${req.mood}\n\n` +
    `כל סצנה תהפוך לקליפ וידאו AI של עד 10 שניות, ולכן כל סצנה היא רגע חזותי אחד וברור. ` +
    `לכל סצנה כתוב כותרת קצרה (heading), קריינות בעברית (narration, משפט או שניים שאפשר להקריא בפחות מ-10 שניות), ` +
    `כיתוב קצר על המסך (caption, 2-5 מילים בעברית), ` +
    `פרומפט וידאו מפורט באנגלית (visualPrompt: מה רואים, מה זז, תנועת מצלמה, תאורה וסגנון, בלי טקסט בפריים), ` +
    `ומצב רוח מהרשימה הנתונה (mood). שמור על רצף עלילתי הגיוני עם פתיחה, התפתחות, שיא וסיום, ` +
    `ועל דמויות ומראה עקביים בין הסצנות.`
  );
}

/** Append the JSON-format instruction used where no structured-output API exists. */
export function withJsonInstruction(prompt: string, schema: object): string {
  return `${prompt}\n\nהחזר אך ורק אובייקט JSON תקין (בלי טקסט נוסף ובלי \`\`\`) לפי הסכמה הזו:\n${JSON.stringify(schema)}`;
}

function str(v: unknown, max: number): string {
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function normalizeIdea(raw: unknown, fallback?: Partial<MovieIdea>): MovieIdea {
  const d = (raw ?? {}) as Record<string, unknown>;
  const plotIdea = str(d.plotIdea, 600);
  if (!plotIdea) throw new Error("לא התקבל רעיון תקין.");
  return {
    title: str(d.title, 80) || fallback?.title || "סרט ללא שם",
    genre: GENRES.includes(d.genre as Genre) ? (d.genre as Genre) : fallback?.genre ?? "drama",
    mood: MOODS.includes(d.mood as Mood) ? (d.mood as Mood) : fallback?.mood ?? "epic",
    plotIdea,
  };
}

export function normalizeScreenplay(raw: unknown, req: MovieRequest): Movie {
  const d = (raw ?? {}) as Record<string, unknown>;
  const rawScenes = Array.isArray(d.scenes) ? (d.scenes as Record<string, unknown>[]) : [];
  if (rawScenes.length === 0) throw new Error("לא התקבל תסריט תקין.");
  const scenes: Scene[] = rawScenes.slice(0, 8).map((s, i) => ({
    id: `scene-${i + 1}-${Math.random().toString(36).slice(2, 7)}`,
    heading: str(s.heading, 120) || `סצנה ${i + 1}`,
    narration: str(s.narration, 400),
    caption: str(s.caption, 60),
    visualPrompt: str(s.visualPrompt, 1500) || str(s.heading, 120),
    mood: MOODS.includes(s.mood as Mood) ? (s.mood as Mood) : req.mood,
    duration: DEFAULT_CLIP_SECONDS,
  }));
  return {
    title: str(d.title, 80) || req.title,
    genre: req.genre,
    logline: str(d.logline, 300),
    scenes,
  };
}
