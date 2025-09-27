# Linting and Style Guide

## Overview

This project enforces strict linting and formatting rules to maintain code quality and consistency, particularly around Tailwind CSS usage and style patterns.

## Tools Used

- **ESLint**: Code quality and pattern enforcement
- **Prettier**: Code formatting with Tailwind class sorting
- **Husky**: Git hooks for pre-commit checks
- **Lint-staged**: Run linters on staged files only

## Key Rules Enforced

### 1. No Gradients

**Rule**: Gradients are strictly prohibited across the codebase.

❌ **Not Allowed:**
```tsx
// These will trigger ESLint errors
className="bg-gradient-to-r from-blue-500 to-purple-600"
className="bg-gradient-to-br via-slate-100"
style={{ backgroundImage: 'linear-gradient(...)' }}
```

✅ **Instead Use:**
```tsx
// Solid colors or glass effects
className="bg-blue-600"
className="glass" // Custom glass utility
```

### 2. Minimize Inline Styles

**Rule**: Inline styles are discouraged. Use Tailwind utility classes instead.

❌ **Avoid:**
```tsx
<div style={{ backgroundColor: '#fff', padding: '20px' }}>
```

✅ **Preferred:**
```tsx
<div className="bg-white p-5">
```

**Exception**: Filter properties for glass effects are allowed:
```tsx
// This is acceptable for glass effects
<div style={{ filter: 'saturate(1.05)' }}>
```

### 3. Tailwind Class Order

Prettier automatically sorts Tailwind classes in the recommended order:
1. Layout (display, position, grid/flex)
2. Spacing (padding, margin, gap)
3. Sizing (width, height)
4. Typography (font, text)
5. Colors (background, text, border)
6. Effects (shadow, blur, opacity)
7. States (hover, focus, disabled)
8. Transitions

**Example:**
```tsx
// Before (unsorted)
className="text-white bg-blue-600 p-4 flex hover:bg-blue-700"

// After (sorted by Prettier)
className="flex p-4 bg-blue-600 text-white hover:bg-blue-700"
```

### 4. Semantic Color Tokens

**Rule**: Prefer semantic tokens over hardcoded Tailwind colors where possible.

⚠️ **Warning (not error):**
```tsx
className="bg-blue-600" // Will show warning suggesting semantic token
```

✅ **Preferred:**
```tsx
className="bg-primary" // Using CSS variable-based semantic token
```

### 5. TypeScript Strictness

- No `any` types allowed
- All unused variables must be prefixed with `_` or removed
- Functions should have explicit return types

## Running Linters

### Manual Commands

```bash
# Run ESLint
npm run lint

# Run ESLint with auto-fix
npx eslint . --fix

# Check Prettier formatting
npx prettier --check .

# Format with Prettier
npm run format
```

### Automatic Checks

1. **Pre-commit Hook**: Automatically runs on `git commit`
2. **CI Pipeline**: Runs on all PRs and pushes to main branches
3. **Editor Integration**: VSCode/Cursor will show errors in real-time

## CI Integration

The CI pipeline (`/.github/workflows/ci.yml`) includes:
- ESLint validation
- Prettier format checking
- Gradient violation scanning
- Inline style detection
- TypeScript type checking

## Fixing Common Issues

### ESLint Errors

```bash
# Auto-fix most ESLint issues
cd frontend && npx eslint . --fix
```

### Prettier Formatting

```bash
# Format all files
cd frontend && npm run format
```

### Gradient Violations

Search and replace gradient classes with solid colors or glass effects:
- `bg-gradient-*` → `bg-[color]` or `glass`
- `from-*`, `to-*`, `via-*` → Remove entirely

### Inline Styles

Convert inline styles to Tailwind classes:
```tsx
// Before
style={{ marginTop: '10px', color: 'red' }}

// After
className="mt-2.5 text-red-500"
```

## Exceptions and Overrides

If you absolutely need to bypass a rule:

### ESLint Disable Comments
```tsx
// eslint-disable-next-line no-restricted-syntax
const gradientNeededForLibrary = 'bg-gradient-to-r'; // Document why this is needed
```

### Prettier Ignore
```tsx
// prettier-ignore
const specialFormatting = 'keep-this-format';
```

**Note**: All exceptions should be documented with a clear explanation of why they're necessary.

## Troubleshooting

### ESLint Not Working

1. Ensure dependencies are installed: `npm ci`
2. Check ESLint config: `frontend/eslint.config.mjs`
3. Clear ESLint cache: `rm -rf .eslintcache`

### Prettier Not Sorting Tailwind Classes

1. Verify plugin installed: `prettier-plugin-tailwindcss`
2. Check `.prettierrc` configuration
3. Restart your editor/language server

### Pre-commit Hooks Not Running

1. Install Husky: `npm run prepare`
2. Check hook permissions: `chmod +x .husky/pre-commit`
3. Verify Git hooks path: `git config core.hooksPath`

## Additional Resources

- [Tailwind CSS Best Practices](https://tailwindcss.com/docs/editor-setup)
- [ESLint Rules Reference](https://eslint.org/docs/rules/)
- [Prettier Options](https://prettier.io/docs/en/options.html)
- [Project Style PRD](../docs/styleprd.md)
