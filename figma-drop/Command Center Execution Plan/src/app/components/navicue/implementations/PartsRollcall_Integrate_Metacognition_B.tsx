/**
 * Parts Rollcall x Metacognition x Believing
 * Magic Signature: witness_ritual
 *
 * THE ECHO
 * "Which voice is speaking right now?"
 *
 * NEUROSCIENCE: The default mode network generates multiple
 * narrative streams simultaneously. Self-referential processing
 * involves at least four competing circuits: threat detection,
 * social evaluation, planning, and emotional regulation.
 * When you notice WHICH circuit is speaking, the anterior
 * cingulate cortex activates — and that noticing IS the
 * beginning of choice. You don't silence voices. You recognize
 * them. Recognition is the intervention.
 *
 * INTERACTION: Soft orbs drift in darkness, each carrying a
 * different quality of inner voice — not labeled, just felt.
 * Touch the one that feels loudest right now. It doesn't get
 * fixed or silenced. It gets seen. That's enough. The eye
 * opens. You are the one who notices.
 *
 * REWIRING CHAIN:
 * 1. Old pattern active: fused with whichever voice is loudest
 * 2. Different action possible: notice which one is speaking
 * 3. Action executed: touch it → it's acknowledged
 * 4. Evidence: you are separate from the voice
 * 5. Repeated: observation becomes default position
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fonts } from '@/design-tokens';
import {
  navicueQuickstart,
  navicueType,
} from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';
import { radius } from '@/design-tokens';

// ── Derive from blueprint ───────────────────────────────────────────
const { palette, atmosphere, motion: motionConfig } =
  navicueQuickstart('witness_ritual', 'Metacognition', 'believing', 'PartsRollcall');

type Stage = 'arriving' | 'listening' | 'recognized' | 'witnessed' | 'afterglow';

// Voices — described by their quality, not clinical labels.
// Never "Protector" or "Critic" — that's behind the curtain.
const VOICES = [
  { quality: 'The cautious one', whisper: '"Be careful with this"', hueShift: 0 },
  { quality: 'The urgent one', whisper: '"You should have already"', hueShift: 30 },
  { quality: 'The quiet one', whisper: '"What if we just..."', hueShift: -20 },
  { quality: 'The tender one', whisper: '"It\'s okay to feel this"', hueShift: 15 },
];

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function PartsRollcall_Integrate_Metacognition_B({
  onComplete,
}: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const timersRef = useRef<number[]>([]);
  const safeTimeout = (fn: () => void, ms: number) => { timersRef.current.push(window.setTimeout(fn, ms)); };

  // ── Arrival ───────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setStage('listening'), motionConfig.arrivingDuration);
    return () => { clearTimeout(t); timersRef.current.forEach(clearTimeout); };
  }, []);

  // ── Voice selection ───────────────────────────────────────────
  const handleSelect = useCallback((idx: number) => {
    if (stage !== 'listening') return;

    setSelectedIdx(idx);
    setStage('recognized');

    safeTimeout(() => {
      setStage('witnessed');
      safeTimeout(() => {
        setStage('afterglow');
        onComplete?.();
      }, motionConfig.afterglowDuration);
    }, 3000);
  }, [stage, onComplete]);

  // ── Derived ───────────────────────────────────────────────────
  const breathProgress = stage === 'afterglow' ? 1 : stage === 'witnessed' ? 0.7 : stage === 'recognized' ? 0.4 : 0;

  // Per-voice colors — subtle hue shifts from the signature
  const voiceColor = (hueShift: number, alpha: number = 1) => {
    const baseH = 30; // witness_ritual base hue
    return `hsla(${baseH + hueShift}, 25%, 55%, ${alpha})`;
  };

  return (
    <NaviCueShell signatureKey="witness_ritual" mechanism="Metacognition" kbe="believing" form="PartsRollcall" mode="immersive" breathProgress={breathProgress} isAfterglow={stage === 'afterglow'} particleSeed={6}>
      {/* ── Central experience ─────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {/* ── Arriving ───────────────────────────────────────── */}
        {stage === 'arriving' && (
          <motion.div
            key="arrive"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
            style={{ textAlign: 'center' }}
          >
            <div style={{ ...navicueType.arrival, color: palette.text }}>
              Listen.
              <br />
              More than one voice is here.
            </div>
          </motion.div>
        )}

        {/* ── Listening — the voices drift ──────────────────── */}
        {(stage === 'listening' || stage === 'recognized') && (
          <motion.div
            key="voices"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '32px',
              width: '100%',
            }}
          >
            {/* Observer eye — subtle, grows with recognition */}
            <motion.div
              animate={{
                opacity: selectedIdx !== null ? 0.7 : 0.25,
                scale: selectedIdx !== null ? 1.1 : 1,
              }}
              transition={{ duration: 1 }}
              style={{
                width: '48px',
                height: '24px',
                position: 'relative',
                marginBottom: '8px',
              }}
            >
              <svg width="48" height="24" viewBox="0 0 60 30">
                <ellipse
                  cx="30"
                  cy="15"
                  rx="25"
                  ry="12"
                  fill="none"
                  stroke={palette.primary}
                  strokeWidth="1"
                  opacity={0.6}
                />
                <circle cx="30" cy="15" r="5" fill={palette.accent} opacity={0.5} />
                <circle cx="30" cy="15" r="2.5" fill={palette.primary} opacity={0.8} />
              </svg>
            </motion.div>

            {/* Voice orbs — each one a soft glowing presence */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                width: '100%',
                maxWidth: '320px',
              }}
            >
              {VOICES.map((voice, i) => {
                const isSelected = selectedIdx === i;
                const isDimmed = selectedIdx !== null && !isSelected;
                const color = voiceColor(voice.hueShift);
                const colorGlow = voiceColor(voice.hueShift, 0.15);

                return (
                  <motion.div
                    key={voice.quality}
                    onClick={() => handleSelect(i)}
                    initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                    animate={{
                      opacity: isDimmed ? 0.15 : 1,
                      x: 0,
                      scale: isSelected ? 1.03 : 1,
                    }}
                    transition={{ delay: i * 0.15, duration: 0.6 }}
                    style={{
                      padding: '14px 20px',
                      borderRadius: radius.lg,
                      border: `1px solid ${isSelected ? color : voiceColor(voice.hueShift, 0.15)}`,
                      background: isSelected ? colorGlow : voiceColor(voice.hueShift, 0.03),
                      cursor: stage === 'listening' ? 'pointer' : 'default',
                      transition: 'all 0.4s ease',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                    }}
                  >
                    <div
                      style={{
                        fontSize: navicueType.caption.fontSize,
                        fontWeight: 500,
                        color: voiceColor(voice.hueShift, 0.7),
                        fontFamily: fonts.primary,
                        letterSpacing: '0.02em',
                      }}
                    >
                      {voice.quality}
                    </div>
                    <div
                      style={{
                        ...navicueType.hint,
                        color: voiceColor(voice.hueShift, 0.5),
                      }}
                    >
                      {voice.whisper}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Invitation */}
            {stage === 'listening' && selectedIdx === null && (
              <motion.div
                animate={{ opacity: [0.2, 0.35, 0.2] }}
                transition={{ duration: 3, repeat: Infinity }}
                style={{ ...navicueType.hint, color: palette.textFaint }}
              >
                which one is loudest right now?
              </motion.div>
            )}

            {/* Recognition — what just happened */}
            {selectedIdx !== null && stage === 'recognized' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0.6, y: 0 }}
                transition={{ duration: 1.5, delay: 0.5 }}
                style={{ ...navicueType.texture, color: palette.text, textAlign: 'center' }}
              >
                You heard it. That's the practice.
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── Witnessed — the observer eye fully opens ──────── */}
        {stage === 'witnessed' && (
          <motion.div
            key="witnessed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2.5 }}
            style={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '40px',
            }}
          >
            {/* Expanded witness orb */}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: '160px',
                height: '160px',
                borderRadius: '50%',
                background: `radial-gradient(circle, ${palette.primaryGlow}, transparent 70%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <motion.div
                animate={{
                  boxShadow: [
                    `0 0 30px ${palette.primaryGlow}`,
                    `0 0 50px ${palette.primaryGlow}`,
                    `0 0 30px ${palette.primaryGlow}`,
                  ],
                }}
                transition={{ duration: 4, repeat: Infinity }}
                style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: palette.primary,
                }}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 2, delay: 1 }}
              style={{ ...navicueType.prompt, color: palette.text }}
            >
              You noticed.
              <br />
              That's the whole thing.
            </motion.div>
          </motion.div>
        )}

        {/* ── Afterglow ────────────────────────────────────────── */}
        {stage === 'afterglow' && (
          <motion.div
            key="afterglow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 3 }}
            style={{
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '28px',
            }}
          >
            <motion.div
              animate={{ opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 6, repeat: Infinity }}
              style={{
                width: '120px',
                height: '1px',
                background: `linear-gradient(90deg, transparent, ${palette.primary}, transparent)`,
              }}
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ duration: 2, delay: 1 }}
              style={{ ...navicueType.afterglow, color: palette.textFaint }}
            >
              The voice isn't you.
              <br />
              The one who hears it — that's closer.
            </motion.div>

            <motion.div
              animate={{ opacity: [0.2, 0.4, 0.2] }}
              transition={{ duration: 5, repeat: Infinity }}
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: palette.primary,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </NaviCueShell>
  );
}