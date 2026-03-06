/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html","./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"DM Sans"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      colors: {
        surface: { 0:'#08080e', 1:'#0f0f17', 2:'#141420', 3:'#1a1a26', 4:'#20202e', 5:'#272736' },
        border: 'rgba(255,255,255,0.07)',
        'border-subtle': 'rgba(255,255,255,0.04)',
        'border-strong': 'rgba(255,255,255,0.12)',
        accent: { DEFAULT:'#6d6afe', light:'#8f8dff', dim:'rgba(109,106,254,0.12)', glow:'rgba(109,106,254,0.3)' },
        text: { primary:'#ededf2', secondary:'#9898a8', tertiary:'#6e6e80', muted:'#3e3e50' },
        success: { DEFAULT:'#22c55e', dim:'rgba(34,197,94,0.1)', border:'rgba(34,197,94,0.25)' },
        danger:  { DEFAULT:'#ef4444', dim:'rgba(239,68,68,0.1)',  border:'rgba(239,68,68,0.28)' },
        warning: { DEFAULT:'#f59e0b', dim:'rgba(245,158,11,0.1)', border:'rgba(245,158,11,0.28)' },
      },
      boxShadow: {
        'card':       '0 0 0 1px rgba(255,255,255,0.07), 0 2px 4px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.03)',
        'card-hover': '0 0 0 1px rgba(255,255,255,0.1), 0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
        'modal':      '0 0 0 1px rgba(255,255,255,0.09), 0 30px 80px rgba(0,0,0,0.8)',
      },
    },
  },
  plugins: [],
}
