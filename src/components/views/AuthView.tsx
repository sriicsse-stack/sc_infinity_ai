import React, { useState, useEffect, useRef } from 'react';
import { 
  Zap, 
  Terminal, 
  Globe, 
  Database, 
  Sparkles, 
  ArrowRight, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Sun, 
  Moon,
  Github,
  Quote,
  GraduationCap,
  Heart,
  Star,
  CheckCircle2,
  Code2,
  Cpu,
  Layers
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const AuthView: React.FC = () => {
  const { signInWithGoogle, signInWithEmailPassword, signInWithGuest, authError } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Pure Canvas Particle & Celestial Infinity Space Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Stars
    const starCount = 100;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.7 + 0.3,
      speed: Math.random() * 0.012 + 0.004,
      dir: Math.random() > 0.5 ? 1 : -1
    }));

    // Shooting Meteors
    interface Meteor {
      x: number;
      y: number;
      len: number;
      speed: number;
      alpha: number;
      angle: number;
      life: number;
      maxLife: number;
    }

    const meteors: Meteor[] = [];

    const spawnMeteor = () => {
      if (meteors.length < 2 && Math.random() < 0.02) {
        meteors.push({
          x: Math.random() * width * 0.5 + width * 0.1,
          y: Math.random() * height * 0.3,
          len: Math.random() * 130 + 70,
          speed: Math.random() * 7 + 5,
          alpha: 1,
          angle: Math.PI / 4 + (Math.random() * 0.1 - 0.05),
          life: 0,
          maxLife: Math.random() * 30 + 25
        });
      }
    };

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      // 1. Draw Starfield
      stars.forEach((s) => {
        s.alpha += s.speed * s.dir;
        if (s.alpha >= 0.95) s.dir = -1;
        if (s.alpha <= 0.15) s.dir = 1;

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(186, 230, 253, ${s.alpha})`;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = s.size > 1 ? 4 : 0;
        ctx.fill();
      });

      // 2. Spawn and Draw Meteors
      spawnMeteor();

      for (let i = meteors.length - 1; i >= 0; i--) {
        const m = meteors[i];
        m.life++;
        m.x += Math.cos(m.angle) * m.speed;
        m.y += Math.sin(m.angle) * m.speed;
        m.alpha = 1 - m.life / m.maxLife;

        const tailX = m.x - Math.cos(m.angle) * m.len;
        const tailY = m.y - Math.sin(m.angle) * m.len;

        const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        grad.addColorStop(0, `rgba(255, 255, 255, ${m.alpha})`);
        grad.addColorStop(0.3, `rgba(168, 85, 247, ${m.alpha * 0.8})`);
        grad.addColorStop(0.8, `rgba(56, 189, 248, ${m.alpha * 0.3})`);
        grad.addColorStop(1, 'rgba(5, 8, 20, 0)');

        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 2;
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 8;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(m.x, m.y, 1.8, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${m.alpha})`;
        ctx.fill();

        if (m.life >= m.maxLife || m.x > width || m.y > height) {
          meteors.splice(i, 1);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

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

  const handleGitHubClick = async () => {
    setErrorText(null);
    setIsLoading(true);
    try {
      await signInWithGuest('GitHub Developer', email || 'developer@sc-infinity.ai');
    } catch (err: any) {
      setErrorText(err.message || 'GitHub access error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-screen min-h-screen bg-[#050713] text-slate-100 flex flex-col justify-between overflow-x-hidden overflow-y-auto select-none font-sans">
      {/* 1. Procedural Ambient Radial Light Meshes */}
      <div className="fixed top-[-15%] left-[-10%] w-[55vw] h-[55vw] rounded-full bg-gradient-to-br from-indigo-600/15 via-purple-600/10 to-transparent blur-[140px] pointer-events-none z-0" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-gradient-to-tl from-cyan-500/15 via-violet-600/10 to-transparent blur-[140px] pointer-events-none z-0" />
      <div className="fixed top-[30%] left-[30%] w-[35vw] h-[35vw] rounded-full bg-indigo-500/10 blur-[160px] pointer-events-none z-0" />

      {/* 2. Starfield & Meteor Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-10" />

      {/* 3. Top Navigation Header */}
      <header className="relative z-20 w-full px-6 sm:px-12 py-4 flex items-center justify-between border-b border-slate-800/50 bg-[#050713]/60 backdrop-blur-xl">
        {/* Left: Branding & Gemini Pill */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 group cursor-pointer">
            {/* Glowing Infinity Icon Badge */}
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-purple-600 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-400/40 transition-all">
              <div className="w-full h-full bg-[#070b19] rounded-2xl flex items-center justify-center">
                <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-200 to-purple-300">
                  ∞
                </span>
              </div>
            </div>

            <div>
              <div className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center space-x-1.5 leading-tight">
                <span>SC INFINITY</span>
                <span className="text-cyan-400 font-normal">IDE</span>
              </div>
              <p className="text-[9px] text-cyan-300/80 font-mono tracking-widest uppercase font-bold">
                Autonomous AI Engineering Suite
              </p>
            </div>
          </div>

          {/* Powered by Google Gemini Pill */}
          <div className="hidden md:flex items-center space-x-2 px-3 py-1 rounded-full bg-[#0d1428]/80 border border-indigo-500/30 text-[11px] text-slate-300 backdrop-blur-md shadow-md shadow-indigo-950/40">
            <span className="text-slate-400 text-[10px]">Powered by</span>
            <div className="flex items-center space-x-1 font-semibold text-white">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Google Gemini</span>
            </div>
          </div>
        </div>

        {/* Center & Right Navigation */}
        <div className="flex items-center space-x-6">
          <nav className="hidden lg:flex items-center space-x-6 text-xs font-medium text-slate-300">
            <span className="hover:text-cyan-300 cursor-pointer transition-colors">Build</span>
            <span className="hover:text-cyan-300 cursor-pointer transition-colors">Learn</span>
            <span className="hover:text-cyan-300 cursor-pointer transition-colors">Deploy</span>
            <span className="hover:text-cyan-300 cursor-pointer transition-colors">Innovate</span>
          </nav>

          <button
            onClick={handleGoogleClick}
            className="px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold tracking-wide flex items-center space-x-1.5 shadow-lg shadow-indigo-600/30 border border-indigo-400/40 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Join the Next Generation →</span>
          </button>
        </div>
      </header>

      {/* 4. Main Two-Column Layout (Left: Hero 55% | Right: One Real Login Card 45%) */}
      <main className="relative z-20 flex-1 max-w-7xl mx-auto w-full px-6 sm:px-12 py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
        {/* Left Column (55% on desktop) */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
          {/* Eyebrow Tracking Pill */}
          <div className="inline-flex items-center space-x-2 text-[11px] font-mono font-semibold tracking-[0.22em] text-cyan-300/90 uppercase bg-cyan-950/40 border border-cyan-500/30 px-3.5 py-1 rounded-full w-fit backdrop-blur-md">
            <span>IDEAS</span>
            <span className="text-purple-400">→</span>
            <span>APPS</span>
            <span className="text-purple-400">→</span>
            <span>IMPACT</span>
          </div>

          {/* Main Hero Heading with Subtle Shimmer */}
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white leading-none">
              Build
            </h1>
            <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 leading-tight drop-shadow-[0_0_35px_rgba(99,102,241,0.35)]">
              Without Limits.
            </h2>
          </div>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-slate-300 max-w-xl font-light leading-relaxed">
            Describe. Plan. Build. Run. Test. Fix. Deploy. All with autonomous AI.
          </p>

          {/* 4 Clean Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2 max-w-xl">
            {/* Feature 1: AI Agent */}
            <div className="p-3.5 rounded-2xl bg-[#0c1226]/80 border border-slate-800/90 hover:border-cyan-500/40 hover:bg-[#0f1730] transition-all flex items-start space-x-3 group shadow-md backdrop-blur-xl">
              <div className="p-2.5 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-cyan-300 shadow-[0_0_15px_rgba(99,102,241,0.25)] group-hover:scale-105 transition-transform shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">AI Agent</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Turns your ideas into real apps</p>
              </div>
            </div>

            {/* Feature 2: Real Terminal */}
            <div className="p-3.5 rounded-2xl bg-[#0c1226]/80 border border-slate-800/90 hover:border-cyan-500/40 hover:bg-[#0f1730] transition-all flex items-start space-x-3 group shadow-md backdrop-blur-xl">
              <div className="p-2.5 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-cyan-300 shadow-[0_0_15px_rgba(99,102,241,0.25)] group-hover:scale-105 transition-transform shrink-0">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Real Terminal</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Run, debug, deploy</p>
              </div>
            </div>

            {/* Feature 3: Autonomous Browser */}
            <div className="p-3.5 rounded-2xl bg-[#0c1226]/80 border border-slate-800/90 hover:border-cyan-500/40 hover:bg-[#0f1730] transition-all flex items-start space-x-3 group shadow-md backdrop-blur-xl">
              <div className="p-2.5 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-cyan-300 shadow-[0_0_15px_rgba(99,102,241,0.25)] group-hover:scale-105 transition-transform shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Autonomous Browser</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Tests your app like a human</p>
              </div>
            </div>

            {/* Feature 4: Local + Cloud Workspace */}
            <div className="p-3.5 rounded-2xl bg-[#0c1226]/80 border border-slate-800/90 hover:border-cyan-500/40 hover:bg-[#0f1730] transition-all flex items-start space-x-3 group shadow-md backdrop-blur-xl">
              <div className="p-2.5 rounded-xl bg-indigo-950/80 border border-indigo-500/40 text-cyan-300 shadow-[0_0_15px_rgba(99,102,241,0.25)] group-hover:scale-105 transition-transform shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Local + Cloud Workspace</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Your code, your control</p>
              </div>
            </div>
          </div>

          {/* Testimonial Quote Glass Card */}
          <div className="p-4 rounded-2xl bg-[#0a0f22]/90 border border-slate-800/80 backdrop-blur-xl max-w-lg shadow-lg flex items-start space-x-3">
            <span className="text-2xl text-cyan-400 font-serif leading-none shrink-0">“</span>
            <div className="space-y-1">
              <p className="text-xs text-slate-300 italic leading-snug">
                Not just a code editor. A complete AI development universe.
              </p>
              <p className="text-[10px] text-cyan-300 font-mono font-semibold tracking-wider">
                — SC INFINITY
              </p>
            </div>
          </div>

          {/* Bottom Trust Badges */}
          <div className="flex flex-wrap items-center gap-6 pt-1 text-xs text-slate-300">
            <div className="flex items-center space-x-2">
              <GraduationCap className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-white">10x</span>
              <span className="text-slate-400 text-[11px]">Faster Development</span>
            </div>

            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-purple-400 fill-purple-400/20" />
              <span className="font-bold text-white">Loved by</span>
              <span className="text-slate-400 text-[11px]">Students & Builders</span>
            </div>

            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400/20" />
              <span className="font-bold text-white">From Idea</span>
              <span className="text-slate-400 text-[11px]">to Production</span>
            </div>
          </div>
        </div>

        {/* Right Column (45% on desktop): Exactly ONE Real Functional Login Card */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
          {/* Subtle Breathing Border Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/30 via-indigo-600/30 to-purple-600/30 rounded-[34px] blur-xl opacity-60 -z-10" />

          {/* Single Precision-Engineered Glassmorphic Login Card */}
          <div className="w-full max-w-md bg-[#080d1e]/95 border-2 border-cyan-400/40 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-cyan-950/60 flex flex-col space-y-5">
            {/* Top Bar: Title & Theme Switch */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  Welcome Back
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sign in to your SC INFINITY workspace
                </p>
              </div>

              {/* Theme Slider */}
              <div 
                onClick={toggleTheme}
                className="flex items-center bg-[#050814] border border-slate-700/80 rounded-full p-1 cursor-pointer transition-all hover:border-cyan-500/50"
                title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              >
                <div className={`p-1 rounded-full transition-colors ${theme === 'light' ? 'bg-amber-400 text-slate-900' : 'text-slate-400'}`}>
                  <Sun className="w-3 h-3" />
                </div>
                <div className={`p-1 rounded-full transition-colors ${theme === 'dark' ? 'bg-indigo-600 text-white' : 'text-slate-400'}`}>
                  <Moon className="w-3 h-3" />
                </div>
              </div>
            </div>

            {/* Error Feedback */}
            {(errorText || authError) && (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center space-x-2 animate-in fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                <span>{errorText || authError}</span>
              </div>
            )}

            {/* Social Logins (Google & GitHub) */}
            <div className="space-y-2.5">
              {/* Continue with Google */}
              <button
                onClick={handleGoogleClick}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0f162e] hover:bg-[#162040] border border-slate-700/80 text-xs font-semibold text-white flex items-center justify-center space-x-2.5 transition-all shadow-sm hover:border-slate-500 active:scale-98 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Continue with GitHub */}
              <button
                onClick={handleGitHubClick}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#0f162e] hover:bg-[#162040] border border-slate-700/80 text-xs font-semibold text-white flex items-center justify-center space-x-2.5 transition-all shadow-sm hover:border-slate-500 active:scale-98 cursor-pointer"
              >
                <Github className="w-4 h-4 shrink-0 text-white" />
                <span>Continue with GitHub</span>
              </button>
            </div>

            {/* Divider */}
            <div className="flex items-center space-x-3 text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
              <div className="flex-1 border-t border-slate-800" />
              <span>OR SIGN IN WITH EMAIL</span>
              <div className="flex-1 border-t border-slate-800" />
            </div>

            {/* Email / Password Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Optional Name on Register */}
              {mode === 'register' && (
                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-300">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sri Developer"
                    className="w-full px-3.5 py-2.5 bg-[#050814] border border-slate-700/80 focus:border-cyan-400 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-all shadow-inner"
                  />
                </div>
              )}

              {/* Email Address */}
              <div className="space-y-1">
                <label className="block text-[11px] font-semibold text-slate-300">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#050814] border border-slate-700/80 focus:border-cyan-400 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-all shadow-inner"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-slate-300">Password</label>
                  <button 
                    type="button" 
                    onClick={() => setErrorText('Password reset instructions sent to your email.')}
                    className="text-[10px] text-cyan-400 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2.5 bg-[#050814] border border-slate-700/80 focus:border-cyan-400 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-all shadow-inner"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/40 border border-indigo-400/40 flex items-center justify-center space-x-2 transition-all active:scale-95 cursor-pointer mt-2"
              >
                <span>{isLoading ? 'Opening Workspace...' : 'Open SC INFINITY IDE →'}</span>
              </button>
            </form>

            {/* Mode Switcher */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                {mode === 'login' ? (
                  <span>Don't have an account? <strong className="text-cyan-400 hover:underline">Create one</strong></span>
                ) : (
                  <span>Already have an account? <strong className="text-cyan-400 hover:underline">Sign in</strong></span>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* 5. Footer Bar */}
      <footer className="relative z-20 w-full px-6 sm:px-12 py-4 border-t border-slate-800/60 bg-[#050713]/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
        <div>
          © 2026 SC INFINITY. All rights reserved.
        </div>

        <div className="flex items-center space-x-1.5 font-medium text-slate-300">
          <span>Made for Dreamers. Built for Builders.</span>
          <span className="text-cyan-400 font-bold">∞</span>
        </div>

        <div className="flex items-center space-x-4">
          <span className="hover:text-white cursor-pointer">Privacy</span>
          <span className="hover:text-white cursor-pointer">Terms</span>
          <span className="hover:text-white cursor-pointer">Support</span>
          <div className="flex items-center space-x-2 text-slate-400 pl-2">
            <span className="hover:text-cyan-400 cursor-pointer text-xs">💬</span>
            <span className="hover:text-cyan-400 cursor-pointer text-xs">🐦</span>
            <span className="hover:text-cyan-400 cursor-pointer text-xs">▶️</span>
            <span className="hover:text-cyan-400 cursor-pointer text-xs">💼</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
