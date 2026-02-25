/**
 * TUNER #4 — The Vagal Hum
 * "The vagus nerve passes through the vocal cords. Hum until your lips buzz."
 * ARCHETYPE: Pattern E (Hold) — Hold to sustain the hum, vibration visualizer responds
 * ENTRY: Scene-First — a resonant sine wave appears, already vibrating
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TUNER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useHoldInteraction } from '../interactions/useHoldInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'scene' | 'active' | 'resonant' | 'afterglow';

export default function Tuner_VagalHum({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const [wavePhase, setWavePhase] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const audioRef = useRef<{ ctx: AudioContext; osc: OscillatorNode; gain: GainNode } | null>(null);

  const startAudio = () => {
    if (audioRef.current) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 120; // 120Hz vagal-range hum
      gain.gain.value = 0;
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      audioRef.current = { ctx, osc, gain };
    } catch {}
  };

  const updateAudioGain = (tension: number) => {
    if (audioRef.current) {
      audioRef.current.gain.gain.setTargetAtTime(tension * 0.15, audioRef.current.ctx.currentTime, 0.1);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.gain.gain.setTargetAtTime(0, audioRef.current.ctx.currentTime, 0.3);
      const ref = audioRef.current;
      setTimeout(() => { try { ref.osc.stop(); ref.ctx.close(); } catch {} }, 500);
      audioRef.current = null;
    }
  };

  const hold = useHoldInteraction({
    maxDuration: 7000,
    onThreshold: (tension) => updateAudioGain(tension),
    onComplete: () => {
      stopAudio();
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  // Start audio when hold begins, stop when released early
  useEffect(() => {
    if (hold.isHolding) startAudio();
    if (!hold.isHolding && !hold.completed) stopAudio();
  }, [hold.isHolding, hold.completed]);

  useEffect(() => {
    if (hold.isHolding) updateAudioGain(hold.tension);
  }, [hold.tension, hold.isHolding]);

  useEffect(() => {
    t(() => setStage('active'), 2200);
    const wave = setInterval(() => setWavePhase(p => p + 0.15), 50);
    return () => { T.current.forEach(clearTimeout); clearInterval(wave); stopAudio(); };
  }, []);

  const tension = hold.tension;
  const amplitude = 8 + tension * 20;
  const freq = 0.04 + tension * 0.02;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <svg width="220" height="60" viewBox="0 0 220 60" style={{ overflow: 'visible' }}>
              <path
                d={`M0,30 ${Array.from({ length: 22 }, (_, i) => `Q${i * 10 + 5},${30 + Math.sin(wavePhase + i * 0.5) * 6} ${(i + 1) * 10},30`).join(' ')}`}
                fill="none" stroke={themeColor(TH.accentHSL, 0.1, 8)} strokeWidth="1.5" />
            </svg>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1 }}
              style={{ ...navicueType.hint, color: palette.textFaint, fontStyle: 'italic' }}>120Hz {'\u00B7'} already humming</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              The vagus nerve passes through the vocal cords. Vibration massages the nerve. Hum along {';'} a low, steady tone in your chest. Feel it buzz in your lips. Hold until the wave fills.
            </div>
            <svg width="240" height="80" viewBox="0 0 240 80" style={{ overflow: 'visible' }}>
              <path
                d={`M0,40 ${Array.from({ length: 24 }, (_, i) => {
                  const y = 40 + Math.sin(wavePhase + i * freq * 10) * amplitude;
                  return `Q${i * 10 + 5},${y} ${(i + 1) * 10},40`;
                }).join(' ')}`}
                fill="none" stroke={themeColor(TH.accentHSL, 0.1 + tension * 0.15, 8)} strokeWidth={1.5 + tension * 1.5} />
              {/* Resonance nodes */}
              {[60, 120, 180].map((x, i) => (
                <circle key={i} cx={x} cy={40} r={3 + tension * 4}
                  fill={themeColor(TH.accentHSL, 0.05 + tension * 0.1, 10)} />
              ))}
            </svg>
            <div {...hold.holdProps} style={{
              ...hold.holdProps.style,
              padding: '14px 28px', borderRadius: radius.full,
              background: themeColor(TH.primaryHSL, 0.06 + tension * 0.08, 5),
              border: `1px solid ${themeColor(TH.accentHSL, 0.08 + tension * 0.1, 5)}`,
            }}>
              <div style={{ ...navicueType.hint, color: palette.textFaint }}>
                {hold.completed ? 'resonating' : hold.isHolding ? 'humming\u2026' : 'hold to hum'}
              </div>
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Vagus Nerve Stimulation. Self-generated vocalization creates internal vibration that mechanically stimulates the vagus nerve, promoting parasympathetic activation. The hum is not meditation {';'} it{'\u2019'}s engineering. You just massaged the nerve that controls your calm.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Humming.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}