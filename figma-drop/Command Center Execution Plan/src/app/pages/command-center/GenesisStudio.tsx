import { motion } from 'motion/react';
import { colors, fonts, radius, surfaces } from '@/design-tokens';
import {
  ATMOSPHERE_LIBRARY,
  BACKGROUND_ENGINES,
  ENTRANCE_PATTERNS,
  GENESIS_CREATIVE_CHARTER,
  GENESIS_DOMAINS,
  GENESIS_GUARDRAILS,
  HERO_PLAYS,
} from '@/app/design-system/navicue-genesis-innovation';
import { GENESIS_AUDIT_BASELINE } from '@/app/data/genesis-audit-baseline';

interface GenesisStudioProps {
  mounted: boolean;
}

export function GenesisStudio({ mounted }: GenesisStudioProps) {
  const total = GENESIS_AUDIT_BASELINE.totalImplementations;

  return (
    <div
      style={{
        maxWidth: '1480px',
        margin: '0 auto',
        padding: '28px 28px 64px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
      }}
    >
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          borderRadius: radius.lg,
          border: `1px solid ${colors.neutral.gray[100]}`,
          background: surfaces.glass.medium,
          padding: '22px',
        }}
      >
        <div style={{ fontFamily: fonts.mono, fontSize: '10px', letterSpacing: '0.08em', color: colors.neutral.gray[500], textTransform: 'uppercase' }}>
          Atlas Genesis Studio
        </div>
        <h2 style={{ marginTop: '8px', fontFamily: fonts.secondary, fontStyle: 'italic', fontWeight: 400, fontSize: '30px', color: colors.neutral.white }}>
          Hero Interaction Innovation Architecture
        </h2>
        <p style={{ marginTop: '10px', maxWidth: '980px', color: colors.neutral.gray[500], fontSize: '14px', lineHeight: 1.55 }}>
          Quarterback layer for next-batch NaviCue evolution. Foundation stays locked (living glass, typography, atmosphere grammar).
          Innovation shifts into entrance materialization, hero interaction physics, and reactive canvas behaviors.
        </p>
        <div style={{ marginTop: '14px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Chip label={`${GENESIS_DOMAINS.length} Domains`} />
          <Chip label={`${HERO_PLAYS.length} Hero Plays`} />
          <Chip label={`${ATMOSPHERE_LIBRARY.length} Atmospheres`} />
          <Chip label={`${BACKGROUND_ENGINES.length} Reactive Background Engines`} />
          <Chip label={`${ENTRANCE_PATTERNS.length} Entrance Patterns`} />
          <Chip label={`Baseline: ${total} implementations`} />
        </div>
      </motion.section>

      <section
        style={{
          borderRadius: radius.lg,
          border: `1px solid ${colors.neutral.gray[100]}`,
          background: surfaces.glass.medium,
          padding: '18px',
        }}
      >
        <h3 style={{ margin: 0, color: colors.neutral.white, fontSize: '16px', fontWeight: 500 }}>
          Creative Charter: Preserve Magic, Expand Freedom
        </h3>
        <p style={{ marginTop: '8px', color: colors.neutral.gray[500], fontSize: '12px', lineHeight: 1.5 }}>
          This is the operating contract for Genesis-tier cues: keep the emotional soul and elegance intact, while widening innovation scope.
        </p>
        <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
          <GuardrailGroup title="Non-Negotiables" items={GENESIS_CREATIVE_CHARTER.nonNegotiables} />
          <GuardrailGroup title="Creative Freedom Zones" items={GENESIS_CREATIVE_CHARTER.freedomZones} />
          <GuardrailGroup title="Anti-Patterns To Avoid" items={GENESIS_CREATIVE_CHARTER.antiPatterns} />
        </div>
        <div
          style={{
            marginTop: '10px',
            borderRadius: radius.sm,
            border: `1px solid ${colors.neutral.gray[100]}`,
            background: 'rgba(0,0,0,0.2)',
            padding: '10px 12px',
            color: colors.neutral.gray[500],
            fontSize: '12px',
            fontStyle: 'italic',
            lineHeight: 1.45,
          }}
        >
          {GENESIS_CREATIVE_CHARTER.northStarQuestion}
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
        {GENESIS_AUDIT_BASELINE.metrics.map(metric => (
          <article
            key={metric.id}
            style={{
              borderRadius: radius.md,
              border: `1px solid ${colors.neutral.gray[100]}`,
              background: surfaces.glass.light,
              padding: '14px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
              <div style={{ color: colors.neutral.gray[500], fontSize: '12px' }}>{metric.label}</div>
              <div style={{ color: colors.neutral.white, fontFamily: fonts.mono, fontSize: '11px' }}>
                {metric.count}/{metric.total}
              </div>
            </div>
            <div
              style={{
                marginTop: '8px',
                width: '100%',
                height: '6px',
                background: 'rgba(255,255,255,0.06)',
                borderRadius: '999px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${Math.min(100, (metric.count / metric.total) * 100)}%`,
                  height: '100%',
                  background: colors.accent.cyan.primary,
                }}
              />
            </div>
            <div style={{ marginTop: '8px', color: colors.neutral.gray[400], fontSize: '11px', lineHeight: 1.45 }}>
              {metric.note}
            </div>
          </article>
        ))}
      </section>

      <section
        style={{
          borderRadius: radius.lg,
          border: `1px solid ${colors.neutral.gray[100]}`,
          background: surfaces.glass.medium,
          padding: '18px',
        }}
      >
        <h3 style={{ margin: 0, color: colors.neutral.white, fontSize: '16px', fontWeight: 500 }}>10-Domain Coverage Signal</h3>
        <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
          {GENESIS_AUDIT_BASELINE.domainSignals.map(signal => (
            <div
              key={signal.id}
              style={{
                borderRadius: radius.sm,
                border: `1px solid ${colors.neutral.gray[100]}`,
                padding: '12px',
                background: 'rgba(0,0,0,0.2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
                <div style={{ color: colors.neutral.white, fontSize: '13px', fontWeight: 500 }}>{signal.title}</div>
                <StatusPill status={signal.status} />
              </div>
              <div style={{ marginTop: '6px', color: colors.neutral.gray[400], fontSize: '11px', lineHeight: 1.45 }}>
                {signal.note}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
        <LibraryBlock title="Hero Play Library" items={HERO_PLAYS.map(play => `${play.title}: ${play.outcome}`)} />
        <LibraryBlock title="Atmosphere Library" items={ATMOSPHERE_LIBRARY.map(item => `${item.title}: ${item.psychology}`)} />
        <LibraryBlock title="Reactive Background Engines" items={BACKGROUND_ENGINES.map(item => `${item.title}: ${item.behavior}`)} />
        <LibraryBlock title="Entrance Materialization" items={ENTRANCE_PATTERNS.map(item => `${item.title}: ${item.mechanism}`)} />
      </section>

      <section
        style={{
          borderRadius: radius.lg,
          border: `1px solid ${colors.neutral.gray[100]}`,
          background: surfaces.glass.medium,
          padding: '18px',
        }}
      >
        <h3 style={{ margin: 0, color: colors.neutral.white, fontSize: '16px', fontWeight: 500 }}>Quarterback Roadmap (4 Sprints)</h3>
        <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
          {GENESIS_AUDIT_BASELINE.roadmap.map(step => (
            <article
              key={step.id}
              style={{
                borderRadius: radius.sm,
                border: `1px solid ${colors.neutral.gray[100]}`,
                padding: '12px',
                background: 'rgba(0,0,0,0.2)',
              }}
            >
              <div style={{ color: colors.neutral.white, fontSize: '13px', fontWeight: 500 }}>{step.title}</div>
              <div style={{ marginTop: '5px', color: colors.neutral.gray[500], fontSize: '12px', lineHeight: 1.45 }}>
                {step.goal}
              </div>
              <ul style={{ margin: '8px 0 0', paddingLeft: '16px', color: colors.neutral.gray[400], fontSize: '11px', lineHeight: 1.45 }}>
                {step.deliverables.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section
        style={{
          borderRadius: radius.lg,
          border: `1px solid ${colors.neutral.gray[100]}`,
          background: surfaces.glass.medium,
          padding: '18px',
        }}
      >
        <h3 style={{ margin: 0, color: colors.neutral.white, fontSize: '16px', fontWeight: 500 }}>Guardrails (Locked Foundation)</h3>
        <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '10px' }}>
          <GuardrailGroup title="Foundation Locks" items={GENESIS_GUARDRAILS.foundationLocks} />
          <GuardrailGroup title="Quality Bar" items={GENESIS_GUARDRAILS.qualityBar} />
          <GuardrailGroup title="Accessibility" items={GENESIS_GUARDRAILS.accessibility} />
          <GuardrailGroup title="Performance / Fallback" items={[...GENESIS_GUARDRAILS.performance, ...GENESIS_GUARDRAILS.fallbackRules]} />
        </div>
      </section>

      {!mounted && (
        <div style={{ color: colors.neutral.gray[400], fontSize: '11px', fontFamily: fonts.mono }}>
          Loading Genesis Studio...
        </div>
      )}
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <div
      style={{
        borderRadius: '999px',
        border: `1px solid ${colors.neutral.gray[100]}`,
        color: colors.neutral.gray[500],
        fontSize: '10px',
        fontFamily: fonts.mono,
        letterSpacing: '0.04em',
        padding: '5px 8px',
        textTransform: 'uppercase',
      }}
    >
      {label}
    </div>
  );
}

function StatusPill({ status }: { status: 'strong' | 'partial' | 'missing' }) {
  const color =
    status === 'strong'
      ? colors.status?.green?.bright ?? '#2FE6A6'
      : status === 'partial'
        ? colors.status?.amber?.bright ?? '#FFC266'
        : colors.status?.red?.bright ?? '#FF7D85';

  return (
    <div
      style={{
        borderRadius: '999px',
        border: `1px solid ${color}`,
        color,
        fontSize: '10px',
        fontFamily: fonts.mono,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
        padding: '2px 8px',
      }}
    >
      {status}
    </div>
  );
}

function LibraryBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <section
      style={{
        borderRadius: radius.md,
        border: `1px solid ${colors.neutral.gray[100]}`,
        background: surfaces.glass.light,
        padding: '14px',
      }}
    >
      <h4 style={{ margin: 0, color: colors.neutral.white, fontSize: '14px', fontWeight: 500 }}>{title}</h4>
      <ul style={{ margin: '8px 0 0', paddingLeft: '16px', color: colors.neutral.gray[400], fontSize: '11px', lineHeight: 1.45 }}>
        {items.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function GuardrailGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <section
      style={{
        borderRadius: radius.sm,
        border: `1px solid ${colors.neutral.gray[100]}`,
        padding: '12px',
        background: 'rgba(0,0,0,0.2)',
      }}
    >
      <div style={{ color: colors.neutral.white, fontSize: '13px', fontWeight: 500 }}>{title}</div>
      <ul style={{ margin: '8px 0 0', paddingLeft: '16px', color: colors.neutral.gray[400], fontSize: '11px', lineHeight: 1.45 }}>
        {items.map(item => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
