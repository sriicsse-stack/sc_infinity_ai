import React, { useState } from 'react';
import { 
  Sparkles, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  X, 
  GraduationCap, 
  Code2, 
  Rocket, 
  Briefcase, 
  Building2, 
  User, 
  Layers, 
  BrainCircuit, 
  ShieldCheck, 
  Wand2, 
  Bug, 
  Eye, 
  FlaskConical, 
  Send, 
  Trophy, 
  Zap, 
  CheckCircle2, 
  CreditCard,
  Play
} from 'lucide-react';
import { AnimatedInfinity } from '../common/AnimatedInfinity';
import { usePersonalization } from '../../context/PersonalizationContext';
import { useCredits } from '../../context/CreditsContext';
import { useAI } from '../../context/AIContext';

interface OnboardingModalProps {
  onOpenWorkspace: () => void;
  onOpenPricingModal?: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  onOpenWorkspace,
  onOpenPricingModal
}) => {
  const { 
    isOnboardingOpen, 
    completeOnboarding, 
    skipOnboarding, 
    calculateRecommendedPlan 
  } = usePersonalization();

  const { upgradePlan } = useCredits();
  const { startAgentRun } = useAI();

  const [step, setStep] = useState<number>(1);
  const totalSteps = 8;

  // Form states
  const [purpose, setPurpose] = useState<string>('learn');
  const [role, setRole] = useState<string>('student');
  const [experienceLevel, setExperienceLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [techStacks, setTechStacks] = useState<string[]>(['Java', 'React', 'Web Apps']);
  const [aiAssistanceStyles, setAiAssistanceStyles] = useState<string[]>([
    'explain',
    'build_features',
    'fix_bugs'
  ]);
  const [primaryGoal, setPrimaryGoal] = useState<string>('learn_faster');
  const [firstProjectPrompt, setFirstProjectPrompt] = useState<string>('Create a college attendance system with student dashboard');

  if (!isOnboardingOpen) return null;

  const toggleTechStack = (tech: string) => {
    setTechStacks(prev => 
      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
    );
  };

  const toggleAiStyle = (style: string) => {
    setAiAssistanceStyles(prev => 
      prev.includes(style) ? prev.filter(s => s !== style) : [...prev, style]
    );
  };

  const recommendedPlan = calculateRecommendedPlan({
    purpose,
    role,
    experienceLevel,
    primaryGoal
  });

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSelectPlan = (plan: 'free' | 'student' | 'plus' | 'pro') => {
    if (plan !== 'free') {
      upgradePlan(plan);
    }
    setStep(8); // Move to First Project screen
  };

  const handleBuildFirstProject = (promptToRun: string) => {
    completeOnboarding({
      purpose,
      role,
      experienceLevel,
      techStacks,
      aiAssistanceStyles,
      primaryGoal,
      firstProjectIdea: promptToRun
    });
    if (promptToRun.trim()) {
      startAgentRun(promptToRun.trim());
    }
    onOpenWorkspace();
  };

  const handleFinishOnboarding = () => {
    completeOnboarding({
      purpose,
      role,
      experienceLevel,
      techStacks,
      aiAssistanceStyles,
      primaryGoal
    });
    onOpenWorkspace();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-xl animate-in fade-in select-none">
      {/* Background ambient lighting */}
      <div className="absolute w-[600px] h-[400px] bg-indigo-600/15 dark:bg-indigo-600/15 light:bg-indigo-400/20 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-2xl bg-[#0c101c] dark:bg-[#0c101c] light:bg-white rounded-3xl border border-indigo-500/30 dark:border-indigo-500/30 light:border-slate-300 shadow-2xl flex flex-col overflow-hidden relative z-10 max-h-[90vh]">
        {/* Top Progress & Skip Header */}
        <div className="px-6 pt-5 pb-3 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-7 h-7 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center">
              <AnimatedInfinity state="ai_thinking" size="sm" />
            </div>
            <div>
              <span className="text-xs font-bold text-white tracking-wide">SC INFINITY ONBOARDING</span>
              <div className="text-[10px] text-indigo-400 font-medium">Step {step} of {totalSteps}</div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={skipOnboarding}
              className="text-xs text-slate-400 hover:text-slate-200 transition-colors px-2.5 py-1 rounded-lg hover:bg-slate-800/50"
            >
              Skip for now
            </button>
            <button
              onClick={skipOnboarding}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="w-full bg-slate-900 h-1">
          <div 
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-full transition-all duration-300 shadow-sm shadow-indigo-500/50"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Modal Body Container */}
        <div className="flex-1 p-6 sm:p-8 overflow-y-auto space-y-6">

          {/* SCREEN 1: Welcome & Purpose */}
          {step === 1 && (
            <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="flex flex-col items-center space-y-2">
                <AnimatedInfinity state="building" size="lg" />
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                  Welcome to <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">SC INFINITY ∞</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 italic">
                  Your AI-powered development workspace. Think. Build. Debug. Deploy.
                </p>
              </div>

              <div className="text-left space-y-3 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>What are you here to build?</span>
                </label>

                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { id: 'learn', label: '🎓 Learn & Practice', desc: 'Master coding fundamentals, DSA, algorithms & quizzes' },
                    { id: 'projects', label: '💻 Build Projects', desc: 'Create full-stack web apps, backend APIs, and fun games' },
                    { id: 'products', label: '🚀 Build Products / Startups', desc: 'Ship production MVPs and launch real applications' },
                    { id: 'career', label: '💼 Career & Portfolio', desc: 'Build resume-worthy GitHub projects and ace tech interviews' },
                    { id: 'professional', label: '🏢 Professional Development', desc: 'Enterprise-grade microservices and production scaling' }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setPurpose(item.id)}
                      className={`w-full p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        purpose === item.id
                          ? 'bg-indigo-950/60 border-indigo-500/80 shadow-lg shadow-indigo-600/20 text-white'
                          : 'bg-[#111625] border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold">{item.label}</div>
                        <div className="text-[11px] text-slate-400">{item.desc}</div>
                      </div>
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                        purpose === item.id ? 'bg-indigo-600 border-indigo-400 text-white' : 'border-slate-700'
                      }`}>
                        {purpose === item.id && <Check className="w-3 h-3" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* SCREEN 2: Who are you? */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-1 text-center">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  Tell us a little about yourself
                </h2>
                <p className="text-xs text-slate-400">
                  We'll customize your AI assistant tone and tools to match your role.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { id: 'student', label: '🧑‍🎓 Student', desc: 'College / School / Bootcamp' },
                  { id: 'developer', label: '👨‍💻 Developer', desc: 'Full-stack / Frontend / Backend' },
                  { id: 'founder', label: '🚀 Founder', desc: 'Indie Builder / Startup' },
                  { id: 'professional', label: '👩‍💼 Professional', desc: 'Working Software Engineer' },
                  { id: 'educator', label: '👨‍🏫 Educator', desc: 'Instructor / Professor' },
                  { id: 'other', label: '💡 Other', desc: 'Curious Tech Explorer' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setRole(item.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-2 cursor-pointer ${
                      role === item.id
                        ? 'bg-indigo-950/60 border-indigo-500/80 shadow-lg shadow-indigo-600/20 text-white'
                        : 'bg-[#111625] border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="text-sm font-bold">{item.label}</div>
                    <div className="text-[11px] text-slate-400">{item.desc}</div>
                    <div className="flex justify-end">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                        role === item.id ? 'bg-indigo-600 border-indigo-400 text-white' : 'border-slate-700'
                      }`}>
                        {role === item.id && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN 3: Coding Experience Level */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-1 text-center">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  How comfortable are you with coding?
                </h2>
                <p className="text-xs text-slate-400">
                  Infinity adjusts its code explanations and autonomy level to match your expertise.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                {[
                  { 
                    id: 'beginner', 
                    title: '🌱 Beginner', 
                    subtitle: "I'm just starting out", 
                    desc: 'Clear line-by-line explanations, interactive tutor, visual call-stacks, and guided bug fixing.' 
                  },
                  { 
                    id: 'intermediate', 
                    title: '⚡ Intermediate', 
                    subtitle: 'I can build projects', 
                    desc: 'Multi-file code generation, fast refactoring, clean architecture suggestions, and terminal debugging.' 
                  },
                  { 
                    id: 'advanced', 
                    title: '🔥 Advanced', 
                    subtitle: 'I build production applications', 
                    desc: 'Autonomous multi-agent orchestration, high-performance optimization, and direct cloud deployment.' 
                  }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setExperienceLevel(item.id as any)}
                    className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                      experienceLevel === item.id
                        ? 'bg-indigo-950/60 border-indigo-500/80 shadow-lg shadow-indigo-600/20 text-white'
                        : 'bg-[#111625] border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-bold">{item.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-medium">
                          {item.subtitle}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 max-w-md">{item.desc}</div>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border shrink-0 ${
                      experienceLevel === item.id ? 'bg-indigo-600 border-indigo-400 text-white' : 'border-slate-700'
                    }`}>
                      {experienceLevel === item.id && <Check className="w-3 h-3" />}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN 4: What do you build? (Multi-select) */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-1 text-center">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  What technologies do you want to work with?
                </h2>
                <p className="text-xs text-slate-400">
                  Select all the stacks and languages you use or want to learn.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                {[
                  { id: 'Web Apps', icon: '🌐' },
                  { id: 'React', icon: '⚛️' },
                  { id: 'Node.js', icon: '🟢' },
                  { id: 'Java', icon: '☕' },
                  { id: 'Python / AI', icon: '🐍' },
                  { id: 'Mobile Apps', icon: '📱' },
                  { id: 'Backend / APIs', icon: '🗄️' },
                  { id: 'Data Science', icon: '📊' },
                  { id: 'Games', icon: '🎮' }
                ].map(item => {
                  const isSelected = techStacks.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleTechStack(item.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-950/60 border-indigo-500/80 shadow-md shadow-indigo-600/20 text-white'
                          : 'bg-[#111625] border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center space-x-2">
                        <span className="text-base">{item.icon}</span>
                        <span className="text-xs font-semibold">{item.id}</span>
                      </div>
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                        isSelected ? 'bg-indigo-600 border-indigo-400 text-white' : 'border-slate-700'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SCREEN 5: AI Assistance Style */}
          {step === 5 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-1 text-center">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  Choose your AI assistance style
                </h2>
                <p className="text-xs text-slate-400">
                  How would you like Infinity to collaborate with you?
                </p>
              </div>

              <div className="grid grid-cols-1 gap-2 pt-2">
                {[
                  { id: 'explain', icon: '📖', label: 'Explain code while I learn', desc: 'Break down complex logic into simple analogies' },
                  { id: 'build_features', icon: '⚡', label: 'Build features for me', desc: 'Create clean modular UI components & logic' },
                  { id: 'fix_bugs', icon: '🔧', label: 'Find & fix bugs', desc: 'Diagnose runtime exceptions and repair errors' },
                  { id: 'review', icon: '🔍', label: 'Review my code', desc: 'Audit code quality, performance, and best practices' },
                  { id: 'test', icon: '🧪', label: 'Test my application', desc: 'Run automated DOM simulations and test suites' },
                  { id: 'deploy', icon: '🚀', label: 'Deploy my project', desc: 'Package and launch live on global cloud CDN' },
                  { id: 'full_agent', icon: '🤖', label: 'Let AI handle the entire task', desc: 'Autonomous multi-agent execution pipeline' }
                ].map(item => {
                  const isSelected = aiAssistanceStyles.includes(item.id);
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleAiStyle(item.id)}
                      className={`p-3 rounded-2xl border text-left transition-all flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-950/60 border-indigo-500/80 shadow-md shadow-indigo-600/20 text-white'
                          : 'bg-[#111625] border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-base">{item.icon}</span>
                        <div>
                          <div className="text-xs font-bold">{item.label}</div>
                          <div className="text-[10px] text-slate-400">{item.desc}</div>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-md flex items-center justify-center border shrink-0 ${
                        isSelected ? 'bg-indigo-600 border-indigo-400 text-white' : 'border-slate-700'
                      }`}>
                        {isSelected && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* SCREEN 6: What matters most? */}
          {step === 6 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="space-y-1 text-center">
                <h2 className="text-xl sm:text-2xl font-extrabold text-white">
                  What's your primary goal?
                </h2>
                <p className="text-xs text-slate-400">
                  We will prioritize the workspace tools that accelerate your goal.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                {[
                  { id: 'learn_faster', icon: '🏆', title: 'Learn faster', desc: 'Build strong coding skills & master new frameworks' },
                  { id: 'build_faster', icon: '🚀', title: 'Build faster', desc: 'Turn ideas into working projects in minutes' },
                  { id: 'career_ready', icon: '💼', title: 'Get career-ready', desc: 'Polish GitHub portfolio & ace technical interviews' },
                  { id: 'ship_production', icon: '⚡', title: 'Ship production apps', desc: 'Deploy scalable products & startup MVPs' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => setPrimaryGoal(item.id)}
                    className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between space-y-3 cursor-pointer ${
                      primaryGoal === item.id
                        ? 'bg-indigo-950/60 border-indigo-500/80 shadow-lg shadow-indigo-600/20 text-white'
                        : 'bg-[#111625] border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="text-2xl">{item.icon}</div>
                    <div>
                      <div className="text-sm font-bold">{item.title}</div>
                      <div className="text-[11px] text-slate-400 mt-0.5">{item.desc}</div>
                    </div>
                    <div className="flex justify-end">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                        primaryGoal === item.id ? 'bg-indigo-600 border-indigo-400 text-white' : 'border-slate-700'
                      }`}>
                        {primaryGoal === item.id && <Check className="w-2.5 h-2.5" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SCREEN 7: Personalized Plan Recommendation */}
          {step === 7 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Personalized Recommendation</span>
                </div>
                <h2 className="text-2xl font-extrabold text-white">
                  Your Infinity Setup is Ready
                </h2>
                <p className="text-xs text-slate-400">
                  Based on your goals as a <span className="text-indigo-300 capitalize font-semibold">{role}</span>, we recommend:
                </p>
              </div>

              {/* Highlighted Recommended Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/80 via-[#0e1322] to-purple-950/40 border-2 border-indigo-500/80 shadow-2xl shadow-indigo-600/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="text-[10px] uppercase font-bold tracking-widest text-indigo-400">Recommended Plan</div>
                    <div className="text-xl font-extrabold text-white flex items-center space-x-2">
                      <span>
                        {recommendedPlan === 'student' ? '🎓 Infinity Student' : recommendedPlan === 'pro' ? '🚀 Infinity Pro' : '⚡ Infinity Plus'}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500 text-white font-bold">Best Match</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-black text-white">
                      {recommendedPlan === 'student' ? '₹149' : recommendedPlan === 'pro' ? '₹499' : '₹299'}
                    </div>
                    <div className="text-[10px] text-slate-400">/ month</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 border-t border-slate-800/80 pt-3">
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>1,000 Infinity AI Credits</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Multi-Agent Orchestrator</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Multi-File Code Gen</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Real-time Auto Debugger</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>Learning Mode & AI Tutor</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>100% Free Local Projects</span>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5">
                  <button
                    onClick={() => handleSelectPlan(recommendedPlan as any)}
                    className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-98 cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <span>Start {recommendedPlan === 'student' ? 'Student' : recommendedPlan === 'pro' ? 'Pro' : 'Plus'} Plan</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleSelectPlan('free')}
                    className="w-full sm:w-auto py-3 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 font-semibold text-xs border border-slate-700 transition-colors cursor-pointer"
                  >
                    Continue with Free
                  </button>
                </div>
              </div>

              <div className="text-center text-[11px] text-slate-400">
                🔒 Free plan is always available. Local code editing, files, and terminal run are completely free & unlimited.
              </div>
            </div>
          )}

          {/* SCREEN 8: Build Your First Project CTA */}
          {step === 8 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="text-center space-y-1">
                <div className="w-12 h-12 mx-auto rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
                  <Rocket className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-extrabold text-white">
                  Build Your First Project
                </h2>
                <p className="text-xs text-slate-400">
                  Tell Infinity what you want to build and let the Multi-Agent engine scaffold it live!
                </p>
              </div>

              {/* Prompt Input Box */}
              <div className="space-y-3">
                <div className="p-2 rounded-2xl bg-[#121828] border border-indigo-500/50 focus-within:border-indigo-400 transition-all shadow-xl">
                  <textarea
                    value={firstProjectPrompt}
                    onChange={(e) => setFirstProjectPrompt(e.target.value)}
                    rows={2}
                    placeholder="e.g. Create a college attendance system with student dashboard, biometric simulation and analytics..."
                    className="w-full bg-transparent border-none outline-none text-xs text-white p-2 font-mono placeholder-slate-500 resize-none focus:ring-0"
                  />
                </div>

                {/* Quick Idea Chips */}
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Or pick an instant starter:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'College Attendance System',
                      '2D Retro Space Shooter Game',
                      'Student Portal with Firebase',
                      'AI Chatbot with Gemini SDK'
                    ].map(idea => (
                      <button
                        key={idea}
                        onClick={() => setFirstProjectPrompt(`Create a full-stack ${idea} with responsive modern UI`)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-indigo-300 border border-slate-700/80 transition-colors"
                      >
                        + {idea}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Instant AI Execution Plan Preview */}
                <div className="p-4 rounded-2xl bg-[#090d16] border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center space-x-1.5">
                      <AnimatedInfinity state="ai_thinking" size="sm" />
                      <span>AI Multi-Agent Pipeline</span>
                    </span>
                    <span className="text-[10px] font-mono text-emerald-400">Stack: React + TypeScript + Firebase</span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-400 font-mono">
                    <div className="flex items-center space-x-1">
                      <span className="text-emerald-400">✓</span>
                      <span>Authentication & Roles</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-emerald-400">✓</span>
                      <span>Student & Admin Views</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-emerald-400">✓</span>
                      <span>Attendance Data Schema</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-emerald-400">✓</span>
                      <span>1-Click Live Preview</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => handleBuildFirstProject(firstProjectPrompt)}
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-bold text-xs shadow-xl shadow-indigo-600/30 transition-all active:scale-98 flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Build Now with Infinity AI</span>
                </button>

                <button
                  onClick={handleFinishOnboarding}
                  className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  Open Workspace
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Modal Bottom Footer Navigation (Steps 1 to 6) */}
        {step < 7 && (
          <div className="px-6 py-4 border-t border-slate-800/80 bg-[#0a0e19] flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={step === 1}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-colors ${
                step === 1 ? 'opacity-30 cursor-not-allowed text-slate-500' : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>

            <button
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all flex items-center space-x-2 active:scale-95 cursor-pointer"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
