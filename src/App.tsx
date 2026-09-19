import React, { useState } from 'react';
import { SkyProvider } from './context/SkyContext';
import { SkyCanvas } from './components/sky/SkyCanvas';
import { HeaderStats } from './components/ui/HeaderStats';
import { AddMenu } from './components/ui/AddMenu';
import { BottomBar } from './components/ui/BottomBar';
import { ProfileModal } from './components/modals/ProfileModal';
import { WishStudioModal } from './components/modals/WishStudioModal';
import { WishCardModal } from './components/modals/WishCardModal';
import { MoonMessageModal } from './components/modals/MoonMessageModal';
import { PlanetDesignerModal } from './components/modals/PlanetDesignerModal';
import { StoryStudioModal } from './components/modals/StoryStudioModal';
import { StoryViewerModal } from './components/modals/StoryViewerModal';
import { NebulaWordModal } from './components/modals/NebulaWordModal';
import { VoiceProbeModal } from './components/modals/VoiceProbeModal';
import { SecretStarModal } from './components/modals/SecretStarModal';
import { BlackHoleModal } from './components/modals/BlackHoleModal';
import { PlanetDesign } from './types/celestial';

const AppContent: React.FC = () => {
  const [stagedPlanetDesign, setStagedPlanetDesign] = useState<PlanetDesign | null>(null);

  return (
    <div className="birthday-sky-app">
      {/* Header Stats with Create Profile in top right */}
      <HeaderStats />

      {/* Main Interactive Universe Canvas */}
      <SkyCanvas />

      {/* Floating '+' Action Menu */}
      <AddMenu />

      {/* Bottom-Left Minimal Unopened Counter */}
      <BottomBar />

      {/* Modals & Dialogs */}
      <ProfileModal />
      <WishStudioModal />
      <WishCardModal />
      <MoonMessageModal />
      <PlanetDesignerModal onCompleteDesign={(design) => setStagedPlanetDesign(design)} />
      <StoryStudioModal initialPlanetDesign={stagedPlanetDesign} onSubmitted={() => setStagedPlanetDesign(null)} />
      <StoryViewerModal />
      <NebulaWordModal />
      <VoiceProbeModal />
      <SecretStarModal />
      <BlackHoleModal />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <SkyProvider>
      <AppContent />
    </SkyProvider>
  );
};

export default App;
