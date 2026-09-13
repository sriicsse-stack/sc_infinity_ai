import React, { useState } from 'react';
import { 
  Play, 
  Eye, 
  Rocket, 
  Search, 
  Sun, 
  Moon, 
  Settings, 
  Bell, 
  ChevronDown, 
  Check, 
  Sparkles, 
  Layers, 
  LogIn, 
  LogOut, 
  User as UserIcon, 
  CreditCard, 
  GraduationCap, 
  Zap, 
  Terminal as TerminalIcon,
  Key
} from 'lucide-react';
import { AnimatedInfinity } from '../common/AnimatedInfinity';
import { useTheme } from '../../context/ThemeContext';
import { useProject } from '../../context/ProjectContext';
import { useAI } from '../../context/AIContext';
import { useRuntime } from '../../context/RuntimeContext';
import { useAuth } from '../../context/AuthContext';
import { useCredits } from '../../context/CreditsContext';
import { AIModelType, ActiveActivityTab } from '../../types';
import { MenuBar } from './MenuBar';

interface TopHeaderProps {
  onOpenCommandPalette: () => void;
  onOpenDeployModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenPricingModal: () => void;
  onOpenApiKeyModal?: () => void;
  onToggleHomeView: () => void;
  isHomeViewActive: boolean;
  onEnsureBottomPanelVisible?: () => void;
  onToggleTerminal?: () => void;
  isBottomPanelVisible?: boolean;
  onSelectActivityTab?: (tab: ActiveActivityTab) => void;
  onOpenProjectCreationModal?: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  onOpenCommandPalette,
  onOpenDeployModal,
  onOpenSettingsModal,
  onOpenPricingModal,
  onOpenApiKeyModal,
  onToggleHomeView,
  isHomeViewActive,
  onEnsureBottomPanelVisible,
  onToggleTerminal,
  isBottomPanelVisible,
  onSelectActivityTab,
  onOpenProjectCreationModal
}) => {
  const { theme, toggleTheme } = useTheme();
  const { currentProject, projects, setCurrentProject, activeTab, openTabs } = useProject();
  const { model, setModel, infinityState, setInfinityState, geminiApiKey } = useAI();
  const { isRunning, executeActiveCode, refreshPreview, setActiveBottomTab } = useRuntime();
  const { user, signInWithGoogle, signOut } = useAuth();
  const { currentPlan, creditsRemaining } = useCredits();

  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isProjectDropdownOpen, setIsProjectDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);

  const models: { id: AIModelType; name: string; tag: string }[] = [
    { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', tag: 'Fast & Deep Reasoning' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', tag: 'Ultra-low Latency' },
    { id: 'gemini-pro', name: 'Gemini Pro 1.0', tag: 'Standard' }
  ];

  const handleRunClick = async () => {
    if (onEnsureBottomPanelVisible) {
      onEnsureBottomPanelVisible();
    }
    setActiveBottomTab('terminal');

    const targetTab = activeTab || (openTabs && openTabs.length > 0 ? openTabs[0] : null);
    const codeToRun = targetTab ? (targetTab.content ?? '') : '';
    const filename = targetTab ? targetTab.name : 'script.js';
    const language = targetTab ? targetTab.language : (filename.endsWith('.py') ? 'python' : filename.endsWith('.java') ? 'java' : filename.endsWith('.cpp') ? 'cpp' : 'javascript');

    setIsExecuting(true);
    setInfinityState('building');
    await executeActiveCode(codeToRun, filename, language);
    setIsExecuting(false);
    setInfinityState('success');
    refreshPreview();
    setTimeout(() => setInfinityState('idle'), 2000);
  };

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      setIsProfileDropdownOpen(false);
    } catch (e) {}
  };

  return (
    <header className="h-12 border-b border-[#1f293d] dark:border-[#1f293d] light:border-slate-200 bg-[#080a10] dark:bg-[#080a10] light:bg-white px-3 flex items-center justify-between text-xs z-30 select-none">
      {/* Left: Branding & VS Code-style MenuBar */}
      <div className="flex items-center space-x-2">
        <button 
          onClick={onToggleHomeView}
          className="flex items-center space-x-2 px-2 py-1 -ml-1 rounded-lg hover:bg-slate-800/40 transition-colors cursor-pointer group"
          title="Toggle Home / Workspace"
        >
          <AnimatedInfinity state={infinityState} size="sm" />
          <div className="flex flex-col text-left hidden lg:flex">
            <span className="font-bold tracking-tight text-white dark:text-white light:text-slate-900 text-[12px] leading-tight flex items-center space-x-1">
              <span>SC INFINITY</span>
            </span>
          </div>
        </button>

        {/* VS Code Menu Bar (File, Edit, Selection, View, Go, Run, Terminal, Help) */}
        <MenuBar
          onOpenCommandPalette={onOpenCommandPalette}
          onOpenDeployModal={onOpenDeployModal}
          onOpenSettingsModal={onOpenSettingsModal}
          onOpenPricingModal={onOpenPricingModal}
          onToggleHomeView={onToggleHomeView}
          onToggleTerminal={onToggleTerminal}
          onEnsureBottomPanelVisible={onEnsureBottomPanelVisible}
          isBottomPanelVisible={isBottomPanelVisible}
          onSelectActivityTab={onSelectActivityTab}
          onOpenProjectCreationModal={onOpenProjectCreationModal}
        />

        {/* Project Selector */}
        <div className="relative ml-1 hidden xl:block">
          <button
            onClick={() => setIsProjectDropdownOpen(!isProjectDropdownOpen)}
            className="flex items-center space-x-1.5 px-2 py-1 rounded-md bg-[#121826] dark:bg-[#121826] light:bg-slate-100 border border-slate-700/60 dark:border-slate-800 light:border-slate-300 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white hover:border-indigo-500/50 transition-colors text-[11px]"
          >
            <Layers className="w-3 h-3 text-indigo-400" />
            <span className="font-medium max-w-[100px] truncate">{currentProject.name}</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {isProjectDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-56 bg-[#0e1320] dark:bg-[#0e1320] light:bg-white rounded-xl border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-2xl py-1 z-50">
              <div className="px-3 py-1.5 text-[10px] uppercase tracking-wider text-slate-500 font-semibold border-b border-slate-800/60">
                Switch Project
              </div>
              {projects.map((proj) => (
                <button
                  key={proj.id}
                  onClick={() => {
                    setCurrentProject(proj);
                    setIsProjectDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-indigo-600/10 hover:text-indigo-400 transition-colors ${
                    proj.id === currentProject.id ? 'text-indigo-400 bg-indigo-500/5' : 'text-slate-300 dark:text-slate-300 light:text-slate-700'
                  }`}
                >
                  <div className="flex flex-col truncate">
                    <span className="font-medium">{proj.name}</span>
                    <span className="text-[10px] text-slate-500">{proj.technology}</span>
                  </div>
                  {proj.id === currentProject.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Center: Global Search & Command Palette */}
      <div className="flex-1 max-w-xl mx-4">
        <button
          onClick={onOpenCommandPalette}
          className="w-full flex items-center justify-between px-3.5 py-1.5 rounded-lg bg-[#0e1320]/90 dark:bg-[#0e1320]/90 light:bg-slate-100/90 border border-slate-800/80 dark:border-slate-800/80 light:border-slate-300 text-slate-400 dark:text-slate-400 light:text-slate-500 hover:border-indigo-500/50 hover:text-slate-200 transition-all group"
        >
          <div className="flex items-center space-x-2 truncate">
            <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 transition-colors" />
            <span className="text-[12px] truncate">Search files, commands or ask Infinity...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-800/60 dark:bg-slate-800/60 light:bg-slate-200 rounded border border-slate-700/50 dark:border-slate-700/50 light:border-slate-300 text-slate-400">
            Ctrl + K
          </kbd>
        </button>
      </div>

      {/* Right: Actions, AI Status, Pricing/Credits, Theme, Profile */}
      <div className="flex items-center space-x-2">
        {/* Pricing / Credits Button */}
        <button
          onClick={onOpenPricingModal}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-indigo-900/50 to-violet-900/50 hover:from-indigo-800/60 hover:to-violet-800/60 border border-indigo-500/30 text-indigo-200 font-medium transition-all cursor-pointer"
          title="Manage Infinity Plan & AI Credits"
        >
          {currentPlan === 'student' ? (
            <GraduationCap className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Zap className="w-3.5 h-3.5 text-amber-400" />
          )}
          <span className="font-semibold capitalize text-[11px]">{currentPlan}</span>
          <span className="text-[10px] opacity-75 font-mono">({creditsRemaining})</span>
        </button>

        {/* Gemini API Key Connection Button */}
        {onOpenApiKeyModal && (
          <button
            onClick={onOpenApiKeyModal}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border transition-all cursor-pointer text-[11px] font-medium ${
              geminiApiKey
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40'
                : 'bg-amber-950/30 border-amber-500/40 text-amber-300 hover:bg-amber-900/40 animate-pulse'
            }`}
            title={geminiApiKey ? "Gemini API Key Connected (Click to modify)" : "Connect Free Gemini API Key"}
          >
            <Key className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">{geminiApiKey ? 'Key Connected' : 'Connect Key'}</span>
          </button>
        )}

        {/* Gemini AI Model Selector */}
        <div className="relative">
          <button
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="flex items-center space-x-1.5 px-2 py-1 rounded-lg bg-indigo-950/40 dark:bg-indigo-950/40 light:bg-indigo-50 border border-indigo-500/30 text-indigo-300 hover:bg-indigo-900/40 transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <Sparkles className="w-3 h-3 text-indigo-400" />
            <span className="font-semibold text-[11px]">Gemini AI</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </button>

          {isModelDropdownOpen && (
            <div className="absolute top-full right-0 mt-1 w-64 bg-[#0e1320] dark:bg-[#0e1320] light:bg-white rounded-xl border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-2xl py-1.5 z-50">
              <div className="px-3 py-1 text-[10px] uppercase tracking-wider text-slate-500 font-semibold">
                Select AI Engine
              </div>
              {models.map((m) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setModel(m.id);
                    setIsModelDropdownOpen(false);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center justify-between hover:bg-indigo-600/10 transition-colors ${
                    model === m.id ? 'text-indigo-400 font-medium' : 'text-slate-300 dark:text-slate-300 light:text-slate-700'
                  }`}
                >
                  <div>
                    <div className="text-xs">{m.name}</div>
                    <div className="text-[10px] text-slate-500">{m.tag}</div>
                  </div>
                  {model === m.id && <Check className="w-4 h-4 text-indigo-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Working Run Button (Executes Active Code in Python, JS, Java, C++) */}
        <button
          onClick={handleRunClick}
          disabled={isExecuting}
          className="flex items-center space-x-1.5 px-3.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-md shadow-emerald-900/30 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
          title={`Run ${activeTab?.name || 'Code'}`}
        >
          <Play className="w-3.5 h-3.5 fill-white text-white" />
          <span>{isExecuting ? 'Running...' : 'Run'}</span>
        </button>

        {/* Terminal Toggle Button */}
        {onToggleTerminal && (
          <button
            onClick={onToggleTerminal}
            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
              isBottomPanelVisible 
                ? 'bg-indigo-600/20 border-indigo-500/50 text-indigo-300 shadow-xs' 
                : 'bg-[#121826] border-slate-700/60 text-slate-400 hover:text-white'
            }`}
            title={isBottomPanelVisible ? "Hide Terminal Panel" : "Show Terminal Panel"}
          >
            <TerminalIcon className="w-4 h-4" />
          </button>
        )}

        {/* Preview Button */}
        <button
          onClick={refreshPreview}
          className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-[#121826] dark:bg-[#121826] light:bg-slate-100 border border-slate-700/60 dark:border-slate-800 light:border-slate-300 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-800/80 hover:text-white transition-colors"
        >
          <Eye className="w-3 h-3 text-slate-400" />
          <span>Preview</span>
        </button>

        {/* Deploy Button */}
        <button
          onClick={onOpenDeployModal}
          className="flex items-center space-x-1.5 px-3.5 py-1 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium shadow-md shadow-indigo-600/30 transition-all transform active:scale-95 cursor-pointer"
        >
          <Rocket className="w-3 h-3" />
          <span>Deploy</span>
        </button>

        <div className="h-4 w-[1px] bg-slate-800 dark:bg-slate-800 light:bg-slate-300 mx-1" />

        {/* Theme Switch */}
        <button
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-slate-800/60 dark:hover:bg-slate-800/60 light:hover:bg-slate-200 transition-colors"
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
        </button>

        {/* Settings */}
        <button
          onClick={onOpenSettingsModal}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-slate-800/60 dark:hover:bg-slate-800/60 light:hover:bg-slate-200 transition-colors"
          title="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button
          className="p-1.5 rounded-lg text-slate-400 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-slate-800/60 dark:hover:bg-slate-800/60 light:hover:bg-slate-200 transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-indigo-500 rounded-full" />
        </button>

        {/* User Profile & Real Firebase Google Sign-In */}
        <div className="relative">
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center space-x-1.5 pl-1.5 pr-2 py-1 rounded-full bg-[#121826] dark:bg-[#121826] light:bg-slate-100 border border-slate-700/60 dark:border-slate-800 light:border-slate-300 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white transition-colors"
          >
            {user?.photoURL ? (
              <img src={user.photoURL} alt={user.displayName || 'User'} className="w-5 h-5 rounded-full object-cover" />
            ) : (
              <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-[10px]">
                {user?.displayName ? user.displayName[0].toUpperCase() : 'S'}
              </div>
            )}
            <span className="font-medium text-[11px] max-w-[80px] truncate">{user?.displayName || 'Student'}</span>
          </button>

          {isProfileDropdownOpen && (
            <div className="absolute top-full right-0 mt-1 w-56 bg-[#0e1320] dark:bg-[#0e1320] light:bg-white rounded-xl border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-2xl py-1 z-50">
              <div className="px-3 py-2 border-b border-slate-800/60">
                <div className="font-semibold text-white dark:text-white light:text-slate-900 truncate">
                  {user ? user.displayName : 'Guest User'}
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {user ? user.email : 'Not signed in'}
                </div>
              </div>

              {/* Pricing & Credits Menu Item */}
              <button
                onClick={() => {
                  setIsProfileDropdownOpen(false);
                  onOpenPricingModal();
                }}
                className="w-full px-3 py-2 text-left text-xs text-indigo-400 hover:bg-indigo-600/10 flex items-center space-x-2 font-medium"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Plans & Infinity Credits</span>
              </button>

              {/* Gemini API Key Menu Item */}
              {onOpenApiKeyModal && (
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    onOpenApiKeyModal();
                  }}
                  className="w-full px-3 py-2 text-left text-xs text-amber-400 hover:bg-amber-600/10 flex items-center space-x-2 font-medium"
                >
                  <Key className="w-3.5 h-3.5" />
                  <span>{geminiApiKey ? 'Modify Gemini API Key' : 'Connect Gemini API Key (Free)'}</span>
                </button>
              )}

              {!user ? (
                <button 
                  onClick={handleGoogleLogin} 
                  className="w-full px-3 py-2 text-left text-xs text-indigo-300 hover:bg-indigo-600/10 flex items-center space-x-2 font-medium"
                >
                  <span className="text-red-400 font-bold">G</span>
                  <span>Sign in with Google</span>
                </button>
              ) : (
                <button 
                  onClick={() => { signOut(); setIsProfileDropdownOpen(false); }} 
                  className="w-full px-3 py-2 text-left text-xs text-rose-400 hover:bg-rose-600/10 flex items-center space-x-2 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              )}

              <button 
                onClick={onToggleHomeView} 
                className="w-full px-3 py-1.5 text-left text-xs text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-slate-800/50 flex items-center space-x-2 border-t border-slate-800/40"
              >
                <span>{isHomeViewActive ? 'Open Workspace' : 'Welcome Home Screen'}</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
