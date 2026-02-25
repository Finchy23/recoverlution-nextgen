/**
 * ANCESTOR II #10 -- The Ancestor Seal
 * "You are the outer ring. Protect the heartwood."
 * Pattern A (Tap) -- Giant sequoia cross-section; rings radiate; seal legacy
 * STEALTH KBE: Completion = Transgenerational Meaning mastery confirmed
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ANCESTORII_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'rings' | 'sealed' | 'resonant' | 'afterglow';

export default function AncestorII_AncestorSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('rings'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const seal = () => {
    if (stage !== 'rings') return;
    console.log(`[KBE:K] AncestorSeal transgenerationalMeaning=confirmed generativity=true`);
    setStage('sealed');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Transgenerational Meaning" kbe="knowing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }}
            animate={{ opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 2.5, repeat: Infinity }} exit={{ opacity: 0 }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '50%',
              border: `1px solid ${themeColor(TH.accentHSL, 0.04, 2)}` }} />
          </motion.div>
        )}
        {stage === 'rings' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            {/* Sequoia cross-section rings */}
            <svg width="80" height="80" viewBox="0 0 80 80">
              {[35, 30, 25, 20, 15, 10, 6, 3].map((r, i) => (
                <circle key={i} cx="40" cy="40" r={r} fill="none"
                  stroke={themeColor(TH.accentHSL, 0.03 + i * 0.005, 2 + i * 0.3)} strokeWidth="0.5" />
              ))}
              {/* Heartwood center */}
              <motion.circle cx="40" cy="40" r="2"
                initial={{ opacity: 0.08 }}
                animate={{ opacity: [0.08, 0.14, 0.08] }}
                transition={{ duration: 3, repeat: Infinity }}
                fill={themeColor(TH.accentHSL, 0.12, 8)} />
              {/* Outer ring (you) */}
              <motion.circle cx="40" cy="40" r="36" fill="none"
                stroke={themeColor(TH.accentHSL, 0.06, 4)} strokeWidth="1"
                initial={{ opacity: 0.04 }}
                animate={{ opacity: [0.04, 0.08, 0.04] }}
                transition={{ duration: 4, repeat: Infinity }} />
            </svg>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '240px', fontStyle: 'italic' }}>
              You are the outer ring. Protect the heartwood.
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={seal}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Protect</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'sealed' && (
          <motion.div key="se" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px', fontStyle: 'italic' }}>
            Sealed. The Ancestor: you planned a century, polished the rusted link, recorded your truth, etched your verb, passed the torch, placed your book, dropped the pebble, took your seat, audited your inheritance, and now you stand as the outer ring of a giant sequoia. You are the outer ring. The one exposed to weather, fire, and time. Protect the heartwood. The rings inside you are everyone who came before. The rings that will grow after you depend on the bark you build today.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="rs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Erikson{"'"}s generativity vs. stagnation. The 7th stage of psychosocial development: the concern for establishing and guiding the next generation. Giant sequoias (Sequoiadendron giganteum): the oldest are over 3,000 years old; each ring records a year of growth, drought, fire, and recovery. Dendrochronology: reading tree rings is reading the autobiography of a living system. Generative adults report higher life meaning, lower death anxiety, and greater well-being (McAdams). The outer ring protects the heartwood. You are that ring. Build it strong.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Ring.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}