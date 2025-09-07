/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./public/**/*.html"
  ],
  theme: {
    extend: {
      colors: {
        'neon-cyan': '#00ffff',
        'neon-blue': '#0080ff',
        'neon-green': '#00ff00',
        'dark-bg': '#000000',
        'panel-bg': 'rgba(0, 20, 40, 0.3)',
      },
      fontFamily: {
        'orbitron': ['Orbitron', 'monospace'],
        'mono': ['Courier New', 'monospace'],
      },
      boxShadow: {
        'neon': '0 0 20px currentColor',
        'neon-strong': '0 0 40px currentColor, inset 0 0 20px rgba(0, 255, 255, 0.1)',
        'neon-cyan': '0 0 20px #00ffff',
        'neon-blue': '0 0 20px #0080ff',
        'neon-green': '0 0 20px #00ff00',
      },
      animation: {
        'pulse-neon': 'pulse-neon 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'matrix': 'matrix 20s linear infinite',
        'scan': 'scan 8s linear infinite',
      },
      keyframes: {
        'pulse-neon': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px currentColor' },
          '100%': { boxShadow: '0 0 40px currentColor, 0 0 60px currentColor' },
        },
        matrix: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        scan: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100vw)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
  safelist: [
    'text-neon-cyan',
    'text-neon-blue', 
    'text-neon-green',
    'bg-neon-cyan',
    'bg-neon-blue',
    'bg-neon-green',
    'border-neon-cyan',
    'border-neon-blue',
    'border-neon-green',
    'shadow-neon',
    'shadow-neon-strong',
    'animate-pulse',
    'animate-glow',
    'from-neon-cyan',
    'to-neon-cyan',
    'from-neon-blue',
    'to-neon-blue',
    'from-neon-green',
    'to-neon-green',
  ]
}