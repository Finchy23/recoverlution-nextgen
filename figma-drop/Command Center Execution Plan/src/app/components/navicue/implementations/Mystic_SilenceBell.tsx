/**
 * MYSTIC #8 — The Silence Bell
 * "Follow the sound into the silence. The silence was there the whole time."
 * Pattern C (Hold) — Strike bell; hold until sound decays to zero
 * STEALTH KBE: Holding until absolute silence = Deep Listening / Auditory Attention (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType, immersiveTapPillThemed } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { MYSTIC_THEME as TH, themeColor } from '../interactions/seriesThemes';
type Stage = 'arriving' | 'bell' | 'ringing' | 'silence' | 'resonant' | 'afterglow';

export default function Mystic_SilenceBell({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [decay, setDecay] = useState(1);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => { t(() => setStage('bell'), 2200); return () => T.current.forEach(clearTimeout); }, []);

  const strike = () => {
    if (stage !== 'bell') return;
    setStage('ringing');
    setDecay(1);
    // Decay over 6 seconds
    const start = Date.now();
    const iv = window.setInterval(() => {
      const elapsed = (Date.now() - start) / 6000;
      const remaining = Math.max(0, 1 - elapsed);
      setDecay(remaining);
      if (remaining <= 0) {
        clearInterval(iv);
        console.log(`[KBE:E] SilenceBell deepListening=confirmed auditoryAttention=true`);
        setStage('silence');
        t(() => setStage('resonant'), 5500);
        t(() => { setStage('afterglow'); onComplete?.(); }, 12000);
      }
    }, 100);
  };

  return (
    <NaviCueShell signatureKey="koan_paradox" mechanism="Non-Dual Awareness" kbe="embodying" form="Practice" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.15 }} exit={{ opacity: 0 }}>
            <div style={{ width: '16px', height: '18px', borderRadius: '0 0 50% 50%',
              background: themeColor(TH.accentHSL, 0.04, 2) }} />
          </motion.div>
        )}
        {stage === 'bell' && (
          <motion.div key="b" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              A temple bell. Strike it. Then listen — all the way to the end. Follow the sound into silence.
            </div>
            <div style={{ width: '30px', height: '34px', borderRadius: '0 0 50% 50%',
              background: themeColor(TH.accentHSL, 0.06, 3),
              border: `1px solid ${themeColor(TH.accentHSL, 0.08, 5)}` }} />
            <motion.div whileTap={{ scale: 0.85 }} onClick={strike}
              style={immersiveTapPillThemed(TH.accentHSL).container}>
              <div style={immersiveTapPillThemed(TH.accentHSL).label}>Strike</div>
            </motion.div>
          </motion.div>
        )}
        {stage === 'ringing' && (
          <motion.div key="ri" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <div style={{ ...navicueType.prompt, color: palette.textFaint, textAlign: 'center', fontStyle: 'italic' }}>
              GONG
            </div>
            {/* Sound waves decaying */}
            {[0, 1, 2].map(i => (
              <motion.div key={i}
                animate={{ scale: [1, 1.3 * decay, 1], opacity: [0.06 * decay, 0.02 * decay, 0.06 * decay] }}
                transition={{ duration: 2 + i, repeat: Infinity }}
                style={{ width: `${30 + i * 20}px`, height: `${30 + i * 20}px`, borderRadius: '50%',
                  border: `1px solid ${themeColor(TH.accentHSL, 0.04 * decay, 3)}`,
                  position: 'absolute' }} />
            ))}
            <div style={{ marginTop: '40px', ...navicueType.status, color: themeColor(TH.accentHSL, 0.15 * decay + 0.05, 6) }}>
              {decay > 0.5 ? 'Listen...' : decay > 0.1 ? 'Fading...' : 'Almost gone...'}
            </div>
            <div style={{ width: '60px', height: '3px', borderRadius: '2px',
              background: themeColor(TH.primaryHSL, 0.02, 1), overflow: 'hidden' }}>
              <div style={{ width: `${decay * 100}%`, height: '100%',
                background: themeColor(TH.accentHSL, 0.06, 3), transition: 'width 0.1s' }} />
            </div>
          </motion.div>
        )}
        {stage === 'silence' && (
          <motion.div key="s" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center', maxWidth: '260px' }}>
            Silence. Where did the sound go? You followed it — from GONG through diminishing vibrations until... nothing. But the silence was there the whole time. The sound arose from silence and returned to silence. The silence is not the absence of sound. It is the presence behind all sound. You just listened deeply enough to hear it.
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Deep listening. Pauline Oliveros coined "deep listening" as a practice of expanding auditory awareness to its limits. In Zen, the bell (keisu) is struck not for the sound but for the silence that follows. Acoustic physics: sound is vibration; silence is the medium in which vibration occurs. Attentional training (Lutz, 2004): focused attention meditation initially uses a single sound as anchor; advanced practice shifts attention to awareness itself — the silence that contains all sounds. The container is always quieter than the contents.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Silent.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}