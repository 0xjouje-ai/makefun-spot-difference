// All sound in Twin Lanterns is synthesized live with the Web Audio API:
// short oscillator blips and filtered noise, no audio files at all. The
// audio context is created lazily on the first user gesture so browsers
// never block the game for autoplay.
export class SoundBank {
  constructor() {
    this.context = null;
    this.enabled = true;
    this.master = null;
  }

  ensure() {
    if (!this.context) {
      const Ctor = window.AudioContext || window.webkitAudioContext;
      if (!Ctor) return false;
      this.context = new Ctor();
      this.master = this.context.createGain();
      this.master.gain.value = 0.22;
      this.master.connect(this.context.destination);
    }
    if (this.context.state === 'suspended') void this.context.resume();
    return true;
  }

  toggle() {
    this.enabled = !this.enabled;
    return this.enabled;
  }

  // One short tone that slides from `from` to `to` hertz.
  tone(from, to, seconds, kind, when = 0) {
    if (!this.enabled || !this.ensure()) return;
    const t0 = this.context.currentTime + when;
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    osc.type = kind;
    osc.frequency.setValueAtTime(from, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, to), t0 + seconds);
    gain.gain.setValueAtTime(0.0001, t0);
    gain.gain.exponentialRampToValueAtTime(0.9, t0 + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + seconds);
    osc.connect(gain);
    gain.connect(this.master);
    osc.start(t0);
    osc.stop(t0 + seconds + 0.05);
  }

  // A burst of filtered noise, used for the soft "wrong click" thud.
  thud() {
    if (!this.enabled || !this.ensure()) return;
    const t0 = this.context.currentTime;
    const length = Math.floor(this.context.sampleRate * 0.12);
    const buffer = this.context.createBuffer(1, length, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1) data[i] = (Math.random() * 2 - 1) * (1 - i / length);
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    const filter = this.context.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 420;
    const gain = this.context.createGain();
    gain.gain.setValueAtTime(0.8, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.12);
    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.master);
    source.start(t0);
  }

  // A satisfying two-note pop when a difference is found.
  found() {
    this.tone(660, 990, 0.12, 'sine');
    this.tone(990, 1320, 0.16, 'sine', 0.07);
  }

  // A low buzz for a wrong click.
  wrong() {
    this.tone(180, 110, 0.18, 'square');
    this.thud();
  }

  // A rising arpeggio when a scene is completed.
  fanfare() {
    const notes = [523, 659, 784, 1047];
    notes.forEach((note, i) => this.tone(note, note, 0.22, 'triangle', i * 0.09));
    this.tone(1047, 1568, 0.4, 'sine', 0.38);
  }

  // A gentle two-note chime for a hint.
  hint() {
    this.tone(880, 880, 0.1, 'sine');
    this.tone(1175, 1175, 0.14, 'sine', 0.1);
  }

  // A soft tick in the last ten seconds.
  tick() {
    this.tone(1200, 1200, 0.05, 'sine');
  }
}
