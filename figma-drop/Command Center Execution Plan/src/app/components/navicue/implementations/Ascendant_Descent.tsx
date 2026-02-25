/**
 * ASCENDANT #2 -- The Descent (The Return)
 * "The hero's journey is a circle. Bring the elixir back."
 * Pattern A (Tap) -- At the peak; choose Return (village) or Stay (mountain)
 * STEALTH KBE: Choosing Return = Service Orientation / Bodhisattva Vow (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ASCENDANT_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Integrated Living', 'believing', 'Cosmos');
type Stage = 'arriving' | 'peak' | 'descended' | 'resonant' | 'afterglow';

export default function Ascendant_Descent({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [choice, setChoice] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('peak'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const choose = (c: string) => {
    if (stage !== 'peak') return;
    setChoice(c);
    console.log(`[KBE:B] Descent choice="${c}" serviceOrientation=${c === 'return' ? 'confirmed' : 'challenged'} bodhisattvaVow=${c === 'return'}`);
    setStage('descended');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Integrated Living" kbe="believing" form="Cosmos" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: 0, height: 0, borderLeft: '10px solid transparent', borderRight: '10px solid transparent',
              borderBottom: `14px solid ${themeColor(TH.primaryHSL, 0.04, 2)}` }} />
          </motion.div>
        )}
        {stage === 'peak' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You are at the peak. It is cold and silent here. Below, the village is noisy but warm. The hero{"'"}s journey is a circle.
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => choose('return')}
                style={{ padding: '14px 16px', borderRadius: radius.md, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 6)}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.45, 14) }}>Return ↓</span>
                <span style={{ fontSize: '11px', color: palette.textFaint }}>Bring the elixir</span>
              </motion.div>
              <motion.div whileTap={{ scale: 0.9 }} onClick={() => choose('stay')}
                style={{ padding: '14px 16px', borderRadius: radius.md, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.03, 1),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <span style={{ ...navicueType.choice, color: palette.textFaint }}>Stay ↑</span>
                <span style={{ fontSize: '11px', color: palette.textFaint }}>Keep the silence</span>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'descended' && (
          <motion.div key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            {choice === 'return'
              ? 'Descended. You brought the elixir back to the village. The hero\'s journey is a circle -- you must return. The cave is not the destination. The village is. Enlightenment that stays on the mountain is just tourism. Real integration means bringing the silence into the noise, the peace into the chaos. The Bodhisattva vow: "I will not enter final nirvana until all beings are liberated."'
              : 'You stayed. The silence is beautiful. But the village needed you. The mountain is a place of preparation, not arrival. Eventually, even the hermit must descend. The wisdom that cannot survive the marketplace is not yet wisdom -- it is fragility. The next step is always downward.'}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            The Return. Joseph Campbell{"'"}s monomyth: the hero must return from the adventure with the "boon" (elixir) to share with the community. In Buddhism, the Bodhisattva delays personal liberation to serve all sentient beings. Ken Wilber{"'"}s "Integral" framework: spiritual development must be embodied in relationships, work, and community -- not isolated in retreat. The peak is not the destination. The descent is the final, hardest stage of the journey. Integration happens in the marketplace, not the cave.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Returned.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}