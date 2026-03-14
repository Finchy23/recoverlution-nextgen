/**
 * TALK SURFACE — The Guided Corridor (Pure Shell)
 *
 * This file is ONLY the visible corridor.
 * No persistence. No schema detection. No KBE. No deep mining.
 * No prompt evolution. No fetch calls. No Supabase imports.
 *
 * All runtime behavior lives in useTalkCorridor.
 * This shell renders what the hook tells it to render.
 *
 * Seven visible phases:
 *   arriving    → threshold materializes, corridor opens
 *   prompting   → 2-3 prompt nodes float in the dark
 *   writing     → blank page is open, user fills the space
 *   sealing     → hold to seal, text sinks into glass
 *   reflecting  → mirror sentence echoes back, bounded and quiet
 *   threading   → constellation grows, brief pause
 *   resting     → session ends gently, corridor closes
 *
 * Seven shell regions:
 *   doorway     — the arrival threshold (luminous line + canopy copy)
 *   page        — the writing surface (JournalPage)
 *   seal        — the hold-to-seal node (inside JournalPage, emotionally central)
 *   reflection  — the mirror moment (bounded with luminous edges)
 *   bridge      — schema connection (bottom of glass, quiet invitation)
 *   thread      — the constellation (ambient during writing, bright during rest)
 *   rest state  — the corridor closing (constellation + depth marker)
 *
 * Shell law:
 *   one question at a time
 *   one truth at a time
 *   one visible move at a time
 *   no transcript feel
 *   no chatbot affordances
 *   exit always available
 */

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { SurfaceMode } from '../universal-player/surface-modes';
import { useSurfaceArrival } from './useSurfaceArrival';
import { useResilience } from '../runtime/resilience-seam';
import { ResilienceWhisper } from './ResilienceWhisper';

import { PromptField } from '../talk/PromptField';
import { JournalPage } from '../talk/JournalPage';
import { ThreadMap } from '../talk/ThreadMap';
import { SchemaBridge } from '../talk/SchemaBridge';
import { useTalkCorridor } from '../talk/useTalkCorridor';

import {
  room, font, opacity as op, layout, tracking, typeSize,
  leading, weight, timing, glow, radii, glaze, void_, layer,
} from '../design-system/surface-tokens';

const SERIF = font.serif;
const SANS = font.sans;
const ORB_CLEARANCE = layout.orbClearance;

// ═══════════════════════════════════════════════════
// THE SHELL
// ═══════════════════════════════════════════════════

interface TalkSurfaceProps {
  mode: SurfaceMode;
  breath: number;
  onResolve?: () => void;
  onNavigate?: (modeId: string, payload?: { schema?: string; insightId?: string }) => void;
}

export function TalkSurface({ mode, breath, onResolve, onNavigate }: TalkSurfaceProps) {
  const { posture } = useResilience();
  const { arrived } = useSurfaceArrival(mode);
  const containerRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState({ width: 375, height: 667 });

  // ─── THE HOOK — all runtime lives here ───
  const [corridor, actions] = useTalkCorridor({
    arrived,
    modeId: mode.id,
    onResolve,
    onNavigate,
  });

  const {
    phase, prompts, activePrompt, entries, sessionDepth,
    reflection, showThread, detectedSchemas, minedThemes,
    talkSeed, restInvitationVisible,
  } = corridor;

  const entryCount = entries.length;

  // ─── Viewport tracking ───
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) setViewport({ width, height });
    });
    ro.observe(el);
    setViewport({ width: el.offsetWidth, height: el.offsetHeight });
    return () => ro.disconnect();
  }, []);

  // ─── Derived visual states ───
  const isResting = phase === 'resting';
  const isWriting = phase === 'writing' || phase === 'sealing';
  const breathPhase = Math.sin(breath * Math.PI * 2);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden select-none"
      style={{ touchAction: 'none', cursor: 'default' }}
    >
      {/* ═══════════════════════════════════════════════
          BACKGROUND — The dark glass
          ═══════════════════════════════════════════════ */}
      <div className="absolute inset-0" style={{ background: room.void }} />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 50% 40% at 50% 45%, ${mode.color}03 0%, transparent 70%)`,
          transition: timing.t.atmosphereEase,
        }}
      />

      {/* ═══════════════════════════════════════════════
          THREAD REGION — z:1 — The growing constellation
          During rest, the constellation brightens as the final image.
          During active phases, it stays ambient and atmospheric.
          ═══════════════════════════════════════════════ */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: layer.base,
        opacity: isResting ? op.spoken : showThread ? op.clear : isWriting ? op.emerging : op.ambient,
        transition: isResting ? 'opacity 3s ease' : timing.t.fadeAtmosphere,
      }}>
        <ThreadMap
          entries={entries}
          color={mode.color}
          breath={breath}
          visible={entryCount > 0}
          width={viewport.width}
          height={viewport.height}
        />
      </div>

      {/* ═══════════════════════════════════════════════
          SCENE LAYER — z:2 — Phase-driven content
          ═══════════════════════════════════════════════ */}
      <div style={{ position: 'absolute', inset: 0, zIndex: layer.content }}>

        {/* ── DOORWAY REGION — Arrival threshold ── */}
        <AnimatePresence>
          {phase === 'arriving' && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.8 } }}
            >
              <div className="flex flex-col items-center gap-6" style={{ maxWidth: '75%' }}>
                {/* Threshold line — scales in from center */}
                <motion.div
                  style={{
                    width: '40%',
                    height: 1,
                    background: `linear-gradient(90deg, transparent, ${mode.color}18, transparent)`,
                  }}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ delay: 0.2, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                />

                {/* Surface label */}
                <motion.span
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: op.quiet, y: 0 }}
                  transition={{ delay: 0.4, duration: 1 }}
                  style={{
                    fontFamily: SANS,
                    fontSize: typeSize.micro,
                    fontWeight: weight.medium,
                    letterSpacing: tracking.wide,
                    textTransform: 'uppercase',
                    color: mode.color,
                  }}
                >
                  {talkSeed ? `TALK · ${talkSeed.label.toUpperCase()}` : 'TALK'}
                </motion.span>

                {/* Canopy copy */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: op.spoken, y: 0 }}
                  transition={{ delay: 0.6, duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    fontFamily: SERIF,
                    fontSize: 'clamp(14px, 3.5vw, 19px)',
                    fontWeight: weight.light,
                    fontStyle: 'italic',
                    color: room.fg,
                    textAlign: 'center',
                    lineHeight: leading.relaxed,
                  }}
                >
                  {talkSeed
                    ? `The constellation brought you here. What does ${talkSeed.label.toLowerCase()} mean to you?`
                    : mode.canopy}
                </motion.p>

                {/* Bottom threshold */}
                <motion.div
                  style={{
                    width: '25%',
                    height: 1,
                    background: `linear-gradient(90deg, transparent, ${mode.color}0C, transparent)`,
                  }}
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── PROMPT REGION — Luminous doorways ── */}
        <PromptField
          prompts={prompts}
          color={mode.color}
          breath={breath}
          onSelect={actions.selectPrompt}
          visible={phase === 'prompting'}
        />

        {/* ── PAGE REGION — The writing surface ── */}
        {activePrompt && isWriting && (
          <JournalPage
            prompt={activePrompt}
            color={mode.color}
            breath={breath}
            visible={true}
            onSeal={actions.sealEntry}
          />
        )}

        {/* ── REFLECTION REGION — Bounded mirror moment ── */}
        <AnimatePresence>
          {phase === 'reflecting' && reflection && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div
                className="relative flex flex-col items-center gap-6"
                style={{ maxWidth: '75%', padding: '32px 24px' }}
              >
                {/* Top boundary — luminous edge */}
                <motion.div
                  className="absolute"
                  style={{
                    top: 0, left: '15%', right: '15%', height: 1,
                    background: `linear-gradient(90deg, transparent, ${mode.color}14, transparent)`,
                  }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.3, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                />

                {/* Mirror glyph */}
                <div
                  className="rounded-full"
                  style={{
                    width: 3, height: 3,
                    background: mode.color,
                    boxShadow: glow.warm(mode.color, '25'),
                    opacity: op.steady,
                  }}
                />

                {/* Reflection text */}
                <p style={{
                  fontFamily: SERIF,
                  fontSize: 'clamp(14px, 3.5vw, 19px)',
                  fontWeight: weight.light,
                  fontStyle: 'italic',
                  color: room.fg,
                  opacity: op.steady,
                  textAlign: 'center',
                  lineHeight: leading.body,
                  letterSpacing: tracking.body,
                }}>
                  {reflection.text}
                </p>

                {/* Bottom boundary */}
                <motion.div
                  className="absolute"
                  style={{
                    bottom: 0, left: '15%', right: '15%', height: 1,
                    background: `linear-gradient(90deg, transparent, ${mode.color}0A, transparent)`,
                  }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 0.5, duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── THREADING INDICATOR — constellation growing ── */}
        <AnimatePresence>
          {phase === 'threading' && (
            <motion.div
              className="absolute pointer-events-none"
              style={{ top: '5%', left: 0, right: 0, textAlign: 'center', zIndex: layer.scrim }}
              initial={{ opacity: 0 }}
              animate={{ opacity: op.ghost }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
            >
              <span style={{
                fontFamily: SANS,
                fontSize: typeSize.whisper,
                fontWeight: weight.medium,
                letterSpacing: tracking.breath,
                textTransform: 'uppercase',
                color: room.fg,
              }}>
                {entryCount} {entryCount === 1 ? 'PIECE' : 'PIECES'} MAPPED
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── BRIDGE REGION — Quiet TALK→SEEK/FORM invitation ──
            Positioned at the very base of the glass.
            Does not compete with prompts or page.
            "something here has a shape" / "would you like to see it" */}
        <SchemaBridge
          schemas={detectedSchemas}
          color={mode.color}
          breath={breath}
          visible={phase === 'prompting' && detectedSchemas.length > 0}
          onNavigate={actions.navigateSchema}
        />

        {/* ── REST STATE REGION — The corridor closing ──
            Not a summary. Not analytics.
            The constellation brightens (via thread region opacity above).
            A single recognition that something was sealed.
            The corridor remains. */}
        <AnimatePresence>
          {isResting && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex flex-col items-center gap-8" style={{ maxWidth: '70%' }}>
                {/* Rest glyph — breathing point */}
                <motion.div
                  className="rounded-full"
                  style={{
                    width: 4, height: 4,
                    background: mode.color,
                    boxShadow: glow.warm(mode.color, '20'),
                  }}
                  animate={{
                    opacity: [op.gentle, op.trace, op.gentle],
                    scale: [1, 0.8, 1],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                />

                {/* Rest copy */}
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: op.spoken, y: 0 }}
                  transition={{ delay: 0.8, duration: 2, ease: [0.16, 1, 0.3, 1] }}
                  style={{
                    fontFamily: SERIF,
                    fontSize: 'clamp(14px, 3.5vw, 19px)',
                    fontWeight: weight.light,
                    fontStyle: 'italic',
                    color: room.fg,
                    textAlign: 'center',
                    lineHeight: leading.relaxed,
                  }}
                >
                  {entryCount} {entryCount === 1 ? 'piece' : 'pieces'} were sealed. The corridor is here when you return.
                </motion.p>

                {/* Depth marker */}
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: op.flicker }}
                  transition={{ delay: 2, duration: 1.5 }}
                  style={{
                    fontFamily: SANS,
                    fontSize: typeSize.micro,
                    fontWeight: weight.medium,
                    letterSpacing: tracking.wide,
                    textTransform: 'uppercase',
                    color: mode.color,
                  }}
                >
                  DEPTH {sessionDepth}
                </motion.span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── DEEP MINE THEMES — z:6 — Luminous thread emergence ── */}
        <AnimatePresence>
          {minedThemes.length > 0 && (
            <motion.div
              className="absolute pointer-events-none"
              style={{
                top: '12%', left: '8%', right: '8%',
                zIndex: layer.float, textAlign: 'center',
              }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4, transition: { duration: 2 } }}
              transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="flex justify-center mb-3">
                <div
                  className="rounded-full"
                  style={{
                    width: 2, height: 2,
                    background: mode.color,
                    boxShadow: glow.warm(mode.color, '30'),
                    opacity: op.body + breathPhase * 0.1,
                  }}
                />
              </div>

              <span style={{
                fontFamily: SANS, fontSize: typeSize.trace,
                fontWeight: weight.medium, letterSpacing: tracking.wide,
                textTransform: 'uppercase', color: mode.color,
                opacity: op.quiet, display: 'block', marginBottom: 8,
              }}>
                THREADS EMERGING · {minedThemes.length} PATTERNS
              </span>

              <div className="flex flex-col items-center gap-3">
                {minedThemes.map((theme, i) => (
                  <motion.div
                    key={theme.id}
                    className="flex flex-col items-center gap-1"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.4, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <span style={{
                      fontFamily: SERIF, fontSize: typeSize.note,
                      fontWeight: weight.light, fontStyle: 'italic',
                      color: room.fg, opacity: op.ghost + theme.intensity * op.quiet,
                    }}>
                      {theme.name}
                    </span>
                    <span style={{
                      fontFamily: SANS, fontSize: typeSize.whisper,
                      fontWeight: weight.regular, color: room.fg,
                      opacity: op.flicker, maxWidth: '60vw',
                    }}>
                      {theme.description}
                    </span>
                    {theme.insightCandidate && theme.suggestedInsightTitle && (
                      <span style={{
                        fontFamily: SANS, fontSize: typeSize.sub,
                        fontWeight: weight.medium, letterSpacing: tracking.snug,
                        color: mode.color, opacity: op.ghost,
                        textTransform: 'uppercase',
                      }}>
                        SEEK CANDIDATE → {theme.suggestedInsightTitle.toUpperCase()}
                      </span>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ═══════════════════════════════════════════════
          CHROME LAYER — z:3 — Indicators and invitations
          ═══════════════════════════════════════════════ */}

      {/* Session depth indicator */}
      {phase !== 'arriving' && !isResting && entryCount > 0 && phase !== 'threading' && (
        <div
          className="absolute pointer-events-none"
          style={{ top: '4%', left: 0, right: 0, textAlign: 'center', zIndex: layer.raised }}
        >
          <span style={{
            fontFamily: SANS, fontSize: typeSize.micro,
            fontWeight: weight.medium, letterSpacing: tracking.wide,
            textTransform: 'uppercase', color: room.fg,
          }}>
            TALK · DEPTH {sessionDepth}
          </span>
        </div>
      )}

      {/* Rest invitation — quiet exit possibility */}
      <AnimatePresence>
        {restInvitationVisible && phase === 'prompting' && (
          <motion.div
            className="absolute"
            style={{
              bottom: ORB_CLEARANCE + 44, left: 0, right: 0,
              textAlign: 'center', zIndex: layer.raised,
            }}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <button
              onClick={actions.enterRest}
              className="cursor-pointer"
              style={{
                background: 'none', border: 'none',
                padding: '12px 24px',
                display: 'inline-flex', alignItems: 'center', gap: 6,
              }}
            >
              <div
                className="rounded-full"
                style={{
                  width: 3, height: 3,
                  background: mode.color,
                  opacity: op.trace + breathPhase * 0.03,
                }}
              />
              <span style={{
                fontFamily: SANS, fontSize: typeSize.micro,
                fontWeight: weight.medium, letterSpacing: tracking.wide,
                textTransform: 'uppercase', color: room.fg, opacity: op.flicker,
              }}>
                REST
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Entry progress dots */}
      {phase === 'prompting' && entryCount > 0 && (
        <div
          className="absolute flex items-center gap-1 justify-center pointer-events-none"
          style={{ bottom: ORB_CLEARANCE + 16, left: 0, right: 0, zIndex: layer.raised, opacity: op.flicker }}
        >
          {entries.map((_, i) => (
            <div
              key={`dot-${i}`}
              style={{
                width: 3, height: 2, borderRadius: radii.dot,
                background: glaze.glint,
              }}
            />
          ))}
          <div style={{
            width: 8, height: 2, borderRadius: radii.dot,
            background: mode.color, opacity: op.gentle,
          }} />
        </div>
      )}

      {/* ═══ RESILIENCE WHISPER ═══ */}
      <ResilienceWhisper posture={posture} breath={breath} runtimeName="talk" />

      {/* Orb clearance gradient */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        height: ORB_CLEARANCE,
        background: `linear-gradient(to top, ${void_.haze} 0%, transparent 100%)`,
        zIndex: layer.overlay, pointerEvents: 'none',
      }} />
    </div>
  );
}