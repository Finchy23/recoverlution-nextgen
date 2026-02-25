/**
 * ETHICIST #10 — The Ethicist Seal (Moral Identity)
 * "You are aligned. The structure will hold."
 * ARCHETYPE: Pattern A (Tap) — Plumb line alignment
 * ENTRY: Cold open — plumb line hanging true
 * STEALTH KBE: Completion = Moral Identity confirmed
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ETHICIST_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'hanging' | 'aligned' | 'resonant' | 'afterglow';

export default function Ethicist_EthicistSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('hanging'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const align = () => {
    if (stage !== 'hanging') return;
    console.log(`[KBE:K] EthicistSeal moralIdentity=confirmed alignment=true`);
    setStage('aligned');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="knowing" form="Identity Koan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
              <div style={{ width: '1px', height: '40px', background: themeColor(TH.accentHSL, 0.06, 3) }} />
              <div style={{ width: '20px', height: '40px', borderRadius: '2px',
                background: themeColor(TH.primaryHSL, 0.03, 2) }} />
            </motion.div>
        )}
        {stage === 'hanging' && (
          <motion.div key="ha" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            {/* Plumb line + wall */}
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: '4px', height: '4px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.12, 6) }} />
                <motion.div animate={{ rotate: [0, 0.5, -0.5, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{ width: '1px', height: '50px',
                    background: themeColor(TH.accentHSL, 0.08, 5),
                    transformOrigin: 'top center' }} />
                <div style={{ width: '6px', height: '6px', borderRadius: '50%',
                  background: themeColor(TH.accentHSL, 0.1, 5) }} />
              </div>
              <div style={{ width: '30px', height: '60px', borderRadius: '2px',
                background: themeColor(TH.primaryHSL, 0.03, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}` }} />
            </div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '240px', fontStyle: 'italic' }}>
              A plumb line hanging straight and true next to a wall. Vertical alignment.
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={align}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Align</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'aligned' && (
          <motion.div key="al" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px', fontStyle: 'italic' }}>
            Aligned. The plumb line finds true vertical — not by effort but by gravity. Character works the same way: when "being a good person" is central to your identity, ethical behavior becomes gravitational. You are aligned. The structure will hold.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Moral identity. Aquino & Reed{"'"}s research: when ethical behavior is central to self-concept (moral identity internalization), ethical choices become automatic rather than effortful — like a plumb line that finds vertical by gravity rather than force. Character is not a decision. It is a structure. Build it straight, and it will hold.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Aligned.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}