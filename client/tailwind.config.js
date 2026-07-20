/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // CRIC WORLD original palette — dark, premium, data-driven.
        charcoal: {
          950: '#07080B',
          900: '#0C0E13',
          800: '#12151C',
          700: '#1B1F29',
          600: '#272C39',
        },
        cyan: {
          brand: '#22E7FF',
        },
        gold: {
          brand: '#E9C46A',
          deep: '#C9A24B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        luxe: '0.28em',
      },
      backgroundImage: {
        'gold-sheen': 'linear-gradient(135deg, #F6E4A8 0%, #E9C46A 40%, #C9A24B 100%)',
        'cyan-gold': 'linear-gradient(120deg, #22E7FF 0%, #9BE8E0 45%, #E9C46A 100%)',
        'hero-mesh':
          'radial-gradient(60% 55% at 78% -8%, rgba(34,231,255,0.16), transparent 60%), radial-gradient(48% 50% at 8% 4%, rgba(233,196,106,0.14), transparent 55%), radial-gradient(50% 60% at 50% 120%, rgba(34,231,255,0.08), transparent 60%)',
      },
      boxShadow: {
        glow: '0 0 32px -8px rgba(34, 231, 255, 0.5)',
        gold: '0 0 32px -8px rgba(233, 196, 106, 0.5)',
        luxe: '0 24px 60px -24px rgba(0, 0, 0, 0.85)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseDot: {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.4', transform: 'scale(0.85)' },
        },
        shimmer: { '100%': { transform: 'translateX(100%)' } },
        'sheen-slide': {
          '0%': { transform: 'translateX(-120%)' },
          '60%, 100%': { transform: 'translateX(220%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.5s cubic-bezier(0.22, 1, 0.36, 1) both',
        'pulse-dot': 'pulseDot 1.2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
