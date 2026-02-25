/**
 * OMEGA #4 — The Symphony (Harmonic Resonance)
 * Every Voice you have met sings a single chord. Balance the choir.
 * STEALTH KBE: Balancing the choir = Self-Harmony (B)
 * Web: Tap to balance voice volumes
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { UNITY_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('sacred_ordinary', 'Internal Family Systems', 'believing', 'Cosmos');
type Stage = 'arriving' | 'choir' | 'harmony' | 'resonant' | 'afterglow';

const VOICES = [
  { name: 'The Stoic', hue: 220 },
  { name: 'The Child', hue: 45 },
  { name: 'The Warrior', hue: 0 },
  { name: 'The Sage', hue: 270 },
  { name: 'The Lover', hue: 340 },
];

export default function Unity_Symphony({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [volumes, setVolumes] = useState(() => VOICES.map(() => 0.2 + Math.random() * 0.6));
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('choir'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const adjustVolume = (index: number) => {
    if (stage !== 'choir') return;
    const next = [...volumes];
    next[index] = Math.min(1, next[index] + 0.15);
    // Normalize toward balance
    const avg = next.reduce((s, v) => s + v, 0) / next.length;
    const variance = next.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / next.length;
    setVolumes(next);
    if (variance < 0.02 && avg > 0.5) {
      console.log(`[KBE:B] Symphony balanced=true selfHarmony=true variance=${variance.toFixed(3)}`);
      setStage('harmony');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 13000);
    }
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Internal Family Systems" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.1 }} exit={{ opacity: 0 }}>
            <div style={{ width: '30px', height: '4px', background: themeColor(TH.accentHSL, 0.05, 2) }} />
          </motion.div>
        )}
        {stage === 'choir' && (
          <motion.div key="ch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The choir is assembled. No voice is exiled. Tap each voice to balance the harmony.
            </div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
              {VOICES.map((v, i) => (
                <motion.div key={v.name} whileTap={{ scale: 0.9 }} onClick={() => adjustVolume(i)}
                  style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                  <div style={{ width: '14px', height: `${20 + volumes[i] * 40}px`, borderRadius: radius.xs, transition: 'height 0.3s',
                    background: `hsla(${v.hue}, 35%, 40%, ${0.1 + volumes[i] * 0.2})`,
                    border: `1px solid hsla(${v.hue}, 35%, 50%, ${0.1 + volumes[i] * 0.15})` }} />
                  <span style={{ fontSize: '11px', color: `hsla(${v.hue}, 30%, 55%, 0.6)` }}>{v.name.split(' ')[1]}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'harmony' && (
          <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div animate={{ scale: [1, 1.05, 1] }} transition={{ repeat: Infinity, duration: 3 }}
              style={{ display: 'flex', gap: '4px' }}>
              {VOICES.map(v => (
                <div key={v.name} style={{ width: '14px', height: '40px', borderRadius: radius.xs,
                  background: `hsla(${v.hue}, 35%, 40%, 0.2)` }} />
              ))}
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>Harmony.</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Internal Family Systems (Schwartz, 1995): every "part" of you has a positive intent. The Stoic protects. The Child creates. The Warrior defends. The Sage guides. The Lover connects. No voice is exiled. The harmony of the whole self is not silence; it is a chord.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Chord.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}