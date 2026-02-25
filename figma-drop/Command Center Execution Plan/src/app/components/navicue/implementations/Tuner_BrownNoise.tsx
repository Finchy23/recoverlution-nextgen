/**
 * TUNER #7 — The Brown Noise Blanket
 * "The world is too sharp. Wrap your brain in a heavy blanket of sound."
 * ARCHETYPE: Pattern B (Drag) — Drag the blanket down over the sharp spikes
 * ENTRY: Ambient Fade — grainy static texture slowly fills from edges
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TUNER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useDragInteraction } from '../interactions/useDragInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'ambient' | 'active' | 'resonant' | 'afterglow';

// Pre-compute random spike heights for the "sharp sounds"
const SPIKES = Array.from({ length: 20 }, () => Math.random() * 50 + 10);

export default function Tuner_BrownNoise({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('ambient');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const audioRef = useRef<{ ctx: AudioContext; source: AudioBufferSourceNode; gain: GainNode } | null>(null);

  const startBrownNoise = (volume: number) => {
    if (audioRef.current) {
      audioRef.current.gain.gain.setTargetAtTime(volume, audioRef.current.ctx.currentTime, 0.1);
      return;
    }
    try {
      const ctx = new AudioContext();
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + (0.02 * white)) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5; // compensate for volume loss
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      const gain = ctx.createGain();
      gain.gain.value = 0;
      gain.gain.setTargetAtTime(volume, ctx.currentTime, 0.3);
      source.connect(gain).connect(ctx.destination);
      source.start();
      audioRef.current = { ctx, source, gain };
    } catch {}
  };

  const stopBrownNoise = () => {
    if (audioRef.current) {
      audioRef.current.gain.gain.setTargetAtTime(0, audioRef.current.ctx.currentTime, 0.5);
      const ref = audioRef.current;
      setTimeout(() => { try { ref.source.stop(); ref.ctx.close(); } catch {} }, 800);
      audioRef.current = null;
    }
  };

  const drag = useDragInteraction({
    axis: 'y',
    sticky: true,
    onThreshold: (progress) => startBrownNoise(progress * 0.2),
    onComplete: () => {
      t(() => stopBrownNoise(), 3000);
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2600);
    return () => { T.current.forEach(clearTimeout); stopBrownNoise(); };
  }, []);

  const progress = drag.progress;
  const blanketY = progress * 100; // percentage covered

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'ambient' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div
              animate={{ opacity: [0.03, 0.06, 0.03] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                width: '180px', height: '100px', borderRadius: radius.sm,
                background: `repeating-linear-gradient(0deg, ${themeColor(TH.primaryHSL, 0.02, 0)} 0px, ${themeColor(TH.primaryHSL, 0.04, 3)} 1px, transparent 2px)`,
              }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.25 }} transition={{ delay: 1.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>too sharp</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              The world is too sharp. Wrap your brain in a heavy blanket of sound. Smooth the spikes. Drag the blanket down.
            </div>
            <div style={{ position: 'relative', width: '220px', height: '120px', borderRadius: radius.sm, overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, 2) }}>
              {/* Sharp sound spikes */}
              <svg width="220" height="120" viewBox="0 0 220 120" style={{ position: 'absolute', top: 0, left: 0 }}>
                {SPIKES.map((h, i) => (
                  <rect key={i} x={i * 11 + 2} y={120 - h} width="3" height={h}
                    fill={themeColor(TH.accentHSL, 0.15 * (1 - progress * 0.8), 10)}
                    rx="1" />
                ))}
              </svg>
              {/* Brown noise blanket covering from top */}
              <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%',
                height: `${blanketY}%`,
                background: `linear-gradient(to bottom, ${themeColor(TH.primaryHSL, 0.12, 5)}, ${themeColor(TH.primaryHSL, 0.08, 3)})`,
                transition: 'height 0.15s',
                borderBottom: `1px solid ${themeColor(TH.accentHSL, 0.06, 5)}`,
              }} />
            </div>
            <div {...drag.dragProps} style={{
              ...drag.dragProps.style,
              width: '60px', height: '100px', borderRadius: radius.full, position: 'relative',
              background: themeColor(TH.primaryHSL, 0.04, 3),
            }}>
              <motion.div
                style={{
                  position: 'absolute', left: '12px', top: `${10 + progress * 50}px`,
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.1 + progress * 0.12, 8),
                  pointerEvents: 'none',
                }} />
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Stochastic Resonance. Brown noise decreases in intensity by 6dB per octave, effectively masking high-frequency distractions. Neurodivergent brains particularly benefit {';'} the blanket doesn{'\u2019'}t silence the world, it softens the edges until the signal can emerge from the noise.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Blanketed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}