import React, { useState } from 'react';
import { 
  Key, 
  Sparkles, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  X, 
  Zap, 
  ArrowRight,
  Copy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAI } from '../../context/AIContext';

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onContinueWithCloud?: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ 
  isOpen, 
  onClose,
  onContinueWithCloud 
}) => {
  const { geminiApiKey, setGeminiApiKey } = useAI();
  const [apiKeyInput, setApiKeyInput] = useState<string>(geminiApiKey || '');
  const [showKey, setShowKey] = useState<boolean>(false);
  const [isSavedSuccess, setIsSavedSuccess] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    const cleanKey = apiKeyInput.trim();
    if (!cleanKey) return;

    setGeminiApiKey(cleanKey);
    localStorage.setItem('infinity_gemini_api_key_prompted', 'true');
    setIsSavedSuccess(true);

    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {}

    setTimeout(() => {
      setIsSavedSuccess(false);
      onClose();
    }, 1500);
  };

  const handleContinueWithCloud = () => {
    localStorage.setItem('infinity_gemini_api_key_prompted', 'true');
    if (onContinueWithCloud) {
      onContinueWithCloud();
    }
    onClose();
  };

  const handleCopyAiStudioUrl = () => {
    navigator.clipboard.writeText('https://aistudio.google.com/app/apikey');
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-2xl bg-[#0c101a] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-800/80 bg-gradient-to-b from-[#141b2d] to-[#0c101a] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30">
              <Key className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Connect Google Gemini API Key</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  100% Free Setup ⚡
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Power your SC INFINITY workspace with your personal Gemini API key for high-speed AI generation.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {/* Success Banner */}
          {isSavedSuccess && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 flex items-center space-x-2.5 animate-in zoom-in-95">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="font-semibold text-sm">
                Gemini API Key Successfully Connected & Saved!
              </span>
            </div>
          )}

          {/* Step-by-Step Guide Card */}
          <div className="p-5 rounded-2xl bg-[#121828] border border-slate-800 space-y-3.5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">How to get your FREE Gemini API Key in 30 seconds</h3>
              </div>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/40 font-semibold text-[11px] transition-all"
              >
                <span>Open Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Steps Visual List */}
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <span className="font-semibold text-slate-200 block text-xs">
                    Visit Google AI Studio
                  </span>
                  <span className="text-slate-400 text-[11px] leading-relaxed">
                    Go to <strong className="text-indigo-300">aistudio.google.com/app/apikey</strong> and sign in with your Google account.
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <span className="font-semibold text-slate-200 block text-xs">
                    Click "Create API Key"
                  </span>
                  <span className="text-slate-400 text-[11px] leading-relaxed">
                    Click the blue <strong>"Create API key"</strong> button and choose any project or create a new one instantly.
                  </span>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <span className="font-semibold text-slate-200 block text-xs">
                    Copy and Paste Below
                  </span>
                  <span className="text-slate-400 text-[11px] leading-relaxed">
                    Copy the generated API key string and paste it in the field below. Your key stays stored securely in your browser.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Key Input Section */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
              <span>Paste Your Gemini API Key:</span>
              <button
                type="button"
                onClick={handleCopyAiStudioUrl}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
              >
                <Copy className="w-3 h-3" />
                <span>{copiedUrl ? 'Copied AI Studio Link!' : 'Copy AI Studio URL'}</span>
              </button>
            </label>

            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="AIzaSy... or your Gemini API Key"
                className="w-full px-4 py-3 pr-12 rounded-xl bg-[#090d16] border border-slate-700/80 focus:border-indigo-500 text-white placeholder-slate-500 font-mono text-xs outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                title={showKey ? "Hide key" : "Show key"}
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Security & Dual Mode Guarantee */}
          <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/20 space-y-1.5">
            <div className="flex items-center space-x-2 text-indigo-300 font-semibold text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Dual-Mode AI Architecture (Your Key + System Cloud Fallback)</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed pl-6">
              If you provide your own Gemini API key, your requests will execute directly with your personal quota. If you don't have a key right now, you can seamlessly continue with <strong>SC Infinity's Cloud Free Credits</strong>.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#0a0d15] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <button
            onClick={handleContinueWithCloud}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium transition-colors flex items-center justify-center space-x-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Continue with Free Cloud Tier</span>
          </button>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-700/60 hover:bg-slate-800 text-slate-400 hover:text-white font-medium transition-colors"
            >
              Later
            </button>
            <button
              onClick={handleSaveKey}
              disabled={!apiKeyInput.trim()}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold transition-all shadow-lg shadow-indigo-600/30 active:scale-95 flex items-center justify-center space-x-2"
            >
              <span>Save & Connect</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
