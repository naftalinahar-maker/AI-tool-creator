"use client";

import { useState } from "react";
import Link from "next/link";
import { Movie } from "@/lib/types";
import MovieForm from "@/components/MovieForm";
import Storyboard from "@/components/Storyboard";
import MoviePlayer from "@/components/MoviePlayer";

type Stage = "form" | "storyboard" | "player";

export default function Home() {
  const [stage, setStage] = useState<Stage>("form");
  const [movie, setMovie] = useState<Movie | null>(null);
  const [source, setSource] = useState<"claude" | "offline">("offline");

  function handleGenerated(newMovie: Movie, newSource: "claude" | "offline") {
    setMovie(newMovie);
    setSource(newSource);
    setStage("storyboard");
  }

  function handleStartOver() {
    setMovie(null);
    setStage("form");
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-gradient-to-b from-zinc-950 via-zinc-950 to-black px-4 py-10">
      <div className="w-full max-w-4xl">
        <header className="mb-10 flex flex-col items-center gap-2 text-center" dir="rtl">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">🎬 AI Movie Studio</h1>
          <p className="max-w-xl text-zinc-400">
            כתבו רעיון לעלילה, ותנו לבינה המלאכותית ליצור עבורכם תסריט קצר, סטוריבורד מונפש, קריינות ופס קול —
            ולסיים עם סרט להורדה.
          </p>
        </header>

        <main className="rounded-3xl border border-zinc-800 bg-zinc-950/60 p-6 shadow-xl backdrop-blur sm:p-8">
          {stage === "form" && <MovieForm onGenerated={handleGenerated} />}

          {stage === "storyboard" && movie && (
            <Storyboard
              movie={movie}
              source={source}
              onChange={setMovie}
              onConfirm={() => setStage("player")}
              onStartOver={handleStartOver}
            />
          )}

          {stage === "player" && movie && <MoviePlayer movie={movie} onBack={() => setStage("storyboard")} />}
        </main>

        <footer className="mt-6 text-center text-xs text-zinc-600" dir="rtl">
          כל היצירה — תסריט, ויזואלים, קריינות ומוזיקה — מופקת ומורכבת ישירות בדפדפן.
          <div className="mt-2">
            <Link href="/tanks" className="text-emerald-500 hover:text-emerald-400">
              🛡️ הפסקה? שחקו בקרב טנקים
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}
