/**
 * DEPTH DESCENT — Transfer Block 2C
 *
 * Text does not scroll up — it scales forward from the deep background.
 * The user pulls the text toward them out of the digital void.
 * Physically mimics the act of pulling a buried memory to the surface.
 *
 * Silent Telemetry: measures pacing per section pull.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { hapticTick, hapticThreshold, hapticPressure } from '../surfaces/haptics';

import { room, font, tracking, typeSize, leading, weight, opacity, timing } from '../design-system/surface-tokens';

const SERIF = font.serif;
const SANS = font.sans;
const MONO = font.mono;

interface DepthDescentProps {
  copy: string;
  sections: string[];
  color: string;
  breath: number;
  instruction: string;
  width: number;
  height: number;
  onComplete: (pacingMs: number[]) => void;
}

export function DepthDescent({
  copy,
  sections,
  color,
  breath,
  instruction,
  width,
  height,
  onComplete,
}: DepthDescentProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [pulling, setPulling] = useState(false);
  const [pullProgress, setPullProgress] = useState(0);
  const [complete, setComplete] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const sectionTimesRef = useRef<number[]>([]);
  const sectionStartRef = useRef(Date.now());

  const allText = [copy, ...sections];
  const totalSections = allText.length;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (complete) return;
    setPulling(true);
    startYRef.current = e.clientY;
  }, [complete]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!pulling || complete) return;
    // Upward drag = pull toward you
    const delta = startYRef.current - e.clientY;
    const normalized = Math.max(0, Math.min(1, delta / (height * 0.3)));
    setPullProgress(normalized);

    if (normalized > 0.1 && normalized % 0.15 < 0.02) {
      hapticPressure(normalized);
    }
  }, [pulling, complete, height]);

  const handlePointerUp = useCallback(() => {
    if (!pulling) return;
    setPulling(false);

    if (pullProgress > 0.6) {
      // Section pulled through — advance
      const now = Date.now();
      sectionTimesRef.current.push(now - sectionStartRef.current);
      sectionStartRef.current = now;
      hapticThreshold();

      if (currentSection >= totalSections - 1) {
        setComplete(true);
        setTimeout(() => onComplete(sectionTimesRef.current), 800);
      } else {
        setCurrentSection(prev => prev + 1);
      }
    } else {
      hapticTick();
    }

    setPullProgress(0);
  }, [pulling, pullProgress, currentSection, totalSections, onComplete]);

  const breathPulse = Math.sin(breath * Math.PI * 2);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0"
      style={{ touchAction: 'none' }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Z-axis depth layers — past sections recede */}
      {allText.map((text, i) => {
        const isCurrent = i === currentSection;
        const isPast = i < currentSection;
        const isFuture = i > currentSection;

        // Z-depth scale: past sections shrink/recede, future sections are far
        const baseScale = isCurrent
          ? 1 - pullProgress * 0.15
          : isPast
            ? 0.6 - (currentSection - i) * 0.12
            : 0.3 + (1 - (i - currentSection) * 0.1);

        const opacity = isCurrent
          ? 0.55 + pullProgress * 0.25
          : isPast
            ? Math.max(0, 0.08 - (currentSection - i) * 0.03)
            : Math.max(0, 0.06 - (i - currentSection) * 0.02);

        const blur = isCurrent
          ? Math.max(0, (1 - pullProgress) * 3)
          : isPast
            ? 2 + (currentSection - i) * 2
            : 6 + (i - currentSection) * 3;

        const yOffset = isCurrent
          ? -pullProgress * 30
          : isPast
            ? -40 - (currentSection - i) * 20
            : 40 + (i - currentSection) * 25;

        if (opacity < 0.01) return null;

        return (
          <motion.div
            key={i}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            animate={{
              opacity,
              scale: Math.max(0.1, baseScale),
              y: yOffset,
              filter: `blur(${blur}px)`,
            }}
            transition={{
              duration: pulling ? 0.05 : 0.8,
              ease: [0.16, 1, 0.3, 1],
            }}
            style={{ padding: '0 12%' }}
          >
            <p style={{
              fontFamily: SERIF,
              fontSize: i === 0
                ? 'clamp(17px, 4.2vw, 23px)'
                : 'clamp(14px, 3.5vw, 18px)',
              fontWeight: weight.light,
              lineHeight: leading.reading,
              color: room.fg,
              textAlign: 'center',
              margin: 0,
              maxWidth: '90%',
            }}>
              {text}
            </p>
          </motion.div>
        );
      })}

      {/* Pull progress indicator */}
      {pulling && pullProgress > 0.05 && (
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: height * 0.35,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 1,
            height: pullProgress * 60,
            background: `linear-gradient(to top, ${color}25, transparent)`,
            transition: 'none',
          }}
        />
      )}

      {/* Section counter */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '8%',
          left: 0,
          right: 0,
          textAlign: 'center',
          opacity: opacity.ghost,
        }}
      >
        <span style={{
          fontFamily: MONO,
          fontSize: typeSize.micro,
          color: room.fg,
          letterSpacing: tracking.snug,
        }}>
          {currentSection + 1}/{totalSections}
        </span>
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
            transition={{ delay: 1.5, duration: 1.5 }}
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