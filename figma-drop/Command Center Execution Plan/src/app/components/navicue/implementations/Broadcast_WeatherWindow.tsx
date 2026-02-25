/**
 * BROADCAST #8 — The Weather Window
 * "Do not disconnect from the earth. Let it rain on your screen too."
 * ARCHETYPE: Pattern D (Type) — Type the weather outside, screen mirrors it
 * ENTRY: Scene-First — a window frame already showing mist
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { BROADCAST_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { useTypeInteraction } from '../interactions/useTypeInteraction';

const { palette, radius } = navicueQuickstart('sensory_cinema', 'Metacognition', 'believing', 'Practice');
type Stage = 'scene' | 'active' | 'resonant' | 'afterglow';

export default function Broadcast_WeatherWindow({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('scene');
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  const typeInt = useTypeInteraction({
    minLength: 3,
    onAccept: () => {
      setStage('resonant');
      t(() => { setStage('afterglow'); onComplete?.(); }, 5500);
    },
  });

  useEffect(() => {
    t(() => setStage('active'), 2200);
    return () => T.current.forEach(clearTimeout);
  }, []);

  // Derive weather visualization from typed text
  const text = typeInt.value.toLowerCase();
  const isRain = text.includes('rain') || text.includes('storm') || text.includes('drizzle');
  const isSun = text.includes('sun') || text.includes('clear') || text.includes('bright');
  const isSnow = text.includes('snow') || text.includes('cold') || text.includes('ice');
  const isCloudy = text.includes('cloud') || text.includes('grey') || text.includes('gray') || text.includes('overcast');

  const bgHue = isRain ? 210 : isSun ? 40 : isSnow ? 200 : isCloudy ? 220 : 200;
  const bgSat = isRain ? 15 : isSun ? 25 : isSnow ? 10 : 8;
  const bgLight = isRain ? 12 : isSun ? 18 : isSnow ? 16 : 14;

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'scene' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '180px', height: '120px', borderRadius: radius.xs,
              border: `2px solid ${themeColor(TH.primaryHSL, 0.06, 5)}`,
              background: themeColor(TH.voidHSL, 0.95, 2),
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <div style={{ fontSize: '11px', fontFamily: 'monospace', color: palette.textFaint, opacity: 0.3 }}>
                {'\u2601'} mist
              </div>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} transition={{ delay: 1 }}
              style={{ ...navicueType.hint, color: palette.textFaint, fontStyle: 'italic' }}>a window</motion.div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', marginBottom: '8px' }}>
              Do not disconnect from the earth. What is the weather outside right now? Type it. Let it appear on your screen. Sync with the sky.
            </div>
            <div style={{
              width: '200px', height: '120px', borderRadius: radius.xs,
              border: `2px solid ${themeColor(TH.primaryHSL, 0.06, 5)}`,
              background: text.length > 0 ? `hsla(${bgHue}, ${bgSat}%, ${bgLight}%, 0.15)` : themeColor(TH.voidHSL, 0.95, 2),
              position: 'relative', overflow: 'hidden', transition: 'background 0.5s',
            }}>
              {/* Rain drops */}
              {isRain && Array.from({ length: 12 }, (_, i) => (
                <motion.div key={`r${i}`}
                  animate={{ y: [0, 120], opacity: [0.2, 0] }}
                  transition={{ duration: 0.8 + Math.random() * 0.5, repeat: Infinity, delay: Math.random() * 0.5 }}
                  style={{
                    position: 'absolute', left: `${10 + i * 16}px`, top: '-5px',
                    width: '1px', height: '8px', borderRadius: '1px',
                    background: 'hsla(210, 20%, 50%, 0.15)',
                  }} />
              ))}
              {/* Snow particles */}
              {isSnow && Array.from({ length: 8 }, (_, i) => (
                <motion.div key={`s${i}`}
                  animate={{ y: [0, 120], x: [0, Math.sin(i) * 20] }}
                  transition={{ duration: 2 + Math.random(), repeat: Infinity, delay: Math.random() }}
                  style={{
                    position: 'absolute', left: `${15 + i * 22}px`, top: '-5px',
                    width: '4px', height: '4px', borderRadius: '50%',
                    background: 'hsla(200, 10%, 70%, 0.12)',
                  }} />
              ))}
              {/* Sun glow */}
              {isSun && (
                <motion.div
                  animate={{ opacity: [0.06, 0.1, 0.06] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  style={{
                    position: 'absolute', top: '10px', right: '10px',
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'radial-gradient(circle, hsla(40, 40%, 50%, 0.12), transparent)',
                  }} />
              )}
              {/* Cloud layers */}
              {isCloudy && (
                <motion.div
                  animate={{ x: [-10, 10, -10] }}
                  transition={{ duration: 8, repeat: Infinity }}
                  style={{
                    position: 'absolute', top: '20px', left: '30px',
                    width: '80px', height: '25px', borderRadius: radius.md,
                    background: 'hsla(220, 8%, 35%, 0.08)',
                  }} />
              )}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              background: themeColor(TH.primaryHSL, 0.04, 2),
              borderRadius: radius.sm, padding: '8px 16px',
              border: `1px solid ${themeColor(TH.accentHSL, 0.06, 5)}`,
            }}>
              <input
                type="text"
                value={typeInt.value}
                onChange={e => typeInt.onChange(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && typeInt.submit()}
                placeholder="the weather outside"
                maxLength={30}
                style={{
                  background: 'transparent', border: 'none', outline: 'none',
                  color: palette.text, fontSize: '13px', fontFamily: 'monospace',
                  width: '160px', textAlign: 'center',
                }}
              />
            </div>
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>
              {typeInt.value.length < 3 ? 'describe the sky' : 'press enter to sync'}
            </div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              Biophilia. Even digital representations of nature can lower cortisol levels and improve attention restoration compared to abstract environments. You just synced your screen with the sky. The earth is not out there {'\u2014'} it{'\u2019'}s right here, on your window.
            </div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Synced.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}