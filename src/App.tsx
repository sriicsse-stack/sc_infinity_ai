import React, { useState, useEffect } from 'react';
import { TopHeader } from './components/layout/TopHeader';
import { ActivityBar } from './components/layout/ActivityBar';
import { BottomPanel } from './components/layout/BottomPanel';
import { ExplorerView } from './components/views/ExplorerView';
import { EditorView } from './components/views/EditorView';
import { PreviewView } from './components/views/PreviewView';
import { AIPanelView } from './components/views/AIPanelView';
import { HomeView } from './components/views/HomeView';
import { ProjectCreationModal } from './components/views/ProjectCreationModal';
import { AgentProgressModal } from './components/views/AgentProgressModal';
import { DeploymentModal } from './components/views/DeploymentModal';
import { SettingsModal } from './components/views/SettingsModal';
import { PricingModal } from './components/views/PricingModal';
import { SecurityBlockModal } from './components/views/SecurityBlockModal';
import { OnboardingModal } from './components/views/OnboardingModal';
import { CommandPalette } from './components/views/CommandPalette';
import { DatabaseView } from './components/views/DatabaseView';
import { GitView } from './components/views/GitView';
import { SearchView } from './components/views/SearchView';
import { ExtensionsView } from './components/views/ExtensionsView';
import { AITutorView } from './components/views/AITutorView';
import { MarketplaceView } from './components/views/MarketplaceView';
import { ActiveActivityTab } from './types';
import { useRuntime } from './context/RuntimeContext';
import { useProject } from './context/ProjectContext';
import { useCredits } from './context/CreditsContext';
import { useAuth } from './context/AuthContext';
import { Terminal as TerminalIcon, GitBranch, AlertCircle, Radio } from 'lucide-react';

export const App: React.FC = () => {
  const [activeActivityTab, setActiveActivityTab] = useState<ActiveActivityTab>('explorer');
  const [isSidebarVisible, setIsSidebarVisible] = useState<boolean>(true);
  const [isHomeView, setIsHomeView] = useState<boolean>(false);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState<boolean>(false);
  const [isProjectCreationModalOpen, setIsProjectCreationModalOpen] = useState<boolean>(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);
  const [isBottomPanelExpanded, setIsBottomPanelExpanded] = useState<boolean>(false);
  const [isBottomPanelVisible, setIsBottomPanelVisible] = useState<boolean>(true);

  const { refreshPreview, setActiveBottomTab } = useRuntime();
  const { problems, activeTab } = useProject();
  const { isPricingModalOpen, setIsPricingModalOpen, verifyAccountBinding } = useCredits();
  const { user } = useAuth();

  // Validate account on login or state update
  useEffect(() => {
    if (user?.email) {
      verifyAccountBinding(user.email);
    }
  }, [user]);

  const handleToggleTerminal = () => {
    if (!isBottomPanelVisible) {
      setIsBottomPanelVisible(true);
      setActiveBottomTab('terminal');
    } else {
      setIsBottomPanelVisible(false);
    }
  };

  const handleSelectActivityTab = (tab: ActiveActivityTab) => {
    if (tab === 'deployment') {
      setIsDeployModalOpen(true);
    } else if (tab === 'terminal') {
      handleToggleTerminal();
    } else if (activeActivityTab === tab) {
      // Toggle sidebar open/collapsed on same tab click
      setIsSidebarVisible(!isSidebarVisible);
    } else {
      setActiveActivityTab(tab);
      setIsSidebarVisible(true);
    }
  };

  const renderActiveLeftPanel = () => {
    if (!isSidebarVisible) return null;

    switch (activeActivityTab) {
      case 'explorer':
        return <ExplorerView />;
      case 'search':
        return <SearchView />;
      case 'git':
        return <GitView />;
      case 'marketplace':
        return <MarketplaceView />;
      case 'database':
        return <DatabaseView />;
      case 'extensions':
        return <ExtensionsView />;
      case 'tutor':
        return <AITutorView />;
      default:
        return <ExplorerView />;
    }
  };

  return (
    <div className="w-screen h-screen bg-[#080a10] dark:bg-[#080a10] light:bg-slate-100 flex flex-col overflow-hidden text-slate-200 antialiased font-sans">
      {/* Top Header */}
      <TopHeader
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
        onOpenPricingModal={() => setIsPricingModalOpen(true)}
        onToggleHomeView={() => setIsHomeView(!isHomeView)}
        isHomeViewActive={isHomeView}
        onEnsureBottomPanelVisible={() => setIsBottomPanelVisible(true)}
        onToggleTerminal={handleToggleTerminal}
        isBottomPanelVisible={isBottomPanelVisible}
        onSelectActivityTab={handleSelectActivityTab}
        onOpenProjectCreationModal={() => setIsProjectCreationModalOpen(true)}
      />

      {/* Main Workspace Body or Home View */}
      {isHomeView ? (
        <HomeView
          onOpenWorkspace={() => setIsHomeView(false)}
          onOpenNewProjectModal={() => setIsProjectCreationModalOpen(true)}
        />
      ) : (
        <div className="flex-1 flex overflow-hidden">
          {/* Leftmost Activity Bar */}
          <ActivityBar
            activeTab={activeActivityTab}
            onSelectTab={handleSelectActivityTab}
            onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
            onToggleTerminal={handleToggleTerminal}
            isTerminalOpen={isBottomPanelVisible}
          />

          {/* Active Left Panel (Explorer, Search, Git, DB, Extensions, Tutor) */}
          {renderActiveLeftPanel()}

          {/* Center Workspace (Editor + Live Preview + Bottom Terminal) */}
          <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Split: Center Editor & Right-Side Live Preview */}
            <div className="flex-1 flex min-h-0 overflow-hidden">
              <EditorView />
              <PreviewView />
            </div>

            {/* Bottom Terminal / Diagnostics / Problems Panel */}
            {isBottomPanelVisible && (
              <BottomPanel
                isExpanded={isBottomPanelExpanded}
                onToggleExpand={() => setIsBottomPanelExpanded(!isBottomPanelExpanded)}
                onClose={() => setIsBottomPanelVisible(false)}
                onOpenPreview={refreshPreview}
              />
            )}
          </div>

          {/* Right AI Assistant Panel */}
          <AIPanelView />
        </div>
      )}

      {/* Modals & Overlays */}
      <ProjectCreationModal
        isOpen={isProjectCreationModalOpen}
        onClose={() => setIsProjectCreationModalOpen(false)}
        onSuccess={() => setIsProjectCreationModalOpen(false)}
      />

      <AgentProgressModal />

      <DeploymentModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onOpenPricingModal={() => setIsPricingModalOpen(true)}
      />

      <PricingModal
        isOpen={isPricingModalOpen}
        onClose={() => setIsPricingModalOpen(false)}
      />

      {/* Multi-Account Abuse Security Modal */}
      <SecurityBlockModal />

      {/* First-Time User Onboarding & Personalization Modal */}
      <OnboardingModal
        onOpenWorkspace={() => setIsHomeView(false)}
        onOpenPricingModal={() => setIsPricingModalOpen(true)}
      />

      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenDeployModal={() => setIsDeployModalOpen(true)}
        onOpenSettingsModal={() => setIsSettingsModalOpen(true)}
      />

      {/* Status Bar */}
      <footer className="h-6 bg-[#080a10] border-t border-[#1f293d] px-3 flex items-center justify-between text-[11px] text-slate-400 select-none z-20">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1 hover:text-white cursor-pointer">
            <GitBranch className="w-3 h-3 text-indigo-400" />
            <span>main*</span>
          </span>
          <span className="flex items-center space-x-1 hover:text-white cursor-pointer">
            <AlertCircle className="w-3 h-3 text-emerald-400" />
            <span>{problems.length} Problems</span>
          </span>
          <button 
            onClick={handleToggleTerminal}
            className="flex items-center space-x-1 hover:text-white cursor-pointer"
          >
            <TerminalIcon className="w-3 h-3 text-slate-400" />
            <span>Terminal</span>
          </button>
        </div>

        <div className="flex items-center space-x-4">
          <span>UTF-8</span>
          <span className="capitalize">{activeTab?.language || 'JavaScript'}</span>
          <span className="flex items-center space-x-1 text-emerald-400">
            <Radio className="w-3 h-3 animate-pulse" />
            <span>Port 5173</span>
          </span>
        </div>
      </footer>
    </div>
  );
};

export default App;
