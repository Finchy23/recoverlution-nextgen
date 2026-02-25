/**
 * ASCENDANT #9 -- The Open Door
 * "The heart is a guest house. Welcome the sorrow."
 * Pattern A (Tap) -- Locked door; unlock it; welcome a "Difficult Guest" (Grief)
 * STEALTH KBE: Welcoming difficult guest = Emotional Courage / Openness (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ASCENDANT_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sacred_ordinary', 'Integrated Living', 'believing', 'Cosmos');
type Stage = 'arriving' | 'locked' | 'guest' | 'welcomed' | 'resonant' | 'afterglow';

const GUESTS = ['Grief', 'Shame', 'Fear', 'Loneliness'];

export default function Ascendant_OpenDoor({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [guest, setGuest] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('locked'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const unlock = () => {
    if (stage !== 'locked') return;
    const g = GUESTS[Math.floor(Math.random() * GUESTS.length)];
    setGuest(g);
    setStage('guest');
  };

  const welcome = () => {
    if (stage !== 'guest') return;
    console.log(`[KBE:B] OpenDoor guest="${guest}" emotionalCourage=confirmed openness=true`);
    setStage('welcomed');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Integrated Living" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '14px', height: '20px', borderRadius: '2px',
              background: themeColor(TH.primaryHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'locked' && (
          <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A door. Locked from the inside. Something is knocking. Unlock it.
            </div>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '30px', height: '44px', borderRadius: '3px',
                background: themeColor(TH.primaryHSL, 0.04, 2),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}` }} />
              <div style={{ position: 'absolute', right: '4px', top: '20px', width: '4px', height: '4px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.06, 3) }} />
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={unlock}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Unlock</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'guest' && (
          <motion.div key="g" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              The door opens. Standing there: <span style={{ fontStyle: 'italic' }}>{guest}</span>. A difficult guest. The heart is a guest house. Will you welcome them?
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={welcome}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Open</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'welcomed' && (
          <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Welcomed. {guest} entered. The room didn{"'"}t collapse. You didn{"'"}t collapse. "This being human is a guest house. Every morning a new arrival. Welcome them all -- even if they{"'"}re a crowd of sorrows who violently sweep your house empty of its furniture. Still, treat each guest honorably. They may be clearing you out for some new delight." -- Rumi. The door is open. All of you is welcome here.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Emotional openness. Rumi{"'"}s "Guest House" poem is the literary foundation of ACT (Acceptance and Commitment Therapy): the willingness to experience all internal events (thoughts, feelings, sensations) without avoidance. Hayes{"'"} "experiential avoidance" research: attempting to suppress or control unwanted emotions paradoxically intensifies them (Wegner{"'"}s ironic process theory). Welcoming the "difficult guest" reduces its power. The locked door was protecting you from nothing -- and costing you everything.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Open.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}