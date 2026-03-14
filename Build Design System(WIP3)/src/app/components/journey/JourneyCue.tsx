/**
 * JOURNEY CUE — The Daily Seed on the Stream
 *
 * Each cue is a single focused interaction that opens on the Stream glass.
 * It is not a card. It is not a notification. It is a localized refraction
 * in the glass — light arriving where the reader is already looking.
 *
 * Scene types render differently:
 *   PRIMER/RECOGNIZE/ALIGN — Narrative. Read-only. Atmospheric.
 *   EXPERIENCE — Narrative + seed. Light haptic hold to sync.
 *   INTROSPECTION — Safe input. The user writes.
 *   ANCHOR — Closing narrative. Particles settle into K.B.E.
 *
 * The cue seals on close. It persists until the next one replaces it.
 * Death of the Box: no cards, no modals, no borders. Just glass and text.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { JourneyScene, JourneyEntry } from './journey-data';
import { hapticSeal } from '../surfaces/haptics';
import {
  room, font, opacity, typeSize, tracking, layout, leading, weight,
  timing, glowRadial, type, filament, glow, refract,
  layer,
} from '../design-system/surface-tokens';

// ─── Props ───

interface JourneyCueProps {
  scene: JourneyScene;
  color: string;
  breath: number;
  sealed: boolean;
  dayLabel: string;
  journeySchema: string;
  onSeal: (entry?: JourneyEntry) => void;
  onDismiss: () => void;
  onNavigateToTalk?: () => void;
}

// ─── Scene type labels ───

const SCENE_LABELS: Record<string, string> = {
  primer: 'OPENING',
  experience: 'EXPERIENCE',
  introspection: 'INTROSPECTION',
  recognize: 'RECOGNIZE',
  align: 'ALIGN',
  anchor: 'ANCHOR',
};

// ─── Narrative Scene — read-only atmospheric text ───

function NarrativeBlock({
  scene,
  color,
  breath,
}: {
  scene: JourneyScene;
  color: string;
  breath: number;
}) {
  const glowScale = 0.85 + breath * 0.15;

  return (
    <div className="flex flex-col items-center text-center px-8" style={{ maxWidth: 340 }}>
      {/* Atmospheric glow */}
      <div
        className="absolute rounded-full"
        style={{
          width: 200,
          height: 200,
          background: glowRadial(color, '06'),
          transform: `scale(${glowScale})`,
          filter: refract.extreme,
          opacity: opacity.ambient,
          transition: timing.t.breathe,
          pointerEvents: 'none',
        }}
      />

      {/* Main copy */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{
          fontFamily: font.serif,
          fontSize: typeSize.body,
          fontWeight: weight.light,
          lineHeight: leading.body,
          color: room.fg,
          opacity: opacity.spoken,
          margin: 0,
          position: 'relative',
          zIndex: layer.base,
        }}
      >
        {scene.copy}
      </motion.p>

      {/* Sub-copy */}
      {scene.subCopy && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.8 }}
          style={{
            fontFamily: font.serif,
            fontSize: typeSize.small,
            fontWeight: weight.light,
            fontStyle: 'italic',
            lineHeight: leading.body,
            color: room.fg,
            opacity: opacity.gentle,
            marginTop: 16,
            position: 'relative',
            zIndex: layer.base,
          }}
        >
          {scene.subCopy}
        </motion.p>
      )}

      {/* Seed instruction (Experience/Recognize/Align) */}
      {scene.seed && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          style={{
            marginTop: 24,
            padding: '14px 20px',
            background: `${color}06`,
            borderLeft: `1px solid ${color}15`,
            textAlign: 'left',
            position: 'relative',
            zIndex: layer.base,
          }}
        >
          <span style={type.eyebrow(color)}>THE SEED</span>
          <p
            style={{
              fontFamily: font.serif,
              fontSize: typeSize.reading,
              fontWeight: weight.light,
              lineHeight: leading.body,
              color: room.fg,
              opacity: opacity.body,
              margin: '8px 0 0',
            }}
          >
            {scene.seed}
          </p>
        </motion.div>
      )}
    </div>
  );
}

// ─── Introspection Scene — user writes ───

function IntrospectionBlock({
  scene,
  color,
  onEntry,
}: {
  scene: JourneyScene;
  color: string;
  onEntry: (text: string) => void;
}) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    if (text.trim().length > 0) {
      onEntry(text.trim());
    }
  }, [text, onEntry]);

  return (
    <div className="flex flex-col items-center text-center px-8" style={{ maxWidth: 340 }}>
      {/* Prompt */}
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.3 }}
        style={{
          fontFamily: font.serif,
          fontSize: typeSize.body,
          fontWeight: weight.light,
          fontStyle: 'italic',
          lineHeight: leading.body,
          color: room.fg,
          opacity: opacity.spoken,
          margin: '0 0 24px',
        }}
      >
        {scene.copy}
      </motion.p>

      {/* Text input area */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.6 }}
        className="w-full"
        style={{ textAlign: 'left' }}
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write here..."
          rows={5}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            borderBottom: `1px solid ${color}15`,
            outline: 'none',
            resize: 'none',
            fontFamily: font.serif,
            fontSize: typeSize.reading,
            fontWeight: weight.light,
            lineHeight: leading.body,
            color: room.fg,
            opacity: opacity.body,
            padding: '12px 0',
            caretColor: color,
          }}
        />

        {/* Submit */}
        {text.trim().length > 0 && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={handleSubmit}
            className="cursor-pointer"
            style={{
              marginTop: 16,
              background: 'none',
              border: 'none',
              fontFamily: font.sans,
              fontSize: typeSize.label,
              fontWeight: weight.medium,
              letterSpacing: tracking.eyebrow,
              textTransform: 'uppercase',
              color,
              opacity: opacity.body,
              transition: timing.t.fadeBrisk,
            }}
          >
            SEAL
          </motion.button>
        )}
      </motion.div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// JOURNEY CUE — Main Component
// ═══════════════════════════════════════════════════

export function JourneyCue({
  scene,
  color,
  breath,
  sealed,
  dayLabel,
  journeySchema,
  onSeal,
  onDismiss,
  onNavigateToTalk,
}: JourneyCueProps) {
  const [holdProgress, setHoldProgress] = useState(0);
  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const isIntrospection = scene.type === 'introspection';
  const isAnchor = scene.type === 'anchor';

  // ─── Hold-to-seal for non-introspection scenes ───
  const startHold = useCallback(() => {
    if (sealed || isIntrospection) return;
    setHoldProgress(0);
    holdTimer.current = setInterval(() => {
      setHoldProgress((prev) => {
        if (prev >= 1) {
          if (holdTimer.current) clearInterval(holdTimer.current);
          hapticSeal();
          onSeal();
          return 1;
        }
        return prev + 0.02;
      });
    }, 30);
  }, [sealed, isIntrospection, onSeal]);

  const endHold = useCallback(() => {
    if (holdTimer.current) {
      clearInterval(holdTimer.current);
      holdTimer.current = null;
    }
    setHoldProgress(0);
  }, []);

  useEffect(() => {
    return () => {
      if (holdTimer.current) clearInterval(holdTimer.current);
    };
  }, []);

  // ─── Introspection entry handler ───
  const handleIntrospectionEntry = useCallback(
    (text: string) => {
      hapticSeal();
      onSeal({
        sceneId: scene.id,
        text,
        timestamp: Date.now(),
      });
    },
    [scene.id, onSeal],
  );

  const sceneLabel = SCENE_LABELS[scene.type] || scene.type.toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="absolute inset-0 flex flex-col items-center justify-center"
      style={{
        zIndex: layer.cue,
        background: `radial-gradient(circle, ${color}0a 0%, transparent 70%)`,
        paddingBottom: layout.orbClearance,
      }}
    >
      {/* ─── Day + Scene eyebrow ─── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="text-center mb-6"
      >
        <span style={type.eyebrow(color)}>{dayLabel}</span>
        <div style={{ ...filament(color, 'horizontal'), width: 24, margin: '8px auto' }} />
        <span
          style={{
            fontFamily: font.sans,
            fontSize: typeSize.label,
            fontWeight: weight.regular,
            letterSpacing: tracking.tight,
            textTransform: 'uppercase',
            color,
            opacity: opacity.ambient,
            display: 'block',
          }}
        >
          {sceneLabel}
        </span>
      </motion.div>

      {/* ─── Scene Content ─── */}
      {isIntrospection ? (
        <IntrospectionBlock scene={scene} color={color} onEntry={handleIntrospectionEntry} />
      ) : (
        <NarrativeBlock scene={scene} color={color} breath={breath} />
      )}

      {/* ─── Schema tag ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.4 }}
        className="mt-8 text-center"
      >
        <span
          style={{
            fontFamily: font.sans,
            fontSize: typeSize.micro,
            fontWeight: weight.regular,
            letterSpacing: tracking.spread,
            textTransform: 'uppercase',
            color,
            opacity: opacity.ghost,
          }}
        >
          {journeySchema}
        </span>
      </motion.div>

      {/* ─── Seal / Dismiss controls ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 1.6 }}
        className="flex items-center gap-6 mt-10"
      >
        {!sealed && !isIntrospection && (
          <button
            onPointerDown={startHold}
            onPointerUp={endHold}
            onPointerCancel={endHold}
            className="relative cursor-pointer"
            style={{
              background: 'none',
              border: 'none',
              padding: '12px 20px',
            }}
          >
            {/* Hold progress ring */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(${color}${Math.round(holdProgress * 0.3 * 255)
                  .toString(16)
                  .padStart(2, '0')} ${holdProgress * 360}deg, transparent 0deg)`,
                opacity: holdProgress > 0 ? 1 : 0,
                transition: timing.t.fadeBrisk,
              }}
            />
            <span
              style={{
                fontFamily: font.sans,
                fontSize: typeSize.label,
                fontWeight: weight.medium,
                letterSpacing: tracking.eyebrow,
                textTransform: 'uppercase',
                color,
                opacity: opacity.spoken,
                position: 'relative',
                zIndex: layer.base,
              }}
            >
              HOLD TO SEAL
            </span>
          </button>
        )}

        {sealed && (
          <span
            style={{
              fontFamily: font.sans,
              fontSize: typeSize.label,
              fontWeight: weight.medium,
              letterSpacing: tracking.eyebrow,
              textTransform: 'uppercase',
              color,
              opacity: opacity.gentle,
            }}
          >
            SEALED
          </span>
        )}

        {/* Talk bridge (if available) */}
        {onNavigateToTalk && scene.type === 'introspection' && (
          <button
            onClick={onNavigateToTalk}
            className="cursor-pointer"
            style={{
              background: 'none',
              border: 'none',
              fontFamily: font.sans,
              fontSize: typeSize.label,
              fontWeight: weight.regular,
              letterSpacing: tracking.tight,
              textTransform: 'uppercase',
              color: room.fg,
              opacity: opacity.ambient,
              transition: timing.t.fadeBrisk,
            }}
          >
            OPEN IN TALK
          </button>
        )}

        {/* Dismiss */}
        <button
          onClick={onDismiss}
          className="cursor-pointer"
          style={{
            background: 'none',
            border: 'none',
            fontFamily: font.sans,
            fontSize: typeSize.label,
            fontWeight: weight.regular,
            letterSpacing: tracking.tight,
            textTransform: 'uppercase',
            color: room.fg,
            opacity: opacity.ghost,
            transition: timing.t.fadeBrisk,
          }}
        >
          CLOSE
        </button>
      </motion.div>

      {/* ─── Anchor glow (closing scene) ─── */}
      {isAnchor && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: 120,
            height: 120,
            bottom: layout.orbClearance + 40,
            left: '50%',
            transform: 'translateX(-50%)',
            background: glowRadial(color, '08'),
            boxShadow: glow.halo(color, 16, 32, '30', '10'),
            filter: refract.extreme,
          }}
        />
      )}
    </motion.div>
  );
}