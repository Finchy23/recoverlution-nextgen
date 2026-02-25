/**
 * ALCHEMIST IV #6 - The Envy Mirror
 * "You do not envy what you cannot be. You envy what you suppressed."
 * Pattern D (Type) - Name the trait you envy; converts to ambition
 * STEALTH KBE: Naming the envied trait = Shadow Work / Envy-to-Ambition (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ALCHEMISTIV_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Emotional Regulation', 'knowing', 'Ember');
type Stage = 'arriving' | 'mirroring' | 'revealed' | 'resonant' | 'afterglow';

export default function AlchemistIV_EnvyMirror({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [trait, setTrait] = useState('');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    onChange: (val: string) => setTrait(val),
    onAccept: () => {
      if (!trait.trim()) return;
      console.log(`[KBE:K] EnvyMirror trait="${trait.trim()}" shadowWork=confirmed envyToAmbition=true`);
      setStage('revealed');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    },
  });

  useEffect(() => { t(() => setStage('mirroring'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Emotional Regulation" kbe="knowing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ width: '24px', height: '30px', borderRadius: '12px 12px 0 0',
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 2)}` }} />
          </motion.div>
        )}
        {stage === 'mirroring' && (
          <motion.div key="m" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A mirror shows what you envy in others. Wipe it - it reveals your potential. Name the trait.
            </div>
            {/* Mirror */}
            <div style={{ width: '60px', height: '70px', borderRadius: '30px 30px 4px 4px',
              background: themeColor(TH.primaryHSL, 0.02, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <span style={{ fontSize: '11px', color: palette.textFaint, textAlign: 'center' }}>Your<br/>potential</span>
            </div>
            <input type="text" value={trait} onChange={(e) => typeInt.onChange(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && typeInt.onAccept()}
              placeholder="I envy their..."
              autoFocus
              style={{ width: '160px', padding: '6px 10px', borderRadius: radius.sm,
                background: themeColor(TH.primaryHSL, 0.02, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}`,
                color: palette.text, fontSize: '11px', outline: 'none', textAlign: 'center' }} />
            <motion.div whileTap={{ scale: 0.9 }} onClick={() => typeInt.onAccept()}
              style={{ padding: '12px 18px', borderRadius: '9999px', cursor: 'pointer',
                background: themeColor(TH.accentHSL, 0.08, 4),
                border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}`,
                opacity: trait.trim() ? 1 : 0.4 }}>
              <span style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.5, 14) }}>Reveal</span>
            </motion.div>
          </motion.div>
        )}
        {stage === 'revealed' && (
          <motion.div key="rv" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            You want: "{trait}." You do not envy what you cannot be - you envy what you suppressed. The jealousy is a map to your own buried gold. The mirror doesn{"'"}t show someone else{"'"}s treasure. It shows where you stopped digging.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Envy as data. Robert Plutchik{"'"}s emotion wheel: envy is a compound emotion mixing sadness (loss) and anger (injustice). Jung{"'"}s shadow theory: we envy in others what we{"'"}ve disowned in ourselves. Reframing envy as information - "What do I want that I{"'"}m not pursuing?" - transmutes a destructive emotion into actionable intelligence. The mirror technique: every envied trait is a suppressed ambition.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Revealed.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}