/**
 * NOVICE COLLECTION #4
 * The Permission Slip
 *
 * "You have permission to stop performing. Here is your receipt."
 *
 * This specimen creates a formal, beautiful document - a permission slip
 * addressed to you, from you, with a real timestamp that makes it tangible.
 * The interaction is choosing what you're granting yourself permission FOR.
 * The receipt materializes with wax-seal formality.
 *
 * NEUROSCIENCE: Self-permission activates the ventromedial prefrontal cortex
 * (vmPFC), the brain's "internal authority." When you externalize permission
 * into a physical artifact (even digital), you bypass the inner critic's
 * veto loop. The timestamp makes it episodic memory - not a vague intention
 * but a dated event. "On this day, I chose this."
 *
 * INTERACTION: A gentle question. Then: beautiful options appear (not a
 * clinical list - each one is a relief). User selects. The permission slip
 * materializes - formal typography, real date/time, a wax seal that
 * stamps itself. The slip folds into a warm point. Kept.
 *
 * REWIRING CHAIN:
 * 1. Old pattern active: performing, pushing, refusing to rest
 * 2. Different action possible: grant yourself permission
 * 3. Action executed: you chose. The receipt exists.
 * 4. Evidence: timestamped. Real. Yours.
 * 5. Repeated: permission becomes a practice, not a crisis
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { fonts } from '@/design-tokens';
import {
  navicueQuickstart,
  navicueType,
} from '@/app/design-system/navicue-blueprint';
import { NaviCueShell } from '../NaviCueShell';

// ── Derive from blueprint ─────────────────────────────────────────
const { palette, radius } = navicueQuickstart(
  'sacred_ordinary',
  'Self-Compassion',
  'believing',
  'Key'
);

// ── Permission options (poetic, not clinical) ─────────────────────
const PERMISSIONS = [
  { id: 'rest', label: 'to rest without earning it' },
  { id: 'slow', label: 'to go slowly' },
  { id: 'enough', label: 'to be enough as I am' },
  { id: 'no', label: 'to say no' },
  { id: 'feel', label: 'to feel what I feel' },
  { id: 'imperfect', label: 'to be imperfect' },
];

type Stage = 'arriving' | 'asking' | 'choosing' | 'stamping' | 'afterglow';

interface Props {
  data?: any;
  primary_prompt?: string;
  cta_primary?: string;
  onComplete?: () => void;
}

export default function Novice_PermissionSlip({
  onComplete,
}: Props) {
  const [stage, setStage] = useState<Stage>('arriving');
  const [selected, setSelected] = useState<string | null>(null);
  const [selectedLabel, setSelectedLabel] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const timersRef = useRef<number[]>([]);

  const addTimer = (fn: () => void, ms: number) => {
    const t = window.setTimeout(fn, ms);
    timersRef.current.push(t);
    return t;
  };

  useEffect(() => {
    // arriving → asking
    addTimer(() => setStage('asking'), 800);
    // asking → choosing (options appear)
    addTimer(() => setStage('choosing'), 2800);

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const handleSelect = (id: string, label: string) => {
    if (stage !== 'choosing') return;
    setSelected(id);
    setSelectedLabel(label);

    // Capture real timestamp
    const now = new Date();
    const formatted = now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }) + ' \u00b7 ' + now.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
    setTimestamp(formatted);

    // Transition to stamping after brief pause
    addTimer(() => setStage('stamping'), 600);

    // Afterglow after the slip has been witnessed
    addTimer(() => {
      setStage('afterglow');
      onComplete?.();
    }, 12000);
  };

  return (
    <NaviCueShell signatureKey="sacred_ordinary" mechanism="Self-Compassion" kbe="believing" form="Key" mode="immersive" isAfterglow={stage === 'afterglow'}>
      {/* ── Warm ambient glow ──────────────────────────────────── */}
      <motion.div
        animate={{
          opacity: stage === 'stamping' ? 0.12 : stage === 'afterglow' ? 0.06 : 0.04,
        }}
        transition={{ duration: 3 }}
        style={{
          position: 'absolute',
          inset: '-20%',
          background: `radial-gradient(ellipse at 50% 40%, ${palette.primaryGlow}, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* ── Sparse ambient particles ───────────────────────────── */}
      {[...Array(4)].map((_, i) => (
        <motion.div
          key={`p-${i}`}
          animate={{
            opacity: [0, 0.1, 0],
            y: [0, -25 - i * 8, -50 - i * 12],
          }}
          transition={{
            duration: 12 + i * 4,
            repeat: Infinity,
            delay: i * 3,
            ease: 'linear',
          }}
          style={{
            position: 'absolute',
            left: `${20 + i * 18}%`,
            top: `${60 + (i % 2) * 15}%`,
            width: '2px',
            height: '2px',
            borderRadius: '50%',
            background: palette.primary,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* ── Central experience ─────────────────────────────────── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          width: '100%',
          maxWidth: '340px',
        }}
      >
        <AnimatePresence mode="wait">
          {/* ── Asking: the question ────────────────────────────── */}
          {(stage === 'asking' || stage === 'choosing') && !selected && (
            <motion.div
              key="asking"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 1.5, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '36px',
                width: '100%',
              }}
            >
              <motion.div
                style={{
                  ...navicueType.prompt,
                  color: palette.text,
                  textAlign: 'center',
                  maxWidth: '260px',
                }}
              >
                What do you need
                <br />
                permission for?
              </motion.div>

              {/* ── Options (appear in choosing stage) ──────────── */}
              {stage === 'choosing' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1.2, delay: 0.3 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    width: '100%',
                  }}
                >
                  {PERMISSIONS.map((perm, i) => (
                    <motion.button
                      key={perm.id}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 0.7, x: 0 }}
                      whileHover={{ opacity: 1, x: 4 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{
                        delay: i * 0.12,
                        duration: 0.8,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      onClick={() => handleSelect(perm.id, perm.label)}
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '14px 24px',
                        borderRadius: radius.sm,
                        cursor: 'pointer',
                        textAlign: 'left',
                        fontFamily: fonts.secondary,
                        fontStyle: 'italic',
                        fontSize: 'clamp(14px, 2.5vw, 16px)',
                        fontWeight: 300,
                        color: palette.textSecondary,
                        letterSpacing: '0.02em',
                        transition: 'background 0.3s ease',
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.background = `rgba(255,255,255,0.03)`;
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.background = 'none';
                      }}
                    >
                      {perm.label}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ── Stamping: the permission slip materializes ──────── */}
          {stage === 'stamping' && (
            <motion.div
              key="slip"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
              style={{
                width: '100%',
                maxWidth: '300px',
              }}
            >
              <PermissionDocument
                permission={selectedLabel}
                timestamp={timestamp}
                primaryColor={palette.primary}
                primaryGlow={palette.primaryGlow}
                textColor={palette.text}
                textFaint={palette.textFaint}
              />
            </motion.div>
          )}

          {/* ── Afterglow: folded into a warm point ────────────── */}
          {stage === 'afterglow' && (
            <motion.div
              key="afterglow"
              initial={{ opacity: 0, scale: 1.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 3, ease: [0.22, 1, 0.36, 1] }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '24px',
              }}
            >
              {/* Warm folded point */}
              <motion.div
                animate={{
                  opacity: [0.4, 0.7, 0.4],
                  scale: [1, 1.08, 1],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '2px',
                  background: palette.primary,
                  boxShadow: `0 0 24px ${palette.primaryGlow}`,
                  transform: 'rotate(45deg)',
                }}
              />
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.35 }}
                transition={{ duration: 3, delay: 1 }}
                style={{
                  ...navicueType.afterglow,
                  color: palette.textFaint,
                  textAlign: 'center',
                }}
              >
                Kept.
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Bottom breath line ─────────────────────────────────── */}
      <motion.div
        animate={{
          scaleX: stage === 'stamping' ? 0.4 : stage === 'afterglow' ? 0 : 0.15,
          opacity: stage === 'afterglow' ? 0 : 0.12,
        }}
        transition={{ duration: 2, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${palette.primary}, transparent)`,
          transformOrigin: 'center',
          zIndex: 2,
        }}
      />
    </NaviCueShell>
  );
}

// ── The Permission Document ─────────────────────────────────────────
function PermissionDocument({
  permission,
  timestamp,
  primaryColor,
  primaryGlow,
  textColor,
  textFaint,
}: {
  permission: string;
  timestamp: string;
  primaryColor: string;
  primaryGlow: string;
  textColor: string;
  textFaint: string;
}) {
  const [sealStamped, setSealStamped] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setSealStamped(true), 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        padding: '14px 24px',
        borderRadius: radius.sm,
        cursor: 'pointer',
        textAlign: 'left',
        fontFamily: fonts.secondary,
        border: `1px solid rgba(255,255,255,0.06)`,
        background: 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Header line */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 0.15, scaleX: 1 }}
        transition={{ duration: 1.5, delay: 0.3 }}
        style={{
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)`,
          marginBottom: '24px',
          transformOrigin: 'center',
        }}
      />

      {/* Title */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        style={{
          fontSize: '11px',
          fontFamily: fonts.mono,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: textFaint,
          textAlign: 'center',
          marginBottom: '20px',
        }}
      >
        Permission Granted
      </motion.div>

      {/* The permission itself */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 2, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{
          fontSize: 'clamp(18px, 3.5vw, 22px)',
          fontFamily: fonts.secondary,
          fontStyle: 'italic',
          fontWeight: 300,
          color: textColor,
          textAlign: 'center',
          lineHeight: 1.6,
          marginBottom: '24px',
        }}
      >
        {permission}
      </motion.div>

      {/* Divider */}
      <motion.div
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 0.1, scaleX: 1 }}
        transition={{ duration: 1.5, delay: 1.2 }}
        style={{
          height: '1px',
          background: `linear-gradient(90deg, transparent, ${primaryColor}, transparent)`,
          marginBottom: '16px',
          transformOrigin: 'center',
        }}
      />

      {/* Timestamp */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 1.5, delay: 1.5 }}
        style={{
          fontSize: '11px',
          fontFamily: fonts.mono,
          color: textFaint,
          textAlign: 'center',
          letterSpacing: '0.03em',
          marginBottom: '8px',
        }}
      >
        {timestamp}
      </motion.div>

      {/* From / To */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.25 }}
        transition={{ duration: 1.5, delay: 1.8 }}
        style={{
          fontSize: '11px',
          fontFamily: fonts.secondary,
          fontStyle: 'italic',
          color: textFaint,
          textAlign: 'center',
          letterSpacing: '0.03em',
        }}
      >
        from you, to you
      </motion.div>

      {/* ── Wax Seal ──────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '24px',
        }}
      >
        <motion.div
          initial={{ scale: 2.5, opacity: 0 }}
          animate={{
            scale: sealStamped ? 1 : 2.5,
            opacity: sealStamped ? 1 : 0,
          }}
          transition={{
            scale: {
              duration: 0.3,
              ease: [0.4, 0, 0.2, 1], // Sharp stamp
            },
            opacity: { duration: 0.15 },
          }}
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            background: `radial-gradient(circle at 40% 35%, ${primaryColor}, rgba(0,0,0,0.3) 100%)`,
            boxShadow: sealStamped
              ? `0 2px 8px rgba(0,0,0,0.3), 0 0 20px ${primaryGlow}, inset 0 1px 2px rgba(255,255,255,0.1)`
              : 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {/* Inner seal detail */}
          <div
            style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)',
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Stamp impact ripple */}
      <AnimatePresence>
        {sealStamped && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0.4 }}
            animate={{ scale: 3, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              border: `1px solid ${primaryColor}`,
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}