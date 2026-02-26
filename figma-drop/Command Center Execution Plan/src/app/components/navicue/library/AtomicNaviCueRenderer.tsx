import type { PointerEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  immersiveTapButton,
  navicueStyles,
  navicueType,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';
import type { AtomicRenderSpec } from '@/app/data/lab/atomicLibrary';

interface Props {
  spec: AtomicRenderSpec;
  data?: any;
  onComplete?: () => void;
}

const KBE_SHORT = {
  knowing: 'k',
  believing: 'b',
  embodying: 'e',
} as const;

export default function AtomicNaviCueRenderer({ spec, onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: spec.signature,
        form: spec.form,
        chrono: spec.chrono,
        kbe: KBE_SHORT[spec.kbe],
        hook: spec.hook,
        specimenSeed: spec.specimenSeed,
        isSeal: spec.isSeal,
      }}
      mechanism={spec.mechanism}
      arrivalText={spec.title}
      prompt={spec.prompt}
      resonantText={spec.resonantText}
      afterglowCoda={spec.afterglowCoda}
      onComplete={onComplete}
    >
      {(verse) => <AtomicInteraction spec={spec} verse={verse} />}
    </NaviCueVerse>
  );
}

function AtomicInteraction({ spec, verse }: { spec: AtomicRenderSpec; verse: any }) {
  const [done, setDone] = useState(false);
  const [holdMs, setHoldMs] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [typing, setTyping] = useState('');
  const [observeReady, setObserveReady] = useState(spec.hook !== 'observe');
  const holdStartRef = useRef<number | null>(null);
  const holdRafRef = useRef<number | null>(null);
  const dragTrackRef = useRef<HTMLDivElement | null>(null);

  const complete = () => {
    if (done) return;
    setDone(true);
    setTimeout(() => verse.advance(), 480);
  };

  useEffect(() => {
    if (spec.hook !== 'observe') return;
    const timer = window.setTimeout(() => setObserveReady(true), 2400);
    return () => window.clearTimeout(timer);
  }, [spec.hook]);

  useEffect(() => {
    return () => {
      if (holdRafRef.current) cancelAnimationFrame(holdRafRef.current);
    };
  }, []);

  const btn = immersiveTapButton(verse.palette, done ? 'accent' : 'primary');

  const holdPct = Math.min(1, holdMs / 1500);
  const dragPct = Math.min(1, dragX / 100);
  const sparkOpacity = safeOpacity(0.08 + ((spec.specimenSeed % 7) / 30));

  const startHold = () => {
    if (done) return;
    holdStartRef.current = performance.now();
    const tick = (ts: number) => {
      if (holdStartRef.current == null) return;
      const elapsed = ts - holdStartRef.current;
      setHoldMs(elapsed);
      if (elapsed >= 1500) {
        complete();
        holdStartRef.current = null;
        return;
      }
      holdRafRef.current = requestAnimationFrame(tick);
    };
    holdRafRef.current = requestAnimationFrame(tick);
  };

  const stopHold = () => {
    if (done) return;
    holdStartRef.current = null;
    if (holdRafRef.current) cancelAnimationFrame(holdRafRef.current);
    setHoldMs(0);
  };

  const getDragPct = (clientX: number) => {
    const track = dragTrackRef.current;
    if (!track) return 0;
    const rect = track.getBoundingClientRect();
    const px = Math.max(0, Math.min(rect.width, clientX - rect.left));
    return rect.width > 0 ? (px / rect.width) * 100 : 0;
  };

  const onDragPointerDown = (ev: PointerEvent<HTMLDivElement>) => {
    if (done) return;
    const target = ev.currentTarget;
    target.setPointerCapture(ev.pointerId);
    const next = getDragPct(ev.clientX);
    setDragX(next);
    if (next >= 96) complete();
  };

  const onDragPointerMove = (ev: PointerEvent<HTMLDivElement>) => {
    if (done) return;
    if (!ev.currentTarget.hasPointerCapture(ev.pointerId)) return;
    const next = getDragPct(ev.clientX);
    setDragX(next);
    if (next >= 96) complete();
  };

  const hookHint = useMemo(() => {
    if (done) return `${spec.kbe} integrated`;
    switch (spec.hook) {
      case 'hold':
        return 'hold to integrate';
      case 'drag':
        return 'drag to integrate';
      case 'type':
        return 'name it to integrate';
      case 'observe':
        return observeReady ? 'witness and continue' : 'observe the field';
      default:
        return 'tap to integrate';
    }
  }, [done, spec.kbe, spec.hook, observeReady]);

  const showTap = spec.hook === 'tap' || (spec.hook === 'observe' && observeReady);
  const showHold = spec.hook === 'hold';
  const showDrag = spec.hook === 'drag';
  const showType = spec.hook === 'type';

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      <div style={{ position: 'relative', width: 240, height: 120 }}>
        <svg width="240" height="120" viewBox="0 0 240 120">
          <rect
            x="12"
            y="18"
            width="216"
            height="84"
            rx="14"
            fill={verse.palette.primary}
            opacity={safeOpacity(0.06)}
          />
          <rect
            x="12"
            y="18"
            width="216"
            height="84"
            rx="14"
            fill="none"
            stroke={verse.palette.accent}
            strokeWidth="1"
            opacity={safeOpacity(0.2)}
          />

          {[0, 1, 2, 3, 4].map((i) => {
            const seed = (spec.specimenSeed % (i + 7)) / (i + 7);
            return (
              <circle
                key={i}
                cx={34 + i * 44}
                cy={36 + seed * 48}
                r={2 + ((spec.specimenSeed + i) % 3)}
                fill={verse.palette.accent}
                opacity={sparkOpacity}
              />
            );
          })}

          {showHold && (
            <rect
              x="26"
              y="70"
              width={188 * holdPct}
              height="10"
              rx="5"
              fill={verse.palette.accent}
              opacity={safeOpacity(0.32)}
            />
          )}

          {showDrag && (
            <rect
              x="26"
              y="70"
              width={188 * dragPct}
              height="10"
              rx="5"
              fill={verse.palette.accent}
              opacity={safeOpacity(0.32)}
            />
          )}

          <text
            x="120"
            y="52"
            textAnchor="middle"
            style={{ ...navicueType.data, fill: verse.palette.text }}
            opacity={safeOpacity(done ? 0.92 : 0.72)}
          >
            {spec.title}
          </text>

          <text
            x="120"
            y="96"
            textAnchor="middle"
            style={{ ...navicueType.micro, fill: verse.palette.textFaint }}
            opacity={safeOpacity(0.58)}
          >
            {hookHint}
          </text>
        </svg>
      </div>

      {showTap && (
        <motion.button
          style={{ ...btn.base, color: verse.palette.text }}
          whileTap={btn.active}
          onClick={complete}
          type="button"
          disabled={done}
        >
          {done ? 'integrated' : spec.ctaPrimary}
        </motion.button>
      )}

      {showHold && (
        <motion.button
          style={{ ...btn.base, color: verse.palette.text }}
          whileTap={btn.active}
          onPointerDown={startHold}
          onPointerUp={stopHold}
          onPointerLeave={stopHold}
          onPointerCancel={stopHold}
          type="button"
          disabled={done}
        >
          {done ? 'integrated' : `hold ${Math.max(0, (1.5 - holdMs / 1000)).toFixed(1)}s`}
        </motion.button>
      )}

      {showDrag && (
        <div
          ref={dragTrackRef}
          onPointerDown={onDragPointerDown}
          onPointerMove={onDragPointerMove}
          style={{
            width: 220,
            height: 42,
            borderRadius: 20,
            border: `1px solid ${verse.palette.stroke}`,
            background: `linear-gradient(90deg, ${verse.palette.primary}22, ${verse.palette.accent}1a)`,
            position: 'relative',
            overflow: 'hidden',
            touchAction: 'none',
            cursor: 'ew-resize',
          }}
          role="slider"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(dragPct * 100)}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              width: `${dragPct * 100}%`,
              background: `${verse.palette.accent}22`,
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: 5,
              left: `calc(${dragPct * 100}% - 16px)`,
              width: 32,
              height: 32,
              borderRadius: 16,
              background: verse.palette.accent,
              opacity: safeOpacity(0.38),
            }}
          />
        </div>
      )}

      {showType && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input
            value={typing}
            onChange={(ev) => setTyping(ev.target.value)}
            placeholder="name the signal"
            style={{
              width: 180,
              height: 36,
              borderRadius: 10,
              border: `1px solid ${verse.palette.stroke}`,
              background: `${verse.palette.primary}22`,
              color: verse.palette.text,
              fontFamily: navicueType.micro.fontFamily,
              fontSize: '13px',
              padding: '0 12px',
              outline: 'none',
            }}
          />
          <motion.button
            type="button"
            style={{ ...btn.base, minWidth: 76, color: verse.palette.text }}
            whileTap={btn.active}
            onClick={complete}
            disabled={done || typing.trim().length < 3}
          >
            {done ? 'integrated' : 'commit'}
          </motion.button>
        </div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>{spec.subtitle}</div>
    </div>
  );
}
