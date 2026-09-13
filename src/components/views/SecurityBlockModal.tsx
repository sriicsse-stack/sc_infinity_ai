import React from 'react';
import { ShieldAlert, AlertTriangle, CreditCard, LogOut, X, Sparkles } from 'lucide-react';
import { useCredits } from '../../context/CreditsContext';
import { useAuth } from '../../context/AuthContext';

export const SecurityBlockModal: React.FC = () => {
  const { isAccountSwitchBlocked, blockedReason, setIsPricingModalOpen, dismissBlockedAlert } = useCredits();
  const { user, signOut } = useAuth();

  if (!isAccountSwitchBlocked) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-md bg-[#0e1320] border-2 border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-4 relative animate-in zoom-in-95">
        <button
          onClick={dismissBlockedAlert}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-base">Account Security Alert</h3>
            <p className="text-xs text-amber-400/90 font-medium">Free Tier Device Quota Enforced</p>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-500/20 text-xs text-amber-200/90 leading-relaxed space-y-2">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <p>{blockedReason || 'This device has already utilized its free tier allowance with another Gmail account.'}</p>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-500">Active Account:</span>
            <span className="font-mono text-white">{user?.email || 'Current Session'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Status:</span>
            <span className="text-rose-400 font-semibold">Upgrade Required</span>
          </div>
        </div>

        <div className="space-y-2 pt-1">
          <button
            onClick={() => {
              dismissBlockedAlert();
              setIsPricingModalOpen(true);
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <CreditCard className="w-4 h-4" />
            <span>Upgrade Plan (From ₹149/mo)</span>
          </button>

          <button
            onClick={async () => {
              await signOut();
              dismissBlockedAlert();
            }}
            className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white font-medium text-xs flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out & Switch Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
