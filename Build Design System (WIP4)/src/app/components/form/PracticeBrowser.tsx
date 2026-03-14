/**
 * PRACTICE BROWSER — The Pre-Practice State
 *
 * Before the consulting room, the practice must be chosen.
 * This is not a menu. It is a deliberate selection surface —
 * the user chooses their instrument before the work begins.
 *
 * Each practice card reveals:
 *   - The schema (the thought being processed)
 *   - The protocol (ACT Defusion, Somatic Titration, etc.)
 *   - The atom (the physics simulation bound to this practice)
 *   - The container sequence (which instruments will be used)
 *
 * Selection transitions to the arriving phase.
 * The glass breathes. The practice loads.
 *
 * Death of the Box: no cards, no borders, no painted rectangles.
 * Each practice is a localized refraction on the dark glass.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { Practice } from './form-types';
import { CONTAINERS, PROTOCOLS, PILLARS, type PracticePillar } from './form-types';
import { FORM_PRACTICES } from './form-practices';
import { SEEK_INSIGHTS } from '../seek/seek-insights';
import { readAllKBEProfiles } from '../runtime/useSeekTelemetry';
import { useIndividualId } from '../runtime/session-seam';
import { useResilience } from '../runtime/resilience-seam';

import { room, font, tracking, typeSize, leading, weight, opacity, timing, glow, glaze, layer, signal } from '../design-system/surface-tokens';

const SERIF = font.serif;
const SANS = font.sans;

interface PracticeBrowserProps {
  /** Color for the surface */
  color: string;
  /** Breath amplitude 0-1 */
  breath: number;
  /** Callback when a practice is selected */
  onSelect: (practice: Practice) => void;
  /** Whether the browser is visible */
  visible: boolean;
  /** Currently focused practice ID (for keyboard nav) */
  focusedId?: string;
}

export function PracticeBrowser({
  color,
  breath,
  onSelect,
  visible,
  focusedId,
}: PracticeBrowserProps) {
  const userId = useIndividualId();
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [integrationMap, setIntegrationMap] = useState<Map<string, { integration: number; sessions: number }>>(new Map());
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Load KBE integration states for each practice ──
  useEffect(() => {
    if (!visible) return;

    readAllKBEProfiles(userId).then(profiles => {
      if (!Array.isArray(profiles)) return;

      const kbeMap = new Map<string, { knowing: number; believing: number; sessions: number }>();

      profiles.forEach((p: any) => {
        if (p?.value?.sessions?.length > 0) {
          const sessions = p.value.sessions;
          const lastSession = sessions[sessions.length - 1];
          const keyParts = (p.key || '').split(':');
          const insightId = keyParts[keyParts.length - 1];
          if (insightId) {
            kbeMap.set(insightId, {
              knowing: lastSession?.knowing || 0,
              believing: lastSession?.believing || 0,
              sessions: sessions.length,
            });
          }
        }
      });

      // Map each practice's atomId → SEEK insight → KBE integration
      const newMap = new Map<string, { integration: number; sessions: number }>();

      FORM_PRACTICES.forEach(practice => {
        const insight = SEEK_INSIGHTS.find(s => s.atomId === practice.atomId);
        if (insight) {
          const kbe = kbeMap.get(insight.id);
          if (kbe) {
            const integration = kbe.knowing * 0.3 + kbe.believing * 0.5 + Math.min(kbe.sessions / 10, 1) * 0.2;
            newMap.set(practice.id, { integration, sessions: kbe.sessions });
          }
        }
      });

      setIntegrationMap(newMap);
      console.log(`[FORM Browser] Loaded KBE integration for ${newMap.size} practices`);
    }).catch(() => {});
  }, [visible, userId]);

  // Group practices by protocol
  const protocols = Object.values(PROTOCOLS);

  // Group practices by pillar
  const pillarOrder: PracticePillar[] = ['baseline', 'shield', 'rewire', 'bridge'];
  const practicesByPillar = pillarOrder.map(pillar => ({
    pillar: PILLARS[pillar],
    practices: FORM_PRACTICES
      .filter(p => p.pillar === pillar)
      // ── Priority ordering: lowest integration first (most friction = most urgent) ──
      .sort((a, b) => {
        const aIntegration = integrationMap.get(a.id)?.integration ?? 0.5;
        const bIntegration = integrationMap.get(b.id)?.integration ?? 0.5;
        return aIntegration - bIntegration;
      }),
  })).filter(g => g.practices.length > 0);

  const handleSelect = useCallback((practice: Practice) => {
    setSelectedId(practice.id);
    // Delay to let the selection animation breathe
    setTimeout(() => {
      onSelect(practice);
    }, 600);
  }, [onSelect]);

  if (!visible) return null;

  return (
    <motion.div
      className="absolute inset-0 flex flex-col"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8 } }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Background */}
      <div className="absolute inset-0" style={{ background: room.void }} />
      
      {/* Atmospheric glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 60% 40% at 50% 30%, ${color}04 0%, transparent 70%)`,
        }}
      />

      {/* Header */}
      <div
        className="relative flex-shrink-0 pt-[8%] pb-[4%] px-[10%]"
        style={{ zIndex: layer.base }}
      >
        <motion.span
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: opacity.ambient, y: 0 }}
          transition={{ delay: 0.3, duration: 1 }}
          style={{
            fontFamily: SANS,
            fontSize: typeSize.micro,
            fontWeight: weight.medium,
            letterSpacing: tracking.wide,
            textTransform: 'uppercase',
            color,
          }}
        >
          FORM
        </motion.span>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: opacity.spoken, y: 0 }}
          transition={{ delay: 0.5, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{
            fontFamily: SERIF,
            fontSize: 'clamp(16px, 4vw, 22px)',
            fontWeight: weight.light,
            fontStyle: 'italic',
            color: room.fg,
            marginTop: 8,
            lineHeight: leading.firm,
          }}
        >
          Choose the work.
        </motion.p>
      </div>

      {/* Practice list */}
      <div
        ref={scrollRef}
        className="relative flex-1 overflow-y-auto px-[8%] pb-[15%]"
        style={{
          zIndex: layer.base,
          height: `calc(100% - 100px)`,
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {practicesByPillar.map((group, gi) => (
          <div key={group.pillar.name} className="mb-8">
            {/* Pillar header */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: opacity.spoken, y: 0 }}
              transition={{ delay: 0.5 + gi * 0.1, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              style={{
                fontFamily: SERIF,
                fontSize: 'clamp(16px, 4vw, 22px)',
                fontWeight: weight.light,
                fontStyle: 'italic',
                color: room.fg,
                marginTop: 8,
                lineHeight: leading.firm,
              }}
            >
              {group.pillar.name}
            </motion.p>

            {/* Practices in this pillar */}
            {group.practices.map((practice, i) => {
              const protocol = PROTOCOLS[practice.protocol];
              const isHovered = hoveredId === practice.id;
              const isSelected = selectedId === practice.id;
              const isFocused = focusedId === practice.id;
              const containerSequence = practice.steps.map(s => s.container);
              const uniqueContainers = [...new Set(containerSequence)];

              return (
                <motion.div
                  key={practice.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{
                    opacity: isSelected ? 0 : 1,
                    y: 0,
                    scale: isSelected ? 0.97 : 1,
                  }}
                  transition={{
                    delay: 0.6 + i * 0.12,
                    duration: 1,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  onPointerEnter={() => setHoveredId(practice.id)}
                  onPointerLeave={() => setHoveredId(null)}
                  onClick={() => handleSelect(practice)}
                  style={{
                    cursor: 'pointer',
                    padding: '16px 0',
                    position: 'relative',
                  }}
                >
                  {/* Hover/focus refraction glow */}
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      inset: '-8px -16px',
                      background: (isHovered || isFocused)
                        ? `radial-gradient(ellipse 100% 80% at 30% 50%, ${CONTAINERS[uniqueContainers[uniqueContainers.length > 1 ? 1 : 0]].colorTint.replace('0.5)', '0.03)')} 0%, transparent 70%)`
                        : 'none',
                      transition: timing.t.bgSettle,
                    }}
                  />

                  {/* Separator line — not a border, a light seam */}
                  {i > 0 && (
                    <div
                      className="absolute top-0 left-0 right-0"
                      style={{
                        height: '0.5px',
                        background: `linear-gradient(90deg, transparent 0%, ${isHovered ? glaze.frost : glaze.faint} 30%, ${isHovered ? glaze.frost : glaze.faint} 70%, transparent 100%)`,
                        transition: timing.t.bgShift,
                      }}
                    />
                  )}

                  {/* Practice content */}
                  <div className="relative">
                    {/* Schema — the thought */}
                    <p style={{
                      fontFamily: SERIF,
                      fontSize: 'clamp(13px, 3.2vw, 17px)',
                      fontWeight: weight.light,
                      fontStyle: 'italic',
                      color: room.fg,
                      opacity: isHovered ? 0.6 : 0.35,
                      margin: 0,
                      lineHeight: leading.firm,
                      transition: timing.t.fadeMid,
                    }}>
                      "{practice.schema}"
                    </p>

                    {/* Practice name */}
                    <p style={{
                      fontFamily: SERIF,
                      fontSize: 'clamp(10px, 2.5vw, 13px)',
                      fontWeight: weight.regular,
                      color: room.fg,
                      opacity: isHovered ? 0.45 : 0.2,
                      marginTop: 6,
                      transition: timing.t.fadeMid,
                    }}>
                      {practice.name}
                    </p>

                    {/* Clinical metadata */}
                    <div
                      className="flex items-center gap-3 flex-wrap"
                      style={{ marginTop: 6 }}
                    >
                      {/* Protocol */}
                      <span style={{
                        fontFamily: SANS,
                        fontSize: typeSize.micro,
                        fontWeight: weight.medium,
                        letterSpacing: tracking.snug,
                        textTransform: 'uppercase',
                        color: glaze.sheen,
                      }}>
                        {protocol.name}
                      </span>

                      {/* Container sequence */}
                      <div className="flex items-center gap-1">
                        {uniqueContainers.map((c, ci) => (
                          <span
                            key={c}
                            style={{
                              fontFamily: SANS,
                              fontSize: typeSize.whisper,
                              fontWeight: weight.medium,
                              letterSpacing: tracking.tight,
                              color: isHovered
                                ? CONTAINERS[c].colorTint.replace('0.5)', '0.4)')
                                : glaze.glint,
                              transition: timing.t.colorShift,
                            }}
                          >
                            {CONTAINERS[c].glyph}
                            {ci < uniqueContainers.length - 1 && (
                              <span style={{ color: glaze.veil, margin: '0 1px' }}>·</span>
                            )}
                          </span>
                        ))}
                      </div>

                      {/* Step count */}
                      <span style={{
                        fontFamily: font.mono,
                        fontSize: typeSize.micro,
                        color: glaze.glint,
                      }}>
                        {practice.steps.length} steps
                      </span>

                      {/* ── ∞MAP Integration indicator ── */}
                      {(() => {
                        const kbe = integrationMap.get(practice.id);
                        if (!kbe) return null;

                        // Color flows from red (friction) → amber (processing) → green (integrated)
                        const integrationColor = kbe.integration < 0.3
                          ? signal.friction : kbe.integration < 0.7
                          ? signal.energy : signal.anchor;

                        const label = kbe.integration < 0.3
                          ? 'FRICTION' : kbe.integration < 0.7
                          ? 'PROCESSING' : 'INTEGRATED';

                        return (
                          <div className="flex items-center gap-1.5">
                            {/* Integration pip — tiny luminous dot */}
                            <div
                              className="rounded-full"
                              style={{
                                width: 3,
                                height: 3,
                                background: integrationColor,
                                boxShadow: glow.dot(integrationColor, '30'),
                                opacity: isHovered ? 0.5 : 0.2,
                                transition: timing.t.fadeMid,
                              }}
                            />
                            {/* Integration label */}
                            <span style={{
                              fontFamily: SANS,
                              fontSize: typeSize.trace,
                              fontWeight: weight.medium,
                              letterSpacing: tracking.snug,
                              color: integrationColor,
                              opacity: isHovered ? 0.25 : 0.08,
                              transition: timing.t.fadeMid,
                            }}>
                              {label} · {kbe.sessions}×
                            </span>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Essence — visible on hover */}
                    <AnimatePresence>
                      {isHovered && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: opacity.present, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.4 }}
                          style={{
                            fontFamily: SERIF,
                            fontSize: typeSize.caption,
                            fontWeight: weight.light,
                            fontStyle: 'italic',
                            color: room.fg,
                            marginTop: 6,
                            lineHeight: leading.body,
                            overflow: 'hidden',
                          }}
                        >
                          {practice.essence}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{
          height: 80,
          background: `linear-gradient(to top, ${room.void} 0%, transparent 100%)`,
          zIndex: layer.content,
          pointerEvents: 'none',
        }}
      />
    </motion.div>
  );
}