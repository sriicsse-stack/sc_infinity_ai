import React, { useState, useRef, useEffect } from 'react';
import { 
  Terminal as TerminalIcon, 
  AlertCircle, 
  FileText, 
  Bug, 
  Plus, 
  Trash2, 
  ChevronDown, 
  Sparkles, 
  Maximize2, 
  Minimize2, 
  X,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { useRuntime } from '../../context/RuntimeContext';
import { useProject } from '../../context/ProjectContext';
import { useAI } from '../../context/AIContext';

interface BottomPanelProps {
  isExpanded: boolean;
  onToggleExpand: () => void;
  onClose: () => void;
  onOpenPreview: () => void;
}

export const BottomPanel: React.FC<BottomPanelProps> = ({
  isExpanded,
  onToggleExpand,
  onClose,
  onOpenPreview
}) => {
  const { 
    activeBottomTab, 
    setActiveBottomTab, 
    terminalLogs, 
    outputLogs, 
    debugLogs, 
    runCommand, 
    clearTerminal, 
    isRunning, 
    serverUrl,
    openStandalonePreview,
    isWaitingForInput,
    inputPrompt
  } = useRuntime();

  const { problems, fixProblemWithAI, fileTree } = useProject();
  const { sendMessage } = useAI();

  const [inputVal, setInputVal] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandHistory, setCommandHistory] = useState<string[]>(['npm run dev', 'npm test']);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLogs, activeBottomTab]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (inputVal.trim()) {
        setCommandHistory(prev => [...prev, inputVal.trim()]);
        runCommand(inputVal);
        setInputVal('');
        setHistoryIndex(-1);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const nextIdx = historyIndex + 1 < commandHistory.length ? historyIndex + 1 : historyIndex;
        setHistoryIndex(nextIdx);
        setInputVal(commandHistory[commandHistory.length - 1 - nextIdx] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const nextIdx = historyIndex - 1;
        setHistoryIndex(nextIdx);
        setInputVal(commandHistory[commandHistory.length - 1 - nextIdx] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInputVal('');
      }
    }
  };

  const handleFixWithAI = (problemId: string, probMsg: string) => {
    fixProblemWithAI(problemId);
    sendMessage(`Please fix this diagnostic error: "${probMsg}" in the active codebase.`);
  };

  const handleOpenStandaloneTab = () => {
    openStandalonePreview(fileTree);
  };

  return (
    <div className={`border-t border-[#1f293d] dark:border-[#1f293d] light:border-slate-200 bg-[#0a0d15] dark:bg-[#0a0d15] light:bg-slate-50 flex flex-col transition-all duration-200 relative ${
      isExpanded ? 'h-72' : 'h-48'
    }`}>
      {/* Panel Tab Header */}
      <div className="h-9 px-3 border-b border-[#1f293d] dark:border-[#1f293d] light:border-slate-200 flex items-center justify-between text-xs select-none">
        {/* Left Tabs */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveBottomTab('terminal')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-colors ${
              activeBottomTab === 'terminal'
                ? 'bg-slate-800/80 dark:bg-slate-800/80 light:bg-white text-indigo-400 font-medium shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>Terminal</span>
          </button>

          <button
            onClick={() => setActiveBottomTab('problems')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-colors relative ${
              activeBottomTab === 'problems'
                ? 'bg-slate-800/80 dark:bg-slate-800/80 light:bg-white text-indigo-400 font-medium shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Problems</span>
            {problems.length > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] font-bold bg-rose-500/90 text-white rounded-full">
                {problems.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveBottomTab('output')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-colors ${
              activeBottomTab === 'output'
                ? 'bg-slate-800/80 dark:bg-slate-800/80 light:bg-white text-indigo-400 font-medium shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Output</span>
          </button>

          <button
            onClick={() => setActiveBottomTab('debug')}
            className={`flex items-center space-x-1.5 px-3 py-1 rounded-md transition-colors ${
              activeBottomTab === 'debug'
                ? 'bg-slate-800/80 dark:bg-slate-800/80 light:bg-white text-indigo-400 font-medium shadow-xs'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bug className="w-3.5 h-3.5" />
            <span>Debug Console</span>
          </button>
        </div>

        {/* Right Shell Controls */}
        <div className="flex items-center space-x-2 text-slate-400">
          <div className="flex items-center space-x-1 px-2 py-0.5 rounded bg-slate-800/40 text-[11px] text-slate-300">
            <span className="text-slate-400">powershell / bash</span>
            <ChevronDown className="w-3 h-3 opacity-60" />
          </div>

          <button
            onClick={() => runCommand('clear')}
            className="p-1 hover:text-white rounded hover:bg-slate-800/50"
            title="New Terminal"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={clearTerminal}
            className="p-1 hover:text-white rounded hover:bg-slate-800/50"
            title="Clear Terminal"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onToggleExpand}
            className="p-1 hover:text-white rounded hover:bg-slate-800/50"
            title={isExpanded ? "Collapse Panel" : "Expand Panel"}
          >
            {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onClose}
            className="p-1 hover:text-white rounded hover:bg-slate-800/50"
            title="Close Panel"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 p-3 font-mono text-[12px] overflow-y-auto leading-relaxed relative select-text">
        {activeBottomTab === 'terminal' && (
          <div className="space-y-1">
            {terminalLogs.map((line, idx) => (
              <div 
                key={idx} 
                className={`${
                  line.includes('VITE') || line.includes('ready')
                    ? 'text-emerald-400 font-medium'
                    : line.includes('error') || line.includes('Error') || line.includes('❌')
                    ? 'text-rose-400'
                    : line.includes('➜')
                    ? 'text-indigo-300'
                    : 'text-slate-300 dark:text-slate-300 light:text-slate-700'
                }`}
              >
                {line}
              </div>
            ))}

            {/* Active Command Input Line / Interactive Stdin Bar */}
            <div className={`flex items-center space-x-2 text-slate-300 pt-1 ${isWaitingForInput ? 'bg-indigo-950/40 p-1.5 rounded-lg border border-indigo-500/40 animate-pulse' : ''}`}>
              {isWaitingForInput ? (
                <span className="text-amber-400 font-semibold select-none flex items-center space-x-1">
                  <span>➜</span>
                  <span>{inputPrompt || 'Input:'}</span>
                </span>
              ) : (
                <span className="text-emerald-400 font-semibold select-none">PS C:\workspace&gt;</span>
              )}
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isWaitingForInput ? "Enter value and press Enter..." : "Type command (e.g. node app.js, python test.py, npm test)..."}
                className={`flex-1 bg-transparent border-none outline-none font-mono text-[12px] focus:ring-0 p-0 ${
                  isWaitingForInput ? 'text-amber-200 placeholder-amber-400/50' : 'text-slate-100 placeholder-slate-600'
                }`}
                autoFocus
              />
            </div>
            <div ref={terminalEndRef} />
          </div>
        )}

        {activeBottomTab === 'problems' && (
          <div className="space-y-2 font-sans">
            {problems.length === 0 ? (
              <div className="text-slate-500 text-xs py-4 flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>No problems have been detected in the workspace.</span>
              </div>
            ) : (
              problems.map((prob) => (
                <div 
                  key={prob.id}
                  className="p-3 rounded-xl bg-[#0f1422] dark:bg-[#0f1422] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 flex items-start justify-between space-x-4 shadow-sm"
                >
                  <div className="flex items-start space-x-3">
                    <AlertCircle className={`w-4 h-4 mt-0.5 ${prob.severity === 'error' ? 'text-rose-400' : 'text-amber-400'}`} />
                    <div>
                      <div className="text-xs font-semibold text-white dark:text-white light:text-slate-900">
                        {prob.message}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 mt-1">
                        {prob.file} [Ln {prob.line}, Col {prob.column}]
                      </div>
                      {prob.codeSnippet && (
                        <div className="mt-2 p-1.5 rounded bg-slate-900/80 font-mono text-[11px] text-indigo-300 border border-slate-800">
                          {prob.codeSnippet}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleFixWithAI(prob.id, prob.message)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium shadow-sm transition-all whitespace-nowrap active:scale-95"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Fix with Infinity</span>
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {activeBottomTab === 'output' && (
          <div className="space-y-1 text-slate-400">
            {outputLogs.map((log, idx) => (
              <div key={idx}>{log}</div>
            ))}
          </div>
        )}

        {activeBottomTab === 'debug' && (
          <div className="space-y-1 text-slate-400">
            {debugLogs.map((log, idx) => (
              <div key={idx}>{log}</div>
            ))}
          </div>
        )}
      </div>

      {/* Floating Project is running! Banner with direct standalone tab opener */}
      {isRunning && (
        <div className="absolute right-6 top-12 z-20 p-3 rounded-2xl bg-[#0f1422]/95 dark:bg-[#0f1422]/95 light:bg-white/95 border border-emerald-500/40 shadow-2xl backdrop-blur-md flex items-center space-x-4 max-w-sm">
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="text-xs font-bold text-white dark:text-white light:text-slate-900">Project is running!</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Live workspace ready on <span className="text-indigo-400 font-mono">{serverUrl}</span></div>
          </div>
          <button
            onClick={handleOpenStandaloneTab}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all whitespace-nowrap active:scale-95 flex items-center space-x-1.5 cursor-pointer"
          >
            <span>Open in Preview</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
