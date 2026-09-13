import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Wand2, 
  Bug, 
  HelpCircle, 
  FlaskConical, 
  Palette, 
  Database, 
  Rocket, 
  Lightbulb, 
  Send, 
  Paperclip, 
  Mic, 
  MicOff,
  ChevronDown, 
  ChevronRight,
  Check, 
  X, 
  Copy, 
  Maximize2, 
  Minimize2, 
  Layers, 
  ArrowRight,
  Image as ImageIcon,
  Volume2,
  VolumeX,
  Languages,
  Radio,
  Github,
  ExternalLink,
  Lock,
  UploadCloud,
  GitBranch,
  CheckCircle2,
  Globe,
  Key
} from 'lucide-react';
import { useAI } from '../../context/AIContext';
import { useTheme } from '../../context/ThemeContext';
import { AnimatedInfinity } from '../common/AnimatedInfinity';
import { voiceAssistant, VoiceLanguage } from '../../services/voiceAssistant';
import { AIModelType } from '../../types';

export const AIPanelView: React.FC = () => {
  const { 
    model, 
    setModel, 
    messages, 
    sendMessage, 
    isThinking, 
    infinityState,
    approvePendingAction,
    rejectPendingAction,
    pushProjectToGitHub,
    deployProjectToVercel
  } = useAI();

  const [inputVal, setInputVal] = useState('');
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [voiceLang, setVoiceLang] = useState<VoiceLanguage>('ta-IN');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [attachedImageName, setAttachedImageName] = useState<string | null>(null);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [voiceStatusText, setVoiceStatusText] = useState<string>('');

  // Local state for inline GitHub token/repo inputs in chat
  const [inlineGitTokens, setInlineGitTokens] = useState<Record<string, string>>({});
  const [inlineGitRepos, setInlineGitRepos] = useState<Record<string, string>>({});
  const [inlineShowTokens, setInlineShowTokens] = useState<Record<string, boolean>>({});

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickActions = [
    { label: 'Push to GitHub', icon: <Github className="w-3.5 h-3.5 text-purple-400" />, prompt: 'Push this project to GitHub repository' },
    { label: 'Deploy to Vercel', icon: <Rocket className="w-3.5 h-3.5 text-indigo-400" />, prompt: 'Deploy this website to Vercel live production edge.' },
    { label: 'Build new features', icon: <Wand2 className="w-3.5 h-3.5 text-blue-400" />, prompt: 'Build a calculator with history and dark mode styling.' },
    { label: 'Fix errors', icon: <Bug className="w-3.5 h-3.5 text-rose-400" />, prompt: 'Diagnose and fix all active problems in the workspace.' },
    { label: 'Explain code', icon: <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />, prompt: 'Provide a comprehensive architectural explanation of the active component.' },
    { label: 'Generate tests', icon: <FlaskConical className="w-3.5 h-3.5 text-purple-400" />, prompt: 'Generate unit tests for the active project.' },
    { label: 'Improve UI/UX', icon: <Palette className="w-3.5 h-3.5 text-amber-400" />, prompt: 'Enhance the UI with smoother animations, glassmorphic cards, and sleek typography.' },
    { label: 'தமிழ் வழிகாட்டி', icon: <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />, prompt: 'இந்த செயலியை எவ்வாறு பயன்படுத்துவது என்பதை தமிழில் விளக்குங்கள்.' }
  ];

  const suggestedPrompts = [
    'இந்த கோடை GitHub-ல் புஷ் பண்ணு (Push to GitHub)',
    'ஆட்டோ டெப்ளாய் பண்ணு (Auto Deploy to Vercel)',
    'ஒரு நவீன கால்குலேட்டர் ஆப் உருவாக்கு (Build Calculator)',
    'Build a personal task manager with categories',
    'Add Firebase authentication module'
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      const prompt = attachedImageName 
        ? `[Attached Image: ${attachedImageName}]\nRequirement: ${inputVal.trim()}`
        : inputVal.trim();

      sendMessage(prompt);
      setInputVal('');
      setAttachedImageName(null);
      if (isVoiceRecording) {
        voiceAssistant.stopListening();
        setIsVoiceRecording(false);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setAttachedImageName(e.target.files[0].name);
    }
  };

  const toggleVoiceRecording = () => {
    if (isVoiceRecording) {
      voiceAssistant.stopListening();
      setIsVoiceRecording(false);
      setVoiceStatusText('');
      return;
    }

    const langLabel = voiceLang === 'ta-IN' ? 'தமிழ் (Tamil)' : voiceLang === 'en-US' ? 'English' : 'Auto Detect';
    setVoiceStatusText(`🎙️ பேசுங்கள் (${langLabel})...`);

    const started = voiceAssistant.startListening({
      language: voiceLang,
      continuous: true,
      interimResults: true,
      onStart: () => {
        setIsVoiceRecording(true);
      },
      onResult: (transcript, isFinal) => {
        setInputVal(transcript);
        if (isFinal) {
          setVoiceStatusText(`✓ பதிவு செய்யப்பட்டது`);
          setTimeout(() => setVoiceStatusText(''), 1500);
        }
      },
      onError: (err) => {
        console.warn('Voice error:', err);
        setIsVoiceRecording(false);
        setVoiceStatusText('');
      },
      onEnd: () => {
        setIsVoiceRecording(false);
        setVoiceStatusText('');
      }
    });

    if (!started) {
      // Fallback simulated voice entry if mic permission is blocked
      setIsVoiceRecording(true);
      setTimeout(() => {
        setInputVal(voiceLang === 'ta-IN' ? 'ஒரு புதிய கால்குலேட்டர் ஆப் பில்ட் பண்ணு' : 'Build a sleek modern dashboard app');
        setIsVoiceRecording(false);
        setVoiceStatusText('');
      }, 1200);
    }
  };

  const handleSpeakMessage = (msgId: string, content: string) => {
    if (speakingMessageId === msgId) {
      voiceAssistant.stopSpeaking();
      setSpeakingMessageId(null);
      return;
    }

    const isTamilContent = /[\u0B80-\u0BFF]/.test(content);
    setSpeakingMessageId(msgId);
    voiceAssistant.speak(content, isTamilContent ? 'ta-IN' : 'en-US', () => {
      setSpeakingMessageId(null);
    });
  };

  return (
    <div className="w-80 sm:w-96 h-full bg-[#0a0d15] dark:bg-[#0a0d15] light:bg-slate-50 border-l border-[#1f293d] dark:border-[#1f293d] light:border-slate-200 flex flex-col text-xs select-none relative">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*,.txt,.json,.js,.ts"
        className="hidden"
      />

      {/* AI Header */}
      <div className="h-10 px-3.5 border-b border-[#1f293d] dark:border-[#1f293d] light:border-slate-200 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AnimatedInfinity state={infinityState} size="xs" />
          <span className="font-bold text-white dark:text-white light:text-slate-900 text-sm">Infinity AI</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
            தமிழ் & Eng
          </span>
        </div>

        <div className="flex items-center space-x-1.5">
          {/* Model Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
              className="flex items-center space-x-1.5 px-2 py-0.8 rounded-lg bg-[#121826] dark:bg-[#121826] light:bg-white border border-slate-700/60 dark:border-slate-800 light:border-slate-300 text-slate-300 dark:text-slate-300 light:text-slate-700 text-[11px]"
            >
              <span>{model === 'gemini-1.5-pro' ? 'Gemini 1.5 Pro' : model === 'gemini-2.0-flash' ? 'Gemini 2.0 Flash' : 'Gemini Pro'}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {isModelDropdownOpen && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-[#0e1320] dark:bg-[#0e1320] light:bg-white rounded-xl border border-slate-800 dark:border-slate-800 light:border-slate-200 shadow-2xl py-1 z-50">
                {(['gemini-1.5-pro', 'gemini-2.0-flash', 'gemini-pro'] as AIModelType[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setModel(m);
                      setIsModelDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-indigo-600/10 ${
                      model === m ? 'text-indigo-400 font-semibold' : 'text-slate-300 dark:text-slate-300 light:text-slate-700'
                    }`}
                  >
                    <span>{m === 'gemini-1.5-pro' ? 'Gemini 1.5 Pro' : m === 'gemini-2.0-flash' ? 'Gemini 2.0 Flash' : 'Gemini Pro'}</span>
                    {model === m && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4 font-sans select-text">
        {messages.map((msg, idx) => (
          <div key={msg.id} className="space-y-2 animate-in fade-in">
            {msg.sender === 'user' ? (
              <div className="flex justify-end">
                <div className="max-w-[88%] p-3 rounded-2xl bg-indigo-600 text-white rounded-br-none shadow-md shadow-indigo-600/20 text-xs leading-relaxed">
                  {msg.content}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {idx === 0 && (
                  <div className="p-4 rounded-2xl bg-gradient-to-b from-[#101626] to-[#0d1220] border border-indigo-500/20 shadow-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-indigo-400">
                        <Sparkles className="w-5 h-5" />
                        <span className="font-bold text-base text-white">Hello! வணக்கம்!</span>
                      </div>
                      <span className="text-[10px] text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-500/30">
                        Bilingual AI Pair Programmer
                      </span>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      I'm Infinity AI. You can speak or type in <strong>தமிழ் (Tamil)</strong> or <strong>English</strong> to build apps, solve bugs, and deploy software.
                    </p>

                    {/* Quick Action Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {quickActions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => sendMessage(action.prompt)}
                          className="flex items-center space-x-2 p-2 rounded-xl bg-[#141b2d]/80 hover:bg-indigo-600/15 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white transition-all text-[11px] font-medium text-left group"
                        >
                          <span className="p-1 rounded-md bg-slate-800/80 group-hover:bg-indigo-500/20">{action.icon}</span>
                          <span className="truncate">{action.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Suggested Prompts */}
                    <div className="pt-2 border-t border-slate-800/80 space-y-2">
                      <div className="text-[11px] font-semibold text-slate-400">Suggested prompts (தமிழ் / English)</div>
                      <div className="space-y-1.5">
                        {suggestedPrompts.map((prompt, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => sendMessage(prompt)}
                            className="w-full text-left p-2 rounded-xl bg-[#0e1320] hover:bg-indigo-950/40 border border-slate-800/80 hover:border-indigo-500/30 text-slate-300 hover:text-white transition-colors flex items-center justify-between text-[11px]"
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <span className="text-indigo-400">✧</span>
                              <span className="truncate">{prompt}</span>
                            </div>
                            <ArrowRight className="w-3 h-3 text-slate-600 group-hover:text-indigo-400" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {idx > 0 && (
                  <div className="p-3.5 rounded-2xl bg-[#0f1422] dark:bg-[#0f1422] light:bg-white border border-slate-800 dark:border-slate-800 light:border-slate-200 text-slate-200 dark:text-slate-200 light:text-slate-800 space-y-2.5 shadow-sm text-xs leading-relaxed relative group">
                    <div className="flex items-start justify-between">
                      <div className="whitespace-pre-wrap flex-1">{msg.content}</div>
                      <button
                        onClick={() => handleSpeakMessage(msg.id, msg.content)}
                        className={`p-1 rounded-lg ml-2 transition-colors ${
                          speakingMessageId === msg.id
                            ? 'text-indigo-400 bg-indigo-500/20 animate-pulse'
                            : 'text-slate-500 hover:text-slate-300'
                        }`}
                        title="Read Aloud in Tamil/English"
                      >
                        {speakingMessageId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                      </button>
                    </div>

                    {msg.type === 'diff' && msg.diffData && (
                      <div className="mt-2 rounded-xl border border-slate-800 overflow-hidden font-mono text-[11px]">
                        <div className="bg-slate-900 px-3 py-1.5 border-b border-slate-800 flex items-center justify-between text-slate-400">
                          <span>{msg.diffData.filename}</span>
                          <span className="text-indigo-400 font-semibold">Diff Proposal</span>
                        </div>
                        <div className="p-2 bg-rose-950/20 text-rose-300 border-b border-rose-900/30">
                          <pre className="whitespace-pre-wrap">{msg.diffData.oldCode}</pre>
                        </div>
                        <div className="p-2 bg-emerald-950/20 text-emerald-300">
                          <pre className="whitespace-pre-wrap">{msg.diffData.newCode}</pre>
                        </div>
                        <div className="p-2 bg-slate-900 flex items-center justify-end space-x-2">
                          <button
                            onClick={() => approvePendingAction(msg.id)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-medium text-xs flex items-center space-x-1 cursor-pointer"
                          >
                            <Check className="w-3 h-3" />
                            <span>Apply Diff</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* GitHub Push Result Card */}
                    {msg.type === 'github_push' && msg.githubData && (
                      <div className="mt-2.5 p-3.5 rounded-2xl bg-gradient-to-br from-[#101726] to-[#0c101c] border border-emerald-500/50 space-y-3 shadow-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                              <Github className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-white text-xs">{msg.githubData.repoName || 'GitHub Repository'}</div>
                              <div className="text-[10px] text-emerald-400 font-mono">Branch: main (Commit: {msg.githubData.commitSha})</div>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                            ✓ {msg.githubData.pushedFilesCount} Files Pushed
                          </span>
                        </div>

                        <div className="flex items-center space-x-2 pt-1">
                          <a
                            href={msg.githubData.commitUrl || msg.githubData.repoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-[11px] flex items-center justify-center space-x-1.5 border border-slate-700 transition-colors"
                          >
                            <span>Open in GitHub</span>
                            <ExternalLink className="w-3 h-3 text-indigo-400" />
                          </a>

                          <button
                            onClick={() => deployProjectToVercel()}
                            className="flex-1 py-1.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-[11px] flex items-center justify-center space-x-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
                          >
                            <Rocket className="w-3 h-3" />
                            <span>Deploy to Vercel</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Interactive Git Push Prompt Card */}
                    {msg.type === 'git_push_prompt' && (
                      <div className="mt-2.5 p-3.5 rounded-2xl bg-[#0c101c] border border-indigo-500/60 space-y-3 shadow-xl">
                        <div className="flex items-center space-x-2 text-indigo-300 font-bold text-xs">
                          <Github className="w-4 h-4 text-indigo-400" />
                          <span>Push Workspace to GitHub Account</span>
                        </div>

                        <div className="space-y-2 text-[11px]">
                          <div>
                            <label className="text-slate-400 text-[10px] font-bold uppercase">Repository Name</label>
                            <input
                              type="text"
                              value={inlineGitRepos[msg.id] ?? (msg.actionPayload?.target || localStorage.getItem('infinity_git_repo') || 'my-project')}
                              onChange={(e) => setInlineGitRepos(prev => ({ ...prev, [msg.id]: e.target.value }))}
                              placeholder="e.g. my-awesome-app"
                              className="w-full mt-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between">
                              <label className="text-slate-400 text-[10px] font-bold uppercase">GitHub Personal Access Token (PAT)</label>
                              <a
                                href="https://github.com/settings/tokens"
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] text-indigo-400 hover:underline flex items-center space-x-0.5"
                              >
                                <span>Get Token</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                            <input
                              type={inlineShowTokens[msg.id] ? "text" : "password"}
                              value={inlineGitTokens[msg.id] ?? (localStorage.getItem('infinity_github_token') || '')}
                              onChange={(e) => setInlineGitTokens(prev => ({ ...prev, [msg.id]: e.target.value }))}
                              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx (needs repo scope)"
                              className="w-full mt-1 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs font-mono focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            const repo = inlineGitRepos[msg.id] ?? (msg.actionPayload?.target || localStorage.getItem('infinity_git_repo') || 'my-project');
                            const token = inlineGitTokens[msg.id] ?? (localStorage.getItem('infinity_github_token') || '');
                            pushProjectToGitHub(repo, token);
                          }}
                          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Push Now to GitHub 🚀</span>
                        </button>
                      </div>
                    )}

                    {/* Vercel Live Deployment Result Card */}
                    {msg.type === 'deployment' && msg.deploymentData && (
                      <div className="mt-2.5 p-3.5 rounded-2xl bg-gradient-to-br from-[#101a28] to-[#0c121d] border border-emerald-500/60 space-y-3 shadow-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                              <Globe className="w-4 h-4" />
                            </div>
                            <div>
                              <div className="font-bold text-white text-xs">{msg.deploymentData.projectName || 'Live Production'}</div>
                              <div className="text-[10px] text-emerald-400 font-mono flex items-center space-x-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                <span>Status: LIVE ONLINE</span>
                              </div>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                            Global Edge CDN
                          </span>
                        </div>

                        <div className="p-2 px-3 rounded-xl bg-slate-900/80 border border-slate-800 font-mono text-indigo-300 text-xs truncate select-all">
                          {msg.deploymentData.url}
                        </div>

                        <div className="flex items-center space-x-2 pt-1">
                          <a
                            href={msg.deploymentData.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex-1 py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-[11px] flex items-center justify-center space-x-1.5 shadow-md shadow-emerald-600/30 transition-all"
                          >
                            <span>Open Live Website</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>

                          <button
                            onClick={() => pushProjectToGitHub()}
                            className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-[11px] flex items-center space-x-1 border border-slate-700 transition-colors cursor-pointer"
                          >
                            <Github className="w-3 h-3" />
                            <span>Push Git</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isThinking && (
          <div className="p-3 rounded-2xl bg-[#0f1422] border border-indigo-500/30 flex items-center space-x-3 text-slate-300 text-xs">
            <AnimatedInfinity state="ai_thinking" size="xs" />
            <div className="flex items-center space-x-1">
              <span>Infinity is analyzing</span>
              <span className="animate-bounce">.</span>
              <span className="animate-bounce delay-100">.</span>
              <span className="animate-bounce delay-200">.</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* AI Prompt Input Bar */}
      <div className="p-3 border-t border-[#1f293d] dark:border-[#1f293d] light:border-slate-200 bg-[#0a0d15] dark:bg-[#0a0d15] light:bg-slate-100 space-y-2">
        {/* Voice Status Pill */}
        {isVoiceRecording && (
          <div className="p-2 px-3 rounded-xl bg-gradient-to-r from-rose-950/70 to-indigo-950/70 border border-rose-500/40 text-rose-300 text-[11px] flex items-center justify-between animate-pulse">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              <span className="font-semibold">{voiceStatusText || '🎙️ Listening... பேசுங்கள்'}</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="h-3 w-1 bg-rose-400 animate-bounce" />
              <span className="h-4 w-1 bg-rose-400 animate-bounce delay-100" />
              <span className="h-2 w-1 bg-rose-400 animate-bounce delay-200" />
            </div>
          </div>
        )}

        {attachedImageName && (
          <div className="p-1.5 px-3 rounded-xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-300 text-[11px] flex items-center justify-between">
            <div className="flex items-center space-x-1.5 truncate">
              <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span className="truncate">Attached: {attachedImageName}</span>
            </div>
            <button onClick={() => setAttachedImageName(null)} className="p-0.5 hover:text-white">
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="relative rounded-2xl bg-[#0f1422] dark:bg-[#0f1422] light:bg-white border border-slate-700/80 dark:border-slate-800 light:border-slate-300 focus-within:border-indigo-500 transition-all p-2 flex flex-col space-y-2 shadow-inner">
          <textarea
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder={
              voiceLang === 'ta-IN'
                ? "தமிழில் கேளுங்கள் அல்லது டைப் செய்யுங்கள் (e.g. ஒரு கால்குலேட்டர் ஆப் உருவாக்கு)..."
                : "Ask Infinity in English or Tamil (e.g. Build an app, fix errors)..."
            }
            rows={2}
            className="w-full bg-transparent border-none outline-none text-white dark:text-white light:text-slate-900 placeholder-slate-500 resize-none text-xs p-1 focus:ring-0"
          />

          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 dark:border-slate-800/60 light:border-slate-200">
            <div className="flex items-center space-x-1 text-slate-400">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1 hover:text-white dark:hover:text-white light:hover:text-slate-900 rounded hover:bg-slate-800/40"
                title="Attach UI Mockup Image or File"
              >
                <Paperclip className="w-3.5 h-3.5" />
              </button>

              {/* Voice Language Selector Pill */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="px-2 py-0.5 rounded-lg bg-[#141b2d] hover:bg-slate-800 border border-slate-700/60 text-[10px] text-slate-300 font-semibold flex items-center space-x-1"
                  title="Switch Voice Input Language"
                >
                  <Languages className="w-3 h-3 text-indigo-400" />
                  <span>{voiceLang === 'ta-IN' ? 'தமிழ்' : voiceLang === 'en-US' ? 'ENG' : 'AUTO'}</span>
                  <ChevronDown className="w-2.5 h-2.5 opacity-60" />
                </button>

                {isLangDropdownOpen && (
                  <div className="absolute bottom-full left-0 mb-1 w-36 bg-[#0e1320] rounded-xl border border-slate-800 shadow-2xl py-1 z-50">
                    <button
                      type="button"
                      onClick={() => { setVoiceLang('ta-IN'); setIsLangDropdownOpen(false); }}
                      className={`w-full px-2.5 py-1.5 text-left text-[11px] flex items-center justify-between hover:bg-indigo-600/10 ${
                        voiceLang === 'ta-IN' ? 'text-indigo-400 font-bold' : 'text-slate-300'
                      }`}
                    >
                      <span>🇮🇳 தமிழ் (Tamil)</span>
                      {voiceLang === 'ta-IN' && <Check className="w-3 h-3" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setVoiceLang('en-US'); setIsLangDropdownOpen(false); }}
                      className={`w-full px-2.5 py-1.5 text-left text-[11px] flex items-center justify-between hover:bg-indigo-600/10 ${
                        voiceLang === 'en-US' ? 'text-indigo-400 font-bold' : 'text-slate-300'
                      }`}
                    >
                      <span>🌐 English</span>
                      {voiceLang === 'en-US' && <Check className="w-3 h-3" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setVoiceLang('auto'); setIsLangDropdownOpen(false); }}
                      className={`w-full px-2.5 py-1.5 text-left text-[11px] flex items-center justify-between hover:bg-indigo-600/10 ${
                        voiceLang === 'auto' ? 'text-indigo-400 font-bold' : 'text-slate-300'
                      }`}
                    >
                      <span>🔀 Auto Detect</span>
                      {voiceLang === 'auto' && <Check className="w-3 h-3" />}
                    </button>
                  </div>
                )}
              </div>

              {/* Voice Microphone Button */}
              <button
                type="button"
                onClick={toggleVoiceRecording}
                className={`p-1.5 rounded-lg transition-all ${
                  isVoiceRecording
                    ? 'text-white bg-rose-600 shadow-md shadow-rose-600/40 animate-pulse'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
                }`}
                title={isVoiceRecording ? 'Stop Voice Recording' : 'Voice Input (Tamil / English)'}
              >
                {isVoiceRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5 text-indigo-400" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={!inputVal.trim() && !attachedImageName}
              className="p-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
              title="Send to Infinity AI"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
