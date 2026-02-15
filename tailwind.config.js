/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Midnight Blue Spectrum - Primary backgrounds
        midnight: {
          900: '#0A0E27',  // Deepest - main background
          800: '#0F1635',  // Dark - cards
          700: '#161F4A',  // Medium - elevated surfaces
          600: '#1E2A5E',  // Base midnight blue
          500: '#2A3876',  // Lighter - hover states
          400: '#3D4F9F',  // Accent borders
          300: '#5165B8',  // Muted highlights
        },
        // Electric Lime Spectrum - CTAs and highlights
        lime: {
          700: '#8FCC00',  // Muted - disabled states
          600: '#A8E600',  // Darker - pressed state
          500: '#BFFF00',  // Pure electric lime - primary CTAs
          400: '#D4FF33',  // Lighter - hover glow
          300: '#E0FF66',  // Very light - subtle highlights
        },
        // Supporting colors
        neon: {
          cyan: '#00F5FF',    // Info / links
          magenta: '#FF10F0', // Special highlights
        },
        gold: '#FFB800',      // Premium features
        coral: '#FF4757',     // Errors / losses
        profit: '#00FF88',    // Wins / profits
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(191, 255, 0, 0.3)',
        'glow-lg': '0 0 40px rgba(191, 255, 0, 0.4)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.3)',
        'elevated': '0 8px 32px rgba(0, 0, 0, 0.4)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'mesh': 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%232A3876\' fill-opacity=\'0.15\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'float': 'float 6s ease-in-out infinite',
        'marquee': 'marquee 30s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(191, 255, 0, 0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(191, 255, 0, 0.5)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
};
