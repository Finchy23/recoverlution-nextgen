/**
 * TIME CAPSULE #5 — The Success Jar
 * "This victory is batteries. Store the charge."
 * ARCHETYPE: Pattern A (Tap ×3) — Drop wins into the jar, each fills light
 * ENTRY: Scene First — jar already glowing, text emerges from within
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TIMECAPSULE_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Practice');
type Stage = 'scene' | 'active' | 'resonant' | 'afterglow';

const WINS = [
  { y: 100, label: 'a moment of courage' },
  { y: 80, label: 'a boundary you held' },
  { y: 60, label: 'a kindness you gave' },
];

export default function TimeCapsule_SuccessJar({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const [drops, setDrops] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('active'), 2200);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const drop = () => {
    if (stage !== 'active' || drops >= 3) return;
    const n = drops + 1;
    setDrops(n);
    if (n >= 3) addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
  };

  const fillHeight = drops * 35;

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <svg width="140" height="180" viewBox="0 0 140 180">
              <path d="M40,40 L35,160 Q35,170 50,170 L90,170 Q105,170 105,160 L100,40 Z"
                fill={themeColor(TH.primaryHSL, 0.06, 5)} stroke={themeColor(TH.accentHSL, 0.1, 8)} strokeWidth="0.5" />
              <motion.ellipse cx="70" cy="150" rx="25" ry="4"
                fill={themeColor(TH.accentHSL, 0.08, 10)}
                animate={{ opacity: [0.05, 0.12, 0.05] }} transition={{ duration: 3, repeat: Infinity }} />
            </svg>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>something is waiting to be kept</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={drop}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', cursor: drops >= 3 ? 'default' : 'pointer', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              Drop a win inside. Don{'\u2019'}t celebrate now; save the light for a dark day. This jar is psychological capital: batteries for when you feel like a failure.
            </div>
            <svg width="140" height="180" viewBox="0 0 140 180">
              <defs>
                <clipPath id={`${svgId}-jar-clip`}>
                  <path d="M40,40 L35,160 Q35,170 50,170 L90,170 Q105,170 105,160 L100,40 Z" />
                </clipPath>
              </defs>
              <path d="M40,40 L35,160 Q35,170 50,170 L90,170 Q105,170 105,160 L100,40 Z"
                fill={themeColor(TH.primaryHSL, 0.06, 5)} stroke={themeColor(TH.accentHSL, 0.1, 8)} strokeWidth="0.5" />
              <motion.rect x="30" y={170 - fillHeight} width="80" height={fillHeight}
                fill={themeColor(TH.accentHSL, 0.1 + drops * 0.06, 10)}
                clipPath={`url(#${svgId}-jar-clip)`}
                animate={{ height: fillHeight }}
                transition={{ type: 'spring', stiffness: 100 }} />
              {WINS.map((w, i) => i < drops && (
                <motion.circle key={i} cx={55 + i * 15} cy={170 - (i + 1) * 30} r="4"
                  fill={themeColor(TH.accentHSL, 0.3 + i * 0.1, 12)}
                  initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} />
              ))}
            </svg>
            <div style={{ display: 'flex', gap: '8px' }}>
              {WINS.map((_, i) => (
                <motion.div key={i} style={{ width: '24px', height: '3px', borderRadius: '2px', backgroundColor: 'rgba(0,0,0,0)' }}
                  animate={{ backgroundColor: i < drops ? themeColor(TH.accentHSL, 0.4, 10) : themeColor(TH.primaryHSL, 0.06, 5) }} />
              ))}
            </div>
            {drops < 3 && <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.4 }}>drop a win</div>}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Three lights stored. The jar glows now but you won{'\u2019'}t need it now. You{'\u2019'}ll need it on the day you forget you were ever capable of anything. That{'\u2019'}s when you break the glass and drink the light.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Charged.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}