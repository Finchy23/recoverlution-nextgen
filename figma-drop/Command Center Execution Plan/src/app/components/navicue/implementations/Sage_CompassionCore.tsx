/**
 * SAGE #5 — The Compassion Core
 * "What if you treated yourself the way you treat your best friend?"
 * INTERACTION: Two silhouettes — one is you, one is your friend.
 * Write a message to the friend, then watch it redirect to you.
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

const { palette, radius } = navicueQuickstart('sacred_ordinary', 'Self-Compassion', 'knowing', 'Mirror');
type Stage = 'arriving' | 'present' | 'active' | 'resonant' | 'afterglow';
interface Props { data?: any; primary_prompt?: string; cta_primary?: string; onComplete?: () => void; }

const PROMPTS = [
  'What would you say to a friend who felt this way?',
  'What does your friend need to hear right now?',
  'What truth would ease their suffering?',
];

export default function Sage_CompassionCore({ onComplete }: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [message, setMessage] = useState('');
  const [redirected, setRedirected] = useState(false);
  const [prompt] = useState(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);
  const timersRef = useRef<number[]>([]);
  const addTimer = (fn: () => void, ms: number) => { const t = window.setTimeout(fn, ms); timersRef.current.push(t); };

  useEffect(() => {
    addTimer(() => setStage('present'), 1200);
    addTimer(() => setStage('active'), 3500);
    return () => timersRef.current.forEach(clearTimeout);
  }, []);

  const handleSend = () => {
    if (!message.trim() || redirected) return;
    setRedirected(true);
    addTimer(() => { setStage('resonant'); addTimer(() => { setStage('afterglow'); onComplete?.(); }, 5000); }, 3000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Self-Compassion" kbe="knowing" form="Mirror" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>
            Think of your closest friend.
          </motion.div>
        )}
        {stage === 'present' && (
          <motion.div key="p" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>{prompt}</div>
            <div style={{ ...navicueType.hint, color: palette.textFaint }}>write what they need to hear</div>
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', width: '100%', maxWidth: '300px' }}>
            {/* Two silhouettes */}
            <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '0 20px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: palette.primaryGlow, opacity: redirected ? 0.8 : 0.3 }} />
                <span style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: redirected ? 0.8 : 0.3 }}>You</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: palette.primaryGlow, opacity: redirected ? 0.3 : 0.6 }} />
                <span style={{ ...navicueType.hint, color: palette.textFaint, fontSize: '11px', opacity: redirected ? 0.3 : 0.6 }}>Friend</span>
              </div>
            </div>
            {/* Arrow showing redirect */}
            {redirected && (
              <motion.div initial={{ opacity: 0, scaleX: -1 }} animate={{ opacity: 0.4, scaleX: 1 }} transition={{ duration: 1.5 }}
                style={{ width: '100%', height: '1px', background: `linear-gradient(90deg, ${palette.accent}, transparent)` }} />
            )}
            {/* Message input */}
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Write what they need to hear..."
              disabled={redirected}
              style={{ width: '100%', minHeight: '80px', padding: '12px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${palette.primaryFaint}`, borderRadius: radius.sm, color: palette.text, fontSize: '14px', fontFamily: 'inherit', resize: 'none', outline: 'none', opacity: redirected ? 0.6 : 1 }}
            />
            {!redirected && message.trim() && (
              <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={handleSend}
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                style={{ padding: '14px 28px', background: 'rgba(255,255,255,0.03)', border: `1px solid ${palette.primaryGlow}`, borderRadius: radius.sm, cursor: 'pointer', ...navicueType.hint, color: palette.text }}>
                send
              </motion.button>
            )}
            {redirected && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 0.6, y: 0 }} transition={{ delay: 1 }}
                style={{ ...navicueType.texture, color: palette.accent, textAlign: 'center' }}>
                Now read it again. To yourself.
              </motion.div>
            )}
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2 }} style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px', alignItems: 'center' }}>
            <div style={{ ...navicueType.prompt, color: palette.text }}>You already know what you need to hear.</div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.5 }} transition={{ delay: 1.5, duration: 2 }} style={{ ...navicueType.texture, color: palette.textFaint, fontStyle: 'italic', maxWidth: '260px' }}>
              "{message}"
            </motion.div>
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ duration: 3 }} style={{ ...navicueType.afterglow, color: palette.textFaint, textAlign: 'center' }}>
            Speak to yourself the way you speak to those you love.
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}