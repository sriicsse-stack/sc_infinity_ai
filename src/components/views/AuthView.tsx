import React, { useState } from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  Lock, 
  Mail, 
  User, 
  ShieldCheck, 
  CheckCircle2, 
  Zap, 
  Cpu, 
  Layers, 
  Rocket, 
  Code2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AnimatedInfinity } from '../common/AnimatedInfinity';

export const AuthView: React.FC = () => {
  const { signInWithGoogle, signInWithEmailPassword, signInWithGuest, authError } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorText('Please enter your email address');
      return;
    }
    setErrorText(null);
    setIsLoading(true);
    try {
      await signInWithEmailPassword(email, password, name);
    } catch (err: any) {
      setErrorText(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleClick = async () => {
    setErrorText(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      setErrorText(err.message || 'Google sign-in error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestClick = async () => {
    setErrorText(null);
    setIsLoading(true);
    try {
      await signInWithGuest('Engineer', 'developer@sc-infinity.ai');
    } catch (err: any) {
      setErrorText(err.message || 'Quick access error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen bg-[#06080f] text-slate-200 flex items-center justify-center p-4 sm:p-8 relative overflow-hidden select-none">
      {/* Background glow meshes */}
      <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 translate-x-1/2 translate-y-1/2 w-[500px] h-[300px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 rounded-3xl bg-[#0c101d]/90 border border-[#1f293d] shadow-2xl backdrop-blur-xl overflow-hidden relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Left Side: Product Showcase */}
        <div className="p-8 sm:p-10 bg-gradient-to-br from-[#0f1424] to-[#0a0d18] border-b lg:border-b-0 lg:border-r border-[#1f293d] flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <AnimatedInfinity state="idle" size="md" />
              <div>
                <h1 className="text-xl font-black tracking-tight text-white flex items-center space-x-1.5">
                  <span>SC INFINITY</span>
                  <span className="text-indigo-400 font-normal">IDE</span>
                </h1>
                <p className="text-[10px] text-indigo-400 font-mono font-semibold uppercase tracking-wider">
                  Autonomous AI Engineering Suite
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed pt-2">
              Transform natural language prompts into production-ready web applications with full autonomous lifecycle engineering.
            </p>

            <div className="space-y-2.5 pt-4">
              <div className="flex items-start space-x-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Google Antigravity Flow</strong>: Idea → Plan → Build → Run → Test → Fix → Live Preview</span>
              </div>
              <div className="flex items-start space-x-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Autonomous Browser Testing</strong> ("Eyes") with real E2E interaction validation</span>
              </div>
              <div className="flex items-start space-x-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Self-Healing Engine</strong>: Automatic error diagnosis & code patch resolution</span>
              </div>
              <div className="flex items-start space-x-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Monaco Editor + Live Multi-Language Sandboxes</strong> with 1-click cloud deploy</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Powered by DeepMind Gemini</span>
            <span className="text-emerald-400">v1.0.0 Universal</span>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-center space-y-6">
          <div className="space-y-1">
            <h2 className="text-xl font-bold text-white">
              {mode === 'login' ? 'Sign in to Workspace' : 'Create Infinity Account'}
            </h2>
            <p className="text-xs text-slate-400">
              {mode === 'login' ? 'Access your cloud workspace, projects & AI agents.' : 'Start building autonomous web software in seconds.'}
            </p>
          </div>

          {/* Error Banner */}
          {(errorText || authError) && (
            <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center space-x-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
              <span>{errorText || authError}</span>
            </div>
          )}

          {/* Social Logins */}
          <div className="space-y-2">
            <button
              onClick={handleGoogleClick}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-white flex items-center justify-center space-x-2.5 transition-all shadow-sm cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continue with Google</span>
            </button>

            <button
              onClick={handleGuestClick}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-xs font-semibold text-indigo-300 hover:text-white flex items-center justify-center space-x-2 transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>1-Click Developer Access (Instant Demo)</span>
            </button>
          </div>

          <div className="flex items-center space-x-3 text-[11px] text-slate-500 uppercase tracking-wider">
            <div className="flex-1 border-t border-slate-800" />
            <span>or email sign in</span>
            <div className="flex-1 border-t border-slate-800" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === 'register' && (
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sri Developer"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="developer@sc-infinity.ai"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-900/80 border border-slate-800 focus:border-indigo-500 rounded-xl text-xs text-white outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-1.5 transition-all cursor-pointer"
            >
              <span>{mode === 'login' ? 'Open SC INFINITY IDE' : 'Create & Enter IDE'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          <div className="text-center">
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-xs text-indigo-400 hover:underline font-medium cursor-pointer"
            >
              {mode === 'login' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
