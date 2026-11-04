import { GENRES, Genre, MOODS, Mood, MovieIdea } from "./types";

// Free, offline fallback for the idea generator.
const HEROES = [
  "רובוט ניקיון בודד",
  "ילד שמדבר עם ציפורים",
  "שומר מגדלור זקן",
  "אסטרונאוט שאיבד קשר עם כדור הארץ",
  "חתול רחוב סקרן",
  "שף שמבשל זיכרונות",
  "בלש עם זיכרון צילומי",
  "מוזיקאי רחוב עיוור",
  "דייג שמוצא בקבוק זוהר",
  "נער שמגלה דלת בתוך עץ",
];
const EVENTS = [
  "מגלה מפה שמציירת את עצמה",
  "מתעורר בעיר שבה הזמן עצר",
  "שומע שיר שאף אחד אחר לא שומע",
  "מקבל מכתב מעצמו מהעתיד",
  "מוצא ביצה ענקית שבוקעת באמצע הלילה",
  "רואה את הצל שלו בורח ממנו",
  "נקלע לסערה שצובעת את העולם בצבעים חדשים",
  "מגלה שכל הכוכבים בשמיים נעלמו חוץ מאחד",
];
const GOALS = [
  "ועליו להחזיר את האור לעיר לפני הזריחה",
  "ורק הוא יכול להציל את מי שהוא אוהב",
  "ומסע מופלא מתחיל בין עולמות",
  "ומבין שהתשובה הייתה איתו כל הזמן",
  "ומגלה סוד שמשנה את כל מה שידע",
  "ונאלץ לבחור בין חלום למציאות",
];
const TITLES = ["האור האחרון", "מעבר לאופק", "השעון השבור", "שיר הלילה", "הדלת בעץ", "הכוכב היחיד", "צללים זזים", "המפה החיה"];

const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];

export function generateIdeaOffline(hint?: { genre?: Genre; mood?: Mood }): MovieIdea {
  return {
    title: pick(TITLES),
    genre: hint?.genre ?? pick(GENRES),
    mood: hint?.mood ?? pick(MOODS),
    plotIdea: `${pick(HEROES)} ${pick(EVENTS)}, ${pick(GOALS)}.`,
  };
}
