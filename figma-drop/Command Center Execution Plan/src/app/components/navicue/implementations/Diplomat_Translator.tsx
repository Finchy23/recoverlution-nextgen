/**
 * DIPLOMAT #5 — The Translator
 * "What they said. What they meant. What they needed."
 * INTERACTION: A message appears. Tap to peel through three layers —
 * the words, the meaning, the need. Each layer reveals a deeper
 * translation of the same human signal.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Hearth');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

const MESSAGES = [
  { said: '"Fine. Do whatever you want."', meant: 'I feel powerless in this.', needed: 'To know my voice matters.' },
  { said: '"You wouldn\'t understand."', meant: 'I\'m afraid of being judged.', needed: 'Safety to be seen as I am.' },
  { said: '"I\'m not angry."', meant: 'I\'m hurt and don\'t know how to say it.', needed: 'Permission to be vulnerable.' },
];

const LAYERS = ['said', 'meant', 'needed'] as const;
const LAYER_LABELS = { said: 'What they said', meant: 'What they meant', needed: 'What they needed' };

export default function Diplomat_Translator({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [msgIdx, setMsgIdx] = useState(0);
  const [layerIdx, setLayerIdx] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handlePeel = () => {
    if (stage !== 'active') return;
    if (layerIdx < LAYERS.length - 1) {
      setLayerIdx(layerIdx + 1);
    } else {
      // Next message
      const nextMsg = msgIdx + 1;
      if (nextMsg < MESSAGES.length) {
        setMsgIdx(nextMsg);
        setLayerIdx(0);
      } else {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 2500);
      }
    }
  };

  const msg = MESSAGES[msgIdx];
  const layer = LAYERS[layerIdx];

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Words carry cargo.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Three layers. One signal.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to peel deeper</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            <motion.button onClick={handlePeel}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              style={{ width: '280px', padding: '28px 20px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${palette.primaryFaint}`, borderRadius: radius.md, cursor: 'pointer', textAlign: 'center' }}>
              {/* Layer indicator */}
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginBottom: '16px' }}>
                {LAYERS.map((l, i) => (
                  <div key={l} style={{ width: '6px', height: '6px', borderRadius: '50%', background: i <= layerIdx ? palette.accent : palette.primaryFaint, opacity: i <= layerIdx ? 0.7 : 0.2, transition: 'all 0.5s' }} />
                ))}
              </div>
              {/* Layer label */}
              <motion.div key={`label-${layer}`} initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                style={{ ...navicueType.hint, color: palette.accent, fontSize: '11px', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '12px' }}>
                {LAYER_LABELS[layer]}
              </motion.div>
              {/* Content */}
              <AnimatePresence mode="wait">
                <motion.div key={`${msgIdx}-${layer}`}
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 0.7, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.6 }}
                  style={{ ...navicueType.texture, color: palette.text, fontSize: layer === 'said' ? '14px' : '13px', fontStyle: layer === 'said' ? 'italic' : 'normal', lineHeight: 1.6 }}>
                  {msg[layer]}
                </motion.div>
              </AnimatePresence>
            </motion.button>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
              message {msgIdx + 1} of {MESSAGES.length}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Beneath every word, a need.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The best translators listen past the language.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Hear what they can't say.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}