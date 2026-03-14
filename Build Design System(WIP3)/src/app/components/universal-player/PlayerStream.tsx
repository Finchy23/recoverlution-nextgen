/**
 * THE STREAM — The Beneath
 *
 * The hidden face of the glass. Not a drawer. Not a panel.
 * A spatial surface that lives beneath the orb, revealed
 * when the user scrolls upward from the anchor region.
 *
 * The orb is 3D. When you scroll up over it, the sphere
 * rolls upward and the Stream rises into view beneath it.
 * The glass continues, same material, different purpose.
 *
 * Structure:
 *   Title moment — time-contextual, felt, not labeled
 *   Flow cue — the current thread of the journey
 *   Signal feed — insights, metrics, traces, schedule
 *   End whisper — the breath at the bottom
 *
 * No cards. No borders. No instructional text.
 * The design speaks for itself.
 *
 * Seal & Carry traces persist here.
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence, type PanInfo } from 'motion/react';
import { acousticDrift, isAcousticsEnabled } from '../surfaces/acoustics';
import {
  colors, layer, void_, refract, font, typeSize, weight,
  room, opacity, leading, tracking, glow, glaze, glass,
  radii, timing,
} from '../design-system/surface-tokens';

// ─ Trace Particles (Seal & Carry) ──

interface TraceParticle {
  id: string;
  text: string;
  color: string;
  timestamp: number;
  life: number;
}

const TRACE_LIFETIME_MS = 12000;

// ── Stream Content Types ──

interface StreamInsight {
  id: string;
  type: 'flow' | 'greeting' | 'signal' | 'metric' | 'schedule' | 'trace' | 'progress';
  text: string;
  subtext?: string;
  color: string;
  time?: string;
  progress?: number;
}

// ── Time-contextual title ──

function getTimeTitle(): { title: string; whisper: string } {
  const hour = new Date().getHours();
  if (hour < 6) return { title: 'The quiet hours', whisper: 'Everything is still' };
  if (hour < 12) return { title: 'This morning', whisper: 'The day is still forming' };
  if (hour < 17) return { title: 'This afternoon', whisper: 'The day is in motion' };
  if (hour < 21) return { title: 'This evening', whisper: 'The day is settling' };
  return { title: 'Tonight', whisper: 'The body begins to rest' };
}

// ── Content generation ──

function generateStreamContent(
  modeColor: string,
  fragments: string[],
  traces: TraceParticle[],
): StreamInsight[] {
  const items: StreamInsight[] = [
    {
      id: 'flow',
      type: 'flow',
      text: 'Notice one moment of friction today. Don\'t fix it. Just see it.',
      subtext: 'Experience · Day 12',
      color: colors.brand.purple.primary,
    },
    {
      id: 'greeting',
      type: 'greeting',
      text: 'You showed up.',
      subtext: 'Day 12 of practice',
      color: modeColor,
      time: 'now',
    },
    {
      id: 'metric-hr',
      type: 'metric',
      text: 'Heart rate settling',
      subtext: '72 bpm · down 8 from arrival',
      color: colors.status.green.bright,
      time: '3m',
    },
    {
      id: 'progress',
      type: 'progress',
      text: 'Weekly rhythm',
      subtext: '4 of 6 sessions',
      color: colors.accent.cyan.primary,
      progress: 0.67,
    },
    ...fragments.slice(0, 2).map((f, i) => ({
      id: `fragment-${i}`,
      type: 'signal' as const,
      text: f,
      color: modeColor,
      time: `${5 + i * 3}m`,
    })),
    {
      id: 'schedule',
      type: 'schedule',
      text: 'Breathwork',
      subtext: '2:30 pm',
      color: colors.status.amber.bright,
      time: 'next',
    },
    {
      id: 'community',
      type: 'signal',
      text: 'Someone in your circle completed a practice.',
      color: colors.brand.purple.mid,
      time: '12m',
    },
  ];

  // Weave trace particles
  traces.filter(t => t.life > 0.3).forEach(trace => {
    items.splice(2, 0, {
      id: trace.id,
      type: 'trace',
      text: trace.text,
      color: trace.color,
      time: '·',
    });
  });

  return items;
}

// ── Type indicator particles ──

function TypeParticle({ item }: { item: StreamInsight }) {
  if (item.type === 'flow') {
    return (
      <motion.svg
        width="12" height="12" viewBox="0 0 12 12"
        animate={{ rotate: [0, 360] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      >
        <circle cx="6" cy="6" r="4.5" fill="none" stroke={glass(item.color, 0.06)} strokeWidth="0.75" />
        <path
          d="M 6 1.5 A 4.5 4.5 0 0 1 10.5 6"
          fill="none"
          stroke={item.color}
          strokeWidth="0.75"
          strokeLinecap="round"
          opacity="0.45"
          style={{ filter: `drop-shadow(0 0 3px ${glass(item.color, 0.3)})` }}
        />
      </motion.svg>
    );
  }

  if (item.type === 'progress') {
    const circumference = 2 * Math.PI * 4.5;
    return (
      <svg width="12" height="12" viewBox="0 0 12 12">
        <circle cx="6" cy="6" r="4.5" fill="none" stroke={glass(item.color, 0.08)} strokeWidth="0.75" />
        <circle
          cx="6" cy="6" r="4.5"
          fill="none"
          stroke={item.color}
          strokeWidth="0.75"
          strokeDasharray={`${(item.progress || 0) * circumference} ${circumference}`}
          strokeLinecap="round"
          transform="rotate(-90 6 6)"
          opacity="0.45"
          style={{ filter: `drop-shadow(0 0 3px ${glass(item.color, 0.3)})` }}
        />
      </svg>
    );
  }

  if (item.type === 'schedule') {
    return (
      <div
        className="rounded-full"
        style={{
          width: 4,
          height: 4,
          border: `0.75px solid ${glass(item.color, 0.3)}`,
          background: 'transparent',
        }}
      />
    );
  }

  return (
    <div
      className="rounded-full"
      style={{
        width: item.type === 'trace' ? 2.5 : 3.5,
        height: item.type === 'trace' ? 2.5 : 3.5,
        background: `radial-gradient(circle, ${glass(item.color, 0.5)}, ${glass(item.color, 0.15)})`,
        boxShadow: glow.dot(item.color, '20'),
      }}
    />
  );
}

// ═══════════════════════════════════════════════════
// THE STREAM SURFACE
// ═══════════════════════════════════════════════════

interface PlayerStreamProps {
  fragments: string[];
  color: string;
  traces?: TraceParticle[];
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}

export function PlayerStream({
  fragments,
  color,
  traces = [],
  open,
  onOpen,
  onClose,
}: PlayerStreamProps) {
  const streamContent = generateStreamContent(color, fragments, traces);
  const { title, whisper } = getTimeTitle();
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    if (info.velocity.y > 250 || info.offset.y > 100) {
      onClose();
    }
  }, [onClose]);

  // Reset scroll on close
  useEffect(() => {
    if (!open && scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  }, [open]);

  return (
    <>
      {/* ═══ CLOSED STATE — Ambient breath line above the orb ═══ */}
      {!open && (
        <motion.div
          className="absolute left-0 right-0 flex flex-col items-center"
          style={{
            bottom: 62,
            zIndex: layer.playerStream,
          }}
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0.4, bottom: 0 }}
          onDragEnd={(_: any, info: PanInfo) => {
            if (info.velocity.y < -180 || info.offset.y < -50) {
              onOpen();
            }
          }}
        >
          {/* Luminous filament — the seam between surfaces */}
          <motion.div
            style={{
              width: 24,
              height: 1.5,
              borderRadius: radii.full,
              background: `linear-gradient(90deg, transparent, ${glass(color, 0.12)}, transparent)`,
              cursor: 'grab',
            }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      )}

      {/* ═══ OPEN STATE — The Beneath ═══ */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="absolute inset-0 flex flex-col"
            style={{
              zIndex: layer.playerChrome,
              overflow: 'hidden',
            }}
            // ── The 3D orb roll: perspective rotation on entry ──
            initial={{
              y: '100%',
              rotateX: -8,
              transformOrigin: 'bottom center',
            }}
            animate={{
              y: 0,
              rotateX: 0,
              transformOrigin: 'bottom center',
            }}
            exit={{
              y: '100%',
              rotateX: -5,
              transformOrigin: 'bottom center',
            }}
            transition={{
              type: 'spring',
              damping: 36,
              stiffness: 280,
              mass: 0.9,
            }}
            // ── Drag down to dismiss ──
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={handleDragEnd}
          >
            {/* ── Glass backing — continuous dark glass ── */}
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(180deg, ${room.void} 0%, ${glass(room.void, 0.97)} 30%, ${glass(room.void, 0.94)} 100%)`,
                backdropFilter: refract.deep,
                WebkitBackdropFilter: refract.deep,
              }}
            />

            {/* ── Atmospheric glow — picks up mode color ── */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 80% 40% at 50% 15%, ${glass(color, 0.03)} 0%, transparent 70%)`,
              }}
            />

            {/* ── Dismiss gesture line — subtle, at the top ── */}
            <div className="relative flex justify-center pt-5 pb-1" style={{ zIndex: 2 }}>
              <div
                style={{
                  width: 28,
                  height: 2,
                  borderRadius: radii.full,
                  background: `linear-gradient(90deg, transparent, ${glass(color, 0.15)}, transparent)`,
                }}
              />
            </div>

            {/* ── Scrollable content ── */}
            <div
              ref={scrollRef}
              className="relative flex-1 overflow-y-auto overflow-x-hidden"
              style={{
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                zIndex: 2,
              }}
            >
              {/* ── TITLE MOMENT ── */}
              <motion.div
                className="px-8 pt-6 pb-10"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              >
                <h1
                  style={{
                    fontFamily: font.serif,
                    fontSize: typeSize.title,
                    fontWeight: weight.light,
                    color: room.fg,
                    opacity: opacity.bright,
                    lineHeight: leading.tight,
                    letterSpacing: tracking.tight_neg,
                  }}
                >
                  {title}
                </h1>
                <p
                  style={{
                    fontFamily: font.serif,
                    fontSize: typeSize.reading,
                    fontWeight: weight.light,
                    fontStyle: 'italic',
                    color: color,
                    opacity: opacity.spoken,
                    marginTop: 8,
                    letterSpacing: tracking.hair,
                    lineHeight: leading.relaxed,
                  }}
                >
                  {whisper}
                </p>
              </motion.div>

              {/* ── FLOW CUE — the current thread, elevated ── */}
              {streamContent.filter(i => i.type === 'flow').map((item, idx) => (
                <motion.div
                  key={item.id}
                  className="relative px-8 mb-10"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                >
                  {/* Atmospheric field behind flow cue */}
                  <div
                    className="absolute -inset-x-4 -inset-y-4 pointer-events-none"
                    style={{
                      background: `radial-gradient(ellipse 100% 140% at 20% 50%, ${glass(item.color, 0.04)} 0%, transparent 70%)`,
                      borderRadius: 16,
                    }}
                  />

                  <div className="relative">
                    {/* Flow eyebrow */}
                    <div className="flex items-center gap-2 mb-3">
                      <TypeParticle item={item} />
                      <span
                        style={{
                          fontFamily: font.sans,
                          fontSize: typeSize.label,
                          fontWeight: weight.medium,
                          letterSpacing: tracking.label,
                          textTransform: 'uppercase' as const,
                          color: item.color,
                          opacity: opacity.steady,
                        }}
                      >
                        current thread
                      </span>
                    </div>

                    <p
                      style={{
                        fontFamily: font.serif,
                        fontSize: typeSize.prose,
                        fontWeight: weight.light,
                        fontStyle: 'italic',
                        color: item.color,
                        opacity: opacity.body,
                        lineHeight: leading.generous,
                        letterSpacing: tracking.hair,
                      }}
                    >
                      {item.text}
                    </p>

                    {item.subtext && (
                      <p
                        style={{
                          fontFamily: font.sans,
                          fontSize: typeSize.detail,
                          fontWeight: weight.regular,
                          color: item.color,
                          opacity: opacity.gentle,
                          marginTop: 6,
                          letterSpacing: tracking.body,
                        }}
                      >
                        {item.subtext}
                      </p>
                    )}
                  </div>

                  {/* Separator */}
                  <div
                    style={{
                      marginTop: 20,
                      height: 1,
                      background: `linear-gradient(90deg, transparent, ${glaze.thin} 30%, ${glaze.whisper} 70%, transparent)`,
                    }}
                  />
                </motion.div>
              ))}

              {/* ── SIGNAL FEED — everything else ── */}
              <div className="px-8 space-y-0">
                {streamContent.filter(i => i.type !== 'flow').map((item, i) => (
                  <motion.div
                    key={item.id}
                    className="relative"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: 0.2 + i * 0.05,
                      duration: 0.7,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    {/* Content row */}
                    <div className="flex items-start gap-3 py-4">
                      {/* Particle */}
                      <div className="mt-1.5 shrink-0 w-3 flex items-center justify-center">
                        <TypeParticle item={item} />
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0">
                        <p
                          style={{
                            fontFamily: item.type === 'greeting' ? font.serif : font.serif,
                            fontSize: item.type === 'greeting'
                              ? typeSize.lede
                              : item.type === 'trace'
                                ? typeSize.reading
                                : typeSize.small,
                            fontWeight: item.type === 'greeting' ? weight.light : weight.light,
                            fontStyle: item.type === 'trace' || item.type === 'greeting' ? 'italic' : 'normal',
                            color: item.type === 'greeting' ? room.fg : room.fg,
                            opacity: item.type === 'trace'
                              ? opacity.gentle
                              : item.type === 'greeting'
                                ? opacity.body
                                : opacity.steady,
                            lineHeight: leading.firm,
                          }}
                        >
                          {item.text}
                        </p>
                        {item.subtext && (
                          <p
                            style={{
                              fontFamily: font.sans,
                              fontSize: typeSize.label,
                              fontWeight: weight.regular,
                              color: item.color,
                              opacity: opacity.gentle,
                              marginTop: 3,
                              letterSpacing: tracking.body,
                            }}
                          >
                            {item.subtext}
                          </p>
                        )}
                      </div>

                      {/* Time whisper */}
                      {item.time && (
                        <span
                          className="shrink-0 mt-1"
                          style={{
                            fontFamily: font.mono,
                            fontSize: typeSize.label,
                            fontWeight: weight.regular,
                            color: item.type === 'trace' ? item.color : room.gray3,
                            opacity: item.type === 'trace' ? opacity.spoken : opacity.steady,
                            letterSpacing: tracking.code,
                          }}
                        >
                          {item.time}
                        </span>
                      )}
                    </div>

                    {/* Separator filament */}
                    <div
                      style={{
                        height: 1,
                        background: `linear-gradient(90deg, transparent 5%, ${glaze.faint} 25%, ${glaze.whisper} 50%, ${glaze.faint} 75%, transparent 95%)`,
                      }}
                    />
                  </motion.div>
                ))}
              </div>

              {/* ── END WHISPER ── */}
              <motion.p
                className="text-center py-12 px-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: opacity.murmur }}
                transition={{ delay: 0.9, duration: 1.2 }}
                style={{
                  fontFamily: font.serif,
                  fontSize: typeSize.note,
                  fontWeight: weight.light,
                  fontStyle: 'italic',
                  color: room.fg,
                  letterSpacing: tracking.hair,
                  lineHeight: leading.relaxed,
                }}
              >
                nothing else needs your attention right now
              </motion.p>

              {/* Bottom clearance for orb */}
              <div style={{ height: 100 }} />
            </div>

            {/* ── Bottom gradient — fades into orb territory ── */}
            <div
              className="absolute bottom-0 left-0 right-0 pointer-events-none"
              style={{
                height: 120,
                background: `linear-gradient(to bottom, transparent, ${room.void} 70%)`,
                zIndex: 3,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ── Seal & Carry Hook ──

export function useSealAndCarry() {
  const [traces, setTraces] = useState<TraceParticle[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      setTraces(prev =>
        prev
          .map(t => ({
            ...t,
            life: Math.max(0, 1 - (now - t.timestamp) / TRACE_LIFETIME_MS),
          }))
          .filter(t => t.life > 0)
      );
    }, 200);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const addTrace = useCallback((text: string, traceColor: string) => {
    const particle: TraceParticle = {
      id: `trace-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      text,
      color: traceColor,
      timestamp: Date.now(),
      life: 1,
    };
    setTraces(prev => [...prev.slice(-4), particle]);
    if (isAcousticsEnabled()) {
      acousticDrift();
    }
  }, []);

  return { traces, addTrace };
}