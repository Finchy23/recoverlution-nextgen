/**
 * ASTRONAUT #8 -- The Altruism Spark
 * "The news shows the darkness. The data shows the light."
 * ARCHETYPE: Pattern A (Tap) -- Watch lights appear on world map, then add your own
 * ENTRY: Scene-first -- dark world map with kindness pings
 * STEALTH KBE: Adding a light = Prosocial Action / Elevation (K)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { ASTRONAUT_THEME as TH, themeColor } from '../interactions/seriesThemes';
import { radius } from '@/design-tokens';

const { palette } = navicueQuickstart('sensory_cinema', 'Metacognition', 'knowing', 'Stellar');
type Stage = 'arriving' | 'watching' | 'prompted' | 'lit' | 'resonant' | 'afterglow';

interface Light { x: number; y: number; delay: number; }

export default function Astronaut_AltruismSpark({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [lights, setLights] = useState<Light[]>([]);
  const [myLight, setMyLight] = useState<{ x: number; y: number } | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    // Generate random "kindness pings"
    const initLights = Array.from({ length: 15 }).map((_, i) => ({
      x: 15 + Math.random() * 70, y: 15 + Math.random() * 70, delay: i * 0.4,
    }));
    setLights(initLights);
    t(() => setStage('watching'), 2000);
    t(() => setStage('prompted'), 6000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  const addLight = (e: React.MouseEvent<HTMLDivElement>) => {
    if (stage !== 'prompted') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMyLight({ x, y });
    console.log(`[KBE:K] AltruismSpark prosocialAction=confirmed elevation=true`);
    setStage('lit');
    t(() => setStage('resonant'), 5000);
    t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
  };

  return (
    <NaviCueShell signatureKey="sensory_cinema" mechanism="Metacognition" kbe="knowing" form="Stellar" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ width: '80px', height: '50px', borderRadius: radius.xs,
              background: themeColor(TH.primaryHSL, 0.03, 1),
              border: `1px solid ${themeColor(TH.primaryHSL, 0.05, 3)}` }} />
        )}
        {(stage === 'watching' || stage === 'prompted') && (
          <motion.div key="w" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            {stage === 'prompted' && (
              <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
                Tap to add your light.
              </div>
            )}
            {stage === 'watching' && (
              <div style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', fontStyle: 'italic' }}>
                kindness happening right now...
              </div>
            )}
            <div onClick={stage === 'prompted' ? addLight : undefined}
              style={{ width: '180px', height: '110px', borderRadius: radius.sm, position: 'relative',
                background: themeColor(TH.primaryHSL, 0.02, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.04, 2)}`,
                cursor: stage === 'prompted' ? 'crosshair' : 'default', overflow: 'hidden' }}>
              {/* Continent suggestion shapes */}
              <div style={{ position: 'absolute', left: '15%', top: '25%', width: '25%', height: '35%',
                borderRadius: '30%', background: themeColor(TH.primaryHSL, 0.02, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.03, 2)}` }} />
              <div style={{ position: 'absolute', left: '50%', top: '15%', width: '30%', height: '50%',
                borderRadius: '20%', background: themeColor(TH.primaryHSL, 0.02, 1),
                border: `1px solid ${themeColor(TH.primaryHSL, 0.03, 2)}` }} />
              {/* Kindness lights */}
              {lights.map((l, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 0.4, 0.2], scale: [0, 1, 0.8] }}
                  transition={{ delay: l.delay, duration: 1.5, repeat: Infinity, repeatDelay: 3 + Math.random() * 2 }}
                  style={{ position: 'absolute', left: `${l.x}%`, top: `${l.y}%`,
                    width: '3px', height: '3px', borderRadius: '50%',
                    background: themeColor(TH.accentHSL, 0.3, 12),
                    boxShadow: `0 0 4px ${themeColor(TH.accentHSL, 0.1, 8)}` }} />
              ))}
              {myLight && (
                <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.5, 1], opacity: [0, 1, 0.8] }}
                  transition={{ duration: 0.8 }}
                  style={{ position: 'absolute', left: `${myLight.x}%`, top: `${myLight.y}%`,
                    width: '5px', height: '5px', borderRadius: '50%',
                    background: themeColor(TH.accentHSL, 0.5, 16),
                    boxShadow: `0 0 8px ${themeColor(TH.accentHSL, 0.15, 12)}` }} />
              )}
            </div>
          </motion.div>
        )}
        {stage === 'lit' && (
          <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px',
              fontStyle: 'italic' }}>
            Your light joined the constellation. The news shows darkness. The data shows light -- billions of small kindnesses happening every second, invisible but real.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 2 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Elevation -- the emotion triggered by witnessing moral beauty. Jonathan Haidt{"'"}s research shows that watching others help activates the vagus nerve and increases the desire to help. The news amplifies darkness; the data reveals light. Adding your light to the map isn{"'"}t symbolic -- it{"'"}s the mechanism. Prosocial action is contagious.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Lit.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}