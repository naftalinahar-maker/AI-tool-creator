"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Movie, Mood, Scene, GENRE_LABELS } from "@/lib/types";
import { MOOD_PROFILES } from "@/lib/mood";
import { DecoShape, generateShapes } from "@/lib/canvasArt";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useProceduralScore } from "@/hooks/useProceduralScore";
import { saveFile } from "@/lib/saveFile";

const CANVAS_W = 1280;
const CANVAS_H = 720;
const INTRO_DURATION = 2.5;
const MIN_SCENE_DURATION = 4;
const MAX_SCENE_DURATION = 20;

function clampDuration(d: number): number {
  if (!Number.isFinite(d)) return MIN_SCENE_DURATION;
  return Math.min(MAX_SCENE_DURATION, Math.max(MIN_SCENE_DURATION, d));
}
const OUTRO_DURATION = 3.5;

interface Segment {
  kind: "intro" | "scene" | "outro";
  start: number;
  duration: number;
  scene?: Scene;
  sceneIndex?: number;
}

function buildTimeline(movie: Movie): Segment[] {
  const segments: Segment[] = [];
  let t = 0;
  segments.push({ kind: "intro", start: t, duration: INTRO_DURATION });
  t += INTRO_DURATION;
  movie.scenes.forEach((scene, i) => {
    const duration = clampDuration(scene.duration);
    segments.push({ kind: "scene", start: t, duration, scene, sceneIndex: i });
    t += duration;
  });
  segments.push({ kind: "outro", start: t, duration: OUTRO_DURATION });
  return segments;
}

function findSegment(segments: Segment[], time: number): { segment: Segment; progress: number } {
  for (const seg of segments) {
    if (time < seg.start + seg.duration) {
      return { segment: seg, progress: Math.min(1, Math.max(0, (time - seg.start) / seg.duration)) };
    }
  }
  const last = segments[segments.length - 1];
  return { segment: last, progress: 1 };
}

function easeInOutSine(t: number): number {
  return -(Math.cos(Math.PI * t) - 1) / 2;
}

function fadeAlpha(progress: number, inEnd: number, outStart: number): number {
  if (progress < inEnd) return progress / inEnd;
  if (progress > outStart) return Math.max(0, (1 - progress) / (1 - outStart));
  return 1;
}

function drawTitleCard(
  ctx: CanvasRenderingContext2D,
  title: string,
  subtitle: string,
  alpha: number
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.textAlign = "center";
  ctx.direction = "rtl";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 64px system-ui, Arial, sans-serif";
  ctx.fillText(title, CANVAS_W / 2, CANVAS_H / 2 - 10);
  ctx.font = "28px system-ui, Arial, sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText(subtitle, CANVAS_W / 2, CANVAS_H / 2 + 40);
  ctx.restore();
}

function drawScene(
  ctx: CanvasRenderingContext2D,
  scene: Scene,
  progress: number,
  shapes: DecoShape[]
) {
  const profile = MOOD_PROFILES[scene.mood];
  const eased = easeInOutSine(progress);

  ctx.save();
  const scale = 1 + 0.12 * eased;
  const panX = Math.sin(progress * Math.PI) * 16;
  ctx.translate(CANVAS_W / 2 + panX, CANVAS_H / 2);
  ctx.scale(scale, scale);
  ctx.translate(-CANVAS_W / 2, -CANVAS_H / 2);

  const grad = ctx.createLinearGradient(0, 0, CANVAS_W, CANVAS_H);
  grad.addColorStop(0, profile.gradient[0]);
  grad.addColorStop(0.5, profile.gradient[1]);
  grad.addColorStop(1, profile.gradient[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

  shapes.forEach((shape, i) => {
    const drift = progress * 0.15;
    const x = (((shape.x + shape.speedX * drift * 10 + Math.sin(shape.phase + progress * 3)) % 1) + 1) % 1;
    const y = (((shape.y + shape.speedY * drift * 10 + Math.cos(shape.phase + progress * 3)) % 1) + 1) % 1;
    ctx.beginPath();
    ctx.fillStyle = profile.accent;
    ctx.globalAlpha = 0.12 + (i % 3) * 0.04;
    ctx.filter = "blur(30px)";
    ctx.arc(x * CANVAS_W, y * CANVAS_H, shape.r * CANVAS_W, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.filter = "none";
  ctx.globalAlpha = 1;
  ctx.restore();

  ctx.save();
  ctx.direction = "rtl";
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.font = "24px system-ui, Arial, sans-serif";
  ctx.fillText(scene.heading, CANVAS_W - 40, 50);
  ctx.restore();

  const capAlpha = fadeAlpha(progress, 0.2, 0.85);
  ctx.save();
  ctx.globalAlpha = capAlpha;
  ctx.direction = "rtl";
  ctx.textAlign = "center";
  ctx.shadowColor = "rgba(0,0,0,0.8)";
  ctx.shadowBlur = 18;
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 48px system-ui, Arial, sans-serif";
  ctx.fillText(scene.caption, CANVAS_W / 2, CANVAS_H - 90);
  ctx.restore();
}

function sanitizeFilename(name: string): string {
  return name.replace(/[\\/:*?"<>|]/g, "").trim() || "movie";
}

interface MoviePlayerProps {
  movie: Movie;
  onBack: () => void;
}

export default function MoviePlayer({ movie, onBack }: MoviePlayerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const playingRef = useRef(false);
  const currentTimeRef = useRef(0);
  const lastTsRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);
  const lastSceneIndexRef = useRef<number | null>(null);
  const frameCounterRef = useRef(0);
  const narrationOnRef = useRef(true);
  const exportingRef = useRef(false);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const tickRef = useRef<(now: number) => void>(() => {});

  const [isPlaying, setIsPlaying] = useState(false);
  const [displayTime, setDisplayTime] = useState(0);
  const [narrationOn, setNarrationOn] = useState(true);
  const [musicOn, setMusicOn] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportBlob, setExportBlob] = useState<Blob | null>(null);

  const speech = useSpeechSynthesis();
  const score = useProceduralScore();

  const timeline = useMemo(() => buildTimeline(movie), [movie]);
  const totalDuration = timeline[timeline.length - 1].start + timeline[timeline.length - 1].duration;
  const shapesByScene = useMemo(() => {
    const m = new Map<string, DecoShape[]>();
    movie.scenes.forEach((s) => m.set(s.id, generateShapes(s.id)));
    return m;
  }, [movie]);

  useEffect(() => {
    narrationOnRef.current = narrationOn;
  }, [narrationOn]);

  useEffect(() => {
    score.setMuted(!musicOn);
  }, [musicOn, score]);

  const drawAtCurrentTime = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    const { segment, progress } = findSegment(timeline, currentTimeRef.current);
    if (segment.kind === "intro") {
      drawTitleCard(ctx, movie.title, GENRE_LABELS[movie.genre], fadeAlpha(progress, 0.3, 0.75));
    } else if (segment.kind === "scene" && segment.scene) {
      drawScene(ctx, segment.scene, progress, shapesByScene.get(segment.scene.id) ?? []);
    } else {
      drawTitleCard(ctx, "סוף", `נוצר עם AI Movie Studio · ${movie.title}`, fadeAlpha(progress, 0.25, 0.8));
    }

    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    ctx.fillRect(0, CANVAS_H - 4, CANVAS_W, 4);
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillRect(0, CANVAS_H - 4, CANVAS_W * (currentTimeRef.current / totalDuration), 4);
    ctx.restore();
  }, [timeline, movie, shapesByScene, totalDuration]);

  const handleReachEnd = useCallback(() => {
    playingRef.current = false;
    setIsPlaying(false);
    score.stop();
    speech.stop();
    if (exportingRef.current) {
      exportingRef.current = false;
      recorderRef.current?.stop();
      narrationOnRef.current = narrationOn;
    }
  }, [score, speech, narrationOn]);

  const tick = useCallback(
    (now: number) => {
      if (!playingRef.current) return;
      if (lastTsRef.current == null) lastTsRef.current = now;
      const dt = (now - lastTsRef.current) / 1000;
      lastTsRef.current = now;
      currentTimeRef.current += dt;

      if (currentTimeRef.current >= totalDuration) {
        currentTimeRef.current = totalDuration;
        drawAtCurrentTime();
        setDisplayTime(totalDuration);
        handleReachEnd();
        return;
      }

      const { segment } = findSegment(timeline, currentTimeRef.current);
      if (segment.kind === "scene" && segment.sceneIndex !== lastSceneIndexRef.current) {
        lastSceneIndexRef.current = segment.sceneIndex ?? null;
        score.setMood(segment.scene!.mood);
        if (narrationOnRef.current) speech.speak(segment.scene!.narration);
      }

      drawAtCurrentTime();
      frameCounterRef.current += 1;
      if (frameCounterRef.current % 6 === 0) setDisplayTime(currentTimeRef.current);

      rafRef.current = requestAnimationFrame(tickRef.current);
    },
    [timeline, totalDuration, drawAtCurrentTime, handleReachEnd, score, speech]
  );

  useEffect(() => {
    tickRef.current = tick;
  }, [tick]);

  const play = useCallback(() => {
    if (playingRef.current) return;
    // Pressing play after the movie ended starts it again from the beginning.
    if (currentTimeRef.current >= totalDuration) {
      currentTimeRef.current = 0;
      lastSceneIndexRef.current = null;
      setDisplayTime(0);
    }
    playingRef.current = true;
    setIsPlaying(true);
    lastTsRef.current = null;
    const { segment } = findSegment(timeline, currentTimeRef.current);
    const mood: Mood = segment.scene?.mood ?? movie.scenes[0]?.mood ?? "epic";
    score.start(mood);
    rafRef.current = requestAnimationFrame(tick);
  }, [timeline, totalDuration, movie, score, tick]);

  const pause = useCallback(() => {
    playingRef.current = false;
    setIsPlaying(false);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    score.stop();
    speech.stop();
  }, [score, speech]);

  const restart = useCallback(() => {
    pause();
    currentTimeRef.current = 0;
    lastSceneIndexRef.current = null;
    setDisplayTime(0);
    drawAtCurrentTime();
  }, [pause, drawAtCurrentTime]);

  const handleScrub = useCallback(
    (value: number) => {
      currentTimeRef.current = value;
      lastSceneIndexRef.current = null;
      setDisplayTime(value);
      drawAtCurrentTime();
    },
    [drawAtCurrentTime]
  );

  const handleExport = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || exporting) return;

    pause();
    currentTimeRef.current = 0;
    lastSceneIndexRef.current = null;
    setDisplayTime(0);
    drawAtCurrentTime();

    setExporting(true);
    exportingRef.current = true;
    setExportBlob(null);

    const initialMood: Mood = movie.scenes[0]?.mood ?? "epic";
    score.start(initialMood);
    score.setMuted(false);

    const audioStream = score.getRecordingStream();
    const canvasStream = canvas.captureStream(30);
    const tracks: MediaStreamTrack[] = [
      ...canvasStream.getVideoTracks(),
      ...(audioStream ? audioStream.getAudioTracks() : []),
    ];
    const combined = new MediaStream(tracks);

    const mimeCandidates = ["video/webm;codecs=vp9,opus", "video/webm;codecs=vp8,opus", "video/webm"];
    const mimeType =
      mimeCandidates.find((m) => typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported(m)) ??
      "video/webm";

    const recorder = new MediaRecorder(combined, { mimeType, videoBitsPerSecond: 4_000_000 });
    chunksRef.current = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: "video/webm" });
      setExportBlob(blob);
      setExporting(false);
      score.setMuted(!musicOn);
    };
    recorderRef.current = recorder;
    recorder.start();

    narrationOnRef.current = false;
    playingRef.current = true;
    setIsPlaying(true);
    lastTsRef.current = null;
    rafRef.current = requestAnimationFrame(tick);
  }, [exporting, pause, drawAtCurrentTime, movie, score, musicOn, tick]);

  const handleDownloadScript = useCallback(() => {
    const lines = [
      movie.title,
      "",
      movie.logline,
      "",
      ...movie.scenes.flatMap((s, i) => [
        `סצנה ${i + 1}: ${s.heading}`,
        `כיתוב: ${s.caption}`,
        `קריינות: ${s.narration}`,
        "",
      ]),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8" });
    void saveFile(`${sanitizeFilename(movie.title)}-תסריט.txt`, blob);
  }, [movie]);

  useEffect(() => {
    currentTimeRef.current = 0;
    lastSceneIndexRef.current = null;
    playingRef.current = false;
    drawAtCurrentTime();
  }, [movie, drawAtCurrentTime]);

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      score.stop();
      speech.stop();
      recorderRef.current?.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const minutes = Math.floor(displayTime / 60);
  const seconds = Math.floor(displayTime % 60)
    .toString()
    .padStart(2, "0");
  const totalMinutes = Math.floor(totalDuration / 60);
  const totalSeconds = Math.floor(totalDuration % 60)
    .toString()
    .padStart(2, "0");

  return (
    <div className="flex flex-col gap-4" dir="rtl">
      <canvas
        ref={canvasRef}
        width={CANVAS_W}
        height={CANVAS_H}
        className="w-full h-auto rounded-2xl bg-black shadow-2xl"
      />

      <input
        type="range"
        min={0}
        max={totalDuration}
        step={0.1}
        value={displayTime}
        onChange={(e) => handleScrub(Number(e.target.value))}
        dir="ltr"
        disabled={exporting}
        className="w-full accent-violet-500 disabled:opacity-40"
      />

      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-300">
        <span className="tabular-nums" dir="ltr">
          {minutes}:{seconds} / {totalMinutes}:{totalSeconds}
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={isPlaying ? pause : play}
            disabled={exporting}
            className="rounded-full bg-violet-600 px-5 py-2 font-medium text-white transition hover:bg-violet-500 disabled:opacity-40"
          >
            {isPlaying ? "השהה" : "נגן"}
          </button>
          <button
            onClick={restart}
            disabled={exporting}
            className="rounded-full border border-zinc-600 px-4 py-2 text-zinc-200 transition hover:bg-zinc-800 disabled:opacity-40"
          >
            מההתחלה
          </button>
          <label className="flex items-center gap-1.5 rounded-full border border-zinc-600 px-3 py-2">
            <input type="checkbox" checked={narrationOn} onChange={(e) => setNarrationOn(e.target.checked)} />
            קריינות
          </label>
          <label className="flex items-center gap-1.5 rounded-full border border-zinc-600 px-3 py-2">
            <input type="checkbox" checked={musicOn} onChange={(e) => setMusicOn(e.target.checked)} />
            מוזיקה
          </label>
        </div>
      </div>

      {!speech.supported && (
        <p className="text-xs text-amber-400">
          הדפדפן הזה לא תומך בקריינות קולית (Web Speech API). הסרט עדיין יוצג עם כיתובים ומוזיקה.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 border-t border-zinc-800 pt-4">
        <button
          onClick={handleExport}
          disabled={exporting}
          className="rounded-full bg-emerald-600 px-5 py-2 font-medium text-white transition hover:bg-emerald-500 disabled:opacity-50"
        >
          {exporting ? "מייצא סרט..." : "ייצוא הסרט כקובץ וידאו"}
        </button>
        <button
          onClick={handleDownloadScript}
          className="rounded-full border border-zinc-600 px-4 py-2 text-zinc-200 transition hover:bg-zinc-800"
        >
          הורדת תסריט (TXT)
        </button>
        <button onClick={onBack} className="rounded-full px-4 py-2 text-zinc-400 underline-offset-4 hover:underline">
          חזרה לעריכת התסריט
        </button>
        {exportBlob && (
          <button
            onClick={() => void saveFile(`${sanitizeFilename(movie.title)}.webm`, exportBlob)}
            className="rounded-full bg-white px-5 py-2 font-medium text-zinc-900 transition hover:bg-zinc-200"
          >
            הורדת הסרט המוכן ⬇
          </button>
        )}
      </div>

      {exporting && (
        <p className="text-xs text-zinc-400">
          מקליט את הסרט בזמן אמת — השאירו את הטאב הזה פתוח וגלוי עד לסיום (
          <span dir="ltr">
            {totalMinutes}:{totalSeconds}
          </span>{" "}
          דקות).
        </p>
      )}
    </div>
  );
}
