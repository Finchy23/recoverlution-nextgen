/**
 * MAESTRO #2 — The Pause as Currency
 * "The amateur fills every silence. The master lets it breathe."
 * ARCHETYPE: Pattern A (Tap × 5) — A sentence appears word by word.
 * Between words: dramatic pauses (visual breath marks). At 5: the sentence
 * has more pause than speech. Prosodic timing.
 */
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { useNaviCueStages, type NaviCueProps } from '../interactions/useNaviCueStages';
import { MAESTRO_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Theater');
const TH = MAESTRO_THEME;

const WORDS = ['I', '...', 'see', '...', 'you.'];
const STEP_COUNT = 5;

export default function Maestro_PauseAsCurrency({ onComplete }: NaviCueProps) {
  const { stage, setStage, addTimer } = useNaviCueStages();
  const [revealed, setRevealed] = useState(0);

  const reveal = () => {
    if (stage !== 'active' || revealed >= STEP_COUNT) return;
    const next = revealed + 1;
    setRevealed(next);
    if (next >= STEP_COUNT) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = revealed / STEP_COUNT;

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Wait for it...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The amateur fills every silence. The master lets it breathe. The pause is not emptiness. It is emphasis. It is power.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to reveal each word and feel the pauses</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={reveal}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', cursor: revealed >= STEP_COUNT ? 'default' : 'pointer', width: '100%', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '240px', height: '120px', borderRadius: radius.md, overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, t * 4) }}>
              <svg width="100%" height="100%" viewBox="0 0 240 120" style={{ position: 'absolute', inset: 0 }}>
                {/* Words revealed with breath marks */}
                {WORDS.slice(0, revealed).map((word, i) => {
                  const isPause = word === '...';
                  const x = 25 + i * 42;
                  return (
                    <motion.g key={i}
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: isPause ? 1.5 : 0.6 }}>
                      {isPause ? (
                        /* Breath mark — a fermata-like arc */
                        <>
                          <path d={`M ${x - 8},60 Q ${x},48 ${x + 8},60`}
                            fill="none" stroke={themeColor(TH.accentHSL, 0.06, 12)}
                            strokeWidth="0.5" strokeLinecap="round" />
                          <circle cx={x} cy="63" r="1.2"
                            fill={themeColor(TH.accentHSL, 0.06, 12)} />
                          <text x={x} y="75" textAnchor="middle" fontSize="11" fontFamily="monospace"
                            fill={themeColor(TH.primaryHSL, 0.04, 10)}>breathe</text>
                        </>
                      ) : (
                        <text x={x} y="65" textAnchor="middle" fontSize="14"
                          fontFamily="Georgia, serif" fontWeight="500"
                          fill={themeColor(TH.accentHSL, 0.12 + i * 0.01, 18)}>
                          {word}
                        </text>
                      )}
                    </motion.g>
                  );
                })}

                {/* Timeline bar showing speech vs silence ratio */}
                <rect x="20" y="95" width="200" height="4" rx="2"
                  fill={themeColor(TH.primaryHSL, 0.03)} />
                {WORDS.slice(0, revealed).map((word, i) => {
                  const isPause = word === '...';
                  const segW = 200 / STEP_COUNT;
                  return (
                    <motion.rect key={`bar-${i}`} x={20 + i * segW} y="95" width={segW - 2} height="4" rx="2"
                      fill={isPause
                        ? themeColor(TH.primaryHSL, 0.02, 5)
                        : themeColor(TH.accentHSL, 0.08, 15)}
                      initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
                    />
                  );
                })}

                <text x="120" y="112" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.03, 12)}>
                  {t >= 1 ? '3 words. 2 pauses. More silence than speech.' : `${WORDS.slice(0, revealed).filter(w => w !== '...').length} words, ${WORDS.slice(0, revealed).filter(w => w === '...').length} pauses`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {revealed === 0 ? 'Empty space. The first word awaits.' : revealed < STEP_COUNT ? `"${WORDS.slice(0, revealed).join(' ')}", ${WORDS[revealed - 1] === '...' ? 'feel the pause.' : 'the word lands harder after the silence.'}` : '"I ... see ... you." Three words. Two breaths. Maximum impact.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: STEP_COUNT }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < revealed ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five taps. "I", pause, "see", pause, "you." Three words. Two silences. And yet: that sentence hit harder than a paragraph. The pauses were not empty. They were emphasis. The silence between notes is what makes music. Let it breathe.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Prosodic timing. Strategic pauses increase listener attention and perceived speaker competence. The space between is the magic.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Word. Breathe. Land.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}