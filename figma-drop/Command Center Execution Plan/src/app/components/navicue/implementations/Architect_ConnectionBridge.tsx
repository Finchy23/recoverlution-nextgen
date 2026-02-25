/**
 * ARCHITECT #2 -- The Connection Bridge
 * "Isolation is the illusion. Reach out."
 * INTERACTION: Type a message. A bridge forms across a chasm as you type.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fonts } from '@/design-tokens';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('relational_ghost', 'Connection', 'believing', 'Practice');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

export default function Architect_ConnectionBridge({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [text, setText] = useState('');
  const [bridgeProgress, setBridgeProgress] = useState(0);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleType = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (stage !== 'active') return;
    const val = e.target.value;
    setText(val);
    const progress = Math.min(val.length / 20, 1);
    setBridgeProgress(progress);
    if (progress >= 1) {
      addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 1500);
    }
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Connection" kbe="believing" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="arr" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            The separation is only in your mind.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="pres" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>Reach out. The bridge builds itself.</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>type a message to someone you care about</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '32px', width: '100%', maxWidth: '320px' }}>
            {/* Bridge visualization */}
            <div style={{ width: '100%', height: '60px', position: 'relative' }}>
              <div style={{ position: 'absolute', left: 0, bottom: 0, width: '20px', height: '40px', background: palette.primaryFaint, borderRadius: `${radius.xs} ${radius.xs} 0 0` }} />
              <div style={{ position: 'absolute', right: 0, bottom: 0, width: '20px', height: '40px', background: palette.primaryFaint, borderRadius: `${radius.xs} ${radius.xs} 0 0` }} />
              <motion.div animate={{ scaleX: bridgeProgress }} style={{ position: 'absolute', bottom: '38px', left: '20px', right: '20px', height: '2px', background: `linear-gradient(90deg, ${palette.primary}, ${palette.accent})`, transformOrigin: 'left', opacity: 0.6 }} />
            </div>
            {/* Input */}
            <input type="text" value={text} onChange={handleType} placeholder="hey, I was thinking of you..." autoFocus
              style={{ width: '100%', padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${palette.primaryFaint}`, borderRadius: radius.sm, color: palette.text, fontFamily: fonts.secondary, fontStyle: 'italic', fontSize: '16px', outline: 'none' }} />
            <div style={{ ...navicueType.hint, color: palette.textFaint, opacity: 0.3 }}>{Math.round(bridgeProgress * 100)}%</div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="res" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>The bridge is built.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint }}>Connection was always one reach away.</motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="aft" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>Now send it.</motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}