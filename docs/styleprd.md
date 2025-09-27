# SmartSlate Polaris v3 Style System PRD

## Goals and Non-Goals

### Goals (MVP - Phase 1)
- Establish consistent Tailwind v4 utility-first patterns
- Remove all gradient treatments (strict constraint)
- Codify reusable component recipes with semantic tokens
- Standardize focus/hover/disabled states for accessibility
- Align dark mode implementation with `dark:` variants

### Non-Goals (Future Phases)
- Complete Material-UI integration
- Complex animation systems beyond basic transitions
- Component library packaging
- Design system documentation site
- Automated visual regression testing

### Constraints
- **NO GRADIENTS**: All gradient treatments must be removed
- Non-functional changes only: preserve component behavior
- Incremental migration approach
- Maintain existing DOM structure and test compatibility

## Current State Audit

### Critical Issues Found

#### Gradient Violations (Must Remove)
- `frontend/components/SwirlBackground.tsx`: radial-gradient inline styles
- `frontend/components/HeaderSwirlBackground.tsx`: radial-gradient inline styles  
- `frontend/app/page.tsx`: bg-gradient-to-br classes
- `frontend/components/wizard/static-questions/StepWizard.tsx`: bg-gradient-to-r on buttons

#### Inconsistent Button Patterns
- `frontend/components/ui/button.tsx`: CVA-based with variants
- `frontend/app/globals.css`: .primary-button custom class
- Inline button styles throughout dynamic-form and wizard components
- Mixed focus ring implementations (ring-2 vs outline)

#### Color System Fragmentation
- CSS variables defined but underutilized
- Direct Tailwind colors (bg-blue-600, text-gray-700) instead of semantic tokens
- Dark mode: mix of dark: variants and CSS variable swapping
- Hardcoded opacity values instead of consistent alpha tokens

#### Arbitrary Values Proliferation
- `frontend/components/dashboard/`: Multiple inline style={{ backgroundColor }}
- Custom spacing values outside Tailwind scale
- Inconsistent border-radius values (rounded-lg vs rounded-2xl)

#### Accessibility Gaps
- Missing focus-visible states on several interactive elements
- Inconsistent disabled states (opacity-50 vs custom styles)
- No consistent focus ring offset for dark backgrounds
- Missing ARIA labels on purely visual elements

## Design Principles

### Core Principles
- **Clarity**: Clean glassmorphism without gradients
- **Consistency**: Single source of truth for each pattern  
- **Accessibility**: WCAG 2.1 AA minimum contrast, clear focus states
- **Composability**: Utility-first with semantic abstractions
- **Theming**: CSS variables + Tailwind for flexible branding
- **Performance**: Minimal CSS, efficient class composition

### Implementation Strategy
- Tailwind utilities for 90% of styling needs
- Semantic token classes for complex, reusable patterns
- Component variants via CVA for stateful UI elements
- Custom CSS only for animations beyond Tailwind's capabilities

## Design Tokens and Scales

### Color Tokens

| Token | CSS Variable | Tailwind Class | Usage |
|-------|-------------|----------------|--------|
| Brand Primary | --primary-accent | bg-primary/text-primary | Primary actions, links |
| Brand Light | --primary-accent-light | bg-primary-light | Hover states |
| Brand Dark | --primary-accent-dark | bg-primary-dark | Pressed states |
| Action | --secondary-accent | bg-secondary | CTAs, submit buttons |
| Surface | --background-surface | bg-surface | Cards, modals |
| Paper | --background-paper | bg-paper | Elevated surfaces |

### Spacing Scale
| Token | Tailwind | Pixels |
|-------|----------|--------|
| xs | p-1 | 4px |
| sm | p-2 | 8px |
| md | p-4 | 16px |
| lg | p-6 | 24px |
| xl | p-8 | 32px |
| 2xl | p-12 | 48px |

### Glass Effect Tokens
```css
/* Define in globals.css */
.glass { @apply bg-white/5 backdrop-blur-xl border border-white/10; }
.glass-strong { @apply bg-white/10 backdrop-blur-2xl border border-white/20; }
.glass-hover { @apply hover:bg-white/10 hover:border-white/15; }
```

## Component Guidelines

### Buttons
```tsx
// Primary Button
className="glass px-6 py-2.5 rounded-lg text-white bg-secondary hover:bg-secondary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none transition-all duration-200"

// Secondary Button  
className="glass px-6 py-2.5 rounded-lg text-foreground hover:glass-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 disabled:opacity-50 transition-all duration-200"

// Ghost Button
className="px-6 py-2.5 rounded-lg text-foreground hover:glass focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 disabled:opacity-50 transition-all duration-200"
```

### Form Inputs
```tsx
// Text Input
className="glass w-full px-3 py-2 rounded-md text-foreground placeholder:text-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50"

// Select
className="glass w-full px-3 py-2 rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 disabled:opacity-50 appearance-none cursor-pointer"

// Checkbox/Radio
className="glass h-4 w-4 rounded text-primary focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background"
```

### Cards
```tsx
// Standard Card
className="glass rounded-2xl p-6 transition-all duration-300 hover:glass-strong hover:shadow-xl"

// Interactive Card
className="glass rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:glass-strong hover:-translate-y-1 hover:shadow-xl"
```

### Modals/Dialogs
```tsx
// Modal Container
className="glass-strong rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-auto"

// Overlay
className="fixed inset-0 bg-black/60 backdrop-blur-sm"
```

## Layout & Responsive System

### Container System
```tsx
// Full-width container with responsive padding
className="w-full px-4 sm:px-6 lg:px-8"

// Max-width centered container
className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"

// Content container
className="max-w-3xl mx-auto"
```

### Grid Patterns
```tsx
// Responsive grid
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6"

// Form layout
className="space-y-6"

// Two-column form
className="grid grid-cols-1 md:grid-cols-2 gap-4"
```

### Vertical Rhythm
- Section spacing: `py-12 md:py-16 lg:py-20`
- Component spacing: `space-y-4` or `space-y-6`
- Text spacing: `space-y-2` for related content

## Theming & Dark Mode

### Implementation Strategy
- Use CSS variables for all color values
- Apply `dark:` variants for overrides
- Test with system preference and manual toggle

### Dark Mode Patterns
```tsx
// Text colors
className="text-gray-900 dark:text-gray-100"

// Backgrounds  
className="bg-white dark:bg-slate-900"

// Borders
className="border-gray-200 dark:border-gray-700"

// Focus states
className="focus:ring-primary dark:focus:ring-primary-light"
```

## Class Naming & Organization Conventions

### Class Order (Enforce via Prettier/ESLint)
1. Layout (display, position, grid/flex)
2. Spacing (padding, margin, gap)
3. Sizing (width, height)  
4. Typography (font, text)
5. Colors (background, text, border)
6. Effects (shadow, blur, opacity)
7. States (hover, focus, disabled)
8. Transitions

### Arbitrary Values Rules
- Extract to CSS variable if used 3+ times
- Document in component if one-off requirement
- Propose token addition for common patterns

## Patterns and Anti-Patterns

### DO
- ✅ Use semantic color tokens
- ✅ Apply glass effects consistently
- ✅ Include focus-visible states
- ✅ Test dark mode for all components
- ✅ Use Tailwind's transition utilities

### DON'T
- ❌ Use gradients anywhere
- ❌ Mix inline styles with Tailwind
- ❌ Hardcode color values
- ❌ Skip disabled states
- ❌ Nest more than 2 glass effects

## Migration Plan

### Phase 1: Core Tokens & Primitives (Week 1)
- [ ] Remove all gradient implementations
- [ ] Standardize button component with CVA
- [ ] Update form inputs to consistent pattern
- [ ] Define glass effect utilities
- [ ] Establish color token system

### Phase 2: Component Alignment (Week 2)  
- [ ] Migrate dashboard components
- [ ] Update dynamic form components
- [ ] Standardize card patterns
- [ ] Fix modal/dialog styling
- [ ] Normalize wizard components

### Phase 3: Polish & Documentation (Week 3)
- [ ] Dark mode consistency pass
- [ ] Accessibility audit & fixes
- [ ] Remove unused CSS
- [ ] Document component recipes
- [ ] Create Storybook/examples

### Priority Task List
1. **CRITICAL**: Remove gradients from SwirlBackground, HeaderSwirlBackground, page.tsx, StepWizard
2. Consolidate button implementations into ui/button.tsx
3. Replace inline style={{ backgroundColor }} with Tailwind classes  
4. Standardize focus states to focus-visible with consistent rings
5. Extract repeated arbitrary values to design tokens
6. Audit and fix dark mode color inconsistencies
7. Add missing ARIA labels and accessibility attributes

## Risks and Mitigations

### Risk: Visual Regression
**Mitigation**: Implement visual snapshot testing, staged rollout by component

### Risk: Dark Mode Breakage
**Mitigation**: Automated dark mode testing in CI, manual QA checklist

### Risk: Performance Impact  
**Mitigation**: Monitor bundle size, use PurgeCSS, avoid deep nesting

### Risk: Developer Adoption
**Mitigation**: Clear examples, linting rules, component library documentation

## Appendix

### Files Requiring Immediate Attention
- `frontend/components/SwirlBackground.tsx` - Remove gradients
- `frontend/components/HeaderSwirlBackground.tsx` - Remove gradients
- `frontend/app/page.tsx:96` - Replace bg-gradient classes
- `frontend/components/wizard/static-questions/StepWizard.tsx:207,214` - Remove button gradients
- `frontend/app/globals.css` - Consolidate utilities
- `frontend/components/ui/button.tsx` - Expand as single source

### Example Refactoring

#### Before (with gradient)
```tsx
// frontend/app/page.tsx:96
<main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
```

#### After (no gradient, glass effect)  
```tsx
<main className="min-h-screen bg-background dark:bg-background-dark">
  <div className="absolute inset-0 glass-subtle" aria-hidden />
```

#### Before (inconsistent button)
```tsx
// Multiple implementations across codebase
<button className="px-6 py-2.5 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700">
```

#### After (unified button)
```tsx
import { Button } from '@/components/ui/button';
<Button variant="primary" size="md">Continue</Button>
```
