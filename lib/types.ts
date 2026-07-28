export type Genre =
  | "sci-fi"
  | "fantasy"
  | "horror"
  | "drama"
  | "comedy"
  | "action"
  | "romance"
  | "mystery"
  | "documentary";

export type Mood =
  | "tense"
  | "joyful"
  | "mysterious"
  | "epic"
  | "sad"
  | "romantic"
  | "comedic";

export interface Scene {
  id: string;
  heading: string;
  narration: string;
  caption: string;
  visualPrompt: string;
  mood: Mood;
  duration: number;
}

export interface Movie {
  title: string;
  genre: Genre;
  logline: string;
  scenes: Scene[];
}

export interface MovieRequest {
  title: string;
  genre: Genre;
  plotIdea: string;
  mood: Mood;
  numScenes: number;
}

export const GENRE_LABELS: Record<Genre, string> = {
  "sci-fi": "מדע בדיוני",
  fantasy: "פנטזיה",
  horror: "אימה",
  drama: "דרמה",
  comedy: "קומדיה",
  action: "אקשן והרפתקאות",
  romance: "רומנטיקה",
  mystery: "מסתורין ומתח",
  documentary: "תיעודי",
};

export const MOOD_LABELS: Record<Mood, string> = {
  tense: "מתח",
  joyful: "שמחה",
  mysterious: "מסתורין",
  epic: "אפי",
  sad: "עצוב",
  romantic: "רומנטי",
  comedic: "קומי",
};
