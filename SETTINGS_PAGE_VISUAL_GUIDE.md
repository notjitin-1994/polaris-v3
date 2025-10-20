# Settings Page Visual Guide

## Page Layout

```
┌─────────────────────────────────────────────────────────────────────┐
│  HEADER                                                              │
│  ← Back to Dashboard                                                │
│  [Icon] Settings                                                     │
│  Manage your account settings and preferences                       │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────────────────────────────────────────────┐
│ SIDEBAR NAV  │ MAIN CONTENT                                         │
│              │                                                      │
│ [●] Profile  │ ┌──────────────────────────────────────────────┐   │
│ [ ] Account  │ │ Profile Information                          │   │
│ [ ] Prefs    │ │ Update your personal details...              │   │
│ [ ] Notifs   │ ├──────────────────────────────────────────────┤   │
│ [ ] Security │ │ [Avatar Upload]                              │   │
│              │ │ First Name: [________] Last Name: [________] │   │
│              │ │ Email: user@example.com (read-only)          │   │
│              │ │ Bio: [_________________________________]      │   │
│              │ │                                              │   │
│              │ │                    [Save Changes] Button     │   │
│              │ └──────────────────────────────────────────────┘   │
│              │                                                      │
│              │ ┌──────────────────────────────────────────────┐   │
│              │ │ Email Address                                │   │
│              │ │ Manage your account email...                 │   │
│              │ └──────────────────────────────────────────────┘   │
└──────────────┴──────────────────────────────────────────────────────┘
```

## Component Showcase

### 1. Toggle Switch Component

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Setting Name                              [● OFF]     │
│  Description of what this setting does                 │
│                                                         │
└─────────────────────────────────────────────────────────┘

ENABLED STATE:
┌─────────────────────────────────────────────────────────┐
│                                                         │
│  Setting Name                              [━━━━━●]     │
│  Description of what this setting does      ↑ Glow     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Visual Details**:
- 44x44px touch target area (invisible, centers the visual switch)
- Visual switch: 44px wide × 24px high
- Thumb: 20px circle
- Colors:
  - OFF: Neutral gray (#475569)
  - ON: Teal gradient (#a7dadb → #d0edf0) with subtle glow
- Animations: 300ms smooth slide

### 2. Setting Card

```
┌───────────────────────────────────────────────────────────────┐
│ Glass Card with Gradient Border                               │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │
│ ┃ Section Title                                             ┃ │
│ ┃ Section description text                                  ┃ │
│ ┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫ │
│ ┃                                                           ┃ │
│ ┃ Setting Row 1                                    [Toggle] ┃ │
│ ┃ ─────────────────────────────────────────────────────────┃ │
│ ┃ Setting Row 2                                    [Toggle] ┃ │
│ ┃ ─────────────────────────────────────────────────────────┃ │
│ ┃ Setting Row 3                                    [Toggle] ┃ │
│ ┃                                                           ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└───────────────────────────────────────────────────────────────┘
```

**Visual Properties**:
- Background: rgba(13, 27, 42, 0.55) with 18px blur
- Border: Gradient (rgba(255,255,255,0.22) → rgba(255,255,255,0.06))
- Border radius: 16px (2rem)
- Padding: 24px mobile, 32px desktop
- Shadow: 0 8px 40px rgba(0,0,0,0.4) + inset highlight
- Hover: Lift 2px, enhanced shadow with teal glow

### 3. Theme Selection Cards

```
┌──────────┬──────────┬──────────┐
│  ☀️ SUN  │  🌙 MOON │  💻 PC   │
│          │          │          │
│  Light   │  Dark ✓  │  System  │
└──────────┴──────────┴──────────┘
        SELECTED ────┘
```

**Selected State**:
- Border: 2px solid teal (#a7dadb)
- Background: Teal/10% opacity
- Indicator: Pulsing dot in top-right
- Icon: Colored teal
- Shadow: Subtle glow

**Unselected State**:
- Border: 1px neutral
- Background: Surface color
- Icon: Muted gray
- No shadow

### 4. Password Strength Meter

```
┌──────────────────────────────────────────────────┐
│ New Password: [******************]        [👁️]   │
│                                                  │
│ Password strength              Strong            │
│ ████████████████████████████░░ 90%              │
│                                                  │
│ Password requirements:                           │
│ ✅ At least 8 characters                        │
│ ✅ Mix of uppercase and lowercase               │
│ ✅ At least one number                          │
│ ✅ At least one special character               │
└──────────────────────────────────────────────────┘
```

**Strength Colors**:
- 0-24%: Red (Weak)
- 25-49%: Orange (Fair)
- 50-74%: Blue (Good)
- 75-100%: Green (Strong)

### 5. Navigation (Desktop)

```
┌──────────────────────┐
│ ▌[👤] Profile        │ ← Active (teal bar)
│  [💳] Account        │
│  [🎨] Preferences    │
│  [🔔] Notifications  │
│  [🔒] Security       │
└──────────────────────┘
```

**Active State**:
- Left border: 4px teal bar (animated)
- Background: Teal/10%
- Text: Teal color
- Icon: Teal color

**Inactive State**:
- No border
- Background: Transparent
- Text: Gray (#b0c5c6)
- Icon: Light gray

**Hover State**:
- Background: Teal/5%
- Text: Lighter gray
- Smooth transition

### 6. Navigation (Mobile)

```
← [👤 Profile] [💳 Account] [🎨 Prefs] [🔔 Notifs] [🔒 Security] →
  ──────────
   Active
```

Horizontal scrolling list with:
- Min width per item: Fit content
- Padding: 16px
- Active underline: 2px teal
- Smooth scroll behavior

## Color Palette Used

### Brand Colors
```
Primary (Teal):
  ██ #a7dadb  - Primary accent
  ██ #d0edf0  - Primary light
  ██ #7bc5c7  - Primary dark

Secondary (Indigo):
  ██ #4f46e5  - Secondary accent
  ██ #7c69f5  - Secondary light
  ██ #3730a3  - Secondary dark
```

### Background Colors
```
Dark Theme:
  ██ #020c1b  - Background dark
  ██ #0d1b2a  - Background paper
  ██ #142433  - Background surface
```

### Text Colors
```
  ██ #e0e0e0  - Text primary (high contrast)
  ██ #b0c5c6  - Text secondary (medium contrast)
  ██ #7a8a8b  - Text disabled (low contrast)
```

### Semantic Colors
```
  ██ #10b981  - Success (green)
  ██ #f59e0b  - Warning (orange)
  ██ #ef4444  - Error (red)
  ██ #3b82f6  - Info (blue)
```

## Animation Showcase

### 1. Page Load Sequence
```
Time: 0ms → 300ms
┌────────────────────────────────────┐
│ Header:     [fade in + slide up]  │  ← 0ms delay
│ Sidebar:    [fade in + slide left]│  ← 100ms delay
│ Content:    [fade in + slide up]  │  ← 200ms delay
│   Card 1:   [fade in + slide up]  │  ← 0ms within
│   Card 2:   [fade in + slide up]  │  ← 150ms within
│   Card 3:   [fade in + slide up]  │  ← 300ms within
└────────────────────────────────────┘
```

### 2. Toggle Animation
```
State Change (300ms cubic-bezier)
OFF:  [●─────────]
      ↓ 150ms
MID:  [──●───────]
      ↓ 150ms
ON:   [──────────●] + glow effect
```

### 3. Card Hover
```
Default:     [Card] no shadow
             ↓ 200ms
Hover:       [Card] ← lift 2px + enhanced shadow + glow
             ↓ 200ms
Default:     [Card] returns smoothly
```

### 4. Active Section Indicator (Framer Motion)
```
Profile    [▌    ] ← Blue bar slides down
  ↓
Account    [    ▌] ← Smooth spring animation
  ↓
Prefs      [    ▌] ← layoutId="activeSection"
```

## Responsive Breakpoints

### Mobile (<640px)
```
┌──────────────────────────────────┐
│ ← Back                           │
│ [Icon] Settings                  │
│                                  │
│ ← [Profile] [Account] [More] →  │ ← Horizontal scroll
│                                  │
│ ┌────────────────────────────┐  │
│ │ Profile Information         │  │
│ │                             │  │
│ │ [Full-width Avatar]         │  │
│ │ First Name: [__________]    │  │
│ │ Last Name:  [__________]    │  │
│ │ Email:      [__________]    │  │
│ │                             │  │
│ │ [Full-width Save Button]    │  │
│ └────────────────────────────┘  │
└──────────────────────────────────┘
```

### Tablet (640px-1024px)
```
┌─────────────────────────────────────────────┐
│ ← Back to Dashboard                         │
│ [Icon] Settings                             │
│                                             │
│ ← [Profile] [Account] [Prefs] [More] →     │
│                                             │
│ ┌─────────────────────────────────────────┐ │
│ │ Profile Information                     │ │
│ │                                         │ │
│ │ [Avatar]  First: [____] Last: [____]   │ │
│ │           Email: [__________________]  │ │
│ │                                         │ │
│ │                     [Save Button]       │ │
│ └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

### Desktop (>1024px)
```
┌───────────────────────────────────────────────────────────┐
│ ← Back to Dashboard                                       │
│ [Icon] Settings                                           │
│ Manage your account settings and preferences              │
│                                                           │
│ ┌─────────┬───────────────────────────────────────────┐  │
│ │ Sidebar │ Main Content                              │  │
│ │         │                                           │  │
│ │ Profile │ ┌───────────────────────────────────────┐ │  │
│ │ Account │ │ Profile Information                   │ │  │
│ │ Prefs   │ │                                       │ │  │
│ │ Notifs  │ │ [Avatar] Name Fields                  │ │  │
│ │ Security│ │          Email Field                  │ │  │
│ │         │ │                                       │ │  │
│ │ (Sticky)│ │              [Save Button]            │ │  │
│ │         │ └───────────────────────────────────────┘ │  │
│ └─────────┴───────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────┘
```

## Special UI Elements

### 1. Badge Component
```
Setting Name [PRO] ← Small badge
             ──────
             Teal bg, rounded, 8px padding
```

### 2. Info Boxes
```
┌──────────────────────────────────────────────┐
│ ℹ️ Info message with blue background         │
│   Additional context or helpful information  │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ ⚠️ Warning message with orange background    │
│   Important notice that needs attention      │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ 🔒 Success message with green background     │
│   Confirmation of successful action          │
└──────────────────────────────────────────────┘
```

### 3. Danger Zone
```
┌──────────────────────────────────────────────────┐
│ ⚠️ Danger Zone                                   │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓  │
│ ┃ RED BORDER & RED ACCENT                     ┃  │
│ ┃                                             ┃  │
│ ┃ ⚠️ Delete Account                           ┃  │
│ ┃ Once you delete your account, there is no  ┃  │
│ ┃ going back. All data will be lost.         ┃  │
│ ┃                                             ┃  │
│ ┃ [Delete My Account] ← Red button           ┃  │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛  │
└──────────────────────────────────────────────────┘
```

### 4. Active Sessions
```
┌────────────────────────────────────────────────┐
│ 📱 Chrome on MacOS                   [Current] │
│    San Francisco, CA                           │
│    🕐 Last active 2 minutes ago                │
└────────────────────────────────────────────────┘

┌────────────────────────────────────────────────┐
│ 📱 Safari on iPhone              [Revoke] Btn  │
│    San Francisco, CA                           │
│    🕐 Last active 2 hours ago                  │
└────────────────────────────────────────────────┘
```

## Interaction States

### Button States
```
DEFAULT:   [Button Text]
           ↓ 100ms
HOVER:     [Button Text] ← Lift 2px, enhanced shadow
           ↓
ACTIVE:    [Button Text] ← Scale 0.98, pressed shadow
           ↓
DISABLED:  [Button Text] ← 40% opacity, no pointer
```

### Input States
```
DEFAULT:   [___________]  Gray border
           ↓
HOVER:     [___________]  Lighter border
           ↓
FOCUS:     [___________]  Teal border + ring
           ↓ on blur
DEFAULT:   [___________]  Returns to gray
```

### Card States
```
DEFAULT:   Standard glass effect
           ↓ 200ms
HOVER:     Enhanced glass + glow + lift
           ↓ 200ms
DEFAULT:   Smooth return
```

## Accessibility Indicators

### Focus Visible
```
[Focused Element]
└─────────────────┘
  ↑
  2px teal ring with 2px offset
```

### Disabled State
```
[Disabled Element] ← 50% opacity + no-drop cursor
```

### Loading State
```
[●──] Saving... ← Spinner + text
```

## Typography Hierarchy

```
Display (32px, Bold):     Settings Page Title
                          ↓
Title (24px, Semibold):   Section Card Titles
                          ↓
Heading (20px, Semibold): Subsection Headers
                          ↓
Body (16px, Regular):     Setting Labels
                          ↓
Caption (14px, Regular):  Descriptions, Helper Text
                          ↓
Small (12px, Regular):    Badges, Metadata
```

## Summary

This visual guide demonstrates:
- Clean, modern interface design
- Consistent spacing and alignment
- Thoughtful use of color and contrast
- Smooth, purposeful animations
- Clear visual hierarchy
- Intuitive interaction patterns
- Professional polish throughout

The design balances aesthetics with usability, creating an interface that feels premium while remaining highly functional and accessible.
