import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserPersonalizationProfile } from '../types';

interface PersonalizationContextType {
  profile: UserPersonalizationProfile;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  updateProfile: (updates: Partial<UserPersonalizationProfile>) => void;
  completeOnboarding: (finalProfile: Partial<UserPersonalizationProfile>) => void;
  skipOnboarding: () => void;
  resetOnboarding: () => void;
  calculateRecommendedPlan: (prof: Partial<UserPersonalizationProfile>) => 'free' | 'student' | 'plus' | 'pro' | 'team';
}

const DEFAULT_PROFILE: UserPersonalizationProfile = {
  purpose: 'projects',
  role: 'developer',
  experienceLevel: 'intermediate',
  techStacks: ['Web Apps', 'React', 'Node.js'],
  aiAssistanceStyles: ['build_features', 'fix_bugs', 'review'],
  primaryGoal: 'build_faster',
  recommendedPlan: 'student',
  onboardingCompleted: false,
  firstProjectIdea: '',
  lastUpdated: new Date().toISOString()
};

const STORAGE_KEY = 'sc_infinity_user_profile';
const ONBOARDING_STATUS_KEY = 'sc_infinity_onboarding_completed';

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

export const PersonalizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<UserPersonalizationProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.error('Failed to load personalization profile:', e);
    }
    return DEFAULT_PROFILE;
  });

  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(() => {
    try {
      const completed = localStorage.getItem(ONBOARDING_STATUS_KEY);
      return completed !== 'true';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (e) {
      console.error('Failed to persist personalization profile:', e);
    }
  }, [profile]);

  const calculateRecommendedPlan = (prof: Partial<UserPersonalizationProfile>): 'free' | 'student' | 'plus' | 'pro' | 'team' => {
    const role = prof.role || profile.role;
    const exp = prof.experienceLevel || profile.experienceLevel;
    const purpose = prof.purpose || profile.purpose;
    const goal = prof.primaryGoal || profile.primaryGoal;

    if (role === 'founder' || goal === 'ship_production' || (role === 'developer' && exp === 'advanced')) {
      return 'pro';
    }
    if (role === 'student' || purpose === 'learn' || goal === 'learn_faster' || goal === 'career_ready') {
      return 'student';
    }
    if (role === 'professional' || purpose === 'products' || exp === 'intermediate') {
      return 'plus';
    }
    return 'student';
  };

  const updateProfile = (updates: Partial<UserPersonalizationProfile>) => {
    setProfile(prev => {
      const updated = { ...prev, ...updates, lastUpdated: new Date().toISOString() };
      updated.recommendedPlan = calculateRecommendedPlan(updated);
      return updated;
    });
  };

  const completeOnboarding = (finalProfile: Partial<UserPersonalizationProfile>) => {
    const recPlan = calculateRecommendedPlan(finalProfile);
    const complete: UserPersonalizationProfile = {
      ...profile,
      ...finalProfile,
      recommendedPlan: recPlan,
      onboardingCompleted: true,
      lastUpdated: new Date().toISOString()
    };
    setProfile(complete);
    setIsOnboardingOpen(false);
    try {
      localStorage.setItem(ONBOARDING_STATUS_KEY, 'true');
      localStorage.setItem(STORAGE_KEY, JSON.stringify(complete));
    } catch (e) {
      console.error('Failed to mark onboarding complete:', e);
    }
  };

  const skipOnboarding = () => {
    setIsOnboardingOpen(false);
    try {
      localStorage.setItem(ONBOARDING_STATUS_KEY, 'true');
    } catch (e) {
      console.error('Failed to set skip onboarding:', e);
    }
  };

  const resetOnboarding = () => {
    try {
      localStorage.removeItem(ONBOARDING_STATUS_KEY);
    } catch (e) {
      console.error('Failed to reset onboarding status:', e);
    }
    setIsOnboardingOpen(true);
  };

  return (
    <PersonalizationContext.Provider
      value={{
        profile,
        isOnboardingOpen,
        setIsOnboardingOpen,
        updateProfile,
        completeOnboarding,
        skipOnboarding,
        resetOnboarding,
        calculateRecommendedPlan
      }}
    >
      {children}
    </PersonalizationContext.Provider>
  );
};

export const usePersonalization = () => {
  const context = useContext(PersonalizationContext);
  if (!context) {
    throw new Error('usePersonalization must be used within a PersonalizationProvider');
  }
  return context;
};
