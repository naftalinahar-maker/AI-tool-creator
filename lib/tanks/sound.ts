import type { SoundName } from "./game";

// Tiny synthesized sound effects via the Web Audio API — no audio files needed.
export class TankSounds {
  private ctx: AudioContext | null = null;
  private noise: AudioBuffer | null = null;
  muted = false;

  resume() {
    if (!this.ctx) {
      const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      const len = this.ctx.sampleRate;
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const data = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === "suspended") void this.ctx.resume();
  }

  play(name: SoundName) {
    const ctx = this.ctx;
    if (!ctx || this.muted) return;
    const now = ctx.currentTime;
    const out = ctx.createGain();
    out.connect(ctx.destination);

    const tone = (type: OscillatorType, f0: number, f1: number, dur: number, vol: number, delay = 0) => {
      const o = ctx.createOscillator();
      const gn = ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f0, now + delay);
      o.frequency.exponentialRampToValueAtTime(f1, now + delay + dur);
      gn.gain.setValueAtTime(vol, now + delay);
      gn.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);
      o.connect(gn).connect(out);
      o.start(now + delay);
      o.stop(now + delay + dur + 0.02);
    };
    const noise = (dur: number, vol: number, freq: number) => {
      if (!this.noise) return;
      const src = ctx.createBufferSource();
      src.buffer = this.noise;
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(freq, now);
      filter.frequency.exponentialRampToValueAtTime(60, now + dur);
      const gn = ctx.createGain();
      gn.gain.setValueAtTime(vol, now);
      gn.gain.exponentialRampToValueAtTime(0.001, now + dur);
      src.connect(filter).connect(gn).connect(out);
      src.start(now);
      src.stop(now + dur);
    };

    switch (name) {
      case "shoot":
        tone("square", 420, 90, 0.09, 0.05);
        noise(0.08, 0.12, 2500);
        break;
      case "hit":
        noise(0.15, 0.2, 1500);
        break;
      case "brick":
        noise(0.1, 0.12, 900);
        break;
      case "boom":
        noise(0.7, 0.45, 1200);
        tone("sine", 120, 30, 0.5, 0.3);
        break;
      case "power":
        tone("triangle", 440, 880, 0.12, 0.12);
        tone("triangle", 660, 1320, 0.15, 0.12, 0.1);
        break;
      case "wave":
        tone("sawtooth", 220, 440, 0.25, 0.06);
        tone("sawtooth", 330, 660, 0.3, 0.06, 0.2);
        break;
    }
  }
}
