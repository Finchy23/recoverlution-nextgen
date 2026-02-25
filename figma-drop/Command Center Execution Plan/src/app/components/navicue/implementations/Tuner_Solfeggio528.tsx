/**
 * TUNER #9 — The Solfeggio 528 (Repair)
 * "The universe has a tuning pitch. Resonate with the green frequency."
 * ARCHETYPE: Pattern D (Type) — Type "528" to tune to the repair frequency
 * ENTRY: Scene-First — a pure green light already glowing
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TUNER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'Practice');
type Stage = 'scene' | 'active' | 'resonant' | 'afterglow';

export default function Tuner_Solfeggio528({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const audioRef = useRef<{ ctx: AudioContext; osc: OscillatorNode; gain: GainNode } | null>(null);

  const startTone = () => {
    if (audioRef.current) return;
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 528;
      gain.gain.value = 0;
      gain.gain.setTargetAtTime(0.12, ctx.currentTime, 0.8); // gentle fade in
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      audioRef.current = { ctx, osc, gain };
    } catch {}
  };

  const stopTone = () => {
    if (audioRef.current) {
      audioRef.current.gain.gain.setTargetAtTime(0, audioRef.current.ctx.currentTime, 0.5);
      const ref = audioRef.current;
      setTimeout(() => { try { ref.osc.stop(); ref.ctx.close(); } catch {} }, 800);
      audioRef.current = null;
    }
  };

  const typeInt = useTypeInteraction({
    minLength: 3,
    onAccept: () => {
      // Play the tone when the user types the frequency
      startTone();
      t(() => { stopTone(); setStage('resonant'); }, 3000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 8500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => { T.current.forEach(clearTimeout); stopTone(); };
  }, []);

  const greenIntensity = typeInt.value.length > 0 ? 0.08 + typeInt.value.length * 0.03 : 0.04;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div
              animate={{ opacity: [0.04, 0.08, 0.04] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                width: '140px', height: '140px', borderRadius: '50%',
                background: 'radial-gradient(circle, hsla(140, 25%, 35%, 0.12), hsla(140, 15%, 20%, 0.02))',
              }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1 }}
              style={{ ...navicueType.hint, color: palette.textFaint, fontStyle: 'italic' }}>528Hz {'\u00B7'} the green frequency</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              The universe has a tuning pitch. Return to the center. Resonate with the green frequency. Type the number that repairs.
            </div>
            <motion.div
              animate={{ opacity: [greenIntensity, greenIntensity + 0.03, greenIntensity] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                width: '120px', height: '120px', borderRadius: '50%',
                background: `radial-gradient(circle, hsla(140, 30%, 38%, ${greenIntensity + 0.08}), hsla(140, 15%, 20%, 0.02))`,
              }} />
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: themeColor(TH.primaryHSL, 0.04, 2),
              borderRadius: radius.sm, padding: '8px 16px',
              border: `1px solid ${themeColor(TH.accentHSL, 0.06, 5)}`,
            }}>
              <input
                type="text"
                value={typeInt.value}
                onChange={e => typeInt.onChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && typeInt.submit()}
                placeholder="the frequency"
                maxLength={10}
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  color: palette.text, fontSize: '14px', fontFamily: 'monospace',
                  width: '120px', textAlign: 'center',
                }}
              />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
              {typeInt.value.length < 3 ? 'type the frequency' : 'press enter'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Vibroacoustic Therapy. While {'\u201C'}DNA repair{'\u201D'} claims are pseudo-scientific, specific low-frequency sound vibrations have been shown to improve circulation, reduce pain, and increase cellular metabolism. The number matters less than the intention. You tuned yourself to repair.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Tuned.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}