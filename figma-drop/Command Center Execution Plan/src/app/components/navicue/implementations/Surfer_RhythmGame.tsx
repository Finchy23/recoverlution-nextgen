/**
 * SURFER #2 — The Rhythm Game (The Zone)
 * "The conscious mind is too slow. Let the thumbs do the thinking."
 * ARCHETYPE: Pattern A (Tap) — Tap to the beat, timed hits
 * ENTRY: Cold open — notes flying
 * STEALTH KBE: High accuracy = Transient Hypofrontality / Flow (E)
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SURFER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'embodying', 'Practice');
type Stage = 'arriving' | 'playing' | 'zone' | 'resonant' | 'afterglow';

const BEAT_INTERVAL = 1200; // ms between beats
const TOTAL_BEATS = 8;

export default function Surfer_RhythmGame({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [beatIdx, setBeatIdx] = useState(0);
  const [hits, setHits] = useState(0);
  const [flash, setFlash] = useState(false);
  const [active, setActive] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };
  const windowRef = useRef(false);

  useEffect(() => { t(() => setStage('playing'), 2000); return () => T.current.forEach(clearTimeout); }, []);

  useEffect(() => {
    if (stage !== 'playing') return;
    let beat = 0;
    const iv = setInterval(() => {
      beat++;
      setBeatIdx(beat);
      setActive(true);
      windowRef.current = true;
      // Close hit window after 400ms
      setTimeout(() => { setActive(false); windowRef.current = false; }, 400);
      if (beat >= TOTAL_BEATS) {
        clearInterval(iv);
        t(() => {
          const accuracy = hits / TOTAL_BEATS;
          console.log(`[KBE:E] RhythmGame hits=${hits}/${TOTAL_BEATS} accuracy=${accuracy.toFixed(2)} transientHypofrontality=${accuracy > 0.6}`);
          setStage('zone');
          t(() => setStage('resonant'), 4500);
          t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
        }, 800);
      }
    }, BEAT_INTERVAL);
    return () => clearInterval(iv);
  }, [stage]);

  const tap = useCallback(() => {
    if (stage !== 'playing') return;
    if (windowRef.current) {
      setHits(h => h + 1);
      setFlash(true);
      setTimeout(() => setFlash(false), 200);
    }
  }, [stage]);

  const barProgress = beatIdx / TOTAL_BEATS;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '6px' }}>
            {[0, 1, 2, 3].map(i => (
              <motion.div key={i} animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 0.5, delay: i * 0.15, repeat: Infinity }}
                style={{ width: '4px', height: '12px', borderRadius: '2px',
                  background: themeColor(TH.accentHSL, 0.08, 4) }} />
            ))}
          </motion.div>
        )}
        {stage === 'playing' && (
          <motion.div key="pl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Tap the beat. Don{"'"}t think. Feel.
            </div>
            {/* Beat indicator */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {Array.from({ length: TOTAL_BEATS }).map((_, i) => (
                <motion.div key={i}
                  animate={i === beatIdx - 1 && active ? { scale: [1, 1.4, 1] } : {}}
                  transition={{ duration: 0.3 }}
                  style={{ width: '10px', height: '10px', borderRadius: '50%',
                    background: i < beatIdx
                      ? (i < hits ? themeColor(TH.accentHSL, 0.2, 10) : themeColor(TH.primaryHSL, 0.06, 3))
                      : themeColor(TH.primaryHSL, 0.04, 2),
                    border: i === beatIdx - 1 && active
                      ? `2px solid ${themeColor(TH.accentHSL, 0.3, 12)}`
                      : `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}`,
                    transition: 'all 0.15s' }} />
              ))}
            </div>
            <motion.div whileTap={{ scale: 0.85 }} onClick={tap}
              animate={flash ? { boxShadow: `0 0 20px ${themeColor(TH.accentHSL, 0.1, 8)}` } : {}}
              style={{ width: '80px', height: '80px', borderRadius: '50%', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: active
                  ? themeColor(TH.accentHSL, 0.1, 5)
                  : themeColor(TH.primaryHSL, 0.04, 2),
                border: `2px solid ${active ? themeColor(TH.accentHSL, 0.2, 10) : themeColor(TH.primaryHSL, 0.06, 4)}`,
                transition: 'all 0.15s' }}>
              <div style={{ ...navicueType.choice, color: active ? themeColor(TH.accentHSL, 0.5, 14) : palette.textFaint }}>
                TAP
              </div>
            </motion.div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              {hits}/{beatIdx} hits
            </div>
          </motion.div>
        )}
        {stage === 'zone' && (
          <motion.div key="z" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            {hits / TOTAL_BEATS > 0.6
              ? `${hits}/${TOTAL_BEATS}. The zone. Your conscious mind stepped back and let the body play. That's flow: transient hypofrontality.`
              : `${hits}/${TOTAL_BEATS}. Your mind was still trying to control the rhythm. Flow comes when thinking stops and feeling begins.`}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Transient hypofrontality. During flow, the prefrontal cortex, the brain{"'"}s inner critic, planner, and worrier, temporarily quiets. The conscious mind is too slow for rhythm. Your thumbs know the beat before your brain can calculate it. Flow state lives in the gap between thinking and feeling. Don{"'"}t think. Feel.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Zoned.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}