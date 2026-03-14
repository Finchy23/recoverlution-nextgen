/**
 * VOICE — The Range Browser
 *
 * Each atom speaks in its own typographic voice.
 * Without range, every scene sounds the same.
 * With it, a composition can pull from whispers,
 * monoliths, fragments, and observations —
 * and they all fit because they all speak from the same glass.
 *
 * This page demonstrates the eight treatments
 * across all seventeen implemented atoms.
 * The device mirror renders each atom's copy
 * in its specific treatment. No two atoms
 * look the same. That is the point.
 */

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ATOM_REGISTRY } from '../components/atoms/atom-registry';
import { CUE_SEQUENCE } from '../components/cues/cue-library';
import { ALL_COMPOSITIONS } from '../components/cues/composition-library';
import type { Device } from '../components/design-system/surface-engine';
import {
  type CopyTreatment,
  ALL_TREATMENTS,
  getTreatmentMeta,
  getAtomTreatment,
  getTreatmentTypography,
  getTreatmentLayout,
} from '../components/cues/voice-treatments';
import {
  room, font, tracking, typeSize, leading, weight,
  opacity, timing, glow, radii, glaze, depth,
} from '../components/design-system/surface-tokens';

// ═══════════════════════════════════════════════════════
// VOICE ENTRY — one atom's copy + treatment
// ═══════════════════════════════════════════════════════

interface VoiceEntry {
  atomId: string;
  atomName: string;
  atomColor: string;
  accentColor: string;
  treatment: CopyTreatment;
  canopy: string;
  gesture: string;
  receipt: string;
  interaction: string;
  charCount: number;
}

function buildVoiceEntries(): VoiceEntry[] {
  const entries: VoiceEntry[] = [];
  const seenKeys = new Set<string>();

  // ── From CUE_SEQUENCE (the 10 core atoms) ──
  for (const cue of CUE_SEQUENCE) {
    const atom = ATOM_REGISTRY.find(a => a.id === cue.atomId);
    if (!atom) continue;

    const key = `${cue.atomId}:${cue.canopy.slice(0, 30)}`;
    seenKeys.add(key);

    const treatment = getAtomTreatment(cue.atomId);
    entries.push({
      atomId: cue.atomId,
      atomName: atom.name,
      atomColor: atom.color,
      accentColor: atom.accentColor,
      treatment,
      canopy: cue.canopy,
      gesture: cue.gesture,
      receipt: cue.receipt,
      interaction: atom.interaction,
      charCount: cue.canopy.length + cue.gesture.length + cue.receipt.length,
    });
  }

  // ── From ALL_COMPOSITIONS (covers all 17 atoms) ──
  // Adds entries for atoms not yet seen, plus additional copy variants
  for (const comp of ALL_COMPOSITIONS) {
    for (const beat of comp.beats) {
      const key = `${beat.atomId}:${beat.sync.canopy.slice(0, 30)}`;
      if (seenKeys.has(key)) continue;
      seenKeys.add(key);

      const atom = ATOM_REGISTRY.find(a => a.id === beat.atomId);
      if (!atom) continue;

      const treatment = getAtomTreatment(beat.atomId);
      entries.push({
        atomId: beat.atomId,
        atomName: atom.name,
        atomColor: atom.color,
        accentColor: atom.accentColor,
        treatment,
        canopy: beat.sync.canopy,
        gesture: beat.sync.gesture,
        receipt: beat.sync.receipt,
        interaction: atom.interaction,
        charCount: beat.sync.canopy.length + beat.sync.gesture.length + beat.sync.receipt.length,
      });
    }
  }

  // Sort by treatment for coherent browsing
  const treatmentOrder: Record<string, number> = {
    koan: 0, whisper: 1, monolith: 2, scattered: 3,
    somatic: 4, atmospheric: 5, clinical: 6, organic: 7,
  };
  entries.sort((a, b) => (treatmentOrder[a.treatment] ?? 99) - (treatmentOrder[b.treatment] ?? 99));

  return entries;
}

// ═══════════════════════════════════════════════════════
// TREATMENT RENDERER — renders copy in its treatment
// ═══════════════════════════════════════════════════════

function TreatmentRenderer({
  entry,
  phase,
}: {
  entry: VoiceEntry;
  phase: 'canopy' | 'gesture' | 'receipt' | 'all';
}) {
  const typo = getTreatmentTypography(entry.treatment);
  const layout = getTreatmentLayout(entry.treatment);

  const showCanopy = phase === 'all' || phase === 'canopy';
  const showGesture = phase === 'all' || phase === 'gesture';
  const showReceipt = phase === 'all' || phase === 'receipt';

  return (
    <div className="absolute inset-0 pointer-events-none select-none">
      {/* Atmosphere tint */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse 60% 50% at 50% 45%, ${entry.atomColor}08 0%, transparent 70%)`,
          transition: 'background 1.2s ease',
        }}
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{ background: `radial-gradient(ellipse 80% 80% at 50% 50%, transparent 20%, ${room.void} 100%)` }}
      />

      {/* Canopy */}
      {showCanopy && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          style={{ ...layout.canopy as any }}
        >
          <p style={{ ...typo.canopy, margin: 0 }}>{entry.canopy}</p>
        </motion.div>
      )}

      {/* Gesture */}
      {showGesture && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{ ...layout.gesture as any }}
        >
          <p style={{ ...typo.gesture, margin: 0, color: entry.atomColor }}>{entry.gesture}</p>
        </motion.div>
      )}

      {/* Receipt */}
      {showReceipt && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.0, delay: 1.0, ease: [0.16, 1, 0.3, 1] }}
          style={{ ...layout.receipt as any }}
        >
          <p style={{ ...typo.receipt, margin: 0 }}>{entry.receipt}</p>
        </motion.div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// TREATMENT SWATCH — mini preview of treatment character
// ═══════════════════════════════════════════════════════

function TreatmentSwatch({ treatment, active }: { treatment: CopyTreatment; active: boolean }) {
  const meta = getTreatmentMeta(treatment);

  // Visual swatches
  const renderMiniLayout = () => {
    switch (treatment) {
      case 'koan':
        return (
          <div className="flex flex-col items-center justify-center gap-1 h-full">
            <div style={{ width: '60%', height: 2, background: active ? meta.color : glaze.dim, borderRadius: 1 }} />
            <div style={{ width: '30%', height: 1, background: active ? meta.color : glaze.frost, borderRadius: 1 }} />
          </div>
        );
      case 'whisper':
        return (
          <div className="relative h-full">
            <div className="absolute top-1 right-1" style={{ width: '40%', height: 1, background: active ? meta.color : glaze.frost, borderRadius: 1 }} />
            <div className="absolute bottom-2 left-1" style={{ width: '25%', height: 1, background: active ? meta.color : glaze.frost, borderRadius: 1 }} />
          </div>
        );
      case 'monolith':
        return (
          <div className="flex flex-col items-center justify-center h-full">
            <div style={{ width: '85%', height: 3, background: active ? meta.color : glaze.dim, borderRadius: 1 }} />
          </div>
        );
      case 'scattered':
        return (
          <div className="relative h-full">
            <div className="absolute top-1 left-1" style={{ width: '35%', height: 1.5, background: active ? meta.color : glaze.frost, borderRadius: 1 }} />
            <div className="absolute top-3 right-1" style={{ width: '20%', height: 1, background: active ? meta.color : glaze.frost, borderRadius: 1, opacity: 0.6 }} />
            <div className="absolute bottom-1.5 left-3" style={{ width: '28%', height: 1, background: active ? meta.color : glaze.frost, borderRadius: 1 }} />
          </div>
        );
      case 'somatic':
        return (
          <div className="flex flex-col justify-center gap-1 h-full pl-1">
            <div style={{ width: '55%', height: 2, background: active ? meta.color : glaze.dim, borderRadius: 1 }} />
            <div style={{ width: '30%', height: 1, background: active ? meta.color : glaze.frost, borderRadius: 1 }} />
          </div>
        );
      case 'atmospheric':
        return (
          <div className="flex items-center justify-center h-full">
            <div style={{ width: '90%', height: 4, background: active ? meta.color : glaze.frost, borderRadius: 1, opacity: 0.15 }} />
          </div>
        );
      case 'clinical':
        return (
          <div className="flex flex-col gap-0.5 h-full pt-1 pl-1">
            <div style={{ width: '50%', height: 1, background: active ? meta.color : glaze.frost, borderRadius: 1 }} />
            <div style={{ width: '40%', height: 1, background: active ? meta.color : glaze.frost, borderRadius: 1 }} />
            <div style={{ width: '45%', height: 1, background: active ? meta.color : glaze.frost, borderRadius: 1 }} />
          </div>
        );
      case 'organic':
        return (
          <div className="flex flex-col gap-0.5 justify-center h-full pl-1">
            <div style={{ width: '60%', height: 1.5, background: active ? meta.color : glaze.dim, borderRadius: 1 }} />
            <div style={{ width: '50%', height: 1.5, background: active ? meta.color : glaze.frost, borderRadius: 1 }} />
          </div>
        );
    }
  };

  return (
    <div
      style={{
        width: 28,
        height: 20,
        borderRadius: radii.pill,
        border: `1px solid ${active ? meta.color + '40' : glaze.thin}`,
        background: active ? meta.color + '08' : 'transparent',
        overflow: 'hidden',
        transition: timing.t.easeRespond,
      }}
    >
      {renderMiniLayout()}
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// VOICE PAGE
// ═══════════════════════════════════════════════════════

type CopyPhase = 'all' | 'canopy' | 'gesture' | 'receipt';
type FilterTreatment = 'all' | CopyTreatment;

export function VoicePage() {
  const [device, setDevice] = useState<Device>('phone');
  const [filterTreatment, setFilterTreatment] = useState<FilterTreatment>('all');
  const [phase, setPhase] = useState<CopyPhase>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  const allEntries = useMemo(() => buildVoiceEntries(), []);

  const filtered = useMemo(() => {
    if (filterTreatment === 'all') return allEntries;
    return allEntries.filter(e => e.treatment === filterTreatment);
  }, [allEntries, filterTreatment]);

  // Reset index when filter changes
  useEffect(() => setCurrentIndex(0), [filterTreatment]);

  // Auto-advance
  useEffect(() => {
    if (!autoPlay || filtered.length === 0) return;
    const id = setInterval(() => {
      setCurrentIndex(i => (i + 1) % filtered.length);
    }, 5000);
    return () => clearInterval(id);
  }, [autoPlay, filtered.length]);

  const advance = useCallback(() => {
    setCurrentIndex(i => (i + 1) % filtered.length);
  }, [filtered.length]);

  const retreat = useCallback(() => {
    setCurrentIndex(i => (i - 1 + filtered.length) % filtered.length);
  }, [filtered.length]);

  const entry = filtered[currentIndex] ?? null;
  const treatmentMeta = entry ? getTreatmentMeta(entry.treatment) : null;

  const isPhone = device === 'phone';

  return (
    <div
      className="flex flex-col"
      style={{
        height: '100vh',
        paddingTop: 56,
        background: room.void,
        overflow: 'hidden',
      }}
    >
      {/* ═══ MAIN: Mirror + Panel ═══ */}
      <div className="flex-1 min-h-0 flex">

        {/* ── LEFT: Device Mirror ── */}
        <div className="flex-1 min-h-0 flex items-center justify-center px-4 pt-2 pb-2">
          <div
            className="relative overflow-hidden"
            style={{
              width: isPhone ? 'min(380px, 88vw)' : '100%',
              height: isPhone ? 'min(740px, 100%)' : '100%',
              maxHeight: '100%',
              borderRadius: isPhone ? radii.chromeOuter : radii.frameInner,
              background: glaze.trace,
              boxShadow: [
                `0 0 200px ${entry?.atomColor ?? '#5A46B4'}04`,
                `0 80px 160px ${depth.well}`,
                `inset 0 0 0 1px ${glaze.thin}`,
                `inset 0 1px 0 ${glaze.thin}`,
                `inset 0 -1px 0 ${depth.edge}`,
              ].join(', '),
              transition: timing.t.arrive,
              cursor: 'pointer',
            }}
            onClick={advance}
          >
            {/* Glass interior */}
            <div
              className="absolute overflow-hidden"
              style={{
                top: isPhone ? 12 : 6,
                left: 6, right: 6,
                bottom: isPhone ? 12 : 6,
                borderRadius: isPhone ? radii.chromeInner : radii.frameInner,
                background: room.void,
              }}
            >
              {/* Top sheen */}
              <div
                className="absolute inset-x-0 top-0 h-px pointer-events-none"
                style={{ background: `linear-gradient(90deg, transparent 12%, ${glaze.mist} 50%, transparent 88%)` }}
              />

              {/* Treatment renderer */}
              <AnimatePresence mode="wait">
                {entry && (
                  <motion.div
                    key={`${currentIndex}-${entry.atomId}`}
                    initial={{ opacity: 0, filter: 'blur(4px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, filter: 'blur(3px)' }}
                    transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0"
                  >
                    <TreatmentRenderer entry={entry} phase={phase} />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Treatment badge — top left */}
              {entry && (
                <div
                  className="absolute top-3 left-3 flex items-center gap-1.5 pointer-events-none"
                  style={{ opacity: opacity.ghost, transition: timing.t.color }}
                >
                  <div
                    className="rounded-full"
                    style={{
                      width: 4, height: 4,
                      background: treatmentMeta?.color ?? glaze.dim,
                      boxShadow: glow.dot(treatmentMeta?.color ?? '#fff', '30'),
                    }}
                  />
                  <span
                    style={{
                      fontFamily: font.sans,
                      fontSize: typeSize.whisper,
                      fontWeight: weight.medium,
                      letterSpacing: tracking.spread,
                      textTransform: 'uppercase',
                      color: treatmentMeta?.color ?? glaze.dim,
                    }}
                  >
                    {entry.treatment}
                  </span>
                </div>
              )}

              {/* Position counter */}
              {filtered.length > 0 && (
                <div
                  className="absolute bottom-3 left-0 right-0 text-center pointer-events-none"
                  style={{
                    fontFamily: font.mono,
                    fontSize: typeSize.whisper,
                    color: room.gray1,
                    opacity: opacity.ghost,
                  }}
                >
                  {currentIndex + 1} / {filtered.length}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Mechanics Panel ── */}
        <div
          className="shrink-0 overflow-y-auto"
          style={{
            width: 340,
            borderLeft: `1px solid ${glaze.thin}`,
            padding: '16px 20px',
            background: room.void,
          }}
        >
          <AnimatePresence mode="wait">
            {entry && treatmentMeta && (
              <motion.div
                key={`${currentIndex}-${entry.atomId}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-5"
              >
                {/* Atom identity */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <div
                      className="rounded-full"
                      style={{
                        width: 6, height: 6,
                        background: entry.atomColor,
                        boxShadow: glow.soft(entry.atomColor, '30'),
                      }}
                    />
                    <span
                      style={{
                        fontFamily: font.serif,
                        fontSize: typeSize.prose,
                        fontWeight: weight.regular,
                        color: room.fg,
                        opacity: opacity.clear,
                      }}
                    >
                      {entry.atomName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span
                      style={{
                        fontFamily: font.sans,
                        fontSize: typeSize.label,
                        fontWeight: weight.medium,
                        letterSpacing: tracking.spread,
                        textTransform: 'uppercase',
                        color: treatmentMeta.color,
                        opacity: opacity.strong,
                      }}
                    >
                      {treatmentMeta.label}
                    </span>
                    <span
                      style={{
                        fontFamily: font.mono,
                        fontSize: typeSize.label,
                        color: glaze.dim,
                        letterSpacing: tracking.code,
                      }}
                    >
                      {entry.interaction}
                    </span>
                    <span
                      style={{
                        fontFamily: font.mono,
                        fontSize: typeSize.label,
                        color: glaze.dim,
                        letterSpacing: tracking.code,
                      }}
                    >
                      {entry.charCount} chars
                    </span>
                  </div>
                </div>

                {/* Treatment character */}
                <div
                  style={{
                    paddingTop: 10,
                    borderTop: `1px solid ${glaze.thin}`,
                  }}
                >
                  <span style={labelStyle}>Character</span>
                  <p
                    style={{
                      fontFamily: font.serif,
                      fontSize: typeSize.small,
                      fontWeight: weight.regular,
                      lineHeight: leading.relaxed,
                      color: room.fg,
                      opacity: opacity.body,
                      margin: 0,
                    }}
                  >
                    {treatmentMeta.character}
                  </p>
                </div>

                {/* Copy layers */}
                <div
                  style={{
                    paddingTop: 10,
                    borderTop: `1px solid ${glaze.thin}`,
                  }}
                >
                  <span style={labelStyle}>Copy Layers</span>
                  <div className="space-y-3">
                    {/* Canopy */}
                    <CopyLayer
                      label="canopy"
                      sublabel="the invitation"
                      text={entry.canopy}
                      color={entry.atomColor}
                      charCount={entry.canopy.length}
                      active={phase === 'all' || phase === 'canopy'}
                      onClick={() => setPhase(p => p === 'canopy' ? 'all' : 'canopy')}
                    />
                    {/* Gesture */}
                    <CopyLayer
                      label="gesture"
                      sublabel="the physics"
                      text={entry.gesture}
                      color={entry.atomColor}
                      charCount={entry.gesture.length}
                      active={phase === 'all' || phase === 'gesture'}
                      onClick={() => setPhase(p => p === 'gesture' ? 'all' : 'gesture')}
                    />
                    {/* Receipt */}
                    <CopyLayer
                      label="receipt"
                      sublabel="the lingering chord"
                      text={entry.receipt}
                      color={entry.atomColor}
                      charCount={entry.receipt.length}
                      active={phase === 'all' || phase === 'receipt'}
                      onClick={() => setPhase(p => p === 'receipt' ? 'all' : 'receipt')}
                    />
                  </div>
                </div>

                {/* Voice principles */}
                <div
                  style={{
                    paddingTop: 10,
                    borderTop: `1px solid ${glaze.thin}`,
                  }}
                >
                  <span style={labelStyle}>Voice Principles</span>
                  <div className="space-y-1.5">
                    {[
                      'No promises. No outcomes.',
                      'No "you will." No "this means."',
                      'Questions over statements.',
                      'Physics over psychology.',
                      'The only truth: I AM.',
                      'The only time: NOW.',
                      'An ellipsis, not a period.',
                    ].map((p, i) => (
                      <p
                        key={i}
                        style={{
                          fontFamily: font.serif,
                          fontSize: typeSize.caption,
                          fontStyle: 'italic',
                          fontWeight: weight.light,
                          color: room.fg,
                          opacity: opacity.spoken,
                          margin: 0,
                          lineHeight: leading.compact,
                        }}
                      >
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ═══ BOTTOM: Controls ═══ */}
      <div
        className="shrink-0 px-6 sm:px-10 pb-4 pt-3 relative"
        style={{ background: room.void }}
      >
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent 5%, ${glaze.veil} 30%, ${glaze.frost} 50%, ${glaze.veil} 70%, transparent 95%)` }}
        />

        <div className="max-w-4xl mx-auto">
          {/* Row 1: Treatment filters + layer filter + playback */}
          <div className="flex flex-wrap gap-x-8 gap-y-3 items-start">
            {/* Treatment filter */}
            <div>
              <span style={labelStyle}>Treatment</span>
              <div className="flex flex-wrap gap-x-2 gap-y-1 items-center">
                <button
                  onClick={() => setFilterTreatment('all')}
                  style={btnStyle(filterTreatment === 'all')}
                >
                  All
                </button>
                {ALL_TREATMENTS.map(t => {
                  const meta = getTreatmentMeta(t);
                  return (
                    <button
                      key={t}
                      onClick={() => setFilterTreatment(t)}
                      className="flex items-center gap-1"
                      style={btnStyle(filterTreatment === t)}
                    >
                      <TreatmentSwatch treatment={t} active={filterTreatment === t} />
                      <span>{meta.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Layer filter */}
            <div>
              <span style={labelStyle}>Layer</span>
              <div className="flex gap-x-3 gap-y-1">
                {(['all', 'canopy', 'gesture', 'receipt'] as CopyPhase[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setPhase(p)}
                    style={btnStyle(phase === p)}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            {/* Playback */}
            <div>
              <span style={labelStyle}>Flow</span>
              <div className="flex gap-3 items-center">
                <button onClick={retreat} style={btnStyle(false)}>
                  ←
                </button>
                <button
                  onClick={() => setAutoPlay(!autoPlay)}
                  style={btnStyle(autoPlay)}
                >
                  {autoPlay ? 'flowing' : 'paused'}
                </button>
                <button onClick={advance} style={btnStyle(false)}>
                  →
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Stats + Device */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {entry && treatmentMeta && (
                <>
                  <div
                    className="rounded-full"
                    style={{
                      width: 4, height: 4,
                      background: treatmentMeta.color,
                      boxShadow: glow.dot(treatmentMeta.color, '40'),
                    }}
                  />
                  <span
                    style={{
                      fontFamily: font.serif,
                      fontSize: typeSize.note,
                      fontStyle: 'italic',
                      color: glaze.dim,
                    }}
                  >
                    {filtered.length} {filtered.length === 1 ? 'atom' : 'atoms'}
                  </span>
                  <span
                    style={{
                      fontFamily: font.sans,
                      fontSize: typeSize.detail,
                      letterSpacing: tracking.tight,
                      color: glaze.sheen,
                    }}
                  >
                    {filterTreatment === 'all' ? '8 treatments' : treatmentMeta.label}
                    {' · '}
                    {phase === 'all' ? 'all layers' : phase}
                  </span>
                </>
              )}
            </div>
            <div className="flex items-center gap-6">
              {(['phone', 'desktop'] as Device[]).map(d => (
                <button
                  key={d}
                  onClick={() => setDevice(d)}
                  style={{
                    fontFamily: font.sans,
                    fontSize: typeSize.detail,
                    fontWeight: weight.medium,
                    letterSpacing: tracking.shelf,
                    textTransform: 'uppercase',
                    color: device === d ? glaze.milk : glaze.sheen,
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: timing.t.color,
                  }}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════
// COPY LAYER — shows one layer in the mechanics panel
// ═══════════════════════════════════════════════════════

function CopyLayer({
  label,
  sublabel,
  text,
  color,
  charCount,
  active,
  onClick,
}: {
  label: string;
  sublabel: string;
  text: string;
  color: string;
  charCount: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="block w-full text-left"
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px 0',
        opacity: active ? 1 : opacity.spoken,
        transition: timing.t.easeRespond,
      }}
    >
      <div className="flex items-center gap-2 mb-0.5">
        <span
          style={{
            fontFamily: font.sans,
            fontSize: typeSize.whisper,
            fontWeight: weight.medium,
            letterSpacing: tracking.spread,
            textTransform: 'uppercase',
            color: active ? color : glaze.dim,
            transition: timing.t.color,
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: font.serif,
            fontSize: typeSize.whisper,
            fontStyle: 'italic',
            color: glaze.dim,
          }}
        >
          {sublabel}
        </span>
        <span
          style={{
            fontFamily: font.mono,
            fontSize: typeSize.whisper,
            color: glaze.dim,
            letterSpacing: tracking.code,
            marginLeft: 'auto',
          }}
        >
          {charCount}
        </span>
      </div>
      <p
        style={{
          fontFamily: font.serif,
          fontSize: typeSize.small,
          fontWeight: weight.light,
          fontStyle: 'italic',
          lineHeight: leading.natural,
          color: room.fg,
          opacity: active ? opacity.body : opacity.spoken,
          margin: 0,
          transition: timing.t.easeRespond,
        }}
      >
        {text}
      </p>
    </button>
  );
}

// ─── Shared Styles ───

const labelStyle: Record<string, string | number> = {
  fontFamily: font.sans,
  fontSize: typeSize.label,
  fontWeight: weight.medium,
  letterSpacing: tracking.spread,
  textTransform: 'uppercase',
  color: glaze.smoke,
  marginBottom: 6,
  display: 'block',
};

const btnStyle = (active: boolean): Record<string, string | number> => ({
  fontFamily: font.serif,
  fontSize: typeSize.small,
  fontWeight: active ? weight.medium : weight.regular,
  color: active ? room.fg : glaze.silver,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: 0,
  transition: timing.t.colorMid,
  whiteSpace: 'nowrap',
});