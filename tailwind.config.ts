import type { Config } from "tailwindcss";
import { fontFamily } from 'tailwindcss/defaultTheme'

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-paragraph)', ...fontFamily.sans],
        heading: ['var(--font-heading)', ...fontFamily.sans],
      },
      animation: {
        'slide-in': 'slideIn 1s ease-out forwards',
        fadeIn: 'fadeIn 0.5s ease-out',
        loadingScreen: 'loadingScreen 2.5s ease-in-out forwards',
        'scale-up': 'scaleUp 0.15s ease-out forwards',
        'scale-down': 'scaleDown 0.15s ease-out forwards',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' }
        },
        loadingScreen: {
          '0%, 80%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        scaleUp: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(1.05)' },
        },
        scaleDown: {
          '0%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      colors: {
        brand: {
          dark: 'var(--brand-dark)',
          light: 'var(--brand-light)',
          highlight: 'var(--brand-highlight)',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwind-scrollbar'),
  ],
}

export default config;
