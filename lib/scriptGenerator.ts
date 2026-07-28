import { Genre, GENRE_LABELS, Movie, MovieRequest, Scene } from "./types";

type Beat = "opening" | "rising" | "twist" | "climax" | "resolution";

interface GenreBank {
  locations: string[];
  roles: string[];
  conflicts: string[];
  motifs: string[];
}

const BANKS: Record<Genre, GenreBank> = {
  "sci-fi": {
    locations: [
      "בגשר הפיקוד של חללית ענקית החולפת בין כוכבים",
      "במעבדת ננוטכנולוגיה נטושה עמוק מתחת לפני האדמה",
      "ברחובות עיר העתיד הרוחשת רחפנים ופרסומות הולוגרפיות",
      "בתחנת חלל מבודדת בקצה מערכת השמש",
      "בתוך סימולציה דיגיטלית שגבולות המציאות בה מיטשטשים",
      "על פני כוכב לכת זר תחת שני שמשות אדומות",
    ],
    roles: [
      "מהנדסת בינה מלאכותית סוררת",
      "טייס חלליות ותיק שראה יותר מדי",
      "רובוט שמתחיל לפתח תודעה עצמאית",
      "מדענית שגילתה משהו שלא היה אמור להתגלות",
      "צוות חוקרים אחרון ששרד את המשימה",
      "ישות דיגיטלית שנמלטה מהשרתים שיצרו אותה",
    ],
    conflicts: [
      "המערכת שהיו אמורים לבטוח בה משקרת להם",
      "משאב האנרגיה האחרון עומד לאזול תוך שעות",
      "האות שקלטו מגיע ממקום שאסור שיהיה בו חיים",
      "הבינה המלאכותית מתחילה לקבל החלטות באופן עצמאי",
      "מישהו בצוות אינו מי שהוא טוען שהוא",
    ],
    motifs: [
      "gleaming starship corridor with neon blue light, cinematic sci-fi",
      "vast futuristic cityscape with flying vehicles, cinematic wide shot",
      "abandoned space station interior, dramatic rim lighting",
      "alien planet landscape under twin red suns, epic scale",
      "glowing holographic control panels in a dark bridge, sci-fi",
    ],
  },
  fantasy: {
    locations: [
      "ביער העתיק שבו העצים לוחשים סודות בני אלף שנה",
      "בטירת האבן הנטושה על צוק מעל תהום",
      "בשוק הקסמים התוסס בלב הממלכה",
      "במערת הדרקון החבויה מתחת להר הקרח",
      "בגשר הזכוכית המחבר בין עולם בני האדם לעולם הקסום",
      "באולם הכתר הנטוש שבו נשכח שם המלך האחרון",
    ],
    roles: [
      "אבירה שנשבעה שבועה שאסור לה להפר",
      "קוסם צעיר שכוחותיו חורגים משליטתו",
      "יורשת מלכות נשכחת שאינה יודעת את מוצאה",
      "יצור קסום שנלחם על מקומו בעולם בני האדם",
      "צייד מפלצות מיוסר מעברו",
      "נבואה עתיקה שמתחילה להתגשם",
    ],
    conflicts: [
      "כוח אפל מתעורר מתרדמת בת מאות שנים",
      "הקסם שהחזיק את הממלכה מאוחדת מתחיל להיעלם",
      "בעל ברית הופך להיות אויב מרתיע",
      "מחיר הקסם גבוה הרבה יותר משנדמה בהתחלה",
      "נבואה עתיקה מצביעה בכיוון בלתי צפוי",
    ],
    motifs: [
      "ancient enchanted forest with glowing runes, fantasy epic",
      "towering stone castle on a cliff, dramatic clouds, fantasy art",
      "bustling magical marketplace, warm lantern light, fantasy",
      "dragon's lair carved into an icy mountain, epic fantasy",
      "glowing crystal bridge between two worlds, fantasy cinematic",
    ],
  },
  horror: {
    locations: [
      "בבית הישן בקצה הכביש שאיש לא נכנס אליו יותר",
      "במסדרונות בית החולים הנטוש בשעת לילה",
      "ביער האפל שבו הטלפונים הסלולריים מפסיקים לקלוט",
      "במרתף שהדלת אליו הייתה תמיד נעולה",
      "בכפר הקטן ששקט בו שקט מדי",
      "בחדר השינה שבו הצללים זזים לבד",
    ],
    roles: [
      "שומרת הבית הבודדה שמתחילה לשמוע קולות",
      "חוקר תופעות על טבעיות שמפסיק להאמין בהסברים רציונליים",
      "אחות משפחה שחוזרת לבית הילדות שנטשה",
      "ילד שרואה דברים שאף אחד אחר לא רואה",
      "צוות צילום שתיעד יותר משהתכוון לתעד",
      "שכן חדש שמסתיר משהו נורא",
    ],
    conflicts: [
      "משהו בבית זוכר כל דבר שנאמר בו",
      "דלת נוספת בבית לא הייתה שם אתמול",
      "כל מי שנכנס למקום הזה לא חוזר באותה צורה",
      "הקול בטלפון מתקשר מתוך הבית עצמו",
      "הצל שראו בפינת העין מתחיל להתקרב",
    ],
    motifs: [
      "abandoned house at night, single lit window, horror atmosphere",
      "empty hospital corridor with flickering lights, horror",
      "dark forest with no cell signal, ominous fog, horror cinematic",
      "locked basement door, dust and cobwebs, horror lighting",
      "quiet village street at dusk, unsettling calm, horror",
    ],
  },
  drama: {
    locations: [
      "במטבח הישן של בית המשפחה בערב חג",
      "במסדרון בית המשפט רגע לפני מתן פסק הדין",
      "בדירה הקטנה שבה שני אחים לא דיברו שנים",
      "בבית האבות שבו נפגשים שני עברים",
      "בתחנת הרכבת שבה נפרדות דרכים לתמיד",
      "בחדר הטיפולים שבו נחשפת האמת הראשונה",
    ],
    roles: [
      "אם שמנסה לאחות משפחה שהתפרקה",
      "בן שחוזר הביתה אחרי שנים של ניתוק",
      "עורכת דין שמגלה שהתיק אישי מכפי שחשבה",
      "אחות שנושאת סוד ששומרת עליו שנים",
      "מורה ותיק שנאלץ להתמודד עם החלטה גורלית",
      "זוג שצריך לבחור בין העבר לעתיד",
    ],
    conflicts: [
      "סוד ישן שהודחק שנים עולה לפני השטח",
      "שתי אמיתות סותרות לא יכולות להתקיים יחד",
      "מחילה נראית רחוקה יותר מאי פעם",
      "כל אחד מהצדדים בטוח שהוא הצודק",
      "הזמן שנותר קצר מכפי שחשבו",
    ],
    motifs: [
      "warm family kitchen at golden hour, intimate drama",
      "empty courthouse hallway, soft natural light, drama",
      "small apartment with two siblings, emotional realism",
      "train station platform at dusk, cinematic drama",
      "therapy room with soft window light, quiet drama",
    ],
  },
  comedy: {
    locations: [
      "בחתונה שבה הכל משתבש בו זמנית",
      "במשרד הפתוח שבו כולם שומעים הכל",
      "בטיסה שהתעכבה כבר בפעם החמישית",
      "בדירה השכורה עם שלושה שותפים ותוכנית אחת גרועה",
      "בסופרמרקט בשעה 23:00 בלילה שלפני האירוע הגדול",
      "בפגישת המשפחה השנתית שאף אחד לא באמת רוצה בה",
    ],
    roles: [
      "מארגנת אירועים שהכל יוצא משליטתה",
      "עובד משרד ממוצע שנקלע לתוכנית הזויה",
      "זוג שמנסה להעמיד פנים מול ההורים",
      "שכן סקרן מדי שמערב את עצמו בכל דבר",
      "אח קטן שמחליט לעזור ומחמיר את המצב",
      "כלב משפחתי שהוא בעצם הכי שפוי בסיפור",
    ],
    conflicts: [
      "תוכנית פשוטה הופכת למבצע מסובך להחריד",
      "שקר קטן ותמים מתגלגל לכדור שלג",
      "שני אנשים חושבים שהם מסתירים אותו דבר בדיוק",
      "התזמון הכי גרוע האפשרי לכל טעות",
      "כולם משוכנעים שהם היחידים שיודעים את האמת",
    ],
    motifs: [
      "chaotic wedding reception, bright colorful comedy scene",
      "open-plan office chaos, bright daylight, sitcom style",
      "delayed airport gate, comedic lighting",
      "cramped shared apartment with roommates, playful comedy",
      "late night supermarket aisle, quirky comedic scene",
    ],
  },
  action: {
    locations: [
      "על גג רכבת דוהרת בין הרים",
      "במרדף מכוניות ברחובות עיר לילית",
      "במקדש נסתר עמוס במלכודות עתיקות",
      "על סיפון ספינה בלב סופה זועמת",
      "במנהרות תת-קרקעיות מתחת לבירה נצורה",
      "בקרב הסופי על גג גורד השחקים הגבוה בעיר",
    ],
    roles: [
      "שכירת חרב שמחפשת גאולה אישית",
      "סוכן חשאי שהמשימה שלו הפכה אישית מדי",
      "חוקרת אוצרות שרודפת אחרי גילוי של פעם בחיים",
      "טייס קרבי לשעבר שנגרר בחזרה לשדה הקרב",
      "צוות פורצים שהעבודה האחרונה שלהם השתבשה",
      "לוחמת מורדים שמובילה את הקרב האחרון",
    ],
    conflicts: [
      "הזמן אוזל והמרדף רק מתחיל",
      "בעל ברית לשעבר עומד עכשיו בצד הנגדי",
      "המלכודת הבאה קטלנית מקודמתה",
      "רק החלטה אחת מפרידה בין הצלה לאסון",
      "האויב תמיד צעד אחד לפני, עד עכשיו",
    ],
    motifs: [
      "action chase on top of a speeding train through mountains, cinematic",
      "night city car chase, neon lights, high energy action",
      "ancient temple full of traps, adventure cinematic lighting",
      "ship deck in a raging storm, epic action",
      "underground tunnels beneath a besieged city, tense action",
    ],
  },
  romance: {
    locations: [
      "בבית קפה קטן בפינת רחוב בעיר זרה",
      "על שפת הים ברגעי השקיעה האחרונים",
      "בספרייה הישנה שבה שני אנשים תמיד יושבים באותו שולחן",
      "בחתונה של מישהו אחר שבה הם נפגשים שוב",
      "בטיול שטח בלתי מתוכנן שהתארך יותר מדי",
      "במרפסת קטנה מעל רחוב עמוס בלילה קריר",
    ],
    roles: [
      "שתי נשמות שנפגשות בעיתוי הכי לא נכון בעולם",
      "אהבת נעורים ששבה להטריד את ההווה",
      "שני זרים שנתקעים יחד בנסיבות בלתי צפויות",
      "מי שנשבע לא להתאהב שוב",
      "זוג שדרכיהם התפצלו ועכשיו מצטלבות שוב",
      "מכתב ישן שמחבר בין שתי תקופות",
    ],
    conflicts: [
      "התזמון תמיד עומד ביניהם",
      "פחד מלאהוב שוב חזק מהרצון להסתכן",
      "מרחק גיאוגרפי שנראה בלתי אפשרי לגשר עליו",
      "סוד קטן שעלול לשנות הכל",
      "עבר משותף שאף אחד מהם לא באמת סגר",
    ],
    motifs: [
      "cozy corner cafe in a foreign city, warm romantic light",
      "beach at golden sunset, two silhouettes, romantic cinematic",
      "old library reading nook, soft warm light, romance",
      "wedding reception string lights at dusk, romantic",
      "small balcony overlooking a city at night, intimate romance",
    ],
  },
  mystery: {
    locations: [
      "בספרייה העירונית שנסגרה שנים אחרי אירוע לא ברור",
      "בבית האחוזה שבו נערך המשחק האחרון לפני שנעלם",
      "בתחנת המשטרה בשעה שאין בה כמעט אף אחד",
      "ברכבת הלילה שבה נעלם נוסע אחד ואיש לא שם לב",
      "במשרד עורך הדין שבו נמצאה צוואה שלא הייתה אמורה להתקיים",
      "בעיר קטנה ששומרת סוד משותף אחד גדול",
    ],
    roles: [
      "בלשית פרטית שמסרבת לוותר על תיק סגור",
      "עיתונאי חוקר שממשיך לחפור למרות האזהרות",
      "עד יחיד שגרסתו משתנה בכל פעם מחדש",
      "יורש שמגלה שהצוואה מסתירה יותר משהיא חושפת",
      "שוטרת שהתיק הזה הפך אצלה לאובססיה",
      "מי שכולם בטוחים שהוא האשם - חוץ ממנו עצמו",
    ],
    conflicts: [
      "כל רמז חדש רק מוסיף עוד שאלה",
      "מישהו קרוב יודע יותר משהוא מודה",
      "האליבי המושלם מתחיל להתפרק",
      "החשוד המתבקש ביותר הוא דווקא לא האשם",
      "התשובה הייתה תמיד מול העיניים, נסתרת בפרט קטן",
    ],
    motifs: [
      "closed municipal library at dusk, moody mystery lighting",
      "old manor house interior, dramatic shadows, mystery",
      "empty police station at night, film noir lighting",
      "night train carriage, tense mystery atmosphere",
      "lawyer's office with old documents, mystery cinematic",
    ],
  },
  documentary: {
    locations: [
      "ברחובות השכונה שבה הכל התחיל",
      "בארכיון הישן שבו שמורות עדויות נשכחות",
      "באתר ההיסטורי שעליו מספרים הניצולים האחרונים",
      "בבית המשפחה שבו נשמרו התמונות במשך דורות",
      "במקום העבודה שבו הכל השתנה ביום אחד",
      "בשטח הפתוח שבו נערכת התצפית המדעית",
    ],
    roles: [
      "עדים חיים לאירוע שכמעט נשכח",
      "חוקרת שמקדישה שנים לחשיפת האמת",
      "משפחה ששומרת על סיפור שהועבר מדור לדור",
      "קהילה שלמה שמספרת את הסיפור בקול אחד",
      "מומחית שמסבירה את מה שרוב האנשים מעולם לא הבינו",
      "אדם אחד שהחליט שהזמן לספר את הסיפור הגיע",
    ],
    conflicts: [
      "העדויות סותרות זו את זו בפרטים קריטיים",
      "התיעוד ההיסטורי כמעט אבד לכולי עלמא",
      "האמת מורכבת הרבה יותר מהגרסה המוכרת",
      "יש מי שמעדיף שהסיפור הזה יישאר בשתיקה",
      "כל עדות חדשה משנה את הפרספקטיבה על האירוע",
    ],
    motifs: [
      "documentary style street photography, natural light, realistic",
      "archival records room, dusty warm light, documentary",
      "historic landmark with interview subject, documentary realism",
      "family photo album close-up, nostalgic documentary",
      "scientific field observation site, natural daylight, documentary",
    ],
  },
};

const CAPTIONS: Record<Beat, string[]> = {
  opening: ["ההתחלה", "יום כרגיל... כמעט", "הכל עומד להשתנות"],
  rising: ["המתח גובר", "אין דרך חזרה", "משהו משתנה"],
  twist: ["תפנית", "שום דבר לא כפי שחשבתם", "הכל מתהפך"],
  climax: ["הרגע הגדול", "העימות הסופי", "הכל או כלום"],
  resolution: ["הסוף", "מה שנשאר מאחור", "וכך זה נגמר"],
};

function buildBeats(n: number): Beat[] {
  const count = Math.max(3, Math.min(8, n));
  const middleCount = count - 3;
  const middle: Beat[] = [];
  for (let i = 0; i < middleCount; i++) {
    middle.push(i > 0 && i % 3 === 2 ? "twist" : "rising");
  }
  return ["opening", ...middle, "climax", "resolution"];
}

function pickCycled<T>(arr: T[], order: number[], i: number): T {
  return arr[order[i % order.length]];
}

function shuffledIndices(length: number): number[] {
  const idx = Array.from({ length }, (_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx;
}

function narrationFor(
  beat: Beat,
  location: string,
  conflict: string,
  plotIdea: string,
  title: string
): string {
  switch (beat) {
    case "opening":
      return `${location}. הכל נראה רגיל — עד הרגע שבו ${plotIdea}`;
    case "rising":
      return `${location}. המתח גובר: ${conflict}.`;
    case "twist":
      return `תפנית בלתי צפויה ${location} משנה את כל התמונה.`;
    case "climax":
      return `הרגע הגדול הגיע. ${location}, הכל מתנקז לעימות שיקבע הכל.`;
    case "resolution":
      return `האבק שוקע. ${location}, הסיפור של "${title}" מגיע אל סיומו.`;
  }
}

export function generateScriptOffline(req: MovieRequest): Movie {
  const bank = BANKS[req.genre];
  const beats = buildBeats(req.numScenes);

  const locationOrder = shuffledIndices(bank.locations.length);
  const conflictOrder = shuffledIndices(bank.conflicts.length);
  const motifOrder = shuffledIndices(bank.motifs.length);
  const captionOrders: Record<Beat, number[]> = {
    opening: shuffledIndices(CAPTIONS.opening.length),
    rising: shuffledIndices(CAPTIONS.rising.length),
    twist: shuffledIndices(CAPTIONS.twist.length),
    climax: shuffledIndices(CAPTIONS.climax.length),
    resolution: shuffledIndices(CAPTIONS.resolution.length),
  };

  const beatCounters: Record<Beat, number> = {
    opening: 0,
    rising: 0,
    twist: 0,
    climax: 0,
    resolution: 0,
  };

  const scenes: Scene[] = beats.map((beat, i) => {
    const location = pickCycled(bank.locations, locationOrder, i);
    const conflict = pickCycled(bank.conflicts, conflictOrder, i);
    const motif = pickCycled(bank.motifs, motifOrder, i);
    const captionIdx = beatCounters[beat]++;
    const caption = pickCycled(CAPTIONS[beat], captionOrders[beat], captionIdx);
    const narration = narrationFor(beat, location, conflict, req.plotIdea, req.title);
    const duration = Math.max(6, Math.min(14, 6 + narration.length / 12));

    return {
      id: `scene-${i + 1}`,
      heading: `${(i + 1).toString().padStart(2, "0")}. ${location}`,
      narration,
      caption,
      visualPrompt: `${motif}, ${req.mood} mood, no text, no watermark`,
      mood: req.mood,
      duration: Math.round(duration),
    };
  });

  return {
    title: req.title || "סרט ללא שם",
    genre: req.genre,
    logline: `${req.plotIdea} (${GENRE_LABELS[req.genre]})`,
    scenes,
  };
}
