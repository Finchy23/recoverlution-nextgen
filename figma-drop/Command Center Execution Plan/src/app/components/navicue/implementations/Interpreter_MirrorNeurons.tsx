/**
 * INTERPRETER #9 — The Mirror Neurons (Somatic Empathy)
 * "To understand them, you must become them. Shape your face."
 * ARCHETYPE: Pattern A (Tap) — Choose expression to mirror; facial feedback
 * ENTRY: Reverse reveal — face appears before the instruction
 * STEALTH KBE: Successfully choosing to mimic = embodied empathy (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';
import { INTERPRETER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'embodying', 'Hearth');
type Stage = 'reveal' | 'active' | 'mirroring' | 'resonant' | 'afterglow';

const EXPRESSIONS = [
  { id: 'sad', label: 'Sad', emoji: '(', desc: 'drooping corners, soft eyes', shape: 'M 15 28 Q 25 32 35 28' },
  { id: 'happy', label: 'Happy', emoji: ')', desc: 'upturned corners, crinkled eyes', shape: 'M 15 26 Q 25 22 35 26' },
  { id: 'angry', label: 'Angry', emoji: '/', desc: 'furrowed brow, tight jaw', shape: 'M 15 25 L 35 25' },
] as const;

export default function Interpreter_MirrorNeurons({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('reveal');
  const [targetIdx, setTargetIdx] = useState(0);
  const [mirrored, setMirrored] = useState<string | null>(null);
  const [holdDuration, setHoldDuration] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const timerRef = useRef<number | null>(null);

  // Randomize target expression
  useEffect(() => {
    setTargetIdx(Math.floor(Math.random() * EXPRESSIONS.length));
    t(() => setStage('active'), 2200);
    return () => { T.current.forEach(clearTimeout); if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const target = EXPRESSIONS[targetIdx];

  const startMirror = (exprId: string) => {
    console.log(`[KBE:E] MirrorNeurons target=${target.id} mirrored=${exprId} match=${exprId === target.id}`);
    setMirrored(exprId);
    setStage('mirroring');
    // Count hold duration (facial feedback needs ~3 seconds)
    setHoldDuration(0);
    timerRef.current = window.setInterval(() => {
      setHoldDuration(prev => {
        const next = prev + 0.1;
        if (next >= 3) {
          if (timerRef.current) clearInterval(timerRef.current);
        }
        return next;
      });
    }, 100);
    t(() => {
      if (timerRef.current) clearInterval(timerRef.current);
      console.log(`[KBE:E] MirrorNeurons facialFeedbackDuration=3s`);
      setStage('resonant');
    }, 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  // Face SVG — minimal line-art face
  const Face = ({ expression, size = 80 }: { expression: typeof EXPRESSIONS[number]; size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 50 50">
      {/* Head */}
      <circle cx="25" cy="25" r="20" fill="none"
        stroke={themeColor(TH.primaryHSL, 0.12, 8)} strokeWidth="1.5" />
      {/* Eyes */}
      <circle cx="18" cy="20" r="2" fill={themeColor(TH.primaryHSL, 0.15, 10)} />
      <circle cx="32" cy="20" r="2" fill={themeColor(TH.primaryHSL, 0.15, 10)} />
      {/* Mouth */}
      <path d={expression.shape} fill="none"
        stroke={themeColor(TH.accentHSL, 0.25, 10)} strokeWidth="1.5" strokeLinecap="round" />
      {/* Brow (angry only) */}
      {expression.id === 'angry' && (
        <>
          <line x1="14" y1="16" x2="20" y2="17" stroke={themeColor(TH.primaryHSL, 0.15, 8)} strokeWidth="1.2" />
          <line x1="30" y1="17" x2="36" y2="16" stroke={themeColor(TH.primaryHSL, 0.15, 8)} strokeWidth="1.2" />
        </>
      )}
    </svg>
  );

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'reveal' && (
          <motion.div key="rv" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <Face expression={target} size={100} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.25 }} transition={{ delay: 1 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>{target.label}</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              To understand them, you must become them. Shape your face. The feeling will follow the shape.
            </div>
            <Face expression={target} size={90} />
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              mirror this expression: {target.desc}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              {EXPRESSIONS.map(expr => (
                <motion.div key={expr.id} whileTap={{ scale: 0.95 }}
                  onClick={() => startMirror(expr.id)}
                  style={{ padding: '8px 18px', borderRadius: radius.lg, cursor: 'pointer',
                    background: themeColor(TH.primaryHSL, 0.06, 3),
                    border: `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}` }}>
                  <div style={{ ...navicueType.choice, color: themeColor(TH.primaryHSL, 0.3, 12), fontSize: '12px' }}>
                    {expr.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'mirroring' && (
          <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
            {/* Two faces mirroring */}
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <Face expression={target} size={70} />
              <motion.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 2, repeat: Infinity }}
                style={{ width: '30px', height: '1px', background: themeColor(TH.accentHSL, 0.15, 8) }} />
              <Face expression={EXPRESSIONS.find(e => e.id === mirrored) || target} size={70} />
            </div>
            <motion.div animate={{ scale: [1, 1.01, 1] }} transition={{ duration: 3, repeat: Infinity }}>
              <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
                Hold the expression. Feel what they feel.
                {mirrored === target.id
                  ? ' Your mirror neurons fire. Empathy is physical.'
                  : ' A different shape, a different feeling. Notice the mismatch.'}
              </div>
            </motion.div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px' }}>
              {Math.min(3, holdDuration).toFixed(1)}s / 3s
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Facial feedback hypothesis. Mirror neurons fire both when you perform an action and when you observe someone else performing it. By mimicking the expression, your brain begins to simulate the emotion. Empathy is not just understanding {'\u2014'} it is feeling with.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Mirrored.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}