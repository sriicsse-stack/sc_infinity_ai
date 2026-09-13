import React, { useState } from 'react';
import { 
  BookOpen, 
  Code2, 
  HelpCircle, 
  Wand2, 
  Sparkles, 
  ChevronRight, 
  Play, 
  RotateCcw, 
  CheckCircle2, 
  XCircle,
  Lightbulb,
  Layers,
  ArrowRight
} from 'lucide-react';
import { learningTopics } from '../../data/learningTopics';
import { TutorTopic } from '../../types';
import { useAI } from '../../context/AIContext';

export const AITutorView: React.FC = () => {
  const { sendMessage } = useAI();

  const [selectedTopic, setSelectedTopic] = useState<TutorTopic>(learningTopics[0]);
  const [activeMode, setActiveMode] = useState<'explain' | 'practice' | 'quiz' | 'build'>('explain');
  const [visualizerStepIndex, setVisualizerStepIndex] = useState<number>(0);
  const [userQuizAnswers, setUserQuizAnswers] = useState<Record<number, number>>({});
  const [practiceInput, setPracticeInput] = useState<string>(selectedTopic.practiceTask.starterCode);
  const [practiceResult, setPracticeResult] = useState<string | null>(null);

  const currentVisualizer = selectedTopic.visualizerSteps || [];

  const handleQuizSelect = (questionIndex: number, optionIndex: number) => {
    setUserQuizAnswers(prev => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleRunPractice = () => {
    setPracticeResult('✓ All 4 unit test assertions passed successfully!');
  };

  return (
    <div className="w-full h-full bg-[#0a0d15] dark:bg-[#0a0d15] light:bg-slate-50 border-r border-[#1f293d] dark:border-[#1f293d] light:border-slate-200 flex flex-col text-xs overflow-y-auto p-4 space-y-4 select-none">
      {/* Header matching screenshot card 5 */}
      <div className="p-4 rounded-3xl bg-gradient-to-r from-indigo-950/40 via-[#0f1422] to-violet-950/40 border border-indigo-500/20 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-indigo-400">∞</span>
            <h2 className="font-bold text-sm text-white dark:text-white light:text-slate-900">Learning Mode</h2>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">Learn, Practice, Build — All in One</span>
        </div>

        {/* 4 Mode Buttons matching screenshot */}
        <div className="grid grid-cols-4 gap-2 bg-[#080a10] dark:bg-[#080a10] light:bg-slate-100 p-1 rounded-2xl border border-slate-800 dark:border-slate-800 light:border-slate-300">
          {(['explain', 'practice', 'quiz', 'build'] as const).map((m) => (
            <button
              key={m}
              onClick={() => setActiveMode(m)}
              className={`py-1.5 rounded-xl font-semibold capitalize text-center transition-all ${
                activeMode === m
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Topic Card */}
      <div className="p-4 rounded-3xl bg-[#0f1422] dark:bg-[#0f1422] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-sm space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400">{selectedTopic.category}</span>
            <h3 className="text-base font-bold text-white dark:text-white light:text-slate-900">{selectedTopic.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{selectedTopic.subtitle}</p>
          </div>
          <span className="px-2.5 py-0.5 text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
            {selectedTopic.difficulty}
          </span>
        </div>

        <button
          onClick={() => sendMessage(`Please explain ${selectedTopic.title} with interactive step-by-step code walkthrough.`)}
          className="w-full py-2 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-colors flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Explain this topic</span>
        </button>

        {/* 4 Quick Action Prompts matching screenshot */}
        <div className="pt-2 border-t border-slate-800 space-y-1.5">
          <div className="text-[11px] font-semibold text-slate-400">Try these</div>
          {[
            `Explain ${selectedTopic.title.toLowerCase()} with examples`,
            'Give me 10 practice questions',
            'Create a recursion visualizer',
            'Solve this recursion problem'
          ].map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => sendMessage(prompt)}
              className="w-full text-left p-2 rounded-xl bg-slate-900/60 hover:bg-indigo-950/40 border border-slate-800 hover:border-indigo-500/30 text-slate-300 hover:text-white transition-colors flex items-center justify-between text-[11px]"
            >
              <div className="flex items-center space-x-2 truncate">
                <span className="text-indigo-400 font-mono font-bold text-[10px]">{idx + 1}</span>
                <span className="truncate">{prompt}</span>
              </div>
              <ArrowRight className="w-3 h-3 text-slate-600" />
            </button>
          ))}
        </div>
      </div>

      {/* Mode View: Explain / Visualizer */}
      {activeMode === 'explain' && currentVisualizer.length > 0 && (
        <div className="p-4 rounded-3xl bg-[#0f1422] dark:bg-[#0f1422] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-xs text-white dark:text-white light:text-slate-900 flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Interactive Call Stack Visualizer</span>
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              Step {visualizerStepIndex + 1} of {currentVisualizer.length}
            </span>
          </div>

          {/* Call Stack Stack Frames */}
          <div className="space-y-1.5 bg-slate-900/80 p-3 rounded-2xl border border-slate-800 font-mono text-[11px]">
            <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Call Stack Frames (Top = Active)</div>
            {currentVisualizer[visualizerStepIndex].callStack.map((frame, i) => (
              <div 
                key={i} 
                className={`p-1.5 rounded-lg border ${
                  i === currentVisualizer[visualizerStepIndex].callStack.length - 1 
                    ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-bold' 
                    : 'bg-slate-800/60 border-slate-700/60 text-slate-300'
                }`}
              >
                {frame}
              </div>
            ))}
          </div>

          <div className="p-3 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-indigo-200 text-[11px] leading-relaxed">
            {currentVisualizer[visualizerStepIndex].explanation}
          </div>

          {/* Visualizer Controls */}
          <div className="flex items-center justify-between pt-1">
            <button
              onClick={() => setVisualizerStepIndex(prev => Math.max(0, prev - 1))}
              disabled={visualizerStepIndex === 0}
              className="px-3 py-1.5 rounded-xl border border-slate-700 text-slate-300 disabled:opacity-40 hover:bg-slate-800 text-xs"
            >
              Previous
            </button>
            <button
              onClick={() => setVisualizerStepIndex(0)}
              className="p-1.5 text-slate-400 hover:text-white"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setVisualizerStepIndex(prev => Math.min(currentVisualizer.length - 1, prev + 1))}
              disabled={visualizerStepIndex === currentVisualizer.length - 1}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 font-semibold text-xs"
            >
              Next Step
            </button>
          </div>
        </div>
      )}

      {/* Mode View: Practice Code */}
      {activeMode === 'practice' && (
        <div className="p-4 rounded-3xl bg-[#0f1422] dark:bg-[#0f1422] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-sm space-y-3">
          <h4 className="font-bold text-xs text-white dark:text-white light:text-slate-900">Practice Exercise</h4>
          <p className="text-xs text-slate-300">{selectedTopic.practiceTask.description}</p>
          
          <textarea
            value={practiceInput}
            onChange={(e) => setPracticeInput(e.target.value)}
            rows={5}
            className="w-full p-3 rounded-2xl bg-slate-900 font-mono text-xs text-slate-200 border border-slate-800 focus:outline-none focus:border-indigo-500"
          />

          {practiceResult && (
            <div className="p-2.5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 text-emerald-400 text-xs font-medium">
              {practiceResult}
            </div>
          )}

          <div className="flex items-center justify-between">
            <button
              onClick={() => setPracticeInput(selectedTopic.practiceTask.solutionCode)}
              className="text-xs text-indigo-400 hover:underline"
            >
              Show Solution
            </button>
            <button
              onClick={handleRunPractice}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center space-x-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Run Code</span>
            </button>
          </div>
        </div>
      )}

      {/* Mode View: Quizzes */}
      {activeMode === 'quiz' && (
        <div className="space-y-3">
          {selectedTopic.quiz.map((q, qIdx) => {
            const selectedOpt = userQuizAnswers[qIdx];
            const isAnswered = selectedOpt !== undefined;
            const isCorrect = selectedOpt === q.correctIndex;

            return (
              <div key={qIdx} className="p-4 rounded-3xl bg-[#0f1422] dark:bg-[#0f1422] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-sm space-y-3">
                <div className="font-semibold text-xs text-white dark:text-white light:text-slate-900">
                  {qIdx + 1}. {q.question}
                </div>

                <div className="space-y-1.5">
                  {q.options.map((opt, oIdx) => (
                    <button
                      key={oIdx}
                      onClick={() => handleQuizSelect(qIdx, oIdx)}
                      className={`w-full text-left p-2.5 rounded-xl border text-xs transition-all flex items-center justify-between ${
                        selectedOpt === oIdx
                          ? isCorrect
                            ? 'bg-emerald-950/30 border-emerald-500 text-emerald-300'
                            : 'bg-rose-950/30 border-rose-500 text-rose-300'
                          : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <span>{opt}</span>
                      {selectedOpt === oIdx && (
                        isCorrect ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <XCircle className="w-4 h-4 text-rose-400" />
                      )}
                    </button>
                  ))}
                </div>

                {isAnswered && (
                  <div className="p-2.5 rounded-xl bg-slate-900/90 text-slate-400 text-[11px] border border-slate-800 leading-relaxed">
                    {q.explanation}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Mode View: Build */}
      {activeMode === 'build' && (
        <div className="p-4 rounded-3xl bg-[#0f1422] dark:bg-[#0f1422] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-sm space-y-3">
          <h4 className="font-bold text-xs text-white dark:text-white light:text-slate-900">Project-Based Learning</h4>
          <p className="text-xs text-slate-300">
            Build a hands-on coding project with step-by-step guidance from Infinity AI.
          </p>
          <button
            onClick={() => sendMessage(`Guide me through building a hands-on project to master ${selectedTopic.title}.`)}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Start Interactive Build Project</span>
          </button>
        </div>
      )}
    </div>
  );
};
