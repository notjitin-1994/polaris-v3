# Static Questionnaire Design System

## Overview

The static questionnaire has been completely rebuilt to match the **SmartSlate-App** design language, featuring a dark, glassmorphic aesthetic with swirl background patterns and smooth animations.

## Design Tokens

### Colors

Based on the SmartSlate-App design system:

#### Primary (Teal/Cyan)

- `#a7dadb` - Primary accent color
- `#d0edf0` - Light variant
- `#7bc5c7` - Dark variant

#### Secondary (Indigo)

- `#4F46E5` - Main button color
- `#7C69F5` - Light variant
- `#3730A3` - Dark variant

#### Background

- `#020C1B` - Main background
- `rgba(13,27,42,0.55)` - Card background (with glass effect)

#### Text

- `#e0e0e0` - Primary text
- `rgba(255,255,255,0.7)` - Secondary text
- `rgba(255,255,255,0.4)` - Placeholder text

### Typography

- **Headings**: Quicksand (600-700 weight)
- **Body**: Lato (400, 500, 700)
- Font loaded via Next.js font optimization

### Spacing

Consistent with Tailwind spacing scale:

- Input padding: `px-4 py-3`
- Card padding: `p-6 md:p-8`
- Button padding: `px-4 py-3`
- Gap between elements: `gap-2`, `gap-3`, `space-y-6`

## Components

### QuestionnaireLayout

Full-screen layout with swirl background pattern and atmospheric lighting effects.

**Features:**

- Swirl pattern background using seeded random positioning
- Radial gradient halo for focus
- Edge vignetting
- Responsive swirl count (40-50 based on screen size)
- Auto-adjusting viewport height

**Usage:**

```tsx
<QuestionnaireLayout currentStep={0} totalSteps={5}>
  {children}
</QuestionnaireLayout>
```

### QuestionnaireCard

Glass-morphic card with gradient borders and backdrop blur.

**Features:**

- Multi-layer gradient border effect
- 18px backdrop blur (12px on mobile)
- Subtle shadow inset
- Optional logo display
- Scale-in animation on mount

**Usage:**

```tsx
<QuestionnaireCard showLogo={true}>{content}</QuestionnaireCard>
```

### QuestionnaireInput

Styled input field with glass effect and validation states.

**Features:**

- Glass background with 5% opacity
- Teal focus ring (#a7dadb)
- Error states with red accents
- Optional help text
- Multiline support
- Required field indicator

**Props:**

- `label`: Field label
- `value`: Current value
- `onChange`: Change handler
- `placeholder`: Placeholder text
- `error`: Error message
- `helpText`: Helper text
- `required`: Shows asterisk
- `multiline`: Textarea mode
- `rows`: Textarea rows

**Usage:**

```tsx
<QuestionnaireInput
  label="Your Role"
  value={role}
  onChange={setRole}
  placeholder="e.g., Learning & Development Manager"
  required
/>
```

### QuestionnaireButton

Action button with micro-interactions.

**Features:**

- Two variants: `primary` (indigo) and `ghost` (transparent)
- Hover lift animation (translateY -2px)
- Active scale animation (0.98)
- Loading state support
- Disabled state styling
- Full-width option

**Props:**

- `variant`: 'primary' | 'ghost'
- `disabled`: Boolean
- `loading`: Boolean
- `fullWidth`: Boolean
- `type`: 'button' | 'submit'

**Usage:**

```tsx
<QuestionnaireButton variant="primary" loading={isSubmitting} fullWidth>
  Next
</QuestionnaireButton>
```

### QuestionnaireProgress

Progress indicator with step information.

**Features:**

- Animated progress bar
- Teal accent with glow effect
- Current step label and description
- Step counter (X of Y)
- Smooth transitions (500ms duration)

**Usage:**

```tsx
<QuestionnaireProgress currentStep={2} totalSteps={5} steps={wizardSteps} />
```

## Step Components

### RoleStep, OrganizationStep, LearningGapStep, ResourcesStep, ConstraintsStep

Each step component follows the same pattern:

- Uses `QuestionnaireInput` for consistency
- Includes helpful tip box with teal accent
- Fade-in-up animation on mount
- Integrated with react-hook-form

**Common Features:**

- Form validation via Zod schema
- Auto-save functionality
- Error display
- Helpful tips with teal info box
- Consistent spacing and layout

## Animations

All animations respect `prefers-reduced-motion`:

### Entrance Animations

- `animate-scale-in`: Scale from 0.95 with fade (300ms)
- `animate-fade-in`: Simple opacity fade (300ms)
- `animate-fade-in-up`: Fade with upward slide (400ms)

### Micro-interactions

- Hover lift: `-2px` translateY
- Active press: `scale(0.98)`
- Button hover: Background color transition (180ms)

### Loading States

- Spin animation with teal accent ring
- Pulse for "saving" text

## Visual Effects

### Glass Effect

```css
background:
  linear-gradient(rgba(13, 27, 42, 0.55), rgba(13, 27, 42, 0.55)) padding-box,
  linear-gradient(135deg, rgba(255, 255, 255, 0.22), rgba(255, 255, 255, 0.06)) border-box;
border: 1px solid transparent;
box-shadow:
  0 8px 40px rgba(0, 0, 0, 0.4),
  inset 0 1px 0 rgba(255, 255, 255, 0.06);
backdrop-filter: blur(18px);
```

### Swirl Pattern

- Seeded random positioning for consistent layout
- Collision detection for spacing
- Opacity range: 0.06-0.12
- Size range: 24px-56px
- Random rotation and horizontal flip

### Focus States

- 1.2px ring in teal (#a7dadb)
- Smooth transition (200ms)
- Border color matches ring

## Accessibility

### WCAG Compliance

- Text contrast ratios meet AA standards
- Focus indicators visible on all interactive elements
- Proper semantic HTML structure
- ARIA labels where needed

### Keyboard Navigation

- All interactive elements keyboard accessible
- Logical tab order
- Enter submits forms
- Escape closes modals (if applicable)

### Screen Readers

- Proper label associations
- Error messages announced
- Progress updates communicated
- Help text accessible

## Responsive Design

### Breakpoints

- Mobile: < 768px
  - Reduced swirl count (32%)
  - Smaller card padding (p-6)
  - Adjusted backdrop blur (12px)
- Desktop: >= 768px
  - Full swirl count (40%)
  - Larger card padding (p-8)
  - Full backdrop blur (18px)

### Touch Targets

- Minimum 44px height for buttons
- Adequate spacing between interactive elements
- Comfortable input field sizes

## Performance Optimizations

### Swirl Rendering

- Single calculation on mount
- Seeded RNG for deterministic layout
- Debounced resize handler (100ms)
- Mutation observer for dynamic height

### Image Optimization

- Next.js Image component
- Lazy loading
- Proper sizing attributes
- WebP support

### Animation Performance

- GPU-accelerated transforms
- `will-change` on animated elements
- Reduced motion support
- Minimal repaints

## Integration Notes

### Required Dependencies

- Next.js 15+
- React 19+
- React Hook Form
- Zod
- Framer Motion (removed in this implementation)

### Required Assets

- `/public/logo.png` - SmartSlate logo
- `/public/logo-swirl.png` - Swirl pattern tile

### Font Loading

Handled in root layout:

```tsx
import { Lato } from 'next/font/google';
import { Quicksand } from 'next/font/google';

const lato = Lato({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-lato' });
const quicksand = Quicksand({
  weight: ['600', '700'],
  subsets: ['latin'],
  variable: '--font-quicksand',
});
```

### CSS Variables

Define in `globals.css`:

```css
:root {
  --font-lato: 'Lato', sans-serif;
  --font-quicksand: 'Quicksand', sans-serif;
}
```

## Migration Guide

### From Old Design

1. Replace old step components with new ones
2. Update StepWizard to use QuestionnaireLayout
3. Add logo assets to public folder
4. Remove old ProgressIndicator component
5. Test all form validations
6. Verify auto-save functionality

### Testing Checklist

- [ ] All fields validate correctly
- [ ] Auto-save works after each field change
- [ ] Navigation (Next/Previous) works
- [ ] Loading states display properly
- [ ] Error states show correctly
- [ ] Responsive layout on mobile
- [ ] Swirl pattern renders consistently
- [ ] Animations respect reduced motion
- [ ] Keyboard navigation works
- [ ] Screen reader announces changes

## Future Enhancements

### Potential Additions

- Step skipping for advanced users
- Progress persistence across sessions
- Multi-language support
- Custom theme variants
- Enhanced swirl interactions
- Confetti on completion
- Sound effects (optional)

### Performance Improvements

- Virtual scrolling for long forms
- Web Workers for swirl calculation
- Progressive image loading
- Code splitting by step

## Maintenance

### Regular Tasks

- Update dependencies monthly
- Test on new browsers
- Verify accessibility standards
- Monitor performance metrics
- Collect user feedback

### Known Issues

- None currently

### Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support (with vendor prefixes)
- Mobile browsers: ✅ Tested on iOS Safari and Chrome Android
