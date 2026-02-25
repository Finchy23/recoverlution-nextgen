/**
 * MYSTIC TRANSCENDENCE #10 -- The Transcendence Seal
 * "Before enlightenment, chop wood, carry water. After enlightenment, chop wood, carry water."
 *
 * ============================================================
 * REFERENCE SPECIMEN -- CANONICAL TEMPLATE FOR ALL FUTURE BUILDS
 * ============================================================
 *
 * This is the first NaviCue to use the COMPLETE new stack:
 *   - navicueQuickstart()      -> palette, atmosphere, motion, radius
 *   - composeMechanics()       -> heat-band-validated delivery spec
 *   - useNaviCueStages()       -> universal lifecycle (no boilerplate)
 *   - useBreathEngine()        -> somatic pulse (amplitude, phase, cycleCount)
 *   - useTextMaterializer()    -> text arrival on glass (characters, progress)
 *   - useReceiptCeremony()     -> seal ceremony (containerStyle, trigger, phase)
 *
 * SINGLE COLOR AUTHORITY: palette only. No seriesThemes import.
 * This is the target pattern for Move 2 absorption.
 *
 * CEREMONY GRAMMAR:
 *   arriving   -> threshold pause (breath starts, world coalesces)
 *   present    -> invitation pause (text materializes via burn_in)
 *   active     -> engagement (breath-synced bindu, hold presence)
 *   resonant   -> integration pause (reflection text materializes)
 *   afterglow  -> single word, released
 *
 * MECHANIC: somatic_entrainment (green/amber/red -- universal access)
 * RECEIPT:  hold (sustained presence, 1+ breath cycle)
 * KBE:      knowing -> the gateless gate requires no cognitive load
 *
 * STEALTH KBE: Completion = transcendence is not elsewhere (K)
 *
 * Pattern A (Hold) -- Breath-synced bindu; hold presence; gate opens
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { navicueQuickstart, navicueType } from '@/app/design-system/navicue-blueprint';
import { composeMechanics } from '@/app/design-system/navicue-mechanics';
import { NaviCueShell } from '../NaviCueShell';
import { useNaviCueStages, type NaviCueProps } from '../interactions/useNaviCueStages';
import { useBreathEngine, getBreathPhaseLabel } from '../interactions/useBreathEngine';
import { useTextMaterializer, MaterializedText } from '../interactions/useTextMaterializer';
import { useReceiptCeremony } from '../interactions/useReceiptCeremony';

// ── Layer 1: Quickstart (single color authority) ─────────────────
const { palette, radius } = navicueQuickstart(
  'koan_paradox',
  'Non-Dual Awareness',
  'knowing',
  'Identity Koan',
);

// ── Layer 2: Mechanics composition (heat-band-validated) ─────────
// Green band: full cognitive access. The seal is available to all.
// In amber/red, composeMechanics would auto-downgrade if needed.
const spec = composeMechanics({
  heatBand: 'green',
  mechanic: 'somatic_entrainment',
  receipt: 'hold',
  kbe: 'knowing',
  chrono: 'night', // The seal is best at night (consolidation window)
});

// ── Content ──────────────────────────────────────────────────────
const INVITATION_TEXT =
  'The gateless gate. There was never a wall to cross. ' +
  'You were always already here.';

const INTEGRATION_TEXT =
  'The candle. The ocean. The koan. The light. The space. ' +
  'The dance. The thread. The silence. The net. ' +
  'None of them were elsewhere. ' +
  'The pathway is physically different today than when you began. ' +
  'Not because you arrived somewhere new. ' +
  'Because the track that was always here is deeper now.';

// ── Component ────────────────────────────────────────────────────

export default function Mystic_TranscendenceSeal({ onComplete }: NaviCueProps) {

  // ── Lifecycle: universal stage progression ────────────────────
  const { stage, setStage, addTimer } = useNaviCueStages({
    presentAt: 1800,  // longer threshold for a seal
    activeAt: 5000,   // invitation has time to burn in
  });

  // ── Breath engine: somatic pulse (from composed spec) ────────
  const breath = useBreathEngine(spec.breathPattern, {
    autoStart: true,
    onCycleComplete: (count) => {
      console.log(`[breath] cycle ${count} complete`);
    },
  });

  // ── Text materializer: invitation (burn_in from spec) ────────
  const invitation = useTextMaterializer(
    INVITATION_TEXT,
    spec.textMode,  // burn_in (from somatic_entrainment + night chrono)
    {
      speed: 0.8,   // contemplative pace for a seal
      startDelay: 200,
      breathAmplitude: breath.amplitude,
      autoStart: false,
    },
  );

  // ── Text materializer: integration (emerge for contrast) ─────
  const integration = useTextMaterializer(
    INTEGRATION_TEXT,
    'emerge',
    {
      speed: 0.7,
      startDelay: 500,
      autoStart: false,
    },
  );

  // ── Receipt ceremony: dissolve (from spec) ───────────────────
  const ceremony = useReceiptCeremony(spec.ceremonyMode, {
    onSealed: () => {
      console.log(
        `[KBE:K] TranscendenceSeal nonDualAwareness=confirmed ` +
        `gatelessGate=open breathCycles=${breath.cycleCount} ` +
        `downgraded=${spec.downgraded}`,
      );
      setStage('resonant');
      // Integration text begins materializing
      integration.start();
      addTimer(() => {
        setStage('afterglow');
        onComplete?.();
      }, spec.timing.landing + 12000);
    },
  });

  // ── Start invitation text when 'present' is reached ──────────
  useEffect(() => {
    if (stage === 'present') {
      invitation.start();
    }
  }, [stage]);

  // ── Seal action: triggered after 1+ breath cycles ────────────
  const canSeal = stage === 'active' && breath.cycleCount >= 1;

  const handleSeal = () => {
    if (!canSeal) return;
    ceremony.trigger();
  };

  // ── Breath-synced visual values ──────────────────────────────
  const binduScale = 0.8 + breath.amplitude * 0.4;      // 0.8 - 1.2
  const binduOpacity = 0.04 + breath.amplitude * 0.08;   // 0.04 - 0.12
  const glowRadius = 4 + breath.amplitude * 12;          // 4 - 16
  const phaseLabel = getBreathPhaseLabel(breath.phase);

  return (
    <NaviCueShell
      signatureKey="koan_paradox"
      mechanism="Non-Dual Awareness"
      kbe="knowing"
      form="Identity Koan"
      mode="immersive"
      isAfterglow={stage === 'afterglow'}
    >
      <AnimatePresence mode="wait">

        {/* ── ARRIVING: threshold silence, breath coalesces ──── */}
        {stage === 'arriving' && (
          <motion.div
            key="arriving"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
            }}
          >
            {/* Breath-synced arriving dot */}
            <motion.div
              animate={{
                scale: binduScale,
                opacity: binduOpacity,
              }}
              transition={{ duration: 0.1, ease: 'linear' }}
              style={{
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: palette.text,
              }}
            />
            {/* Breath phase whisper */}
            <motion.div
              animate={{ opacity: [0.15, 0.25, 0.15] }}
              transition={{ duration: 4, repeat: Infinity }}
              style={{
                ...navicueType.micro,
                color: palette.textFaint,
              }}
            >
              {phaseLabel}
            </motion.div>
          </motion.div>
        )}

        {/* ── PRESENT: invitation materializes via burn_in ──── */}
        {stage === 'present' && (
          <motion.div
            key="present"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
              maxWidth: '300px',
              textAlign: 'center',
            }}
          >
            {/* Materialized invitation text */}
            <div style={{ ...navicueType.prompt, color: palette.text }}>
              <MaterializedText characters={invitation.characters} />
            </div>

            {/* Breath continues underneath */}
            <motion.div
              animate={{ opacity: breath.amplitude * 0.15 + 0.05 }}
              transition={{ duration: 0.1, ease: 'linear' }}
              style={{
                ...navicueType.micro,
                color: palette.textFaint,
              }}
            >
              {phaseLabel}
            </motion.div>
          </motion.div>
        )}

        {/* ── ACTIVE: breath-synced bindu + hold engagement ─── */}
        {stage === 'active' && ceremony.phase === 'idle' && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '28px',
            }}
          >
            {/* Breath-synced bindu (the still point) */}
            <motion.div
              animate={{
                scale: binduScale,
                boxShadow: `0 0 ${glowRadius}px ${palette.accent}`,
              }}
              transition={{ duration: 0.15, ease: 'linear' }}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: palette.accent,
                opacity: binduOpacity + 0.04,
                cursor: canSeal ? 'pointer' : 'default',
              }}
            />

            {/* Breath phase label */}
            <motion.div
              animate={{ opacity: [0.2, 0.35, 0.2] }}
              transition={{ duration: 3, repeat: Infinity }}
              style={{
                ...navicueType.hint,
                color: palette.textFaint,
                textAlign: 'center',
              }}
            >
              {phaseLabel}
            </motion.div>

            {/* Cycle counter (physics framing, not gamification) */}
            {breath.cycleCount > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.25 }}
                style={{
                  ...navicueType.micro,
                  color: palette.textFaint,
                }}
              >
                {breath.cycleCount === 1
                  ? 'One cycle. The track is forming.'
                  : `${breath.cycleCount} cycles. The track is deeper.`}
              </motion.div>
            )}

            {/* Seal button: appears after 1+ breath cycle */}
            {canSeal && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              >
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={handleSeal}
                  style={{
                    padding: '14px 24px',
                    borderRadius: radius.full,
                    cursor: 'pointer',
                    background: 'transparent',
                    border: `1px solid ${palette.border}`,
                    outline: 'none',
                  }}
                >
                  <span style={{
                    ...navicueType.choice,
                    color: palette.text,
                  }}>
                    Sealed
                  </span>
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── SEALING: receipt ceremony in progress ────────── */}
        {ceremony.phase === 'sealing' && (
          <motion.div
            key="sealing"
            style={{
              ...ceremony.containerStyle,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              position: 'relative',
            }}
          >
            {/* Content being sealed */}
            <motion.div
              animate={{ scale: binduScale }}
              transition={{ duration: 0.15, ease: 'linear' }}
              style={{
                width: '12px',
                height: '12px',
                borderRadius: '50%',
                background: palette.accent,
              }}
            />
            <div style={{
              ...navicueType.hint,
              color: palette.textFaint,
              textAlign: 'center',
            }}>
              Received.
            </div>

            {/* Ceremony overlay */}
            {ceremony.overlayStyle && (
              <div style={ceremony.overlayStyle} />
            )}
          </motion.div>
        )}

        {/* ── RESONANT: integration text materializes ────────── */}
        {stage === 'resonant' && (
          <motion.div
            key="resonant"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '16px',
              maxWidth: '320px',
              textAlign: 'center',
            }}
          >
            <div style={{ ...navicueType.texture, color: palette.text, lineHeight: 1.65 }}>
              <MaterializedText characters={integration.characters} />
            </div>
          </motion.div>
        )}

        {/* ── AFTERGLOW: single word, released ──────────────── */}
        {stage === 'afterglow' && (
          <motion.div
            key="afterglow"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ duration: 2 }}
          >
            <div style={{
              ...navicueType.arrival,
              color: palette.textFaint,
              textAlign: 'center',
            }}>
              Here.
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </NaviCueShell>
  );
}