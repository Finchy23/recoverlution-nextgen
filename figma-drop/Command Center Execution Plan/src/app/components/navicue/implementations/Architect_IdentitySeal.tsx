/**
 * ARCHITECT #10 -- The Identity Seal (The Master Proof)
 * "I am becoming a person who [does X]. Scan to confirm."
 * INTERACTION: A thumbprint scanner. You hold your thumb.
 * A ring fills. Identity updated. This is who you are now.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('science_x_soul', 'Behavioral Activation', 'embodying', 'IdentityKoan');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

const IDENTITIES = [
  'shows up even when it is hard',
  'chooses honesty over comfort',
  'takes care of their body',
  'keeps promises to themselves',
  'faces fear with curiosity',
];

export default function Architect_IdentitySeal({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [chosen, setChosen] = useState<string | null>(null);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [sealed, setSealed] = useState(false);
  const intervalRef = useRef<number>(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => { timersRef.current.forEach(clearTimeout); clearInterval(intervalRef.current); };
  }, []);

  const startScan = () => {
    if (!chosen || sealed) return;
    setScanning(true);
    intervalRef.current = window.setInterval(() => {
      setScanProgress(prev => {
        const next = prev + 1.5;
        if (next >= 100) {
          clearInterval(intervalRef.current);
          setScanning(false);
          setSealed(true);
          setTimeout(() => { setStage('resonant'); setTimeout(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 1500);
          return 100;
        }
        return next;
      });
    }, 30);
  };

  const stopScan = () => {
    setScanning(false);
    clearInterval(intervalRef.current);
  };

  const progress = scanProgress / 100;
  const circumference = 2 * Math.PI * 70;

  return (
    <NaviCueShell signatureKey="science_x_soul" mechanism="Behavioral Activation" kbe="embodying" form="IdentityKoan" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Every action is a vote.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>I am becoming a person who...</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>choose, then scan to confirm</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', padding: '0 24px' }}>
            {/* Identity choices */}
            {!chosen && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '320px', width: '100%' }}>
                {IDENTITIES.map((id, i) => (
                  <motion.button key={i} onClick={() => setChosen(id)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    style={{ padding: '14px 16px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${palette.primaryFaint}`, borderRadius: radius.sm, cursor: 'pointer', textAlign: 'left', ...navicueType.hint, color: palette.text, fontSize: '13px' }}>
                    ...{id}
                  </motion.button>
                ))}
              </div>
            )}
            {/* Thumbprint scanner */}
            {chosen && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
                <div style={{ ...navicueType.texture, color: palette.text, textAlign: 'center', maxWidth: '280px' }}>
                  I am becoming a person who {chosen}.
                </div>
                <div
                  onPointerDown={startScan} onPointerUp={stopScan} onPointerLeave={stopScan}
                  style={{ width: '160px', height: '160px', borderRadius: '50%', position: 'relative', cursor: sealed ? 'default' : 'pointer', touchAction: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* Progress ring */}
                  <svg width="160" height="160" style={{ position: 'absolute', transform: 'rotate(-90deg)' }}>
                    <circle cx="80" cy="80" r="70" fill="none" stroke={palette.primaryFaint} strokeWidth="1" />
                    <circle cx="80" cy="80" r="70" fill="none" stroke={sealed ? palette.accent : palette.primary} strokeWidth="2"
                      strokeDasharray={`${progress * circumference} ${circumference}`} strokeLinecap="round" opacity={0.6} />
                  </svg>
                  {/* Fingerprint icon */}
                  <motion.div animate={{ scale: scanning ? 1.1 : 1, opacity: sealed ? 0.3 : 0.6 }}
                    style={{ width: '40px', height: '50px', display: 'flex', flexDirection: 'column', gap: '3px', alignItems: 'center' }}>
                    {[0.6, 0.8, 1, 0.8, 0.6].map((w, i) => (
                      <div key={i} style={{ width: `${w * 30}px`, height: '3px', borderRadius: '2px', background: palette.primary, opacity: 0.3 + progress * 0.4 }} />
                    ))}
                  </motion.div>
                  {sealed && (
                    <motion.div initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', damping: 10 }}
                      style={{ position: 'absolute', ...navicueType.hint, color: palette.accent, fontWeight: 500 }}>
                      confirmed
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Identity updated.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>This is who you are now.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            The majority wins.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}