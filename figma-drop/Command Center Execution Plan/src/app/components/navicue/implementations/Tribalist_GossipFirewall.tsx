/**
 * TRIBALIST #9 — The Gossip Firewall
 * "Triangulation destroys trust. Be the dead end."
 * ARCHETYPE: Pattern A (Tap) — Whispering text streams; raise a shield or agree
 * ENTRY: Cold open — whisper text approaches
 * STEALTH KBE: Choosing "Change Subject" over "Agree" = Ethical Embodiment (E)
 */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';
import { TRIBALIST_THEME as TH, themeColor } from '../interactions/seriesThemes';

const { palette } = navicueQuickstart('relational_ghost', 'Metacognition', 'embodying', 'Hearth');
type Stage = 'arriving' | 'active' | 'blocked' | 'resonant' | 'afterglow';

const WHISPERS = [
  'Did you hear what they said...',
  'I shouldn\'t say this, but...',
  'Between us, they are...',
];

export default function Tribalist_GossipFirewall({ onComplete }: { data?: any; onComplete?: () => void }) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [whisperIdx, setWhisperIdx] = useState(0);
  const [choice, setChoice] = useState<'block' | 'agree' | null>(null);
  const T = useRef<number[]>([]);
  const t = (fn: () => void, ms: number) => { T.current.push(window.setTimeout(fn, ms)); };

  useEffect(() => {
    t(() => setStage('active'), 2000);
    return () => T.current.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (stage !== 'active') return;
    const id = window.setInterval(() => setWhisperIdx(i => (i + 1) % WHISPERS.length), 2000);
    return () => clearInterval(id);
  }, [stage]);

  const respond = (r: 'block' | 'agree') => {
    if (stage !== 'active') return;
    setChoice(r);
    console.log(`[KBE:E] GossipFirewall response=${r} ethicalEmbodiment=${r === 'block'}`);
    setStage('blocked');
    t(() => setStage('resonant'), 4500);
    t(() => { setStage('afterglow'); onComplete?.(); }, 10000);
  };

  return (
    <NaviCueShell signatureKey="relational_ghost" mechanism="Metacognition" kbe="embodying" form="Hearth" mode="immersive" isAfterglow={stage === 'afterglow'}>
      <AnimatePresence mode="wait">
        {stage === 'arriving' && (
          <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 0.3 }} exit={{ opacity: 0 }}
            style={{ ...navicueType.texture, color: palette.textFaint, fontStyle: 'italic', textAlign: 'center' }}>
            psst...
          </motion.div>
        )}
        {stage === 'active' && (
          <motion.div key="act" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', maxWidth: '300px' }}>
            <div style={{ ...navicueType.prompt, color: palette.text, textAlign: 'center' }}>
              It stops with you.
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={whisperIdx} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 0.5, x: 0 }} exit={{ opacity: 0, x: 20 }}
                style={{ ...navicueType.texture, color: palette.textFaint, fontStyle: 'italic', textAlign: 'center', minHeight: '30px' }}>
                {WHISPERS[whisperIdx]}
              </motion.div>
            </AnimatePresence>
            <div style={{ display: 'flex', gap: '12px' }}>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => respond('block')}
                style={{ padding: '12px 18px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.accentHSL, 0.08, 4),
                  border: `1px solid ${themeColor(TH.accentHSL, 0.12, 8)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.accentHSL, 0.4, 15), fontSize: '11px' }}>Change subject</div>
              </motion.div>
              <motion.div whileTap={{ scale: 0.95 }} onClick={() => respond('agree')}
                style={{ padding: '12px 18px', borderRadius: radius.lg, cursor: 'pointer',
                  background: themeColor(TH.primaryHSL, 0.06, 3),
                  border: `1px solid ${themeColor(TH.primaryHSL, 0.1, 6)}` }}>
                <div style={{ ...navicueType.choice, color: themeColor(TH.primaryHSL, 0.3, 10), fontSize: '11px' }}>Agree</div>
              </motion.div>
            </div>
          </motion.div>
        )}
        {stage === 'blocked' && (
          <motion.div key="bl" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '18px' }}>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} transition={{ delay: 0.5 }}
              style={{ ...navicueType.texture, color: palette.textFaint, textAlign: 'center', maxWidth: '260px' }}>
              {choice === 'block'
                ? 'The whisper hit your firewall and vanished. Dead end. Trust preserved.'
                : 'The whisper passed through you. You became a link in the chain. Trust eroded.'}
            </motion.div>
          </motion.div>
        )}
        {stage === 'resonant' && (
          <motion.div key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }}
            style={{ textAlign: 'center', ...navicueType.prompt, color: palette.text, maxWidth: '300px' }}>
            Integrity action. Triangulation destroys trust from within. If they talk to you about them, they talk to them about you. Being the dead end, changing the subject, is the act of ethical embodiment.
          </motion.div>
        )}
        {stage === 'afterglow' && (
          <motion.div key="ag" initial={{ opacity: 0 }} animate={{ opacity: 0.5 }}>
            <div style={{ ...navicueType.arrival, color: palette.textFaint, textAlign: 'center' }}>Firewall.</div>
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}