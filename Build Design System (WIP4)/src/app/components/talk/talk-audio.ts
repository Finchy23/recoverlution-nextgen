/**
 * TALK AUDIO — Territory Drones
 *
 * Each constellation has a sonic character defined by
 * TERRITORY_FREQUENCIES. This module brings them to life
 * as ambient drones that crossfade as the user orbits
 * through the cosmos.
 *
 * The sound is not music. It is presence.
 * A low hum that shifts with the territory beneath you.
 * Barely perceptible. Never intrusive.
 *
 * Architecture:
 *   1. Shared AudioContext (singleton, user-gesture activated)
 *   2. One drone per territory (oscillator + harmonics + gain)
 *   3. Crossfade driven by nearestTerritory
 *   4. Envelope shaping per territory character
 *   5. Simple convolver for depth
 */

import { TERRITORY_FREQUENCIES, type TerritoryFrequency } from './talk-universe';

// ═══════════════════════════════════════════════════
// AUDIO CONTEXT SINGLETON
// ═══════════════════════════════════════════════════

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let isInitialized = false;

// Per-territory drone state
interface DroneState {
  conId: string;
  oscillators: OscillatorNode[];
  gains: GainNode[];
  envelopeGain: GainNode;
  lfo: OscillatorNode | null;
  lfoGain: GainNode | null;
  targetVolume: number;
  currentVolume: number;
  /** Richness multiplier based on illuminated star count (0..1) */
  richness: number;
}

const drones: Map<string, DroneState> = new Map();

// Master volume — extremely quiet, ambient presence
const MASTER_VOLUME = 0.06;
const DRONE_VOLUME = 0.35;
const CROSSFADE_TIME = 2.5; // seconds
const LFO_RATE = 0.08; // Hz — very slow breathing

// ═══════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════

function getContext(): AudioContext | null {
  if (audioCtx) return audioCtx;
  try {
    audioCtx = new AudioContext();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = MASTER_VOLUME;
    masterGain.connect(audioCtx.destination);
    return audioCtx;
  } catch {
    return null;
  }
}

function createImpulseResponse(ctx: AudioContext, duration: number, decay: number): AudioBuffer {
  const length = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(2, length, ctx.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return buffer;
}

let reverbNode: ConvolverNode | null = null;
let reverbGain: GainNode | null = null;

function ensureReverb(ctx: AudioContext): GainNode {
  if (reverbGain && reverbNode) return reverbGain;

  reverbNode = ctx.createConvolver();
  reverbNode.buffer = createImpulseResponse(ctx, 3, 2.5);

  reverbGain = ctx.createGain();
  reverbGain.gain.value = 0.3;
  reverbGain.connect(reverbNode);
  reverbNode.connect(masterGain!);

  return reverbGain;
}

// ═══════════════════════════════════════════════════
// DRONE CREATION
// ═══════════════════════════════════════════════════

function getOscillatorType(waveform: TerritoryFrequency['waveform']): OscillatorType {
  return waveform;
}

function createDrone(ctx: AudioContext, freq: TerritoryFrequency): DroneState {
  const envelopeGain = ctx.createGain();
  envelopeGain.gain.value = 0;

  // Connect to both dry (master) and wet (reverb)
  envelopeGain.connect(masterGain!);
  const reverb = ensureReverb(ctx);
  const reverbSend = ctx.createGain();
  reverbSend.gain.value = freq.reverbDepth * 0.5;
  envelopeGain.connect(reverbSend);
  reverbSend.connect(reverb);

  const oscillators: OscillatorNode[] = [];
  const gains: GainNode[] = [];

  // Create oscillator for each harmonic
  for (let i = 0; i < freq.harmonics.length; i++) {
    const harmonic = freq.harmonics[i];
    const osc = ctx.createOscillator();
    osc.type = getOscillatorType(freq.waveform);
    osc.frequency.value = freq.baseFreqHz * harmonic;

    // Higher harmonics are quieter
    const gain = ctx.createGain();
    const harmonicAmp = 1 / (harmonic * harmonic) * 0.7;
    gain.gain.value = harmonicAmp;

    // Slight detune for warmth (organic, not clinical)
    osc.detune.value = (Math.random() - 0.5) * 4;

    osc.connect(gain);
    gain.connect(envelopeGain);
    osc.start();

    oscillators.push(osc);
    gains.push(gain);
  }

  // Envelope LFO — breathing modulation
  let lfo: OscillatorNode | null = null;
  let lfoGain: GainNode | null = null;

  if (freq.envelope === 'breathing' || freq.envelope === 'sustained') {
    lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = freq.envelope === 'breathing' ? LFO_RATE * 1.2 : LFO_RATE * 0.6;

    lfoGain = ctx.createGain();
    lfoGain.gain.value = freq.envelope === 'breathing' ? 0.15 : 0.06;

    lfo.connect(lfoGain);
    lfoGain.connect(envelopeGain.gain);
    lfo.start();
  } else if (freq.envelope === 'bowed') {
    // Bowed: slow wavering
    lfo = ctx.createOscillator();
    lfo.type = 'triangle';
    lfo.frequency.value = LFO_RATE * 0.4;

    lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.1;

    lfo.connect(lfoGain);
    lfoGain.connect(envelopeGain.gain);
    lfo.start();
  } else if (freq.envelope === 'plucked') {
    // Plucked: subtle tremolo
    lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = LFO_RATE * 3;

    lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.04;

    lfo.connect(lfoGain);
    lfoGain.connect(envelopeGain.gain);
    lfo.start();
  }

  return {
    conId: freq.conId,
    oscillators,
    gains,
    envelopeGain,
    lfo,
    lfoGain,
    targetVolume: 0,
    currentVolume: 0,
    richness: 0,
  };
}

// ═══════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════

/**
 * Initialize the audio layer. Must be called from a user gesture.
 * Returns true if successfully initialized.
 */
export function initAudio(): boolean {
  const ctx = getContext();
  if (!ctx) return false;

  // Resume if suspended (browser autoplay policy)
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  if (isInitialized) return true;

  // Create all territory drones (silent initially)
  for (const freq of TERRITORY_FREQUENCIES) {
    if (!drones.has(freq.conId)) {
      const drone = createDrone(ctx, freq);
      drones.set(freq.conId, drone);
    }
  }

  isInitialized = true;
  return true;
}

/**
 * Set the active territory. Crossfades the drone for this
 * territory up and all others down.
 * Pass null for no territory (ambient silence).
 */
export function setActiveTerritory(conId: string | null): void {
  if (!audioCtx || !isInitialized) return;

  const now = audioCtx.currentTime;

  for (const [id, drone] of drones) {
    // Richness scales the drone volume: more illuminated stars = fuller presence
    // Base volume is 60%, richness adds up to 40% more
    const richnessScale = 0.6 + 0.4 * drone.richness;
    const target = id === conId ? DRONE_VOLUME * richnessScale : 0;
    if (Math.abs(drone.targetVolume - target) < 0.001) continue;

    drone.targetVolume = target;
    drone.envelopeGain.gain.cancelScheduledValues(now);
    drone.envelopeGain.gain.setValueAtTime(drone.envelopeGain.gain.value, now);
    drone.envelopeGain.gain.linearRampToValueAtTime(target, now + CROSSFADE_TIME);

    // When richness is high, allow higher harmonics to breathe louder
    if (id === conId) {
      for (let gi = 0; gi < drone.gains.length; gi++) {
        const freq = TERRITORY_FREQUENCIES.find(f => f.conId === id);
        if (!freq) continue;
        const harmonic = freq.harmonics[gi] || 1;
        // Base harmonic amplitude, boosted by richness for upper partials
        const baseAmp = 1 / (harmonic * harmonic) * 0.7;
        const richBoost = gi > 0 ? 1 + drone.richness * 0.5 : 1;
        drone.gains[gi].gain.cancelScheduledValues(now);
        drone.gains[gi].gain.setValueAtTime(drone.gains[gi].gain.value, now);
        drone.gains[gi].gain.linearRampToValueAtTime(baseAmp * richBoost, now + CROSSFADE_TIME);
      }
    }
  }
}

/**
 * Update territory richness weights based on illuminated star counts.
 * Pass a map of conId -> fraction (0..1) where 1 means all stars lit.
 * This shapes how full each drone sounds when active.
 */
export function setTerritoryWeights(weights: Record<string, number>): void {
  for (const [conId, weight] of Object.entries(weights)) {
    const drone = drones.get(conId);
    if (drone) {
      drone.richness = Math.max(0, Math.min(1, weight));
    }
  }
}

/**
 * Set master volume (0..1).
 */
export function setMasterVolume(volume: number): void {
  if (!masterGain || !audioCtx) return;
  const clamped = Math.max(0, Math.min(1, volume));
  const now = audioCtx.currentTime;
  // Smooth ramp to avoid clicks — 0.15s transition feels organic
  masterGain.gain.cancelScheduledValues(now);
  masterGain.gain.setValueAtTime(masterGain.gain.value, now);
  masterGain.gain.linearRampToValueAtTime(clamped * MASTER_VOLUME, now + 0.15);
}

/**
 * Mute/unmute all drones.
 */
export function setMuted(muted: boolean): void {
  if (!masterGain || !audioCtx) return;
  const now = audioCtx.currentTime;
  masterGain.gain.cancelScheduledValues(now);
  masterGain.gain.setValueAtTime(masterGain.gain.value, now);
  masterGain.gain.linearRampToValueAtTime(muted ? 0 : MASTER_VOLUME, now + 0.5);
}

/**
 * Play a brief inscription tone — a gentle chime when a star illuminates.
 * Uses the territory's base frequency with a quick plucked envelope.
 */
export function playInscriptionTone(conId: string): void {
  if (!audioCtx || !isInitialized || !masterGain) return;

  const freq = TERRITORY_FREQUENCIES.find(f => f.conId === conId);
  if (!freq) return;

  const now = audioCtx.currentTime;

  // Two oscillators: fundamental + octave above
  const osc1 = audioCtx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = freq.baseFreqHz * 2; // octave above for brightness

  const osc2 = audioCtx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = freq.baseFreqHz * 3; // fifth above the octave

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 3);

  osc1.connect(gain);
  osc2.connect(gain);
  gain.connect(masterGain);

  // Also send to reverb for shimmer
  const reverb = ensureReverb(audioCtx);
  const reverbSend = audioCtx.createGain();
  reverbSend.gain.value = 0.4;
  gain.connect(reverbSend);
  reverbSend.connect(reverb);

  osc1.start(now);
  osc2.start(now);
  osc1.stop(now + 3.5);
  osc2.stop(now + 3.5);

  // Cleanup
  setTimeout(() => {
    osc1.disconnect();
    osc2.disconnect();
    gain.disconnect();
    reverbSend.disconnect();
  }, 4000);
}

/**
 * Play a harmonic consonance tone when two territories resonate.
 * A brief dyad of their base frequencies.
 */
export function playConsonanceTone(conIdA: string, conIdB: string): void {
  if (!audioCtx || !isInitialized || !masterGain) return;

  const freqA = TERRITORY_FREQUENCIES.find(f => f.conId === conIdA);
  const freqB = TERRITORY_FREQUENCIES.find(f => f.conId === conIdB);
  if (!freqA || !freqB) return;

  const now = audioCtx.currentTime;

  // Territory A: fundamental
  const osc1 = audioCtx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = freqA.baseFreqHz;

  // Territory B: fundamental, slightly delayed entrance
  const osc2 = audioCtx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = freqB.baseFreqHz;

  // Harmonic bridge between territories — slides from A's fifth to B's fifth
  const osc3 = audioCtx.createOscillator();
  osc3.type = 'triangle';
  // Bridge starts at territory A's fifth, slides to territory B's fifth
  const bridgeStartFreq = freqA.baseFreqHz * 1.5;
  const bridgeEndFreq = freqB.baseFreqHz * 1.5;
  osc3.frequency.setValueAtTime(bridgeStartFreq, now + 0.3);
  // Slow glide across the full transition — arrives at B's harmonic as A fades
  osc3.frequency.exponentialRampToValueAtTime(bridgeEndFreq, now + 3.5);

  // Dry gain — slow swell, long tail
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(0.035, now + 0.5);
  gain.gain.linearRampToValueAtTime(0.035, now + 2.5);
  gain.gain.exponentialRampToValueAtTime(0.001, now + 5);

  // Bridge tone enters later, quieter
  const bridgeGain = audioCtx.createGain();
  bridgeGain.gain.setValueAtTime(0, now);
  bridgeGain.gain.linearRampToValueAtTime(0, now + 0.3);
  bridgeGain.gain.linearRampToValueAtTime(0.02, now + 0.8);
  bridgeGain.gain.exponentialRampToValueAtTime(0.001, now + 4);

  osc1.connect(gain);
  osc2.connect(gain);
  osc3.connect(bridgeGain);
  gain.connect(masterGain);
  bridgeGain.connect(masterGain);

  // Reverb send for spatial depth
  const reverb = ensureReverb(audioCtx);
  const reverbSend = audioCtx.createGain();
  reverbSend.gain.value = 0.5;
  gain.connect(reverbSend);
  bridgeGain.connect(reverbSend);
  reverbSend.connect(reverb);

  osc1.start(now);
  osc2.start(now + 0.15); // B enters a breath after A
  osc3.start(now + 0.3);
  osc1.stop(now + 5.5);
  osc2.stop(now + 5.5);
  osc3.stop(now + 4.5);

  setTimeout(() => {
    osc1.disconnect();
    osc2.disconnect();
    osc3.disconnect();
    gain.disconnect();
    bridgeGain.disconnect();
    reverbSend.disconnect();
  }, 6000);
}

/**
 * Teardown — stop all oscillators and close context.
 */
export function destroyAudio(): void {
  for (const [, drone] of drones) {
    for (const osc of drone.oscillators) {
      try { osc.stop(); osc.disconnect(); } catch { /* already stopped */ }
    }
    for (const g of drone.gains) {
      try { g.disconnect(); } catch { /* ok */ }
    }
    if (drone.lfo) { try { drone.lfo.stop(); drone.lfo.disconnect(); } catch { /* ok */ } }
    if (drone.lfoGain) { try { drone.lfoGain.disconnect(); } catch { /* ok */ } }
    try { drone.envelopeGain.disconnect(); } catch { /* ok */ }
  }
  drones.clear();

  if (reverbNode) { try { reverbNode.disconnect(); } catch { /* ok */ } reverbNode = null; }
  if (reverbGain) { try { reverbGain.disconnect(); } catch { /* ok */ } reverbGain = null; }
  if (masterGain) { try { masterGain.disconnect(); } catch { /* ok */ } masterGain = null; }

  if (audioCtx) {
    audioCtx.close().catch(() => {});
    audioCtx = null;
  }

  isInitialized = false;
}

/**
 * Check if audio is currently active.
 */
export function isAudioActive(): boolean {
  return isInitialized && audioCtx !== null && audioCtx.state === 'running';
}