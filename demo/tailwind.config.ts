import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f2f5f8',
          100: '#e1e8f0',
          200: '#c8d7e4',
          300: '#a3bed1',
          400: '#789ebb',
          500: '#5a82a2', // Sea glass / Muted turquoise hint
          600: '#466785',
          700: '#39536d',
          800: '#32465b',
          900: '#1b2a3a', // Deep navy / midnight blue
          950: '#111a25',
        },
        accent: {
          50: '#fcfaf6',
          100: '#f8f4eb',
          200: '#f0e5d1',
          300: '#e4d1ae',
          400: '#d5b785',
          500: '#c9a162', // Sand / Warm beige / Muted gold
          600: '#bd8b4a',
          700: '#9d6d39',
          800: '#805934',
          900: '#67482d',
          950: '#382515',
        },
        background: '#FAFBFD',
        surface: '#FFFFFF',
        foreground: '#1b2a3a',
      },
      fontFamily: {
        sans: ['var(--font-cairo)', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0,0,0,0.03)',
        'float': '0 10px 40px -5px rgba(0,0,0,0.06)',
        'premium': '0 20px 40px -10px rgba(0,0,0,0.08)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.05)',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.4) 100%)',
        'glass-gradient-dark': 'linear-gradient(135deg, rgba(0, 0, 0, 0.8) 0%, rgba(0, 0, 0, 0.4) 100%)',
      },
      keyframes: {
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.8s ease-in-out infinite',
        'fade-in': 'fade-in 0.4s ease forwards',
        'slide-up': 'slide-up 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      },
    },
  },
  plugins: [],
};
export default config;
