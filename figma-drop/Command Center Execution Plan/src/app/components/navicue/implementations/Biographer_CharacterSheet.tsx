/**
 * BIOGRAPHER #2 — The Character Sheet (Post-Traumatic Growth)
 * "You gained XP from that pain. Where do you allocate the points?"
 * ARCHETYPE: Pattern B (Drag) — Drag sliders to allocate stat points
 * ENTRY: Scene-first — RPG stat block appears before narrative prompt
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { BIOGRAPHER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Theater');
type Stage = 'scene' | 'active' | 'allocated' | 'resonant' | 'afterglow';

const STATS = [
  { id: 'str', label: 'STRENGTH', base: 6 },
  { id: 'wis', label: 'WISDOM', base: 5 },
  { id: 'res', label: 'RESILIENCE', base: 4 },
  { id: 'emp', label: 'EMPATHY', base: 7 },
  { id: 'cou', label: 'COURAGE', base: 3 },
];

export default function Biographer_CharacterSheet({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const [boosts, setBoosts] = useState<Record<string, number>>({});
  const [xpLeft, setXpLeft] = useState(3);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2800);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const boost = (id: string) => {
    if (xpLeft <= 0) return;
    setBoosts(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
    setXpLeft(prev => prev - 1);
  };

  const confirm = () => {
    setStage('allocated');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  const renderBar = (stat: typeof STATS[0], interactive: boolean) => {
    const total = stat.base + (boosts[stat.id] || 0);
    const maxVal = 10;
    return (
      <div key={stat.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
        <div style={{ width: '72px', fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.06em',
          color: themeColor(TH.accentHSL, 0.3, 10), textAlign: 'right' }}>{stat.label}</div>
        <div style={{ flex: 1, height: '8px', borderRadius: radius.xs, position: 'relative',
          background: themeColor(TH.primaryHSL, 0.06, 3),
          border: `1px solid ${themeColor(TH.accentHSL, 0.04, 4)}` }}>
          <motion.div animate={{ width: `${(total / maxVal) * 100}%` }} transition={{ duration: 0.3 }}
            style={{ height: '100%', borderRadius: radius.xs,
              background: themeColor(TH.accentHSL, 0.15 + (boosts[stat.id] || 0) * 0.06, 8) }} />
        </div>
        <div style={{ width: '20px', fontSize: '11px', fontFamily: 'monospace',
          color: themeColor(TH.accentHSL, 0.35, 12) }}>{total}</div>
        {interactive && xpLeft > 0 && (
          <motion.div onClick={() => boost(stat.id)} whileTap={{ scale: 0.9 }}
            style={{ width: '18px', height: '18px', borderRadius: '50%', cursor: 'pointer',
              background: themeColor(TH.accentHSL, 0.08, 6),
              border: `1px solid ${themeColor(TH.accentHSL, 0.1, 8)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '11px', color: themeColor(TH.accentHSL, 0.3, 12) }}>+</motion.div>
        )}
      </div>
    );
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="sc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', width: '260px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.12em',
              color: themeColor(TH.accentHSL, 0.2, 8) }}>CHARACTER SHEET</div>
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {STATS.map(s => renderBar(s, false))}
            </div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You gained XP from that pain. Where do you allocate the points? You are stronger now. Update your stats.
            </div>
            <div style={{ width: '280px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {STATS.map(s => renderBar(s, true))}
            </div>
            <div style={{ fontSize: '11px', fontFamily: 'monospace', color: themeColor(TH.accentHSL, 0.25, 8) }}>
              {xpLeft > 0 ? `${xpLeft} XP remaining` : 'all points allocated'}
            </div>
            {xpLeft === 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={confirm}
                style={{ padding: '12px 22px', borderRadius: radius.full, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.08, 6),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 10)}` }}>
                <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.35, 15) }}>level up</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'allocated' && (
          <motion.div key="al" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.12em',
              color: themeColor(TH.accentHSL, 0.3, 12) }}>LEVEL UP</div>
            <div style={{ width: '260px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {STATS.map(s => renderBar(s, false))}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Post-Traumatic Growth. Explicitly identifying strengths gained from adversity reinforces the integration of pain into a positive identity. You are not who you were. You leveled up.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Leveled up.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}