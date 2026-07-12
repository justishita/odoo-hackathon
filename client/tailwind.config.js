/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50:'#f8fafc', 100:'#f1f5f9', 200:'#e2e8f0', 300:'#cbd5e1',
          400:'#94a3b8', 500:'#64748b', 600:'#475569', 700:'#334155',
          800:'#1e293b', 900:'#0f172a', 950:'#020617',
        },
        // Primary accent: amber → orange
        accent: {
          50:'#fffbeb', 100:'#fef3c7', 200:'#fde68a', 300:'#fcd34d',
          400:'#fbbf24', 500:'#f59e0b', 600:'#d97706', 700:'#b45309',
          800:'#92400e', 900:'#78350f', 950:'#451a03',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['0.65rem', { lineHeight: '1rem' }],
        '3xs': ['0.6rem', { lineHeight: '0.85rem' }],
      },
      animation: {
        'fade-in':        'fadeIn 0.3s ease-out both',
        'fade-in-up':     'fadeInUp 0.45s cubic-bezier(0.34,1.2,0.64,1) both',
        'slide-in-left':  'slideInLeft 0.3s ease-out both',
        'scale-in':       'scaleIn 0.2s ease-out both',
        'pulse-slow':     'pulse 4s ease-in-out infinite',
        'float':          'float 6s ease-in-out infinite',
        'spin-slow':      'spin 20s linear infinite',
        'bounce-subtle':  'bounceSubtle 2.5s ease-in-out infinite',
        'beam-sweep':     'beamSweep 8s ease-in-out infinite',
        'gradient-shift': 'gradientShift 8s ease infinite',
      },
      keyframes: {
        fadeIn:       { from:{opacity:'0'}, to:{opacity:'1'} },
        fadeInUp:     { from:{opacity:'0',transform:'translateY(16px)'}, to:{opacity:'1',transform:'translateY(0)'} },
        slideInLeft:  { from:{opacity:'0',transform:'translateX(-20px)'}, to:{opacity:'1',transform:'translateX(0)'} },
        scaleIn:      { from:{opacity:'0',transform:'scale(0.94)'}, to:{opacity:'1',transform:'scale(1)'} },
        float:        { '0%,100%':{transform:'translateY(0)'}, '50%':{transform:'translateY(-10px)'} },
        bounceSubtle: { '0%,100%':{transform:'translateY(0)'}, '50%':{transform:'translateY(-5px)'} },
        gradientShift:{ '0%,100%':{backgroundPosition:'0% 50%'}, '50%':{backgroundPosition:'100% 50%'} },
        beamSweep:    {
          '0%':  {transform:'translateX(-100%) skewX(-15deg)', opacity:'0'},
          '20%': {opacity:'1'},
          '80%': {opacity:'1'},
          '100%':{transform:'translateX(200%) skewX(-15deg)', opacity:'0'},
        },
      },
      boxShadow: {
        // amber/orange glow shadows
        'glow':        '0 0 20px -5px rgba(245,158,11,0.45)',
        'glow-lg':     '0 0 40px -10px rgba(245,158,11,0.55)',
        'glow-sm':     '0 0 10px -3px rgba(245,158,11,0.35)',
        'inner-light': 'inset 0 1px 0 rgba(255,255,255,0.18)',
        'card':        '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.06)',
        'card-hover':  '0 12px 28px -5px rgba(0,0,0,0.1), 0 4px 10px -5px rgba(0,0,0,0.05)',
        'sidebar':     '4px 0 24px -4px rgba(0,0,0,0.08)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':  'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        'bounce': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
    },
  },
  plugins: [],
}
