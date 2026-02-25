/**
 * ANCESTOR II #5 -- The Torch Pass
 * "It is not your fire. You are just the carrier."
 * Pattern A (Tap) -- Running with torch; grab from ancestor; pass to descendant
 * STEALTH KBE: Accepting and passing torch = Linked Identity / Continuity (B)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ANCESTORII_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'running' | 'received' | 'passed' | 'resonant' | 'afterglow';

export default function AncestorII_TorchPass({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('running'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const grab = () => {
    if (stage !== 'running') return;
    setStage('received');
  };

  const pass = () => {
    if (stage !== 'received') return;
    console.log(`[KBE:B] TorchPass continuity=confirmed linkedIdentity=true`);
    setStage('passed');
    t(() => setStage('resonant'), 5500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
  };

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Transgenerational Meaning" kbe="believing" form="Ember" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}>
            <motion.div animate={{ x: [-3, 3, -3] }} transition={{ duration: 0.8, repeat: Infinity }}>
              <div style={{ width: '3px', height: '10px', borderRadius: '1px',
                background: themeColor(TH.accentHSL, 0.06, 3) }} />
            </motion.div>
          </motion.div>
        )}
        {stage === 'running' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You are running. Behind you: a hand reaching back (your ancestor). Ahead: a hand reaching forward (your descendant). Grab the torch.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: palette.textFaint }}>Past ←</span>
              <motion.div animate={{ opacity: [0.04, 0.08, 0.04] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ width: '6px', height: '14px', borderRadius: '1px',
                  background: themeColor(TH.accentHSL, 0.08, 4) }} />
              <span style={{ fontSize: '11px', color: palette.textFaint }}>→ Future</span>
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={grab}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Light</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'received' && (
          <motion.div key="rc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              You hold the torch. It burns. It is not your fire. You are just the carrier. Now pass it forward. Run while you have the legs.
            </div>
            <motion.div
              animate={{ boxShadow: [`0 0 6px ${themeColor(TH.accentHSL, 0.04, 4)}`, `0 0 12px ${themeColor(TH.accentHSL, 0.06, 6)}`, `0 0 6px ${themeColor(TH.accentHSL, 0.04, 4)}`] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{ width: '6px', height: '16px', borderRadius: '1px',
                background: themeColor(TH.accentHSL, 0.1, 5) }} />
            <motion.div whileTap={{ scale: 0.9 }} onClick={pass}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Pass Forward →</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'passed' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Passed. The torch is in the next hand now. The relay continues. It is not your fire. You are just the carrier. Keep it burning. Run while you have the legs. The baton is in your hand for only one leg of the race. Make that leg count, but know that the race extends infinitely in both directions. You were always in the middle.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="rs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '300px' }}>
            Linked identity and the relay metaphor. The Olympic torch relay: originated in 1936 Berlin Olympics, symbolizing the continuity from ancient Greece to the modern world. Erikson{"'"}s generativity: mature adults understand themselves as links in a chain. Terror Management Theory (Greenberg): awareness of mortality motivates "symbolic immortality projects," contributions that outlast the individual. The relay metaphor is psychologically powerful because it honors both the significance of your leg and the humility of knowing it{"'"}s only one leg.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Carried.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}