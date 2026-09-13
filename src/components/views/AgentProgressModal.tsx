import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  Circle, 
  X, 
  ChevronDown, 
  ChevronRight, 
  FileCode, 
  Sparkles,
  ExternalLink,
  Minimize2,
  Terminal as TerminalIcon,
  CheckCircle,
  FlaskConical,
  Wrench,
  ShieldCheck,
  Play,
  Github,
  Rocket,
  Code2
} from 'lucide-react';
import { AnimatedInfinity } from '../common/AnimatedInfinity';
import { useAI } from '../../context/AIContext';
import { useRuntime } from '../../context/RuntimeContext';

export const AgentProgressModal: React.FC = () => {
  const { 
    agentRun, 
    cancelAgentRun, 
    isAgentModalOpen, 
    setIsAgentModalOpen,
    infinityState,
    pushProjectToGitHub,
    deployProjectToVercel
  } = useAI();

  const { refreshPreview } = useRuntime();
  const [activeViewTab, setActiveViewTab] = useState<'steps' | 'terminal' | 'tests' | 'healing'>('steps');

  if (!isAgentModalOpen || !agentRun) return null;

  const passedTestsCount = agentRun.tests.filter(t => t.status === 'passed').length;
  const isCompleted = agentRun.status === 'completed' || agentRun.phase === 'completed';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-2xl bg-[#0c101d] dark:bg-[#0c101d] light:bg-white rounded-3xl border border-indigo-500/30 dark:border-indigo-500/30 light:border-slate-300 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 pb-3 border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AnimatedInfinity state={infinityState} size="sm" />
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-base font-bold text-white dark:text-white light:text-slate-900">
                  {isCompleted ? '∞ Build Completed Successfully' : '∞ Infinity Agent Orchestrator'}
                </h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                  isCompleted 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 animate-pulse'
                }`}>
                  {agentRun.phase.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate max-w-md mt-0.5">{agentRun.prompt}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsAgentModalOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
              title="Run in Background"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={cancelAgentRun}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/50 transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Understand Checklist Banner */}
        {agentRun.plan && (
          <div className="px-5 py-2.5 bg-[#090d17] border-b border-slate-800/60 flex flex-wrap items-center gap-1.5">
            {agentRun.plan.analysis.map((item, idx) => (
              <span key={idx} className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-md bg-indigo-950/40 text-indigo-300 border border-indigo-800/40">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span>{item}</span>
              </span>
            ))}
          </div>
        )}

        {/* View Switcher Tabs */}
        <div className="flex items-center space-x-1 px-5 pt-3 border-b border-slate-800/60 text-xs">
          <button
            onClick={() => setActiveViewTab('steps')}
            className={`px-3 py-1.5 rounded-t-lg font-medium transition-all flex items-center space-x-1.5 ${
              activeViewTab === 'steps'
                ? 'bg-slate-800/80 text-white border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Build Plan ({agentRun.steps.length})</span>
          </button>

          <button
            onClick={() => setActiveViewTab('terminal')}
            className={`px-3 py-1.5 rounded-t-lg font-medium transition-all flex items-center space-x-1.5 ${
              activeViewTab === 'terminal'
                ? 'bg-slate-800/80 text-white border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TerminalIcon className="w-3.5 h-3.5" />
            <span>Terminal ({agentRun.terminalLogs.length})</span>
          </button>

          <button
            onClick={() => setActiveViewTab('tests')}
            className={`px-3 py-1.5 rounded-t-lg font-medium transition-all flex items-center space-x-1.5 ${
              activeViewTab === 'tests'
                ? 'bg-slate-800/80 text-white border-b-2 border-indigo-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FlaskConical className="w-3.5 h-3.5" />
            <span>Browser Tests ({passedTestsCount}/{agentRun.tests.length})</span>
          </button>

          {agentRun.selfHealingLogs.length > 0 && (
            <button
              onClick={() => setActiveViewTab('healing')}
              className={`px-3 py-1.5 rounded-t-lg font-medium transition-all flex items-center space-x-1.5 ${
                activeViewTab === 'healing'
                  ? 'bg-slate-800/80 text-white border-b-2 border-emerald-500'
                  : 'text-emerald-400 hover:text-emerald-300'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Self-Healing ({agentRun.selfHealingLogs.length})</span>
            </button>
          )}
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto flex-1 font-sans space-y-2.5 min-h-[260px]">
          {/* 1. Steps Plan Tab */}
          {activeViewTab === 'steps' && (
            <div className="space-y-2">
              {agentRun.steps.map((step, idx) => {
                const isStepDone = step.status === 'completed';
                const isStepRunning = step.status === 'running';

                return (
                  <div 
                    key={step.id} 
                    className={`p-2.5 rounded-xl border transition-all flex items-center justify-between text-xs ${
                      isStepRunning 
                        ? 'bg-indigo-600/10 border-indigo-500/50 shadow-sm' 
                        : isStepDone 
                        ? 'bg-slate-900/40 border-slate-800/60' 
                        : 'bg-transparent border-transparent opacity-50'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      {isStepDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : isStepRunning ? (
                        <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                      <span className={`font-medium ${
                        isStepDone 
                          ? 'text-slate-200' 
                          : isStepRunning 
                          ? 'text-indigo-300 font-semibold' 
                          : 'text-slate-500'
                      }`}>
                        {step.label}
                      </span>
                    </div>

                    {isStepDone && (
                      <span className="text-[10px] text-emerald-400/80 font-mono">✓ Done</span>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* 2. Terminal Log Tab */}
          {activeViewTab === 'terminal' && (
            <div className="bg-[#05070d] p-3.5 rounded-xl border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1 overflow-x-auto">
              {agentRun.terminalLogs.map((log, idx) => (
                <div 
                  key={idx} 
                  className={
                    log.startsWith('$') ? 'text-indigo-400 font-bold' :
                    log.includes('✓') ? 'text-emerald-400' :
                    log.includes('TEST') ? 'text-amber-300 font-bold' :
                    'text-slate-400'
                  }
                >
                  {log}
                </div>
              ))}
            </div>
          )}

          {/* 3. Browser E2E Tests Tab */}
          {activeViewTab === 'tests' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs px-1 pb-1">
                <span className="text-slate-400">Autonomous Browser Test Matrix ("Eyes")</span>
                <span className="text-emerald-400 font-bold font-mono">
                  Passed: {passedTestsCount} / {agentRun.tests.length}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {agentRun.tests.map((test) => (
                  <div 
                    key={test.id}
                    className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                      test.status === 'passed'
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                        : test.status === 'running'
                        ? 'bg-indigo-950/30 border-indigo-500/40 text-indigo-300 animate-pulse'
                        : 'bg-slate-900/30 border-slate-800/40 text-slate-500'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      {test.status === 'passed' ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      ) : test.status === 'running' ? (
                        <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin shrink-0" />
                      ) : (
                        <Circle className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                      )}
                      <span className="truncate font-medium">{test.name}</span>
                    </div>
                    {test.duration && (
                      <span className="text-[10px] text-slate-500 font-mono">{test.duration}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Self-Healing Tab */}
          {activeViewTab === 'healing' && (
            <div className="space-y-3">
              {agentRun.selfHealingLogs.map((heal) => (
                <div key={heal.id} className="p-3.5 rounded-2xl bg-[#090f1a] border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Self-Healing Engine (Auto-Diagnosed & Patched)</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-semibold uppercase">
                      ✓ Verified
                    </span>
                  </div>
                  <div className="text-xs text-slate-300 font-mono bg-black/40 p-2.5 rounded-lg border border-slate-800 space-y-1">
                    <div className="text-rose-400">❌ Original Diagnostic: {heal.originalError}</div>
                    <div className="text-amber-400">🔍 Root Cause: {heal.rootCause}</div>
                    <div className="text-emerald-400">🛠️ Auto-Patch Applied: {heal.fileFixed} ({heal.diffSummary})</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Completed Action Controls */}
        {isCompleted && (
          <div className="p-3.5 bg-gradient-to-r from-indigo-950/40 via-purple-950/30 to-emerald-950/30 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2 px-5">
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>All {agentRun.tests.length} tests verified green</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  refreshPreview();
                  setIsAgentModalOpen(false);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center space-x-1.5 shadow-md transition-all cursor-pointer"
              >
                <Play className="w-3.5 h-3.5" />
                <span>Open Live Preview</span>
              </button>

              <button
                onClick={() => deployProjectToVercel()}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Rocket className="w-3.5 h-3.5" />
                <span>Deploy Live</span>
              </button>

              <button
                onClick={() => pushProjectToGitHub()}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center space-x-1.5 transition-all cursor-pointer"
              >
                <Github className="w-3.5 h-3.5" />
                <span>Push GitHub</span>
              </button>
            </div>
          </div>
        )}

        {/* Non-completed Footer */}
        {!isCompleted && (
          <div className="p-4 bg-[#0a0d15] dark:bg-[#0a0d15] light:bg-slate-100 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400 text-[11px]">Real-time autonomous execution & E2E verification</span>
            <button
              onClick={() => setIsAgentModalOpen(false)}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs cursor-pointer"
            >
              Run in Background
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

