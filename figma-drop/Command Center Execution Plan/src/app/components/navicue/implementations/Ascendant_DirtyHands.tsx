/**
 * ASCENDANT #4 -- The Dirty Hands
 * "Spirituality is not sterile. Get your hands dirty."
 * Pattern A (Tap) -- Remove pristine gloves; put bare hands in soil; plant seed
 * STEALTH KBE: Willingness to engage with messiness = Integrated Spirituality / Engagement (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ASCENDANT_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('sacred_ordinary', 'Integrated Living', 'knowing', 'Cosmos');
type Stage = 'arriving' | 'gloves' | 'soil' | 'planted' | 'resonant' | 'afterglow';

export default function Ascendant_DirtyHands({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('gloves'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const removeGloves = () => {
    if (stage !== 'gloves') return;
    setStage('soil');
  };

  const plant = () => {
    if (stage !== 'soil') return;
    console.log(`[KBE:K] DirtyHands integratedSpirituality=confirmed engagement=true`);
    setStage('planted');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Integrated Living" kbe="knowing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex', gap: '3px' }}>
              <div style={{ width: '10px', height: '12px', borderRadius: '3px',
                background: 'hsla(0, 0%, 90%, 0.06)' }} />
              <div style={{ width: '10px', height: '12px', borderRadius: '3px',
                background: 'hsla(0, 0%, 90%, 0.06)' }} />
            </div>
          </motion.div>
        )}
        {stage === 'gloves' && (
          <motion.div key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Pristine white gloves. Spotless. Untouched. Take them off.
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '18px', height: '22px', borderRadius: radius.xs,
                background: 'hsla(0, 0%, 85%, 0.06)', border: '1px solid hsla(0, 0%, 80%, 0.06)' }} />
              <div style={{ width: '18px', height: '22px', borderRadius: radius.xs,
                background: 'hsla(0, 0%, 85%, 0.06)', border: '1px solid hsla(0, 0%, 80%, 0.06)' }} />
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={removeGloves}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Remove Gloves</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'soil' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Bare hands. Now put them in the soil. Plant the seed.
            </div>
            <div style={{ width: '80px', height: '24px', borderRadius: radius.xs,
              background: themeColor(TH.primaryHSL, 0.04, 2),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}` }} />
            <motion.div whileTap={{ scale: 0.9 }} onClick={plant}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Plant</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'planted' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Planted. Your hands are dirty, and something is growing. Spirituality is not sterile -- it is messy. Get your hands dirty. Life happens in the mud. The lotus grows from mud, not from marble. Integration means engaging with the full spectrum of human experience: the beautiful and the ugly, the clean and the dirty, the sacred and the profane. They were never separate.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Engaged spirituality. The "spiritual bypass" (John Welwood): using spiritual practices to avoid dealing with emotional wounds and developmental needs. True integration requires "getting dirty" -- engaging with relationships, work, conflict, and messiness. The lotus (padma) grows from mud, not despite it. Soil microbiome research: direct contact with earth bacteria (M. vaccae) activates serotonin production. Getting your hands dirty is literally an antidepressant.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Grounded.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}