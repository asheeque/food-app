import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    colors: {
      transparent: 'transparent',
      white: '#ffffff',
      black: '#000000',
      // Legacy primary kept for shared components
      primary: {
        50: '#f0fdf4',
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',
        700: '#10b981',
        800: '#166534',
        900: '#15803d',
      },
      // Legacy secondary
      secondary: {
        50: '#f8fafc',
        100: '#f1f5f9',
        200: '#e2e8f0',
        300: '#cbd5e1',
        400: '#94a3b8',
        500: '#64748b',
        600: '#475569',
        700: '#2b6954',
        800: '#1e293b',
        900: '#0f172a',
      },
      // Neutral
      neutral: {
        50: '#f9f9ff',
        100: '#f0f3ff',
        200: '#e7eefe',
        300: '#dce2f3',
        400: '#c7d1e8',
        500: '#a8b3d0',
        600: '#6c7a71',
        700: '#3c4a42',
        800: '#2a313d',
        900: '#151c27',
      },
      // Editorial palette
      parchment: '#F8F5EE',
      linen: '#EDE7D9',
      umber: {
        50: '#FBF7F3',
        100: '#F3E9DD',
        300: '#C9966B',
        500: '#7C4A25',
        700: '#5C3319',
        900: '#3A1F0E',
      },
      creek: {
        50: '#EEF3F7',
        100: '#D4E2ED',
        300: '#7BAAC4',
        500: '#1D3A50',
        700: '#142A3C',
        900: '#0A1820',
      },
      ink: '#1E1612',
      stone: {
        400: '#C4B5A0',
        500: '#A8947D',
        600: '#8A7665',
      },
      // Surfaces & Backgrounds
      surface: '#F8F5EE',
      'surface-dim': '#EDE7D9',
      'on-surface': '#1E1612',
      background: '#F8F5EE',

      // v2 brand
      gold: {
        DEFAULT: '#C9943E',
        hover:   '#B07D2E',
      },

      // Semantic
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ba1a1a',
      info: '#0c7ff2',
    },
    fontFamily: {
      sans: [
        '"Plus Jakarta Sans"',
        '-apple-system',
        'BlinkMacSystemFont',
        'sans-serif',
      ],
      display: [
        '"EB Garamond"',
        'Georgia',
        'serif',
      ],
      mono: ['"JetBrains Mono"', 'monospace'],
    },
    fontSize: {
      xs: ['12px', '16px'],
      sm: ['14px', '20px'],
      base: ['16px', '24px'],
      lg: ['18px', '28px'],
      xl: ['20px', '28px'],
      '2xl': ['24px', '32px'],
      '3xl': ['30px', '36px'],
      '4xl': ['36px', '44px'],
      'headline-xl': ['36px', { lineHeight: '44px', fontWeight: '700', letterSpacing: '-0.02em' }],
      'headline-lg': ['24px', { lineHeight: '32px', fontWeight: '600', letterSpacing: '-0.01em' }],
      'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
      'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
      'label-md': ['14px', { lineHeight: '20px', fontWeight: '600', letterSpacing: '0.01em' }],
      'label-sm': ['12px', { lineHeight: '16px', fontWeight: '500' }],
    },
    spacing: {
      0:    '0',
      1:    '0.25rem',
      1.5:  '0.375rem',
      2:    '0.5rem',
      2.5:  '0.625rem',
      3:    '0.75rem',
      3.5:  '0.875rem',
      4:    '1rem',
      5:    '1.25rem',
      6:    '1.5rem',
      7:    '1.75rem',
      8:    '2rem',
      9:    '2.25rem',
      10:   '2.5rem',
      11:   '2.75rem',
      12:   '3rem',
      14:   '3.5rem',
      16:   '4rem',
      18:   '4.5rem',
      20:   '5rem',
      24:   '6rem',
      28:   '7rem',
      32:   '8rem',
      xs:   '0.25rem',
      sm:   '0.5rem',
      md:   '1rem',
      lg:   '1.5rem',
      xl:   '2rem',
      xxl:  '3rem',
    },
    borderRadius: {
      none: '0',
      sm: '0.25rem',
      base: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
      full: '9999px',
    },
    boxShadow: {
      none: 'none',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05)',
    },
    transitionDuration: {
      DEFAULT: '150ms',
      fast: '150ms',
      base: '250ms',
      slow: '350ms',
    },
    screens: {
      sm: '390px',   // Mobile
      md: '768px',   // Tablet
      lg: '1280px',  // Desktop
      xl: '1920px',  // Wide desktop
    },
    maxWidth: {
      container: '1280px',
    },
  },
  plugins: [],
}
export default config
