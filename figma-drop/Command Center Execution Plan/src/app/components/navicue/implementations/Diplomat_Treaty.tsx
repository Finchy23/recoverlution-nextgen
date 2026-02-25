/**
 * DIPLOMAT #6 -- 1266. The Treaty (Win-Win)
 * "Bake a bigger pie."
 * INTERACTION: Drag to expand the pie -- both slices grow
 * STEALTH KBE: Abundance Mindset -- Cooperative Logic (B)
 *
 * COMPOSITOR: pattern_glitch / Circuit / work / believing / drag / 1266
 */
import { useState, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  navicueInteraction,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function Diplomat_Treaty({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'pattern_glitch',
        form: 'Circuit',
        chrono: 'work',
        kbe: 'b',
        hook: 'drag',
        specimenSeed: 1266,
        isSeal: false,
      }}
      arrivalText="A small pie. Two slices. Not enough."
      prompt="Zero-sum thinking is for amateurs. Do not fight over the scraps. Bake a bigger pie. Collaboration multiplies the resource."
      resonantText="Abundance mindset. You did not fight for a bigger slice. You grew the whole pie. Cooperative logic understands that one plus one can be three. The treaty is the recipe."
      afterglowCoda="Bake a bigger pie."
      onComplete={onComplete}
    >
      {(verse) => <TreatyInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function TreatyInteraction({ verse }: { verse: any }) {
  const [scale, setScale] = useState(0.4); // 0.4 = small, 1 = full
  const [done, setDone] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const W = 240, H = 200;
  const CX = W / 2, CY = H / 2;
  const maxR = 75;
  const r = maxR * scale;

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (done) return;
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [done]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current || done) return;
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dx = e.clientX - rect.left - CX;
    const dy = e.clientY - rect.top - CY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const newScale = Math.max(0.4, Math.min(1, dist / maxR));
    setScale(newScale);
  }, [done]);

  const handlePointerUp = useCallback(() => {
    dragging.current = false;
    if (scale > 0.85) {
      setScale(1);
      setDone(true);
      setTimeout(() => verse.advance(), 3000);
    }
  }, [scale, verse]);

  // Slice sizes (proportional to total)
  const mySlice = r * 0.9;
  const theirSlice = r * 0.9;

  return (
    <div style={navicueStyles.interactionContainer(16)}>
      {/* Size readout */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'baseline' }}>
        <span style={{ ...navicueType.micro, color: verse.palette.textFaint }}>pie size</span>
        <motion.span style={{
          ...navicueType.data,
          color: done ? verse.palette.accent : verse.palette.text,
        }}>
          {done ? 'abundance' : `${Math.round(scale * 100)}%`}
        </motion.span>
      </div>

      <div style={{
        ...navicueInteraction.tapZone,
        width: W, height: H,
        cursor: done ? 'default' : 'grab',
        touchAction: 'none',
      }}>
        <svg ref={svgRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Pie circle */}
          <motion.circle
            cx={CX} cy={CY} fill={verse.palette.primary}
            animate={{ r, opacity: safeOpacity(0.06) }}
            transition={{ duration: 0.05 }}
          />
          <motion.circle
            cx={CX} cy={CY} fill="none"
            stroke={verse.palette.primary}
            strokeWidth={1}
            animate={{ r, opacity: safeOpacity(0.15) }}
            transition={{ duration: 0.05 }}
          />

          {/* Divider line */}
          <motion.line
            x1={CX} y1={CY - r} x2={CX} y2={CY + r}
            stroke={verse.palette.primary}
            strokeWidth={0.5}
            animate={{ opacity: safeOpacity(0.15) }}
          />

          {/* My slice (left half) */}
          <motion.path
            fill={verse.palette.accent}
            animate={{
              d: `M ${CX},${CY} L ${CX},${CY - r} A ${r},${r} 0 0,0 ${CX},${CY + r} Z`,
              opacity: safeOpacity(0.12),
            }}
            transition={{ duration: 0.05 }}
          />

          {/* Their slice (right half) */}
          <motion.path
            fill={verse.palette.primary}
            animate={{
              d: `M ${CX},${CY} L ${CX},${CY - r} A ${r},${r} 0 0,1 ${CX},${CY + r} Z`,
              opacity: safeOpacity(0.08),
            }}
            transition={{ duration: 0.05 }}
          />

          {/* Slice labels */}
          <motion.text
            y={CY + 4} textAnchor="middle"
            fill={verse.palette.accent} style={navicueType.micro}
            animate={{ x: CX - r / 2, opacity: r > 35 ? 0.5 : 0 }}
          >
            mine
          </motion.text>
          <motion.text
            y={CY + 4} textAnchor="middle"
            fill={verse.palette.textFaint} style={navicueType.micro}
            animate={{ x: CX + r / 2, opacity: r > 35 ? 0.4 : 0 }}
          >
            theirs
          </motion.text>

          {/* Expand arrows (hint) */}
          {!done && scale < 0.85 && (
            <motion.g
              animate={{ opacity: [0.1, 0.25, 0.1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              {[0, 90, 180, 270].map(angle => {
                const rad = angle * Math.PI / 180;
                const x1 = CX + (r + 8) * Math.cos(rad);
                const y1 = CY + (r + 8) * Math.sin(rad);
                const x2 = CX + (r + 18) * Math.cos(rad);
                const y2 = CY + (r + 18) * Math.sin(rad);
                return (
                  <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={verse.palette.textFaint} strokeWidth={1} />
                );
              })}
            </motion.g>
          )}

          {/* Win-Win label */}
          {done && (
            <motion.text
              x={CX} y={CY + r + 25}
              textAnchor="middle"
              fill={verse.palette.accent}
              style={navicueType.choice}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.5 }}
            >
              win-win
            </motion.text>
          )}
        </svg>
      </div>

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'both slices grew'
          : 'drag outward to expand the pie'}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          cooperative logic
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'abundance mindset' : 'grow the pie'}
      </div>
    </div>
  );
}
