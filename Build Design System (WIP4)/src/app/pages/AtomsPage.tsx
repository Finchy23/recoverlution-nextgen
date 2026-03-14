/**
 * ATOMS PAGE — The Seed Pack
 *
 * Full-viewport atom library explorer.
 * Shows the 18 representative atoms with live canvas previews.
 */

import { useNavigate } from 'react-router';
import { AtomLibrary } from '../components/atoms/AtomLibrary';
import { room, layer } from '../components/design-system/surface-tokens';

export function AtomsPage() {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: layer.navOverlay, background: room.void }}>
      <AtomLibrary onClose={() => navigate('/')} />
    </div>
  );
}