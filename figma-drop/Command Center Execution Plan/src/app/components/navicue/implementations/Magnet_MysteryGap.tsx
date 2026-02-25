/**
 * MAGNET #2 — The Mystery Gap
 * "Give them a hunger, not a meal. Leave the circle open."
 * ARCHETYPE: Pattern A (Tap × 5) — A book opens, pages turn.
 * Just before the last page: it closes. Each tap reveals more but never all.
 * Zeigarnik Effect.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MAGNET_THEME, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('koan_paradox', 'Metacognition', 'believing', 'Practice');
const TH = MAGNET_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const PAGE_STEPS = 5;
const PAGES = [
  'Once there was a door...',
  'Behind the door, a voice...',
  'The voice said one word...',
  'The word changed everything...',
  '...', // The gap — never revealed
];

export default function Magnet_MysteryGap({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [page, setPage] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const turn = () => {
    if (stage !== 'active' || page >= PAGE_STEPS) return;
    const next = page + 1;
    setPage(next);
    if (next >= PAGE_STEPS) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const t = page / PAGE_STEPS;
  const bookOpen = t < 1 ? 12 + t * 18 : 5; // closes at the end

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A story begins...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Give them a hunger, not a meal. Leave the circle open. Let their imagination finish the drawing. Do not finish the story.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to turn each page</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={turn}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', cursor: page >= PAGE_STEPS ? 'default' : 'pointer', width: '100%', maxWidth: '300px' }}>
            <div style={{ position: 'relative', width: '200px', height: '160px', borderRadius: radius.sm, overflow: 'hidden',
              background: themeColor(TH.voidHSL, 0.95, t * 4) }}>
              <svg width="100%" height="100%" viewBox="0 0 200 160" style={{ position: 'absolute', inset: 0 }}>
                {/* Book spine */}
                <line x1="100" y1="20" x2="100" y2="130"
                  stroke={themeColor(TH.primaryHSL, 0.08, 10)} strokeWidth="1" />

                {/* Left page */}
                <motion.path
                  d={`M 100,20 Q ${100 - bookOpen},75 100,130`}
                  fill={themeColor(TH.primaryHSL, 0.03 + t * 0.015, 8)}
                  stroke={themeColor(TH.primaryHSL, 0.05, 10)}
                  strokeWidth="0.4"
                  initial={{ d: 'M 100,20 Q 100,75 100,130' }}
                  animate={{ d: `M 100,20 Q ${100 - bookOpen},75 100,130` }}
                  transition={{ type: 'spring', stiffness: 40 }}
                />

                {/* Right page */}
                <motion.path
                  d={`M 100,20 Q ${100 + bookOpen},75 100,130`}
                  fill={themeColor(TH.primaryHSL, 0.025 + t * 0.015, 6)}
                  stroke={themeColor(TH.primaryHSL, 0.05, 10)}
                  strokeWidth="0.4"
                  initial={{ d: 'M 100,20 Q 100,75 100,130' }}
                  animate={{ d: `M 100,20 Q ${100 + bookOpen},75 100,130` }}
                  transition={{ type: 'spring', stiffness: 40 }}
                />

                {/* Page text — revealed lines */}
                {PAGES.slice(0, page).map((text, i) => (
                  <motion.text key={i} x="100" y={38 + i * 18} textAnchor="middle"
                    fontSize={i === page - 1 && i === PAGE_STEPS - 1 ? '10' : '4.5'}
                    fontFamily="Georgia, serif" fontStyle="italic"
                    fill={i === page - 1 && i === PAGE_STEPS - 1
                      ? themeColor(TH.accentHSL, 0.12, 18)
                      : themeColor(TH.accentHSL, 0.06 + i * 0.01, 10 + i * 2)}
                    initial={{ opacity: 0 }} animate={{ opacity: i === page - 1 && i === PAGE_STEPS - 1 ? 0.12 : 0.06 + i * 0.01 }}
                    transition={{ duration: 0.8 }}>
                    {text}
                  </motion.text>
                ))}

                {/* Incomplete circle — the gap */}
                <motion.path
                  d={`M 85,110 A 15,15 0 1 1 ${85 + 28 * t},${110 - 2 * t}`}
                  fill="none"
                  stroke={themeColor(TH.accentHSL, 0.06 + t * 0.04, 12)}
                  strokeWidth={0.5 + t * 0.3}
                  strokeLinecap="round"
                />
                {/* The gap in the circle — always open */}
                {t > 0.5 && (
                  <motion.text x="100" y="125" textAnchor="middle" fontSize="3" fontFamily="monospace"
                    fill={themeColor(TH.accentHSL, 0.05, 10)}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.05 }}>
                    the circle stays open
                  </motion.text>
                )}

                {/* Book closing animation at final step */}
                {page >= PAGE_STEPS && (
                  <motion.rect x="75" y="15" width="50" height="120" rx="3"
                    fill={themeColor(TH.voidHSL, 0.4)}
                    initial={{ opacity: 0 }} animate={{ opacity: 0.4 }}
                    transition={{ delay: 0.5, duration: 1.5 }}
                  />
                )}

                <text x="100" y="148" textAnchor="middle" fontSize="3.5" fontFamily="monospace"
                  fill={themeColor(TH.primaryHSL, 0.05 + t * 0.04, 15)}>
                  {t >= 1 ? 'BOOK CLOSED. the hunger remains' : `page ${page}/${PAGE_STEPS}`}
                </text>
              </svg>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic', opacity: 0.55 }}>
                {page === 0 ? 'A closed book. The first page awaits.' : page < PAGE_STEPS ? `"${PAGES[page - 1]}" Turn again.` : 'The book closed. The last page, just an ellipsis. The hunger remains.'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {Array.from({ length: PAGE_STEPS }, (_, i) => (
                <div key={i} style={{ width: '8px', height: '8px', borderRadius: '50%',
                  background: i < page ? themeColor(TH.accentHSL, 0.5, 15) : themeColor(TH.primaryHSL, 0.08),
                  transition: 'background 0.5s' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Five pages. A door, a voice, a word, a change, and then "..." The book closed just before the ending. The circle stays open. You are still thinking about it, aren't you? That is the power. Give them a hunger, not a meal.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>The Zeigarnik effect. The brain craves completion of unfinished narratives. Unresolved information creates a hook of engagement. Leave the circle open.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Page. Gap. Hunger.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}