/**
 * SURFER #8 — The Micro-Flow
 * "Flow lives between Boredom and Anxiety. Find the channel."
 * ARCHETYPE: Pattern B (Drag) — Drag difficulty slider; connect dots at right level
 * ENTRY: Instruction-as-poetry — Yerkes-Dodson
 * STEALTH KBE: Finding the middle = Self-Knowledge / Challenge Calibration (K)
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { SURFER_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'knowing', 'Practice');
type Stage = 'arriving' | 'calibrating' | 'channel' | 'resonant' | 'afterglow';

export default function Surfer_MicroFlow({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [difficulty, setDifficulty] = useState(0.2); // 0 = too easy, 1 = too hard, 0.4-0.6 = flow
  const [dotCount, setDotCount] = useState(3);
  const [connected, setConnected] = useState(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('calibrating'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  useEffect(() => {
    setDotCount(Math.floor(3 + difficulty * 8));
    setConnected(0);
  }, [difficulty]);

  const connectDot = () => {
    if (stage !== 'calibrating') return;
    const next = connected + 1;
    setConnected(next);
    if (next >= dotCount) {
      const isFlow = difficulty >= 0.35 && difficulty <= 0.65;
      console.log(`[KBE:K] MicroFlow difficulty=${difficulty.toFixed(2)} inFlowChannel=${isFlow} selfKnowledge=confirmed`);
      setStage('channel');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    }
  };

  const zone = difficulty < 0.35 ? 'bored' : difficulty > 0.65 ? 'anxious' : 'flow';

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="knowing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', gap: '6px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{ width: '4px', height: '4px', borderRadius: '50%',
                background: themeColor(TH.accentHSL, 0.08, 4) }} />
            ))}
          </motion.div>
        )}
        {stage === 'calibrating' && (
          <motion.div key="cal" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Connect the dots. Adjust the challenge.
            </div>
            {/* Dots to connect */}
            <div style={{ width: '180px', height: '60px', position: 'relative',
              borderRadius: radius.sm, overflow: 'hidden',
              background: themeColor(TH.primaryHSL, 0.02, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 2)}` }}>
              {Array.from({ length: dotCount }).map((_, i) => {
                const isConnected = i < connected;
                return (
                  <motion.div key={i} whileTap={!isConnected ? { scale: 0.7 } : {}}
                    onClick={!isConnected && i === connected ? connectDot : undefined}
                    style={{ position: 'absolute',
                      left: `${10 + (i / dotCount) * 155}px`,
                      top: `${15 + Math.sin(i * 1.3) * 15}px`,
                      width: '8px', height: '8px', borderRadius: '50%',
                      cursor: i === connected ? 'pointer' : 'default',
                      background: isConnected
                        ? themeColor(TH.accentHSL, 0.2, 10)
                        : themeColor(TH.primaryHSL, 0.06, 4),
                      border: i === connected
                        ? `2px solid ${themeColor(TH.accentHSL, 0.3, 12)}`
                        : `1px solid ${themeColor(TH.primaryHSL, 0.08, 5)}`,
                      transition: 'all 0.2s' }} />
                );
              })}
            </div>
            {/* Zone indicator */}
            <div style={{ ...navicueType.texture,
              color: zone === 'flow'
                ? themeColor(TH.accentHSL, 0.4, 14)
                : zone === 'bored' ? palette.textFaint : 'hsla(0, 15%, 35%, 0.25)',
              textAlign: 'center', fontStyle: 'italic' }}>
              {zone === 'bored' ? 'Too easy...' : zone === 'anxious' ? 'Too hard...' : 'Just right. Flow channel.'}
            </div>
            {/* Difficulty slider */}
            <div style={{ width: '180px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: palette.textFaint }}>Easy</span>
              <input type="range" min="0" max="100" value={difficulty * 100}
                onChange={e => setDifficulty(Number(e.target.value) / 100)}
                style={{ flex: 1, accentColor: themeColor(TH.accentHSL, 0.3, 10) }} />
              <span style={{ fontSize: '11px', color: palette.textFaint }}>Hard</span>
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>
              {connected}/{dotCount} connected
            </div>
          </motion.div>
        )}
        {stage === 'channel' && (
          <motion.div key="ch" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            {zone === 'flow'
              ? 'The flow channel. Challenge matched skill. Not too easy, not too hard: just enough to care without panicking. You found the zone.'
              : zone === 'bored'
                ? 'Completed, but too easy. No flow. Boredom is the signal to increase the challenge. Find the edge.'
                : 'Completed, but anxious. Too much challenge overwhelms. Dial it back. Flow lives in the middle.'}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            The Yerkes-Dodson Law. Performance increases with arousal, but only to a point. Too little challenge = boredom. Too much = anxiety. Flow lives in the narrow channel between them. Csikszentmihalyi{"'"}s research shows that finding this channel is a skill; it requires knowing yourself well enough to calibrate the challenge. Self-knowledge is the prerequisite for flow.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Calibrated.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}