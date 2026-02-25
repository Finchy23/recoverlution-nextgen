/**
 * FIELD ARCHITECT #9 -- 1109. The Domain (The Aura)
 * "You set the atmosphere. Expand your field."
 * INTERACTION: Drag to expand a blue safe-zone circle around your avatar -- covers the room
 * STEALTH KBE: Agency -- environmental control (B)
 *
 * COMPOSITOR: witness_ritual / Stellar / night / believing / drag / 1109
 */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NaviCueVerse } from '../NaviCueVerse';
import { navicueType, navicueStyles, immersiveTapButton } from '@/app/design-system/navicue-blueprint';

interface Props { data?: any; onComplete?: () => void; }

export default function FieldArchitect_Domain({ onComplete }: Props) {
  return (
    <NaviCueVerse
      compositorInput={{
        signature: 'witness_ritual',
        form: 'Stellar',
        chrono: 'night',
        kbe: 'b',
        hook: 'drag',
        specimenSeed: 1109,
        isSeal: false,
      }}
      arrivalText="A small circle. Your space."
      prompt="You set the atmosphere. Do not let the room change you. You change the room. Expand your field."
      resonantText="Agency. You expanded outward. Everything that entered your field took on your color. You did not adapt to the room. The room adapted to you."
      afterglowCoda="Your field."
      onComplete={onComplete}
    >
      {(verse) => <DomainInteraction verse={verse} />}
    </NaviCueVerse>
  );
}

function DomainInteraction({ verse }: { verse: any }) {
  const [radius, setRadius] = useState(20);
  const [expanded, setExpanded] = useState(false);
  const ROOM_RADIUS = 85;
  const TARGET_RADIUS = 80;

  // Hostile dots in the room
  const hostileDots = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const r = 40 + (i * 7) % 30;
    return {
      id: i,
      x: 90 + Math.cos(angle) * r,
      y: 90 + Math.sin(angle) * r,
    };
  });

  const handleDrag = useCallback((_: any, info: any) => {
    if (expanded) return;
    // Dragging outward expands radius
    const delta = Math.sqrt(info.delta.x ** 2 + info.delta.y ** 2) * 0.3;
    setRadius(prev => {
      const next = Math.min(TARGET_RADIUS + 5, prev + delta);
      if (next >= TARGET_RADIUS && !expanded) {
        setExpanded(true);
        setTimeout(() => verse.advance(), 2200);
      }
      return next;
    });
  }, [expanded, verse]);

  useEffect(() => {
    if (expanded) setRadius(ROOM_RADIUS);
  }, [expanded]);

  return (
    <div style={navicueStyles.interactionContainer()}>
      <div style={navicueStyles.heroCssScene(verse.palette, 180 / 180)}>
        {/* Room */}
        <div style={{ position: 'relative', width: 180, height: 180 }}>
          {/* Room boundary */}
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: ROOM_RADIUS * 2, height: ROOM_RADIUS * 2,
            borderRadius: '50%',
            border: `1px solid ${verse.palette.primaryGlow}`,
            opacity: 0.15,
            transform: 'translate(-50%, -50%)',
          }} />

          {/* Domain circle */}
          <motion.div
            animate={{
              width: radius * 2,
              height: radius * 2,
              opacity: expanded ? 0.3 : 0.2,
            }}
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${verse.palette.accent}, transparent)`,
              border: `1px solid ${verse.palette.accent}`,
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* Hostile dots */}
          {hostileDots.map(dot => {
            const dx = dot.x - 90;
            const dy = dot.y - 90;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const inField = dist < radius;
            return (
              <motion.div
                key={dot.id}
                animate={{
                  background: inField
                    ? verse.palette.accent
                    : 'hsla(0, 40%, 50%, 0.5)',
                  scale: inField ? [1, 1.2, 1] : 1,
                }}
                transition={inField ? { duration: 0.5 } : {}}
                style={{
                  position: 'absolute',
                  left: dot.x - 3, top: dot.y - 3,
                  width: 6, height: 6, borderRadius: '50%',
                }}
              />
            );
          })}

          {/* Center avatar */}
          <div style={{
            position: 'absolute',
            top: '50%', left: '50%',
            width: 10, height: 10, borderRadius: '50%',
            background: verse.palette.accent,
            transform: 'translate(-50%, -50%)',
            opacity: 0.8,
            zIndex: 2,
          }} />

          {/* Drag handle */}
          {!expanded && (
            <motion.div
              drag
              dragConstraints={{ top: -60, bottom: 60, left: -60, right: 60 }}
              dragElastic={0.05}
              dragMomentum={false}
              onDrag={handleDrag}
              style={{
                position: 'absolute',
                top: '50%', left: `${50 + (radius / 180) * 40}%`,
                width: 20, height: 20, borderRadius: '50%',
                border: `1px solid ${verse.palette.accent}`,
                transform: 'translate(-50%, -50%)',
                cursor: 'grab',
                touchAction: 'none',
                opacity: 0.5,
                zIndex: 3,
              }}
            />
          )}
        </div>

        {/* Status */}
        {expanded ? (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{ ...navicueType.hint, color: verse.palette.accent, fontSize: 11 }}
            >
              room changed
            </motion.div>
          </AnimatePresence>
        ) : (
          <span style={{ ...navicueType.hint, color: verse.palette.textFaint, fontSize: 11, opacity: 0.5 }}>
            drag to expand
          </span>
        )}

        <div style={navicueStyles.kbeLabel(verse.palette)}>
          {expanded ? 'environmental control' : `field: ${Math.round((radius / ROOM_RADIUS) * 100)}%`}
        </div>
      </div>
    </div>
  );
}