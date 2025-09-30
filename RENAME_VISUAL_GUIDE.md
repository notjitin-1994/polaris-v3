# Blueprint Rename - Visual Guide

## What You'll See

### 1. Blueprint Page Header

**BEFORE:**
```
[← Dashboard] | "Jitin's Polaris Starma..." | [Share] [Download]
                 ^^^^^^^^^^^^^^^^^^^^
                 (Truncated with ellipsis)
```

**AFTER:**
```
[← Dashboard] | "Jitin's Polaris Starmaps Deep Learning Journey" [✏️] | [Share] [Download]
                 ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ ^^^
                 (Full title visible)                    (Rename button)
```

**Key Features:**
- ✅ Full title displayed with `line-clamp-1` (no awkward truncation)
- ✅ Pencil icon button for rename (glass effect, hover states)
- ✅ Maximum 80 characters enforced (prevents layout issues)
- ✅ Responsive: title wraps gracefully on mobile

---

### 2. Dashboard Blueprint Cards

**Card Layout:**
```
┌─────────────────────────────────────────────────────┐
│ [⏰] Draft  v1.0                              [✏️]  │
│      Jitin's Polaris Starmaps Deep...              │
│      Created Sep 30, 2025, 10:30 AM    ✅ Generated │
│                                                      │
│                              [Resume →]             │
└─────────────────────────────────────────────────────┘
```

**Rename Button:**
- Located in top-right corner of each card
- Pencil icon (4x4, 16px)
- Glass effect with border
- Hover: background brightens, icon becomes white

---

### 3. Rename Dialog

**Visual Structure:**
```
┌──────────────────────────────────────────────┐
│ [✏️] Rename Blueprint                    [×] │
│     Enter a new name for your blueprint      │
├──────────────────────────────────────────────┤
│                                              │
│ Blueprint Name                               │
│ ┌──────────────────────────────────────────┐ │
│ │ Jitin's Polaris Starmaps Deep...       │ │  ← Input field
│ └──────────────────────────────────────────┘ │
│ 45/80 characters    • Changes will be saved │
│                                              │
│                      [Cancel]  [Rename]     │
├──────────────────────────────────────────────┤
│ 💡 Tip: Press Esc to cancel, Cmd+Enter to  │
│    save                                      │
└──────────────────────────────────────────────┘
```

**Design Details:**
- **Background:** Dark glass effect with strong blur
- **Header:** 
  - Pencil icon in circular badge (primary/10 bg, primary/20 border)
  - Title in Quicksand font (white)
  - Description in white/60
- **Input:**
  - Glass background (white/5)
  - Primary color focus ring
  - Placeholder in white/40
- **Character Counter:** 
  - White/50 text
  - Changes indicator with pulsing dot
- **Buttons:**
  - Cancel: Ghost variant
  - Rename: Primary (secondary accent blue)
- **Footer:** 
  - Glass background with border
  - Keyboard shortcuts in monospace font

---

## Color Reference

### Brand Colors Used:
- **Primary Accent:** `#a7dadb` (teal/cyan)
- **Secondary Accent:** `#4f46e5` (indigo/blue)
- **Success:** `#10b981` (green)
- **Error:** `#ef4444` (red)

### Text Hierarchy:
- **Primary:** `white` (#ffffff)
- **Secondary:** `white/60` (rgba(255,255,255,0.6))
- **Tertiary:** `white/50` (rgba(255,255,255,0.5))
- **Disabled:** `white/40` (rgba(255,255,255,0.4))

### Glass Effects:
- **Light Glass:** `white/5` background + `white/10` border
- **Strong Glass:** `white/10` background + `white/20` border
- **Backdrop Blur:** 12-40px depending on context

---

## Responsive Behavior

### Desktop (≥1024px)
- Title displays full width up to 80 characters
- Rename button 8x8 (32px)
- Dialog max-width: 28rem (448px)

### Tablet (768-1023px)
- Title line-clamps at 1 line
- Rename button 8x8 (32px)
- Dialog adapts with margin

### Mobile (<768px)
- Title line-clamps at 1 line
- Rename button 8x8 (32px) - touch-friendly
- Dialog full-width with 16px margin
- Share/Download text hidden (icons only)

---

## Interaction States

### Rename Button States:
1. **Default:** white/70 text, white/5 background
2. **Hover:** white text, white/10 background
3. **Active:** Scale(0.98) with pressable animation
4. **Focus:** Ring with secondary accent

### Dialog States:
1. **Opening:** Fade-in + scale-in animation (300ms)
2. **Active:** Full opacity, slight blur
3. **Loading:** Spinner in Rename button
4. **Error:** Red border and text below input
5. **Closing:** Fade-out animation (200ms)

---

## Accessibility Features

### Keyboard Navigation:
- `Tab` - Navigate between elements
- `Esc` - Close dialog
- `Cmd/Ctrl + Enter` - Save changes
- `Enter` (on input) - Submit form

### Screen Reader:
- All buttons have `aria-label`
- Dialog has proper ARIA roles
- Error messages announced
- Focus management (traps focus in dialog)

### Visual:
- High contrast (WCAG AA compliant)
- Focus indicators visible
- Icon-only buttons have tooltips
- Loading states clearly indicated

---

## Animation Details

### Entry Animations:
- **Dialog backdrop:** `fade-in` (0.3s ease-out)
- **Dialog content:** `scale-in` (0.3s ease-out)
- **Change indicator dot:** `pulse` (continuous)

### Exit Animations:
- **Dialog:** Fade-out (0.2s ease-in)

### Hover Animations:
- **Buttons:** Transform translateY(-2px) (0.22s)
- **Cards:** Lift effect (0.3s ease-out)

### Respects `prefers-reduced-motion`:
All animations disabled if user has motion sensitivity enabled.

---

## Testing Checklist

### Visual Testing:
- [ ] Title shows fully without ellipsis
- [ ] Pencil icon renders correctly
- [ ] Glass effects visible on all components
- [ ] Colors match brand palette
- [ ] Animations smooth and not jarring
- [ ] Responsive layout on all screen sizes

### Functional Testing:
- [ ] Rename button opens dialog
- [ ] Input pre-filled with current title
- [ ] Character counter updates in real-time
- [ ] 80 character limit enforced
- [ ] Empty title shows error
- [ ] Save updates title immediately
- [ ] Cancel discards changes
- [ ] Keyboard shortcuts work

### Accessibility Testing:
- [ ] Can navigate with keyboard only
- [ ] Screen reader announces all elements
- [ ] Focus indicators visible
- [ ] Contrast ratios meet WCAG AA
- [ ] Touch targets ≥44px on mobile

---

**Last Updated:** September 30, 2025
**Status:** ✅ Implementation Complete
