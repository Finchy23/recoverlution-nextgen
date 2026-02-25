/**
 * MENTAT #6 — The Focus Tunnel
 * "Attention is a weapon. Aim. One target."
 * ARCHETYPE: Pattern A (Tap) — Tap distractions before they enter circle
 * ENTRY: Scene-first — peripheral blur with center clarity
 * STEALTH KBE: Accuracy of tapping = Attentional Control / Inhibition (E)
 */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MENTAT_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('poetic_precision', 'Cognitive Enhancement', 'embodying', 'Circuit');
type Stage = 'arriving' | 'focusing' | 'locked' | 'resonant' | 'afterglow';

interface Distraction { id: number; x: number; y: number; label: string; alive: boolean; }

const LABELS = ['Email', 'News', 'Snack', 'Phone', 'Worry'];

export default function Mentat_FocusTunnel({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [distractions, setDistractions] = useState<Distraction[]>([]);
  const [killed, setKilled] = useState(0);
  const spawnRef = useRef<number>();
  const idRef = useRef(0);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('focusing'), 2200); return () => { T.current.forEach(clearTimeout); clearInterval(spawnRef.current); }; }, []);

  // Spawn distractions
  useEffect(() => {
    if (stage === 'focusing') {
      spawnRef.current = window.setInterval(() => {
        const angle = Math.random() * Math.PI * 2;
        const d: Distraction = {
          id: idRef.current++,
          x: 50 + Math.cos(angle) * 40,
          y: 50 + Math.sin(angle) * 40,
          label: LABELS[Math.floor(Math.random() * LABELS.length)],
          alive: true,
        };
        setDistractions(prev => [...prev.slice(-6), d]);
      }, 1200);
    }
    return () => clearInterval(spawnRef.current);
  }, [stage]);

  const swat = useCallback((id: number) => {
    setDistractions(prev => prev.map(d => d.id === id ? { ...d, alive: false } : d));
    const next = killed + 1;
    setKilled(next);
    if (next >= 5) {
      clearInterval(spawnRef.current);
      console.log(`[KBE:E] FocusTunnel attentionalControl=confirmed inhibition=true killed=${next}`);
      setStage('locked');
      t(() => setStage('resonant'), 5000);
      t(() => { setStage('afterglow'); onComplete?.(); }, 11000);
    }
  }, [killed]);

  return (
    <NaviCueShell signatureKey="poetic_precision" mechanism="Cognitive Enhancement" kbe="embodying" form="Circuit" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}>
            <div style={{ width: '30px', height: '30px', borderRadius: '50%',
              border: `1px solid ${themeColor(TH.accentHSL, 0.06, 3)}` }} />
          </motion.div>
        )}
        {stage === 'focusing' && (
          <motion.div key="fo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              Focus tunnel. Distractions float in. Tap them before they reach center.
            </div>
            {/* Focus field */}
            <div style={{ width: '120px', height: '120px', position: 'relative', borderRadius: '50%',
              background: `radial-gradient(circle, ${themeColor(TH.accentHSL, 0.03, 2)} 30%, ${themeColor(TH.primaryHSL, 0.015, 0)} 100%)`,
              border: `1px solid ${themeColor(TH.accentHSL, 0.05, 3)}` }}>
              {/* Center dot */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                width: '8px', height: '8px', borderRadius: '50%', background: themeColor(TH.accentHSL, 0.08, 4) }} />
              {/* Distractions */}
              {distractions.filter(d => d.alive).map(d => (
                <motion.div key={d.id} initial={{ opacity: 0.3, scale: 0.5 }}
                  animate={{ opacity: 0.25, scale: 1, x: (60 - d.x) * 0.3, y: (60 - d.y) * 0.3 }}
                  transition={{ duration: 3 }}
                  onClick={() => swat(d.id)}
                  style={{ position: 'absolute', left: `${d.x - 12}px`, top: `${d.y - 8}px`,
                    padding: '2px 6px', borderRadius: '6px', cursor: 'pointer',
                    background: themeColor(TH.primaryHSL, 0.04, 2),
                    border: `1px solid ${themeColor(TH.primaryHSL, 0.06, 3)}` }}>
                  <span style={{ fontSize: '11px', color: palette.textFaint }}>{d.label}</span>
                </motion.div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {[0, 1, 2, 3, 4].map(i => (
                <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%',
                  background: i < killed
                    ? themeColor(TH.accentHSL, 0.15, 8)
                    : themeColor(TH.primaryHSL, 0.04, 2) }} />
              ))}
            </div>
          </motion.div>
        )}
        {stage === 'locked' && (
          <motion.div key="lo" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Locked. Five distractions neutralized. Attention is a weapon — don{"'"}t spray and pray. Aim. One target. Everything else is peripheral noise that incinerates when you choose not to engage. The center stays clear because you defended it.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Attentional control. Michael Posner{"'"}s attention networks: the executive attention network is responsible for resolving conflict between competing stimuli. "Inhibition" — the ability to suppress irrelevant information — is a core component of fluid intelligence. Every time you successfully ignore a distraction, you strengthen the anterior cingulate cortex. Focus is not a talent. It{"'"}s a muscle trained by deliberate practice.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Focused.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}