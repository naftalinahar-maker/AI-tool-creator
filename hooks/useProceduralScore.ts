"use client";

import { useCallback, useEffect, useRef } from "react";
import { Mood } from "@/lib/types";
import { MOOD_PROFILES } from "@/lib/mood";

interface WindowWithWebkitAudio extends Window {
  webkitAudioContext?: typeof AudioContext;
}

export function useProceduralScore() {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const destNodeRef = useRef<MediaStreamAudioDestinationNode | null>(null);
  const schedulerRef = useRef<number | null>(null);
  const nextNoteTimeRef = useRef(0);
  const moodRef = useRef<Mood>("epic");
  const stepRef = useRef(0);
  const currentDegreeRef = useRef(0);

  const ensureContext = useCallback((): AudioContext => {
    if (!ctxRef.current) {
      const w = window as WindowWithWebkitAudio;
      const AudioContextCtor = window.AudioContext || w.webkitAudioContext;
      if (!AudioContextCtor) throw new Error("Web Audio API not supported");
      const ctx = new AudioContextCtor();
      const masterGain = ctx.createGain();
      masterGain.gain.value = 0.25;
      const dest = ctx.createMediaStreamDestination();
      masterGain.connect(ctx.destination);
      masterGain.connect(dest);
      ctxRef.current = ctx;
      masterGainRef.current = masterGain;
      destNodeRef.current = dest;
    }
    return ctxRef.current;
  }, []);

  const scheduleNote = useCallback((time: number) => {
    const ctx = ctxRef.current;
    const masterGain = masterGainRef.current;
    if (!ctx || !masterGain) return;
    const profile = MOOD_PROFILES[moodRef.current];

    const roll = Math.random();
    let degreeIdx = currentDegreeRef.current;
    if (roll < 0.15) degreeIdx = 0;
    else if (roll < 0.55) degreeIdx = Math.min(profile.scale.length - 1, degreeIdx + 1);
    else if (roll < 0.8) degreeIdx = Math.max(0, degreeIdx - 1);
    else degreeIdx = Math.floor(Math.random() * profile.scale.length);
    currentDegreeRef.current = degreeIdx;

    const semitone = profile.scale[degreeIdx];
    const freq = profile.root * Math.pow(2, semitone / 12);
    const beatDuration = 60 / profile.tempo;
    const noteLength = beatDuration * profile.sustain;

    const osc = ctx.createOscillator();
    osc.type = profile.waveform;
    osc.frequency.value = freq;

    const noteGain = ctx.createGain();
    noteGain.gain.setValueAtTime(0, time);
    noteGain.gain.linearRampToValueAtTime(0.35, time + 0.02);
    noteGain.gain.exponentialRampToValueAtTime(0.001, time + noteLength);

    osc.connect(noteGain);
    noteGain.connect(masterGain);
    osc.start(time);
    osc.stop(time + noteLength + 0.05);

    if (stepRef.current % 4 === 0) {
      const droneOsc = ctx.createOscillator();
      droneOsc.type = "sine";
      droneOsc.frequency.value = profile.root / 2;
      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0, time);
      droneGain.gain.linearRampToValueAtTime(0.12, time + 0.3);
      droneGain.gain.exponentialRampToValueAtTime(0.001, time + beatDuration * 4);
      droneOsc.connect(droneGain);
      droneGain.connect(masterGain);
      droneOsc.start(time);
      droneOsc.stop(time + beatDuration * 4 + 0.05);
    }

    stepRef.current += 1;
  }, []);

  const schedulerLoop = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    const profile = MOOD_PROFILES[moodRef.current];
    const beatDuration = 60 / profile.tempo;
    while (nextNoteTimeRef.current < ctx.currentTime + 0.15) {
      scheduleNote(nextNoteTimeRef.current);
      nextNoteTimeRef.current += beatDuration;
    }
  }, [scheduleNote]);

  const start = useCallback(
    (mood: Mood) => {
      const ctx = ensureContext();
      if (ctx.state === "suspended") ctx.resume();
      moodRef.current = mood;
      nextNoteTimeRef.current = ctx.currentTime + 0.05;
      stepRef.current = 0;
      if (schedulerRef.current !== null) return;
      schedulerRef.current = window.setInterval(schedulerLoop, 100);
    },
    [ensureContext, schedulerLoop]
  );

  const setMood = useCallback((mood: Mood) => {
    moodRef.current = mood;
  }, []);

  const stop = useCallback(() => {
    if (schedulerRef.current !== null) {
      window.clearInterval(schedulerRef.current);
      schedulerRef.current = null;
    }
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = muted ? 0 : 0.25;
    }
  }, []);

  const getRecordingStream = useCallback((): MediaStream | null => {
    return destNodeRef.current?.stream ?? null;
  }, []);

  useEffect(() => {
    return () => {
      if (schedulerRef.current !== null) window.clearInterval(schedulerRef.current);
      ctxRef.current?.close().catch(() => {});
    };
  }, []);

  return { start, setMood, stop, setMuted, getRecordingStream };
}
