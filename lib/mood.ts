import { Mood } from "./types";

export interface MoodProfile {
  /** CSS gradient stops used to paint the procedural scene background. */
  gradient: [string, string, string];
  accent: string;
  /** Semitone offsets from the root note, defining the generative-score scale. */
  scale: number[];
  /** Base frequency (Hz) of the root note. */
  root: number;
  /** Beats per minute driving note scheduling. */
  tempo: number;
  waveform: OscillatorType;
  /** How long (0-1) each scheduled note rings out relative to its slot. */
  sustain: number;
}

export const MOOD_PROFILES: Record<Mood, MoodProfile> = {
  tense: {
    gradient: ["#1a0505", "#3a0d0d", "#000000"],
    accent: "#e11d2e",
    scale: [0, 1, 3, 5, 7, 8, 10, 12],
    root: 110,
    tempo: 132,
    waveform: "sawtooth",
    sustain: 0.35,
  },
  joyful: {
    gradient: ["#fff3b0", "#ff9e2c", "#ff6b35"],
    accent: "#ffd166",
    scale: [0, 2, 4, 5, 7, 9, 11, 12],
    root: 196,
    tempo: 122,
    waveform: "triangle",
    sustain: 0.6,
  },
  mysterious: {
    gradient: ["#0b0f2b", "#241559", "#3a1c71"],
    accent: "#8e7dff",
    scale: [0, 3, 5, 7, 10, 12],
    root: 130.81,
    tempo: 72,
    waveform: "sine",
    sustain: 0.85,
  },
  epic: {
    gradient: ["#2b1700", "#7a4400", "#c98a1c"],
    accent: "#f4b942",
    scale: [0, 2, 4, 7, 9, 12],
    root: 98,
    tempo: 80,
    waveform: "square",
    sustain: 0.9,
  },
  sad: {
    gradient: ["#0e1620", "#1c2a3a", "#33465c"],
    accent: "#7ea8c4",
    scale: [0, 2, 3, 5, 7, 8, 10, 12],
    root: 110,
    tempo: 58,
    waveform: "sine",
    sustain: 0.95,
  },
  romantic: {
    gradient: ["#2b0d24", "#6b1e4a", "#c8577a"],
    accent: "#ffb8d1",
    scale: [0, 2, 4, 6, 7, 9, 11, 12],
    root: 174.61,
    tempo: 92,
    waveform: "triangle",
    sustain: 0.75,
  },
  comedic: {
    gradient: ["#123a1f", "#1f6d3a", "#7ec850"],
    accent: "#ffe66d",
    scale: [0, 2, 4, 7, 9, 12],
    root: 220,
    tempo: 148,
    waveform: "square",
    sustain: 0.25,
  },
};
