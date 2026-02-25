/**
 * FUTURE WEAVER #10 — The Weaver Seal (Temporal Integration)
 * "Time is not a line. It is a fabric. You are the weaver."
 * ARCHETYPE: Pattern A (Tap) — Loom weaving past, present, future
 * ENTRY: Cold open — loom
 * STEALTH KBE: Completion = Temporal Integration
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { FUTUREWEAVER_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('poetic_precision', 'Metacognition', 'knowing', 'Identity Koan');
type Stage = 'arriving' | 'loom' | 'weaving' | 'woven' | 'resonant' | 'afterglow';

export default function FutureWeaver_WeaverSeal({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [threads, setThreads] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('loom'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  const weave = () => {
    if (stage === 'loom') setStage('weaving');
    if (stage !== 'weaving' && stage !== 'loom') return;
    const next = threads + 1;
    setThreads(next);
    if (next >= 3) {
      console.log(`[KBE:K] WeaverSeal temporalIntegration=confirmed past=woven present=woven future=woven`);
      setStage('woven');
      t(() => setStage('resonant'), 5500);
      t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
    }
  };

  const THREAD_LABELS = ['Past', 'Present', 'Future'];
  const THREAD_COLORS = [
    themeColor(TH.primaryHSL, 0.08, 4),
    themeColor(TH.accentHSL, 0.1, 6),
    themeColor(TH.accentHSL, 0.06, 4),
  ];

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="knowing" form="Identity Koan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '4px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: '2px', height: '20px', borderRadius: '1px',
                background: THREAD_COLORS[i], opacity: 0.4 }} />
            ))}
          </motion.div>
        )}
        {(stage === 'loom' || stage === 'weaving') && (
          <motion.div key="lo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', fontStyle: 'italic' }}>
              Three threads. One tapestry. Weave them.
            </div>
            {/* Loom */}
            <div style={{ width: '120px', height: '60px', position: 'relative',
              borderRadius: radius.xs,
              background: themeColor(TH.primaryHSL, 0.02, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 3)}`,
              overflow: 'hidden' }}>
              {/* Vertical warp threads */}
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ position: 'absolute', left: `${10 + i * 14}px`, top: 0, bottom: 0,
                  width: '1px', background: themeColor(TH.primaryHSL, 0.03, 2) }} />
              ))}
              {/* Woven threads */}
              {Array.from({ length: threads }).map((_, i) => (
                <motion.div key={i} initial={{ width: 0 }} animate={{ width: '100%' }}
                  transition={{ duration: 0.5 }}
                  style={{ position: 'absolute', left: 0, top: `${15 + i * 15}px`,
                    height: '3px', borderRadius: '1px',
                    background: THREAD_COLORS[i] }} />
              ))}
              {/* Labels */}
              {THREAD_LABELS.slice(0, threads).map((label, i) => (
                <div key={label} style={{ position: 'absolute', right: '4px', top: `${12 + i * 15}px`,
                  fontSize: '11px', color: THREAD_COLORS[i] }}>{label}</div>
              ))}
            </div>
            <motion.div whileTap={{ scale: 0.9 }} onClick={weave}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>
                Weave ({threads}/3)
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'woven' && (
          <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px', fontStyle: 'italic' }}>
            Woven. Past, Present, Future — not a line, but a fabric. You are the weaver. The tapestry is strong because each thread runs through all the others. Time is not sequential; it{"'"}s interlaced.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Temporal integration. The ability to seamlessly connect past experiences, present actions, and future goals is a key indicator of psychological health (Zimbardo & Boyd{"'"}s Time Perspective Theory). People with balanced time perspectives — who honor the past, engage the present, and envision the future — show higher well-being, better decision-making, and greater resilience. You are not a point on a timeline. You are the weaver of the fabric.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Woven.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}