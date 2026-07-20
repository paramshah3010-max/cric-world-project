/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // CRIC WORLD original palette — dark, premium, data-driven.
        charcoal: {
          950: '#0A0C10',
          900: '#0F1218',
          800: '#161A22',
          700: '#1E232D',
          600: '#2A303C',
        },
        cyan: {
          brand: '#00E5FF',
        },
        gold: {
          brand: '#FFC94A',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 24px -6px rgba(0, 229, 255, 0.45)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.4s ease-out both',
        'pulse-dot': 'pulseDot 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
