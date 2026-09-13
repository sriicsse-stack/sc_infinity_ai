import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { 
  X, 
  Plus, 
  ChevronRight, 
  Sparkles, 
  Check, 
  Copy, 
  FileCode,
  Wand2,
  Bug,
  HelpCircle,
  FilePlus
} from 'lucide-react';
import { useProject } from '../../context/ProjectContext';
import { useTheme } from '../../context/ThemeContext';
import { useAI } from '../../context/AIContext';

export const EditorView: React.FC = () => {
  const { 
    openTabs, 
    activeTab, 
    activeTabId, 
    setActiveTabId, 
    closeTab, 
    updateFileContent,
    fileTree,
    openFile,
    createFileOrFolder
  } = useProject();

  const { theme } = useTheme();
  const { sendMessage } = useAI();
  const [selection, setSelection] = useState<string>('');
  const [isNewFileModalOpen, setIsNewFileModalOpen] = useState<boolean>(false);
  const [newFileName, setNewFileName] = useState<string>('');

  const getLanguage = (lang?: string) => {
    if (!lang) return 'typescript';
    if (lang === 'typescript') return 'typescript';
    if (lang === 'javascript') return 'javascript';
    if (lang === 'json') return 'json';
    if (lang === 'html') return 'html';
    if (lang === 'css') return 'css';
    if (lang === 'python') return 'python';
    if (lang === 'sql') return 'sql';
    return 'plaintext';
  };

  const handleEditorChange = (value?: string) => {
    if (activeTab && value !== undefined) {
      updateFileContent(activeTab.path, value);
    }
  };

  const handleEditorDidMount = (editor: any) => {
    editor.onDidChangeCursorSelection((e: any) => {
      const model = editor.getModel();
      if (!model) return;
      const selectedText = model.getValueInRange(e.selection);
      if (selectedText && selectedText.trim().length > 3) {
        setSelection(selectedText);
      } else {
        setSelection('');
      }
    });
  };

  const handleAIAction = (actionType: string) => {
    if (!activeTab) return;
    const prompt = selection 
      ? `Regarding this selected code in \`${activeTab.name}\`:\n\`\`\`${activeTab.language}\n${selection}\n\`\`\`\nAction: Please ${actionType.toLowerCase()} this code.`
      : `Regarding file \`${activeTab.name}\`: Please ${actionType.toLowerCase()} the active code.`;
    sendMessage(prompt);
  };

  const handleCreateNewFile = (fileName: string) => {
    const trimmed = fileName.trim();
    if (!trimmed) return;

    createFileOrFolder(fileTree.path, trimmed, 'file');
    setNewFileName('');
    setIsNewFileModalOpen(false);

    // Open new file after creating
    setTimeout(() => {
      const filePath = `${fileTree.path}/${trimmed}`;
      openFile({
        id: `node_${trimmed}`,
        name: trimmed,
        path: filePath,
        type: 'file',
        language: trimmed.endsWith('.html') ? 'html' : trimmed.endsWith('.css') ? 'css' : trimmed.endsWith('.json') ? 'json' : 'javascript',
        content: trimmed.endsWith('.html') 
          ? `<!DOCTYPE html>\n<html>\n<head>\n  <title>${trimmed}</title>\n</head>\n<body>\n  <h1>${trimmed}</h1>\n</body>\n</html>`
          : trimmed.endsWith('.css')
          ? `/* ${trimmed} styles */\nbody {\n  margin: 0;\n  padding: 0;\n}`
          : trimmed.endsWith('.json')
          ? `{\n  "name": "${trimmed}"\n}`
          : `// ${trimmed}\nconsole.log("Hello from ${trimmed}");`
      });
    }, 100);
  };

  return (
    <div className="flex-1 h-full bg-[#0d111c] dark:bg-[#0d111c] light:bg-white flex flex-col border-r border-[#1f293d] dark:border-[#1f293d] light:border-slate-200 relative overflow-hidden">
      {/* Editor Tabs Row */}
      <div className="h-9 bg-[#080a10] dark:bg-[#080a10] light:bg-slate-100 border-b border-[#1f293d] dark:border-[#1f293d] light:border-slate-200 flex items-center justify-between text-xs select-none px-1">
        <div className="flex items-center space-x-1 overflow-x-auto">
          {openTabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-t-lg cursor-pointer border-t-2 transition-all ${
                  isActive
                    ? 'bg-[#0d111c] dark:bg-[#0d111c] light:bg-white border-indigo-500 text-white dark:text-white light:text-slate-900 font-medium'
                    : 'bg-transparent border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                <FileCode className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span className="text-[12px] truncate max-w-[120px]">{tab.name}</span>
                {tab.isDirty && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeTab(tab.id);
                  }}
                  className="p-0.5 hover:bg-slate-700/60 rounded text-slate-400 hover:text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Working '+' Button for New File / New Tab */}
        <div className="relative">
          <button 
            onClick={() => setIsNewFileModalOpen(true)} 
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/60 rounded transition-colors cursor-pointer"
            title="Create New File & Tab (+)"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
          </button>

          {isNewFileModalOpen && (
            <div className="absolute top-full right-0 mt-1 w-64 bg-[#0e1320] border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="font-bold text-xs text-white flex items-center space-x-1.5">
                  <FilePlus className="w-3.5 h-3.5 text-indigo-400" />
                  <span>New File</span>
                </span>
                <button onClick={() => setIsNewFileModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleCreateNewFile(newFileName); }} className="mt-2.5 space-y-2">
                <input
                  type="text"
                  autoFocus
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  placeholder="e.g. script.js, style.css, utils.ts"
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white text-xs outline-none focus:border-indigo-500 font-mono"
                />

                <div className="flex items-center justify-between gap-1 pt-1">
                  <button
                    type="button"
                    onClick={() => handleCreateNewFile('script.js')}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300 font-mono"
                  >
                    + .js
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreateNewFile('styles.css')}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300 font-mono"
                  >
                    + .css
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreateNewFile('index.html')}
                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 rounded text-[10px] text-slate-300 font-mono"
                  >
                    + .html
                  </button>
                  <button
                    type="submit"
                    disabled={!newFileName.trim()}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded text-[11px] font-semibold"
                  >
                    Create
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>

      {/* Breadcrumb Path Bar */}
      {activeTab && (
        <div className="h-6 px-3 bg-[#0a0d15] dark:bg-[#0a0d15] light:bg-slate-50 border-b border-[#1f293d] dark:border-[#1f293d] light:border-slate-200 flex items-center space-x-1 text-[11px] text-slate-400 select-none">
          {activeTab.path.split('/').map((part, idx, arr) => (
            <React.Fragment key={idx}>
              <span className={idx === arr.length - 1 ? 'text-slate-200 dark:text-slate-200 light:text-slate-800 font-medium' : ''}>
                {part}
              </span>
              {idx < arr.length - 1 && <ChevronRight className="w-3 h-3 text-slate-600" />}
            </React.Fragment>
          ))}
        </div>
      )}

      {/* Floating Selection AI Toolbar */}
      {selection && (
        <div className="absolute top-18 right-8 z-30 bg-[#0e1320]/95 dark:bg-[#0e1320]/95 light:bg-white/95 border border-indigo-500/40 rounded-xl p-1.5 shadow-2xl backdrop-blur-md flex items-center space-x-1 text-xs animate-in fade-in slide-in-from-top-2">
          <div className="px-2 py-1 flex items-center space-x-1.5 text-indigo-400 font-semibold border-r border-slate-800">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Ask Infinity:</span>
          </div>
          <button 
            onClick={() => handleAIAction('Explain')}
            className="px-2.5 py-1 rounded-lg hover:bg-indigo-600/20 text-slate-300 hover:text-white"
          >
            Explain
          </button>
          <button 
            onClick={() => handleAIAction('Fix')}
            className="px-2.5 py-1 rounded-lg hover:bg-indigo-600/20 text-slate-300 hover:text-white"
          >
            Fix
          </button>
          <button 
            onClick={() => handleAIAction('Refactor')}
            className="px-2.5 py-1 rounded-lg hover:bg-indigo-600/20 text-slate-300 hover:text-white"
          >
            Refactor
          </button>
          <button 
            onClick={() => handleAIAction('Optimize')}
            className="px-2.5 py-1 rounded-lg hover:bg-indigo-600/20 text-slate-300 hover:text-white"
          >
            Optimize
          </button>
          <button 
            onClick={() => handleAIAction('Generate unit tests for')}
            className="px-2.5 py-1 rounded-lg hover:bg-indigo-600/20 text-slate-300 hover:text-white"
          >
            Tests
          </button>
        </div>
      )}

      {/* Monaco Code Editor */}
      <div className="flex-1 w-full h-full relative">
        {activeTab ? (
          <Editor
            height="100%"
            language={getLanguage(activeTab.language)}
            value={activeTab.content || ''}
            theme={theme === 'dark' ? 'vs-dark' : 'light'}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            options={{
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
              fontLigatures: true,
              minimap: { enabled: true, scale: 0.75 },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              lineNumbers: 'on',
              renderLineHighlight: 'all',
              tabSize: 2,
              wordWrap: 'on',
              padding: { top: 12, bottom: 12 },
              suggest: {
                showKeywords: true,
                showSnippets: true,
              }
            }}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 space-y-3">
            <FileCode className="w-12 h-12 text-slate-600 stroke-[1.2]" />
            <p className="text-sm">No file selected. Select a file from the explorer or create a new one.</p>
            <button
              onClick={() => setIsNewFileModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create New File</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
