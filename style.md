SmartSlate Visual Style PRD (Replica of smartslate-app)

1. Scope & Goal
- This PRD defines an EXACT replica of the styling implemented in the folder `/home/jitin-m-nair/Desktop/smartslate-polaris-v3/smartslate-app`.
- It specifies fonts, color tokens, CSS variables, Tailwind theme extensions, animations, component classes, and interaction patterns to achieve identical aesthetics and visual appeal.
- Default theme: Dark (as implemented). This document ALSO defines the brand-compliant Light mode (retaining teal and indigo) with accessible accent colors.

2. Fonts (MUST match exactly)
- Families & weights:
  - Headings: Quicksand (700)
  - Body: Lato (400, 500, 700)
- Loading (HTML):
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;500;700&family=Quicksand:wght@700&display=swap" rel="stylesheet">
  ```
- Tailwind font families (must be used application-wide):
  ```js
  fontFamily: {
    sans: ['Lato', 'ui-sans-serif', 'system-ui', 'sans-serif'],
    heading: ['Quicksand', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  }
  ```

3. Color System (Tokens MUST match exactly)
- Tailwind color tokens (extend):
  ```js
  colors: {
    primary: {
      400: '#d0edf0',
      500: '#a7dadb',
      600: '#7bc5c7',
    },
    secondary: {
      400: '#7C69F5',
      500: '#4F46E5',
      600: '#3730A3',
    },
    brand: {
      accent: '#a7dadb',
    },
    // Brand-compliant additional accents for states/accessibility
    success: {
      500: '#22c55e', // dark default success
      600: '#16a34a',
    },
    warning: {
      500: '#f59e0b',
      600: '#d97706',
    },
    danger: {
      500: '#ef4444',
      600: '#dc2626',
    },
  }
  ```
- CSS custom properties (Dark/Default):
  ```css
  :root {
    /* Surfaces & text */
    --bg: 2 12 27;            /* #020C1B */
    --card: 13 27 42;         /* #0d1b2a */
    --text: 224 224 224;      /* #e0e0e0 */
    --text-muted: 176 197 198;      /* #b0c5c6 */
    --text-disabled: 122 138 139;   /* #7a8a8b */

    /* Brand tokens (retain across themes) */
    --primary: 167 218 219;        /* #a7dadb */
    --primary-light: 208 237 240;  /* #d0edf0 */
    --primary-dark: 123 197 199;   /* #7bc5c7 */

    --secondary: 79 70 229;        /* #4F46E5 */
    --secondary-light: 124 105 245;/* #7C69F5 */
    --secondary-dark: 55 48 163;   /* #3730A3 */

    /* State accents (dark-appropriate luminosity) */
    --success: 34 197 94;   /* #22c55e */
    --warning: 245 158 11;  /* #f59e0b */
    --danger: 239 68 68;    /* #ef4444 */

    /* Use brand teal as the browser/control accent */
    accent-color: rgb(var(--primary));
  }
  ```
- Brand selection highlight (Dark):
  ```css
  ::selection { background-color: rgb(var(--primary) / 0.8); color: rgb(var(--bg)); }
  ::-moz-selection { background-color: rgb(var(--primary) / 0.8); color: rgb(var(--bg)); }
  ```

3.1 Theme Activation (MUST)
- Use attribute or class-based theming; default is Dark via `:root`. Activate Light by setting on `html` or `body`:
  ```html
  <html data-theme="light"> ... </html>
  <!-- or -->
  <body data-theme="light"> ... </body>
  ```

3.2 Light Mode Tokens (MUST match exactly)
- CSS custom properties for Light mode (teal/indigo retained, accents adjusted for contrast):
  ```css
  [data-theme='light'] {
    /* Surfaces & text */
    --bg: 255 255 255;        /* #ffffff */
    --card: 248 250 252;      /* #f8fafc */
    --text: 30 41 59;         /* #1e293b */
    --text-muted: 71 85 105;  /* #475569 */
    --text-disabled: 148 163 184; /* #94a3b8 */

    /* Brand tokens (unchanged across themes) */
    --primary: 167 218 219;        /* #a7dadb */
    --primary-light: 208 237 240;  /* #d0edf0 */
    --primary-dark: 123 197 199;   /* #7bc5c7 */

    --secondary: 79 70 229;        /* #4F46E5 */
    --secondary-light: 124 105 245;/* #7C69F5 */
    --secondary-dark: 55 48 163;   /* #3730A3 */

    /* State accents (darker for WCAG contrast on light bg) */
    --success: 21 128 61;   /* #15803d (green-700) */
    --warning: 180 83 9;    /* #b45309 (amber-700) */
    --danger: 185 28 28;    /* #b91c1c (red-700) */

    accent-color: rgb(var(--primary));
  }

  /* Brand selection highlight (Light) */
  [data-theme='light'] ::selection { background-color: rgb(var(--primary) / 0.3); color: rgb(30 41 59); }
  [data-theme='light'] ::-moz-selection { background-color: rgb(var(--primary) / 0.3); color: rgb(30 41 59); }
  ```

4. Tailwind Configuration (MUST match exactly)
- tailwind.config.js (extend theme):
  ```js
  /** @type {import('tailwindcss').Config} */
  export default {
    content: [
      './index.html',
      './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
      extend: {
        colors: {
          primary: { 400: '#d0edf0', 500: '#a7dadb', 600: '#7bc5c7' },
          secondary: { 400: '#7C69F5', 500: '#4F46E5', 600: '#3730A3' },
          brand: { accent: '#a7dadb' },
          success: { 500: '#22c55e', 600: '#16a34a' },
          warning: { 500: '#f59e0b', 600: '#d97706' },
          danger: { 500: '#ef4444', 600: '#dc2626' },
        },
        fontFamily: {
          sans: ['Lato', 'ui-sans-serif', 'system-ui', 'sans-serif'],
          heading: ['Quicksand', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        },
        keyframes: {
          fadeIn: { '0%': { opacity: '0', transform: 'translateY(4px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
          fadeInUp: { '0%': { opacity: '0', transform: 'translateY(12px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
          scaleIn: { '0%': { opacity: '0', transform: 'scale(0.98)' }, '100%': { opacity: '1', transform: 'scale(1)' } },
          slideIn: { '0%': { opacity: '0', transform: 'translateX(-8px)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
          slideInRight: { '0%': { opacity: '0', transform: 'translateX(100%)' }, '100%': { opacity: '1', transform: 'translateX(0)' } },
          shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
          pulseSubtle: { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
        },
        animation: {
          'fade-in': 'fadeIn 200ms ease-out',
          'fade-in-up': 'fadeInUp 300ms ease-out',
          'scale-in': 'scaleIn 220ms cubic-bezier(0.22,1,0.36,1)',
          'slide-in': 'slideIn 240ms ease-out',
          'slide-in-right': 'slideInRight 280ms cubic-bezier(0.22,1,0.36,1)',
          shimmer: 'shimmer 1.8s linear infinite',
          'pulse-subtle': 'pulseSubtle 2s ease-in-out infinite',
        },
      },
    },
    plugins: [],
  };
  ```

5. PostCSS Configuration
- Must include Tailwind CSS and Autoprefixer:
  ```js
  import tailwindcss from 'tailwindcss'
  import autoprefixer from 'autoprefixer'

  export default {
    plugins: [tailwindcss, autoprefixer],
  };
  ```

6. Base & Global Styles (MUST match exactly)
- Apply base layers and use the CSS variables above:
  ```css
  @tailwind base;
  @tailwind components;
  @tailwind utilities;

  @layer base {
    html, body, #root { height: 100%; }

    body { @apply bg-[rgb(var(--bg))] text-[rgb(var(--text))] antialiased font-sans; }

    h1, h2, h3, h4, h5, h6 { @apply font-heading font-bold; }

    @media (prefers-reduced-motion: reduce) {
      *, *::before, *::after { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
    }
  }
  ```

7. Component Classes (MUST match exactly)
- Cards & glass:
  ```css
  @layer components {
    .card { @apply bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl; }

    .glass-card {
      position: relative;
      border-radius: 1rem; /* 16px */
      background:
        linear-gradient(rgba(13,27,42,0.55), rgba(13,27,42,0.55)) padding-box,
        linear-gradient(135deg, rgba(255,255,255,0.22), rgba(255,255,255,0.06)) border-box;
      border: 1px solid transparent;
      box-shadow: 0 8px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06);
      -webkit-backdrop-filter: blur(18px);
      backdrop-filter: blur(18px);
    }

    .input { @apply w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none ring-0 focus:ring-[1.2px] focus:ring-primary-400 focus:border-primary-400 transition; }

    .btn-primary { @apply inline-flex items-center justify-center rounded-xl bg-secondary-500 px-4 py-3 text-sm font-medium text-white hover:bg-secondary-600 active:bg-secondary-600 disabled:opacity-50 disabled:cursor-not-allowed transition; }

    .btn-ghost { @apply inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition; }

    .tab { @apply relative flex-1 text-center py-2 text-sm font-medium text-primary-500 transition; }
    .tab-active { @apply text-primary-500; }

    /* Micro-interactions */
    .pressable { transition: transform 220ms cubic-bezier(0.22,1,0.36,1), filter 220ms ease, background-color 180ms ease; will-change: transform; transform: translateZ(0); }
    .pressable:hover { transform: translateY(-2px); }
    .pressable:active { transform: translateY(0) scale(0.98); }

    .elevate { box-shadow: 0 6px 24px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.12); transition: box-shadow 220ms ease; }
    .elevate:hover { box-shadow: 0 10px 30px rgba(0,0,0,0.22), 0 6px 16px rgba(0,0,0,0.16); }

    /* Page and element enter animations */
    .page-enter { animation: fadeInUp 300ms ease-out; }
    .page-leave { animation: fadeOut 220ms ease-in forwards; }

    /* Skeleton shimmer */
    .skeleton { background: linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.12) 37%, rgba(255,255,255,0.04) 63%); background-size: 400% 100%; animation: shimmer 1.8s linear infinite; }

    /* Animation delay utilities */
    .animate-delay-75 { animation-delay: 75ms; }
    .animate-delay-150 { animation-delay: 150ms; }
    .animate-delay-300 { animation-delay: 300ms; }
    .animate-delay-500 { animation-delay: 500ms; }

    /* Subtle radial spotlight that follows cursor */
    .interactive-spotlight { position: absolute; inset: -1px; pointer-events: none; background: radial-gradient(240px 240px at var(--x, 50%) var(--y, 50%), rgba(255,255,255,0.08), rgba(255,255,255,0.02) 40%, transparent 70%); opacity: 0; transition: opacity 200ms ease; }
    .group:hover > .interactive-spotlight { opacity: 1; }

    .swirl-item { transition: transform 420ms cubic-bezier(0.22,1,0.36,1), filter 420ms ease; transform: var(--t); filter: saturate(1) drop-shadow(0 0 10px rgba(var(--primary), 0.12)) drop-shadow(0 0 26px rgba(var(--primary), 0.08)); will-change: transform; pointer-events: none; }

    .logo-glow { filter: drop-shadow(0 0 0 rgba(var(--primary), 0)); transition: filter 360ms ease; }
    .logo-glow:hover { filter: drop-shadow(0 0 14px rgba(var(--primary), 0.45)); }

    .swirl-pattern { position: absolute; inset: 0; background-image: url('/images/logos/logo-swirl.png'); background-repeat: repeat; background-size: 64px 64px; opacity: 0.07; pointer-events: none; }

    /* Enhanced Profile Card Animations */
    .profile-card-hover { transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1); }
    .profile-card-hover:hover { transform: translateY(-4px); box-shadow: 0 32px 64px rgba(0, 0, 0, 0.4); }

    /* Avatar glow */
    .avatar-glow { animation: avatarGlow 3s ease-in-out infinite alternate; }

    /* Status indicator pulse */
    .status-pulse { animation: statusPulse 2s ease-in-out infinite; }

    /* Floating action button */
    .float-button { animation: floatButton 3s ease-in-out infinite; }

    /* Staggered entrance animation */
    .stagger-in { opacity: 0; transform: translateY(20px); animation: staggerIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards; }
    .stagger-in:nth-child(1) { animation-delay: 0.1s; }
    .stagger-in:nth-child(2) { animation-delay: 0.2s; }
    .stagger-in:nth-child(3) { animation-delay: 0.3s; }
    .stagger-in:nth-child(4) { animation-delay: 0.4s; }
    .stagger-in:nth-child(5) { animation-delay: 0.5s; }
    .stagger-in:nth-child(6) { animation-delay: 0.6s; }

    /* Copy button success feedback */
    .copy-success { animation: copySuccess 0.6s ease-out; }

    /* Enhanced gradient text */
    .gradient-text-animated {
      background: linear-gradient(-45deg, #ffffff, #a7dadb, #7bc5c7, #4F46E5);
      background-size: 400% 400%;
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: gradientShift 4s ease-in-out infinite;
    }
  }
  ```

8. Keyframe Utilities (MUST match exactly)
- Utility keyframes used by classes above:
  ```css
  @layer utilities {
    @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }

    @keyframes fadeOut { from { opacity: 1; transform: translateY(0); } to { opacity: 0; transform: translateY(12px); } }

    @keyframes avatarGlow {
      0% { box-shadow: 0 0 20px rgba(167, 218, 219, 0.3); }
      100% { box-shadow: 0 0 40px rgba(167, 218, 219, 0.6), 0 0 80px rgba(79, 70, 229, 0.2); }
    }

    @keyframes statusPulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 8px rgba(34, 197, 94, 0.4); }
      50% { transform: scale(1.1); box-shadow: 0 0 16px rgba(34, 197, 94, 0.8); }
    }

    @keyframes floatButton { 0%, 100% { transform: translateY(0) translateX(-50%); } 50% { transform: translateY(-6px) translateX(-50%); } }

    @keyframes staggerIn { to { opacity: 1; transform: translateY(0); } }

    @keyframes copySuccess {
      0% { transform: scale(1); color: rgba(255, 255, 255, 0.5); }
      50% { transform: scale(1.2); color: rgba(34, 197, 94, 1); }
      100% { transform: scale(1); color: rgba(255, 255, 255, 0.5); }
    }

    @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }

    @keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
  }
  ```

9. Assets & Dependencies (MUST match exactly)
- The class `.swirl-pattern` references: `/images/logos/logo-swirl.png`.
  - Ensure this asset exists at the same public path in the target app for visual parity.
- Favicon and base meta are not styling-critical but may be included for completeness.

10. Accessibility & Interaction Principles
- Maintain sufficient contrast in both themes (aim for WCAG AA: 4.5:1 for normal text, 3:1 for large text/icons).
- Provide `focus-visible` styles via Tailwind utilities (e.g., `focus:ring`, `outline-none` with focus rings).
- Respect `prefers-reduced-motion` and disable non-essential animations accordingly (already included in base).

11. Implementation Requirements (Checklist)
- [ ] Load Google Fonts exactly as specified (Lato 400/500/700, Quicksand 700).
- [ ] Configure Tailwind with the exact `extend` colors, fonts, keyframes, and animations, including success/warning/danger.
- [ ] Define CSS variables for Dark `:root` and Light `[data-theme='light']` exactly as above.
- [ ] Apply base styles (`body`, heading fonts, selection colors, reduced motion block).
- [ ] Implement all component classes and utilities (cards, buttons, inputs, glass, spotlight, skeleton, delays, logo glow, swirl pattern, profile/avatars/status, gradient text, etc.).
- [ ] Ensure `/images/logos/logo-swirl.png` is available at the same public path.
- [ ] Verify that controls (inputs, buttons) use the brand teal/indigo accents per tokens.
- [ ] Confirm identical behavior for hover/active/disabled and animation timings.
- [ ] Validate contrast for text on both themes with chosen accent usage.

12. Acceptance Criteria
- A visual diff between the original `smartslate-app` UI and the target implementation shows no perceptible differences in fonts, colors, elevations, glass effects, animations, micro-interactions, or layout spacing.
- Tailwind theme, CSS custom properties, and component classes compile and behave identically.
- Both Dark and Light themes render with brand-consistent teal/indigo and accessible accents.
- All referenced assets resolve correctly and render with the same effects (e.g., swirl background).

13. Notes & References
- Source of truth for tokens and classes: `smartslate-app/tailwind.config.js` and `smartslate-app/src/index.css`.
- Additional guidance: `smartslate-app/docs/STYLING_GUIDE.md`.
- PostCSS pipeline: `smartslate-app/postcss.config.js`.
