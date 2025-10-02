# Frontend Code Structure Guide

## Overview

This document describes the standardized frontend code structure following modern Next.js 15, React 19, and best practices.

## Directory Structure

```
frontend/
├── app/                          # Next.js App Router (unchanged)
│   ├── (auth)/                   # Route groups for auth
│   ├── (dashboard)/              # Route groups for dashboard
│   ├── api/                      # API routes
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
├── src/                          # Main source code
│   ├── components/               # All components (moved from root)
│   │   ├── ui/                   # Primitive UI components (shadcn/ui)
│   │   ├── features/             # Feature-specific components
│   │   │   ├── auth/             # Authentication components
│   │   │   ├── blueprint/        # Blueprint generation components
│   │   │   ├── dashboard/        # Dashboard components
│   │   │   ├── dynamic-form/     # Dynamic questionnaire components
│   │   │   ├── questionnaire/    # Questionnaire components
│   │   │   ├── wizard/           # Multi-step wizard components
│   │   │   ├── export/           # Export functionality components
│   │   │   ├── logs/             # Logging components
│   │   │   ├── resume/           # Resume functionality components
│   │   │   ├── theme/            # Theme components
│   │   │   ├── undo-redo/        # Undo/redo functionality
│   │   │   ├── conflict/         # Conflict resolution components
│   │   │   ├── error/            # Error boundary components
│   │   │   └── debug/            # Debug/development components
│   │   └── layouts/              # Layout components
│   ├── lib/                      # Business logic and utilities
│   │   ├── api/                  # API client functions
│   │   ├── auth/                 # Authentication utilities
│   │   ├── db/                   # Database utilities
│   │   ├── hooks/                # Custom React hooks
│   │   ├── services/             # Business logic services
│   │   ├── stores/               # State management (Zustand)
│   │   ├── utils/                # General utilities
│   │   └── constants/            # Application constants
│   ├── styles/                   # Styles and themes
│   │   ├── globals.css           # Global styles
│   │   └── themes/               # Theme definitions
│   ├── types/                    # TypeScript type definitions
│   └── config/                   # Configuration files
│       ├── constants.ts          # App constants
│       └── env.ts                # Environment configuration
├── public/                       # Static assets (unchanged)
├── tests/                        # Test organization (renamed from __tests__)
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   ├── e2e/                      # End-to-end tests
│   └── utils/                    # Test utilities
└── scripts/                      # Build and utility scripts
```

## Component Organization

### UI Components (`src/components/ui/`)

Primitive, reusable UI components based on shadcn/ui patterns:

- `button.tsx` - Button component
- `input.tsx` - Input field
- `card.tsx` - Card container
- `dialog.tsx` - Modal dialogs
- `dropdown.tsx` - Dropdown menus

### Feature Components (`src/components/features/`)

Domain-specific components organized by feature:

- **auth/** - Authentication (login, signup, password reset)
- **blueprint/** - Learning blueprint generation and management
- **dashboard/** - Main dashboard and analytics
- **dynamic-form/** - Dynamic questionnaire forms
- **questionnaire/** - Static questionnaire components
- **wizard/** - Multi-step wizard flows
- **export/** - Export functionality (PDF, Word, etc.)
- **logs/** - Logging and monitoring
- **resume/** - Resume generation
- **theme/** - Theme switching and styling
- **undo-redo/** - Undo/redo functionality
- **conflict/** - Conflict resolution dialogs
- **error/** - Error boundaries and fallbacks
- **debug/** - Development debugging tools

### Layout Components (`src/components/layouts/`)

Page layout components:

- `MainLayout.tsx` - Primary application layout
- `AuthLayout.tsx` - Authentication pages layout
- `DashboardLayout.tsx` - Dashboard layout

## Library Organization

### API Layer (`src/lib/api/`)

External API client functions and configurations.

### Authentication (`src/lib/auth/`)

Authentication utilities, guards, and session management.

### Database (`src/lib/db/`)

Database operations and Supabase client configuration.

### Hooks (`src/lib/hooks/`)

Custom React hooks for state management and side effects.

### Services (`src/lib/services/`)

Business logic services for core functionality.

### Stores (`src/lib/stores/`)

Zustand state management stores.

### Utilities (`src/lib/utils/`)

General utility functions and helpers.

### Constants (`src/lib/constants/`)

Application-wide constants and configuration.

## Type Definitions

All TypeScript types are centralized in `src/types/`:

- `supabase.ts` - Database type definitions
- `dashboard.ts` - Dashboard-specific types
- `static-questionnaire.ts` - Questionnaire types

## Testing Structure

Tests are organized by type and feature:

- **unit/** - Unit tests for individual functions/components
- **integration/** - Integration tests for feature interactions
- **e2e/** - End-to-end user journey tests
- **utils/** - Test utilities and helpers

## Import Patterns

### Component Imports

```typescript
// UI Components
import { Button } from '@/src/components/ui/button';
import { Card } from '@/src/components/ui/card';

// Feature Components
import { BlueprintCard } from '@/src/components/features/blueprint/BlueprintCard';
import { AuthForm } from '@/src/components/features/auth/AuthForm';
```

### Utility Imports

```typescript
// Services
import { AuthService } from '@/src/lib/services/authService';
import { BlueprintService } from '@/src/lib/services/blueprintService';

// Hooks
import { useAuth } from '@/src/lib/hooks/useAuth';
import { useBlueprint } from '@/src/lib/hooks/useBlueprint';

// Stores
import { useAuthStore } from '@/src/lib/stores/authStore';
import { useBlueprintStore } from '@/src/lib/stores/blueprintStore';
```

### Type Imports

```typescript
import type { User } from '@/src/types/supabase';
import type { BlueprintData } from '@/src/types/dashboard';
```

## Development Guidelines

### Component Development

1. **Feature-based organization** - Group related components by feature
2. **Single responsibility** - Each component should have one clear purpose
3. **Type safety** - Use TypeScript interfaces for all props
4. **Accessibility** - Follow ARIA guidelines and semantic HTML
5. **Responsive design** - Use Tailwind responsive utilities

### State Management

1. **Local state** - Use React useState for component-specific state
2. **Global state** - Use Zustand stores for application-wide state
3. **Server state** - Use React Query for server data fetching
4. **Form state** - Use React Hook Form for complex forms

### Code Quality

1. **ESLint** - Follow configured rules and formatting
2. **Prettier** - Consistent code formatting
3. **TypeScript** - Strict type checking enabled
4. **Import organization** - Group imports by external/internal, alphabetical

## Migration Notes

This structure was implemented as part of Task #28 "Standardize Frontend Code Structure". The migration involved:

- Moving components from root-level organization to feature-based
- Consolidating utilities into organized lib structure
- Standardizing import paths and aliases
- Updating test organization
- Maintaining backward compatibility where possible

For questions about this structure, refer to the implementation plan in `STRUCTURE_PLAN.md`.
