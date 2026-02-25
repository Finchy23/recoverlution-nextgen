import { motion, AnimatePresence } from 'motion/react';
import { colors, surfaces, fonts, radius } from '@/design-tokens';
import { ChevronLeft, ChevronRight, Search, X, LayoutList } from 'lucide-react';
import { useState, useCallback, useRef, useEffect, useMemo, Suspense, lazy } from 'react';
import { ACT_GROUPS, getActForIndex, type ActGroup } from '@/app/data/lab-act-groups';
import { NaviCueLabProvider } from '@/app/components/navicue/NaviCueLabContext';
import type { LabNavicue } from '@/app/data/lab/labNavicues';

interface LabViewerProps {
  previewMode: 'mobile' | 'desktop';
}

const LazyNaviCueMasterRenderer = lazy(() =>
  import('@/app/components/navicue/NaviCueMasterRenderer').then(m => ({
    default: m.NaviCueMasterRenderer,
  })),
);

const DRAWER_HEADER_HEIGHT = 30;
const DRAWER_ITEM_HEIGHT = 34;
const DRAWER_OVERSCAN_PX = 300;

type FilteredAct = ActGroup & { indices: number[] };
type DrawerHeaderRow = {
  type: 'header';
  key: string;
  act: FilteredAct;
  isCurrentAct: boolean;
  completedInAct: number;
};
type DrawerItemRow = {
  type: 'item';
  key: string;
  idx: number;
  nc: LabNavicue;
  isCurrent: boolean;
  isCompleted: boolean;
  sigColor: string;
};
type DrawerRow = DrawerHeaderRow | DrawerItemRow;

/**
 * LAB VIEWER
 *
 * Isolated playground for the 1380 NaviCues (1000 First Millennium + 200 Second Millennium + 180 Third Millennium).
 * 1380 specimens across narrative acts + Foundation + series collections:
 * Foundation(5) | I(4) | II(4) | III(2) | IV(3) | V(2) | VI(3) | VII(3) | VIII(2) | IX(2) | X(5) | XI(5) | XII(5) | XIII(5)
 * | Act0-Novice(10) | Act1-Alchemist(10) | Act2-Architect(10) | Act3-Navigator(10) | Act4-Sage(10) | Act5-Mender(10) | Act6-Diplomat(10) | Act7-Weaver(10) | Act8-Visionary(10) | Act9-Luminary(10) | Act10-Hacker(10) | Act11-Chrononaut(10) | Act12-Mycelium(10) | Act13-Aesthete(10) | Act14-Elemental(10) | Act15-Phenomenologist(10) | Act16-AlchemistII(10) | Act17-ServantLeader(10) | Act18-OmegaPoint(10) | Act19-Source(10) | Act20-Stoic(10) | Act21-Lover(10) | Act22-Athlete(10) | Act23-Strategist(10) | Act24-Wilding(10) | Act25-Guardian(10) | Act26-Futurist(10)
 * | Act27-Mystic(10) | Act28-InfinitePlayer(10) | Act29-RealityBender(10) | Act30-Magnet(10) | Act31-Oracle(10) | Act32-Maestro(10) | Act33-Shaman(10) | Act34-Stargazer(10)
 * | Act35-MythMaker(10) | Act36-ShapeShifter(10) | Act37-DreamWalker(10) | Act38-MagnumOpus(10)
 * | Act39-Prism(10) | Act40-Graviton(10) | Act41-Observer(10)
 * | Act42-TimeCapsule(10) | Act43-LoopBreaker(10) | Act44-RetroCausal(10)
 * | Act45-Threshold(10) | Act46-Soma(10) | Act47-Frequency(10)
 * | Act48-Tuner(10) | Act49-Broadcast(10)
 * | Act50-Schrödinger(10) | Act51-Glitch(10)
 * | Act52-Construct(10) | Act53-Biographer(10)
 * | Act54-Optician(10) | Act55-Interpreter(10)
 * | Act56-SocialPhysics(10) | Act57-Tribalist(10)
 * | Act58-Valuator(10) | Act59-Editor(10)
 * | Act60-Grandmaster(10) | Act61-Catalyst(10)
 * | Act62-Kinetic(10) | Act63-Adaptive(10)
 * | Act64-ShadowWorker(10) | Act65-Ancestor(10)
 * | Act66-Trickster(10) | Act67-Astronaut(10)
 * | Act68-Wonderer(10) | Act69-Surfer(10)
 * | Act70-Meaning(10) | Act71-Servant(10)
 * | Act72-Synthesis(10) | Act73-FutureWeaver(10)
 * | Act74-Composer(10) | Act75-Zenith(10)
 * | Act76-Multiverse(10) | Act77-Ethicist(10)
 * | Act78-Elementalist(10) | Act79-Mentat(10)
 * | Act80-Intuition(10)    | Act81-Engineer(10)
 * | Act82-AlchemistIV(10)  | Act83-Cognitive(10)
 * | Act84-Sage(10)         | Act85-Gaia(10)
 * | Act86-Mystic(10)       | Act87-Ascendant(10)
 * | Act88-GardenerII(10)   | Act89-AncestorII(10)
 * | Act90-MagnumOpus(10)  | Act91-InfinitePlayer(10)
 * | Act92-ZeroPoint(10)   | Act93-Omega(10)
 * | Act94-Ouroboros(10)
 * | Act95-Projector(10)   | Act96-Chronomancer(10)
 * | Act97-Materialist(10)
 */

// ── The 1380 Lab Specimens ──────────────────────────────────────
// Minimal mock data objects with the fields MasterRenderer needs
// to route to the correct bespoke component.
export function LabViewer({ previewMode }: LabViewerProps) {
  const [navicues, setNavicues] = useState<LabNavicue[]>([]);
  const [signatureColors, setSignatureColors] = useState<Record<string, string>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [completedSet, setCompletedSet] = useState<Set<number>>(new Set());
  const [justCompleted, setJustCompleted] = useState(false);
  const justCompletedTimerRef = useRef<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const totalNavicues = navicues.length;

  useEffect(() => {
    let cancelled = false;

    const loadLabData = async () => {
      const [{ LAB_NAVICUES }, { SIGNATURE_COLORS }] = await Promise.all([
        import('@/app/data/lab/labNavicues'),
        import('@/app/data/lab/labSignatureColors'),
      ]);

      if (!cancelled) {
        setNavicues(LAB_NAVICUES);
        setSignatureColors(SIGNATURE_COLORS);
      }
    };

    loadLabData().catch((error) => {
      console.error('Failed to load Lab data modules', error);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const navigateTo = useCallback((index: number) => {
    if (index < 0 || index >= totalNavicues) return;
    setCurrentIndex(index);
    setResetKey(prev => prev + 1);
    setJustCompleted(false);
  }, [totalNavicues]);

  const goNext = useCallback(() => {
    if (currentIndex < totalNavicues - 1) navigateTo(currentIndex + 1);
  }, [currentIndex, navigateTo, totalNavicues]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) navigateTo(currentIndex - 1);
  }, [currentIndex, navigateTo]);

  const handleResponse = useCallback(() => {
    setCompletedSet(prev => {
      const next = new Set(prev);
      next.add(currentIndex);
      return next;
    });
    setJustCompleted(true);
    if (justCompletedTimerRef.current) clearTimeout(justCompletedTimerRef.current);
    justCompletedTimerRef.current = window.setTimeout(() => setJustCompleted(false), 4000);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape' && drawerOpen) setDrawerOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, goPrev, drawerOpen]);

  // Cleanup timer
  useEffect(() => {
    return () => {
      if (justCompletedTimerRef.current) clearTimeout(justCompletedTimerRef.current);
    };
  }, []);

  const previewDimensions = previewMode === 'mobile'
    ? { width: '390px', height: '844px' }
    : { width: '1280px', height: '800px' };

  const currentNavicue = navicues[currentIndex];
  if (!currentNavicue) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: colors.neutral.gray[400] }}>
        Loading specimens…
      </div>
    );
  }

  const accentColor = signatureColors[currentNavicue._lab_signature] || colors.accent.cyan.primary;
  const currentAct = getActForIndex(currentIndex);
  const specimenInAct = currentAct ? currentIndex - currentAct.start + 1 : 0;

  return (
    <div
      style={{
        height: 'calc(100vh - 80px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Collection Drawer Overlay */}
      <AnimatePresence>
        {drawerOpen && (
          <CollectionDrawer
            navicues={navicues}
            signatureColors={signatureColors}
            currentIndex={currentIndex}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onSelect={navigateTo}
            onClose={() => setDrawerOpen(false)}
            completedSet={completedSet}
          />
        )}
      </AnimatePresence>

      {/* Navigation arrows */}
      <NavHint direction="left" onClick={goPrev} disabled={currentIndex === 0} />
      <NavHint direction="right" onClick={goNext} disabled={currentIndex === totalNavicues - 1} />

      {/* Main column: info strip + phone frame + scrubber */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px',
          maxWidth: '100%',
        }}
      >
        {/* ── Enhanced Info Strip ────────────────────────────── */}
        <motion.div
          key={`info-${currentIndex}`}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {/* Act context */}
          {currentAct && (
            <div
              style={{
                fontSize: '11px',
                fontWeight: 500,
                color: colors.neutral.gray[400],
                fontFamily: fonts.mono,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
              }}
            >
              {currentAct.label} · {currentAct.subtitle}
            </div>
          )}

          {/* Specimen title */}
          <div
            style={{
              fontSize: '20px',
              fontWeight: 500,
              color: colors.neutral.white,
              fontFamily: fonts.secondary,
              fontStyle: 'italic',
              letterSpacing: '0.02em',
            }}
          >
            {currentNavicue._lab_title}
          </div>

          {/* Taxonomy */}
          <div
            style={{
              fontSize: '12px',
              color: colors.neutral.gray[400],
              fontFamily: fonts.mono,
              letterSpacing: '0.03em',
            }}
          >
            {currentNavicue._lab_subtitle}
          </div>

          {/* Signature + position */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginTop: '2px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <div
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: accentColor,
                  boxShadow: `0 0 8px ${accentColor}`,
                }}
              />
              <div
                style={{
                  fontSize: '11px',
                  color: accentColor,
                  fontFamily: fonts.mono,
                  letterSpacing: '0.05em',
                }}
              >
                {currentNavicue._lab_signature}
              </div>
            </div>
            {currentAct && (
              <div
                style={{
                  fontSize: '10px',
                  color: colors.neutral.gray[500],
                  fontFamily: fonts.mono,
                }}
              >
                {specimenInAct} of {currentAct.count}
              </div>
            )}
          </div>
        </motion.div>

        {/* ── Phone / Desktop Frame (HERO) ───────────────────── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: previewDimensions.width,
            height: previewDimensions.height,
            maxWidth: previewMode === 'mobile' ? 'calc(100vw - 32px)' : 'calc(100vw - 72px)',
            maxHeight: previewMode === 'mobile' ? 'calc(100vh - 210px)' : 'calc(100vh - 220px)',
            position: 'relative',
            borderRadius: previewMode === 'mobile' ? '48px' : '20px',
            overflow: 'hidden',
            boxShadow: previewMode === 'mobile'
              ? `0 60px 120px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255,255,255,0.05), 0 0 80px -20px ${accentColor}`
              : `0 40px 80px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255,255,255,0.03), 0 0 60px -20px ${accentColor}`,
            backgroundColor: surfaces.solid.base,
            transition: 'box-shadow 0.8s ease',
          }}
        >
          {/* Content layer */}
          <motion.div
            key={`lab-${resetKey}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 10,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              overflowY: 'auto',
              overscrollBehavior: 'contain' as any,
              WebkitOverflowScrolling: 'touch' as any,
            }}
          >
            <NaviCueLabProvider>
              <div style={{ width: '100%', minHeight: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
                <Suspense
                  fallback={
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100%',
                        color: colors.neutral.gray[500],
                        fontFamily: fonts.mono,
                        fontSize: '11px',
                        letterSpacing: '0.06em',
                      }}
                    >
                      Loading specimen renderer...
                    </div>
                  }
                >
                  <LazyNaviCueMasterRenderer
                    navicueTypeData={currentNavicue}
                    onResponse={handleResponse}
                    previewMode={previewMode}
                  />
                </Suspense>
              </div>
            </NaviCueLabProvider>
          </motion.div>

          {/* Counter — top right */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            style={{
              position: 'absolute',
              top: previewMode === 'mobile' ? '20px' : '24px',
              right: previewMode === 'mobile' ? '20px' : '32px',
              fontSize: '10px',
              fontWeight: 500,
              color: colors.neutral.gray[500],
              fontFamily: fonts.mono,
              zIndex: 20,
              letterSpacing: '0.05em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <AnimatePresence>
              {justCompleted && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    color: accentColor,
                    fontSize: '10px',
                    fontFamily: fonts.mono,
                    letterSpacing: '0.05em',
                  }}
                >
                  arc complete
                </motion.span>
              )}
            </AnimatePresence>
            {currentIndex + 1}/{totalNavicues}
          </motion.div>
        </motion.div>

        {/* ── Act Scrubber + Controls ────────────────────────── */}
        <div
          style={{
            width: previewMode === 'mobile' ? '420px' : '100%',
            maxWidth: previewMode === 'mobile' ? '420px' : previewDimensions.width,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <ActScrubber
            currentIndex={currentIndex}
            completedSet={completedSet}
            accentColor={accentColor}
            total={totalNavicues}
            onNavigate={navigateTo}
          />

          {/* Bottom controls row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* Drawer toggle */}
            <motion.button
              onClick={() => setDrawerOpen(!drawerOpen)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'none',
                border: `1px solid ${colors.neutral.gray[100]}`,
                borderRadius: '6px',
                padding: '4px 10px',
                cursor: 'pointer',
                color: colors.neutral.gray[400],
                fontSize: '11px',
                fontFamily: fonts.mono,
                letterSpacing: '0.03em',
              }}
            >
              <LayoutList size={12} />
              Collection
            </motion.button>

            {/* Counter */}
            <div
              style={{
                fontSize: '11px',
                color: colors.neutral.gray[500],
                fontFamily: fonts.mono,
                letterSpacing: '0.05em',
              }}
            >
              {currentIndex + 1} of {totalNavicues}
            </div>

            {/* Keyboard hint */}
            <div
              style={{
                fontSize: '10px',
                color: colors.neutral.gray[300],
                fontFamily: fonts.mono,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <kbd
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${colors.neutral.gray[100]}`,
                  borderRadius: '3px',
                  padding: '1px 5px',
                  fontSize: '10px',
                  color: colors.neutral.gray[400],
                  fontFamily: fonts.mono,
                }}
              >←</kbd>
              <kbd
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: `1px solid ${colors.neutral.gray[100]}`,
                  borderRadius: '3px',
                  padding: '1px 5px',
                  fontSize: '10px',
                  color: colors.neutral.gray[400],
                  fontFamily: fonts.mono,
                }}
              >→</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Act Scrubber ──────────────────────────────────────────────────────
function ActScrubber({
  currentIndex,
  completedSet,
  accentColor,
  total,
  onNavigate,
}: {
  currentIndex: number;
  completedSet: Set<number>;
  accentColor: string;
  total: number;
  onNavigate: (index: number) => void;
}) {
  const [hoveredAct, setHoveredAct] = useState<ActGroup | null>(null);

  return (
    <div style={{ position: 'relative' }}>
      {/* Scrubber track */}
      <div
        style={{
          display: 'flex',
          height: '4px',
          borderRadius: '2px',
          overflow: 'hidden',
          gap: '1px',
          background: 'rgba(255,255,255,0.02)',
        }}
      >
        {ACT_GROUPS.map(act => {
          const width = total > 0 ? (act.count / total) * 100 : 0;
          const isCurrent = currentIndex >= act.start && currentIndex < act.start + act.count;
          let completedInAct = 0;
          for (let j = act.start; j < act.start + act.count; j++) {
            if (completedSet.has(j)) completedInAct++;
          }
          const progress = completedInAct / act.count;

          return (
            <button
              key={act.id}
              onClick={() => onNavigate(act.start)}
              onMouseEnter={() => setHoveredAct(act)}
              onMouseLeave={() => setHoveredAct(null)}
              title={`${act.label} · ${act.subtitle}`}
              style={{
                width: `${Math.max(width, 0.4)}%`,
                height: '100%',
                background: isCurrent
                  ? accentColor
                  : progress > 0
                    ? `rgba(255,255,255,${0.06 + progress * 0.18})`
                    : 'rgba(255,255,255,0.06)',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'background 0.3s ease',
              }}
            />
          );
        })}
      </div>

      {/* Hover tooltip */}
      <AnimatePresence>
        {hoveredAct && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '-28px',
              left: `${((hoveredAct.start + hoveredAct.count / 2) / total) * 100}%`,
              transform: 'translateX(-50%)',
              background: 'rgba(17, 23, 30, 0.92)',
              backdropFilter: 'blur(12px)',
              border: `1px solid ${colors.neutral.gray[100]}`,
              borderRadius: '6px',
              padding: '3px 8px',
              fontSize: '10px',
              color: colors.neutral.gray[600],
              fontFamily: fonts.mono,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 5,
            }}
          >
            {hoveredAct.label} · {hoveredAct.subtitle}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Collection Drawer ─────────────────────────────────────────────────
function CollectionDrawer({
  navicues,
  signatureColors,
  currentIndex,
  searchQuery,
  onSearchChange,
  onSelect,
  onClose,
  completedSet,
}: {
  navicues: LabNavicue[];
  signatureColors: Record<string, string>;
  currentIndex: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelect: (index: number) => void;
  onClose: () => void;
  completedSet: Set<number>;
}) {
  const listRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);

  const query = searchQuery.toLowerCase().trim();

  const filteredActs: FilteredAct[] = useMemo(() => {
    return ACT_GROUPS.map(act => {
      const indices: number[] = [];
      for (let i = act.start; i < act.start + act.count; i++) {
        const nc = navicues[i];
        if (!nc) continue;
        if (!query || nc._lab_title.toLowerCase().includes(query) || nc._lab_signature.toLowerCase().includes(query) || nc._lab_subtitle.toLowerCase().includes(query)) {
          indices.push(i);
        }
      }
      return { ...act, indices };
    }).filter(a => a.indices.length > 0);
  }, [query, navicues]);

  const { rows, itemTopByIndex, totalHeight } = useMemo(() => {
    const rowMeta: Array<{ row: DrawerRow; top: number; height: number }> = [];
    const topByIndex = new Map<number, number>();
    let top = 0;

    filteredActs.forEach(act => {
      const isCurrentAct = currentIndex >= act.start && currentIndex < act.start + act.count;
      let completedInAct = 0;
      for (let j = act.start; j < act.start + act.count; j++) {
        if (completedSet.has(j)) completedInAct++;
      }

      rowMeta.push({
        row: {
          type: 'header',
          key: `header-${act.id}`,
          act,
          isCurrentAct,
          completedInAct,
        },
        top,
        height: DRAWER_HEADER_HEIGHT,
      });
      top += DRAWER_HEADER_HEIGHT;

      act.indices.forEach((idx) => {
        const nc = navicues[idx];
        if (!nc) return;
        const isCurrent = idx === currentIndex;
        const isCompleted = completedSet.has(idx);
        const sigColor = signatureColors[nc._lab_signature] || colors.accent.cyan.primary;

        rowMeta.push({
          row: {
            type: 'item',
            key: nc.navicue_type_id,
            idx,
            nc,
            isCurrent,
            isCompleted,
            sigColor,
          },
          top,
          height: DRAWER_ITEM_HEIGHT,
        });

        topByIndex.set(idx, top);
        top += DRAWER_ITEM_HEIGHT;
      });
    });

    return { rows: rowMeta, itemTopByIndex: topByIndex, totalHeight: top };
  }, [filteredActs, currentIndex, completedSet, navicues, signatureColors]);

  const visibleRows = useMemo(() => {
    if (rows.length === 0) return [];
    const startOffset = Math.max(0, scrollTop - DRAWER_OVERSCAN_PX);
    const endOffset = scrollTop + viewportHeight + DRAWER_OVERSCAN_PX;

    let start = 0;
    while (start < rows.length && rows[start].top + rows[start].height < startOffset) {
      start++;
    }

    let end = start;
    while (end < rows.length && rows[end].top < endOffset) {
      end++;
    }

    return rows.slice(start, end);
  }, [rows, scrollTop, viewportHeight]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const measure = () => {
      setViewportHeight(el.clientHeight);
    };

    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;

    const top = itemTopByIndex.get(currentIndex);
    if (typeof top !== 'number') return;

    const targetTop = Math.max(0, top - el.clientHeight / 2 + DRAWER_ITEM_HEIGHT / 2);
    el.scrollTo({ top: targetTop, behavior: 'smooth' });
  }, [currentIndex, itemTopByIndex]);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(0,0,0,0.3)',
          zIndex: 25,
        }}
      />

      {/* Drawer panel */}
      <motion.div
        initial={{ x: -320, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -320, opacity: 0 }}
        transition={{ type: 'spring', damping: 28, stiffness: 220 }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          width: '300px',
          background: 'rgba(17, 23, 30, 0.92)',
          backdropFilter: 'blur(40px) saturate(180%)',
          borderRight: `1px solid ${colors.neutral.gray[100]}`,
          zIndex: 30,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 16px 12px',
            borderBottom: `1px solid ${colors.neutral.gray[50]}`,
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            <div
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: colors.neutral.white,
                fontFamily: fonts.primary,
              }}
            >
              Collection
            </div>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                color: colors.neutral.gray[400],
              }}
            >
              <X size={14} />
            </motion.button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search
              size={13}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: colors.neutral.gray[400],
              }}
            />
            <input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search specimens…"
              autoFocus
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.04)',
                border: `1px solid ${colors.neutral.gray[100]}`,
                borderRadius: radius.sm,
                padding: '7px 10px 7px 30px',
                color: colors.neutral.white,
                fontSize: '12px',
                fontFamily: fonts.primary,
                outline: 'none',
              }}
            />
          </div>

          <div
            style={{
              fontSize: '10px',
              color: colors.neutral.gray[400],
              fontFamily: fonts.mono,
              marginTop: '8px',
              letterSpacing: '0.03em',
            }}
          >
            {completedSet.size} explored · {navicues.length} total
          </div>
        </div>

        {/* Scrollable list */}
        <div
          ref={listRef}
          onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '4px 0',
          }}
        >
          {rows.length === 0 ? (
            <div
              style={{
                padding: '20px 16px',
                fontSize: '11px',
                color: colors.neutral.gray[400],
                fontFamily: fonts.mono,
                letterSpacing: '0.04em',
              }}
            >
              No specimens match that search.
            </div>
          ) : (
            <div style={{ position: 'relative', height: `${totalHeight}px` }}>
              {visibleRows.map(({ row, top }) => {
                if (row.type === 'header') {
                  return (
                    <div
                      key={row.key}
                      style={{
                        position: 'absolute',
                        top,
                        left: 0,
                        right: 0,
                        padding: '8px 16px 4px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div
                        style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          color: row.isCurrentAct ? colors.neutral.gray[700] : colors.neutral.gray[400],
                          fontFamily: fonts.mono,
                          letterSpacing: '0.06em',
                          textTransform: 'uppercase',
                        }}
                      >
                        {row.act.label}
                        <span style={{ fontWeight: 400, opacity: 0.6, marginLeft: '6px' }}>
                          {row.act.subtitle}
                        </span>
                      </div>
                      <div
                        style={{
                          fontSize: '9px',
                          color: colors.neutral.gray[300],
                          fontFamily: fonts.mono,
                        }}
                      >
                        {row.completedInAct}/{row.act.count}
                      </div>
                    </div>
                  );
                }

                return (
                  <button
                    key={row.key}
                    onClick={() => onSelect(row.idx)}
                    style={{
                      position: 'absolute',
                      top,
                      left: 0,
                      right: 0,
                      height: `${DRAWER_ITEM_HEIGHT}px`,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '5px 16px 5px 24px',
                      background: row.isCurrent ? 'rgba(255,255,255,0.05)' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left' as const,
                      transition: 'background 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (!row.isCurrent) {
                        (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!row.isCurrent) {
                        (e.currentTarget as HTMLElement).style.background = 'transparent';
                      }
                    }}
                  >
                    <div
                      style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        background: row.isCurrent
                          ? row.sigColor
                          : row.isCompleted
                            ? row.sigColor.replace(/[\d.]+\)$/, '0.4)')
                            : 'rgba(255,255,255,0.15)',
                        flexShrink: 0,
                        boxShadow: row.isCurrent ? `0 0 6px ${row.sigColor}` : 'none',
                      }}
                    />
                    <div
                      style={{
                        fontSize: '12px',
                        color: row.isCurrent ? colors.neutral.white : colors.neutral.gray[500],
                        fontFamily: fonts.primary,
                        fontWeight: row.isCurrent ? 500 : 400,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {row.nc._lab_title}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}

// ── Navigation arrow ──────────────────────────────────────────────────
function NavHint({
  direction,
  onClick,
  disabled,
}: {
  direction: 'left' | 'right';
  onClick: () => void;
  disabled: boolean;
}) {
  if (disabled) return null;
  const Icon = direction === 'left' ? ChevronLeft : ChevronRight;

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05, opacity: 1 }}
      whileTap={{ scale: 0.95 }}
      style={{
        position: 'absolute',
        [direction]: '24px',
        top: '50%',
        transform: 'translateY(-50%)',
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${colors.neutral.gray[50]}`,
        borderRadius: '50%',
        width: '44px',
        height: '44px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        opacity: 0.3,
        transition: 'all 0.3s ease',
        zIndex: 10,
      }}
    >
      <Icon size={20} style={{ color: colors.neutral.white }} />
    </motion.button>
  );
}
