/**
 * MYTHMAKER #10 — The Mythic Seal (The Proof)
 * "The ink is your blood. The paper is your days. Write a good one."
 * ARCHETYPE: Pattern D (Type) — A quill pen writing in gold ink on parchment.
 * Type "I am the Author" to seal. Locus of Control:
 * from "Life happens to me" (Victim) to "I happen to life" (Creator).
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MYTHMAKER_THEME, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Theater');
const TH = MYTHMAKER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function MythMaker_MythicSeal({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [quillY, setQuillY] = useState(0);
  const timersRef = useRef<number[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  const typer = useTypeInteraction({
    acceptPhrases: ['i am the author', 'i am the writer', 'i am the creator'],
    onAccept: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    },
  });

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (stage === 'active') addTimer(() => inputRef.current?.focus(), 300);
  }, [stage]);

  // Quill animation — bobs gently while typing
  useEffect(() => {
    if (stage !== 'active' || typer.accepted) return;
    const interval = window.setInterval(() => setQuillY(y => y === 0 ? -2 : 0), 400);
    return () => clearInterval(interval);
  }, [stage, typer.accepted]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') typer.submit();
  };

  const sealed = typer.accepted;
  const inkTrail = typer.value.length;

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The quill is waiting...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              The ink is your blood. The paper is your days. Write a good one.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>declare your authorship</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px' }}>

            {/* Parchment with quill */}
            <div style={{ position: 'relative', width: '220px', height: '160px' }}>
              <svg width="100%" height="100%" viewBox="0 0 220 160">
                {/* Parchment background */}
                <rect x="20" y="20" width="180" height="120" rx="4"
                  fill={themeColor(TH.accentHSL, 0.04, 8)}
                  stroke={themeColor(TH.accentHSL, 0.06, 10)} strokeWidth="0.5" />

                {/* Ruled lines */}
                {Array.from({ length: 5 }, (_, i) => (
                  <line key={i} x1="35" y1={45 + i * 18} x2="185" y2={45 + i * 18}
                    stroke={themeColor(TH.primaryHSL, 0.03, 8)} strokeWidth="0.3" />
                ))}

                {/* Gold ink trail — follows typing */}
                {inkTrail > 0 && (
                  <motion.line x1="40" y1="44" x2={40 + Math.min(inkTrail * 6, 140)} y2="44"
                    stroke={themeColor(TH.accentHSL, sealed ? 0.3 : 0.12, 18)}
                    strokeWidth="1" strokeLinecap="round"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
                    transition={{ duration: 0.3 }} />
                )}

                {/* Seal stamp — appears on acceptance */}
                {sealed && (
                  <motion.g initial={{ opacity: 0, scale: 0.3 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    style={{ transformOrigin: '160px 110px' }}>
                    <circle cx="160" cy="110" r="18"
                      fill={themeColor(TH.accentHSL, 0.1, 15)}
                      stroke={themeColor(TH.accentHSL, 0.2, 20)} strokeWidth="1" />
                    <text x="160" y="113" textAnchor="middle" fontSize="11" fontFamily="serif"
                      fill={themeColor(TH.accentHSL, 0.35, 22)} letterSpacing="0.05em">
                      AUTHOR
                    </text>
                  </motion.g>
                )}

                {/* The quill */}
                <motion.g initial={{ y: 0 }} animate={{ y: quillY }} transition={{ duration: 0.2 }}>
                  {/* Feather */}
                  <path d={`M ${45 + Math.min(inkTrail * 6, 140)} 30 L ${40 + Math.min(inkTrail * 6, 140)} 42 L ${50 + Math.min(inkTrail * 6, 140)} 42 Z`}
                    fill={themeColor(TH.accentHSL, 0.1, 12)} />
                  {/* Nib */}
                  <line x1={45 + Math.min(inkTrail * 6, 140)} y1="42"
                    x2={45 + Math.min(inkTrail * 6, 140)} y2="45"
                    stroke={themeColor(TH.accentHSL, 0.2, 15)} strokeWidth="1" />
                  {/* Ink drop */}
                  {typer.status === 'typing' && (
                    <motion.circle
                      cx={45 + Math.min(inkTrail * 6, 140)} cy="45" r="1"
                      fill={themeColor(TH.accentHSL, 0.15, 18)}
                      animate={{ opacity: [0.15, 0.3, 0.15] }}
                      transition={{ duration: 1, repeat: Infinity }} />
                  )}
                </motion.g>
              </svg>
            </div>

            {/* Input field */}
            <motion.div
              key={typer.shakeCount}
              animate={typer.status === 'rejected' ? { x: [0, -6, 6, -4, 4, -2, 2, 0] } : {}}
              transition={{ duration: 0.5 }}
              style={{ width: '100%' }}>
              <input
                ref={inputRef}
                type="text"
                value={typer.value}
                onChange={e => typer.onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="I am the Author"
                disabled={typer.accepted}
                style={{
                  width: '100%', padding: '12px 16px', fontSize: '15px',
                  fontFamily: 'serif', fontStyle: 'italic', textAlign: 'center',
                  background: sealed
                    ? themeColor(TH.accentHSL, 0.06, 12)
                    : themeColor(TH.voidHSL, 0.5, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, sealed ? 0.15 : 0.05, 10)}`,
                  borderRadius: radius.sm,
                  color: sealed ? themeColor(TH.accentHSL, 0.8, 28) : palette.text,
                  outline: 'none', transition: 'all 0.5s ease', letterSpacing: '0.03em',
                }}
              />
            </motion.div>

            {/* Submit */}
            {!sealed && typer.value.length > 3 && (
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                onClick={typer.submit}
                style={{ background: 'none', border: 'none', cursor: 'pointer',
                  ...navicueType.hint, color: palette.textFaint }}>
                seal the parchment
              </motion.button>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ duration: 1.5 }}
              style={{ width: '50px', height: '50px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.08, 15),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${themeColor(TH.accentHSL, 0.15, 20)}` }}>
              <div style={{ fontSize: '11px', fontFamily: 'serif', color: themeColor(TH.accentHSL, 0.35, 22) }}>SEALED</div>
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              You are the Author. Not the character. The one holding the pen. The shift from Victim to Creator.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>locus of control: internal</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>I happen to life.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}