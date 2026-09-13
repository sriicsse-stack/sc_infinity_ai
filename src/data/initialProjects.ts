import { FileNode, ProjectMeta } from '../types';

export const initialProjects: ProjectMeta[] = [
  {
    id: 'student-portal',
    name: 'Student Portal',
    tagline: 'Modern authenticated university portal',
    technology: 'React + Firebase',
    framework: 'React 18 / Vite / Firebase / Tailwind',
    lastModified: 'Just now',
    icon: 'GraduationCap',
    templateType: 'react',
    port: 5173,
    rootPath: 'student-portal',
    description: 'An AI-ready portal featuring Firebase Auth, Realtime DB, dashboard analytics, course schedules, and Supabase integration.'
  },
  {
    id: 'ai-notes',
    name: 'AI Notes',
    tagline: 'Smart markdown note taking with semantic search',
    technology: 'Next.js + Firebase',
    framework: 'Next.js 14 / TypeScript / Firebase',
    lastModified: '2 hours ago',
    icon: 'BookOpen',
    templateType: 'nextjs',
    port: 3000,
    rootPath: 'ai-notes',
    description: 'Real-time collaborative notes application with Gemini summarization.'
  },
  {
    id: 'weather-app',
    name: 'Weather App',
    tagline: 'Hyperlocal weather forecasting with animated radar',
    technology: 'React',
    framework: 'React / Tailwind / Chart.js',
    lastModified: 'Yesterday',
    icon: 'CloudSun',
    templateType: 'react',
    port: 5174,
    rootPath: 'weather-app',
    description: 'Modern weather dashboard with 7-day forecast, air quality index, and radar maps.'
  },
  {
    id: 'attendance-system',
    name: 'College Attendance System',
    tagline: 'Attendance tracking with biometric & geofence support',
    technology: 'React + Node.js + Firebase',
    framework: 'Full Stack Node & React',
    lastModified: '3 days ago',
    icon: 'CheckSquare',
    templateType: 'react',
    port: 5175,
    rootPath: 'attendance-system',
    description: 'Attendance automation system built with React, Node.js API, and Firebase Realtime database.'
  }
];

export const studentPortalFiles: FileNode = {
  id: 'root',
  name: 'student-portal',
  path: 'student-portal',
  type: 'directory',
  isOpen: true,
  children: [
    {
      id: 'vscode-folder',
      name: '.vscode',
      path: 'student-portal/.vscode',
      type: 'directory',
      isOpen: false,
      children: [
        {
          id: 'settings-json',
          name: 'settings.json',
          path: 'student-portal/.vscode/settings.json',
          type: 'file',
          language: 'json',
          content: '{\n  "editor.formatOnSave": true,\n  "editor.tabSize": 2\n}'
        }
      ]
    },
    {
      id: 'node-modules-folder',
      name: 'node_modules',
      path: 'student-portal/node_modules',
      type: 'directory',
      isOpen: false,
      children: []
    },
    {
      id: 'public-folder',
      name: 'public',
      path: 'student-portal/public',
      type: 'directory',
      isOpen: false,
      children: [
        {
          id: 'vite-svg',
          name: 'vite.svg',
          path: 'student-portal/public/vite.svg',
          type: 'file',
          language: 'html',
          content: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path fill="#646CFF" d="M29.5 5.5L16 29.5 2.5 5.5h27z"/></svg>'
        }
      ]
    },
    {
      id: 'src-folder',
      name: 'src',
      path: 'student-portal/src',
      type: 'directory',
      isOpen: true,
      children: [
        {
          id: 'components-folder',
          name: 'components',
          path: 'student-portal/src/components',
          type: 'directory',
          isOpen: true,
          children: [
            {
              id: 'navbar-tsx',
              name: 'Navbar.tsx',
              path: 'student-portal/src/components/Navbar.tsx',
              type: 'file',
              language: 'typescript',
              content: `import React from 'react';\nimport { Infinity, Bell, User } from 'lucide-react';\n\nexport const Navbar: React.FC<{ userName?: string }> = ({ userName = 'Alex Rivera' }) => {\n  return (\n    <nav className="h-14 border-b border-slate-800 bg-[#0d111c] px-6 flex items-center justify-between">\n      <div className="flex items-center space-x-3">\n        <Infinity className="w-6 h-6 text-indigo-400" />\n        <span className="font-semibold text-white tracking-wide">Student Portal</span>\n      </div>\n      <div className="flex items-center space-x-4">\n        <button className="text-slate-400 hover:text-white p-2 rounded-lg">\n          <Bell className="w-4 h-4" />\n        </button>\n        <div className="flex items-center space-x-2 border border-slate-700 bg-slate-800/60 px-3 py-1.5 rounded-full">\n          <User className="w-4 h-4 text-indigo-400" />\n          <span className="text-xs font-medium text-slate-200">{userName}</span>\n        </div>\n      </div>\n    </nav>\n  );\n};`
            },
            {
              id: 'button-tsx',
              name: 'Button.tsx',
              path: 'student-portal/src/components/Button.tsx',
              type: 'file',
              language: 'typescript',
              content: `import React from 'react';\n\ninterface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {\n  variant?: 'primary' | 'secondary' | 'outline';\n  loading?: boolean;\n}\n\nexport const Button: React.FC<ButtonProps> = ({\n  children,\n  variant = 'primary',\n  loading,\n  className = '',\n  ...props\n}) => {\n  const baseStyle = "w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 flex items-center justify-center space-x-2";\n  const variants = {\n    primary: "bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 active:scale-[0.99]",\n    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-100",\n    outline: "border border-slate-700 hover:bg-slate-800/50 text-slate-300"\n  };\n\n  return (\n    <button \n      disabled={loading || props.disabled}\n      className={\`\${baseStyle} \${variants[variant]} \${className}\`}\n      {...props}\n    >\n      {loading ? (\n        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />\n      ) : (\n        children\n      )}\n    </button>\n  );\n};`
            },
            {
              id: 'card-tsx',
              name: 'Card.tsx',
              path: 'student-portal/src/components/Card.tsx',
              type: 'file',
              language: 'typescript',
              content: `import React from 'react';\n\nexport const Card: React.FC<{ title: string; value: string | number; change?: string; icon?: React.ReactNode }> = ({\n  title,\n  value,\n  change,\n  icon\n}) => {\n  return (\n    <div className="p-5 rounded-2xl bg-[#0f1422] border border-slate-800/80 hover:border-indigo-500/40 transition-colors">\n      <div className="flex items-center justify-between mb-3">\n        <span className="text-sm text-slate-400">{title}</span>\n        {icon && <div className="text-indigo-400 p-2 bg-indigo-500/10 rounded-xl">{icon}</div>}\n      </div>\n      <div className="text-2xl font-bold text-white">{value}</div>\n      {change && <div className="text-xs text-emerald-400 mt-2 font-medium">{change} from last semester</div>}\n    </div>\n  );\n};`
            }
          ]
        },
        {
          id: 'pages-folder',
          name: 'pages',
          path: 'student-portal/src/pages',
          type: 'directory',
          isOpen: true,
          children: [
            {
              id: 'home-tsx',
              name: 'Home.tsx',
              path: 'student-portal/src/pages/Home.tsx',
              type: 'file',
              language: 'typescript',
              content: `import React from 'react';\nimport { Link } from 'react-router-dom';\n\nexport default function Home() {\n  return (\n    <div className="min-h-screen bg-[#080a10] flex flex-col items-center justify-center p-6 text-center">\n      <h1 className="text-4xl font-bold text-white mb-4">Welcome to Student Portal</h1>\n      <p className="text-slate-400 max-w-md mb-8">Access your academic transcripts, upcoming courses, attendance, and campus announcements.</p>\n      <Link to="/login" className="bg-indigo-600 text-white px-6 py-3 rounded-xl hover:bg-indigo-500 transition-colors">\n        Go to Sign In\n      </Link>\n    </div>\n  );\n}`
            },
            {
              id: 'login-tsx',
              name: 'Login.tsx',
              path: 'student-portal/src/pages/Login.tsx',
              type: 'file',
              language: 'typescript',
              content: `import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn, signInWithGoogle, signInWithGithub } from '../services/authService';
import { Button } from '../components/Button';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await signIn(email, password);
      navigate('/dashboard');
    } catch (error: any) {
      setErrorMsg(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    try {
      await signInWithGoogle();
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Google Auth failed');
    }
  };

  const handleGithubAuth = async () => {
    try {
      await signInWithGithub();
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'GitHub Auth failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex items-center justify-center p-4">
      <div className="w-full max-w-md p-8 rounded-3xl bg-[#0f1422]/90 border border-slate-800 shadow-2xl backdrop-blur-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 mb-4">
            <span className="text-2xl font-bold">∞</span>
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">SC INFINITY</h2>
          <h3 className="text-xl font-semibold text-slate-200 mt-1">Student Portal</h3>
          <p className="text-xs text-slate-400 mt-2">Welcome back! Sign in to continue your learning journey</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-500/50 text-rose-300 text-xs text-center">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@university.edu"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-3 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors text-sm"
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="rounded border-slate-700 bg-slate-800 text-indigo-500 focus:ring-0" />
              <span>Remember me</span>
            </label>
            <a href="#forgot" className="text-indigo-400 hover:underline">Forgot password?</a>
          </div>

          <Button type="submit" loading={loading} className="mt-2">
            Sign In
          </Button>

          <div className="relative my-6 text-center">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
            <span className="relative px-3 bg-[#0f1422] text-[11px] text-slate-500 uppercase tracking-wider">or continue with</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button 
              type="button" 
              onClick={handleGoogleAuth}
              className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors"
            >
              <span className="text-red-400 font-bold">G</span>
              <span>Sign in with Google</span>
            </button>
            <button 
              type="button" 
              onClick={handleGithubAuth}
              className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors"
            >
              <span className="text-slate-300 font-bold">⌘</span>
              <span>Sign in with GitHub</span>
            </button>
          </div>

          <p className="text-center text-xs text-slate-500 mt-6">
            Don't have an account? <a href="#signup" className="text-indigo-400 hover:underline font-medium">Sign up</a>
          </p>
        </form>
      </div>
    </div>
  );
}`
            },
            {
              id: 'dashboard-tsx',
              name: 'Dashboard.tsx',
              path: 'student-portal/src/pages/Dashboard.tsx',
              type: 'file',
              language: 'typescript',
              content: `import React from 'react';\nimport { Navbar } from '../components/Navbar';\nimport { Card } from '../components/Card';\nimport { BookOpen, Award, CheckCircle, Clock } from 'lucide-react';\n\nexport default function Dashboard() {\n  return (\n    <div className="min-h-screen bg-[#080a10] text-white">\n      <Navbar />\n      <main className="p-8 max-w-7xl mx-auto">\n        <div className="mb-8">\n          <h1 className="text-2xl font-bold">Student Academic Dashboard</h1>\n          <p className="text-slate-400 text-sm">Fall Semester 2026 • Computer Science & Engineering</p>\n        </div>\n\n        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">\n          <Card title="Cumulative GPA" value="3.88" change="+0.12" icon={<Award className="w-5 h-5" />} />\n          <Card title="Enrolled Courses" value="6" icon={<BookOpen className="w-5 h-5" />} />\n          <Card title="Attendance Rate" value="96.4%" change="+2.1%" icon={<CheckCircle className="w-5 h-5" />} />\n          <Card title="Next Assignment" value="2 Days" icon={<Clock className="w-5 h-5" />} />\n        </div>\n      </main>\n    </div>\n  );\n}`
            }
          ]
        },
        {
          id: 'services-folder',
          name: 'services',
          path: 'student-portal/src/services',
          type: 'directory',
          isOpen: true,
          children: [
            {
              id: 'auth-service-ts',
              name: 'authService.ts',
              path: 'student-portal/src/services/authService.ts',
              type: 'file',
              language: 'typescript',
              content: `export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: 'student' | 'instructor' | 'admin';
}

export async function signIn(email: string, password: string): Promise<UserProfile> {
  // Firebase Auth integration
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email && password) {
        resolve({
          id: 'usr_firebase_99812',
          email,
          name: email.split('@')[0],
          role: 'student'
        });
      } else {
        reject(new Error('Invalid email or password'));
      }
    }, 400);
  });
}

export async function signInWithGoogle(): Promise<UserProfile> {
  return {
    id: 'usr_google_123',
    email: 'alex.rivera@gmail.com',
    name: 'Alex Rivera',
    role: 'student'
  };
}

export async function signInWithGithub(): Promise<UserProfile> {
  return {
    id: 'usr_github_456',
    email: 'arivera@github.com',
    name: 'Alex Rivera',
    role: 'student'
  };
}`
            },
            {
              id: 'api-ts',
              name: 'api.ts',
              path: 'student-portal/src/services/api.ts',
              type: 'file',
              language: 'typescript',
              content: `export async function fetchCourses() {\n  return [\n    { id: 'cs101', code: 'CS 301', name: 'Distributed Systems', credits: 4, grade: 'A' },\n    { id: 'cs102', code: 'CS 340', name: 'Database Architecture', credits: 3, grade: 'A-' },\n    { id: 'cs103', code: 'CS 450', name: 'Deep Learning & AI', credits: 4, grade: 'A+' },\n    { id: 'cs104', code: 'MATH 220', name: 'Linear Algebra', credits: 3, grade: 'B+' }\n  ];\n}`
            }
          ]
        },
        {
          id: 'app-tsx',
          name: 'App.tsx',
          path: 'student-portal/src/App.tsx',
          type: 'file',
          language: 'typescript',
          content: `import React from 'react';\nimport Login from './pages/Login';\n\nexport function App() {\n  return (\n    <div className="w-full h-full">\n      <Login />\n    </div>\n  );\n}\n\nexport default App;`
        },
        {
          id: 'main-tsx',
          name: 'main.tsx',
          path: 'student-portal/src/main.tsx',
          type: 'file',
          language: 'typescript',
          content: `import React from 'react';\nimport ReactDOM from 'react-dom/client';\nimport App from './App';\n\nReactDOM.createRoot(document.getElementById('root')!).render(\n  <React.StrictMode>\n    <App />\n  </React.StrictMode>\n);`
        }
      ]
    },
    {
      id: 'env-file',
      name: '.env',
      path: 'student-portal/.env',
      type: 'file',
      language: 'markdown',
      content: `NEXT_PUBLIC_FIREBASE_API_KEY="AIzaSyAu8BM2KDpOa8dbqbpBjPN-wYotj3r6VjU"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="scmain-b2cde.firebaseapp.com"
NEXT_PUBLIC_FIREBASE_DATABASE_URL="https://scmain-b2cde-default-rtdb.asia-southeast1.firebasedatabase.app"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="scmain-b2cde"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="scmain-b2cde.firebasestorage.app"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="781407518974"
NEXT_PUBLIC_FIREBASE_APP_ID="1:781407518974:web:df55b0230432d2e18aa5af"
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID="G-RPRS1SFMRY"`
    },
    {
      id: 'gitignore-file',
      name: '.gitignore',
      path: 'student-portal/.gitignore',
      type: 'file',
      language: 'markdown',
      content: 'node_modules\ndist\n.env\n.DS_Store'
    },
    {
      id: 'package-json-student',
      name: 'package.json',
      path: 'student-portal/package.json',
      type: 'file',
      language: 'json',
      content: '{\n  "name": "student-portal",\n  "private": true,\n  "version": "1.0.0",\n  "type": "module",\n  "scripts": {\n    "dev": "vite",\n    "build": "tsc && vite build",\n    "preview": "vite preview"\n  },\n  "dependencies": {\n    "firebase": "^10.13.0",\n    "lucide-react": "^0.475.0",\n    "react": "^18.3.1",\n    "react-dom": "^18.3.1",\n    "react-router-dom": "^6.22.0"\n  }\n}'
    },
    {
      id: 'readme-md-student',
      name: 'README.md',
      path: 'student-portal/README.md',
      type: 'file',
      language: 'markdown',
      content: '# Student Portal\n\nBuilt with SC INFINITY IDE & Firebase.\n\n## Getting Started\n\n```bash\nnpm install\nnpm run dev\n```'
    },
    {
      id: 'tsconfig-json-student',
      name: 'tsconfig.json',
      path: 'student-portal/tsconfig.json',
      type: 'file',
      language: 'json',
      content: '{\n  "compilerOptions": {\n    "target": "ES2020",\n    "useDefineForClassFields": true,\n    "module": "ESNext",\n    "jsx": "react-jsx"\n  }\n}'
    }
  ]
};
