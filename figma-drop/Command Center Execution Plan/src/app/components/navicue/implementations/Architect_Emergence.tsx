/**
 * ARCHITECT #7 -- 1327. The Emergence
 * "Complexity emerges from simple rules. Set the rules. Watch the order arise."
 * INTERACTION: Tap to set 3 rules -- boids flock into complex formation
 * STEALTH KBE: Trust -- Self-Organizing Systems (B)
 *
 * COMPOSITOR: sacred_ordinary / Drift / morning / believing / tap / 1327
 */
import { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import {
  navicueType,
  navicueStyles,
  immersiveTapButton,
  safeOpacity,
} from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

const RULES = ['avoid collisions', 'align direction', 'stay together'];

export default function Architect_Emergence({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'sacred_ordinary',
        form: 'Drift',
        chrono: 'morning',
        kbe: 'b',
        hook: 'tap',
        specimenSeed: 1327,
        isSeal: false,
      }}
      arrivalText="Chaos. No order."
      prompt="Complexity emerges from simple rules. Do not micromanage the flock. Set the rules. Watch the order arise."
      resonantText="Trust. You set three simple rules and a complex pattern emerged. Self-organizing systems prove that order does not require a controller. It requires the right constraints."
      afterglowCoda="Set the rules."
      onComplete={onComplete}
    >
      {(verse) => <EmergenceInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

interface Boid { x: number; y: number; vx: number; vy: number; }

function EmergenceInteraction({ verse }: { verse: any }) {
  const [rulesSet, setRulesSet] = useState(0);
  const [done, setDone] = useState(false);
  const W = 240, H = 160;
  const CX = W / 2, CY = H / 2;
  const NUM_BOIDS = 24;

  const boidsRef = useRef<Boid[]>(
    Array.from({ length: NUM_BOIDS }).map(() => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 3,
      vy: (Math.random() - 0.5) * 3,
    }))
  );
  const [boids, setBoids] = useState<Boid[]>(boidsRef.current);
  const rulesRef = useRef(0);

  useEffect(() => { rulesRef.current = rulesSet; }, [rulesSet]);

  useEffect(() => {
    const interval = setInterval(() => {
      const rules = rulesRef.current;
      const bs = boidsRef.current.map((b, i, arr) => {
        let ax = 0, ay = 0;

        if (rules >= 1) {
          // Separation
          for (const other of arr) {
            if (other === b) continue;
            const dx = b.x - other.x, dy = b.y - other.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 20 && d > 0) { ax += (dx / d) * 0.3; ay += (dy / d) * 0.3; }
          }
        }

        if (rules >= 2) {
          // Alignment
          let avgVx = 0, avgVy = 0, count = 0;
          for (const other of arr) {
            if (other === b) continue;
            const dx = b.x - other.x, dy = b.y - other.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 50) { avgVx += other.vx; avgVy += other.vy; count++; }
          }
          if (count > 0) {
            ax += (avgVx / count - b.vx) * 0.05;
            ay += (avgVy / count - b.vy) * 0.05;
          }
        }

        if (rules >= 3) {
          // Cohesion
          let cx = 0, cy = 0, count = 0;
          for (const other of arr) {
            if (other === b) continue;
            const dx = b.x - other.x, dy = b.y - other.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d < 60) { cx += other.x; cy += other.y; count++; }
          }
          if (count > 0) {
            ax += (cx / count - b.x) * 0.01;
            ay += (cy / count - b.y) * 0.01;
          }
        }

        let vx = b.vx + ax;
        let vy = b.vy + ay;

        // Speed limit
        const speed = Math.sqrt(vx * vx + vy * vy);
        const maxSpeed = rules >= 3 ? 2 : 3;
        if (speed > maxSpeed) { vx = (vx / speed) * maxSpeed; vy = (vy / speed) * maxSpeed; }

        let x = b.x + vx;
        let y = b.y + vy;

        // Wrap edges
        if (x < 0) x += W; if (x > W) x -= W;
        if (y < 0) y += H; if (y > H) y -= H;

        return { x, y, vx, vy };
      });
      boidsRef.current = bs;
      setBoids([...bs]);
    }, 40);
    return () => clearInterval(interval);
  }, []);

  const handleAddRule = () => {
    if (done) return;
    const next = rulesSet + 1;
    setRulesSet(next);
    if (next >= 3) {
      setTimeout(() => {
        setDone(true);
        setTimeout(() => verse.advance(), 3000);
      }, 2500);
    }
  };

  const btn = immersiveTapButton(verse.palette, 'accent');

  return (
    <div style={navicueStyles.interactionContainer(14)}>
      {/* Rules readout */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center' }}>
        {RULES.map((rule, i) => (
          <span key={i} style={{
            ...navicueType.micro,
            color: i < rulesSet ? verse.palette.accent : verse.palette.textFaint,
            opacity: i < rulesSet ? 0.6 : 0.2,
            padding: '2px 6px',
            borderRadius: 4,
            border: `1px solid ${i < rulesSet ? verse.palette.accent : verse.palette.primary}`,
            borderColor: i < rulesSet ? verse.palette.accent : 'transparent',
            borderWidth: i < rulesSet ? 0.5 : 0,
          }}>
            {rule}
          </span>
        ))}
      </div>

      <div style={{ position: 'relative', width: W, height: H }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <rect x={0} y={0} width={W} height={H} rx={6}
            fill={verse.palette.primary} opacity={safeOpacity(0.02)} />

          {boids.map((b, i) => {
            const heading = Math.atan2(b.vy, b.vx);
            return (
              <g key={i} transform={`translate(${b.x}, ${b.y}) rotate(${heading * 180 / Math.PI + 90})`}>
                <polygon
                  points="-2.5,4 0,-5 2.5,4"
                  fill={done ? verse.palette.accent : verse.palette.primary}
                  opacity={safeOpacity(done ? 0.35 : 0.2)}
                />
              </g>
            );
          })}
        </svg>
      </div>

      {rulesSet < 3 && (
        <motion.button style={btn.base} whileTap={btn.active} onClick={handleAddRule}>
          {RULES[rulesSet]}
        </motion.button>
      )}

      <span style={navicueStyles.interactionHint(verse.palette)}>
        {done ? 'three rules. complex order.'
          : rulesSet === 0 ? 'chaos. no rules.'
            : `${rulesSet} rule${rulesSet > 1 ? 's' : ''} set. watch the pattern.`}
      </span>

      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 0.7, y: 0 }}
          transition={{ duration: 1.5, delay: 0.5 }}
          style={{ ...navicueType.hint, color: verse.palette.accent }}>
          self-organizing systems
        </motion.div>
      )}

      <div style={navicueStyles.kbeLabel(verse.palette)}>
        {done ? 'trust' : 'set the rules'}
      </div>
    </div>
  );
}
