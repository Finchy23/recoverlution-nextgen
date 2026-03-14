/**
 * ∞MAP SURFACE — The Constellation
 *
 * The sentient reading of the cognitive universe.
 * Mindblocks rendered as luminous nodes in space,
 * connected by threads of association.
 *
 * K.B.E. scoring colors each node:
 *   Red   → Raw friction (low integration, early Knowing)
 *   Amber → Processing (mid Believing, tension still held)
 *   Green → Integrated reflex (Embodying, the schema dissolves)
 *
 * The ∞ symbol precedes the constellation —
 * the proprietary mind-body glyph that says:
 * "The mind and body are one system."
 *
 * Canvas 2D with faux-3D parallax on pan/tilt.
 * Each mindblock cluster orbits its chapter pillar.
 *
 * Death of the Box: No list. No grid. No hierarchy.
 * The universe is a field. You navigate it spatially.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import type { SurfaceMode } from '../universal-player/surface-modes';
import { useSurfaceArrival, SURFACE_EASE, SURFACE_DURATION } from './useSurfaceArrival';
import { CHAPTERS } from './know-taxonomy';
import { SEEK_INSIGHTS } from '../seek/seek-insights';
import { FORM_PRACTICES } from '../form/form-practices';
import { readAllKBEProfiles } from '../runtime/useSeekTelemetry';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { useIndividualId } from '../runtime/session-seam';
import { useResilience } from '../runtime/resilience-seam';
import { ResilienceWhisper } from './ResilienceWhisper';
import { room, font, layout, tracking, typeSize, leading, weight, opacity, timing, radii, void_, layer, signal } from '../design-system/surface-tokens';

const SERIF = font.serif;
const SANS = font.sans;
const ORB_CLEARANCE = layout.orbClearance;

// ─── Mindblock Node ───

interface MindblockNode {
  id: string;
  label: string;
  schema: string;
  chapterWord: string;
  color: string;
  /** K.B.E. composite: 0 = raw friction, 1 = fully integrated */
  integration: number;
  /** Target position in the constellation field (0-1 normalised) */
  x: number;
  y: number;
  /** Current render position — lerps toward x,y */
  renderX: number;
  renderY: number;
  /** Previous integration level for migration trail */
  prevIntegration: number;
  /** Previous render position — origin of migration trail */
  prevX: number;
  prevY: number;
  /** Migration trail opacity (1.0 = fresh, fades to 0) */
  trailOpacity: number;
  /** Depth layer for parallax (0 = near, 1 = far) */
  depth: number;
  /** Number of SEEK sessions touching this node */
  sessions: number;
  /** Timestamp of last KBE update (for "recently changed" pulse) */
  lastUpdated: number;
}

// ─── Migration lerp constants ───
const MIGRATION_LERP = 0.015;       // how fast nodes drift to target (per frame)
const INTEGRATION_DRIFT = 0.06;     // integrated nodes drift inward by this much
const TRAIL_FADE_RATE = 0.003;      // trail opacity fades per frame

// ─── Build constellation from insights + KBE data ───

function buildConstellation(
  kbeData: Map<string, { knowing: number; believing: number; sessions: number }>,
): MindblockNode[] {
  const nodes: MindblockNode[] = [];
  const goldenAngle = 137.5 * Math.PI / 180;

  SEEK_INSIGHTS.forEach((insight, idx) => {
    const chapter = CHAPTERS.find(c => {
      // Map insight schemas to chapters
      if (insight.id === 'inner-critic') return c.word === 'SELF';
      if (insight.id === 'enmeshment') return c.word === 'EDGE';
      return false;
    }) || CHAPTERS[idx % CHAPTERS.length];

    const kbe = kbeData.get(insight.id);
    const knowing = kbe?.knowing || 0;
    const believing = kbe?.believing || 0;
    const sessions = kbe?.sessions || 0;

    // Integration = weighted average of K.B.E.
    const integration = knowing * 0.3 + believing * 0.5 + Math.min(sessions / 10, 1) * 0.2;

    // Position: golden-angle spiral with chapter clustering
    const chapterIdx = CHAPTERS.findIndex(c => c.word === chapter.word);
    const angle = idx * goldenAngle + chapterIdx * 0.8;
    const radius = 0.15 + idx * 0.06;

    nodes.push({
      id: insight.id,
      label: insight.title,
      schema: insight.schema,
      chapterWord: chapter.word,
      color: insight.color,
      integration,
      x: 0.5 + Math.cos(angle) * Math.min(radius, 0.35),
      y: 0.5 + Math.sin(angle) * Math.min(radius, 0.35),
      // Start render position at the outer periphery (pre-drift position)
      // so the migration animation is visible on first load
      renderX: 0.5 + Math.cos(angle) * Math.min(radius + 0.03, 0.38),
      renderY: 0.5 + Math.sin(angle) * Math.min(radius + 0.03, 0.38),
      prevIntegration: Math.max(0, integration - 0.15), // Simulate previous state
      prevX: 0.5 + Math.cos(angle) * Math.min(radius + 0.05, 0.40),
      prevY: 0.5 + Math.sin(angle) * Math.min(radius + 0.05, 0.40),
      trailOpacity: integration > 0.1 ? 0.6 : 0, // Show trail for nodes with KBE data
      depth: 0.3 + (idx % 3) * 0.3,
      sessions,
      lastUpdated: Date.now(),
    });
  });

  // Add chapter anchor nodes
  CHAPTERS.forEach((chapter, idx) => {
    const angle = (idx / CHAPTERS.length) * Math.PI * 2 - Math.PI / 2;
    const radius = 0.38;
    nodes.push({
      id: `chapter-${chapter.word}`,
      label: chapter.word,
      schema: chapter.whisper,
      chapterWord: chapter.word,
      color: chapter.color,
      integration: -1, // Special marker for chapter nodes
      x: 0.5 + Math.cos(angle) * radius,
      y: 0.5 + Math.sin(angle) * radius,
      renderX: 0.5 + Math.cos(angle) * radius,
      renderY: 0.5 + Math.sin(angle) * radius,
      prevIntegration: -1,
      prevX: 0.5 + Math.cos(angle) * radius,
      prevY: 0.5 + Math.sin(angle) * radius,
      trailOpacity: 0,
      depth: 0.1,
      sessions: 0,
      lastUpdated: Date.now(),
    });
  });

  return nodes;
}

// ─── Integration color mapping ───

function integrationColor(integration: number, baseColor: string): string {
  if (integration < 0) return baseColor; // Chapter nodes use their own color
  if (integration < 0.25) return signal.friction; // Red — raw friction
  if (integration < 0.5) return signal.energy;  // Amber — processing
  if (integration < 0.75) return signal.warm; // Warm — mid-integration
  return signal.anchor; // Green — integrated
}

// ─── Canvas renderer ───

function drawMapCanvas(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  nodes: MindblockNode[],
  breath: number,
  panOffset: { x: number; y: number },
  selectedId: string | null,
) {
  ctx.clearRect(0, 0, width, height);

  // Apply pan offset
  const ox = panOffset.x;
  const oy = panOffset.y;

  // Draw threads between chapter nodes and their mindblocks
  const chapterNodes = nodes.filter(n => n.integration === -1);
  const mindblockNodes = nodes.filter(n => n.integration >= 0);

  // Breath-driven depth field — near nodes respond more
  const breathWave = Math.sin(breath * Math.PI * 2);
  const breathSlow = Math.sin(breath * Math.PI * 0.5);

  // Threads — luminous connections pulse with breath
  mindblockNodes.forEach(node => {
    const chapterNode = chapterNodes.find(cn => cn.chapterWord === node.chapterWord);
    if (!chapterNode) return;

    const parallax = 1 + (1 - node.depth) * 0.1 + breathWave * 0.01 * (1 - node.depth);
    const x1 = (node.renderX + ox) * width * parallax;
    const y1 = (node.renderY + oy) * height * parallax;
    const x2 = (chapterNode.x + ox) * width;
    const y2 = (chapterNode.y + oy) * height;

    // Thread intensity scales with integration — integrated pathways glow brighter
    const threadAlpha = node.integration > 0.5 ? 0.05 : 0.025;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    // Curved thread for organic feel
    const mx = (x1 + x2) / 2 + breathSlow * 3 * (1 - node.depth);
    const my = (y1 + y2) / 2 + breathWave * 2;
    ctx.quadraticCurveTo(mx, my, x2, y2);
    ctx.strokeStyle = node.color + Math.round(threadAlpha * 255).toString(16).padStart(2, '0');
    ctx.lineWidth = 0.5 + node.integration * 0.3;
    ctx.stroke();
  });

  // Inter-mindblock threads (connect nodes in same chapter)
  for (let i = 0; i < mindblockNodes.length; i++) {
    for (let j = i + 1; j < mindblockNodes.length; j++) {
      if (mindblockNodes[i].chapterWord !== mindblockNodes[j].chapterWord) continue;
      const a = mindblockNodes[i];
      const b = mindblockNodes[j];
      const pa = 1 + (1 - a.depth) * 0.1;
      const pb = 1 + (1 - b.depth) * 0.1;

      ctx.beginPath();
      ctx.moveTo((a.x + ox) * width * pa, (a.y + oy) * height * pa);
      ctx.lineTo((b.x + ox) * width * pb, (b.y + oy) * height * pb);
      ctx.strokeStyle = a.color + '04';
      ctx.lineWidth = 0.3;
      ctx.stroke();
    }
  }

  // Draw chapter anchor nodes
  chapterNodes.forEach(node => {
    const x = (node.x + ox) * width;
    const y = (node.y + oy) * height;
    const breathPhase = Math.sin(breath * Math.PI * 2 + node.x * 10);

    // Glow
    const glow = ctx.createRadialGradient(x, y, 0, x, y, 30);
    glow.addColorStop(0, node.color + '06');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();

    // Dot
    ctx.beginPath();
    ctx.arc(x, y, 2 + breathPhase * 0.3, 0, Math.PI * 2);
    ctx.fillStyle = node.color + '15';
    ctx.fill();

    // Label
    ctx.font = `500 5px ${SANS}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = node.color + '18';
    ctx.fillText(node.label, x, y + 12);
  });

  // Draw mindblock nodes
  mindblockNodes.forEach(node => {
    const parallax = 1 + (1 - node.depth) * 0.1;
    const x = (node.renderX + ox) * width * parallax;
    const y = (node.renderY + oy) * height * parallax;
    const breathPhase = Math.sin(breath * Math.PI * 2 + node.depth * 5);
    const isSelected = selectedId === node.id;

    const intColor = integrationColor(node.integration, node.color);
    const nodeRadius = 4 + node.sessions * 2 + node.integration * 6;
    const scaledRadius = nodeRadius * (0.8 + node.depth * 0.4);

    // Outer glow
    const glow = ctx.createRadialGradient(x, y, 0, x, y, scaledRadius * 4);
    glow.addColorStop(0, intColor + (isSelected ? '12' : '06'));
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(x, y, scaledRadius * 4, 0, Math.PI * 2);
    ctx.fill();

    // Node body
    ctx.beginPath();
    ctx.arc(x, y, scaledRadius + breathPhase * 0.5, 0, Math.PI * 2);
    const nodeGrad = ctx.createRadialGradient(x, y, 0, x, y, scaledRadius);
    nodeGrad.addColorStop(0, intColor + (isSelected ? '30' : '15'));
    nodeGrad.addColorStop(1, intColor + '05');
    ctx.fillStyle = nodeGrad;
    ctx.fill();

    // Edge
    ctx.strokeStyle = intColor + (isSelected ? '25' : '0A');
    ctx.lineWidth = 0.5;
    ctx.stroke();

    // Center pip
    ctx.beginPath();
    ctx.arc(x, y, 1, 0, Math.PI * 2);
    ctx.fillStyle = intColor + '30';
    ctx.fill();

    // Migration trail
    if (node.trailOpacity > 0) {
      const trailX = (node.prevX + ox) * width * parallax;
      const trailY = (node.prevY + oy) * height * parallax;
      ctx.beginPath();
      ctx.moveTo(trailX, trailY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = intColor + Math.round(node.trailOpacity * 255).toString(16).padStart(2, '0');
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }
  });
}

interface MapSurfaceProps {
  mode: SurfaceMode;
  breath: number;
  onResolve?: () => void;
  /** Navigate to another surface mode (SEEK or FORM) */
  onNavigate?: (modeId: string) => void;
}

export function MapSurface({ mode, breath, onNavigate }: MapSurfaceProps) {
  const userId = useIndividualId();
  const resilience = useResilience();
  const [nodes, setNodes] = useState<MindblockNode[]>([]);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [selectedNode, setSelectedNode] = useState<MindblockNode | null>(null);
  const [viewport, setViewport] = useState({ width: 375, height: 667 });
  const [loaded, setLoaded] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const panBaseRef = useRef({ x: 0, y: 0 });
  const nodesRef = useRef<MindblockNode[]>([]);
  const { arrived, delay } = useSurfaceArrival(mode);

  // Viewport tracking
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

  // Load KBE data and build constellation
  useEffect(() => {
    if (loaded) return;

    const MAP_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-99d14421`;
    const mapHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${publicAnonKey}`,
    };

    Promise.all([
      readAllKBEProfiles(userId),
      fetch(`${MAP_BASE}/map/user-insights/${userId}`, { headers: mapHeaders })
        .then(r => r.ok ? r.json() : { insights: [] })
        .catch(() => ({ insights: [] })),
    ]).then(([profiles, userInsightsData]) => {
      const kbeMap = new Map<string, { knowing: number; believing: number; sessions: number }>();

      // Parse profiles (they come as raw KBE trajectory objects)
      if (Array.isArray(profiles)) {
        profiles.forEach((p: any) => {
          if (p?.value?.sessions) {
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
      }

      // Build base constellation from SEEK_INSIGHTS
      const baseNodes = buildConstellation(kbeMap);

      // Merge user-generated insights from TALK deep mining
      const userInsights = (userInsightsData.insights || []) as any[];
      const goldenAngle = 137.5 * Math.PI / 180;

      userInsights.forEach((ui: any, idx: number) => {
        const insight = ui.value || ui;
        if (!insight?.id) return;

        // Skip if already in constellation (shouldn't happen, but safety)
        if (baseNodes.find(n => n.id === insight.id)) return;

        const kbe = kbeMap.get(insight.id);
        const knowing = kbe?.knowing || insight.intensity * 0.3 || 0;
        const believing = kbe?.believing || 0;
        const sessions = kbe?.sessions || 1;
        const integration = knowing * 0.3 + believing * 0.5 + Math.min(sessions / 10, 1) * 0.2;

        // Position user-generated nodes in a secondary ring
        const baseAngle = (SEEK_INSIGHTS.length + idx) * goldenAngle;
        const radius = 0.22 + idx * 0.05;

        // Map lane to chapter
        const laneChapterMap: Record<string, string> = {
          pattern: 'LOOP', origin: 'ROOT', relationship: 'EDGE',
          body: 'SOMA', fear: 'FEAR', desire: 'SELF',
        };
        const chapterWord = laneChapterMap[insight.lane] || CHAPTERS[idx % CHAPTERS.length]?.word || 'SELF';

        baseNodes.push({
          id: insight.id,
          label: insight.title || insight.name,
          schema: insight.schema || insight.description || '',
          chapterWord,
          color: insight.color || signal.insight,
          integration,
          x: 0.5 + Math.cos(baseAngle) * Math.min(radius, 0.32),
          y: 0.5 + Math.sin(baseAngle) * Math.min(radius, 0.32),
          renderX: 0.5 + Math.cos(baseAngle) * Math.min(radius + 0.04, 0.36),
          renderY: 0.5 + Math.sin(baseAngle) * Math.min(radius + 0.04, 0.36),
          prevIntegration: 0,
          prevX: 0.5 + Math.cos(baseAngle) * Math.min(radius + 0.06, 0.40),
          prevY: 0.5 + Math.sin(baseAngle) * Math.min(radius + 0.06, 0.40),
          trailOpacity: 0.8, // User-generated nodes always show fresh trails
          depth: 0.4 + (idx % 2) * 0.3,
          sessions,
          lastUpdated: insight.createdAt || Date.now(),
        });

        console.log(`[∞MAP] Merged user-generated insight: ${insight.title || insight.name}`);
      });

      setNodes(baseNodes);
      setLoaded(true);
    }).catch(() => {
      setNodes(buildConstellation(new Map()));
      setLoaded(true);
    });
  }, [loaded, userId]);

  // Sync nodesRef when nodes state changes
  useEffect(() => {
    nodesRef.current = nodes.map(n => ({ ...n }));
  }, [nodes]);

  // Canvas rendering + migration lerp (breath drives ~60fps re-renders)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || nodes.length === 0) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = viewport.width * dpr;
    canvas.height = viewport.height * dpr;
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.scale(dpr, dpr);

    // Apply migration lerp to render positions (mutate ref, not state)
    nodesRef.current.forEach(node => {
      if (node.integration < 0) return; // Skip chapter nodes

      // Target position — with integration-based inward drift
      const driftMagnitude = node.integration >= 0.5 ? INTEGRATION_DRIFT * node.integration : 0;
      const dirX = node.x - 0.5;
      const dirY = node.y - 0.5;
      const targetX = node.x - dirX * driftMagnitude;
      const targetY = node.y - dirY * driftMagnitude;

      // Smooth lerp toward target
      node.renderX += (targetX - node.renderX) * MIGRATION_LERP;
      node.renderY += (targetY - node.renderY) * MIGRATION_LERP;

      // Update migration trail
      if (node.prevIntegration !== node.integration || node.prevX !== node.x || node.prevY !== node.y) {
        node.prevIntegration = node.integration;
        node.prevX = node.x;
        node.prevY = node.y;
        node.trailOpacity = 1.0;
      } else {
        node.trailOpacity -= TRAIL_FADE_RATE;
      }
    });

    drawMapCanvas(ctx, viewport.width, viewport.height, nodesRef.current, breath, panOffset, selectedNode?.id || null);
  }, [viewport, nodes, breath, panOffset, selectedNode]);

  // Pan handlers
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    panStartRef.current = { x: e.clientX, y: e.clientY };
    panBaseRef.current = { ...panOffset };
  }, [panOffset]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!panStartRef.current) return;

    const dx = (e.clientX - panStartRef.current.x) / viewport.width * 0.5;
    const dy = (e.clientY - panStartRef.current.y) / viewport.height * 0.5;

    setPanOffset({
      x: Math.max(-0.3, Math.min(0.3, panBaseRef.current.x + dx)),
      y: Math.max(-0.3, Math.min(0.3, panBaseRef.current.y + dy)),
    });
  }, [viewport]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    // Check for tap (minimal movement)
    if (panStartRef.current) {
      const dx = Math.abs(e.clientX - panStartRef.current.x);
      const dy = Math.abs(e.clientY - panStartRef.current.y);

      if (dx < 10 && dy < 10) {
        // Tap — find nearest node
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const x = (e.clientX - rect.left) / viewport.width;
          const y = (e.clientY - rect.top) / viewport.height;

          const mindblockNodes = nodes.filter(n => n.integration >= 0);
          let nearest: MindblockNode | null = null;
          let nearestDist = Infinity;

          mindblockNodes.forEach(node => {
            const parallax = 1 + (1 - node.depth) * 0.1;
            const nx = (node.x + panOffset.x) * parallax;
            const ny = (node.y + panOffset.y) * parallax;
            const dist = Math.sqrt((x - nx) ** 2 + (y - ny) ** 2);
            if (dist < nearestDist && dist < 0.08) {
              nearestDist = dist;
              nearest = node;
            }
          });

          setSelectedNode(prev => prev?.id === nearest?.id ? null : nearest);
        }
      }
    }
    panStartRef.current = null;
  }, [nodes, viewport, panOffset]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 overflow-hidden select-none"
      style={{ touchAction: 'none', cursor: 'default' }}
    >
      {/* Dark glass */}
      <div className="absolute inset-0" style={{ background: room.void }} />

      {/* Field glow */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 55% 50% at ${50 + panOffset.x * 30}% ${50 + panOffset.y * 30}%, ${mode.color}02 0%, transparent 70%)`,
          transition: timing.t.bgModerate,
        }}
      />

      {/* Constellation canvas */}
      <AnimatePresence>
        {arrived && loaded && (
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: delay('atmosphere'), ease: SURFACE_EASE as any }}
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={() => { panStartRef.current = null; }}
              style={{ touchAction: 'none' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ∞ Glyph header */}
      <AnimatePresence>
        {arrived && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              top: '5%',
              left: 0,
              right: 0,
              textAlign: 'center',
              zIndex: layer.raised,
            }}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: SURFACE_DURATION, delay: delay('eyebrow'), ease: SURFACE_EASE as any }}
          >
            <span style={{
              fontFamily: SERIF,
              fontSize: typeSize.pull,
              fontWeight: weight.light,
              color: mode.color,
              opacity: opacity.trace,
            }}>
              ∞
            </span>
            <br />
            <span style={{
              fontFamily: SANS,
              fontSize: typeSize.micro,
              fontWeight: weight.medium,
              letterSpacing: tracking.wide,
              textTransform: 'uppercase',
              color: mode.color,
              opacity: opacity.murmur,
            }}>
              MAP
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected node detail */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            className="absolute pointer-events-none"
            style={{
              bottom: ORB_CLEARANCE + 30,
              left: '8%',
              right: '8%',
              textAlign: 'center',
              zIndex: layer.raised,
            }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.6, ease: SURFACE_EASE as any }}
          >
            {/* Integration indicator */}
            <div className="flex justify-center gap-3 mb-3">
              {['K', 'B', 'E'].map((letter, i) => {
                const val = i === 0 ? selectedNode.integration * 1.2
                  : i === 1 ? selectedNode.integration
                  : selectedNode.integration * 0.8;
                return (
                  <div key={letter} className="flex flex-col items-center">
                    <div
                      style={{
                        width: 2,
                        height: 16,
                        background: `linear-gradient(to top, ${integrationColor(Math.min(1, val), selectedNode.color)}${Math.round(Math.min(1, val) * 30 + 5).toString(16).padStart(2, '0')}, transparent)`,
                        borderRadius: radii.dot,
                      }}
                    />
                    <span style={{
                      fontFamily: SANS,
                      fontSize: typeSize.trace,
                      fontWeight: weight.medium,
                      letterSpacing: tracking.snug,
                      color: integrationColor(Math.min(1, val), selectedNode.color),
                      opacity: opacity.spoken,
                      marginTop: 3,
                    }}>
                      {letter}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Schema name */}
            <p style={{
              fontFamily: SERIF,
              fontSize: 'clamp(13px, 3.2vw, 17px)',
              fontWeight: weight.light,
              fontStyle: 'italic',
              color: room.fg,
              opacity: opacity.spoken,
              lineHeight: leading.body,
              margin: 0,
            }}>
              {selectedNode.label}
            </p>

            {/* Chapter tag */}
            <span style={{
              fontFamily: SANS,
              fontSize: typeSize.whisper,
              fontWeight: weight.medium,
              letterSpacing: tracking.normal,
              color: selectedNode.color,
              opacity: opacity.quiet,
            }}>
              {selectedNode.chapterWord} · {selectedNode.sessions} {selectedNode.sessions === 1 ? 'SESSION' : 'SESSIONS'}
            </span>

            {/* ── Bridge Nudge — FORM or SEEK suggestion ── */}
            {(() => {
              // Find matching insight
              const insight = SEEK_INSIGHTS.find(s => s.id === selectedNode.id);
              // Find matching practice (by schema or atomId)
              const practice = FORM_PRACTICES.find(p =>
                p.atomId === insight?.atomId ||
                p.schema?.toLowerCase().includes(selectedNode.schema.toLowerCase().slice(0, 10))
              );

              if (selectedNode.integration < 0.3) {
                // Low integration → nudge toward SEEK to understand
                return (
                  <div
                    className="mt-2 pointer-events-auto cursor-pointer"
                    style={{ opacity: opacity.trace }}
                    onClick={() => {
                      if (onNavigate) {
                        console.log(`[∞MAP→SEEK] Navigating to insight: ${selectedNode.id}`);
                        onNavigate('seek');
                      }
                    }}
                  >
                    <span style={{
                      fontFamily: SERIF,
                      fontSize: typeSize.label,
                      fontWeight: weight.light,
                      fontStyle: 'italic',
                      color: signal.friction,
                      display: 'block',
                      marginBottom: 2,
                    }}>
                      This ghost lives in friction.
                    </span>
                    <span style={{
                      fontFamily: SANS,
                      fontSize: typeSize.trace,
                      fontWeight: weight.medium,
                      letterSpacing: tracking.normal,
                      color: room.fg,
                    }}>
                      SEEK → {selectedNode.label.toUpperCase()}
                    </span>
                  </div>
                );
              } else if (selectedNode.integration < 0.7 && practice) {
                // Mid integration → nudge toward FORM to embody
                return (
                  <div
                    className="mt-2 pointer-events-auto cursor-pointer"
                    style={{ opacity: opacity.trace }}
                    onClick={() => {
                      if (onNavigate) {
                        console.log(`[∞MAP→FORM] Navigating to practice: ${practice.name}`);
                        onNavigate('form');
                      }
                    }}
                  >
                    <span style={{
                      fontFamily: SERIF,
                      fontSize: typeSize.label,
                      fontWeight: weight.light,
                      fontStyle: 'italic',
                      color: signal.energy,
                      display: 'block',
                      marginBottom: 2,
                    }}>
                      The knowing needs the body now.
                    </span>
                    <span style={{
                      fontFamily: SANS,
                      fontSize: typeSize.trace,
                      fontWeight: weight.medium,
                      letterSpacing: tracking.normal,
                      color: room.fg,
                    }}>
                      FORM → {practice.name.toUpperCase()}
                    </span>
                  </div>
                );
              } else if (selectedNode.integration >= 0.7) {
                // High integration → acknowledgment
                return (
                  <div className="mt-2" style={{ opacity: opacity.ghost }}>
                    <span style={{
                      fontFamily: SERIF,
                      fontSize: typeSize.label,
                      fontWeight: weight.light,
                      fontStyle: 'italic',
                      color: signal.anchor,
                    }}>
                      This pathway is integrating.
                    </span>
                  </div>
                );
              }
              return null;
            })()}

            {/* ── TALK deep-dive nudge — always available ── */}
            <div
              className="mt-3 pointer-events-auto cursor-pointer"
              style={{ opacity: opacity.ghost }}
              onClick={() => {
                if (onNavigate) {
                  // Store talk seed in KV for TalkSurface to pick up
                  const MAP_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-99d14421`;
                  fetch(`${MAP_BASE_URL}/map/talk-seed`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${publicAnonKey}`,
                    },
                    body: JSON.stringify({
                      userId,
                      nodeId: selectedNode.id,
                      schema: selectedNode.schema,
                      label: selectedNode.label,
                      integration: selectedNode.integration,
                      timestamp: Date.now(),
                    }),
                  }).catch(err => console.error('[∞MAP→TALK] Seed persist failed:', err));

                  console.log(`[∞MAP→TALK] Deep-dive into: ${selectedNode.label}`);
                  onNavigate('talk');
                }
              }}
            >
              <span style={{
                fontFamily: SANS,
                fontSize: typeSize.trace,
                fontWeight: weight.medium,
                letterSpacing: tracking.normal,
                color: room.fg,
              }}>
                TALK → EXPLORE THIS
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend — bottom whisper */}
      <AnimatePresence>
        {arrived && !selectedNode && (
          <motion.div
            className="absolute pointer-events-none flex justify-center gap-4"
            style={{
              bottom: ORB_CLEARANCE + 20,
              left: 0,
              right: 0,
              zIndex: layer.overlay,
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: SURFACE_DURATION, delay: delay('peripherals'), ease: SURFACE_EASE as any }}
          >
            {[
              { label: 'FRICTION', color: signal.friction },
              { label: 'PROCESSING', color: signal.energy },
              { label: 'INTEGRATED', color: signal.anchor },
            ].map(item => (
              <div key={item.label} className="flex items-center gap-1">
                <div
                  className="rounded-full"
                  style={{ width: 3, height: 3, background: item.color, opacity: opacity.gentle }}
                />
                <span style={{
                  fontFamily: SANS,
                  fontSize: typeSize.trace,
                  fontWeight: weight.regular,
                  letterSpacing: tracking.snug,
                  color: item.color,
                  opacity: opacity.murmur,
                }}>
                  {item.label}
                </span>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ RESILIENCE WHISPER ═══ */}
      <ResilienceWhisper posture={resilience.posture} breath={breath} runtimeName="map" />

      {/* Orb clearance */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: ORB_CLEARANCE,
          background: `linear-gradient(to top, ${void_.haze} 0%, transparent 100%)`,
          zIndex: layer.overlay,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}