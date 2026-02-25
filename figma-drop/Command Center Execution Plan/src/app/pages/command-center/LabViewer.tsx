import { motion, AnimatePresence } from 'motion/react';
import { colors, surfaces, fonts, radius } from '@/design-tokens';
import { ChevronLeft, ChevronRight, Search, X, LayoutList } from 'lucide-react';
import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { NaviCueMasterRenderer } from '@/app/components/navicue/NaviCueMasterRenderer';
import { ACT_GROUPS, getActForIndex, type ActGroup } from '@/app/data/lab-act-groups';
import { NaviCueLabProvider } from '@/app/components/navicue/NaviCueLabContext';
import { LAB_NAVICUES, type LabNavicue } from '@/app/data/lab/labNavicues';
import { SIGNATURE_COLORS } from '@/app/data/lab/labSignatureColors';
interface LabViewerProps {
  previewMode: 'mobile' | 'desktop';
}

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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  const [completedSet, setCompletedSet] = useState<Set<number>>(new Set());
  const [justCompleted, setJustCompleted] = useState(false);
  const justCompletedTimerRef = useRef<number | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigateTo = useCallback((index: number) => {
    setCurrentIndex(index);
    setResetKey(prev => prev + 1);
    setJustCompleted(false);
  }, []);

  const goNext = useCallback(() => {
    if (currentIndex < LAB_NAVICUES.length - 1) navigateTo(currentIndex + 1);
  }, [currentIndex, navigateTo]);

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
    : { width: '1440px', height: '900px' };

  const currentNavicue = LAB_NAVICUES[currentIndex];
  if (!currentNavicue) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: colors.neutral.gray[400] }}>
        Loading specimens\u2026
      </div>
    );
  }

  const accentColor = SIGNATURE_COLORS[currentNavicue._lab_signature] || colors.accent.cyan.primary;
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
            navicues={LAB_NAVICUES}
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
      <NavHint direction="right" onClick={goNext} disabled={currentIndex === LAB_NAVICUES.length - 1} />

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
        {/* \u2500\u2500 Enhanced Info Strip \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
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
              {currentAct.label} \u00b7 {currentAct.subtitle}
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

        {/* \u2500\u2500 Phone / Desktop Frame (HERO) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          style={{
            width: previewDimensions.width,
            height: previewDimensions.height,
            maxWidth: 'calc(100vw - 120px)',
            maxHeight: 'calc(100vh - 300px)',
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
              overflowY: 'auto',
              overscrollBehavior: 'contain' as any,
              WebkitOverflowScrolling: 'touch' as any,
            }}
          >
            <NaviCueLabProvider>
              <div style={{ width: '100%', minHeight: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', flex: 1 }}>
                <NaviCueMasterRenderer
                  navicueTypeData={currentNavicue}
                  onResponse={handleResponse}
                  previewMode={previewMode}
                />
              </div>
            </NaviCueLabProvider>
          </motion.div>

          {/* Counter \u2014 top right */}
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
            {currentIndex + 1}/{LAB_NAVICUES.length}
          </motion.div>
        </motion.div>

        {/* \u2500\u2500 Act Scrubber + Controls \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500 */}
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
              {currentIndex + 1} of {LAB_NAVICUES.length}
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
              >\u2190</kbd>
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
              >\u2192</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// \u2500\u2500 Act Scrubber \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function ActScrubber({
  currentIndex,
  completedSet,
  accentColor,
  onNavigate,
}: {
  currentIndex: number;
  completedSet: Set<number>;
  accentColor: string;
  onNavigate: (index: number) => void;
}) {
  const [hoveredAct, setHoveredAct] = useState<ActGroup | null>(null);
  const total = LAB_NAVICUES.length;

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
          const width = (act.count / total) * 100;
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
              title={`${act.label} \u00b7 ${act.subtitle}`}
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
            {hoveredAct.label} \u00b7 {hoveredAct.subtitle}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// \u2500\u2500 Collection Drawer \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
function CollectionDrawer({
  navicues,
  currentIndex,
  searchQuery,
  onSearchChange,
  onSelect,
  onClose,
  completedSet,
}: {
  navicues: LabNavicue[];
  currentIndex: number;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelect: (index: number) => void;
  onClose: () => void;
  completedSet: Set<number>;
}) {
  const currentItemRef = useRef<HTMLButtonElement>(null);

  // Auto-scroll to current on open
  useEffect(() => {
    const t = setTimeout(() => {
      if (currentItemRef.current) {
        currentItemRef.current.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    }, 300);
    return () => clearTimeout(t);
  }, [currentIndex]);

  const query = searchQuery.toLowerCase().trim();

  const filteredActs = useMemo(() => {
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
              placeholder="Search specimens\u2026"
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
            {completedSet.size} explored \u00b7 {navicues.length} total
          </div>
        </div>

        {/* Scrollable list */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '4px 0',
          }}
        >
          {filteredActs.map(act => {
            const isCurrentAct = currentIndex >= act.start && currentIndex < act.start + act.count;
            let completedInAct = 0;
            for (let j = act.start; j < act.start + act.count; j++) {
              if (completedSet.has(j)) completedInAct++;
            }

            return (
              <div key={act.id}>
                {/* Act header */}
                <div
                  style={{
                    padding: '10px 16px 4px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: '10px',
                      fontWeight: 600,
                      color: isCurrentAct ? colors.neutral.gray[700] : colors.neutral.gray[400],
                      fontFamily: fonts.mono,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {act.label}
                    <span style={{ fontWeight: 400, opacity: 0.6, marginLeft: '6px' }}>
                      {act.subtitle}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '9px',
                      color: colors.neutral.gray[300],
                      fontFamily: fonts.mono,
                    }}
                  >
                    {completedInAct}/{act.count}
                  </div>
                </div>

                {/* Specimens */}
                {act.indices.map(idx => {
                  const nc = navicues[idx];
                  if (!nc) return null;
                  const isCurrent = idx === currentIndex;
                  const isCompleted = completedSet.has(idx);
                  const sigColor = SIGNATURE_COLORS[nc._lab_signature] || colors.accent.cyan.primary;

                  return (
                    <button
                      key={nc.navicue_type_id}
                      ref={isCurrent ? currentItemRef : undefined}
                      onClick={() => onSelect(idx)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '5px 16px 5px 24px',
                        background: isCurrent ? 'rgba(255,255,255,0.05)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left' as const,
                        transition: 'background 0.15s ease',
                      }}
                      onMouseEnter={(e) => { if (!isCurrent) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)'; }}
                      onMouseLeave={(e) => { if (!isCurrent) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <div
                        style={{
                          width: '5px',
                          height: '5px',
                          borderRadius: '50%',
                          background: isCurrent
                            ? sigColor
                            : isCompleted
                              ? sigColor.replace(/[\d.]+\)$/, '0.4)')
                              : 'rgba(255,255,255,0.15)',
                          flexShrink: 0,
                          boxShadow: isCurrent ? `0 0 6px ${sigColor}` : 'none',
                        }}
                      />
                      <div
                        style={{
                          fontSize: '12px',
                          color: isCurrent ? colors.neutral.white : colors.neutral.gray[500],
                          fontFamily: fonts.primary,
                          fontWeight: isCurrent ? 500 : 400,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {nc._lab_title}
                      </div>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </div>
      </motion.div>
    </>
  );
}

// \u2500\u2500 Navigation arrow \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
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
