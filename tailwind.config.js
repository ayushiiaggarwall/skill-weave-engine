/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: 'rgb(228 228 231)',
        input: 'rgb(228 228 231)',
        ring: 'rgb(59 130 246)',
        background: 'rgb(255 255 255)',
        foreground: 'rgb(9 9 11)',
        primary: {
          DEFAULT: 'rgb(59 130 246)',
          foreground: 'rgb(248 250 252)',
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        secondary: {
          DEFAULT: 'rgb(244 244 245)',
          foreground: 'rgb(39 39 42)',
        },
        accent: {
          DEFAULT: 'rgb(217 70 239)',
          foreground: 'rgb(248 250 252)',
          50: '#fdf4ff',
          100: '#fae8ff',
          200: '#f5d0fe',
          300: '#f0abfc',
          400: '#e879f9',
          500: '#d946ef',
          600: '#c026d3',
          700: '#a21caf',
          800: '#86198f',
          900: '#701a75',
          950: '#4a044e',
        },
        muted: {
          DEFAULT: 'rgb(244 244 245)',
          foreground: 'rgb(113 113 122)',
        },
        destructive: {
          DEFAULT: 'rgb(239 68 68)',
          foreground: 'rgb(248 250 252)',
        },
        card: {
          DEFAULT: 'rgb(255 255 255)',
          foreground: 'rgb(9 9 11)',
        },
        popover: {
          DEFAULT: 'rgb(255 255 255)',
          foreground: 'rgb(9 9 11)',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        lg: '8px',
        md: '6px',
        sm: '4px',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgb(59 130 246 / 0.5)' },
          '50%': { boxShadow: '0 0 20px rgb(59 130 246 / 0.8)' },
        },
      },
    },
  },
  plugins: [],
}
