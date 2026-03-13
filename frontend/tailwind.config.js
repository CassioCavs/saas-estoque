/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        surface: {
          0: 'var(--color-surface-0)',
          1: 'var(--color-surface-1)',
          2: 'var(--color-surface-2)',
          3: 'var(--color-surface-3)',
          4: 'var(--color-surface-4)',
          5: 'var(--color-surface-5)',
        },
        border: 'var(--color-border)',
        'border-subtle': 'var(--color-border-subtle)',
        'border-strong': 'var(--color-border-strong)',
        accent: { DEFAULT:'#6d6afe', light:'#8f8dff', dim:'rgba(109,106,254,0.12)', glow:'rgba(109,106,254,0.3)' },
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
          muted: 'var(--color-text-muted)',
        },
        success: { DEFAULT:'#22c55e', dim:'rgba(34,197,94,0.1)', border:'rgba(34,197,94,0.25)' },
        danger:  { DEFAULT:'#ef4444', dim:'rgba(239,68,68,0.1)',  border:'rgba(239,68,68,0.28)' },
        warning: { DEFAULT:'#f59e0b', dim:'rgba(245,158,11,0.1)', border:'rgba(245,158,11,0.28)' },
      },
      boxShadow: {
        'card':       'var(--shadow-card)',
        'card-hover': 'var(--shadow-card-hover)',
        'modal':      'var(--shadow-modal)',
      },
    },
  },
  plugins: [],
}
