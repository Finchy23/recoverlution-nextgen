/**
 * DREAMWALKER #9 — The Dream Symbol
 * "Everything in a dream is a metaphor for something awake."
 * ARCHETYPE: Pattern A (Tap ×5) — A symbol that morphs with each tap:
 * key → door → window → horizon → open sky. Each transformation
 * reveals the symbol was always about the same thing: freedom.
 * Symbolic Thinking — metaphor as the language of the unconscious.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueStyles, navicueType, safeSvgStroke } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { DREAMWALKER_THEME, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Ocean');
const TH = DREAMWALKER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

const SYMBOLS = [
  { label: 'A KEY', desc: 'something locked is waiting' },
  { label: 'A DOOR', desc: 'passage between states' },
  { label: 'A WINDOW', desc: 'seeing without entering' },
  { label: 'A HORIZON', desc: 'the edge of the known' },
  { label: 'OPEN SKY', desc: 'nothing between you and everything' },
];

function renderSymbol(index: number, alpha: number) {
  const stroke = themeColor(TH.accentHSL, alpha, 18);
  const fill = themeColor(TH.accentHSL, alpha * 0.3, 12);
  switch (index) {
    case 0: return ( /* Key */
      <g>
        <circle cx="90" cy="65" r="12" fill="none" stroke={stroke} strokeWidth="0.5" />
        <line x1="90" y1="77" x2="90" y2="110" stroke={stroke} strokeWidth="0.5" />
        <line x1="90" y1="95" x2="97" y2="95" stroke={stroke} strokeWidth="0.5" />
        <line x1="90" y1="105" x2="95" y2="105" stroke={stroke} strokeWidth="0.5" />
      </g>
    );
    case 1: return ( /* Door */
      <g>
        <rect x="65" y="40" width="50" height="75" rx="2" fill={fill} stroke={stroke} strokeWidth="0.5" />
        <rect x="70" y="48" width="18" height="28" rx="1" fill="none" stroke={stroke} strokeWidth={safeSvgStroke(0.3)} />
        <rect x="70" y="82" width="18" height="28" rx="1" fill="none" stroke={stroke} strokeWidth={safeSvgStroke(0.3)} />
        <circle cx="107" cy="78" r="2.5" fill={stroke} />
      </g>
    );
    case 2: return ( /* Window */
      <g>
        <rect x="60" y="45" width="60" height="55" rx="2" fill={fill} stroke={stroke} strokeWidth="0.5" />
        <line x1="90" y1="45" x2="90" y2="100" stroke={stroke} strokeWidth={safeSvgStroke(0.3)} />
        <line x1="60" y1="72" x2="120" y2="72" stroke={stroke} strokeWidth={safeSvgStroke(0.3)} />
        {/* Light through window */}
        <rect x="62" y="47" width="26" height="23" fill={themeColor(TH.accentHSL, alpha * 0.5, 20)} />
      </g>
    );
    case 3: return ( /* Horizon */
      <g>
        <line x1="20" y1="80" x2="160" y2="80" stroke={stroke} strokeWidth="0.5" />
        {/* Sky gradient above */}
        <rect x="20" y="50" width="140" height="30" fill={themeColor(TH.accentHSL, alpha * 0.2, 15)} />
        {/* Sun/glow at horizon */}
        <circle cx="90" cy="80" r="8" fill={themeColor(TH.accentHSL, alpha * 0.4, 22)} />
      </g>
    );
    case 4: return ( /* Open sky */
      <g>
        {/* Nothing but light */}
        <circle cx="90" cy="75" r="35" fill={themeColor(TH.accentHSL, alpha * 0.15, 18)} />
        <circle cx="90" cy="75" r="25" fill={themeColor(TH.accentHSL, alpha * 0.1, 22)} />
        <circle cx="90" cy="75" r="12" fill={themeColor(TH.accentHSL, alpha * 0.08, 28)} />
      </g>
    );
    default: return null;
  }
}

export default function DreamWalker_DreamSymbol({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [taps, setTaps] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const morph = () => {
    if (stage !== 'active' || taps >= SYMBOLS.length) return;
    const next = taps + 1;
    setTaps(next);
    if (next >= SYMBOLS.length) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3500);
    }
  };

  const symbol = SYMBOLS[Math.min(taps, SYMBOLS.length - 1)];
  const alpha = 0.1 + (taps / SYMBOLS.length) * 0.1;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A symbol appears...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Freud was wrong about most things but right about one: the dream speaks in symbols. A key, a door, a window — they are all saying the same word in different languages.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to transform the symbol</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={morph}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', width: '100%', maxWidth: '300px',
              cursor: taps >= SYMBOLS.length ? 'default' : 'pointer' }}>

            <div style={{ position: 'relative', width: '180px', height: '150px' }}>
              <AnimatePresence mode="wait">
                <motion.svg key={taps} width="100%" height="100%" viewBox="0 0 180 150"
                  initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.15 }}
                  transition={{ duration: 0.7 }}>
                  {renderSymbol(Math.min(taps, SYMBOLS.length - 1), alpha)}
                  {/* Symbol name */}
                  <text x="90" y="130" textAnchor="middle" fontSize="11" fontFamily="monospace"
                    fill={themeColor(TH.accentHSL, 0.12, 12)} letterSpacing="0.1em">
                    {symbol.label}
                  </text>
                  <text x="90" y="142" textAnchor="middle" fontSize="11" fontFamily="serif" fontStyle="italic"
                    fill={themeColor(TH.accentHSL, 0.08, 10)}>
                    {symbol.desc}
                  </text>
                </motion.svg>
              </AnimatePresence>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              {SYMBOLS.map((_, i) => (
                <motion.div key={i}
                  animate={{ backgroundColor: i < taps ? themeColor(TH.accentHSL, 0.2, 15) : themeColor(TH.primaryHSL, 0.06, 5) }}
                  style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0)' }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Key, door, window, horizon, sky. Five symbols. One word: freedom. The dream was never random. It was pointing the way out.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>the symbol is the message</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>One word: freedom.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}