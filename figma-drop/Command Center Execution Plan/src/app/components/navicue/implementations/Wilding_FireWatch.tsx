/**
 * WILDING #2 — The Fire Watch
 * "Fire is the first television. Let it burn the thoughts."
 * INTERACTION: A procedural flame simulation — particles rise,
 * flicker, never repeat. No taps required after start. 15 seconds
 * of pure soft fascination. Alpha waves build. Blood pressure drops.
 * The oldest screen.
 */
import { useState, useEffect, useRef, useId } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Metacognition', 'believing', 'Canopy');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; onComplete?: () => void; }

interface Ember {
  id: number;
  x: number;
  y: number;
  size: number;
  hue: number;
  life: number;
  maxLife: number;
  vx: number;
  vy: number;
}

const WATCH_DURATION = 15000;

export default function Wilding_FireWatch({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [elapsed, setElapsed] = useState(0);
  const [embers, setEmbers] = useState<Ember[]>([]);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);
  const emberIdRef = useRef(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };
  const svgId = useId();

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, []);

  const spawnEmber = useCallback((): Ember => {
    const id = emberIdRef.current++;
    return {
      id,
      x: 90 + Math.random() * 40,
      y: 140 + Math.random() * 10,
      size: 2 + Math.random() * 4,
      hue: 15 + Math.random() * 25,
      life: 0,
      maxLife: 40 + Math.random() * 40,
      vx: (Math.random() - 0.5) * 0.6,
      vy: -(0.8 + Math.random() * 0.8),
    };
  }, []);

  useEffect(() => {
    if (stage !== 'active') return;
    startRef.current = performance.now();
    let emb: Ember[] = Array.from({ length: 15 }, () => spawnEmber());

    const tick = () => {
      const now = performance.now();
      const el = now - startRef.current;
      setElapsed(el);

      // Update embers
      emb = emb.map(e => ({
        ...e,
        x: e.x + e.vx + Math.sin(e.life * 0.15) * 0.3,
        y: e.y + e.vy,
        life: e.life + 1,
        vx: e.vx + (Math.random() - 0.5) * 0.08,
      })).filter(e => e.life < e.maxLife);

      // Spawn new
      if (Math.random() < 0.4) emb.push(spawnEmber());
      if (Math.random() < 0.2) emb.push(spawnEmber());

      setEmbers([...emb]);

      if (el >= WATCH_DURATION) {
        addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5500); }, 2000);
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [stage]);

  const t = Math.min(elapsed / WATCH_DURATION, 1);

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Metacognition" kbe="believing" form="Canopy" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            A spark catches...
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Watch the flame. It never repeats. Fire is the first television. Your ancestors stared at this for a million years. Let it burn the thoughts.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>just watch</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', width: '100%', maxWidth: '280px' }}>
            <div style={{ position: 'relative', width: '220px', height: '180px', borderRadius: radius.md, overflow: 'hidden',
              background: `hsla(15, ${6 + t * 5}%, ${5 + t * 2}%, 0.35)` }}>
              <svg width="100%" height="100%" viewBox="0 0 220 180" style={{ position: 'absolute', inset: 0 }}>
                {/* Log base */}
                <ellipse cx="110" cy="155" rx="30" ry="5"
                  fill="hsla(20, 12%, 15%, 0.08)" />
                <rect x="85" y="148" width="50" height="8" rx="3"
                  fill="hsla(20, 15%, 12%, 0.06)"
                  stroke="hsla(20, 8%, 18%, 0.04)" strokeWidth="0.3" />

                {/* Ember glow on ground */}
                <ellipse cx="110" cy="148" rx="25" ry="4"
                  fill={`hsla(20, ${25 + t * 10}%, ${35 + t * 8}%, ${0.04 + t * 0.02})`} />

                {/* Flame particles */}
                {embers.map(e => {
                  const lifeRatio = e.life / e.maxLife;
                  const alpha = lifeRatio < 0.2 ? lifeRatio * 5 : (1 - lifeRatio);
                  const sat = 30 - lifeRatio * 15;
                  const light = 45 + lifeRatio * 10;
                  return (
                    <circle key={e.id}
                      cx={e.x} cy={e.y}
                      r={e.size * (1 - lifeRatio * 0.6)}
                      fill={`hsla(${e.hue + lifeRatio * 15}, ${sat}%, ${light}%, ${alpha * 0.12})`}
                    />
                  );
                })}

                {/* Core flame — brightest base */}
                <ellipse cx="110" cy="135" rx="12" ry="18"
                  fill={`hsla(25, 30%, 45%, ${0.06 + Math.sin(elapsed * 0.005) * 0.01})`} />
                <ellipse cx="110" cy="128" rx="7" ry="12"
                  fill={`hsla(35, 35%, 55%, ${0.04 + Math.cos(elapsed * 0.007) * 0.01})`} />

                {/* Ambient warmth gradient */}
                <defs>
                  <radialGradient id={`${svgId}-fireWarmth`} cx="50%" cy="80%">
                    <stop offset="0%" stopColor={`hsla(25, 25%, 40%, ${0.04 + t * 0.02})`} />
                    <stop offset="60%" stopColor="transparent" />
                  </radialGradient>
                </defs>
                <rect x="0" y="0" width="220" height="180" fill={`url(#${svgId}-fireWarmth)`} />

                {/* Alpha wave indicator — subtle */}
                <g>
                  <text x="195" y="20" textAnchor="end" fontSize="11" fontFamily="monospace"
                    fill={`hsla(25, 8%, 30%, ${0.04 + t * 0.03})`}>
                    α: {(8 + t * 4).toFixed(1)} Hz
                  </text>
                </g>

                {/* Time */}
                <text x="110" y="174" textAnchor="middle" fontSize="11" fontFamily="monospace"
                  fill={`hsla(25, 8%, 28%, ${0.05 + t * 0.03})`}>
                  {Math.floor(elapsed / 1000)}s / 15s
                </text>
              </svg>
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} style={{ textAlign: 'center' }}>
              <div style={{ ...navicueType.texture, color: palette.text, fontSize: '11px', fontStyle: 'italic' }}>
                {t < 0.3 ? 'Flickering. Never the same twice.' : t < 0.7 ? 'Thoughts burning away. Alpha building.' : 'Soft fascination. The oldest screen.'}
              </div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.5 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '22px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Fifteen seconds of fire. Not a single frame repeated. The thoughts burned away in the flicker. Alpha waves rose. Blood pressure dropped. The oldest screen still works.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 2, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Evolutionary fascination. Staring at fire induces alpha brainwave states and lowers blood pressure via soft fascination. A million years of this. The circuit never left.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Spark. Flicker. Alpha.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}