import React, { useState, useEffect } from 'react';
import { 
  Search, 
  X, 
  Sparkles, 
  Play, 
  Eye, 
  Rocket, 
  FileCode, 
  Sun, 
  Moon, 
  Terminal, 
  BookOpen,
  ArrowRight
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useTheme } from '../../context/ThemeContext';
import { useAI } from '../../context/AIContext';
import { useRuntime } from '../../context/RuntimeContext';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDeployModal: () => void;
  onOpenSettingsModal: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onOpenDeployModal,
  onOpenSettingsModal
}) => {
  const { toggleTheme } = useTheme();
  const { sendMessage, startAgentRun } = useAI();
  const { startDevServer, refreshPreview, setActiveBottomTab } = useRuntime();
  const { openTabs, setActiveTabId } = useProject();

  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands = [
    { id: 'run-dev', label: 'Start Development Server', icon: <Play className="w-4 h-4 text-emerald-400" />, action: () => { startDevServer(); onClose(); } },
    { id: 'open-preview', label: 'Refresh & Open Live Preview', icon: <Eye className="w-4 h-4 text-blue-400" />, action: () => { refreshPreview(); onClose(); } },
    { id: 'deploy-app', label: 'Deploy Application to Cloud', icon: <Rocket className="w-4 h-4 text-indigo-400" />, action: () => { onClose(); onOpenDeployModal(); } },
    { id: 'toggle-theme', label: 'Toggle Dark / Light Theme', icon: <Sun className="w-4 h-4 text-amber-400" />, action: () => { toggleTheme(); onClose(); } },
    { id: 'ask-infinity', label: 'Ask Infinity: Fix Current Errors', icon: <Sparkles className="w-4 h-4 text-purple-400" />, action: () => { sendMessage('Diagnose and repair any errors'); onClose(); } },
    { id: 'open-terminal', label: 'Focus Terminal Console', icon: <Terminal className="w-4 h-4 text-slate-400" />, action: () => { setActiveBottomTab('terminal'); onClose(); } },
    { id: 'open-settings', label: 'Open Preferences & Settings', icon: <X className="w-4 h-4 text-slate-400" />, action: () => { onClose(); onOpenSettingsModal(); } },
  ];

  const filtered = commands.filter(c => c.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 p-4 bg-black/70 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-xl bg-[#0e1320] dark:bg-[#0e1320] light:bg-white rounded-3xl border border-slate-800 dark:border-slate-800 light:border-slate-300 shadow-2xl overflow-hidden flex flex-col">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 flex items-center space-x-3">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or ask Infinity..."
            autoFocus
            className="w-full bg-transparent border-none outline-none text-white dark:text-white light:text-slate-900 placeholder-slate-500 text-sm focus:ring-0 p-0"
          />
          <kbd className="px-2 py-0.5 text-[10px] font-mono bg-slate-800 rounded border border-slate-700 text-slate-400">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
          {filtered.map((cmd) => (
            <button
              key={cmd.id}
              onClick={cmd.action}
              className="w-full p-2.5 rounded-xl hover:bg-indigo-600/15 text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white flex items-center justify-between text-xs transition-colors group"
            >
              <div className="flex items-center space-x-3">
                <span className="p-1 rounded-lg bg-slate-800/80 group-hover:bg-indigo-500/20">{cmd.icon}</span>
                <span className="font-medium">{cmd.label}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 transition-colors" />
            </button>
          ))}

          {filtered.length === 0 && (
            <div className="p-4 text-center text-slate-500 text-xs">
              No matching commands found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
