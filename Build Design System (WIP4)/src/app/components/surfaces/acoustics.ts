/**
 * ACOUSTIC MATERIALITY — The Sound of Glass
 *
 * §12: "The OS needs micro-acoustic rules, not just Play.
 * Sound should confirm weight, drag, release, and receipt."
 *
 * Every interaction has a material sound:
 *   Tick    — the lightest glass contact
 *   Weight  — hold-building pressure (rising tone)
 *   Resolve — the snap moment (crystalline ping)
 *   Seal    — the stamp of completion (deep resonant thud)
 *   Drift   — ambient background tone for stream particles
 *
 * All sounds are generated via Web Audio API oscillators —
 * no external files. The glass makes its own sound.
 *
 * Sounds respect Temperature governance:
 *   Band 0-1: all sounds active
 *   Band 2: reduced volume, no drift
 *   Band 3: resolve and seal only
 *   Band 4: silence (the glass goes mute)
 */

let audioCtx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let _enabled = false;
let _volume = 0.12; // Quiet. The glass whispers.

function getContext(): AudioContext | null {
  if (!_enabled) return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = _volume;
      masterGain.connect(audioCtx.destination);
    } catch {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function getMasterGain(): GainNode | null {
  getContext();
  return masterGain;
}

// ═══════════════════════════════════════════════════
// PUBLIC API
// ═══════════════════════════════════════════════════

/** Enable or disable the acoustic system */
export function setAcousticsEnabled(enabled: boolean) {
  _enabled = enabled;
}

/** Set master volume (0-1) */
export function setAcousticsVolume(vol: number) {
  _volume = Math.max(0, Math.min(1, vol));
  if (masterGain) {
    masterGain.gain.value = _volume;
  }
}

/** Check if acoustics are enabled */
export function isAcousticsEnabled(): boolean {
  return _enabled;
}

// ═══════════════════════════════════════════════════
// MICRO-SOUNDS
// ═══════════════════════════════════════════════════

/**
 * Tick — lightest glass contact
 * A microscopic sine ping at high frequency, very short decay
 */
export function acousticTick() {
  const ctx = getContext();
  const gain = getMasterGain();
  if (!ctx || !gain) return;

  const osc = ctx.createOscillator();
  const g = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.value = 2400;
  g.gain.setValueAtTime(0.15, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);

  osc.connect(g);
  g.connect(gain);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.05);
}

/**
 * Weight — building hold pressure
 * A rising sine tone that increases in frequency and volume with intensity (0-1)
 */
export function acousticWeight(intensity: number) {
  const ctx = getContext();
  const gain = getMasterGain();
  if (!ctx || !gain) return;

  const osc = ctx.createOscillator();
  const g = ctx.createGain();

  osc.type = 'sine';
  // Frequency rises with intensity: 180Hz → 440Hz
  osc.frequency.value = 180 + intensity * 260;
  const vol = 0.03 + intensity * 0.08;
  g.gain.setValueAtTime(vol, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

  osc.connect(g);
  g.connect(gain);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.1);
}

/**
 * Resolve — the crystalline snap
 * A sharp attack sine with harmonic overtone, medium decay
 */
export function acousticResolve() {
  const ctx = getContext();
  const gain = getMasterGain();
  if (!ctx || !gain) return;

  // Fundamental
  const osc1 = ctx.createOscillator();
  const g1 = ctx.createGain();
  osc1.type = 'sine';
  osc1.frequency.value = 880;
  g1.gain.setValueAtTime(0.2, ctx.currentTime);
  g1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
  osc1.connect(g1);
  g1.connect(gain);
  osc1.start(ctx.currentTime);
  osc1.stop(ctx.currentTime + 0.35);

  // Harmonic overtone (5th)
  const osc2 = ctx.createOscillator();
  const g2 = ctx.createGain();
  osc2.type = 'sine';
  osc2.frequency.value = 1320; // Perfect fifth above
  g2.gain.setValueAtTime(0.08, ctx.currentTime);
  g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
  osc2.connect(g2);
  g2.connect(gain);
  osc2.start(ctx.currentTime);
  osc2.stop(ctx.currentTime + 0.25);
}

/**
 * Seal — the deep stamp of completion
 * A low-frequency thud with slow decay
 */
export function acousticSeal() {
  const ctx = getContext();
  const gain = getMasterGain();
  if (!ctx || !gain) return;

  // Deep thud
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(220, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.4); // Pitch drops
  g.gain.setValueAtTime(0.25, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
  osc.connect(g);
  g.connect(gain);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.55);

  // Crystalline overtone (delayed)
  const osc2 = ctx.createOscillator();
  const g2 = ctx.createGain();
  osc2.type = 'triangle';
  osc2.frequency.value = 660;
  g2.gain.setValueAtTime(0, ctx.currentTime);
  g2.gain.setValueAtTime(0.06, ctx.currentTime + 0.15);
  g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
  osc2.connect(g2);
  g2.connect(gain);
  osc2.start(ctx.currentTime);
  osc2.stop(ctx.currentTime + 0.65);
}

/**
 * Drift — ambient background tone for stream particles
 * A very quiet, slow triangle wave. Barely audible.
 */
export function acousticDrift() {
  const ctx = getContext();
  const gain = getMasterGain();
  if (!ctx || !gain) return;

  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = 140 + Math.random() * 60;
  g.gain.setValueAtTime(0.02, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
  osc.connect(g);
  g.connect(gain);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 1.6);
}

/**
 * Mode shift — the sound of changing state
 * A descending then ascending sweep (like a breath)
 */
export function acousticModeShift() {
  const ctx = getContext();
  const gain = getMasterGain();
  if (!ctx || !gain) return;

  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'sine';
  // Descend then ascend — like a sigh
  osc.frequency.setValueAtTime(440, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(220, ctx.currentTime + 0.2);
  osc.frequency.exponentialRampToValueAtTime(330, ctx.currentTime + 0.4);
  g.gain.setValueAtTime(0.1, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
  osc.connect(g);
  g.connect(gain);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.5);
}

/**
 * Corridor — the sound of the talk surface
 * A hollow, resonant tone. Like an echo in a tunnel.
 */
export function acousticCorridor() {
  const ctx = getContext();
  const gain = getMasterGain();
  if (!ctx || !gain) return;

  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.value = 196; // G3
  g.gain.setValueAtTime(0.05, ctx.currentTime);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
  osc.connect(g);
  g.connect(gain);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.85);
}

// ═══════════════════════════════════════════════════
// GOVERNED ACOUSTICS — respects temperature band
// ═══════════════════════════════════════════════════

/**
 * Wrap any acoustic function with temperature governance.
 * Band 0-1: full
 * Band 2: reduced volume
 * Band 3: resolve + seal only
 * Band 4: silence
 */
export function governedAcoustic(
  band: number,
  type: 'tick' | 'weight' | 'resolve' | 'seal' | 'drift' | 'modeShift' | 'corridor',
  intensity?: number,
) {
  if (band >= 4) return; // Silence
  if (band >= 3 && type !== 'resolve' && type !== 'seal') return;

  // Reduce volume at band 2
  const prevVolume = _volume;
  if (band >= 2) {
    setAcousticsVolume(_volume * 0.5);
  }

  switch (type) {
    case 'tick': acousticTick(); break;
    case 'weight': acousticWeight(intensity ?? 0.5); break;
    case 'resolve': acousticResolve(); break;
    case 'seal': acousticSeal(); break;
    case 'drift': acousticDrift(); break;
    case 'modeShift': acousticModeShift(); break;
    case 'corridor': acousticCorridor(); break;
  }

  // Restore volume
  if (band >= 2) {
    setTimeout(() => setAcousticsVolume(prevVolume), 100);
  }
}
