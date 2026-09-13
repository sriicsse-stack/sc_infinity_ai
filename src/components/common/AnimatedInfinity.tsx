import React from 'react';
import { InfinityState } from '../../types';

interface AnimatedInfinityProps {
  state?: InfinityState;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AnimatedInfinity: React.FC<AnimatedInfinityProps> = ({
  state = 'idle',
  size = 'md',
  className = ''
}) => {
  const sizeMap = {
    xs: { width: 20, height: 10, stroke: 3.5 },
    sm: { width: 28, height: 14, stroke: 4 },
    md: { width: 36, height: 18, stroke: 4.5 },
    lg: { width: 48, height: 24, stroke: 5 },
    xl: { width: 64, height: 32, stroke: 5.5 }
  };

  const currentSize = sizeMap[size];

  const getPathClass = () => {
    switch (state) {
      case 'ai_thinking':
        return 'infinity-path-thinking';
      case 'building':
        return 'infinity-path-building';
      case 'success':
        return 'infinity-path-success';
      case 'error':
        return 'infinity-path-error';
      case 'loading':
        return 'infinity-path-loading';
      case 'idle':
      default:
        return 'infinity-path-idle';
    }
  };

  const getGlowColors = () => {
    switch (state) {
      case 'success':
        return { start: '#10b981', mid: '#34d399', end: '#059669' };
      case 'error':
        return { start: '#f43f5e', mid: '#fb7185', end: '#e11d48' };
      case 'building':
        return { start: '#6366f1', mid: '#a855f7', end: '#ec4899' };
      case 'ai_thinking':
        return { start: '#8b5cf6', mid: '#6366f1', end: '#3b82f6' };
      case 'idle':
      default:
        return { start: '#6366f1', mid: '#8b5cf6', end: '#3b82f6' };
    }
  };

  const colors = getGlowColors();

  return (
    <div className={`inline-flex items-center justify-center relative ${className}`}>
      <svg
        width={currentSize.width}
        height={currentSize.height}
        viewBox="0 0 100 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="transition-all duration-300"
      >
        <defs>
          <linearGradient id={`inf-grad-${state}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={colors.start} />
            <stop offset="50%" stopColor={colors.mid} />
            <stop offset="100%" stopColor={colors.end} />
          </linearGradient>
          <filter id={`inf-glow-${state}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={state === 'building' ? 4 : 2.5} result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Base semi-transparent track */}
        <path
          d="M 30,25 C 12,25 6,8 20,8 C 34,8 46,25 50,25 C 54,25 66,8 80,8 C 94,8 88,25 70,25 C 56,25 44,42 50,42 C 56,42 66,25 80,25 C 94,25 88,42 70,42 C 54,42 44,25 30,25 Z"
          stroke={colors.start}
          strokeWidth={currentSize.stroke - 1}
          strokeOpacity="0.25"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dynamic Animated Flow Path */}
        <path
          d="M 30,25 C 12,25 6,8 20,8 C 34,8 46,25 50,25 C 54,25 66,8 80,8 C 94,8 88,25 70,25 C 56,25 44,42 50,42 C 56,42 66,25 80,25 C 94,25 88,42 70,42 C 54,42 44,25 30,25 Z"
          stroke={`url(#inf-grad-${state})`}
          strokeWidth={currentSize.stroke}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#inf-glow-${state})`}
          className={getPathClass()}
        />
      </svg>
    </div>
  );
};
