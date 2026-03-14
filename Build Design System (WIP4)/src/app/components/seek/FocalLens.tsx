/**
 * FOCAL LENS — Transfer Block 2A
 *
 * The user drags a luminous gradient down to bring blurred text
 * into sharp focus, section by section. Text only clarifies at
 * the speed of the user's physical drag.
 *
 * Silent Telemetry: measures cognitive pacing — how long the user
 * sits with each sentence before advancing.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { hapticTick, hapticThreshold } from '../surfaces/haptics';
import { room, font, tracking, typeSize, leading, weight, opacity } from '../design-system/surface-tokens';

const SERIF = font.serif;
const SANS = font.sans;

interface FocalLensProps {
  /** Primary copy — the hook sentence */
  copy: string;
  /** Additional text sections to reveal */
  sections: string[];
  /** Color for the lens */
  color: string;
  /** Breath for ambient modulation */
  breath: number;
  /** Instruction text */
  instruction: string;
  /** Width of the viewport */
  width: number;
  /** Height of the viewport */
  height: number;
  /** Called when all sections have been illuminated */
  onComplete: (pacingMs: number[]) => void;
}

export function FocalLens({
  copy,
  sections,
  color,
  breath,
  instruction,
  width,
  height,
  onComplete,
}: FocalLensProps) {
  const [lensPosition, setLensPosition] = useState(0); // 0-1 vertical
  const [revealedSections, setRevealedSections] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [complete, setComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sectionTimesRef = useRef<number[]>([]);
  const lastRevealTimeRef = useRef(Date.now());

  const allText = [copy, ...sections];
  const totalSections = allText.length;

  // Calculate which section the lens is illuminating
  const activeSectionIndex = Math.min(
    totalSections - 1,
    Math.floor(lensPosition * totalSections),
  );

  // Track section reveals
  useEffect(() => {
    if (activeSectionIndex > revealedSections) {
      const now = Date.now();
      const pacingMs = now - lastRevealTimeRef.current;
      sectionTimesRef.current.push(pacingMs);
      lastRevealTimeRef.current = now;
      setRevealedSections(activeSectionIndex);
      hapticTick();

      // Check if all sections revealed
      if (activeSectionIndex >= totalSections - 1) {
        setTimeout(() => {
          setComplete(true);
          hapticThreshold();
          onComplete(sectionTimesRef.current);
        }, 1200);
      }
    }
  }, [activeSectionIndex, revealedSections, totalSections, onComplete]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (complete) return;
    setDragging(true);
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const relY = (e.clientY - rect.top) / rect.height;
      setLensPosition(Math.max(0, Math.min(1, relY)));
    }
  }, [complete]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging || complete) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (rect) {
      const relY = (e.clientY - rect.top) / rect.height;
      setLensPosition(Math.max(0, Math.min(1, relY)));
    }
  }, [dragging, complete]);

  const handlePointerUp = useCallback(() => {
    setDragging(false);
  }, []);

  const breathPulse = Math.sin(breath * Math.PI * 2);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{ touchAction: 'none', cursor: dragging ? 'grabbing' : 'grab' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Lens gradient — the luminous reveal zone */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          top: `${lensPosition * 100 - 15}%`,
          height: '30%',
          background: `linear-gradient(to bottom, transparent 0%, ${color}06 30%, ${color}0a 50%, ${color}06 70%, transparent 100%)`,
          transition: dragging ? 'none' : 'top 0.3s ease',
          opacity: dragging ? 1 : 0.5,
        }}
      />

      {/* Lens position indicator — a faint horizontal line */}
      <div
        className="absolute left-[15%] right-[15%] pointer-events-none"
        style={{
          top: `${lensPosition * 100}%`,
          height: '0.5px',
          background: `linear-gradient(90deg, transparent, ${color}15, transparent)`,
          transition: dragging ? 'none' : 'top 0.3s ease',
          opacity: dragging ? 0.8 : 0.3,
        }}
      />

      {/* Text sections */}
      <div
        className="absolute inset-0 flex flex-col justify-center px-[10%] pointer-events-none"
        style={{ gap: height * 0.06 }}
      >
        {allText.map((text, i) => {
          const isRevealed = i <= revealedSections;
          const isActive = i === activeSectionIndex && dragging;
          const isFirst = i === 0;

          // Distance from lens determines blur
          const sectionY = (i + 0.5) / totalSections;
          const dist = Math.abs(sectionY - lensPosition);
          const blur = isRevealed ? 0 : Math.min(8, dist * 20);
          const opacity = isRevealed
            ? (isFirst ? 0.7 : 0.5)
            : Math.max(0.04, 0.15 - dist * 0.3);

          return (
            <motion.div
              key={i}
              animate={{
                filter: `blur(${blur}px)`,
                opacity,
              }}
              transition={{ duration: isActive ? 0.1 : 0.6 }}
              style={{
                maxWidth: isFirst ? '85%' : '80%',
                marginLeft: 'auto',
                marginRight: 'auto',
                textAlign: 'center',
              }}
            >
              <p style={{
                fontFamily: SERIF,
                fontSize: isFirst
                  ? 'clamp(16px, 4vw, 22px)'
                  : 'clamp(13px, 3.2vw, 16px)',
                fontWeight: weight.light,
                fontStyle: isFirst ? 'normal' : 'normal',
                lineHeight: leading.generous,
                color: room.fg,
                margin: 0,
                letterSpacing: tracking.lift,
              }}>
                {text}
              </p>
            </motion.div>
          );
        })}
      </div>

      {/* Instruction */}
      <AnimatePresence>
        {!complete && (
          <motion.div
            className="absolute pointer-events-none"
            style={{ bottom: 130, left: 0, right: 0, textAlign: 'center' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: opacity.trace }}
            exit={{ opacity: 0 }}
            transition={{ delay: 1, duration: 1.5 }}
          >
            <span style={{
              fontFamily: SANS,
              fontSize: typeSize.micro,
              fontWeight: weight.medium,
              letterSpacing: tracking.lift,
              textTransform: 'uppercase',
              color,
            }}>
              {instruction}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}