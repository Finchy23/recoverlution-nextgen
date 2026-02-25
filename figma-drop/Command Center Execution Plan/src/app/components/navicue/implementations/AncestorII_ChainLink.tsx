/**
 * ANCESTOR II #2 -- The Chain Link
 * "The rust stops with you. Polish it with your healing."
 * Pattern A (Tap) -- Iron chain; rusted link (Trauma); polish it to silver; lock to next
 * STEALTH KBE: Identifying family pattern to break = Intergenerational Healing / Cycle Breaking (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ANCESTORII_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette } = navicueQuickstart('poetic_precision', 'Transgenerational Meaning', 'knowing', 'Ember');
type Stage = 'arriving' | 'rusted' | 'polished' | 'resonant' | 'afterglow';

export default function AncestorII_ChainLink({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    placeholder: 'A family pattern to break...',
    onAccept: (val: string) => {
      console.log(`[KBE:K] ChainLink cycleBreaking=confirmed intergenerationalHealing=true length=${val.length}`);
      setStage('polished');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    },
  });

  useEffect(() => { t(() => setStage('rusted'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Transgenerational Meaning" kbe="knowing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <div style={{ display: 'flex' }}>
              {[0,1,2].map(i => (
                <div key={i} style={{ width: '10px', height: '6px', borderRadius: '3px',
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 2)}`,
                  marginLeft: i > 0 ? '-3px' : 0 }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'rusted' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A heavy chain. One link is rusted. Trauma passed down. Name it. Polish it. Pass it on clean.
            </div>
            {/* Chain with rusted link */}
            <div style={{ display: 'flex', alignItems: 'center' }}>
              {[0,1,2,3,4].map(i => (
                <div key={i} style={{ width: '14px', height: '8px', borderRadius: radius.xs,
                  border: `1px solid ${i === 2 ? 'hsla(20, 30%, 25%, 0.1)' : themeColor(TH.primaryHSL, 0.05, 3)}`,
                  background: i === 2 ? 'hsla(20, 30%, 20%, 0.04)' : 'transparent',
                  marginLeft: i > 0 ? '-4px' : 0 }} />
              ))}
            </div>
            <input type="text" value={typeInt.value}
              onChange={(e) => typeInt.onChange(e.target.value)}
              placeholder={typeInt.placeholder}
              style={{ width: '100%', maxWidth: '220px', padding: '8px 12px', borderRadius: '10px', fontSize: '11px',
                background: themeColor(TH.primaryHSL, 0.03, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 4)}`,
                color: palette.text, outline: 'none', fontFamily: 'inherit' }} />
            {typeInt.value.length > 2 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} whileTap={{ scale: 0.9 }}
                onClick={() => typeInt.onAccept(typeInt.value)}
                style={immersiveTapPillThemed(TH.accentHSL).container}>
                <div style={immersiveTapPillThemed(TH.accentHSL).label}>Polish</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'polished' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Polished. The rusted link gleams silver. You named the corrosion, and by naming it, you began the work of removing it. The rust stops with you. Do not pass it to the next link. The chain continues, but cleaner, stronger, shinier than it was handed to you. This is the deepest work a human being can do: heal what was passed to you, pass on what you{"'"}ve healed.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="rs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Intergenerational trauma and cycle breaking. Epigenetic research (Yehuda, 2015): trauma leaves molecular signatures that can be transmitted across generations through DNA methylation patterns. But transmission is not destiny. "Cycle breakers," individuals who consciously choose not to repeat harmful patterns, show distinct neural profiles: increased prefrontal activation (conscious override) and decreased amygdala reactivity. Family systems therapy (Bowen): differentiation of self is the process of becoming your own person while remaining connected to your family of origin.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Clean.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}