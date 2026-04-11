import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        toleran: {
          sage: {
            50: '#f0f7f5',
            100: '#d5ece7',
            200: '#aad8cf',
            300: '#77bdb2',
            400: '#4da49a',
            500: '#5B8A7A',
            600: '#3d7267',
            700: '#2f5a52',
            800: '#264844',
            900: '#1e3836',
          },
          coral: {
            50: '#fdf3f0',
            100: '#fae0d8',
            200: '#f5c0b0',
            300: '#ee9880',
            400: '#E8856A',
            500: '#e06a4c',
            600: '#c95233',
            700: '#a8402a',
            800: '#893527',
            900: '#712e22',
          },
          bg: '#F8F6F2',
          surface: '#FFFFFF',
          text: '#1A2235',
          muted: '#6B7280',
        },
        safe: {
          bg: '#D1FAE5',
          text: '#065F46',
          border: '#10B981',
        },
        caution: {
          bg: '#FEF3C7',
          text: '#92400E',
          border: '#F59E0B',
        },
        danger: {
          bg: '#FEE2E2',
          text: '#991B1B',
          border: '#EF4444',
        },
        unknown: {
          bg: '#F3F4F6',
          text: '#4B5563',
          border: '#9CA3AF',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      boxShadow: {
        card: '0 2px 12px rgba(0,0,0,0.06)',
        'card-hover': '0 4px 20px rgba(0,0,0,0.10)',
        float: '0 8px 32px rgba(91,138,122,0.15)',
      },
    },
  },
  plugins: [],
}

export default config
