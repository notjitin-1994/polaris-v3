# Token Recommendations Based on Arbitrary Value Audit

## Executive Summary
Based on the comprehensive audit of arbitrary values in the codebase, this document proposes new design tokens to improve consistency and maintainability. The audit identified several patterns that should be standardized through the token system.

## Audit Results Summary
- **Total files scanned**: 64
- **Total issues found**: 50
- **Inline styles**: 7 occurrences
- **Arbitrary spacing values**: 8 occurrences  
- **Arbitrary size values**: 35 occurrences
- **Border radius variations**: 6 types
- **Opacity values**: 8 unique values

## Proposed New Tokens

### 1. Standardized Border Radius Scale
**Current State**: 6 different border radius values used inconsistently

**Recommendation**: Limit to 4 standard values
```css
:root {
  --radius-none: 0;        /* Sharp corners */
  --radius-sm: 0.25rem;    /* Subtle rounding (4px) */
  --radius-base: 0.5rem;   /* Default rounding (8px) - most common */
  --radius-lg: 1rem;       /* Large rounding (16px) - cards/modals */
  --radius-full: 9999px;   /* Pills/circles */
}
```

**Migration Plan**:
- `rounded-md` → `rounded-base` (standardize on base)
- `rounded-lg` → Keep as is (75 uses - most common)
- `rounded-xl` → `rounded-lg` (consolidate)
- `rounded-2xl` → `rounded-lg` (consolidate) 
- `rounded-3xl` → Remove (only 2 uses)

### 2. Glass Effect Opacity Scale
**Current State**: Multiple opacity values for glass effects

**Recommendation**: Standardized glass opacity tokens
```css
:root {
  --glass-opacity-subtle: 0.05;    /* Very subtle glass */
  --glass-opacity-light: 0.10;     /* Light glass effect */
  --glass-opacity-medium: 0.15;    /* Medium glass effect */
  --glass-opacity-strong: 0.20;    /* Strong glass effect */
  --glass-opacity-solid: 0.30;     /* Nearly solid glass */
}
```

### 3. Common Layout Heights
**Current State**: Repeated height values across components

**Recommendation**: Layout-specific height tokens
```css
:root {
  /* Modal/Dialog Heights */
  --height-modal-sm: 60vh;
  --height-modal-base: 80vh;
  --height-modal-lg: 90vh;
  
  /* Content Heights */
  --height-content-xs: 80px;
  --height-content-sm: 120px;
  --height-content-base: 200px;
  --height-content-lg: 300px;
  
  /* Form Element Heights */
  --height-input: 38px;
  --height-textarea-sm: 80px;
  --height-textarea-base: 120px;
  --height-textarea-lg: 200px;
}
```

### 4. Responsive Breakpoint Tokens
**Current State**: Inline breakpoint-specific values

**Recommendation**: Responsive size tokens
```css
:root {
  /* Responsive min-heights for auth pages */
  --height-auth-sm: 460px;
  --height-auth-md: 520px;
  --height-auth-lg: 600px;
  
  /* Responsive header heights */
  --height-header-sm: 2rem;
  --height-header-base: 2.5rem;
  --height-header-lg: 3rem;
}
```

### 5. Animation Duration Scale
**Current State**: Various transition durations

**Recommendation**: Consistent animation timing
```css
:root {
  --duration-instant: 0ms;
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-moderate: 300ms;
  --duration-slow: 500ms;
  --duration-lazy: 750ms;
}
```

### 6. Shadow Scale
**Current State**: Inconsistent shadow usage

**Recommendation**: Standardized elevation shadows
```css
:root {
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.05);
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-base: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.15);
  --shadow-xl: 0 20px 40px rgba(0, 0, 0, 0.2);
  --shadow-2xl: 0 25px 50px rgba(0, 0, 0, 0.25);
}
```

## Implementation Priority

### Phase 1: High Impact (Immediate)
1. **Border Radius Consolidation**: Affects 204 occurrences
   - Create migration script to update all instances
   - Update component documentation

2. **Glass Opacity Tokens**: Affects 87 occurrences
   - Already partially implemented
   - Complete migration for remaining instances

### Phase 2: Medium Impact (Next Sprint)
3. **Layout Heights**: Affects 45 occurrences
   - Focus on modal and content heights first
   - Gradually migrate form elements

4. **Animation Durations**: Affects all interactive components
   - Audit current transition usage
   - Create consistent timing functions

### Phase 3: Enhancement (Future)
5. **Shadow Scale**: New feature
   - Design consistent elevation system
   - Apply to cards, modals, dropdowns

6. **Responsive Tokens**: Architecture improvement
   - Create responsive utility classes
   - Enable better mobile-first design

## Benefits of Implementation

1. **Consistency**: Reduce visual inconsistencies across the application
2. **Maintainability**: Single source of truth for design values
3. **Performance**: Smaller CSS bundle through token reuse
4. **Design System**: Foundation for a proper design system
5. **Developer Experience**: Clearer intent and easier modifications

## Migration Strategy

1. **Create tokens** in `globals.css` with fallbacks
2. **Add utility classes** for common patterns
3. **Update components** incrementally by feature area
4. **Deprecate** arbitrary values with ESLint rules
5. **Document** new tokens in component guidelines

## Validation Checklist

- [ ] All tokens follow naming conventions
- [ ] Dark mode equivalents defined where needed
- [ ] Migration doesn't break existing functionality
- [ ] Performance impact measured (bundle size)
- [ ] Documentation updated
- [ ] Team trained on new tokens

## Next Steps

1. Review and approve token proposals with design team
2. Create migration scripts for automated updates
3. Update ESLint rules to prevent new arbitrary values
4. Add token documentation to Storybook/design system
5. Schedule migration work across sprints

## Appendix: Token Usage Examples

### Before
```tsx
<div className="rounded-2xl max-h-[80vh] bg-white/10">
```

### After
```tsx
<div className="rounded-lg max-h-modal glass-10">
```

### Custom Properties in Use
```css
.modal {
  max-height: var(--height-modal-base);
  border-radius: var(--radius-lg);
  background: rgba(255, 255, 255, var(--glass-opacity-light));
}
```
