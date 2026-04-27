import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          200: 'var(--color-primary-200)',
          300: 'var(--color-primary-300)',
          400: 'var(--color-primary-400)',
          500: 'var(--color-primary-500)',
          600: 'var(--color-primary-600)',
          700: 'var(--color-primary-700)',
          800: 'var(--color-primary-800)',
          900: 'var(--color-primary-900)',
        },
        neutral: {
          50:  'var(--color-neutral-50)',
          100: 'var(--color-neutral-100)',
          200: 'var(--color-neutral-200)',
          300: 'var(--color-neutral-300)',
          400: 'var(--color-neutral-400)',
          500: 'var(--color-neutral-500)',
          600: 'var(--color-neutral-600)',
          700: 'var(--color-neutral-700)',
          800: 'var(--color-neutral-800)',
          900: 'var(--color-neutral-900)',
        },
        accent: {
          gold:  'var(--color-accent-gold)',
          blue:  'var(--color-accent-blue)',
          green: 'var(--color-accent-green)',
          amber: 'var(--color-accent-amber)',
        },
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        error:   'var(--color-error)',
        info:    'var(--color-info)',
      },
      fontFamily: {
        display:  ['var(--font-display)', 'Georgia', 'serif'],
        body:     ['var(--font-body)', 'system-ui', 'sans-serif'],
        ui:       ['var(--font-ui)', 'system-ui', 'sans-serif'],
        accent:   ['var(--font-accent)', 'system-ui', 'sans-serif'],
        mono:     ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      fontSize: {
        hero:    ['clamp(48px, 8vw, 96px)',   { lineHeight: '1.1' }],
        display: ['clamp(36px, 5vw, 72px)',   { lineHeight: '1.1' }],
        h1:      ['clamp(30px, 3.5vw, 48px)', { lineHeight: '1.2' }],
        h2:      ['clamp(24px, 2.5vw, 36px)', { lineHeight: '1.25' }],
        h3:      ['clamp(20px, 2vw, 28px)',   { lineHeight: '1.3' }],
        h4:      ['clamp(18px, 1.5vw, 24px)', { lineHeight: '1.4' }],
      },
      boxShadow: {
        sm:           'var(--shadow-sm)',
        md:           'var(--shadow-md)',
        lg:           'var(--shadow-lg)',
        xl:           'var(--shadow-xl)',
        '2xl':        'var(--shadow-2xl)',
        card:         'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        nav:          'var(--shadow-nav)',
      },
      borderRadius: {
        card: '12px',
      },
      transitionTimingFunction: {
        'out-expo':     'var(--ease-out-expo)',
        'out-quart':    'var(--ease-out-quart)',
        'in-out-quart': 'var(--ease-in-out-quart)',
        'out-back':     'var(--ease-out-back)',
        'out-quint':    'var(--ease-out-quint)',
      },
      maxWidth: {
        container: '1440px',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}

export default config
