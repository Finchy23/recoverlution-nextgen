/**
 * DREAMWALKER #6 — The Dream Journal
 * "Write it down before it evaporates."
 * ARCHETYPE: Pattern D (Type) — Type a fragment from a dream —
 * any dream, real or invented. The act of writing bridges
 * conscious and unconscious. Dream journaling as integration.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { DREAMWALKER_THEME, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Ocean');
const TH = DREAMWALKER_THEME;
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

export default function DreamWalker_DreamJournal({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const timersRef = useRef<number[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  const typer = useTypeInteraction({
    minLength: 8,
    onAccept: () => {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 3000);
    },
  });

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (stage === 'active') addTimer(() => inputRef.current?.focus(), 300);
  }, [stage]);

  const chars = typer.value.length;
  const inkDensity = Math.min(chars / 40, 1);

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Ocean" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The dream is fading...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Dreams dissolve like mist. Within five minutes of waking, you forget ninety percent. Write it down. Any fragment. Real or invented. The bridge between conscious and unconscious is a pen.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>write a dream fragment</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', width: '100%', maxWidth: '300px' }}>

            {/* Journal page */}
            <div style={{ position: 'relative', width: '100%', padding: '16px',
              background: themeColor(TH.voidHSL, 0.5, 3),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 8)}`,
              borderRadius: radius.sm }}>

              {/* Faint ruled lines */}
              <div style={{ position: 'absolute', inset: '30px 16px 16px', pointerEvents: 'none' }}>
                {Array.from({ length: 6 }, (_, i) => (
                  <div key={i} style={{ position: 'absolute', left: 0, right: 0, top: `${i * 22}px`,
                    height: '1px', background: themeColor(TH.primaryHSL, 0.03, 5) }} />
                ))}
              </div>

              {/* Ink blot — grows with writing */}
              <motion.div
                animate={{ opacity: inkDensity * 0.08, scale: 0.5 + inkDensity * 0.5 }}
                style={{ position: 'absolute', top: '20px', right: '20px', width: '40px', height: '40px',
                  borderRadius: '50%', background: themeColor(TH.accentHSL, 0.06, 12),
                  filter: 'blur(8px)' }} />

              {/* Date line */}
              <div style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.1em',
                color: themeColor(TH.accentHSL, 0.08, 10), marginBottom: '10px' }}>
                DREAM ENTRY — {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }).toUpperCase()}
              </div>

              <textarea
                ref={inputRef}
                value={typer.value}
                onChange={e => typer.onChange(e.target.value)}
                placeholder="I was in a place that felt like home but wasn't..."
                disabled={typer.accepted}
                rows={4}
                style={{
                  width: '100%', padding: '8px 0', fontSize: '14px',
                  fontFamily: 'serif', fontStyle: 'italic', lineHeight: '22px',
                  background: 'transparent', border: 'none', resize: 'none',
                  color: typer.accepted
                    ? themeColor(TH.accentHSL, 0.5, 25)
                    : palette.text,
                  outline: 'none',
                }}
              />
            </div>

            {/* Dissolve indicator */}
            {!typer.accepted && (
              <motion.div
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ fontSize: '11px', fontFamily: 'monospace', letterSpacing: '0.1em',
                  color: themeColor(TH.accentHSL, 0.1, 10) }}>
                {chars < 8 ? 'THE DREAM IS FADING...' : 'CAPTURED'}
              </motion.div>
            )}

            {!typer.accepted && chars >= 8 && (
              <motion.button
                initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}
                onClick={typer.submit}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '12px 18px',
                  ...navicueType.hint, color: palette.textFaint }}>
                seal the entry
              </motion.button>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              You caught it. A fragment of the night{'\u2019'}s journey, pinned to the page before it evaporated. Dream journaling is the practice of listening to yourself while you sleep.
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>the pen is the bridge</div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} style={{ textAlign: 'center' }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint }}>Before it evaporates.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}