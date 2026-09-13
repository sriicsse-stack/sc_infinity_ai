import React from 'react';
import { 
  Files, 
  Search, 
  GitBranch, 
  PlayCircle, 
  Boxes, 
  Database, 
  Rocket, 
  GraduationCap, 
  Settings,
  ShoppingBag,
  Terminal as TerminalIcon
} from 'lucide-react';
import { ActiveActivityTab } from '../../types';

interface ActivityBarProps {
  activeTab: ActiveActivityTab;
  onSelectTab: (tab: ActiveActivityTab) => void;
  onOpenSettingsModal: () => void;
  onToggleTerminal?: () => void;
  isTerminalOpen?: boolean;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenSettingsModal,
  onToggleTerminal,
  isTerminalOpen
}) => {
  const navItems: { id: ActiveActivityTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'explorer', label: 'Explorer', icon: <Files className="w-5 h-5" /> },
    { id: 'search', label: 'Search', icon: <Search className="w-5 h-5" /> },
    { id: 'git', label: 'Source Control & GitHub Push', icon: <GitBranch className="w-5 h-5" /> },
    { id: 'marketplace', label: 'App Marketplace', icon: <ShoppingBag className="w-5 h-5 text-indigo-400" />, badge: 'New' },
    { id: 'terminal', label: 'Terminal / CLI Runner', icon: <TerminalIcon className="w-5 h-5" /> },
    { id: 'debug', label: 'Run & Debug', icon: <PlayCircle className="w-5 h-5" /> },
    { id: 'extensions', label: 'Extensions', icon: <Boxes className="w-5 h-5" /> },
    { id: 'database', label: 'Database', icon: <Database className="w-5 h-5" /> },
    { id: 'deployment', label: 'Deployment', icon: <Rocket className="w-5 h-5" /> },
    { id: 'tutor', label: 'AI Tutor', icon: <GraduationCap className="w-5 h-5" /> },
  ];

  return (
    <aside className="w-12 bg-[#0a0d15] dark:bg-[#0a0d15] light:bg-slate-100 border-r border-[#1f293d] dark:border-[#1f293d] light:border-slate-200 flex flex-col items-center py-2 justify-between select-none z-20">
      {/* Top Nav Items */}
      <div className="flex flex-col items-center space-y-1 w-full">
        {navItems.map((item) => {
          const isActive = item.id === 'terminal' ? isTerminalOpen : activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                if (item.id === 'terminal' && onToggleTerminal) {
                  onToggleTerminal();
                } else {
                  onSelectTab(item.id);
                }
              }}
              className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all group ${
                isActive
                  ? 'text-indigo-400 bg-indigo-500/10 shadow-sm border border-indigo-500/20'
                  : 'text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-slate-200 dark:hover:text-white light:hover:text-slate-900 hover:bg-slate-800/40 dark:hover:bg-slate-800/40 light:hover:bg-slate-200'
              }`}
              title={item.label}
            >
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-[3px] bg-indigo-500 rounded-r-full" />
              )}
              {item.icon}

              {item.badge && (
                <span className="absolute top-1 right-1 px-1 bg-indigo-600 text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-xs uppercase">
                  {item.badge}
                </span>
              )}

              {/* Tooltip */}
              <div className="absolute left-12 ml-2 px-2.5 py-1 bg-slate-900 dark:bg-slate-900 light:bg-slate-800 text-white text-xs rounded-md shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap border border-slate-700">
                {item.label}
              </div>
            </button>
          );
        })}
      </div>

      {/* Bottom Settings Button */}
      <div className="flex flex-col items-center w-full">
        <button
          onClick={onOpenSettingsModal}
          className="relative w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 dark:text-slate-400 light:text-slate-600 hover:text-white dark:hover:text-white light:hover:text-slate-900 hover:bg-slate-800/40 dark:hover:bg-slate-800/40 light:hover:bg-slate-200 transition-colors group"
          title="Settings"
        >
          <Settings className="w-5 h-5" />
          <div className="absolute left-12 ml-2 px-2.5 py-1 bg-slate-900 text-white text-xs rounded-md shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap border border-slate-700">
            Settings
          </div>
        </button>
      </div>
    </aside>
  );
};
