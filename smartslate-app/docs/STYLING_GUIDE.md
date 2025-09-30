# SmartSlate Styling Guide

## 🎨 Design System Overview

This guide documents the SmartSlate design system and provides guidelines for maintaining visual consistency across the application using Tailwind CSS and Material-UI.

## 📐 Design Principles

1. **Glassmorphism**: Use subtle transparency and backdrop blur for depth
2. **Consistent Spacing**: Follow Tailwind's spacing scale for all components
3. **Smooth Animations**: Use Framer Motion and CSS transitions for natural motion
4. **Accessibility First**: Ensure proper contrast and focus states
5. **Mobile-First**: Design for mobile devices first, then enhance for larger screens

## 🎨 Dual-Theme Color System

SmartSlate supports both light and dark themes with seamless toggling. The design system maintains brand consistency across both themes while ensuring optimal readability and accessibility.

### Theme Toggle Functionality
- **Default Theme**: Dark mode (as specified in design requirements)
- **Toggle Options**: Light/Dark (system preference removed)
- **Implementation**: CSS class-based theming with `ThemeProvider` and `DarkModeToggle` components
- **Storage**: Theme preference persisted in localStorage

### Brand Colors (Consistent Across Themes)
```css
/* Primary brand color - Cyan */
--primary-accent: #a7dadb;        /* Light theme: #7bc5c7 */
--primary-accent-light: #d0edf0;  /* Light theme: #a7dadb */
--primary-accent-dark: #7bc5c7;   /* Light theme: #5ba0a2 */

/* Action color - Purple */
--secondary-accent: #4F46E5;
--secondary-accent-light: #7C69F5;
--secondary-accent-dark: #3730A3;
```

### Dark Theme Colors (Default)
```css
/* Background Colors */
--background: #020C1B;           /* Main app background */
--background-paper: #0d1b2a;     /* Card/paper backgrounds */
--background-surface: #142433;   /* Surface elements */
--foreground: #e0e0e0;          /* Main text color */

/* Text Colors */
--text-primary: #e0e0e0;         /* Primary text */
--text-secondary: #b0c5c6;       /* Secondary text */
--text-disabled: #7a8a8b;        /* Disabled text */
```

### Light Theme Colors
```css
/* Background Colors */
--background: #ffffff;           /* Main app background */
--background-paper: #f8fafc;     /* Card/paper backgrounds */
--background-surface: #f1f5f9;   /* Surface elements */
--foreground: #1e293b;          /* Main text color */

/* Text Colors */
--text-primary: #1e293b;         /* Primary text */
--text-secondary: #475569;       /* Secondary text */
--text-disabled: #94a3b8;        /* Disabled text */

/* Neutral Scale (Light Theme) */
--neutral-50: #f8fafc;
--neutral-100: #f1f5f9;
--neutral-200: #e2e8f0;
--neutral-300: #cbd5e1;
--neutral-400: #94a3b8;
--neutral-500: #64748b;
--neutral-600: #475569;
--neutral-700: #334155;
--neutral-800: #1e293b;
--neutral-900: #0f172a;
```

## 🎛️ Theme System Usage

### ThemeProvider Component
Wrap your app with the `ThemeProvider` to enable theme functionality:

```tsx
import { ThemeProvider } from '@/components/theme/ThemeProvider';

function App({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="smartslate-theme">
      {children}
    </ThemeProvider>
  );
}
```

### useTheme Hook
Access and control theme state in components:

```tsx
import { useTheme } from '@/components/theme/ThemeProvider';

function MyComponent() {
  const { theme, setTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
        Toggle Theme
      </button>
    </div>
  );
}
```

### DarkModeToggle Component
Pre-built theme toggle button:

```tsx
import { DarkModeToggle } from '@/components/theme/DarkModeToggle';

function Header() {
  return (
    <header className="flex justify-between items-center p-4">
      <h1>SmartSlate</h1>
      <DarkModeToggle className="ml-auto" />
    </header>
  );
}
```

### Theme-Aware Styling
Use CSS custom properties that automatically adapt to the current theme:

```tsx
// These automatically switch between light/dark values
<div className="bg-background text-foreground border border-neutral-200">
  <p className="text-text-primary">Primary content</p>
  <p className="text-text-secondary">Secondary content</p>
</div>

// Using Tailwind with CSS variables
<div style={{
  backgroundColor: 'var(--background-paper)',
  color: 'var(--text-primary)',
  borderColor: 'var(--primary-accent)'
}}>
  Content that adapts to theme
</div>
```

### Glass Effect with Theme Support
The glass effects automatically adapt to the current theme:

```tsx
// Glass effects work in both themes
<div className="glass p-6 rounded-lg">
  <h2>Glass Card</h2>
  <p>Content with glassmorphism effect</p>
</div>

<div className="glass-strong p-4 glass-hover cursor-pointer">
  <p>Interactive glass element</p>
</div>
```

## 📏 Spacing System

Use Tailwind CSS spacing classes consistently:

```css
/* Tailwind spacing scale */
p-1    /* 4px */
p-2    /* 8px */
p-3    /* 12px */
p-4    /* 16px */
p-6    /* 24px */
p-8    /* 32px */
p-12   /* 48px */
p-16   /* 64px */
```

## 🎭 Typography

### Font Families
- **Headings**: Quicksand (700 weight)
- **Body**: Lato (400, 500, 700 weights)

### Font Sizes (Tailwind Classes)
- **Hero Title**: `text-4xl md:text-6xl` (2.25rem → 3.75rem)
- **Section Title**: `text-3xl md:text-5xl` (1.875rem → 3rem)
- **Body Text**: `text-lg` (1.125rem) with `leading-relaxed`
- **Small Text**: `text-sm` (0.875rem)

## 🌟 Component Patterns

### Glass Effect
```css
.glass-effect {
  @apply bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl;
}

.glass-effect-strong {
  @apply bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl;
}
```

### Primary Button
```css
.primary-button {
  @apply bg-secondary-accent text-white px-8 py-3 rounded-lg font-semibold;
  @apply transition-all duration-300 ease-in-out;
  @apply hover:bg-secondary-accent-dark hover:-translate-y-1;
  @apply hover:shadow-lg hover:shadow-secondary-accent/30;
}
```

### Card Component
```css
.card {
  @apply bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6;
  @apply transition-all duration-300 ease-in-out;
  @apply hover:bg-white/10 hover:shadow-xl;
}
```

## 🎨 Tailwind CSS Usage

### Utility-First Approach
Use Tailwind utility classes for consistent styling:

```tsx
// Good - Using Tailwind utilities
<div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
  <h2 className="text-2xl font-bold text-white mb-4">Title</h2>
  <p className="text-gray-300 leading-relaxed">Content</p>
</div>

// Avoid - Custom CSS when utilities exist
<div className="custom-card">
  <h2 className="custom-title">Title</h2>
  <p className="custom-text">Content</p>
</div>
```

### Responsive Design
Use Tailwind's responsive prefixes:

```tsx
<div className="
  text-center md:text-left
  p-4 md:p-6 lg:p-8
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
">
  {/* Content */}
</div>
```

### Custom CSS Variables
Define custom properties in your CSS for brand colors:

```css
:root {
  --primary-accent: #a7dadb;
  --secondary-accent: #4F46E5;
}

/* Use in Tailwind config */
```

## 🎭 Material-UI Integration

### Theme Customization
Extend Material-UI theme with custom colors:

```tsx
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#a7dadb',
      light: '#d0edf0',
      dark: '#7bc5c7',
    },
    secondary: {
      main: '#4F46E5',
      light: '#7C69F5',
      dark: '#3730A3',
    },
    background: {
      default: '#020C1B',
      paper: '#0d1b2a',
    },
    text: {
      primary: '#e0e0e0',
      secondary: '#b0c5c6',
    },
  },
  typography: {
    fontFamily: 'Lato, sans-serif',
    h1: {
      fontFamily: 'Quicksand, sans-serif',
      fontWeight: 700,
    },
    h2: {
      fontFamily: 'Quicksand, sans-serif',
      fontWeight: 700,
    },
  },
});
```

### Styled Components
Use Material-UI's styled API for complex components:

```tsx
import { styled } from '@mui/material/styles';
import { Box, Button } from '@mui/material';

const GlassContainer = styled(Box)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(20px)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: theme.spacing(2),
  padding: theme.spacing(3),
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    transform: 'translateY(-2px)',
  },
}));

const PrimaryButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.secondary.main,
  color: '#ffffff',
  padding: `${theme.spacing(1.5)} ${theme.spacing(4)}`,
  fontSize: '1.1rem',
  fontWeight: 600,
  borderRadius: theme.spacing(1),
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: theme.palette.secondary.dark,
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)',
  },
}));
```

## 🎬 Animation Guidelines

### Framer Motion
Use Framer Motion for complex animations:

```tsx
import { motion } from 'framer-motion';

const FadeInContent = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay }}
  >
    {children}
  </motion.div>
);
```

### CSS Transitions
Use CSS transitions for simple animations:

```css
.transition-all {
  @apply transition-all duration-300 ease-in-out;
}

.hover-lift {
  @apply transition-transform duration-300 ease-in-out;
  @apply hover:-translate-y-1;
}
```

### Animation Classes
Define reusable animation classes:

```css
@keyframes bounceY {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.icon-bounce-y {
  animation: bounceY 2s infinite;
}

.fade-in {
  animation: fadeIn 0.6s ease-out;
}
```

## 📱 Responsive Design

### Breakpoint Strategy
Use Tailwind's responsive breakpoints:

```tsx
// Mobile first approach
<div className="
  w-full                    /* Mobile: full width */
  md:w-1/2                 /* Tablet: half width */
  lg:w-1/3                 /* Desktop: third width */
  xl:w-1/4                 /* Large desktop: quarter width */
">
  {/* Content */}
</div>
```

### Mobile-First Layouts
Design for mobile, then enhance for larger screens:

```tsx
// Mobile overlay, desktop side-by-side
<div className="md:hidden">
  {/* Mobile layout */}
</div>
<div className="hidden md:flex">
  {/* Desktop layout */}
</div>
```

## 🎨 Component Styling Patterns

### Form Fields
Use consistent form styling:

```tsx
const FormField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: theme.spacing(1),
    '&:hover': {
      borderColor: theme.palette.primary.main,
    },
    '&.Mui-focused': {
      borderColor: theme.palette.primary.main,
      boxShadow: `0 0 0 2px ${theme.palette.primary.main}20`,
    },
  },
  '& .MuiInputLabel-root': {
    color: theme.palette.text.secondary,
  },
}));
```

### Modal Styling
Consistent modal appearance:

```tsx
const StyledModal = styled(Modal)(({ theme }) => ({
  '& .MuiPaper-root': {
    backgroundColor: 'rgba(13, 27, 42, 0.95)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: theme.spacing(2),
    color: theme.palette.text.primary,
  },
}));
```

## 🔧 Development Workflow

### CSS Organization
1. **Tailwind utilities first** - Use built-in classes when possible
2. **Styled components** - For complex, reusable components
3. **Custom CSS** - Only for unique animations or complex layouts
4. **CSS modules** - For component-specific styles

### Naming Conventions
- Use kebab-case for CSS classes
- Use camelCase for JavaScript/TypeScript
- Prefix custom classes with component name when needed

### Performance Considerations
- Minimize custom CSS
- Use Tailwind's purge feature in production
- Optimize animations for 60fps
- Use `will-change` sparingly

## 📋 Style Checklist

When styling components, ensure:

- [ ] Uses Tailwind utilities when possible
- [ ] Follows responsive design principles
- [ ] Maintains consistent spacing
- [ ] Includes hover/focus states
- [ ] Meets accessibility contrast requirements in both themes
- [ ] Uses CSS custom properties for theme-adaptive colors
- [ ] Includes smooth transitions
- [ ] Works across all breakpoints
- [ ] **Theme Support**:
  - [ ] Tested in both light and dark themes
  - [ ] Uses appropriate contrast ratios for both themes
  - [ ] Colors adapt correctly when theme changes
  - [ ] Glass effects work properly in both themes
  - [ ] Component renders correctly on theme initialization

## 🚀 Best Practices

1. **Consistency**: Use the same patterns across similar components
2. **Performance**: Prefer CSS-in-JS over external stylesheets for dynamic styles
3. **Maintainability**: Keep styles close to components
4. **Accessibility**: Ensure proper contrast ratios and focus states in both themes
5. **Testing**: Test styles across different devices, browsers, and both themes
6. **Theme Support**: Always use CSS custom properties for colors that should adapt to theme changes
7. **Theme Testing**: Test all components in both light and dark themes
8. **Graceful Fallbacks**: Ensure components work even if theme context is missing

## 📚 Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Material-UI Documentation](https://mui.com/material-ui/)
- [Framer Motion Documentation](https://www.framer.com/motion/)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties)