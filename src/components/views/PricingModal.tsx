import React, { useState } from 'react';
import { 
  X, 
  Check, 
  Sparkles, 
  Zap, 
  GraduationCap, 
  Rocket, 
  ShieldCheck, 
  Infinity as InfinityIcon,
  HelpCircle,
  Flame,
  Layers,
  ArrowRight,
  Code,
  Users,
  CreditCard,
  Lock,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCredits, PlanType, PLAN_CONFIGS } from '../../context/CreditsContext';
import { useAuth } from '../../context/AuthContext';
import { RazorpayService, RazorpayPaymentSuccessResult } from '../../services/razorpay';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose }) => {
  const { currentPlan, creditsRemaining, totalCredits, billingCycle, setBillingCycle, upgradePlan } = useCredits();
  const { user } = useAuth();
  const [selectedTab, setSelectedTab] = useState<'featured' | 'all'>('featured');
  const [upgradedSuccess, setUpgradedSuccess] = useState<{ plan: PlanType; paymentId?: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSelectPlan = async (planKey: PlanType) => {
    const plan = PLAN_CONFIGS[planKey];
    setPaymentError(null);

    // Free plan activates immediately without gateway
    if (planKey === 'free' || plan.priceMonthly === 0) {
      upgradePlan('free');
      setUpgradedSuccess({ plan: 'free' });
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      setTimeout(() => setUpgradedSuccess(null), 3500);
      return;
    }

    const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
    setIsProcessing(true);

    try {
      await RazorpayService.initiateCheckout({
        planId: planKey,
        amount: price,
        billingCycle,
        userName: user?.displayName || 'Student Developer',
        userEmail: user?.email || 'developer@scinfinity.io',
        onSuccess: (paymentResult: RazorpayPaymentSuccessResult) => {
          setIsProcessing(false);
          upgradePlan(planKey);
          setUpgradedSuccess({
            plan: planKey,
            paymentId: paymentResult.razorpay_payment_id
          });

          // Celebration confetti 🎉
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.5 }
          });

          setTimeout(() => {
            setUpgradedSuccess(null);
          }, 4500);
        },
        onFailure: (err) => {
          setIsProcessing(false);
          console.warn('Razorpay payment failed or was closed:', err);
          if (err?.description || err?.message) {
            setPaymentError(err.description || err.message);
            setTimeout(() => setPaymentError(null), 4000);
          }
        }
      });
    } catch (e: any) {
      setIsProcessing(false);
      setPaymentError('Unable to open Razorpay payment gateway.');
    }
  };

  const launchPlans: PlanType[] = ['free', 'student', 'pro'];
  const allPlans: PlanType[] = ['free', 'student', 'plus', 'pro', 'team'];

  const displayPlans = selectedTab === 'featured' ? launchPlans : allPlans;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in select-none">
      <div className="w-full max-w-5xl max-h-[90vh] bg-[#0c101a] border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-800/80 bg-gradient-to-b from-[#121826] to-[#0c101a] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-indigo-600/20 border border-indigo-500/30">
              <InfinityIcon className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white tracking-tight">SC INFINITY IDE Plans & Credits</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Razorpay Secured 💳
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Local editor, terminal, and sandbox are <span className="text-emerald-400 font-semibold">100% FREE forever</span>. Upgrade for cloud AI compute.
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

        {/* Modal Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
          {/* Payment Success Banner */}
          {upgradedSuccess && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/70 via-indigo-950/40 to-emerald-950/70 border border-emerald-500/40 text-emerald-300 space-y-1 animate-in zoom-in-95">
              <div className="flex items-center space-x-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                <span className="font-bold text-sm text-white">
                  Payment Successful! Activated {PLAN_CONFIGS[upgradedSuccess.plan].name} Plan
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 pl-7">
                Your account is credited with <strong>{PLAN_CONFIGS[upgradedSuccess.plan].creditsPerMonth.toLocaleString()} Infinity Credits</strong>.
                {upgradedSuccess.paymentId && <span className="block font-mono text-[10px] text-slate-400 mt-0.5">Razorpay ID: {upgradedSuccess.paymentId}</span>}
              </p>
            </div>
          )}

          {/* Payment Error Banner */}
          {paymentError && (
            <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-500/40 text-rose-300 flex items-center justify-between animate-in fade-in">
              <span className="text-xs">{paymentError}</span>
              <button onClick={() => setPaymentError(null)} className="p-1 hover:text-white"><X className="w-4 h-4" /></button>
            </div>
          )}

          {/* Current Balance & Billing Toggle Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#121828] border border-slate-800/80">
            <div className="flex items-center space-x-3">
              <div className="flex flex-col">
                <span className="text-[11px] text-slate-400">Current Subscription & Balance</span>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="font-bold text-sm text-white capitalize">{currentPlan} Plan</span>
                  <span className="text-slate-500">•</span>
                  <span className="text-indigo-300 font-mono font-semibold">
                    {creditsRemaining.toLocaleString()} / {totalCredits.toLocaleString()} Infinity Credits
                  </span>
                </div>
              </div>
            </div>

            {/* Billing Toggle & Tab Toggle */}
            <div className="flex items-center space-x-3">
              {/* Tab Selector */}
              <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setSelectedTab('featured')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedTab === 'featured'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Featured (3 Tiers)
                </button>
                <button
                  onClick={() => setSelectedTab('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedTab === 'all'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All 5 Plans
                </button>
              </div>

              {/* Monthly vs Yearly */}
              <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    billingCycle === 'monthly'
                      ? 'bg-slate-800 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1 ${
                    billingCycle === 'yearly'
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Yearly</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                    2 Mo Free
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Plan Cards Grid */}
          <div className={`grid gap-4 ${displayPlans.length <= 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-3 lg:grid-cols-5'}`}>
            {displayPlans.map((planKey) => {
              const plan = PLAN_CONFIGS[planKey];
              const isCurrent = currentPlan === planKey;
              const isStudent = planKey === 'student';
              const isPro = planKey === 'pro';

              const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
              const priceSuffix = billingCycle === 'yearly' ? '/year' : '/month';

              return (
                <div
                  key={planKey}
                  className={`relative rounded-3xl p-5 flex flex-col justify-between transition-all duration-200 border ${
                    isStudent
                      ? 'bg-gradient-to-b from-[#181d33] via-[#101426] to-[#0d1120] border-indigo-500/80 shadow-xl shadow-indigo-900/20 ring-1 ring-indigo-500/40'
                      : isPro
                      ? 'bg-[#0f1424] border-violet-500/50 shadow-lg'
                      : 'bg-[#0f1320] border-slate-800/90 hover:border-slate-700'
                  }`}
                >
                  {/* Popular Badge */}
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white text-[10px] font-bold shadow-md uppercase tracking-wider">
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        {planKey === 'free' && <Zap className="w-4 h-4 text-slate-400" />}
                        {planKey === 'student' && <GraduationCap className="w-5 h-5 text-indigo-400" />}
                        {planKey === 'plus' && <Flame className="w-4 h-4 text-amber-400" />}
                        {planKey === 'pro' && <Rocket className="w-5 h-5 text-violet-400" />}
                        {planKey === 'team' && <Users className="w-4 h-4 text-emerald-400" />}
                        <h3 className="font-bold text-base text-white">{plan.name}</h3>
                      </div>
                      {isCurrent && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                          Active
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-400 min-h-[32px] leading-relaxed">
                      {plan.tagline}
                    </p>

                    {/* Price */}
                    <div className="my-4 pb-3 border-b border-slate-800">
                      <div className="flex items-baseline space-x-1">
                        <span className="text-2xl font-black text-white">
                          ₹{price.toLocaleString()}
                        </span>
                        <span className="text-slate-400 text-xs">{priceSuffix}</span>
                      </div>
                      <div className="mt-1 flex items-center space-x-1.5 text-[11px] text-indigo-400 font-semibold">
                        <Sparkles className="w-3 h-3" />
                        <span>{plan.creditsPerMonth.toLocaleString()} Credits / mo</span>
                      </div>
                    </div>

                    {/* Features List */}
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-[11px] text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleSelectPlan(planKey)}
                    disabled={isCurrent || isProcessing}
                    className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md ${
                      isCurrent
                        ? 'bg-slate-800 text-slate-400 cursor-default'
                        : isStudent
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/30 active:scale-95'
                        : isPro
                        ? 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-600/30 active:scale-95'
                        : 'bg-slate-800 hover:bg-slate-700 text-white active:scale-95'
                    }`}
                  >
                    <span>
                      {isCurrent 
                        ? 'Current Plan' 
                        : plan.priceMonthly === 0 
                        ? 'Select Free' 
                        : `Pay ₹${price.toLocaleString()} with Razorpay`}
                    </span>
                    {!isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Infinity Credits Weighting Breakdown */}
          <div className="p-5 rounded-2xl bg-[#0f1422] border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <h4 className="font-bold text-xs text-white">Infinity Credits Usage Breakdown</h4>
              </div>
              <span className="text-[10px] text-slate-400">1 Credit ≈ 1 Basic AI Query</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 mb-0.5">Simple AI Chat</div>
                <div className="font-bold text-sm text-indigo-400">1 Credit</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 mb-0.5">Code Snippet Gen</div>
                <div className="font-bold text-sm text-indigo-400">2 Credits</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 mb-0.5">Multi-File Edit</div>
                <div className="font-bold text-sm text-indigo-400">5 Credits</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 mb-0.5">Autonomous Agent</div>
                <div className="font-bold text-sm text-indigo-400">10 Credits</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 mb-0.5">Sandbox Test</div>
                <div className="font-bold text-sm text-indigo-400">5 Credits</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 text-center">
                <div className="text-[10px] text-slate-400 mb-0.5">Deep Synthesis</div>
                <div className="font-bold text-sm text-indigo-400">20+ Credits</div>
              </div>
            </div>
          </div>

          {/* Student Guarantee & Local Storage Policy */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-[#0d1420] to-indigo-950/40 border border-emerald-500/30 flex items-start space-x-3">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h5 className="font-bold text-xs text-white">♾️ Our Open & Student-First Pledge</h5>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Local projects, file import/export, Monaco editor, local storage, basic preview, and the offline multi-language runner are <strong>100% FREE for all users forever</strong>. Credits are only deducted when invoking cloud AI models and autonomous agent synthesis.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Footer with Razorpay Payment Badges */}
        <div className="p-4 bg-[#0a0d15] border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div className="flex items-center space-x-2">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Secured by Razorpay • UPI (GPay/PhonePe/Paytm), Cards, NetBanking, EMI</span>
          </div>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
