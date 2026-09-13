import React, { useState } from 'react';
import { 
  Sparkles, 
  Wand2, 
  BookOpen, 
  Wrench, 
  Mic, 
  MicOff,
  ArrowRight, 
  Clock, 
  FolderOpen,
  Languages,
  GraduationCap,
  Rocket,
  Code2,
  GitBranch,
  CloudUpload,
  Cpu,
  BrainCircuit,
  SlidersHorizontal
} from 'lucide-react';
import { AnimatedInfinity } from '../common/AnimatedInfinity';
import { useProject } from '../../context/ProjectContext';
import { useAI } from '../../context/AIContext';
import { usePersonalization } from '../../context/PersonalizationContext';
import { voiceAssistant, VoiceLanguage } from '../../services/voiceAssistant';

interface HomeViewProps {
  onOpenWorkspace: () => void;
  onOpenNewProjectModal: () => void;
  onOpenOnboarding?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onOpenWorkspace,
  onOpenNewProjectModal,
  onOpenOnboarding
}) => {
  const { projects, setCurrentProject } = useProject();
  const { sendMessage, startAgentRun, infinityState } = useAI();
  const { profile, resetOnboarding } = usePersonalization();
  
  const [promptInput, setPromptInput] = useState('');
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [voiceLang, setVoiceLang] = useState<VoiceLanguage>('ta-IN');

  const isStudentOrLearner = profile.role === 'student' || profile.purpose === 'learn' || profile.experienceLevel === 'beginner';
  const primaryStack = profile.techStacks?.[0] || 'React';

  const handlePromptSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (promptInput.trim()) {
      startAgentRun(promptInput.trim());
      onOpenWorkspace();
    }
  };

  const handleSelectProject = (proj: any) => {
    setCurrentProject(proj);
    onOpenWorkspace();
  };

  const toggleVoice = () => {
    if (isVoiceRecording) {
      voiceAssistant.stopListening();
      setIsVoiceRecording(false);
      return;
    }

    const started = voiceAssistant.startListening({
      language: voiceLang,
      continuous: true,
      interimResults: true,
      onStart: () => setIsVoiceRecording(true),
      onResult: (text, isFinal) => {
        setPromptInput(text);
        if (isFinal) {
          setTimeout(() => setIsVoiceRecording(false), 1500);
        }
      },
      onError: () => setIsVoiceRecording(false),
      onEnd: () => setIsVoiceRecording(false)
    });

    if (!started) {
      setIsVoiceRecording(true);
      setTimeout(() => {
        setPromptInput(voiceLang === 'ta-IN' ? 'ஒரு புதிய கால்குலேட்டர் ஆப் பில்ட் பண்ணு' : 'Build a sleek modern dashboard app');
        setIsVoiceRecording(false);
      }, 1200);
    }
  };

  return (
    <div className="w-full h-full bg-[#080a10] dark:bg-[#080a10] light:bg-slate-50 overflow-y-auto flex flex-col items-center justify-center p-6 sm:p-12 relative select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/10 dark:bg-indigo-600/10 light:bg-indigo-400/15 rounded-full blur-[120px] pointer-events-none" />

      {/* Top Profile Badge */}
      <div className="absolute top-6 right-6 flex items-center space-x-2">
        <button
          onClick={() => {
            if (onOpenOnboarding) {
              onOpenOnboarding();
            } else {
              resetOnboarding();
            }
          }}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 hover:text-white hover:border-indigo-500/40 transition-all cursor-pointer backdrop-blur-md"
          title="Customize Workspace Profile"
        >
          <SlidersHorizontal className="w-3 h-3 text-indigo-400" />
          <span className="capitalize">{profile.role} Mode</span>
          <span className="text-slate-500">•</span>
          <span className="text-indigo-300 font-semibold">{primaryStack}</span>
        </button>
      </div>

      <div className="w-full max-w-2xl flex flex-col items-center text-center space-y-6 relative z-10">
        {/* Brand Icon & Heading */}
        <div className="flex flex-col items-center space-y-3">
          <AnimatedInfinity state={infinityState} size="xl" />
          
          {isStudentOrLearner ? (
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Personalized {primaryStack} Learning Workspace</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white dark:text-white light:text-slate-900">
                Welcome back, Learner!
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                What would you like to master or build today?
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
                <Rocket className="w-3.5 h-3.5" />
                <span>AI Product Engineering Workspace</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white dark:text-white light:text-slate-900">
                Build your next product
              </h1>
              <p className="text-xs sm:text-sm text-slate-400">
                Turn your product ideas into working code & live deployment in minutes.
              </p>
            </div>
          )}
        </div>

        {/* Hero Prompt Box */}
        <div className="w-full">
          <form 
            onSubmit={handlePromptSubmit} 
            className="w-full p-2.5 rounded-2xl bg-[#0f1422]/90 dark:bg-[#0f1422]/90 light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-300 shadow-2xl backdrop-blur-xl focus-within:border-indigo-500 transition-all flex flex-col space-y-2"
          >
            <div className="px-3 pt-2">
              <input
                type="text"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder={
                  voiceLang === 'ta-IN'
                    ? (isStudentOrLearner ? "ஜாவா / பைதான் கான்செப்ட் கேளுங்கள் அல்லது ஒரு ஆப் உருவாக்க சொல்லுங்கள்" : "இன்று நீங்கள் என்ன ஆப் உருவாக்க விரும்புகிறீர்கள்? (தமிழ் / English)")
                    : (isStudentOrLearner ? `Explain ${primaryStack} concepts, practice code, or build a student project...` : "What do you want to build today? (Type or speak in Tamil / English)")
                }
                className="w-full bg-transparent border-none outline-none text-white dark:text-white light:text-slate-900 placeholder-slate-500 text-sm sm:text-base focus:ring-0 p-0"
              />
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 px-2">
              <div className="flex items-center space-x-2 text-slate-400">
                <button
                  type="button"
                  onClick={() => setVoiceLang(voiceLang === 'ta-IN' ? 'en-US' : 'ta-IN')}
                  className="px-2 py-0.5 rounded-lg bg-slate-800/60 hover:bg-slate-700 text-[10px] text-indigo-300 font-semibold flex items-center space-x-1"
                  title="Switch Voice Recognition Language"
                >
                  <Languages className="w-3 h-3 text-indigo-400" />
                  <span>{voiceLang === 'ta-IN' ? '🇮🇳 தமிழ்' : '🌐 English'}</span>
                </button>

                <button
                  type="button"
                  onClick={toggleVoice}
                  className={`p-1.5 rounded-lg transition-all ${
                    isVoiceRecording
                      ? 'text-white bg-rose-600 shadow-md shadow-rose-600/30 animate-pulse'
                      : 'hover:text-white hover:bg-slate-800/50'
                  }`}
                  title="Voice Prompt (Tamil / English)"
                >
                  {isVoiceRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-indigo-400" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={!promptInput.trim()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
              >
                <span>Build with Infinity</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </div>

        {/* Personalized Action Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 w-full">
          {isStudentOrLearner ? (
            <>
              <button
                onClick={() => {
                  onOpenWorkspace();
                  sendMessage(`Explain the core fundamentals of ${primaryStack} with clean examples.`);
                }}
                className="flex items-center justify-center space-x-2 p-3 rounded-2xl bg-[#0f1422] dark:bg-[#0f1422] light:bg-white hover:bg-indigo-600/10 border border-slate-800 dark:border-slate-800 light:border-slate-200 hover:border-indigo-500/40 text-slate-200 transition-all shadow-sm group cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">Explain {primaryStack}</span>
              </button>

              <button
                onClick={() => {
                  onOpenWorkspace();
                  sendMessage('Give me a hands-on coding practice problem with starter code.');
                }}
                className="flex items-center justify-center space-x-2 p-3 rounded-2xl bg-[#0f1422] dark:bg-[#0f1422] light:bg-white hover:bg-indigo-600/10 border border-slate-800 dark:border-slate-800 light:border-slate-200 hover:border-indigo-500/40 text-slate-200 transition-all shadow-sm group cursor-pointer"
              >
                <BrainCircuit className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">Practice DSA</span>
              </button>

              <button
                onClick={() => {
                  onOpenWorkspace();
                  sendMessage('Start an interactive quiz to test my programming skills.');
                }}
                className="flex items-center justify-center space-x-2 p-3 rounded-2xl bg-[#0f1422] dark:bg-[#0f1422] light:bg-white hover:bg-indigo-600/10 border border-slate-800 dark:border-slate-800 light:border-slate-200 hover:border-indigo-500/40 text-slate-200 transition-all shadow-sm group cursor-pointer"
              >
                <GraduationCap className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">Take Quiz</span>
              </button>

              <button
                onClick={onOpenNewProjectModal}
                className="flex items-center justify-center space-x-2 p-3 rounded-2xl bg-[#0f1422] dark:bg-[#0f1422] light:bg-white hover:bg-indigo-600/10 border border-slate-800 dark:border-slate-800 light:border-slate-200 hover:border-indigo-500/40 text-slate-200 transition-all shadow-sm group cursor-pointer"
              >
                <Wand2 className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">Build Project</span>
              </button>
            </>
          ) : (
            <>
              <button
                onClick={onOpenNewProjectModal}
                className="flex items-center justify-center space-x-2 p-3 rounded-2xl bg-[#0f1422] dark:bg-[#0f1422] light:bg-white hover:bg-indigo-600/10 border border-slate-800 dark:border-slate-800 light:border-slate-200 hover:border-indigo-500/40 text-slate-200 transition-all shadow-sm group cursor-pointer"
              >
                <Wand2 className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">Create Project</span>
              </button>

              <button
                onClick={() => {
                  onOpenWorkspace();
                  sendMessage('Start the Multi-Agent orchestrator pipeline to build the active project.');
                }}
                className="flex items-center justify-center space-x-2 p-3 rounded-2xl bg-[#0f1422] dark:bg-[#0f1422] light:bg-white hover:bg-indigo-600/10 border border-slate-800 dark:border-slate-800 light:border-slate-200 hover:border-indigo-500/40 text-slate-200 transition-all shadow-sm group cursor-pointer"
              >
                <Cpu className="w-4 h-4 text-pink-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">AI Agent</span>
              </button>

              <button
                onClick={() => {
                  onOpenWorkspace();
                  sendMessage('Check git status, commit changes, and prepare for GitHub push.');
                }}
                className="flex items-center justify-center space-x-2 p-3 rounded-2xl bg-[#0f1422] dark:bg-[#0f1422] light:bg-white hover:bg-indigo-600/10 border border-slate-800 dark:border-slate-800 light:border-slate-200 hover:border-indigo-500/40 text-slate-200 transition-all shadow-sm group cursor-pointer"
              >
                <GitBranch className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">GitHub Sync</span>
              </button>

              <button
                onClick={() => {
                  onOpenWorkspace();
                  sendMessage('Audit security and deploy this project to Vercel production edge.');
                }}
                className="flex items-center justify-center space-x-2 p-3 rounded-2xl bg-[#0f1422] dark:bg-[#0f1422] light:bg-white hover:bg-indigo-600/10 border border-slate-800 dark:border-slate-800 light:border-slate-200 hover:border-indigo-500/40 text-slate-200 transition-all shadow-sm group cursor-pointer"
              >
                <CloudUpload className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-xs font-semibold">Deploy Live</span>
              </button>
            </>
          )}
        </div>

        {/* Recent Projects Section */}
        <div className="w-full pt-4 text-left space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 dark:text-slate-400 light:text-slate-600 uppercase tracking-wider">
              Recent Projects
            </span>
            <button 
              onClick={onOpenNewProjectModal} 
              className="text-xs text-indigo-400 hover:underline font-medium flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {projects.slice(0, 3).map((proj) => (
              <div
                key={proj.id}
                onClick={() => handleSelectProject(proj)}
                className="p-4 rounded-2xl bg-[#0f1422] dark:bg-[#0f1422] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 hover:border-indigo-500/50 hover:bg-indigo-950/10 transition-all cursor-pointer shadow-sm group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-sm text-white dark:text-white light:text-slate-900 group-hover:text-indigo-400 transition-colors">
                    {proj.name}
                  </div>
                  <FolderOpen className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
                </div>
                <div className="text-[11px] text-slate-400 mb-2 font-medium">
                  {proj.technology}
                </div>
                <div className="text-[10px] text-slate-500 flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>{proj.lastModified}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
