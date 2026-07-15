import { Injectable } from "@angular/core";

/**
 * Lo-fi synthesized blips — no audio assets, one oscillator per note.
 * Browsers only allow audio after a user gesture, so the context is
 * created/resumed on any click; until then play calls are silent no-ops.
 */
@Injectable({
  providedIn: "root",
})
export class SoundService {
  private ctx: AudioContext;

  constructor() {
    const unlock = () => {
      const AC = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!this.ctx && AC) {
        try {
          this.ctx = new AC();
        } catch {
          return;
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
    };
    document.addEventListener("click", unlock);
  }

  private tone(freq: number, at: number, dur: number, type: OscillatorType = "square") {
    if (!this.ctx || this.ctx.state !== "running") {
      return;
    }
    const t = this.ctx.currentTime + at;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.04, t); // quiet: it's a party, not a casino
    gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur);
  }

  /** a new question is up */
  question() {
    this.tone(523, 0, 0.09);
    this.tone(784, 0.1, 0.12);
  }

  /** round results are in */
  score() {
    this.tone(659, 0, 0.08);
    this.tone(880, 0.09, 0.15, "triangle");
  }

  /** the game is over */
  gameOver() {
    this.tone(523, 0, 0.12);
    this.tone(659, 0.13, 0.12);
    this.tone(784, 0.26, 0.3);
  }
}
