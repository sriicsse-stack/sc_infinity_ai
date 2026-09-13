import React, { useState } from 'react';
import { 
  X, 
  Shield, 
  Key, 
  Monitor, 
  Code, 
  Check, 
  Sparkles,
  Sliders,
  Flame,
  Database,
  Eye,
  EyeOff,
  Lock,
  CreditCard
} from 'lucide-react';
import { useAI } from '../../context/AIContext';
import { useTheme } from '../../context/ThemeContext';
import { useCredits } from '../../context/CreditsContext';
import { usePersonalization } from '../../context/PersonalizationContext';
import { AIPermissionMode, ThemeMode } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPricingModal?: () => void;
  onOpenOnboarding?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenPricingModal,
  onOpenOnboarding
}) => {
  const { permissionMode, setPermissionMode, geminiApiKey, setGeminiApiKey } = useAI();
  const { themeMode, setThemeMode } = useTheme();
  const { currentPlan, creditsRemaining, totalCredits } = useCredits();
  const { profile, resetOnboarding } = usePersonalization();

  const [customKey, setCustomKey] = useState(geminiApiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    setGeminiApiKey(customKey);
    setIsSaved(true);
    setTimeout(() => {
      setIsSaved(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-lg bg-[#0e1320] dark:bg-[#0e1320] light:bg-white rounded-3xl border border-slate-800 dark:border-slate-800 light:border-slate-300 shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-800/80 dark:border-slate-800/80 light:border-slate-200 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-bold text-white dark:text-white light:text-slate-900">IDE Preferences & Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto text-xs">
          {/* Subscription & Credits Quick Card */}
          <div className="p-4 rounded-2xl bg-[#121828] border border-slate-800 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Active Plan</span>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-sm text-white capitalize">{currentPlan} Plan</span>
                <span className="text-[11px] text-indigo-400 font-mono">
                  ({creditsRemaining.toLocaleString()} / {totalCredits.toLocaleString()} Credits)
                </span>
              </div>
            </div>
            {onOpenPricingModal && (
              <button
                onClick={() => {
                  onClose();
                  onOpenPricingModal();
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center space-x-1 shadow-sm transition-all"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Plans & Pricing</span>
              </button>
            )}
          </div>

          {/* AI Permission Mode */}
          <div className="space-y-2">
            <label className="font-bold text-white dark:text-white light:text-slate-900 flex items-center space-x-1.5">
              <Shield className="w-4 h-4 text-indigo-400" />
              <span>AI Agent Permission Mode</span>
            </label>
            <p className="text-slate-400 text-[11px]">
              Control the autonomy level of Infinity AI when creating or editing project files.
            </p>

            <div className="grid grid-cols-3 gap-2 pt-1">
              {(['safe', 'ask', 'auto'] as AIPermissionMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setPermissionMode(mode)}
                  className={`p-3 rounded-2xl border text-center transition-all ${
                    permissionMode === mode
                      ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 font-semibold'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold uppercase text-[11px] mb-1">{mode}</div>
                  <div className="text-[10px] text-slate-400">
                    {mode === 'safe' ? 'Suggests only' : mode === 'ask' ? 'Asks before edits' : 'Autonomous execution'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Theme Settings */}
          <div className="space-y-2">
            <label className="font-bold text-white dark:text-white light:text-slate-900 flex items-center space-x-1.5">
              <Monitor className="w-4 h-4 text-indigo-400" />
              <span>Appearance Theme</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['dark', 'light', 'system'] as ThemeMode[]).map((t) => (
                <button
                  key={t}
                  onClick={() => setThemeMode(t)}
                  className={`p-2.5 rounded-xl border text-center capitalize transition-all ${
                    themeMode === t
                      ? 'bg-indigo-600 text-white font-semibold shadow-sm'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Gemini AI Key (BYOK - Optional) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-bold text-white flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>Gemini API Key (Optional BYOK)</span>
              </label>
              <span className="text-[10px] text-slate-500">Default Built-in Cloud Active</span>
            </div>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={customKey}
                onChange={(e) => setCustomKey(e.target.value)}
                placeholder="Leave blank to use default cloud quota, or enter your API Key"
                className="w-full px-3 py-2 pr-10 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[10px] text-slate-500">
              Your API Key is kept locally in your browser session and never sent to external servers.
            </p>
          </div>

          {/* User Personalization & Role */}
          <div className="p-4 rounded-2xl bg-[#121828] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <div className="text-[10px] uppercase font-bold text-indigo-400">Workspace Personalization</div>
                <div className="text-xs font-bold text-white">Customize Role, Stack & AI Style</div>
              </div>
              <button
                onClick={() => {
                  onClose();
                  if (onOpenOnboarding) {
                    onOpenOnboarding();
                  } else {
                    resetOnboarding();
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-semibold text-xs border border-indigo-500/30 transition-all cursor-pointer"
              >
                Retake Questionnaire
              </button>
            </div>
            <div className="text-[11px] text-slate-400">
              Current profile: <span className="text-white font-semibold capitalize">{profile.role}</span> ({profile.experienceLevel}) • Focus: <span className="text-white font-semibold">{profile.techStacks.slice(0, 3).join(', ')}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-[#0a0d15] dark:bg-[#0a0d15] light:bg-slate-100 border-t border-slate-800 flex items-center justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-xs"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
          >
            {isSaved ? <Check className="w-4 h-4" /> : null}
            <span>{isSaved ? 'Saved!' : 'Save Preferences'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
