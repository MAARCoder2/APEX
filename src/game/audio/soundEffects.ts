/**
 * Zero-dependency Web Audio API procedural sound synthesizer for Project Apex V2.
 * Adheres to Three.js and Ultra-mode guidelines: no external 404 audio files.
 */

class SoundEffectsEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  // Engine sound nodes
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private engineFilter: BiquadFilterNode | null = null;

  public init(): void {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    } catch {
      // AudioContext not available in some headless environments
    }
  }

  public resumeContext(): void {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean): void {
    this.isMuted = muted;
    if (this.engineGain) {
      this.engineGain.gain.value = muted ? 0 : 0.05;
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // ---- Engine Audio Loop ----

  public startEngine(): void {
    if (!this.ctx || this.engineOsc || this.isMuted) return;
    this.resumeContext();

    try {
      this.engineOsc = this.ctx.createOscillator();
      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.value = 45; // Idle rumble ~45 Hz

      this.engineFilter = this.ctx.createBiquadFilter();
      this.engineFilter.type = 'lowpass';
      this.engineFilter.frequency.value = 220;

      this.engineGain = this.ctx.createGain();
      this.engineGain.gain.value = 0.04;

      this.engineOsc.connect(this.engineFilter);
      this.engineFilter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc.start();
    } catch {
      // Audio fallback
    }
  }

  public updateEngine(speedKmh: number, throttle: number): void {
    if (!this.ctx || !this.engineOsc || !this.engineFilter || !this.engineGain || this.isMuted) return;

    // Modulate pitch from 45 Hz (idle) up to 280 Hz at high speeds
    const targetFreq = 45 + Math.abs(speedKmh) * 1.8 + throttle * 40;
    this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.05);

    // Filter frequency opens up with throttle
    const targetFilter = 200 + Math.abs(speedKmh) * 10 + throttle * 350;
    this.engineFilter.frequency.setTargetAtTime(targetFilter, this.ctx.currentTime, 0.05);

    // Volume modulation
    const targetGain = Math.min(0.08, 0.03 + Math.abs(speedKmh) * 0.0004 + throttle * 0.02);
    this.engineGain.gain.setTargetAtTime(targetGain, this.ctx.currentTime, 0.05);
  }

  public stopEngine(): void {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      } catch {
        // Ignored
      }
      this.engineOsc = null;
      this.engineFilter = null;
      this.engineGain = null;
    }
  }

  // ---- One-shot Sound Effects ----

  public playHorn(): void {
    if (!this.ctx || this.isMuted) return;
    this.resumeContext();

    try {
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(420, now); // Dual-tone Dhaka car horn
      osc2.frequency.setValueAtTime(500, now);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.4);
      osc2.stop(now + 0.4);
    } catch {
      // Audio fallback
    }
  }

  public playFootstep(): void {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(100, now);
      osc.frequency.exponentialRampToValueAtTime(30, now + 0.07);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Audio fallback
    }
  }

  public playObjectiveComplete(): void {
    if (!this.ctx || this.isMuted) return;
    this.resumeContext();

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const noteOsc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        noteOsc.type = 'triangle';
        noteOsc.frequency.setValueAtTime(freq, now + idx * 0.09);

        noteGain.gain.setValueAtTime(0.06, now + idx * 0.09);
        noteGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.09 + 0.28);

        noteOsc.connect(noteGain);
        noteGain.connect(this.ctx.destination);

        noteOsc.start(now + idx * 0.09);
        noteOsc.stop(now + idx * 0.09 + 0.3);
      });
    } catch {
      // Audio fallback
    }
  }

  public playDoorThud(): void {
    if (!this.ctx || this.isMuted) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.12);

      gain.gain.setValueAtTime(0.07, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.12);
    } catch {
      // Audio fallback
    }
  }

  public dispose(): void {
    this.stopEngine();
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {
        // Ignored
      }
      this.ctx = null;
    }
  }
}

export const soundEffects = new SoundEffectsEngine();
