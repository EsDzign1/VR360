import { AmbianceType } from '../types';

class AudioSynthesizer {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private isPlaying = false;
  private currentAmbiance: AmbianceType = 'wind';
  private nodes: (AudioNode | number)[] = [];

  private init() {
    if (!this.ctx) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
  }

  public setVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(Math.max(0, Math.min(1, vol * 0.4)), this.ctx.currentTime, 0.05);
    }
  }

  public play(ambiance: AmbianceType = 'wind', volume: number = 0.5) {
    this.init();
    if (!this.ctx || !this.masterGain) return;

    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }

    this.stop();
    this.isPlaying = true;
    this.currentAmbiance = ambiance;
    this.setVolume(volume);

    const now = this.ctx.currentTime;

    if (ambiance === 'synth') {
      // Lush cyberpunk synth pad (Two detuned saw/triangle oscillators through a warm lowpass filter)
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(110, now); // A2
      osc2.frequency.setValueAtTime(164.81, now); // E3

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.Q.setValueAtTime(3, now);

      lfo.frequency.setValueAtTime(0.2, now);
      lfoGain.gain.setValueAtTime(150, now);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      lfo.start(now);

      this.nodes.push(osc1, osc2, filter, lfo, lfoGain);
    } else if (ambiance === 'cosmic') {
      // Cosmic drone with deep sub bass and ethereal sine shimmer
      const subOsc = this.ctx.createOscillator();
      const highOsc = this.ctx.createOscillator();
      const highGain = this.ctx.createGain();

      subOsc.type = 'sine';
      subOsc.frequency.setValueAtTime(65.41, now); // C2

      highOsc.type = 'sine';
      highOsc.frequency.setValueAtTime(523.25, now); // C5
      highGain.gain.setValueAtTime(0.08, now);

      subOsc.connect(this.masterGain);
      highOsc.connect(highGain);
      highGain.connect(this.masterGain);

      subOsc.start(now);
      highOsc.start(now);

      this.nodes.push(subOsc, highOsc, highGain);
    } else {
      // Default: Atmospheric spatial wind (Pink noise through lowpass filter with slow sweeping LFO)
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        output[i] *= 0.11;
        b6 = white * 0.115926;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, now);
      filter.Q.setValueAtTime(1.5, now);

      const lfo = this.ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.12, now);
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.setValueAtTime(120, now);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);

      whiteNoise.connect(filter);
      filter.connect(this.masterGain);

      whiteNoise.start(now);
      lfo.start(now);

      this.nodes.push(whiteNoise, filter, lfo, lfoGain);
    }
  }

  public stop() {
    this.nodes.forEach((node) => {
      if (typeof node !== 'number') {
        try {
          if ('stop' in node && typeof (node as any).stop === 'function') {
            (node as any).stop();
          }
          if ('disconnect' in node && typeof (node as any).disconnect === 'function') {
            (node as any).disconnect();
          }
        } catch {
          // ignore
        }
      }
    });
    this.nodes = [];
    this.isPlaying = false;
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const ambianceAudio = new AudioSynthesizer();
