/**
 * TRIBALIST #6 — The Social Battery
 * "You are not anti-social. You are solar-powered. Go home before 0%."
 * ARCHETYPE: Pattern A (Tap) — Battery drains as people appear; tap Home to recharge
 * ENTRY: Ambient fade — battery icon at full
 * STEALTH KBE: Setting leave-time before depletion = Self-Regulation (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TRIBALIST_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'embodying', 'Hearth');
type Stage = 'arriving' | 'draining' | 'home' | 'resonant' | 'afterglow';

export default function Tribalist_SocialBattery({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [battery, setBattery] = useState(100);
  const [people, setPeople] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('draining'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (stage !== 'draining') return;
    const id = window.setInterval(() => {
      setBattery(b => {
        const next = Math.max(0, b - 2);
        if (next <= 70 && people < 1) setPeople(1);
        if (next <= 50 && people < 2) setPeople(2);
        if (next <= 30 && people < 3) setPeople(3);
        return next;
      });
    }, 200);
    return () => clearInterval(id);
  }, [stage, people]);

  const goHome = () => {
    if (stage !== 'draining') return;
    console.log(`[KBE:E] SocialBattery leftAt=${battery}% selfRegulation=${battery > 15}`);
    setStage('home');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  const batteryColor = battery > 50 ? themeColor(TH.accentHSL, 0.3, 10)
    : battery > 20 ? themeColor(TH.accentHSL, 0.2, 5)
    : 'hsla(0, 40%, 45%, 0.4)';

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ width: '40px', height: '20px', borderRadius: radius.xs,
              border: `2px solid ${themeColor(TH.accentHSL, 0.15, 8)}`,
              background: themeColor(TH.accentHSL, 0.1, 6) }} />
          </motion.div>
        )}
        {stage === 'draining' && (
          <motion.div key="dr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Go home before you hit 0%.
            </div>
            {/* Battery */}
            <div style={{ position: 'relative', width: '60px', height: '28px' }}>
              <div style={{ width: '60px', height: '28px', borderRadius: radius.xs,
                border: `2px solid ${themeColor(TH.primaryHSL, 0.12, 6)}`,
                overflow: 'hidden' }}>
                <motion.div animate={{ width: `${battery}%` }}
                  style={{ height: '100%', background: batteryColor, transition: 'width 0.2s, background 0.5s' }} />
              </div>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                fontSize: '11px', fontWeight: '600', color: palette.text }}>{battery}%</div>
            </div>
            {/* People icons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {Array.from({ length: people }).map((_, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 0.4, scale: 1 }}
                  style={{ width: '10px', height: '14px', borderRadius: '5px 5px 0 0',
                    background: themeColor(TH.primaryHSL, 0.12, 6) }} />
              ))}
            </div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={goHome}
              style={{ padding: '14px 24px', borderRadius: radius.full, cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
              <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 15) }}>Home</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'home' && (
          <motion.div key="h" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <div style={{ width: '60px', height: '28px', borderRadius: radius.xs,
              border: `2px solid ${themeColor(TH.accentHSL, 0.15, 8)}` }}>
              <motion.div animate={{ width: ['40%', '100%'] }} transition={{ duration: 2 }}
                style={{ height: '100%', background: themeColor(TH.accentHSL, 0.3, 10), borderRadius: '2px' }} />
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 1 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              {battery > 15
                ? 'You left before empty. Recharging. Smart.'
                : 'You stayed too long. The recharge will take longer next time.'}
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Interoception. Knowing when to leave is a somatic skill: reading your internal battery before it hits zero. You are solar-powered. The night is not defeat; it is recharging.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Recharged.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}