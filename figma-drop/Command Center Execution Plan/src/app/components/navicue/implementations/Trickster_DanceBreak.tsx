/**
 * TRICKSTER #3 — The Dance Break
 * "You are a brain in a jar. Shake the jar. Move the meat suit."
 * ARCHETYPE: Pattern B (Drag) — Wiggle drag interaction to "shake" the system
 * ENTRY: Cold open — "System Overheated"
 * STEALTH KBE: Vigorous wiggle = Somatic Release (E)
 * WEB ADAPTATION: Gyroscope → rapid drag back-and-forth
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { TRICKSTER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('pattern_glitch', 'Metacognition', 'embodying', 'Storm');
type Stage = 'arriving' | 'frozen' | 'shaking' | 'unlocked' | 'resonant' | 'afterglow';

export default function Trickster_DanceBreak({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [wiggle, setWiggle] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const lastX = useRef(0);
  const dirChanges = useRef(0);
  const lastDir = useRef(0);

  useEffect(() => { t(() => setStage('frozen'), 1800); return () => T.current.forEach(clearTimeout); }, []);

  const startShake = () => { if (stage === 'frozen') setStage('shaking'); };

  const handleMove = useCallback((e: React.PointerEvent) => {
    if (stage !== 'shaking') return;
    const dx = e.clientX - lastX.current;
    const dir = dx > 0 ? 1 : -1;
    if (lastDir.current !== 0 && dir !== lastDir.current) {
      dirChanges.current += 1;
      const pct = Math.min(1, dirChanges.current / 30);
      setWiggle(pct);
      if (pct >= 1) {
        console.log(`[KBE:E] DanceBreak somaticRelease=confirmed wiggleDirChanges=${dirChanges.current}`);
        setStage('unlocked');
        t(() => setStage('resonant'), 4500);
        t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
      }
    }
    lastDir.current = dir;
    lastX.current = e.clientX;
  }, [stage]);

  return (
    <NaviCueShell signatureKey="pattern_glitch" mechanism="Metacognition" kbe="embodying" form="Storm" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} exit={{ opacity: 0 }}
            style={{ padding: '10px 18px', borderRadius: radius.sm,
              background: 'hsla(0, 20%, 20%, 0.04)',
              border: '1px solid hsla(0, 15%, 30%, 0.08)' }}>
            <span style={{ fontSize: '11px', color: 'hsla(0, 20%, 40%, 0.25)', fontFamily: 'monospace' }}>
              SYSTEM OVERHEATED
            </span>
          </motion.div>
        )}
        {stage === 'frozen' && (
          <motion.div key="fr" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <motion.div animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 1.2, repeat: Infinity }}
              style={{ padding: '12px 20px', borderRadius: radius.sm,
                background: 'hsla(0, 18%, 22%, 0.04)',
                border: '1px solid hsla(0, 15%, 30%, 0.08)' }}>
              <span style={{ fontSize: '11px', color: 'hsla(0, 20%, 40%, 0.3)', fontFamily: 'monospace', letterSpacing: '0.08em' }}>
                SYSTEM OVERHEATED
              </span>
            </motion.div>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Interface frozen. To unlock: shake it.
            </div>
            <motion.div whileTap={{ scale: 0.95 }} onClick={startShake}
              style={immersiveTapPillThemed(TH.accentHSL, 'bold').container}>
              <div style={immersiveTapPillThemed(TH.accentHSL, 'bold').label}>Begin shake</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'shaking' && (
          <motion.div key="sh" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onPointerMove={handleMove}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
              maxWidth: '300px', cursor: 'grab', touchAction: 'none', userSelect: 'none' }}>
            <motion.div animate={{ x: [-(wiggle * 8), (wiggle * 8)], rotate: [-(wiggle * 5), (wiggle * 5)] }}
              transition={{ duration: 0.15, repeat: Infinity, repeatType: 'reverse' }}
              style={{ padding: '12px 20px', borderRadius: radius.sm,
                background: `hsla(0, ${18 - wiggle * 18}%, ${22 + wiggle * 10}%, 0.04)`,
                border: `1px solid ${themeColor(TH.accentHSL, 0.08 + wiggle * 0.1, 6)}` }}>
              <span style={{ fontSize: '11px', fontFamily: 'monospace',
                color: themeColor(TH.accentHSL, 0.2 + wiggle * 0.2, 8), letterSpacing: '0.08em' }}>
                {wiggle < 0.5 ? 'REBOOTING...' : wiggle < 0.8 ? 'ALMOST...' : 'UNLOCKING!'}
              </span>
            </motion.div>
            <div style={{ width: '160px', height: '6px', borderRadius: '3px',
              background: themeColor(TH.primaryHSL, 0.04, 2) }}>
              <motion.div style={{ height: '100%', borderRadius: '3px', width: `${wiggle * 100}%`,
                background: themeColor(TH.accentHSL, 0.2 + wiggle * 0.15, 8) }} />
            </div>
            <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.3, 10) }}>
              drag wildly back and forth. shake it loose
            </div>
          </motion.div>
        )}
        {stage === 'unlocked' && (
          <motion.div key="u" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 10 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: themeColor(TH.accentHSL, 0.45, 14), textAlign: 'center', maxWidth: '260px' }}>
              Unlocked. The jar is reconnected. Brain met body. The system is cool again.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Somatic release. You are a brain in a jar. The body isn{"'"}t a vehicle. It{"'"}s a partner. Movement metabolizes stress hormones that thinking cannot. Shake the jar. Move the meat suit. Ten seconds of vigorous movement can reset the entire nervous system.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Shaken.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}