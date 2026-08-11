/**
 * Sci-Fi Science Museum Web Audio Synthesizer
 * Generates procedural audio effects for height selection, arming, countdowns,
 * disengage solenoid release, free fall wind layers, electromagnetic eddy current braking,
 * mechanical base landing impact, and telemetry completion chimes.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;
  private noiseBuffer: AudioBuffer | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Helper to generate filtered noise for subtle air-rush/wind
  private getNoiseBuffer(): AudioBuffer | null {
    if (!this.ctx) return null;
    if (this.noiseBuffer) return this.noiseBuffer;

    const bufferSize = this.ctx.sampleRate * 2; // 2 seconds of noise
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    this.noiseBuffer = buffer;
    return buffer;
  }

  // 1. Height selection click: crisp dual-tone mechanical tick
  playHeightSelect() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.04);
  }

  // 2. Experiment arming: heavy mechanical latch / solenoid lock
  playArmLatch() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Sub click
    const osc1 = this.ctx.createOscillator();
    const gain1 = this.ctx.createGain();
    osc1.type = 'triangle';
    osc1.frequency.setValueAtTime(240, now);
    osc1.frequency.exponentialRampToValueAtTime(60, now + 0.12);
    gain1.gain.setValueAtTime(0.2, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    osc1.connect(gain1);
    gain1.connect(this.ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.12);

    // High metal click
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1800, now + 0.02);
    osc2.frequency.exponentialRampToValueAtTime(900, now + 0.08);
    gain2.gain.setValueAtTime(0.1, now + 0.02);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc2.connect(gain2);
    gain2.connect(this.ctx.destination);
    osc2.start(now + 0.02);
    osc2.stop(now + 0.08);
  }

  // 3. Play countdown tick/beep
  playCountdownBeep(frequency = 880, isFinal = false) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isFinal ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(frequency, now);

    if (isFinal) {
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.25);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    } else {
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    }

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + (isFinal ? 0.35 : 0.12));
  }

  // 4. Release latch: mechanical disengage + magnetic clunk
  playReleaseLatch() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Sub bass thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(35, now + 0.22);
    gain.gain.setValueAtTime(0.25, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + 0.25);

    // Mechanical air click
    const nBuf = this.getNoiseBuffer();
    if (nBuf) {
      const src = this.ctx.createBufferSource();
      const filter = this.ctx.createBiquadFilter();
      const nGain = this.ctx.createGain();

      src.buffer = nBuf;
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(2500, now);
      filter.Q.setValueAtTime(3.0, now);

      nGain.gain.setValueAtTime(0.08, now);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

      src.connect(filter);
      filter.connect(nGain);
      nGain.connect(this.ctx.destination);

      src.start(now);
      src.stop(now + 0.15);
    }
  }

  // 5. Subtle free fall air rush
  playFreefallAirRush(velocityRatio: number) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const nBuf = this.getNoiseBuffer();
    if (!nBuf) return;

    const now = this.ctx.currentTime;
    const src = this.ctx.createBufferSource();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    src.buffer = nBuf;
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300 + velocityRatio * 800, now);

    const volume = Math.min(0.06, Math.max(0.01, velocityRatio * 0.05));
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    src.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    src.start(now);
    src.stop(now + 0.08);
  }

  // 6. Magnetic eddy brake engagement resonance (violet / electromagnetic physics hum)
  playBrakeEngage(gForce: number = 3.0) {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Harmonic electromagnetic sine/saw hum
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const baseFreq = 120 + Math.min(180, gForce * 25);
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(baseFreq, now);
    osc1.frequency.exponentialRampToValueAtTime(60, now + 0.25);

    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(baseFreq * 1.5, now);
    osc2.frequency.exponentialRampToValueAtTime(90, now + 0.25);

    const vol = Math.min(0.18, Math.max(0.05, (gForce / 4.0) * 0.15));
    gain.gain.setValueAtTime(vol, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.28);
    osc2.stop(now + 0.28);
  }

  // 7. Mechanical base landing impact
  playLandingImpact() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Deep hydraulic bump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.3);

    gain.gain.setValueAtTime(0.28, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.35);

    // Subtle pneumatic hiss release
    const nBuf = this.getNoiseBuffer();
    if (nBuf) {
      const src = this.ctx.createBufferSource();
      const filter = this.ctx.createBiquadFilter();
      const nGain = this.ctx.createGain();

      src.buffer = nBuf;
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1200, now);

      nGain.gain.setValueAtTime(0.06, now);
      nGain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      src.connect(filter);
      filter.connect(nGain);
      nGain.connect(this.ctx.destination);

      src.start(now);
      src.stop(now + 0.25);
    }
  }

  // 8. Play science exhibit completion chime
  playCompleteChime() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 chord
    freqs.forEach((f, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, this.ctx.currentTime + idx * 0.07);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime + idx * 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.07 + 0.55);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(this.ctx.currentTime + idx * 0.07);
      osc.stop(this.ctx.currentTime + idx * 0.07 + 0.55);
    });
  }

  // 9. Standard UI button tap
  playButtonTap() {
    if (!this.enabled) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(650, now);
    osc.frequency.exponentialRampToValueAtTime(950, now + 0.04);

    gain.gain.setValueAtTime(0.07, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.05);
  }
}

export const soundFx = new SoundEngine();
