import type { Config } from "tailwindcss";
import forms from "@tailwindcss/forms";
import typography from "@tailwindcss/typography";

const config: Config = {
  content: [
    './app/**/*.{ts,tsx,js,jsx}',
    './components/**/*.{ts,tsx,js,jsx}',
    './lib/**/*.{ts,tsx,js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F172A',
        secondary: '#334155',
        accent: '#6366F1',
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444',
        muted: '#64748B',
        border: '#E2E8F0',
        background: '#F8FAFC',
        foreground: '#0F172A',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        card: '0 4px 20px rgba(0,0,0,0.05)',
        modal: '0 10px 40px rgba(0,0,0,0.1)',
      },
    },
  },
  plugins: [forms, typography],
};

export default config;
