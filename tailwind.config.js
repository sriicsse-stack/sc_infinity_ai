/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        infinity: {
          bg: {
            dark: '#080a10',
            darker: '#040609',
            card: '#0e1320',
            hover: '#171f33',
            border: '#1f293d',
            light: '#f8fafc',
            lightCard: '#ffffff',
            lightBorder: '#e2e8f0',
            lightHover: '#f1f5f9'
          },
          primary: {
            DEFAULT: '#6366f1',
            hover: '#4f46e5',
            light: '#818cf8',
            glow: 'rgba(99, 102, 241, 0.35)'
          },
          accent: {
            violet: '#8b5cf6',
            purple: '#a855f7',
            blue: '#3b82f6',
            cyan: '#06b6d4',
            emerald: '#10b981',
            amber: '#f59e0b',
            rose: '#f43f5e'
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Cascadia Code', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-primary': '0 0 20px -3px rgba(99, 102, 241, 0.4)',
        'glow-violet': '0 0 20px -3px rgba(139, 92, 246, 0.4)',
        'glow-emerald': '0 0 20px -3px rgba(16, 185, 129, 0.4)',
        'glass-dark': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-light': '0 8px 32px 0 rgba(148, 163, 184, 0.15)',
      },
      animation: {
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'spin-slow': 'spin 8s linear infinite',
      }
    },
  },
  plugins: [],
}
