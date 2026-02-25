/**
 * BIOGRAPHER #8 — The Genre Switch (Distance-Based Reappraisal)
 * "It feels tragic. But from a distance, it is hilarious. Change the lens."
 * ARCHETYPE: Pattern B (Drag) — Swipe/drag to cycle genre filters
 * ENTRY: Scene-first — tragedy text block appears before genre controls
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { BIOGRAPHER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('poetic_precision', 'Metacognition', 'believing', 'Theater');
type Stage = 'scene' | 'active' | 'switched' | 'resonant' | 'afterglow';

const GENRES = [
  { id: 'tragedy', label: 'TRAGEDY', text: 'Everything fell apart. The plan failed. They stood there, alone, watching it all collapse.' },
  { id: 'comedy', label: 'COMEDY', text: 'Everything fell apart \u2014 spectacularly. The plan was so bad it was almost impressive. They stood there, dumbfounded, and honestly? It was kind of hilarious.' },
  { id: 'heist', label: 'HEIST', text: 'The first plan failed. But that was always part of the bigger plan. They stood there, letting them think they\'d lost, while the real move was already in motion.' },
  { id: 'romance', label: 'ROMANCE', text: 'Everything fell apart, but standing in the wreckage, they finally saw what mattered. It was never the plan. It was who was still standing next to them.' },
];

export default function Biographer_GenreSwitch({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const [genreIdx, setGenreIdx] = useState(0);
  const [hasSwapped, setHasSwapped] = useState(false);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2600);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const switchGenre = (dir: number) => {
    const next = (genreIdx + dir + GENRES.length) % GENRES.length;
    setGenreIdx(next);
    if (!hasSwapped && next !== 0) {
      setHasSwapped(true);
    }
  };

  const confirm = () => {
    setStage('switched');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  const genre = GENRES[genreIdx];

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Metacognition" kbe="believing" form="Theater" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="sc" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '270px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.12em',
              color: themeColor(TH.accentHSL, 0.2, 6) }}>GENRE: TRAGEDY</div>
            <div style={{ fontSize: '12px', fontFamily: 'serif', fontStyle: 'italic', lineHeight: 1.6,
              color: palette.textFaint, textAlign: 'center' }}>
              {GENRES[0].text}
            </div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              It feels tragic. But from a distance, it is hilarious. Change the lens. Laugh at the absurdity.
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <motion.div onClick={() => switchGenre(-1)} whileTap={{ scale: 0.9 }}
                style={{ width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.08, 6)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', color: themeColor(TH.accentHSL, 0.25, 10) }}>{'\u2039'}</motion.div>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.1em',
                color: themeColor(TH.accentHSL, 0.3, 10), minWidth: '70px', textAlign: 'center' }}>
                {genre.label}
              </div>
              <motion.div onClick={() => switchGenre(1)} whileTap={{ scale: 0.9 }}
                style={{ width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.06, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.08, 6)}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', color: themeColor(TH.accentHSL, 0.25, 10) }}>{'\u203a'}</motion.div>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={genre.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                style={{ padding: '14px', borderRadius: radius.sm, width: '250px',
                  background: themeColor(TH.primaryHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.06, 4)}` }}>
                <div style={{ fontSize: '12px', fontFamily: 'serif', fontStyle: 'italic', lineHeight: 1.6,
                  color: palette.text, textAlign: 'center' }}>{genre.text}</div>
              </motion.div>
            </AnimatePresence>
            {hasSwapped && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={confirm}
                style={{ padding: '12px 22px', borderRadius: radius.full, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.08, 6),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.1, 10)}` }}>
                <div style={{ ...navicueType.hint, color: themeColor(TH.accentHSL, 0.35, 15) }}>keep this lens</div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'switched' && (
          <motion.div key="sw" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.12em',
              color: themeColor(TH.accentHSL, 0.3, 12) }}>GENRE: {genre.label}</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1 }}
              style={{ ...navicueType.hint, color: palette.textFaint }}>same story, different genre</motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Distance-Based Reappraisal. Humor requires psychological distance. Retelling a painful event in a different genre forces the brain to detach from immediate pain. The events didn't change. The lens did.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Same story.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}