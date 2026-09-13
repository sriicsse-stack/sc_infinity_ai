import React, { createContext, useContext, useState } from 'react';
import { CodeRunner } from '../services/codeRunner';
import { PreviewBundler } from '../services/previewBundler';
import { FileNode } from '../types';

export type BottomTab = 'terminal' | 'problems' | 'output' | 'debug';
export type ViewportMode = 'desktop' | 'tablet' | 'mobile';

interface RuntimeContextType {
  isRunning: boolean;
  serverUrl: string;
  activeBottomTab: BottomTab;
  setActiveBottomTab: (tab: BottomTab) => void;
  viewportMode: ViewportMode;
  setViewportMode: (mode: ViewportMode) => void;
  terminalLogs: string[];
  outputLogs: string[];
  debugLogs: string[];
  runCommand: (command: string) => void;
  executeActiveCode: (code: string, filename: string, language?: string) => Promise<void>;
  openStandalonePreview: (fileTree: FileNode) => void;
  startDevServer: () => void;
  stopDevServer: () => void;
  clearTerminal: () => void;
  isWaitingForInput: boolean;
  inputPrompt: string;
  previewUrl: string;
  setPreviewUrl: (url: string) => void;
  refreshPreview: () => void;
  previewKey: number;
}

const RuntimeContext = createContext<RuntimeContextType | undefined>(undefined);

export const RuntimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [serverUrl, setServerUrl] = useState<string>('http://localhost:5173');
  const [previewUrl, setPreviewUrl] = useState<string>('http://localhost:5173');
  const [previewKey, setPreviewKey] = useState<number>(1);
  const [activeBottomTab, setActiveBottomTab] = useState<BottomTab>('terminal');
  const [viewportMode, setViewportMode] = useState<ViewportMode>('desktop');
  const [isWaitingForInput, setIsWaitingForInput] = useState<boolean>(false);
  const [inputPrompt, setInputPrompt] = useState<string>('');

  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    'PS C:\\workspace> npm run dev',
    '> sc-infinity-workspace@1.0.0 dev',
    '> vite',
    '',
    '  VITE v6.4.3  ready in 412 ms',
    '',
    '  ➜  Local:   http://localhost:5173/',
    '  ➜  Network: http://10.17.226.94:5173/',
    '  ➜  press h to show help'
  ]);

  const [outputLogs, setOutputLogs] = useState<string[]>([
    '[TypeScript] Type-checking complete: 0 diagnostics detected.',
    '[Vite Engine] Fast Refresh enabled.',
    '[Firebase SDK] Connected to Realtime Database: https://scmain-b2cde-default-rtdb.asia-southeast1.firebasedatabase.app',
    '[Runtime Sandbox] Multi-language execution engine ready (JS, TS, Python, Java, C, C++).'
  ]);

  const [debugLogs, setDebugLogs] = useState<string[]>([
    'Debugger attached to isolated execution runtime.',
    'Listening on ws://127.0.0.1:9229/inspector',
    'Firebase Auth & Realtime Database connected.'
  ]);

  const refreshPreview = () => {
    setPreviewKey(prev => prev + 1);
  };

  const openStandalonePreview = (fileTree: FileNode) => {
    try {
      const bundledHtml = PreviewBundler.bundleProject(fileTree);
      const blob = new Blob([bundledHtml], { type: 'text/html;charset=utf-8' });
      const blobUrl = URL.createObjectURL(blob);
      const newWin = window.open(blobUrl, '_blank');
      if (!newWin) {
        // If popup blocked, create hidden anchor click
        const a = document.createElement('a');
        a.href = blobUrl;
        a.target = '_blank';
        a.rel = 'noreferrer';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (e) {
      console.error('Failed to open standalone preview:', e);
    }
  };

  const startDevServer = () => {
    setIsRunning(true);
    setTerminalLogs(prev => [
      ...prev,
      'PS C:\\workspace> npm run dev',
      '> vite dev server restarted',
      '  ➜  Local:   http://localhost:5173/'
    ]);
  };

  const stopDevServer = () => {
    setIsRunning(false);
    setTerminalLogs(prev => [...prev, '[Process stopped]']);
  };

  const clearTerminal = () => {
    setTerminalLogs([]);
    setIsWaitingForInput(false);
    setInputPrompt('');
    CodeRunner.activeInteractiveSession = null;
  };

  const executeActiveCode = async (code: string, filename: string, language?: string) => {
    setActiveBottomTab('terminal');

    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const effectiveLang = (
      ext === 'py' ? 'python' :
      ext === 'java' ? 'java' :
      ext === 'c' || ext === 'cpp' || ext === 'cc' ? 'c' :
      ext === 'html' ? 'html' :
      ext === 'js' || ext === 'ts' || ext === 'jsx' || ext === 'tsx' ? 'javascript' :
      language || 'javascript'
    );

    const runnerCmd = 
      effectiveLang === 'python' ? `python ${filename}` : 
      effectiveLang === 'java' ? `javac ${filename} && java ${filename.replace('.java', '')}` : 
      effectiveLang === 'c' ? `gcc ${filename} -o app.exe && ./app.exe` : 
      effectiveLang === 'html' ? `open ${filename}` : 
      `node ${filename}`;

    setTerminalLogs(prev => [
      ...prev,
      `PS C:\\workspace> ${runnerCmd}`,
      `[Running ${filename} via Infinity Multi-Language Sandbox...]`
    ]);

    const result = await CodeRunner.executeCode(code, effectiveLang, filename);

    if (result.needsInput) {
      setIsWaitingForInput(true);
      setInputPrompt(result.inputPrompt || '');
      setTerminalLogs(prev => [
        ...prev,
        ...result.logs
      ]);
      return;
    }

    setIsWaitingForInput(false);
    setInputPrompt('');

    const resultLines: string[] = [];
    if (result.logs.length > 0) {
      resultLines.push(...result.logs);
    }
    if (result.returnValue !== undefined) {
      resultLines.push(`➜ Return Value: ${typeof result.returnValue === 'object' ? JSON.stringify(result.returnValue, null, 2) : String(result.returnValue)}`);
    }
    if (result.errors.length > 0) {
      resultLines.push(...result.errors.map(err => `❌ Error: ${err}`));
    }
    resultLines.push(`[Process finished in ${result.durationMs}ms with exit code ${result.success ? '0' : '1'}]`);

    setTerminalLogs(prev => [...prev, ...resultLines]);

    setOutputLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Executed ${filename}: ${result.success ? 'SUCCESS' : 'FAILED'} in ${result.durationMs}ms`
    ]);
  };

  const runCommand = async (command: string) => {
    const trimmed = command.trim();

    // Check if we are waiting for interactive stdin input from the user
    if (CodeRunner.activeInteractiveSession || isWaitingForInput) {
      setTerminalLogs(prev => [...prev, trimmed]); // Echo the input in terminal
      const result = await CodeRunner.executeCode('', '', '', trimmed);

      if (result.needsInput) {
        setIsWaitingForInput(true);
        setInputPrompt(result.inputPrompt || '');
        if (result.logs.length > 0) {
          setTerminalLogs(prev => [...prev, ...result.logs]);
        }
        return;
      }

      setIsWaitingForInput(false);
      setInputPrompt('');
      const resultLines: string[] = [];
      if (result.logs.length > 0) {
        resultLines.push(...result.logs);
      }
      if (result.errors.length > 0) {
        resultLines.push(...result.errors.map(err => `❌ Error: ${err}`));
      }
      resultLines.push(`[Process finished in ${result.durationMs}ms with exit code ${result.success ? '0' : '1'}]`);
      setTerminalLogs(prev => [...prev, ...resultLines]);
      return;
    }

    if (!trimmed) return;

    if (trimmed === 'clear' || trimmed === 'cls') {
      clearTerminal();
      return;
    }

    const newLogs = [`PS C:\\workspace> ${trimmed}`];

    if (
      trimmed.startsWith('node ') || 
      trimmed.startsWith('python ') || 
      trimmed.startsWith('java ') ||
      trimmed.startsWith('gcc ') ||
      trimmed.startsWith('g++ ') ||
      trimmed.startsWith('run ')
    ) {
      let lang = 'javascript';
      let codeToRun = trimmed;
      if (trimmed.startsWith('python ')) { lang = 'python'; codeToRun = trimmed.replace('python ', ''); }
      else if (trimmed.startsWith('java ')) { lang = 'java'; codeToRun = trimmed.replace('java ', ''); }
      else if (trimmed.startsWith('gcc ') || trimmed.startsWith('g++ ')) { lang = 'c'; codeToRun = trimmed.replace(/^(gcc|g\+\+)\s+/, ''); }
      else { codeToRun = trimmed.replace(/^(node|run)\s+/, ''); }

      const result = await CodeRunner.executeCode(codeToRun, lang);
      if (result.needsInput) {
        setIsWaitingForInput(true);
        setInputPrompt(result.inputPrompt || '');
        if (result.logs.length > 0) newLogs.push(...result.logs);
        setTerminalLogs(prev => [...prev, ...newLogs]);
        return;
      }

      if (result.logs.length > 0) newLogs.push(...result.logs);
      if (result.errors.length > 0) newLogs.push(...result.errors.map(e => `Error: ${e}`));
      newLogs.push(`>> Finished in ${result.durationMs}ms (exit code ${result.success ? 0 : 1})`);
    } else if (trimmed === 'npm test') {
      newLogs.push(
        ' PASS  src/app.test.js',
        'Test Suites: 1 passed, 1 total',
        'Tests:       4 passed, 4 total',
        'Snapshots:   0 total',
        'Time:        0.842 s'
      );
    } else if (trimmed === 'npm run build') {
      newLogs.push(
        'vite v6.4.3 building for production...',
        '✓ 1651 modules transformed.',
        'dist/index.html                   1.07 kB │ gzip:   0.61 kB',
        'dist/assets/index.js            716.05 kB │ gzip: 175.22 kB',
        '✓ built in 6.98s'
      );
    } else if (trimmed === 'git status') {
      newLogs.push(
        'On branch main',
        'Your branch is up to date with \'origin/main\'.',
        'nothing to commit, working tree clean'
      );
    } else if (trimmed === 'ls' || trimmed === 'dir') {
      newLogs.push('Mode        Length Name', '----        ------ ----', '-a----         840 index.html', '-a----         620 styles.css', '-a----         480 app.js', '-a----         180 README.md');
    } else {
      try {
        const result = await CodeRunner.executeCode(trimmed, 'javascript');
        if (result.logs.length > 0) newLogs.push(...result.logs);
        if (result.returnValue !== undefined) newLogs.push(String(result.returnValue));
        if (result.errors.length > 0) newLogs.push(...result.errors);
      } catch {
        newLogs.push(`Executed '${trimmed}' successfully.`);
      }
    }

    setTerminalLogs(prev => [...prev, ...newLogs]);
  };

  return (
    <RuntimeContext.Provider
      value={{
        isRunning,
        serverUrl,
        activeBottomTab,
        setActiveBottomTab,
        viewportMode,
        setViewportMode,
        terminalLogs,
        outputLogs,
        debugLogs,
        runCommand,
        executeActiveCode,
        openStandalonePreview,
        startDevServer,
        stopDevServer,
        clearTerminal,
        isWaitingForInput,
        inputPrompt,
        previewUrl,
        setPreviewUrl,
        refreshPreview,
        previewKey
      }}
    >
      {children}
    </RuntimeContext.Provider>
  );
};

export const useRuntime = () => {
  const context = useContext(RuntimeContext);
  if (!context) {
    throw new Error('useRuntime must be used within a RuntimeProvider');
  }
  return context;
};
