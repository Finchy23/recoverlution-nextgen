/**
 * ASTRONAUT #6 -- The Galaxy Spin
 * "The iron in your blood was forged in a collapsing star. You ARE the universe."
 * ARCHETYPE: Pattern B (Drag) -- Drag to spin galaxy, then claim a star
 * ENTRY: Scene-first -- galaxy in your hand
 * STEALTH KBE: Claiming a star = Cosmic Connection belief (B)
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ASTRONAUT_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'spinning' | 'claimed' | 'resonant' | 'afterglow';

export default function Astronaut_GalaxySpin({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [rotation, setRotation] = useState(0);
  const [totalSpin, setTotalSpin] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const lastX = useRef(0);

  useEffect(() => { t(() => setStage('spinning'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const onMove = useCallback((e: React.PointerEvent) => {
    if (stage !== 'spinning') return;
    const dx = e.clientX - lastX.current;
    lastX.current = e.clientX;
    setRotation(r => r + dx * 0.5);
    setTotalSpin(s => {
      const next = s + Math.abs(dx);
      return next;
    });
  }, [stage]);

  const claim = () => {
    if (stage !== 'spinning') return;
    console.log(`[KBE:B] GalaxySpin totalSpin=${Math.round(totalSpin)} cosmicConnection=confirmed`);
    setStage('claimed');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  const STARS = Array.from({ length: 20 }).map((_, i) => ({
    angle: (i / 20) * Math.PI * 6,
    dist: 8 + (i / 20) * 30,
    size: 1 + Math.random() * 1.5,
    bright: 0.08 + Math.random() * 0.12,
  }));

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }}
            style={{ width: '40px', height: '40px', borderRadius: '50%', position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {STARS.slice(0, 8).map((s, i) => (
              <div key={i} style={{ position: 'absolute',
                left: `${20 + Math.cos(s.angle) * s.dist * 0.5}px`,
                top: `${20 + Math.sin(s.angle) * s.dist * 0.5}px`,
                width: `${s.size}px`, height: `${s.size}px`, borderRadius: '50%',
                background: themeColor(TH.accentHSL, s.bright, 10) }} />
            ))}
          </motion.div>
        )}
        {stage === 'spinning' && (
          <motion.div key="sp" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onPointerMove={onMove} onPointerDown={e => { lastX.current = e.clientX; }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px',
              maxWidth: '300px', touchAction: 'none', userSelect: 'none' }}>
            <div style={{ ...navicueType.hint, color: palette.textFaint, letterSpacing: '0.08em' }}>
              a galaxy in your hand
            </div>
            {/* Galaxy SVG with rotation */}
            <div style={{ width: '100px', height: '100px', position: 'relative',
              transform: `rotate(${rotation}deg)`, transition: 'transform 0.05s linear' }}>
              {STARS.map((s, i) => (
                <div key={i} style={{ position: 'absolute',
                  left: `${50 + Math.cos(s.angle) * s.dist}px`,
                  top: `${50 + Math.sin(s.angle) * s.dist}px`,
                  width: `${s.size}px`, height: `${s.size}px`, borderRadius: '50%',
                  background: themeColor(TH.accentHSL, s.bright, 8 + i % 5) }} />
              ))}
              {/* Core */}
              <div style={{ position: 'absolute', left: '47px', top: '47px',
                width: '6px', height: '6px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.2, 12),
                boxShadow: `0 0 8px ${themeColor(TH.accentHSL, 0.06, 8)}` }} />
            </div>
            <div style={{ ...navicueType.texture, color: palette.textFaint, fontStyle: 'italic' }}>
              drag to spin -- it{"'"}s heavy and majestic
            </div>
            {totalSpin > 200 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                whileTap={{ scale: 0.95 }} onClick={claim}
                style={immersiveTapPillThemed(TH.accentHSL).container}>
                <div style={immersiveTapPillThemed(TH.accentHSL).label}>Claim a star</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'claimed' && (
          <motion.div key="cl" initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.5 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div animate={{ opacity: [0.4, 0.8, 0.4] }} transition={{ duration: 3, repeat: Infinity }}
              style={{ width: '4px', height: '4px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.3, 14),
                boxShadow: `0 0 12px ${themeColor(TH.accentHSL, 0.08, 10)}` }} />
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '280px',
              fontStyle: 'italic' }}>
              You are made of this. The iron in your blood was forged in a collapsing star. You are not in the universe. You are the universe.
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Cosmic connection. Every heavy element in your body -- the iron in your blood, the calcium in your bones, the carbon in your cells -- was forged inside a dying star billions of years ago. You are not observing the universe from the outside. You are the universe observing itself. Claiming a star is claiming your origin.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Cosmic.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}