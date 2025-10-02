# Frontend Code Structure Standardization Plan

## Current State Analysis

The current frontend structure has evolved organically and shows signs of multiple organizational approaches:

### Current Structure Issues:
- Mixed organizational patterns (feature-based vs type-based)
- Duplicate component locations (`components/` vs `src/components/`)
- Inconsistent naming conventions
- Mixed use of `lib/` vs `store/` for utilities
- App Router structure mixed with legacy patterns

### Current Structure:
```
frontend/
├── app/                    # Next.js App Router (✅ Good)
├── components/             # Feature-organized components (✅ Good)
├── src/                    # Additional components (❌ Confusing)
├── lib/                    # Utilities and services (✅ Good)
├── store/                  # Zustand stores (✅ Good)
├── contexts/               # React contexts (✅ Good)
├── hooks/                  # Custom hooks (✅ Good)
├── types/                  # TypeScript types (✅ Good)
└── __tests__/             # Test organization (✅ Good)
```

## Proposed Standardized Structure

Following Next.js 15, React 19, and modern best practices:

### New Structure:
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
│   │   │   ├── questionnaire/    # Dynamic questionnaire components
│   │   │   └── wizard/           # Multi-step wizard components
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

## Migration Strategy

### Phase 1: Planning and Analysis
1. **Document current structure** with file counts and dependencies
2. **Identify breaking changes** and impact assessment
3. **Create migration scripts** for automated moves
4. **Plan rollback strategy** in case of issues

### Phase 2: Structural Changes
1. **Move `components/` to `src/components/`** (main location)
2. **Consolidate `src/` contents** into organized structure
3. **Move `lib/` contents** to `src/lib/` subdirectories
4. **Move `store/` to `src/lib/stores/`**
5. **Move `contexts/` to `src/lib/`**
6. **Move `hooks/` to `src/lib/hooks/`**
7. **Move `types/` to `src/types/`**
8. **Rename `__tests__/` to `tests/`**

### Phase 3: Import Path Updates
1. **Update all import statements** to reflect new paths
2. **Update Next.js configuration** for new paths
3. **Update TypeScript configuration** for path mapping
4. **Update ESLint configuration** for new structure

### Phase 4: Validation and Testing
1. **Run TypeScript compiler** to check for errors
2. **Run ESLint** to check for issues
3. **Run test suite** to ensure functionality
4. **Test build process** for production readiness

## Benefits of New Structure

### Developer Experience
- **Clear separation of concerns** between UI, business logic, and configuration
- **Consistent naming conventions** across the codebase
- **Better IDE support** with organized file structure
- **Easier onboarding** for new developers

### Maintainability
- **Feature-based organization** makes it easy to find related code
- **Centralized utilities** and services
- **Clear boundaries** between different types of code
- **Easier refactoring** and code movement

### Performance and Bundle Size
- **Better tree-shaking** opportunities
- **Clearer dependency boundaries**
- **More efficient imports** with organized structure

### Testing
- **Organized test structure** by type and feature
- **Easier test discovery** and maintenance
- **Better test isolation** by feature boundaries

## Implementation Notes

### Import Path Examples (Before → After):
```typescript
// Before
import { Button } from '@/components/ui/button'
import { AuthService } from '@/lib/auth/service'
import { useAuth } from '@/hooks/useAuth'

// After
import { Button } from '@/src/components/ui/button'
import { AuthService } from '@/src/lib/auth/service'
import { useAuth } from '@/src/lib/hooks/useAuth'
```

### Special Considerations:
- **Gradual migration** to avoid breaking changes
- **Alias updates** in tsconfig.json and next.config.js
- **Component library compatibility** (shadcn/ui, etc.)
- **Testing framework compatibility** (Vitest, etc.)

### Rollback Plan:
- Keep backup of original structure
- Implement migration scripts that can be reversed
- Test thoroughly before final migration
- Have hotfix process ready if issues arise
