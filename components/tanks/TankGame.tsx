"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Controls, Game, Hud, Mode, createGame, hud, render, update, WIDTH, HEIGHT } from "@/lib/tanks/game";
import { TankSounds } from "@/lib/tanks/sound";

type Screen = "menu" | "playing" | "paused" | "over";
type TouchKey = keyof Controls;

const P1_KEYS: Record<string, TouchKey> = { KeyW: "up", KeyS: "down", KeyA: "left", KeyD: "right", Space: "fire" };
const P2_KEYS: Record<string, TouchKey> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  Enter: "fire",
  NumpadEnter: "fire",
  Slash: "fire",
};
const BLOCKED = new Set(["Space", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Enter"]);
const BEST_KEY = "tank-battle-best";

const MODES: { mode: Mode; title: string; desc: string }[] = [
  { mode: "solo", title: "שחקן יחיד", desc: "שרדו גלים של טנקי אויב" },
  { mode: "coop", title: "שיתופי (2 שחקנים)", desc: "שניכם יחד נגד הגלים" },
  { mode: "duel", title: "דו-קרב (2 שחקנים)", desc: "ראשון ל-5 פגיעות מנצח" },
];

function emptyControls(): Controls {
  return { up: false, down: false, left: false, right: false, fire: false };
}

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function writeBest(v: number) {
  try {
    localStorage.setItem(BEST_KEY, String(v));
  } catch {
    /* storage unavailable */
  }
}

export default function TankGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const touchRef = useRef<Controls>(emptyControls());
  const soundRef = useRef<TankSounds | null>(null);
  const screenRef = useRef<Screen>("menu");

  const [screen, setScreenState] = useState<Screen>("menu");
  const [hudState, setHud] = useState<Hud | null>(null);
  const [best, setBest] = useState(0);
  const [muted, setMuted] = useState(false);

  const setScreen = useCallback((s: Screen) => {
    screenRef.current = s;
    setScreenState(s);
  }, []);

  const start = useCallback(
    (mode: Mode) => {
      if (!soundRef.current) soundRef.current = new TankSounds();
      soundRef.current.resume();
      setBest(readBest());
      gameRef.current = createGame(mode);
      keysRef.current.clear();
      setHud(hud(gameRef.current));
      setScreen("playing");
      canvasRef.current?.focus();
    },
    [setScreen],
  );

  // keyboard
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const s = screenRef.current;
      if (s === "playing" || s === "paused") {
        if (BLOCKED.has(e.code)) e.preventDefault();
        if (e.code === "KeyP" || e.code === "Escape") {
          setScreen(s === "playing" ? "paused" : "playing");
          return;
        }
      }
      keysRef.current.add(e.code);
    };
    const up = (e: KeyboardEvent) => keysRef.current.delete(e.code);
    const blur = () => {
      keysRef.current.clear();
      if (screenRef.current === "playing") setScreen("paused");
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("blur", blur);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("blur", blur);
    };
  }, [setScreen]);

  // game loop
  useEffect(() => {
    let raf = 0;
    let last = performance.now();
    let hudTimer = 0;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const g = gameRef.current;
      const ctx = canvasRef.current?.getContext("2d");
      if (!g || !ctx) return;

      if (screenRef.current === "playing" || screenRef.current === "over") {
        const keys = keysRef.current;
        const twoPlayers = g.mode !== "solo";
        const controls = [emptyControls(), emptyControls()];
        for (const code of keys) {
          if (P1_KEYS[code]) controls[0][P1_KEYS[code]] = true;
          if (P2_KEYS[code]) controls[twoPlayers ? 1 : 0][P2_KEYS[code]] = true;
        }
        const tc = touchRef.current;
        for (const k of Object.keys(tc) as TouchKey[]) if (tc[k]) controls[0][k] = true;

        const wasOver = g.over;
        update(g, dt, controls);
        const sounds = soundRef.current;
        for (const ev of g.events) sounds?.play(ev);
        g.events.length = 0;

        if (g.over && !wasOver) {
          if (g.mode !== "duel" && g.score > readBest()) {
            writeBest(g.score);
            setBest(g.score);
          }
          setTimeout(() => setScreen("over"), 1200);
        }

        hudTimer -= dt;
        if (hudTimer <= 0) {
          hudTimer = 0.1;
          setHud(hud(g));
        }
      }
      render(ctx, g);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [setScreen]);

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (soundRef.current) soundRef.current.muted = next;
  };

  const touchButton = (key: TouchKey, label: string, className = "") => (
    <button
      type="button"
      aria-label={label}
      className={`flex select-none items-center justify-center text-2xl text-white active:bg-white/30 ${className || "h-14 w-14 rounded-2xl bg-white/10"}`}
      onPointerDown={(e) => {
        e.preventDefault();
        touchRef.current[key] = true;
      }}
      onPointerUp={() => (touchRef.current[key] = false)}
      onPointerLeave={() => (touchRef.current[key] = false)}
      onPointerCancel={() => (touchRef.current[key] = false)}
      onContextMenu={(e) => e.preventDefault()}
    >
      {label}
    </button>
  );

  return (
    <div className="flex w-full flex-col items-center gap-4" dir="rtl">
      {/* HUD */}
      <div className="flex w-full max-w-[840px] flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-900/70 px-4 py-2 text-sm text-zinc-200">
        {hudState ? (
          <>
            <div className="flex flex-wrap gap-4">
              {hudState.players.map((p, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className={`font-bold ${i === 0 ? "text-blue-400" : "text-amber-400"}`}>P{i + 1}</span>
                  {hudState.mode === "duel" ? (
                    <span>ניצחונות: {p.kills}/5</span>
                  ) : (
                    <span title="חיים">{"♥".repeat(Math.max(0, p.lives))}</span>
                  )}
                  {!p.alive && p.respawn > 0 && <span className="text-zinc-400">חוזר בעוד {p.respawn.toFixed(1)}</span>}
                  {p.shield > 0 && <span className="text-cyan-300">מגן</span>}
                  {p.rapid > 0 && <span className="text-yellow-300">ירי מהיר</span>}
                  {p.triple > 0 && <span className="text-pink-300">ירי משולש</span>}
                </div>
              ))}
            </div>
            {hudState.mode !== "duel" && (
              <div className="flex gap-4">
                <span>גל: {hudState.wave}</span>
                <span>ניקוד: {hudState.score}</span>
                <span className="text-zinc-400">שיא: {best}</span>
              </div>
            )}
          </>
        ) : (
          <span className="text-zinc-400">בחרו מצב משחק כדי להתחיל</span>
        )}
        <div className="flex gap-2">
          {(screen === "playing" || screen === "paused") && (
            <button
              type="button"
              className="rounded-lg bg-zinc-800 px-3 py-1 hover:bg-zinc-700"
              onClick={() => setScreen(screen === "playing" ? "paused" : "playing")}
            >
              {screen === "playing" ? "השהה" : "המשך"}
            </button>
          )}
          <button type="button" className="rounded-lg bg-zinc-800 px-3 py-1 hover:bg-zinc-700" onClick={toggleMute}>
            {muted ? "🔇" : "🔊"}
          </button>
        </div>
      </div>

      {/* Board */}
      <div className="relative w-full max-w-[840px] overflow-hidden rounded-2xl border-4 border-zinc-700 shadow-2xl" dir="ltr">
        <canvas
          ref={canvasRef}
          width={WIDTH}
          height={HEIGHT}
          tabIndex={0}
          className="block h-auto w-full bg-[#3f4a32] outline-none"
        />

        {screen !== "playing" && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" dir="rtl">
            {screen === "menu" && (
              <div className="flex max-w-lg flex-col items-center gap-4 text-center">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">⚔️ קרב טנקים</h2>
                <p className="text-sm text-zinc-300">השמידו את טנקי האויב, פרצו קירות לבנים, והתחבאו בשיחים.</p>
                <div className="grid w-full gap-2">
                  {MODES.map((m) => (
                    <button
                      key={m.mode}
                      type="button"
                      onClick={() => start(m.mode)}
                      className="rounded-xl bg-emerald-600 px-4 py-3 text-right text-white transition hover:bg-emerald-500"
                    >
                      <div className="font-bold">{m.title}</div>
                      <div className="text-xs text-emerald-100">{m.desc}</div>
                    </button>
                  ))}
                </div>
                <Instructions />
              </div>
            )}

            {screen === "paused" && (
              <div className="flex flex-col items-center gap-4 text-center">
                <h2 className="text-3xl font-bold text-white">המשחק מושהה</h2>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-500"
                    onClick={() => setScreen("playing")}
                  >
                    המשך
                  </button>
                  <button
                    type="button"
                    className="rounded-xl bg-zinc-700 px-5 py-2 font-bold text-white hover:bg-zinc-600"
                    onClick={() => setScreen("menu")}
                  >
                    תפריט ראשי
                  </button>
                </div>
              </div>
            )}

            {screen === "over" && hudState && (
              <div className="flex flex-col items-center gap-4 text-center">
                <h2 className="text-4xl font-extrabold text-white">
                  {hudState.mode === "duel" ? `🏆 שחקן ${hudState.winner + 1} ניצח!` : "המשחק נגמר"}
                </h2>
                {hudState.mode !== "duel" && (
                  <p className="text-lg text-zinc-200">
                    הגעתם לגל {hudState.wave} עם {hudState.score} נקודות
                    {hudState.score >= best && hudState.score > 0 && " — שיא חדש! 🎉"}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="rounded-xl bg-emerald-600 px-5 py-2 font-bold text-white hover:bg-emerald-500"
                    onClick={() => start(hudState.mode)}
                  >
                    שחקו שוב
                  </button>
                  <button
                    type="button"
                    className="rounded-xl bg-zinc-700 px-5 py-2 font-bold text-white hover:bg-zinc-600"
                    onClick={() => setScreen("menu")}
                  >
                    תפריט ראשי
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Touch controls (player 1) */}
      {screen === "playing" && (
        <div className="flex w-full max-w-[840px] items-center justify-between px-2 [@media(pointer:fine)]:hidden" dir="ltr">
          <div className="grid grid-cols-3 gap-2">
            <span />
            {touchButton("up", "▲")}
            <span />
            {touchButton("left", "⟲")}
            {touchButton("down", "▼")}
            {touchButton("right", "⟳")}
          </div>
          {touchButton("fire", "💥", "h-20 w-20 rounded-full bg-red-600/60")}
        </div>
      )}
    </div>
  );
}

function Instructions() {
  return (
    <div className="grid w-full gap-2 rounded-xl bg-zinc-900/80 p-3 text-right text-xs text-zinc-300 sm:grid-cols-2">
      <div>
        <div className="mb-1 font-bold text-blue-400">שחקן 1</div>
        <div>תנועה: W / S · סיבוב: A / D</div>
        <div>ירי: רווח</div>
      </div>
      <div>
        <div className="mb-1 font-bold text-amber-400">שחקן 2</div>
        <div>תנועה וסיבוב: מקשי החיצים</div>
        <div>ירי: Enter</div>
      </div>
      <div className="sm:col-span-2 text-zinc-400">
        השהיה: P / Esc · בונוסים: <span className="text-cyan-300">S</span> מגן, <span className="text-yellow-300">»</span> ירי
        מהיר, <span className="text-green-300">+</span> תיקון, <span className="text-pink-300">3</span> ירי משולש
      </div>
    </div>
  );
}
