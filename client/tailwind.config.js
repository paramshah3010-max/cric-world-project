/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],

  theme: {
    extend: {
      colors: {
        charcoal: {
          950: '#05070A',
          900: '#080B10',
          850: '#0B0F15',
          800: '#10151D',
          700: '#181F2A',
          600: '#242C39',
        },

        cyan: {
          brand: '#22E7FF',
          soft: '#7EF3FF',
        },

        gold: {
          brand: '#E9C46A',
          light: '#FFF0B7',
          deep: '#B8872F',
          muted: '#8D7135',
        },

        violet: {
          brand: '#8A6CFF',
        },

        danger: {
          brand: '#FF4D5A',
        },

        glass: {
          soft: 'rgba(255, 255, 255, 0.035)',
          medium: 'rgba(255, 255, 255, 0.055)',
          strong: 'rgba(255, 255, 255, 0.09)',
        },
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Sora', 'Inter', 'system-ui', 'sans-serif'],
      },

      letterSpacing: {
        luxe: '0.28em',
        premium: '0.18em',
      },

      backgroundImage: {
        'gold-sheen':
          'linear-gradient(135deg, #FFF1B8 0%, #E9C46A 42%, #B8872F 100%)',

        'cyan-gold':
          'linear-gradient(120deg, #22E7FF 0%, #9BE8E0 45%, #E9C46A 100%)',

        'luxury-gold':
          'linear-gradient(120deg, #FFFFFF 0%, #FFF0B7 38%, #E9C46A 68%, #B8872F 100%)',

        'hero-mesh':
          'radial-gradient(60% 55% at 78% -8%, rgba(34,231,255,0.16), transparent 60%), radial-gradient(48% 50% at 8% 4%, rgba(233,196,106,0.14), transparent 55%), radial-gradient(50% 60% at 50% 120%, rgba(34,231,255,0.08), transparent 60%)',

        'glass-panel':
          'linear-gradient(145deg, rgba(255,255,255,0.08), rgba(255,255,255,0.018))',

        'dark-surface':
          'linear-gradient(180deg, rgba(12,17,24,0.96), rgba(5,8,12,0.98))',

        'aurora-premium':
          'radial-gradient(circle at 15% 15%, rgba(233,196,106,0.15), transparent 28%), radial-gradient(circle at 85% 20%, rgba(34,231,255,0.12), transparent 28%), radial-gradient(circle at 50% 100%, rgba(138,108,255,0.08), transparent 35%)',
      },

      boxShadow: {
        glow: '0 0 32px -8px rgba(34, 231, 255, 0.5)',

        gold: '0 0 32px -8px rgba(233, 196, 106, 0.5)',

        luxe: '0 24px 60px -24px rgba(0, 0, 0, 0.85)',

        'glass-soft':
          '0 18px 50px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)',

        'glass-deep':
          '0 28px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08)',

        'gold-premium':
          '0 18px 48px rgba(233,196,106,0.22), 0 0 35px rgba(233,196,106,0.10)',

        'cyan-premium':
          '0 18px 48px rgba(34,231,255,0.18), 0 0 35px rgba(34,231,255,0.10)',
      },

      backdropBlur: {
        xs: '2px',
        premium: '24px',
        luxury: '32px',
      },

      borderRadius: {
        luxury: '24px',
        premium: '20px',
      },

      keyframes: {
        'fade-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(16px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },

        'fade-in': {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },

        'float-soft': {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-10px)',
          },
        },

        'float-slow': {
          '0%, 100%': {
            transform: 'translate3d(0, 0, 0)',
          },
          '50%': {
            transform: 'translate3d(0, -14px, 0)',
          },
        },

        'aurora-shift': {
          '0%': {
            transform: 'translate3d(-2%, -1%, 0) scale(1)',
          },
          '100%': {
            transform: 'translate3d(2%, 1%, 0) scale(1.08)',
          },
        },

        pulseDot: {
          '0%, 100%': {
            opacity: '1',
            transform: 'scale(1)',
          },
          '50%': {
            opacity: '0.4',
            transform: 'scale(0.85)',
          },
        },

        'live-glow': {
          '0%, 100%': {
            boxShadow:
              '0 0 0 1px rgba(255,77,90,0.18), 0 0 14px rgba(255,77,90,0.12)',
          },
          '50%': {
            boxShadow:
              '0 0 0 1px rgba(255,77,90,0.32), 0 0 28px rgba(255,77,90,0.28)',
          },
        },

        shimmer: {
          '100%': {
            transform: 'translateX(100%)',
          },
        },

        'sheen-slide': {
          '0%': {
            transform: 'translateX(-120%)',
          },
          '60%, 100%': {
            transform: 'translateX(220%)',
          },
        },

        'light-sweep': {
          '0%, 100%': {
            opacity: '0.35',
            transform: 'translateX(-20%) rotate(-7deg)',
          },
          '50%': {
            opacity: '1',
            transform: 'translateX(45%) rotate(-7deg)',
          },
        },
      },

      animation: {
        'fade-up':
          'fade-up 0.55s cubic-bezier(0.22, 1, 0.36, 1) both',

        'fade-in':
          'fade-in 0.45s ease-out both',

        'float-soft':
          'float-soft 5s ease-in-out infinite',

        'float-slow':
          'float-slow 8s ease-in-out infinite',

        'aurora-shift':
          'aurora-shift 14s ease-in-out infinite alternate',

        'pulse-dot':
          'pulseDot 1.2s ease-in-out infinite',

        'live-glow':
          'live-glow 1.8s ease-in-out infinite',

        'light-sweep':
          'light-sweep 5.8s ease-in-out infinite',
      },
    },
  },

  plugins: [],
};