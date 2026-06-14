/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        primary: {
          50: '#E6F0FA',
          100: '#C2DCF2',
          200: '#8AB9E5',
          300: '#5396D8',
          400: '#2F7BCB',
          500: '#0A4D8C',
          600: '#083F73',
          700: '#063159',
          800: '#04233F',
          900: '#021525',
        },
        accent: {
          50: '#FFF1EA',
          100: '#FFDDC9',
          200: '#FFBA94',
          300: '#FF985E',
          400: '#FF7C38',
          500: '#FF6B2C',
          600: '#E55520',
          700: '#B24019',
          800: '#7F2C12',
          900: '#4C180B',
        },
        success: { 500: '#22C55E', 600: '#16A34A' },
        warning: { 500: '#F59E0B', 600: '#D97706' },
        danger: { 500: '#EF4444', 600: '#DC2626' },
      },
      fontFamily: {
        display: ['Oswald', 'system-ui', 'sans-serif'],
        sans: ['"Noto Sans SC"', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      animation: {
        'pulse-ring': 'pulse-ring 1.8s cubic-bezier(0.215, 0.61, 0.355, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
        'scan': 'scan 2s linear infinite',
        'count-up': 'count-up 1s ease-out',
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        'pulse-ring': {
          '0%': { transform: 'scale(0.8)', opacity: '0.8' },
          '100%': { transform: 'scale(1.6)', opacity: '0' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'scan': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100%)' },
        },
        'count-up': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'marquee': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(-100%)' },
        },
      },
      boxShadow: {
        'card': '0 10px 40px -10px rgba(10, 77, 140, 0.15)',
        'card-hover': '0 20px 60px -15px rgba(10, 77, 140, 0.25)',
        'glow': '0 0 40px rgba(255, 107, 44, 0.4)',
      },
    },
  },
  plugins: [],
};
