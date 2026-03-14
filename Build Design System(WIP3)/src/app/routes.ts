import { createBrowserRouter } from 'react-router';
import { NavShell } from './components/design-system/NavShell';
import { SanctuaryPage } from './pages/SanctuaryPage';
import { DoctrinePage } from './pages/DoctrinePage';
import { GovernorsPage } from './pages/GovernorsPage';
import { CompatibilityPage } from './pages/CompatibilityPage';
import { TokensPage } from './pages/TokensPage';
import { SurfacesPage } from './pages/SurfacesPage';
import { TypographyPage } from './pages/TypographyPage';
import { CopyPage } from './pages/CopyPage';
import { MotionPage } from './pages/MotionPage';
import { RoomsPage } from './pages/RoomsPage';
import { BasePage } from './pages/BasePage';
import { ComponentsPage } from './pages/ComponentsPage';
import { AtomsPage } from './pages/AtomsPage';
import { SyncPage } from './pages/SyncPage';
import { VoicePage } from './pages/VoicePage';
import { FormPage } from './pages/FormPage';
import { CuesPage } from './pages/CuesPage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: NavShell,
    children: [
      // PHILOSOPHY
      { index: true, Component: SanctuaryPage },
      { path: 'doctrine', Component: DoctrinePage },
      // SYSTEM
      { path: 'governors', Component: GovernorsPage },
      { path: 'compatibility', Component: CompatibilityPage },
      // LANGUAGE
      { path: 'tokens', Component: TokensPage },
      { path: 'surfaces', Component: SurfacesPage },
      { path: 'typography', Component: TypographyPage },
      { path: 'copy', Component: CopyPage },
      { path: 'motion', Component: MotionPage },
      // EXPERIENCE
      { path: 'base', Component: BasePage },
      { path: 'components', Component: ComponentsPage },
      { path: 'atoms', Component: AtomsPage },
      { path: 'rooms', Component: RoomsPage },
      { path: 'voice', Component: VoicePage },
      { path: 'cues', Component: CuesPage },
      { path: 'form', Component: FormPage },
      // LEGACY (accessible but not in nav)
      { path: 'sync', Component: SyncPage },
    ],
  },
]);