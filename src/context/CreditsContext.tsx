import React, { createContext, useContext, useState, useEffect } from 'react';

export type PlanType = 'free' | 'student' | 'plus' | 'pro' | 'team';

export interface PlanDetails {
  id: PlanType;
  name: string;
  priceMonthly: number;
  priceYearly: number;
  creditsPerMonth: number;
  aiRequestsPerMonth: number;
  tagline: string;
  isPopular?: boolean;
  badge?: string;
  features: string[];
}

export const PLAN_CONFIGS: Record<PlanType, PlanDetails> = {
  free: {
    id: 'free',
    name: 'Free',
    priceMonthly: 0,
    priceYearly: 0,
    creditsPerMonth: 50,
    aiRequestsPerMonth: 50,
    tagline: 'Best for beginners & learners exploring AI coding',
    features: [
      '50 Infinity Credits / month (~50 AI requests)',
      'Unlimited local projects & local storage',
      'Full Monaco code editor with multi-language support',
      'Live Sandbox Preview & interactive terminal',
      'Community marketplace app browsing & publishing',
      'No credit card required'
    ]
  },
  student: {
    id: 'student',
    name: 'Student',
    priceMonthly: 149,
    priceYearly: 1499,
    creditsPerMonth: 500,
    aiRequestsPerMonth: 500,
    tagline: 'Best for students, college builders & self-learners',
    isPopular: true,
    badge: '⭐ Most Popular',
    features: [
      '500 Infinity Credits / month (~500 AI requests)',
      'Unlimited local projects & storage (Free forever)',
      'Full Infinity AI Pair Programmer & autonomous game/app builder',
      'Multi-file code generation & autonomous file synthesis',
      'AI Debugging, Linting & Architecture planning',
      'Interactive AI Tutor & Visual Learning Mode',
      'Priority cloud processing & fast execution queue',
      'Student verification badge (College ID / Email)'
    ]
  },
  plus: {
    id: 'plus',
    name: 'Plus',
    priceMonthly: 399,
    priceYearly: 3990,
    creditsPerMonth: 2000,
    aiRequestsPerMonth: 2000,
    tagline: 'For serious indie builders, freelancers & side projects',
    features: [
      '2,000 Infinity Credits / month (~2,000 AI requests)',
      'Unlimited local projects & storage',
      'Long-running autonomous Agent runs',
      'Full Git repository branching & staging',
      'Multi-viewport real-time sandboxing',
      'Priority support & early access to new AI models'
    ]
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 999,
    priceYearly: 9990,
    creditsPerMonth: 7500,
    aiRequestsPerMonth: 7500,
    tagline: 'For professional software developers & power creators',
    features: [
      '7,500 Infinity Credits / month (~7,500 AI requests)',
      'Unlimited local projects & storage',
      'Gemini 1.5 Pro & Gemini 2.0 Flash maximum throughput',
      'Parallel & long-running autonomous agent pipelines',
      'Advanced cloud runtime & one-click Cloudflare/Vercel deployment',
      'Priority GPU compute & ultra-low latency inference'
    ]
  },
  team: {
    id: 'team',
    name: 'Team / Campus',
    priceMonthly: 2499,
    priceYearly: 24990,
    creditsPerMonth: 25000,
    aiRequestsPerMonth: 25000,
    tagline: 'For college labs, hackathon teams & startup squads',
    features: [
      '25,000 Infinity Credits / month (Shared team pool)',
      'Unlimited team members & shared workspaces',
      'Team analytics, credit allocations & admin controls',
      'Centralized Firebase sync & real-time collaboration',
      'Dedicated support & private onboarding'
    ]
  }
};

export const CREDIT_COSTS = {
  SIMPLE_CHAT: 1,
  CODE_GENERATION: 2,
  BUG_FIX: 3,
  MULTI_FILE_EDIT: 5,
  AGENT_TASK: 10,
  GAME_BUILD: 5,
  BROWSER_TEST: 5,
  DEPLOY: 10
};

interface CreditsContextType {
  currentPlan: PlanType;
  creditsRemaining: number;
  totalCredits: number;
  billingCycle: 'monthly' | 'yearly';
  setBillingCycle: (cycle: 'monthly' | 'yearly') => void;
  upgradePlan: (plan: PlanType) => void;
  consumeCredits: (amount?: number, reason?: string) => boolean;
  isPricingModalOpen: boolean;
  setIsPricingModalOpen: (open: boolean) => void;
  hasSufficientCredits: (cost?: number) => boolean;
  isAccountSwitchBlocked: boolean;
  blockedReason: string | null;
  verifyAccountBinding: (userEmail: string | null) => boolean;
  dismissBlockedAlert: () => void;
}

const CreditsContext = createContext<CreditsContextType | undefined>(undefined);

export const CreditsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentPlan, setCurrentPlan] = useState<PlanType>(() => {
    return (localStorage.getItem('infinity_plan') as PlanType) || 'free';
  });

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const [creditsRemaining, setCreditsRemaining] = useState<number>(() => {
    const saved = localStorage.getItem('infinity_credits');
    if (saved !== null) {
      return parseInt(saved, 10);
    }
    return PLAN_CONFIGS.free.creditsPerMonth;
  });

  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isAccountSwitchBlocked, setIsAccountSwitchBlocked] = useState(false);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);

  const totalCredits = PLAN_CONFIGS[currentPlan].creditsPerMonth;

  useEffect(() => {
    localStorage.setItem('infinity_plan', currentPlan);
  }, [currentPlan]);

  useEffect(() => {
    localStorage.setItem('infinity_credits', creditsRemaining.toString());
  }, [creditsRemaining]);

  // Anti-abuse: Verify if user switches Gmail accounts on this device to farm free credits
  const verifyAccountBinding = (userEmail: string | null): boolean => {
    if (!userEmail) return true;

    const primaryAccount = localStorage.getItem('infinity_device_primary_account');
    const freeClaimed = localStorage.getItem('infinity_device_free_consumed') === 'true';
    const isPaid = currentPlan !== 'free';

    if (!primaryAccount) {
      // First account bound to this device
      localStorage.setItem('infinity_device_primary_account', userEmail.toLowerCase());
      return true;
    }

    if (primaryAccount !== userEmail.toLowerCase() && !isPaid && (freeClaimed || creditsRemaining <= 0)) {
      // Different Gmail detected on same machine with already consumed free tier
      setIsAccountSwitchBlocked(true);
      setBlockedReason(
        `This device has already utilized its free tier allocation under account "${primaryAccount}". Switching Gmail accounts on the same machine to claim additional free credits is restricted. Please upgrade to a Student or Plus plan to continue building on this account.`
      );
      setCreditsRemaining(0);
      return false;
    }

    return true;
  };

  const upgradePlan = (plan: PlanType) => {
    setCurrentPlan(plan);
    const newTotal = PLAN_CONFIGS[plan].creditsPerMonth;
    setCreditsRemaining(newTotal);
    setIsAccountSwitchBlocked(false);
    setBlockedReason(null);
    localStorage.setItem('infinity_plan', plan);
    localStorage.setItem('infinity_credits', newTotal.toString());
  };

  const hasSufficientCredits = (cost: number = 1) => {
    if (isAccountSwitchBlocked) return false;
    return creditsRemaining >= cost;
  };

  const consumeCredits = (amount: number = 1, _reason?: string): boolean => {
    if (isAccountSwitchBlocked) {
      setIsPricingModalOpen(true);
      return false;
    }

    if (creditsRemaining < amount || creditsRemaining <= 0) {
      localStorage.setItem('infinity_device_free_consumed', 'true');
      setIsPricingModalOpen(true);
      return false;
    }

    setCreditsRemaining(prev => {
      const next = Math.max(0, prev - amount);
      if (next <= 0) {
        localStorage.setItem('infinity_device_free_consumed', 'true');
      }
      return next;
    });

    return true;
  };

  const dismissBlockedAlert = () => {
    setIsAccountSwitchBlocked(false);
  };

  return (
    <CreditsContext.Provider
      value={{
        currentPlan,
        creditsRemaining,
        totalCredits,
        billingCycle,
        setBillingCycle,
        upgradePlan,
        consumeCredits,
        isPricingModalOpen,
        setIsPricingModalOpen,
        hasSufficientCredits,
        isAccountSwitchBlocked,
        blockedReason,
        verifyAccountBinding,
        dismissBlockedAlert
      }}
    >
      {children}
    </CreditsContext.Provider>
  );
};

export const useCredits = () => {
  const context = useContext(CreditsContext);
  if (!context) {
    throw new Error('useCredits must be used within a CreditsProvider');
  }
  return context;
};
