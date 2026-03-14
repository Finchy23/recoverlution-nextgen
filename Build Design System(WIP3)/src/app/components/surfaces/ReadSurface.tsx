/**
 * READ SURFACE — The Infinite Book
 *
 * The sentient library of one. Knowledge finds the user.
 *
 * The article lands immediately. No gates. No buttons.
 * Three ambient dots at the top right are the calibration
 * dials: Focus, Lens, Mode. Tap to cycle. A serif whisper
 * appears briefly, then dissolves. The next article
 * silently re-threads based on the new aperture.
 *
 * When the reader reaches the seal and keeps scrolling,
 * a breathing chevron signals continuation. The void
 * dissolves and the next article materializes.
 *
 * The book turns itself. The reader just reads.
 *
 * Death of the Box: No cards, no borders, no scroll tracks.
 * The depth thread is a luminous point on a fading filament.
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { SurfaceMode } from '../universal-player/surface-modes';
import { useSurfaceArrival, SURFACE_EASE, SURFACE_DURATION } from './useSurfaceArrival';
import {
  DEMO_PAGES,
  BLOCK_TYPOGRAPHY,
  BLOCK_OPACITY,
  type ArticleBlock,
  type DemoPage,
} from './article-format';
import {
  type CalibrationState,
  matchScore,
} from './read-calibration';
import { ReadCalibration } from './ReadCalibration';
import { useResilience } from '../runtime/resilience-seam';
import { ResilienceWhisper } from './ResilienceWhisper';
import {
  room, font, opacity, typeSize, layout, weight,
  timing, glow, radii, layer,
} from '../design-system/surface-tokens';

const ORB_CLEARANCE = layout.orbClearance;

// ─── Thread Builder ───
// Sorts remaining articles by match score to calibration.

function buildNextThread(calibration: CalibrationState, exclude: DemoPage): DemoPage[] {
  return DEMO_PAGES
    .filter(p => p !== exclude)
    .sort((a, b) => matchScore(calibration, b.coordinate) - matchScore(calibration, a.coordinate));
}

// ─── Scroll-Reveal Hook ───

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}

// ═══════════════════════════════════════════════════════
// BLOCK RENDERERS
// ═══════════════════════════════════════════════════════

interface BlockProps {
  block: ArticleBlock;
  chapterColor: string;
  index: number;
  staggerBase: number;
}

function MarkBlock({ block, chapterColor, staggerBase }: BlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: BLOCK_OPACITY.mark, y: 0 }}
      transition={{ delay: staggerBase, duration: SURFACE_DURATION, ease: SURFACE_EASE as unknown as number[] }}
      className="flex justify-center"
      style={{ marginBottom: 20 }}
    >
      <span style={{ ...BLOCK_TYPOGRAPHY.mark, color: chapterColor }}>
        {block.text}
      </span>
    </motion.div>
  );
}

function OpenBlock({ block, staggerBase }: BlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: BLOCK_OPACITY.open, y: 0 }}
      transition={{ delay: staggerBase + 0.1, duration: SURFACE_DURATION * 1.2, ease: SURFACE_EASE as unknown as number[] }}
      className="px-10 max-w-sm mx-auto"
      style={{ marginBottom: 8 }}
    >
      <h1 style={{ ...BLOCK_TYPOGRAPHY.open, color: room.fg, textAlign: 'center', margin: 0 }}>
        {block.text}
      </h1>
    </motion.div>
  );
}

function LedeBlock({ block, staggerBase }: BlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: BLOCK_OPACITY.lede }}
      transition={{ delay: staggerBase + 0.25, duration: SURFACE_DURATION * 1.4 }}
      className="px-12 max-w-sm mx-auto"
      style={{ marginBottom: 4 }}
    >
      <p style={{ ...BLOCK_TYPOGRAPHY.lede, color: room.fg, textAlign: 'center', margin: 0 }}>
        {block.text}
      </p>
    </motion.div>
  );
}

function LineBlock({ chapterColor, staggerBase }: BlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: opacity.ghost }}
      transition={{ delay: staggerBase + 0.35, duration: SURFACE_DURATION }}
      className="flex justify-center"
      style={{ margin: '24px 0' }}
    >
      <div style={{ width: 0.5, height: 48, background: `linear-gradient(to bottom, transparent, ${chapterColor}18, transparent)` }} />
    </motion.div>
  );
}

function BodyBlock({ block, staggerBase }: BlockProps) {
  const { ref, visible } = useScrollReveal();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? BLOCK_OPACITY.body : 0 }}
      transition={{ delay: staggerBase, duration: SURFACE_DURATION * 1.3 }}
      className="px-8 max-w-md mx-auto"
      style={{ marginBottom: 16 }}
    >
      <p style={{ ...BLOCK_TYPOGRAPHY.body, color: room.fg, margin: 0 }}>{block.text}</p>
    </motion.div>
  );
}

function PullBlock({ block, chapterColor, staggerBase }: BlockProps) {
  const { ref, visible } = useScrollReveal();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? BLOCK_OPACITY.pull : 0 }}
      transition={{ delay: staggerBase, duration: SURFACE_DURATION * 1.6 }}
      className="px-10 max-w-sm mx-auto"
      style={{ margin: '8px 0' }}
    >
      <p style={{ ...BLOCK_TYPOGRAPHY.pull, color: chapterColor, textAlign: 'center', margin: 0 }}>{block.text}</p>
    </motion.div>
  );
}

function RestBlock({ chapterColor, staggerBase }: BlockProps) {
  const { ref, visible } = useScrollReveal();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? opacity.present : 0 }}
      transition={{ delay: staggerBase, duration: SURFACE_DURATION }}
      className="flex items-center justify-center gap-0"
      style={{ margin: '20px 0', height: 32 }}
    >
      <div style={{ width: 32, height: 0.5, background: `linear-gradient(to right, transparent, ${chapterColor}12)` }} />
      <div
        className="rounded-full"
        style={{ width: 3, height: 3, background: chapterColor, opacity: opacity.body, boxShadow: glow.soft(chapterColor, '15'), flexShrink: 0 }}
      />
      <div style={{ width: 32, height: 0.5, background: `linear-gradient(to right, ${chapterColor}12, transparent)` }} />
    </motion.div>
  );
}

function TurnBlock({ block, staggerBase }: BlockProps) {
  const { ref, visible } = useScrollReveal();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? BLOCK_OPACITY.turn : 0 }}
      transition={{ delay: staggerBase, duration: SURFACE_DURATION * 1.4 }}
      className="flex justify-center"
      style={{ margin: '36px 0 28px' }}
    >
      <span style={{ ...BLOCK_TYPOGRAPHY.turn, color: room.fg }}>{block.text}</span>
    </motion.div>
  );
}

function LandBlock({ block, staggerBase }: BlockProps) {
  const { ref, visible } = useScrollReveal();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? BLOCK_OPACITY.land : 0 }}
      transition={{ delay: staggerBase, duration: SURFACE_DURATION * 1.5 }}
      className="px-8 max-w-md mx-auto"
      style={{ marginBottom: 16, marginTop: 8 }}
    >
      <p style={{ ...BLOCK_TYPOGRAPHY.land, color: room.fg, margin: 0 }}>{block.text}</p>
    </motion.div>
  );
}

function SealBlock({ chapterColor, staggerBase }: BlockProps) {
  const { ref, visible } = useScrollReveal();
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={{ opacity: visible ? opacity.gentle : 0 }}
      transition={{ delay: staggerBase, duration: SURFACE_DURATION * 2 }}
      className="flex justify-center"
      style={{ margin: '40px 0 20px' }}
    >
      <div
        className="rounded-full"
        style={{ width: 4, height: 4, background: chapterColor, boxShadow: glow.warm(chapterColor, '25') }}
      />
    </motion.div>
  );
}

// ─── Block Dispatcher ───

function renderBlock(block: ArticleBlock, chapterColor: string, index: number, staggerBase: number) {
  const props: BlockProps = { block, chapterColor, index, staggerBase };
  switch (block.type) {
    case 'mark': return <MarkBlock key={`mark-${index}`} {...props} />;
    case 'open': return <OpenBlock key={`open-${index}`} {...props} />;
    case 'lede': return <LedeBlock key={`lede-${index}`} {...props} />;
    case 'line': return <LineBlock key={`line-${index}`} {...props} />;
    case 'body': return <BodyBlock key={`body-${index}`} {...props} />;
    case 'pull': return <PullBlock key={`pull-${index}`} {...props} />;
    case 'rest': return <RestBlock key={`rest-${index}`} {...props} />;
    case 'turn': return <TurnBlock key={`turn-${index}`} {...props} />;
    case 'land': return <LandBlock key={`land-${index}`} {...props} />;
    case 'seal': return <SealBlock key={`seal-${index}`} {...props} />;
    default:     return null;
  }
}

// ══════════════════════════════════════════════════════
// SCROLL HORIZON — The Breath Between Articles
// A subtle breathing chevron after the seal.
// Scrolling into it triggers the next article.
// No buttons. No gates. Just continuation.
// ═══════════════════════════════════════════════════════

interface ScrollHorizonProps {
  nextColor: string;
  breath: number;
  onAdvance: () => void;
}

function ScrollHorizon({ nextColor, breath, onAdvance }: ScrollHorizonProps) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const advancedRef = useRef(false);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    advancedRef.current = false;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !advancedRef.current) {
          advancedRef.current = true;
          onAdvance();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [onAdvance]);

  const phase = breath * Math.PI * 2;
  const chevronOp = opacity.trace + Math.sin(phase) * 0.04;

  return (
    <div
      className="flex flex-col items-center"
      style={{ padding: '40px 0 60px' }}
    >
      {/* Filament descending from seal */}
      <div
        style={{
          width: 0.5,
          height: 56,
          background: `linear-gradient(to bottom, transparent, ${nextColor}08)`,
        }}
      />

      {/* Breathing chevron */}
      <div
        className="flex flex-col items-center gap-1"
        style={{ opacity: chevronOp, padding: '16px 0' }}
      >
        <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
          <path
            d="M1 1L8 8L15 1"
            stroke={nextColor}
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.5"
          />
        </svg>
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none" style={{ marginTop: -3 }}>
          <path
            d="M1 1L6 6L11 1"
            stroke={nextColor}
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.3"
          />
        </svg>
      </div>

      {/* Sentinel — the invisible trigger line */}
      <div ref={sentinelRef} style={{ height: 1, width: '100%' }} />

      {/* Trailing void */}
      <div style={{ height: '15vh' }} />
    </div>
  );
}

// ════════════════════════════════════════════���══════════
// THE READ SURFACE
// ═══════════════════════════════════════════════════════

interface ReadSurfaceProps {
  mode: SurfaceMode;
  breath: number;
  onResolve?: () => void;
  onNavigate?: (modeId: string) => void;
}

export function ReadSurface({ mode, breath }: ReadSurfaceProps) {
  const resilience = useResilience();
  const { arrived, delay } = useSurfaceArrival(mode);

  // ── Reading state ──
  const [pageIndex, setPageIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const page = DEMO_PAGES[pageIndex] ?? DEMO_PAGES[0];

  // ── Calibration — starts from article coordinate, user can shift ──
  const [calibration, setCalibration] = useState<CalibrationState>(() => ({ ...page.coordinate }));

  // Re-seed calibration when article changes
  useEffect(() => {
    setCalibration({ ...page.coordinate });
  }, [pageIndex]);

  // Next article based on calibration
  const nextThread = useMemo(() => buildNextThread(calibration, page), [calibration, page]);
  const nextPage = nextThread[0] ?? null;

  // ── Calibration change — silent, just re-threads ──
  const handleCalibrationChange = useCallback((next: CalibrationState) => {
    setCalibration(next);
  }, []);

  // ── Scroll tracking ──
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    const maxScroll = scrollHeight - clientHeight;
    if (maxScroll <= 0) return;
    setScrollProgress(scrollTop / maxScroll);
  }, []);

  // ── Auto-advance — triggered by scroll sentinel ──
  const advanceToNext = useCallback(() => {
    if (!nextPage) return;
    const nextIdx = DEMO_PAGES.indexOf(nextPage);
    if (nextIdx === -1) return;

    setTransitioning(true);
    setTimeout(() => {
      setPageIndex(nextIdx);
      setTransitioning(false);
      setScrollProgress(0);
      setTimeout(() => scrollRef.current?.scrollTo({ top: 0, behavior: 'auto' }), 50);
    }, 700);
  }, [nextPage]);

  // Reset scroll on page change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: 'auto' });
    setScrollProgress(0);
  }, [pageIndex]);

  const breathScale = 1 + Math.sin(breath * Math.PI * 2) * 0.008;

  const headerDelay = delay('content');
  function blockDelay(index: number, type: string): number {
    return ['mark', 'open', 'lede', 'line'].includes(type) ? headerDelay : headerDelay + 0.6;
  }

  return (
    <div className="absolute inset-0 overflow-hidden select-none">
      {/* ═══ BACKGROUND ═══ */}
      <div className="absolute inset-0" style={{ background: room.void }} />

      {/* Atmospheric glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 70% 55% at 50% 25%, ${page.chapterColor}04 0%, transparent 55%)`,
          transform: `scale(${breathScale})`,
          transition: timing.t.breathTransform,
        }}
      />

      {/* Focus isolation */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 55% 50% at 50% 45%, transparent 15%, rgba(6,5,10,${0.15 + scrollProgress * 0.35}) 100%)`,
          transition: timing.t.bgSettle,
        }}
      />

      {/* Top fade */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: 80, background: `linear-gradient(to bottom, ${room.void}, transparent)`, zIndex: layer.scrim }}
      />

      {/* Bottom fade + orb territory */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: ORB_CLEARANCE + 50, background: `linear-gradient(to bottom, transparent, ${room.void} 55%)`, zIndex: layer.scrim }}
      />

      {/* ═══ TRANSITION OVERLAY ═══ */}
      <AnimatePresence>
        {transitioning && (
          <motion.div
            className="absolute inset-0"
            style={{ background: room.void, zIndex: layer.pinnacle }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </AnimatePresence>

      {/* ═══ DEPTH THREAD ═══ */}
      {arrived && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: opacity.ghost }}
          transition={{ delay: delay('peripherals'), duration: SURFACE_DURATION }}
          style={{
            position: 'absolute',
            right: '6%',
            top: '12%',
            bottom: `${ORB_CLEARANCE + 30}px`,
            width: 0.5,
            background: `linear-gradient(to bottom, transparent, ${page.chapterColor}14 15%, ${page.chapterColor}14 85%, transparent)`,
            zIndex: layer.float,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: `${8 + scrollProgress * 84}%`,
              left: -1.5,
              width: 4,
              height: 4,
              borderRadius: radii.circle,
              background: page.chapterColor,
              opacity: opacity.steady,
              boxShadow: glow.mid(page.chapterColor, '20'),
              transition: timing.t.positionSnap,
            }}
          />
        </motion.div>
      )}

      {/* ═══ AMBIENT CALIBRATION ═══ */}
      {arrived && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay('peripherals') + 0.3, duration: 1.2 }}
        >
          <ReadCalibration
            calibration={calibration}
            breath={breath}
            onCalibrationChange={handleCalibrationChange}
          />
        </motion.div>
      )}

      {/* ═══ SCROLLABLE CONTENT ═══ */}
      {arrived && (
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="absolute inset-0 overflow-y-auto"
          style={{
            paddingBottom: ORB_CLEARANCE + 60,
            scrollbarWidth: 'none',
            zIndex: layer.overlay,
          }}
        >
          {/* Descent space */}
          <div style={{ height: '30vh' }} />

          {/* Article blocks */}
          {page.blocks.map((block, i) =>
            renderBlock(block, page.chapterColor, i, blockDelay(i, block.type))
          )}

          {/* ═══ SCROLL HORIZON — the breath, then auto-advance ═══ */}
          {nextPage ? (
            <ScrollHorizon
              nextColor={nextPage.chapterColor}
              breath={breath}
              onAdvance={advanceToNext}
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: scrollProgress > 0.9 ? opacity.quiet : 0 }}
              transition={{ duration: 1.2 }}
              className="flex flex-col items-center gap-3 py-8"
              style={{ marginTop: 40 }}
            >
              <span style={{
                fontFamily: font.serif,
                fontSize: typeSize.small,
                fontWeight: weight.light,
                fontStyle: 'italic',
                color: room.fg,
                opacity: opacity.spoken,
              }}>
                The page rests here
              </span>
            </motion.div>
          )}

          {/* Bottom spacer */}
          <div style={{ height: ORB_CLEARANCE + 80 }} />
        </div>
      )}

      {/* ═══ RESILIENCE WHISPER ═══ */}
      <ResilienceWhisper posture={resilience.posture} breath={breath} runtimeName="read" />

      {/* ═══ HIDE SCROLLBAR ═══ */}
      <style>{`div::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
}