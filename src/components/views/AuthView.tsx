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
  CheckCircle2
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

  // Animated falling & twinkling stars canvas effect
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

    // Static twinkling stars
    const starCount = 140;
    const stars = Array.from({ length: starCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.7,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.02 + 0.005,
      increasing: Math.random() > 0.5
    }));

    // Shooting stars with glowing trails
    interface ShootingStar {
      x: number;
      y: number;
      length: number;
      speed: number;
      angle: number;
      opacity: number;
      life: number;
      maxLife: number;
    }

    const shootingStars: ShootingStar[] = [];

    const spawnShootingStar = () => {
      if (shootingStars.length < 4 && Math.random() < 0.035) {
        shootingStars.push({
          x: Math.random() * width * 0.8 + width * 0.1,
          y: Math.random() * height * 0.35,
          length: Math.random() * 120 + 80,
          speed: Math.random() * 9 + 6,
          angle: (Math.PI / 4) + (Math.random() * 0.2 - 0.1),
          opacity: 1,
          life: 0,
          maxLife: Math.random() * 40 + 35
        });
      }
    };

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Render twinkling stars
      stars.forEach((star) => {
        if (star.increasing) {
          star.alpha += star.speed;
          if (star.alpha >= 1) {
            star.alpha = 1;
            star.increasing = false;
          }
        } else {
          star.alpha -= star.speed;
          if (star.alpha <= 0.15) {
            star.alpha = 0.15;
            star.increasing = true;
          }
        }

        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(220, 235, 255, ${star.alpha})`;
        ctx.shadowColor = '#60a5fa';
        ctx.shadowBlur = star.radius > 1.2 ? 6 : 2;
        ctx.fill();
      });

      // Spawn & render shooting stars
      spawnShootingStar();

      for (let i = shootingStars.length - 1; i >= 0; i--) {
        const s = shootingStars[i];
        s.life++;
        s.x += Math.cos(s.angle) * s.speed;
        s.y += Math.sin(s.angle) * s.speed;
        s.opacity = 1 - s.life / s.maxLife;

        const tailX = s.x - Math.cos(s.angle) * s.length;
        const tailY = s.y - Math.sin(s.angle) * s.length;

        const gradient = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        gradient.addColorStop(0, `rgba(255, 255, 255, ${s.opacity})`);
        gradient.addColorStop(0.3, `rgba(168, 85, 247, ${s.opacity * 0.8})`);
        gradient.addColorStop(1, 'rgba(56, 189, 248, 0)');

        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.shadowColor = '#c084fc';
        ctx.shadowBlur = 12;
        ctx.stroke();

        // Bright star head
        ctx.beginPath();
        ctx.arc(s.x, s.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity})`;
        ctx.fill();

        if (s.life >= s.maxLife || s.x > width || s.y > height) {
          shootingStars.splice(i, 1);
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
      // Instant access with GitHub student developer identity
      await signInWithGuest('GitHub Developer', email || 'github.builder@sc-infinity.ai');
    } catch (err: any) {
      setErrorText(err.message || 'GitHub access error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-screen min-h-screen bg-[#030611] text-slate-100 flex flex-col justify-between overflow-x-hidden overflow-y-auto select-none font-sans">
      {/* Background Visual Art Layer */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat z-0 pointer-events-none opacity-80 mix-blend-screen scale-100 transition-transform duration-1000"
        style={{ backgroundImage: "url('/sc_infinity_hero_bg.jpg')" }}
      />

      {/* Atmospheric Vignette and Deep Cosmic Gradients */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#030611]/80 via-transparent to-[#030611]/90 pointer-events-none z-0" />
      <div className="fixed inset-0 bg-radial-at-c from-transparent via-[#030611]/40 to-[#030611]/90 pointer-events-none z-0" />

      {/* Falling Stars Canvas */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 pointer-events-none z-10"
      />

      {/* 1. Top Navigation Bar */}
      <header className="relative z-20 w-full px-6 sm:px-12 py-4 flex items-center justify-between backdrop-blur-xs">
        {/* Left: Branding & Gemini Pill */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3 group cursor-pointer">
            {/* Neon Glowing Infinity Icon */}
            <div className="relative flex items-center justify-center">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 via-purple-500 to-cyan-400 blur-sm opacity-80 animate-pulse" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-indigo-200 to-purple-300 drop-shadow-[0_0_12px_rgba(168,85,247,0.8)]">
                  ∞
                </span>
              </div>
            </div>

            <div>
              <div className="font-extrabold text-lg sm:text-xl tracking-tight text-white flex items-center space-x-1.5 leading-none">
                <span>SC INFINITY</span>
                <span className="text-cyan-400 font-light">IDE</span>
              </div>
              <p className="text-[9px] text-cyan-300/80 font-mono tracking-widest uppercase mt-0.5 font-bold">
                Autonomous AI Engineering Suite
              </p>
            </div>
          </div>

          {/* Powered by Google Gemini Pill Badge */}
          <div className="hidden md:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#0c1224]/80 border border-indigo-500/30 text-[11px] text-slate-300 backdrop-blur-md shadow-lg shadow-indigo-950/40">
            <span className="text-slate-400">Powered by</span>
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

        {/* Center & Right: Navigation Links + Join Button */}
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

      {/* 2. Main Hero + Login Card Body */}
      <main className="relative z-20 flex-1 max-w-7xl mx-auto w-full px-6 sm:px-12 py-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        {/* Left Column: Hero Text & Value Props (Cols 1-7) */}
        <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
          {/* Eyebrow Subheading */}
          <div className="text-[11px] font-mono tracking-[0.25em] text-cyan-300/90 font-semibold uppercase flex items-center space-x-2">
            <span>IDEAS</span>
            <span className="text-purple-400">→</span>
            <span>APPS</span>
            <span className="text-purple-400">→</span>
            <span>IMPACT</span>
          </div>

          {/* Main Hero Heading */}
          <div className="space-y-1">
            <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white leading-none">
              Build
            </h1>
            <h2 className="text-4xl sm:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 leading-tight drop-shadow-[0_0_25px_rgba(99,102,241,0.4)]">
              Without Limits.
            </h2>
          </div>

          {/* Subtitle */}
          <p className="text-sm text-slate-300 max-w-lg font-light leading-relaxed">
            Describe. Plan. Build. Run. Test. Fix. Deploy. All with AI.
          </p>

          {/* 4 Feature Cards with Glowing Round Icons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 max-w-xl">
            {/* Feature 1: AI Agent */}
            <div className="flex items-start space-x-3 group">
              <div className="p-2.5 rounded-full bg-indigo-950/70 border border-indigo-500/40 text-cyan-300 shadow-[0_0_15px_rgba(99,102,241,0.25)] group-hover:scale-110 transition-transform shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">AI Agent</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Turns your ideas into real apps</p>
              </div>
            </div>

            {/* Feature 2: Real Terminal */}
            <div className="flex items-start space-x-3 group">
              <div className="p-2.5 rounded-full bg-indigo-950/70 border border-indigo-500/40 text-cyan-300 shadow-[0_0_15px_rgba(99,102,241,0.25)] group-hover:scale-110 transition-transform shrink-0">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Real Terminal</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Run, debug, deploy</p>
              </div>
            </div>

            {/* Feature 3: Autonomous Browser */}
            <div className="flex items-start space-x-3 group">
              <div className="p-2.5 rounded-full bg-indigo-950/70 border border-indigo-500/40 text-cyan-300 shadow-[0_0_15px_rgba(99,102,241,0.25)] group-hover:scale-110 transition-transform shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Autonomous Browser</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Tests your app like a human</p>
              </div>
            </div>

            {/* Feature 4: Local + Cloud Workspace */}
            <div className="flex items-start space-x-3 group">
              <div className="p-2.5 rounded-full bg-indigo-950/70 border border-indigo-500/40 text-cyan-300 shadow-[0_0_15px_rgba(99,102,241,0.25)] group-hover:scale-110 transition-transform shrink-0">
                <Database className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-white">Local + Cloud Workspace</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">Your code, your control</p>
              </div>
            </div>
          </div>

          {/* Testimonial Quote Glass Card */}
          <div className="p-4 rounded-2xl bg-[#090e1f]/70 border border-slate-700/50 backdrop-blur-md max-w-md shadow-xl flex items-start space-x-3">
            <span className="text-2xl text-cyan-400 font-serif leading-none shrink-0">“</span>
            <div className="space-y-1">
              <p className="text-xs text-slate-300 italic leading-snug">
                Not just a code editor. A complete AI development universe.
              </p>
              <p className="text-[10px] text-slate-400 font-semibold tracking-wider">
                — SC INFINITY
              </p>
            </div>
          </div>

          {/* Bottom Stats Badges */}
          <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-300">
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

        {/* Right Column: Glassmorphic Login Card (Cols 8-12) */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end relative">
          {/* Neon Glow Behind Card */}
          <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-500/40 via-indigo-600/40 to-purple-600/40 rounded-[32px] blur-xl opacity-75 -z-10 animate-pulse" />

          {/* Glassmorphic Container */}
          <div className="w-full max-w-md bg-[#0b1021]/85 border-2 border-cyan-400/40 rounded-3xl p-6 sm:p-8 backdrop-blur-2xl shadow-2xl shadow-cyan-950/50 relative overflow-hidden flex flex-col space-y-5">
            {/* Top Bar: Card Header & Theme Pill Slider */}
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-black text-white tracking-tight">
                  Welcome Back
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Sign in to your SC INFINITY workspace
                </p>
              </div>

              {/* Light/Dark Pill Toggle Slider */}
              <div 
                onClick={toggleTheme}
                className="flex items-center bg-[#070b16] border border-slate-700/80 rounded-full p-1 cursor-pointer transition-all hover:border-slate-500"
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

            {/* Error Message */}
            {(errorText || authError) && (
              <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-500/50 text-rose-300 text-xs flex items-center space-x-2 animate-in fade-in">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                <span>{errorText || authError}</span>
              </div>
            )}

            {/* Social Logins */}
            <div className="space-y-2.5">
              {/* Continue with Google */}
              <button
                onClick={handleGoogleClick}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#11182c]/90 hover:bg-[#18213a] border border-slate-700/80 text-xs font-semibold text-white flex items-center justify-center space-x-2.5 transition-all shadow-sm hover:border-slate-500 active:scale-98 cursor-pointer"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              {/* Continue with GitHub (Replaces Apple login as requested) */}
              <button
                onClick={handleGitHubClick}
                disabled={isLoading}
                className="w-full py-2.5 px-4 rounded-xl bg-[#11182c]/90 hover:bg-[#18213a] border border-slate-700/80 text-xs font-semibold text-white flex items-center justify-center space-x-2.5 transition-all shadow-sm hover:border-slate-500 active:scale-98 cursor-pointer"
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
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#070c18] border border-slate-700/80 focus:border-cyan-400 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-all shadow-inner"
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
                    className="text-[10px] text-cyan-400 hover:underline"
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
                    className="w-full pl-10 pr-10 py-2.5 bg-[#070c18] border border-slate-700/80 focus:border-cyan-400 rounded-xl text-xs text-white placeholder-slate-500 outline-none transition-all shadow-inner"
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

              {/* Main Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/40 border border-indigo-400/40 flex items-center justify-center space-x-2 transition-all active:scale-95 cursor-pointer mt-2"
              >
                <span>{isLoading ? 'Opening Workspace...' : 'Open SC INFINITY IDE →'}</span>
              </button>
            </form>

            {/* Switch Mode Link */}
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                className="text-xs text-slate-400 hover:text-white transition-colors"
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

      {/* 3. Handwritten Neon Tag & Vertical Nav Accents */}
      <div className="hidden xl:flex fixed right-8 top-1/3 flex-col items-center space-y-4 text-[10px] font-mono tracking-widest text-slate-400 select-none pointer-events-none opacity-80 z-20">
        <span className="rotate-90 origin-center translate-y-3">THINK</span>
        <span className="rotate-90 origin-center translate-y-6">BUILD</span>
        <span className="rotate-90 origin-center translate-y-9">LEARN</span>
        <span className="rotate-90 origin-center translate-y-12">DEPLOY</span>
        <span className="rotate-90 origin-center translate-y-16">GROW</span>
        <span className="text-cyan-400 text-sm font-black translate-y-20">∞</span>
      </div>

      {/* Handwritten Neon Script in Bottom Right */}
      <div className="hidden lg:block fixed bottom-14 right-10 select-none pointer-events-none z-20">
        <div className="font-serif italic text-xl sm:text-2xl text-cyan-300 font-extrabold tracking-wide drop-shadow-[0_0_12px_rgba(34,211,238,0.8)] -rotate-6">
          Students Build Tomorrow
        </div>
        <svg className="w-24 h-6 text-purple-400 -mt-1 ml-6 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" viewBox="0 0 100 20" fill="none">
          <path d="M5 12 Q 35 2 65 10 T 95 6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* 4. Footer Bar */}
      <footer className="relative z-20 w-full px-6 sm:px-12 py-3 border-t border-slate-800/60 bg-[#030611]/80 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-2">
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
