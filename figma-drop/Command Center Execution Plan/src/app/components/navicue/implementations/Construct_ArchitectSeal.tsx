/**
 * CONSTRUCT #10 — The Architect Seal / The Proof (Cumulative Achievement)
 * "You thought you were building a habit. You were building a home."
 * ARCHETYPE: Pattern A (Tap) — Tap to unroll the blueprint
 * ENTRY: Ambient fade — blueprint slowly materializes
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { CONSTRUCT_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('science_x_soul', 'Metacognition', 'believing', 'IdentityKoan');
type Stage = 'ambient' | 'active' | 'unrolled' | 'resonant' | 'afterglow';

const ROOMS = ['Foundation Stone', 'Grief Cairn', 'Memory Palace', 'Zen Garden', 'Fear Vault',
  'Council Table', 'Lighthouse', 'Workbench', 'Greenhouse'];

export default function Construct_ArchitectSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('ambient');
  const [revealed, setRevealed] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 3200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const unroll = () => {
    setStage('unrolled');
    // Reveal rooms one by one
    ROOMS.forEach((_, i) => {
      t(() => setRevealed(i + 1), 400 * (i + 1));
    });
    t(() => setStage('resonant'), 400 * ROOMS.length + 3000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 400 * ROOMS.length + 8000);
  };

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Metacognition" kbe="believing" form="IdentityKoan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'ambient' && (
          <motion.div key="amb" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <motion.div animate={{ opacity: [0.03, 0.06, 0.03] }} transition={{ duration: 3, repeat: Infinity }}
              style={{ width: '40px', height: '60px', borderRadius: radius.xs,
                background: themeColor(TH.primaryHSL, 0.06, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.04, 4)}` }} />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} transition={{ delay: 2 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>a rolled blueprint</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '22px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You thought you were building a habit. You were building a home.
            </div>
            <motion.div onClick={unroll} whileTap={{ scale: 0.96 }}
              style={{ width: '50px', height: '70px', borderRadius: radius.xs, cursor: 'pointer',
                background: themeColor(TH.primaryHSL, 0.1, 6),
                border: `1px solid ${themeColor(TH.accentHSL, 0.08, 8)}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', color: themeColor(TH.accentHSL, 0.2, 10),
                writingMode: 'vertical-lr' }}>BLUEPRINT</div>
            </motion.div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>tap to unroll</div>
          </motion.div>
        )}
        {stage === 'unrolled' && (
          <motion.div key="un" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', maxWidth: '280px' }}>
            <div style={{ width: '100%', padding: '14px', borderRadius: radius.sm,
              background: themeColor(TH.primaryHSL, 0.06, 3),
              border: `1px solid ${themeColor(TH.accentHSL, 0.06, 4)}` }}>
              {ROOMS.map((room, i) => (
                <motion.div key={room} initial={{ opacity: 0, x: -10 }}
                  animate={i < revealed ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.3 }}
                  style={{ padding: '4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '6px', height: '6px', borderRadius: '1px',
                    background: themeColor(TH.accentHSL, 0.15, 8) }} />
                  <span style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.04em',
                    color: themeColor(TH.accentHSL, 0.3, 10) }}>{room}</span>
                </motion.div>
              ))}
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: ROOMS.length * 0.4 + 0.5 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>it is massive</motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Cumulative Achievement. Visualizing the aggregate of small efforts provides evidence of competence {'\u2014'} reinforcing the identity of a Builder rather than a Drifter. You built a home.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Builder.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}