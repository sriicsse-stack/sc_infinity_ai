import React, { useState, useRef, useEffect } from 'react';
import { 
  FileCode, 
  Folder, 
  Save, 
  Play, 
  Terminal as TerminalIcon, 
  Search, 
  GitBranch, 
  Database, 
  Puzzle, 
  GraduationCap, 
  Sparkles, 
  ExternalLink, 
  Check, 
  ChevronRight, 
  Settings, 
  Layers, 
  Moon, 
  Sun, 
  Maximize2, 
  Trash2, 
  Download, 
  Upload, 
  RotateCcw,
  Zap,
  HelpCircle,
  FolderOpen,
  Plus
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useRuntime } from '../../context/RuntimeContext';
import { useTheme } from '../../context/ThemeContext';
import { useAI } from '../../context/AIContext';
import { useCredits } from '../../context/CreditsContext';
import { ActiveActivityTab } from '../../types';

interface MenuBarProps {
  onOpenCommandPalette: () => void;
  onOpenDeployModal: () => void;
  onOpenSettingsModal: () => void;
  onOpenPricingModal: () => void;
  onToggleHomeView: () => void;
  onToggleTerminal?: () => void;
  onEnsureBottomPanelVisible?: () => void;
  isBottomPanelVisible?: boolean;
  onSelectActivityTab?: (tab: ActiveActivityTab) => void;
  onOpenProjectCreationModal?: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  onOpenCommandPalette,
  onOpenDeployModal,
  onOpenSettingsModal,
  onOpenPricingModal,
  onToggleHomeView,
  onToggleTerminal,
  onEnsureBottomPanelVisible,
  isBottomPanelVisible,
  onSelectActivityTab,
  onOpenProjectCreationModal
}) => {
  const { 
    fileTree, 
    openTabs, 
    activeTab, 
    activeTabId,
    setActiveTabId,
    closeTab, 
    openFile, 
    createFileOrFolder,
    saveCurrentFile, 
    importProjectFromDirectory,
    exportCurrentProjectZip,
    updateFileContent,
    projects,
    currentProject,
    setCurrentProject
  } = useProject();

  const { theme, toggleTheme } = useTheme();
  const { executeActiveCode, refreshPreview, openStandalonePreview, clearTerminal, startDevServer, stopDevServer, setActiveBottomTab } = useRuntime();
  const { sendMessage } = useAI();
  const { currentPlan } = useCredits();

  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [autoSave, setAutoSave] = useState<boolean>(() => {
    return localStorage.getItem('infinity_autosave') !== 'false';
  });
  const [showAboutModal, setShowAboutModal] = useState<boolean>(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const singleFileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenu(null);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenu(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const toggleAutoSave = () => {
    const next = !autoSave;
    setAutoSave(next);
    localStorage.setItem('infinity_autosave', String(next));
  };

  const handleRunActiveFile = async () => {
    if (onEnsureBottomPanelVisible) onEnsureBottomPanelVisible();
    setActiveBottomTab('terminal');
    const target = activeTab || (openTabs.length > 0 ? openTabs[0] : null);
    if (!target) return;
    await executeActiveCode(target.content ?? '', target.name, target.language);
  };

  const handleSingleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const lang = ext === 'html' ? 'html' : ext === 'css' ? 'css' : ext === 'json' ? 'json' : ext === 'py' ? 'python' : ext === 'java' ? 'java' : 'javascript';
        createFileOrFolder(fileTree.path, file.name, 'file');
        setTimeout(() => {
          openFile({
            id: `file_${file.name}_${Date.now()}`,
            name: file.name,
            path: `${fileTree.path}/${file.name}`,
            type: 'file',
            language: lang,
            content: content
          });
        }, 100);
      };
      reader.readAsText(file);
    }
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      importProjectFromDirectory(e.target.files);
    }
  };

  const handleNewTextFile = () => {
    const defaultName = `untitled_${openTabs.length + 1}.js`;
    createFileOrFolder(fileTree.path, defaultName, 'file');
    setTimeout(() => {
      openFile({
        id: `node_${defaultName}`,
        name: defaultName,
        path: `${fileTree.path}/${defaultName}`,
        type: 'file',
        language: 'javascript',
        content: `// ${defaultName}\nconsole.log("Welcome to SC INFINITY IDE!");\n`
      });
    }, 100);
  };

  const handleSaveAs = () => {
    if (!activeTab) return;
    const blob = new Blob([activeTab.content || ''], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeTab.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFormatCode = () => {
    if (!activeTab || !activeTab.content) return;
    try {
      if (activeTab.language === 'json' || activeTab.name.endsWith('.json')) {
        const parsed = JSON.parse(activeTab.content);
        const formatted = JSON.stringify(parsed, null, 2);
        updateFileContent(activeTab.path, formatted);
      } else {
        const lines = activeTab.content.split('\n');
        let indent = 0;
        const formatted = lines.map(line => {
          const trimmed = line.trim();
          if (trimmed.startsWith('}') || trimmed.startsWith(']') || trimmed.startsWith(')')) {
            indent = Math.max(0, indent - 1);
          }
          const res = '  '.repeat(indent) + trimmed;
          if (trimmed.endsWith('{') || trimmed.endsWith('[') || trimmed.endsWith('(')) {
            indent++;
          }
          return res;
        }).join('\n');
        updateFileContent(activeTab.path, formatted);
      }
    } catch {
      // Keep existing
    }
  };

  const handleCycleTab = (direction: 'next' | 'prev') => {
    if (openTabs.length <= 1) return;
    const currentIndex = openTabs.findIndex(t => t.id === activeTabId);
    if (direction === 'next') {
      const nextIdx = (currentIndex + 1) % openTabs.length;
      setActiveTabId(openTabs[nextIdx].id);
    } else {
      const prevIdx = (currentIndex - 1 + openTabs.length) % openTabs.length;
      setActiveTabId(openTabs[prevIdx].id);
    }
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const menuItems = [
    {
      id: 'file',
      label: 'File',
      items: [
        { label: 'New Text File', shortcut: 'Ctrl+N', action: handleNewTextFile },
        { label: 'New File...', shortcut: 'Ctrl+Alt+N', action: handleNewTextFile },
        { label: 'New Window / Project', shortcut: 'Ctrl+Shift+N', action: () => onOpenProjectCreationModal?.() },
        { divider: true },
        { 
          label: 'Open File...', 
          shortcut: 'Ctrl+O', 
          action: () => singleFileInputRef.current?.click() 
        },
        { 
          label: 'Open Folder...', 
          shortcut: 'Ctrl+K Ctrl+O', 
          action: () => folderInputRef.current?.click() 
        },
        {
          label: 'Open Recent Projects',
          submenu: projects.map(p => ({
            label: p.name,
            checked: p.id === currentProject.id,
            action: () => setCurrentProject(p)
          }))
        },
        { divider: true },
        { label: 'Save', shortcut: 'Ctrl+S', action: () => saveCurrentFile() },
        { label: 'Save As...', shortcut: 'Ctrl+Shift+S', action: handleSaveAs },
        { label: 'Save All', shortcut: 'Ctrl+K S', action: () => saveCurrentFile() },
        { label: 'Export as ZIP', shortcut: 'Ctrl+E', action: () => exportCurrentProjectZip() },
        { divider: true },
        { 
          label: 'Auto Save', 
          checked: autoSave, 
          action: toggleAutoSave 
        },
        { label: 'Preferences / Settings', shortcut: 'Ctrl+,', action: onOpenSettingsModal },
        { divider: true },
        { label: 'Close Editor', shortcut: 'Ctrl+W', action: () => activeTab && closeTab(activeTab.id) },
        { label: 'Close All Editors', action: () => openTabs.forEach(t => closeTab(t.id)) },
        { label: 'Exit to Home', shortcut: 'Alt+F4', action: onToggleHomeView }
      ]
    },
    {
      id: 'edit',
      label: 'Edit',
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z', action: () => document.execCommand('undo') },
        { label: 'Redo', shortcut: 'Ctrl+Y', action: () => document.execCommand('redo') },
        { divider: true },
        { label: 'Cut', shortcut: 'Ctrl+X', action: () => document.execCommand('cut') },
        { label: 'Copy', shortcut: 'Ctrl+C', action: () => document.execCommand('copy') },
        { label: 'Paste', shortcut: 'Ctrl+V', action: () => navigator.clipboard.readText() },
        { divider: true },
        { label: 'Find in Workspace', shortcut: 'Ctrl+F', action: () => onSelectActivityTab?.('search') },
        { label: 'Replace in Workspace', shortcut: 'Ctrl+H', action: () => onSelectActivityTab?.('search') },
        { label: 'Format Document', shortcut: 'Shift+Alt+F', action: handleFormatCode },
        { divider: true },
        { 
          label: 'Ask AI to Optimize Code', 
          shortcut: 'Ctrl+Alt+I', 
          action: () => sendMessage('Analyze the active file and suggest performance, typing, and architectural optimizations.') 
        }
      ]
    },
    {
      id: 'selection',
      label: 'Selection',
      items: [
        { label: 'Select All', shortcut: 'Ctrl+A', action: () => document.execCommand('selectAll') },
        { label: 'Expand Selection', shortcut: 'Shift+Alt+Right', action: () => {} },
        { label: 'Shrink Selection', shortcut: 'Shift+Alt+Left', action: () => {} },
        { divider: true },
        { label: 'Copy Line Up', shortcut: 'Shift+Alt+Up', action: () => {} },
        { label: 'Copy Line Down', shortcut: 'Shift+Alt+Down', action: () => {} },
        { label: 'Move Line Up', shortcut: 'Alt+Up', action: () => {} },
        { label: 'Move Line Down', shortcut: 'Alt+Down', action: () => {} },
        { label: 'Duplicate Selection', shortcut: 'Ctrl+D', action: () => {} }
      ]
    },
    {
      id: 'view',
      label: 'View',
      items: [
        { label: 'Command Palette...', shortcut: 'Ctrl+Shift+P', action: onOpenCommandPalette },
        { divider: true },
        { label: 'Explorer', shortcut: 'Ctrl+Shift+E', action: () => onSelectActivityTab?.('explorer') },
        { label: 'Search', shortcut: 'Ctrl+Shift+F', action: () => onSelectActivityTab?.('search') },
        { label: 'Source Control (Git)', shortcut: 'Ctrl+Shift+G', action: () => onSelectActivityTab?.('git') },
        { label: 'Database Studio', shortcut: 'Ctrl+Shift+B', action: () => onSelectActivityTab?.('database') },
        { label: 'Extensions', shortcut: 'Ctrl+Shift+X', action: () => onSelectActivityTab?.('extensions') },
        { label: 'AI Tutor & Assistant', shortcut: 'Ctrl+Shift+T', action: () => onSelectActivityTab?.('tutor') },
        { label: 'Marketplace', action: () => onSelectActivityTab?.('marketplace') },
        { divider: true },
        { 
          label: 'Terminal Panel', 
          shortcut: 'Ctrl+`', 
          checked: isBottomPanelVisible,
          action: onToggleTerminal 
        },
        { 
          label: 'Live Web Preview', 
          shortcut: 'Ctrl+Shift+V', 
          action: refreshPreview 
        },
        { 
          label: 'Open in Standalone Browser', 
          shortcut: 'Ctrl+Alt+O', 
          action: () => openStandalonePreview(fileTree) 
        },
        { divider: true },
        { label: 'Toggle Full Screen', shortcut: 'F11', action: handleToggleFullscreen },
        { 
          label: 'Switch Dark/Light Mode', 
          action: toggleTheme 
        }
      ]
    },
    {
      id: 'go',
      label: 'Go',
      items: [
        { label: 'Back (Previous Tab)', shortcut: 'Alt+Left', action: () => handleCycleTab('prev') },
        { label: 'Forward (Next Tab)', shortcut: 'Alt+Right', action: () => handleCycleTab('next') },
        { divider: true },
        { label: 'Go to File...', shortcut: 'Ctrl+P', action: onOpenCommandPalette },
        { label: 'Go to Line/Column...', shortcut: 'Ctrl+G', action: onOpenCommandPalette },
        { divider: true },
        { label: 'Next Editor Tab', shortcut: 'Ctrl+Tab', action: () => handleCycleTab('next') },
        { label: 'Previous Editor Tab', shortcut: 'Ctrl+Shift+Tab', action: () => handleCycleTab('prev') }
      ]
    },
    {
      id: 'run',
      label: 'Run',
      items: [
        { label: 'Start Debugging', shortcut: 'F5', action: handleRunActiveFile },
        { label: 'Run Active File', shortcut: 'Ctrl+F5', action: handleRunActiveFile },
        { label: 'Stop Dev Server', shortcut: 'Shift+F5', action: stopDevServer },
        { label: 'Restart Dev Server', shortcut: 'Ctrl+Shift+F5', action: startDevServer },
        { divider: true },
        { label: 'Open Standalone Web Preview', action: () => openStandalonePreview(fileTree) },
        { label: 'Clear Terminal Output', shortcut: 'Ctrl+K', action: clearTerminal }
      ]
    },
    {
      id: 'terminal',
      label: 'Terminal',
      items: [
        { 
          label: 'New Terminal / Split', 
          shortcut: 'Ctrl+Shift+`', 
          action: () => {
            if (onEnsureBottomPanelVisible) onEnsureBottomPanelVisible();
            setActiveBottomTab('terminal');
            clearTerminal();
            startDevServer();
          } 
        },
        { label: 'Run Active File in Terminal', action: handleRunActiveFile },
        { label: 'Clear Terminal', shortcut: 'Ctrl+L', action: clearTerminal },
        { divider: true },
        { 
          label: 'Toggle Terminal Panel', 
          shortcut: 'Ctrl+`', 
          checked: isBottomPanelVisible,
          action: onToggleTerminal 
        }
      ]
    },
    {
      id: 'help',
      label: 'Help',
      items: [
        { label: 'Welcome / Home Screen', action: onToggleHomeView },
        { label: 'Interactive Documentation', action: onOpenCommandPalette },
        { label: 'Voice Assistant (Tamil & English)', action: () => sendMessage('Help me understand the current project and what I can build.') },
        { label: 'Keyboard Shortcuts Reference', shortcut: 'Ctrl+K Ctrl+S', action: onOpenCommandPalette },
        { divider: true },
        { label: 'Pricing Plans & AI Credits', action: onOpenPricingModal },
        { label: 'Deploy Project to Vercel', action: onOpenDeployModal },
        { divider: true },
        { label: 'About SC INFINITY IDE', action: () => setShowAboutModal(true) }
      ]
    }
  ];

  return (
    <>
      <input 
        ref={singleFileInputRef} 
        type="file" 
        multiple 
        className="hidden" 
        onChange={handleSingleFileChange} 
      />
      <input 
        ref={folderInputRef} 
        type="file" 
        // @ts-ignore
        webkitdirectory="true" 
        directory="true" 
        multiple 
        className="hidden" 
        onChange={handleFolderChange} 
      />

      <nav ref={menuRef} className="flex items-center space-x-0.5 text-xs select-none">
        {menuItems.map((menu) => {
          const isOpen = activeMenu === menu.id;
          return (
            <div key={menu.id} className="relative">
              <button
                onClick={() => setActiveMenu(isOpen ? null : menu.id)}
                onMouseEnter={() => {
                  if (activeMenu !== null) setActiveMenu(menu.id);
                }}
                className={`px-2.5 py-1 rounded text-[12px] font-normal transition-colors cursor-pointer ${
                  isOpen 
                    ? 'bg-indigo-600/30 text-white font-medium' 
                    : 'text-slate-300 dark:text-slate-300 light:text-slate-700 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                {menu.label}
              </button>

              {isOpen && (
                <div 
                  className="absolute top-full left-0 mt-1 min-w-[240px] bg-[#0c101d] dark:bg-[#0c101d] light:bg-white rounded-lg border border-[#1f293d] dark:border-[#1f293d] light:border-slate-200 shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-md"
                >
                  {menu.items.map((item: any, idx: number) => {
                    if (item.divider) {
                      return <div key={idx} className="my-1 border-t border-[#1f293d] dark:border-[#1f293d] light:border-slate-200" />;
                    }

                    if (item.submenu) {
                      return (
                        <div key={idx} className="relative group/sub">
                          <button
                            className="w-full px-3 py-1.5 text-left text-[12px] text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-indigo-600 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <span>{item.label}</span>
                            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                          </button>
                          <div className="absolute top-0 left-full ml-0.5 min-w-[200px] bg-[#0c101d] dark:bg-[#0c101d] light:bg-white rounded-lg border border-[#1f293d] dark:border-[#1f293d] light:border-slate-200 shadow-2xl py-1 hidden group-hover/sub:block z-50">
                            {item.submenu.map((sub: any, sIdx: number) => (
                              <button
                                key={sIdx}
                                onClick={() => {
                                  sub.action();
                                  setActiveMenu(null);
                                }}
                                className="w-full px-3 py-1.5 text-left text-[12px] text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-indigo-600 hover:text-white flex items-center justify-between transition-colors cursor-pointer"
                              >
                                <span>{sub.label}</span>
                                {sub.checked && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (item.action) item.action();
                          setActiveMenu(null);
                        }}
                        className="w-full px-3 py-1.5 text-left text-[12px] text-slate-300 dark:text-slate-300 light:text-slate-700 hover:bg-indigo-600 hover:text-white flex items-center justify-between transition-colors cursor-pointer group"
                      >
                        <div className="flex items-center space-x-2">
                          {item.checked !== undefined && (
                            <span className="w-4 flex items-center justify-center">
                              {item.checked ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : null}
                            </span>
                          )}
                          <span>{item.label}</span>
                        </div>
                        {item.shortcut && (
                          <span className="text-[10px] text-slate-500 group-hover:text-indigo-100 font-mono pl-4">
                            {item.shortcut}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {showAboutModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0e1320] border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-500/30">
                ∞
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">SC INFINITY IDE</h3>
                <p className="text-xs text-indigo-400 font-medium">Version 1.0.0 (Universal Release)</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs text-slate-300 border-y border-slate-800/80 py-4 my-4 font-mono">
              <div className="flex justify-between">
                <span className="text-slate-500">Core Engine:</span>
                <span className="text-white">Antigravity 2.0 / Monaco 0.52</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">AI Model:</span>
                <span className="text-emerald-400">Gemini 1.5 Pro & 2.0 Flash</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Sandbox:</span>
                <span className="text-white">Node.js + Python + Java + C/C++</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Active Plan:</span>
                <span className="text-amber-400 capitalize">{currentPlan} Plan</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Database:</span>
                <span className="text-white">Firebase Realtime DB & Auth</span>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed mb-5">
              SC INFINITY IDE delivers real-time coding, interactive multi-language sandboxes, AI copilot pairing, and 1-click cloud deployment.
            </p>

            <button
              onClick={() => setShowAboutModal(false)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-xl text-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
