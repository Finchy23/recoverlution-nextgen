/**
 * MOTION LAB
 * ══════════
 * Breath & motion workbench.
 * Interactive breath patterns, text materialization demos,
 * receipt ceremony playback, silence architecture timing.
 *
 * DEPENDENCIES:
 *   - MotionBreath (existing section component — rich standalone content)
 *   - dc-tokens (sectionAccents)
 *   - LabShell + DeviceMirror (shared components)
 */

import { useEffect } from 'react';
import { LabShell } from './components/LabShell';
import { useDeviceMirror } from './components/DeviceMirror';
import { MotionBreath } from './MotionBreath';

export default function MotionLab() {
  const { setContent } = useDeviceMirror();

  useEffect(() => {
    setContent({
      copy: 'The pulse everything syncs to.',
      follow: 'Breath is the conductor.',
      accent: `rgba(255, 182, 119, 0.35)`,
      glow: `rgba(255, 182, 119, 0.1)`,
      breathPattern: 'calm',
    });
  }, [setContent]);

  return (
    <LabShell
      eyebrow="motion & breath"
      headline="The pulse everything syncs to"
      subline="4 breath patterns. 5 text modes. 4 ceremonies. The silence architecture."
    >
      <MotionBreath />
    </LabShell>
  );
}
