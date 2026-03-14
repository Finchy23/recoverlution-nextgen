/**
 * SCHEMA BRIDGE — The TALK→SEEK/FORM Connection
 *
 * When the LLM detects a known schema in the user's entries
 * (inner critic, enmeshment), a subtle luminous invitation
 * appears at the base of the corridor.
 *
 * Not a notification. Not a popup. Not a recommendation.
 * A quiet glow with a single line of copy:
 * "Something here has a shape. Would you like to see it?"
 *
 * If the user taps, we navigate to the SEEK insight.
 * If they ignore, it fades. No judgment. No persistence.
 * The corridor does not nag.
 *
 * Position: bottom of glass, above orb clearance.
 * Weight: trace. Does not fight the page or prompts.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { DetectedSchema } from './talk-runtime';

import { room, font, tracking, typeSize, leading, weight, opacity, timing, glow, glaze, layer } from '../design-system/surface-tokens';

const SERIF = font.serif;
const SANS = font.sans;

// Map insightIds to human-readable bridge copy
const BRIDGE_COPY: Record<string, { essence: string; invitation: string }> = {
  'inner-critic': {
    essence: 'The voice that judges you has a shape.',
    invitation: 'SEE THE ARCHITECTURE',
  },
  'enmeshment': {
    essence: 'The feelings you carry may not all be yours.',
    invitation: 'TRACE THE BOUNDARY',
  },
};

interface SchemaBridgeProps {
  schemas: DetectedSchema[];
  color: string;
  breath: number;
  visible: boolean;
  onNavigate: (insightId: string) => void;
}

export function SchemaBridge({
  schemas,
  color,
  breath,
  visible,
  onNavigate,
}: SchemaBridgeProps) {
  const [dismissed, setDismissed] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Reset on new schemas
  useEffect(() => {
    setDismissed(false);
    setSelectedId(null);
  }, [schemas]);

  if (!visible || dismissed || schemas.length === 0) return null;

  // Show only the highest-confidence schema
  const topSchema = schemas.reduce((a, b) => a.confidence > b.confidence ? a : b);
  const copy = BRIDGE_COPY[topSchema.insightId];
  if (!copy) return null;

  const breathPhase = Math.sin(breath * Math.PI * 2);

  return (
    <AnimatePresence>
      <motion.div
        className="absolute pointer-events-auto"
        style={{
          bottom: '12%',
          left: '12%',
          right: '12%',
          zIndex: layer.scrim,
          textAlign: 'center',
        }}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Atmospheric glow */}
        <div
          className="absolute pointer-events-none"
          style={{
            inset: '-30px -20px',
            background: `radial-gradient(ellipse 70% 60% at 50% 50%, ${color}04 0%, transparent 70%)`,
          }}
        />

        {/* Bridge content */}
        <div className="relative">
          {/* Luminous dot */}
          <div
            className="mx-auto rounded-full"
            style={{
              width: 3 + breathPhase * 0.5,
              height: 3 + breathPhase * 0.5,
              background: color,
              boxShadow: glow.halo(color, 10, 20, '20', '08'),
              opacity: opacity.spoken,
              marginBottom: 12,
            }}
          />

          {/* Essence */}
          <p style={{
            fontFamily: SERIF,
            fontSize: 'clamp(11px, 2.8vw, 14px)',
            fontWeight: weight.light,
            fontStyle: 'italic',
            color: room.fg,
            opacity: opacity.spoken,
            margin: 0,
            lineHeight: leading.body,
          }}>
            {copy.essence}
          </p>

          {/* Invitation — tappable */}
          <motion.button
            className="mt-3 cursor-pointer bg-transparent border-none outline-none"
            style={{
              fontFamily: SANS,
              fontSize: typeSize.micro,
              fontWeight: weight.medium,
              letterSpacing: tracking.normal,
              textTransform: 'uppercase',
              color,
              opacity: selectedId ? 0.04 : 0.15,
              padding: '8px 16px',
              transition: timing.t.fadeModerate,
            }}
            whileHover={{ opacity: opacity.spoken }}
            onClick={() => {
              setSelectedId(topSchema.insightId);
              setTimeout(() => onNavigate(topSchema.insightId), 600);
            }}
          >
            {copy.invitation}
          </motion.button>

          {/* Dismiss — barely visible */}
          <button
            className="block mx-auto mt-2 cursor-pointer bg-transparent border-none outline-none"
            style={{
              fontFamily: SANS,
              fontSize: typeSize.whisper,
              fontWeight: weight.regular,
              letterSpacing: tracking.snug,
              color: glaze.veil,
              padding: '4px 8px',
            }}
            onClick={() => setDismissed(true)}
          >
            NOT NOW
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}