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
        dark: {
          bg: '#080b12',
          surface: '#0d111b',
          card: '#111726',
          line: '#222936',
          muted: '#99a4b7',
        },
        accent: {
          DEFAULT: '#8b9eff',
          hover: '#a2b1ff',
          light: '#e0e5ff',
          glow: 'rgba(139, 158, 255, 0.35)',
        },
        cyan: {
          DEFAULT: '#84d9eb',
          glow: 'rgba(132, 217, 235, 0.35)',
        },
        leetcode: {
          DEFAULT: '#FFA116',
          dark: '#E58A00',
          light: '#FFF4E5',
          bg: '#1A1813'
        },
        codeforces: {
          DEFAULT: '#3B82F6',
          dark: '#1D4ED8',
          light: '#EFF6FF',
          bg: '#0F172A'
        },
        codechef: {
          DEFAULT: '#10B981',
          dark: '#047857',
          light: '#ECFDF5',
          bg: '#062016'
        },
        brand: {
          50: '#F0F9FF',
          100: '#E0F2FE',
          500: '#0284C7',
          600: '#0369A1',
          700: '#075985',
          900: '#0C4A6E',
        }
      },
      fontFamily: {
        sans: ['"DM Sans"', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Space Grotesk"', 'Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        'glow-leetcode': '0 0 35px -5px rgba(255, 161, 22, 0.35)',
        'glow-codeforces': '0 0 35px -5px rgba(59, 130, 246, 0.35)',
        'glow-codechef': '0 0 35px -5px rgba(16, 185, 129, 0.35)',
        'glow-accent': '0 0 35px -5px rgba(139, 158, 255, 0.35)',
        'glow-cyan': '0 0 35px -5px rgba(132, 217, 235, 0.35)',
        'surface-card': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      }
    },
  },
  plugins: [],
}
