import React from 'react';
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
  Minimize2
} from 'lucide-react';
import { AnimatedInfinity } from '../common/AnimatedInfinity';
import { useAI } from '../../context/AIContext';

export const AgentProgressModal: React.FC = () => {
  const { 
    agentRun, 
    cancelAgentRun, 
    isAgentModalOpen, 
    setIsAgentModalOpen,
    infinityState 
  } = useAI();

  if (!isAgentModalOpen || !agentRun) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-lg bg-[#0e1320] dark:bg-[#0e1320] light:bg-white rounded-3xl border border-indigo-500/30 dark:border-indigo-500/30 light:border-slate-300 shadow-2xl overflow-hidden flex flex-col">
        {/* Header matching screenshot card 3 */}
        <div className="p-6 pb-4 border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AnimatedInfinity state={infinityState} size="sm" />
            <div>
              <h2 className="text-base font-bold text-white dark:text-white light:text-slate-900">
                Infinity is working...
              </h2>
              <p className="text-[11px] text-slate-400 truncate max-w-xs">{agentRun.prompt}</p>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => setIsAgentModalOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50"
              title="Run in Background"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={cancelAgentRun}
              className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/50"
              title="Cancel Agent Run"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Steps Checklist matching screenshot */}
        <div className="p-6 space-y-3 max-h-96 overflow-y-auto font-sans">
          {agentRun.steps.map((step) => {
            const isCompleted = step.status === 'completed';
            const isRunning = step.status === 'running';

            return (
              <div 
                key={step.id} 
                className={`p-2.5 rounded-xl border transition-all flex flex-col space-y-1.5 ${
                  isRunning 
                    ? 'bg-indigo-600/10 border-indigo-500/40' 
                    : isCompleted 
                    ? 'bg-slate-900/40 border-slate-800/60' 
                    : 'bg-transparent border-transparent opacity-60'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2.5">
                    {isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : isRunning ? (
                      <div className="w-4 h-4 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-600" />
                    )}
                    <span className={`font-medium ${
                      isCompleted 
                        ? 'text-slate-200 dark:text-slate-200 light:text-slate-800' 
                        : isRunning 
                        ? 'text-indigo-400 font-semibold' 
                        : 'text-slate-500'
                    }`}>
                      {step.label}
                    </span>
                  </div>

                  {step.duration && (
                    <span className="text-[10px] text-slate-500 font-mono">{step.duration}</span>
                  )}
                </div>

                {/* Modified Files detail */}
                {step.modifiedFiles && step.modifiedFiles.length > 0 && (
                  <div className="pl-6 space-y-1">
                    {step.modifiedFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-mono">
                        <FileCode className="w-3 h-3 text-indigo-400" />
                        <span>{file}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0a0d15] dark:bg-[#0a0d15] light:bg-slate-100 border-t border-slate-800 flex items-center justify-between text-xs">
          <span className="text-slate-400 text-[11px]">Real-time progress and transparency</span>
          {agentRun.status === 'completed' ? (
            <button
              onClick={() => setIsAgentModalOpen(false)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs transition-colors"
            >
              Done & Explore
            </button>
          ) : (
            <button
              onClick={() => setIsAgentModalOpen(false)}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs"
            >
              Hide & Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
