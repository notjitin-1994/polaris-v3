# Blueprint Usage System - Visual Guide

This guide provides a visual walkthrough of all UI components and their states.

---

## 1. UsageStatsDisplay Component

### State: Healthy Usage (0-50%)
```
┌─────────────────────────────────────────────────────────────┐
│  Usage Statistics               [🎯 Free Tier]              │
│  Lifetime allocation for free tier                          │
│                                                              │
│  ⚡ Blueprints Created                          1 / 2      │
│     Lifetime count                                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                                    ┗━ 50%   │
│                                                              │
│  💾 Blueprints Saved                            0 / 2      │
│     Lifetime storage                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                                    ┗━ 0%    │
│                                                              │
│  💡 Delete existing blueprints to free up slots             │
└─────────────────────────────────────────────────────────────┘
```

### State: Approaching Limit (80%+)
```
┌─────────────────────────────────────────────────────────────┐
│  Usage Statistics          [⚠️ 1 starmap remaining]        │
│  Lifetime allocation for free tier                          │
│                                                              │
│  ⚡ Blueprints Created                          2 / 2      │
│     Lifetime count                                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  ████████████████████████████████████████████████████████░░ │
│  ⚠️ Approaching limit                            ┗━ 100%   │
│                                                              │
│  💾 Blueprints Saved                            1 / 2      │
│     Lifetime storage                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  ████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░ │
│                                                    ┗━ 50%   │
└─────────────────────────────────────────────────────────────┘
```

### State: Limit Reached
```
┌─────────────────────────────────────────────────────────────┐
│  Usage Statistics          [❌ Limit reached]               │
│  Lifetime allocation for free tier                          │
│                                                              │
│  ⚡ Blueprints Created                          2 / 2      │
│     Lifetime count                                           │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  ████████████████████████████████████████████████████████████│
│  ⛔ Limit reached                                ┗━ 100%   │
│                                                              │
│  💾 Blueprints Saved                            2 / 2      │
│     Lifetime storage                                         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  ████████████████████████████████████████████████████████████│
│  ⛔ Limit reached                                ┗━ 100%   │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📈 Unlock More Starmaps                            │   │
│  │ Upgrade to a premium plan for unlimited starmaps   │   │
│  │ and advanced features.                              │   │
│  │                                                      │   │
│  │ [👑 View Plans]                                     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### State: Premium User
```
┌─────────────────────────────────────────────────────────────┐
│  Usage Statistics               [👑 Premium Member]         │
│  Your current usage and limits                              │
│                                                              │
│  ⚡ Blueprints Created                          15 / ∞     │
│     This period                                              │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  [No limit bar shown]                                       │
│                                                              │
│  💾 Blueprints Saved                            8 / ∞      │
│     Current storage                                          │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │
│  [No limit bar shown]                                       │
│                                                              │
│  ✨ You have unlimited blueprint access!                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. LimitReachedModal Component

```
┌─ BACKDROP (blur + dark overlay) ────────────────────────────┐
│                                                              │
│     ┌────────────────────────────────────────────┐     [X]  │
│     │                                             │          │
│     │              ┌─────────────┐                │          │
│     │              │   ⚠️   │                │          │
│     │              └─────────────┘                │          │
│     │                                             │          │
│     │     Blueprint Creation Limit Reached       │          │
│     │                                             │          │
│     │  You've reached your limit of 2 blueprint  │          │
│     │  creations. Upgrade to create unlimited     │          │
│     │  blueprints!                                │          │
│     │                                             │          │
│     │  ┌──────────────────────────────────────┐  │          │
│     │  │ Creations Used          2 / 2        │  │          │
│     │  │ ████████████████████████████████████ │  │          │
│     │  └──────────────────────────────────────┘  │          │
│     │                                             │          │
│     │  ┌──────────────────────────────────────┐  │          │
│     │  │ ✨ Upgrade for More                  │  │          │
│     │  │ ⚡ Unlimited blueprint creations     │  │          │
│     │  │ 📈 Advanced analytics & insights     │  │          │
│     │  │ 👑 Priority support                  │  │          │
│     │  └──────────────────────────────────────┘  │          │
│     │                                             │          │
│     │  [ 👑 View Pricing ]  [ Maybe Later ]     │          │
│     │                                             │          │
│     │  💡 Delete existing blueprints to free up  │          │
│     │     space                                   │          │
│     └────────────────────────────────────────────┘          │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Animations:**
- Backdrop: Fade in (200ms)
- Modal: Scale + fade in (300ms)
- Icon: Rotate + scale spring (500ms)
- Progress bar: Width animation (600ms)
- Lists: Stagger fade-in (50ms delay each)

---

## 3. UsageProgressBar Component

### Healthy Usage (0-50%) - Green
```
Blueprints Created                                1 / 2     50%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
████████████████████████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
     └─ Shimmer effect ─┘              └─ Pulse dot
```

### Moderate Usage (50-80%) - Cyan
```
Blueprints Created                                4 / 6     67%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
████████████████████████████████████████░░░░░░░░░░░░░░░░░░░░░
```

### Approaching Limit (80-100%) - Amber
```
Blueprints Created                                9 / 10    90%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
████████████████████████████████████████████████████░░░░░░░░░░
⚠️ Approaching limit
```

### Limit Reached (100%) - Red
```
Blueprints Created                                2 / 2     100%
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
██████████████████████████████████████████████████████████████
⛔ Limit reached
```

### Compact Variant (for sidebars)
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━
████████████░░░░░░░░░░░░░░░░
```

---

## 4. UsageBadge Components

### UsageBadge - Default Variant
```
┌────────────────────────────┐
│ ⚡ 1 / 2 · created        │
└────────────────────────────┘
   └─ Icon     └─ Label
```

### UsageBadge - Compact Variant
```
┌──────────────┐
│ ⚡ 1 left    │
└──────────────┘
```

### UsageBadge - Minimal Variant
```
1/2
```

### TierBadge
```
┌────────────────────┐     ┌─────────────────────┐
│ ⚡ Free Tier      │     │ 👑 Premium Member  │
└────────────────────┘     └─────────────────────┘
```

### StatusBadge
```
┌──────────┐  ┌──────────────┐  ┌─────────────┐  ┌─────────┐
│ 💾 Draft │  │ ⚡ Generating│  │ ✅ Completed │  │ ❌ Error│
└──────────┘  └──────────────┘  └─────────────┘  └─────────┘
              └─ Pulse animation
```

### RemainingBadge - Emphasis
```
┌──────────────────┐
│       1          │
│  creations left  │
└──────────────────┘
```

---

## 5. UpgradeCTA Components

### Card Variant
```
┌─────────────────────────────────────────────────────────────┐
│                                                  [Gradient]  │
│  👑  Unlock Premium Features                                │
│      Get unlimited access to all features and take your     │
│      learning to the next level.                            │
│                                                              │
│  ✨ Unlimited blueprint creations                           │
│  ✨ Unlimited blueprint saves                               │
│  ✨ Advanced analytics & insights                           │
│  ✨ Priority support                                        │
│  ✨ Early access to new features                            │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  👑 View Pricing Plans                          →   │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Banner Variant
```
┌─────────────────────────────────────────────────────────────┐
│ 📈 Ready to unlock more?                 [Upgrade]          │
│    Upgrade to premium for unlimited blueprints              │
└─────────────────────────────────────────────────────────────┘
```

### Inline Variant
```
⚡ Upgrade for unlimited access  View Plans →
```

### UpgradePrompt (Settings)
```
┌─────────────────────────────────────────────────────────────┐
│  Current: Free                                          👑  │
│                                                              │
│  Upgrade to Premium                                         │
│  Unlock unlimited blueprints and advanced features          │
│                                                              │
│  ┌─────────────┐  ┌─────────────┐                          │
│  │     ∞       │  │    24/7     │                          │
│  │ Blueprints  │  │   Support   │                          │
│  └─────────────┘  └─────────────┘                          │
│                                                              │
│  [ 👑 View Plans ]                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 6. ApproachingLimitBanner

```
┌─────────────────────────────────────────────────────────────┐
│ ⚠️ Approaching Creation Limit                               │
│    You have 1 creation remaining. Consider upgrading for    │
│    unlimited access.                              [Upgrade] │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. CompactUsageDisplay (Sidebar)

```
┌──────────────────────┐
│ Creations   1 left   │
│ ━━━━━━━━━━━━━━━━━━━ │
│ ████████░░░░░░░░░░░░ │
│                      │
│ Saves       2 left   │
│ ━━━━━━━━━━━━━━━━━━━ │
│ ░░░░░░░░░░░░░░░░░░░░ │
└──────────────────────┘
```

### Premium User Version
```
┌──────────────────────┐
│ 👑 Unlimited         │
└──────────────────────┘
```

---

## 8. Color Coding System

### Progress Bar Colors

**Green (Success)** - 0-50% usage
```
████████████░░░░░░░░░░░░░░░░
RGB: #10b981
Use: Healthy, plenty of room
```

**Cyan (Primary)** - 50-80% usage
```
████████████████████░░░░░░░░
RGB: #a7dadb
Use: Moderate, still good
```

**Amber (Warning)** - 80-100% usage
```
████████████████████████░░░░
RGB: #f59e0b
Use: Approaching limit, be aware
```

**Red (Error)** - 100% usage
```
████████████████████████████
RGB: #ef4444
Use: Limit reached, action needed
```

---

## 9. Interaction States

### Button States

**Normal**
```
┌──────────────────────┐
│  Create Blueprint    │
└──────────────────────┘
```

**Hover** (elevated, slightly brighter)
```
┌──────────────────────┐
│  Create Blueprint    │  ← Slight shadow increase
└──────────────────────┘     translateY(-2px)
```

**Active/Pressed** (pressed down)
```
┌──────────────────────┐
│  Create Blueprint    │  ← scale(0.98)
└──────────────────────┘
```

**Disabled** (when limit reached)
```
┌──────────────────────┐
│   Limit Reached      │  ← opacity: 0.5
└──────────────────────┘     cursor: not-allowed
```

**Loading**
```
┌──────────────────────┐
│  ◌ Creating...       │  ← Spinner animation
└──────────────────────┘
```

---

## 10. Responsive Behavior

### Desktop (1024px+)
```
┌─────────────────────────────────────────────────────────┐
│ Dashboard                                               │
│ ┌─────────────────────┐  ┌─────────────────────┐       │
│ │  Usage Stats        │  │  Quick Actions      │       │
│ │  [Full width]       │  │  [Full width]       │       │
│ └─────────────────────┘  └─────────────────────┘       │
│                                                         │
│ ┌─────────────────────────────────────────────────┐    │
│ │  Recent Blueprints                              │    │
│ │  [Full width]                                   │    │
│ └─────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────┘
```

### Tablet (768px - 1024px)
```
┌───────────────────────────────────┐
│ Dashboard                         │
│ ┌───────────────────────────────┐ │
│ │  Usage Stats                  │ │
│ │  [Full width]                 │ │
│ └───────────────────────────────┘ │
│ ┌───────────────────────────────┐ │
│ │  Quick Actions                │ │
│ │  [Full width]                 │ │
│ └───────────────────────────────┘ │
│ ┌───────────────────────────────┐ │
│ │  Recent Blueprints            │ │
│ └───────────────────────────────┘ │
└───────────────────────────────────┘
```

### Mobile (320px - 768px)
```
┌─────────────────────┐
│ Dashboard           │
│ ┌─────────────────┐ │
│ │  Usage Stats    │ │
│ │  [Compact]      │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │  Quick Actions  │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │  Recent         │ │
│ │  Blueprints     │ │
│ └─────────────────┘ │
└─────────────────────┘
```

---

## 11. Animation Timings

### Entrance Animations
```
Components enter with staggered delays:

Progress Bar 1:  ━━━━━━  (delay: 100ms, duration: 800ms)
Progress Bar 2:  ━━━━━━  (delay: 200ms, duration: 800ms)
Upgrade CTA:     ━━━━━━  (delay: 300ms, duration: 500ms)
Tips:            ━━━━━━  (delay: 400ms, duration: 300ms)
```

### Modal Animations
```
Backdrop:     Fade in     (200ms)
Modal:        Scale+Fade  (300ms) cubic-bezier(0.22, 1, 0.36, 1)
Icon:         Rotate+Spring (500ms)
Progress:     Width      (600ms) ease-out
Benefits:     Stagger    (50ms delay each)
```

### Hover Effects
```
Button:       translateY(-2px) + shadow   (200ms)
Card:         translateY(-2px) + glow     (300ms)
Badge:        scale(1.05)                 (200ms)
```

---

## 12. Accessibility Features

### Keyboard Navigation
```
Tab Order:
1. Close button (X)  ← Can close modal
2. Primary CTA       ← Main action
3. Secondary action  ← Alternative

ESC key: Closes modal immediately
Focus: Visible 2px ring with offset
Trapped: Cannot tab outside modal when open
```

### Screen Reader Announcements
```
Progress Bar:
"Blueprints created, 1 of 2, 50 percent used"

Modal:
"Dialog: Blueprint Creation Limit Reached"
"You've reached your limit of 2 blueprint creations..."

Button:
"Button: View Pricing Plans, opens pricing page"
```

### Touch Targets
```
Minimum size: 44x44px
All interactive elements:
  - Buttons
  - Close (X)
  - Links
  - Badges (when clickable)
```

---

## 13. Loading States

### UsageStatsDisplay Loading
```
┌─────────────────────────────────────────────────────────────┐
│  ████████████░░░░░░░░░░░░░  ← Animated skeleton            │
│  ████░░░░░░░░░░░░░░░░░░░░░                                  │
│                                                              │
│  ████████████████░░░░░░░░░                                  │
│  ████████████████░░░░░░░░░                                  │
│  ████████████████░░░░░░░░░                                  │
└─────────────────────────────────────────────────────────────┘
```

### CompactUsageDisplay Loading
```
┌──────────────────────┐
│ ████░░░░░░░░░░░░░░░  │
│ ████████░░░░░░░░░░░░ │
└──────────────────────┘
```

---

## 14. Error States

### UsageStatsDisplay Error
```
┌─────────────────────────────────────────────────────────────┐
│                         ⚠️                                  │
│         Failed to Load Usage Data                           │
│                                                              │
│         Unable to fetch usage statistics                    │
│                                                              │
│         [ Try Again ]                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary

This visual guide demonstrates:

✓ All component states (normal, loading, error, limit reached)
✓ Color coding system (green → cyan → amber → red)
✓ Responsive layouts (desktop, tablet, mobile)
✓ Animation timings and effects
✓ Accessibility features (keyboard, screen reader, touch)
✓ Interactive states (hover, active, disabled, loading)

All designs follow the existing Polaris brand aesthetic with:
- Glass morphism cards
- Gradient accents
- Smooth animations
- Professional color palette
- Accessible contrast ratios
