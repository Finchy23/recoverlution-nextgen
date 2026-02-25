/**
 * ANCESTOR II #8 -- The Council Seat
 * "Do not look up to them. Look them in the eye."
 * Pattern A (Tap) -- Round table; historical figures; empty chair; take your seat
 * STEALTH KBE: Sitting as peer = Maturity / Agency (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ANCESTORII_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('poetic_precision', 'Transgenerational Meaning', 'embodying', 'Ember');
type Stage = 'arriving' | 'table' | 'seated' | 'resonant' | 'afterglow';

const FIGURES = ['The Healer', 'The Warrior', 'The Builder', 'The Teacher', 'The Artist'];

export default function AncestorII_CouncilSeat({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('table'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const sit = () => {
    if (stage !== 'table') return;
    console.log(`[KBE:E] CouncilSeat maturity=confirmed peerStatus=true`);
    setStage('seated');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Transgenerational Meaning" kbe="embodying" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ width: '24px', height: '24px', borderRadius: '50%',
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 2)}` }} />
          </motion.div>
        )}
        {stage === 'table' && (
          <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A round table. Figures from across time sit here. One chair is empty. It{"'"}s yours. Take your seat.
            </div>
            <div style={{ position: 'relative', width: '80px', height: '80px' }}>
              <div style={{ position: 'absolute', inset: '10px', borderRadius: '50%',
                border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 2)}` }} />
              {FIGURES.map((f, i) => {
                const angle = (i / (FIGURES.length + 1)) * Math.PI * 2 - Math.PI / 2;
                const x = 40 + Math.cos(angle) * 28;
                const y = 40 + Math.sin(angle) * 28;
                return (
                  <div key={f} style={{ position: 'absolute', left: x - 4, top: y - 4,
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: themeColor(TH.accentHSL, 0.05, 3) }}>
                    <span style={{ position: 'absolute', top: '10px', left: '-12px',
                      fontSize: '4px', color: palette.textFaint, whiteSpace: 'nowrap' }}>{f}</span>
                  </div>
                );
              })}
              {/* Empty chair */}
              {(() => {
                const angle = (FIGURES.length / (FIGURES.length + 1)) * Math.PI * 2 - Math.PI / 2;
                const x = 40 + Math.cos(angle) * 28;
                const y = 40 + Math.sin(angle) * 28;
                return (
                  <motion.div animate={{ opacity: [0.04, 0.08, 0.04] }} transition={{ duration: 2, repeat: Infinity }}
                    style={{ position: 'absolute', left: x - 5, top: y - 5,
                      width: '10px', height: '10px', borderRadius: '50%',
                      border: `1px dashed ${themeColor(TH.accentHSL, 0.08, 4)}` }}>
                    <span style={{ position: 'absolute', top: '12px', left: '-4px',
                      fontSize: '4px', color: themeColor(TH.accentHSL, 0.2, 6), whiteSpace: 'nowrap' }}>You</span>
                  </motion.div>
                );
              })()}
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={sit}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Take Your Seat</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'seated' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Seated. You are peers with the ancestors now. They faced their wars; you face yours. Do not look up to them. Look them in the eye. The shift from "child looking up" to "peer sitting alongside" is the psychological marker of maturity. You belong at this table, not because your achievements match theirs, but because the human condition is the same across all eras.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Peer identity and maturity. Jung{"'"}s "archetypes of the collective unconscious": the Healer, Warrior, Builder, Teacher, and Artist exist in every culture and every era. Object Relations Theory (Klein, Winnicott): psychological maturity involves moving from the "paranoid-schizoid position" (idealized/demonized others) to the "depressive position" (seeing others as fully human peers). The council of elders is a universal form, from indigenous traditions to corporate boards, because humans need to feel witnessed by those who came before.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Peer.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}