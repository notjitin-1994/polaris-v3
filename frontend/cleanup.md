# Product Requirements Document: SmartSlate Polaris Codebase Cleanup and Reorganization

<context>
# Overview

SmartSlate Polaris v3 is an AI-powered learning platform that generates personalized learning blueprints and dynamic questionnaires. The codebase has accumulated significant technical debt during rapid development, creating a maintenance nightmare that threatens future development velocity and platform stability.

**The Problem:**

- **Three redundant frontend applications** consuming resources and causing confusion (759 total files across duplicate apps)
- **78+ markdown files scattered in root directory** making documentation discovery impossible
- **Exposed SSH keys and credentials** creating critical security vulnerabilities
- **Inconsistent architecture** preventing efficient feature development and onboarding
- **Unclear production configuration** risking deployment failures

**Who This Affects:**

- Development team struggling with codebase navigation and maintenance
- New engineers facing 2-3 day onboarding due to complexity
- Product managers unable to locate feature documentation
- Security team concerned about exposed credentials
- Business stakeholders experiencing slower feature delivery

**Why This Matters:**
This cleanup transforms the codebase from a liability into an asset. By consolidating to a single application, organizing documentation, and securing credentials, we enable:

- 50% faster feature development cycles
- Same-day developer onboarding
- Zero security incidents from exposed secrets
- Clear path for scaling the platform
- Professional codebase worthy of the product vision

# Core Features

## Feature 1: Application Consolidation

**What It Does:**
Reduces three separate frontend applications (`frontend/` Next.js, `smartslate-app/` Vite, `frontend/smartslate-polaris/` nested Vite) down to a single production Next.js application.

**Why It's Important:**

- Eliminates confusion about which codebase is production
- Removes 209+ unused files (27% codebase reduction)
- Simplifies deployment pipeline to single target
- Reduces build times by eliminating redundant configurations
- Makes code review and testing straightforward

**How It Works:**

1. Audit dependencies across all three applications to identify truly unique code
2. Preserve any unique components from unused apps by migrating to main frontend
3. Archive `smartslate-app/` and `frontend/smartslate-polaris/` to separate repository
4. Consolidate package.json, tsconfig.json, and build configurations
5. Verify Vercel deployment points to correct application
6. Validate all production features work post-consolidation

## Feature 2: Documentation Organization System

**What It Does:**
Transforms 78+ scattered markdown files into a hierarchical, discoverable documentation system with clear categorization and navigation.

**Why It's Important:**

- Engineers can find any document within 30 seconds vs. 10+ minutes currently
- New team members understand system architecture without tribal knowledge
- Product decisions are documented and traceable
- Historical context is preserved but archived appropriately
- Reduces repeated questions and duplicate documentation

**How It Works:**

```
docs/
├── prds/                      # Product requirements (active planning)
├── implementation-notes/      # Feature development logs
│   ├── feature-implementations/
│   ├── bug-fixes/
│   └── refactoring/
├── architecture/              # System design documents
├── guides/                    # User-facing documentation
└── archived/                  # Historical/deprecated docs
```

Each directory includes:

- README.md with directory purpose and file index
- Naming convention: `YYYY-MM-description.md` for dated docs
- "Last Updated" and "Status" metadata in each file
- Cross-references using relative links

## Feature 3: Security Remediation

**What It Does:**
Removes all exposed credentials from repository and Git history, implements secrets management, and establishes security guardrails to prevent future incidents.

**Why It's Important:**

- Critical: SSH keys currently exposed in public/private repositories
- Prevents unauthorized access to production infrastructure
- Establishes compliance with security best practices
- Protects user data and platform integrity
- Enables security audits and certifications

**How It Works:**

1. **Immediate Removal:**
   - Delete `ssh_keys/` directory
   - Scan entire codebase for hardcoded secrets using `truffleHog`
   - Remove secrets from Git history using `git filter-branch`
   - Force push to all branches

2. **Secrets Management:**
   - Implement `.env.local` for local development (gitignored)
   - Use Vercel environment variables for production
   - Create `.env.example` template for required variables
   - Document secret rotation procedures

3. **Prevention:**
   - Add `git-secrets` pre-commit hooks
   - Update `.gitignore` with comprehensive secret patterns
   - Implement automated secret scanning in CI/CD
   - Train team on secure credential handling

## Feature 4: Code Structure Standardization

**What It Does:**
Establishes consistent folder structure, naming conventions, and organization patterns within the consolidated frontend application.

**Why It's Important:**

- Enables developers to locate files predictably (components, utilities, types)
- Facilitates code reuse and reduces duplication
- Makes testing strategy clear and comprehensive
- Supports scalability as application grows
- Reduces cognitive load during development

**How It Works:**

```
frontend/
├── src/
│   ├── app/                   # Next.js app router (pages)
│   ├── components/            # Reusable UI components
│   │   ├── ui/                # Base primitives (buttons, inputs)
│   │   ├── features/          # Feature-specific (blueprint, questionnaire)
│   │   └── layouts/           # Page layouts
│   ├── lib/                   # Business logic and utilities
│   │   ├── api/               # API clients and endpoints
│   │   ├── hooks/             # Custom React hooks
│   │   ├── utils/             # Helper functions
│   │   └── constants/         # App-wide constants
│   ├── types/                 # TypeScript definitions
│   ├── styles/                # Global styles
│   └── config/                # App configuration
├── tests/                     # All test files
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── utils/
├── public/                    # Static assets
└── docs/                      # Component/API documentation
```

# User Experience

## User Personas

### Persona 1: Senior Engineer (Sarah)

**Background:**

- 5+ years experience, joined team 6 months ago
- Responsible for architecture decisions and code reviews
- Frustrated by codebase complexity

**Goals:**

- Review PRs efficiently without hunting for context
- Make confident architectural decisions with clear documentation
- Onboard new team members quickly

**Pain Points:**

- Spends 30% of time navigating between duplicate apps
- Can't find historical decision documentation
- Worried about security implications of exposed keys

**Success Metrics:**

- Code review time reduced by 40%
- Can locate any document in under 1 minute
- Confident in security posture

### Persona 2: Junior Developer (Mike)

**Background:**

- 1 year experience, joining team next week
- Eager to contribute but overwhelmed by complexity
- Needs clear guidance on where things live

**Goals:**

- Get development environment running on day 1
- Understand which application is production
- Make first code contribution within week 1

**Pain Points:**

- Confusion about which of 3 apps to work in
- Can't find setup documentation
- Afraid of breaking production due to unclear structure

**Success Metrics:**

- Completes setup in under 2 hours
- Makes first PR by day 3
- Understands architecture by end of week 1

### Persona 3: Product Manager (Alex)

**Background:**

- Non-technical, responsible for feature roadmap
- Needs to reference PRDs and implementation notes
- Frustrated by inability to find documentation

**Goals:**

- Quickly reference feature specifications during planning
- Understand what's been built and what's pending
- Track implementation progress

**Pain Points:**

- Can't find PRDs among 78 scattered files
- Doesn't know if documentation is current or outdated
- Wastes time asking engineers for information that should be documented

**Success Metrics:**

- Can find any PRD in under 30 seconds
- Understands feature status from documentation
- Reduced Slack questions by 60%

## Key User Flows

### Flow 1: New Developer Onboarding

**Current State (Problematic):**

1. Clone repository, see 78 files in root → confusion
2. Find three separate applications → "Which one do I use?"
3. Try to run `smartslate-app/` → fails, not configured
4. Ask team → "Oh, use `frontend/`, ignore the others"
5. Find SSH keys in repo → security concern
6. Spend 2-3 days understanding structure
7. Still uncertain about architecture decisions

**Future State (Post-Cleanup):**

1. Clone repository, see clean structure with `README.md`
2. Read `docs/guides/developer-setup.md` → clear instructions
3. Run `npm install && npm run dev` in `frontend/` → works immediately
4. Explore `docs/architecture/` → understand system design
5. Review `docs/prds/` → understand feature roadmap
6. Make first contribution on day 2
7. Confident in codebase by end of week 1

### Flow 2: Feature Development

**Current State (Problematic):**

1. Receive feature request
2. Search for existing PRD → can't find it among 78 files
3. Ask PM for specs → wait for response
4. Start coding in `frontend/` but unsure if complete app
5. Notice similar code in `frontend/smartslate-polaris/` → confusion
6. Spend time investigating if other app is being used
7. Review takes longer due to unclear context

**Future State (Post-Cleanup):**

1. Receive feature request
2. Find PRD instantly in `docs/prds/[feature-name].md`
3. Review architecture docs in `docs/architecture/`
4. Code in `frontend/src/components/features/` using clear structure
5. Write tests in `tests/unit/` and `tests/integration/`
6. Log implementation in `docs/implementation-notes/feature-implementations/`
7. PR reviewed quickly with clear context

### Flow 3: Security Incident Response

**Current State (Problematic):**

1. Security audit discovers exposed SSH keys
2. Panic → keys are in Git history
3. Need to rotate all keys and remove from history
4. Unsure what other secrets might be exposed
5. No documented procedure for secret rotation
6. Risk of repeat incidents due to no prevention measures

**Future State (Post-Cleanup):**

1. Pre-commit hooks prevent secret commits
2. Regular automated scans find no issues
3. All secrets properly stored in Vercel environment
4. `.env.example` documents required variables
5. Security incident response plan documented
6. Team trained on secure credential handling

## UI/UX Considerations

**Developer Experience (DX) as Primary UI:**
This is a codebase cleanup project, so the "UI" is the developer experience of working with the code.

**Navigation & Discoverability:**

- Clear folder hierarchy that matches mental models
- README files at every level explaining contents
- Consistent naming conventions (kebab-case for files, PascalCase for components)
- Index files (`index.ts`) for clean imports

**Feedback & Validation:**

- Pre-commit hooks provide immediate feedback on security issues
- Build errors clearly indicate which application/file has issues
- Test output organized by type (unit, integration, e2e)
- Documentation includes "Last Updated" for freshness confidence

**Consistency & Standards:**

- Single source of truth for all configuration
- Conventional commit messages for clear history
- Standardized component structure using established patterns
- TypeScript types defined in centralized `types/` directory

**Error Prevention:**

- Git hooks prevent committing secrets
- TypeScript catches type errors before runtime
- Clear separation prevents accidental changes to wrong app
- Archived apps stored separately to prevent confusion
  </context>

<PRD>
# Technical Architecture

## System Components

### Frontend Application (Production)

**Technology Stack:**

- Next.js 14.x with App Router
- React 18.x
- TypeScript 5.x
- Tailwind CSS for styling
- Shadcn/ui component library

**Current State:**

```
frontend/ (550+ files)
├── app/                    # Next.js pages (production)
├── components/             # React components (production)
├── lib/                    # Utilities (production)
└── smartslate-polaris/     # DUPLICATE nested app (133 files) - REMOVE
```

**Target State:**

```
frontend/
├── src/
│   ├── app/                # Next.js app router pages
│   ├── components/
│   │   ├── ui/             # Shadcn components (button, card, input, etc.)
│   │   ├── features/       # Feature-specific components
│   │   │   ├── blueprint/  # Blueprint generation UI
│   │   │   └── questionnaire/  # Questionnaire UI
│   │   └── layouts/        # Page layouts (MainLayout, AuthLayout)
│   ├── lib/
│   │   ├── api/            # API client functions
│   │   │   ├── claude.ts   # Claude API integration
│   │   │   └── perplexity.ts  # Perplexity API integration
│   │   ├── hooks/          # Custom React hooks
│   │   ├── utils/          # Helper functions
│   │   └── constants/      # App-wide constants
│   ├── types/              # TypeScript definitions
│   │   ├── blueprint.ts
│   │   ├── questionnaire.ts
│   │   └── user.ts
│   ├── styles/             # Global styles
│   └── config/             # App configuration
├── tests/
│   ├── unit/               # Component & function tests
│   ├── integration/        # Feature integration tests
│   ├── e2e/                # End-to-end tests
│   └── utils/              # Test helpers
├── public/                 # Static assets (images, fonts)
├── docs/                   # Component documentation
└── [config files]          # package.json, tsconfig.json, etc.
```

### Backend Application

**Technology Stack:**

- Python 3.11+
- FastAPI framework
- PostgreSQL database
- Redis for caching

**Structure:**

```
backend/
├── app/
│   ├── api/                # API routes
│   ├── models/             # Database models
│   ├── services/           # Business logic
│   └── core/               # Configuration
├── tests/
├── docs/
└── scripts/
```

### Applications to Remove

**1. smartslate-app/ (76 files)**

- Vite-based React application
- Never deployed to production
- Not referenced by main frontend
- No unique functionality
- **Action:** Archive to separate repository, then delete

**2. frontend/smartslate-polaris/ (133 files)**

- Nested Vite application inside production frontend
- Duplicate of features in parent frontend
- Causes confusion and maintenance burden
- **Action:** Extract any unique components, then delete

## Data Models

### Documentation Organization Schema

```typescript
interface DocumentMetadata {
  title: string;
  type: 'prd' | 'implementation' | 'architecture' | 'guide' | 'archived';
  status: 'active' | 'draft' | 'superseded' | 'archived';
  created: Date;
  lastUpdated: Date;
  author: string;
  supersededBy?: string; // Link to newer document
  relatedDocs: string[]; // Links to related documentation
}

interface DocumentStructure {
  path: string; // e.g., 'docs/prds/blueprint-generation.md'
  category: DocumentCategory;
  subcategory?: string; // e.g., 'feature-implementations'
  tags: string[]; // e.g., ['ai', 'claude', 'backend']
}

type DocumentCategory = 'prds' | 'implementation-notes' | 'architecture' | 'guides' | 'archived';
```

### Codebase Inventory Schema

```typescript
interface ApplicationInventory {
  name: string;
  path: string;
  fileCount: number;
  framework: string;
  deployed: boolean;
  productionUse: boolean;
  dependencies: string[];
  uniqueComponents: Component[];
  action: 'keep' | 'remove' | 'merge';
}

interface Component {
  name: string;
  path: string;
  usedBy: string[]; // Which apps import this
  isUnique: boolean; // Only exists in this app
  shouldMigrate: boolean; // Move to production app
}
```

## APIs and Integrations

### Deployment Pipeline

**Vercel Configuration:**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "frontend/.next",
  "framework": "nextjs",
  "installCommand": "npm install",
  "devCommand": "npm run dev"
}
```

**Verification Points:**

- Build completes without errors
- All routes accessible
- API integrations functional (Claude, Perplexity)
- Environment variables properly loaded
- Static assets served correctly

### Git Repository Structure

```
.github/
├── workflows/
│   ├── ci.yml              # Run tests on PR
│   ├── security-scan.yml   # Automated secret scanning
│   └── deploy.yml          # Deployment automation
└── CODEOWNERS              # Code ownership
```

### Secret Management

**Environment Variables (Never Committed):**

```bash
# .env.local (gitignored)
CLAUDE_API_KEY=sk-...
PERPLEXITY_API_KEY=pplx-...
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
```

**Template for Setup:**

```bash
# .env.example (committed)
CLAUDE_API_KEY=your_claude_api_key_here
PERPLEXITY_API_KEY=your_perplexity_api_key_here
DATABASE_URL=your_database_url_here
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
```

## Infrastructure Requirements

### Development Environment

- Node.js 18.x or higher
- npm 9.x or higher
- Git 2.x
- Code editor with TypeScript support

### Git Configuration

```bash
# Install git-secrets for preventing credential commits
git secrets --install
git secrets --register-aws
git secrets --add 'sk-[a-zA-Z0-9]{32,}'  # Claude API keys
git secrets --add 'pplx-[a-zA-Z0-9]{32,}'  # Perplexity API keys
```

### Repository Hygiene

```gitignore
# Secrets
.env
.env.local
.env.*.local
*.pem
*.key
ssh_keys/
secrets/

# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/
.nyc_output/

# Next.js
.next/
out/

# Production
build/
dist/

# Misc
.DS_Store
*.log
```

# Development Roadmap

## Phase 0: Foundation and Safety (Critical Pre-Work)

**Scope:** Establish safety nets before making any destructive changes

### 0.1: Repository Backup and Branching Strategy

- Create comprehensive backup of current repository state
- Tag current main branch: `v3-pre-cleanup`
- Create long-lived cleanup branch: `cleanup/consolidation`
- Set up rollback procedures and document commands
- Archive current repository to external location (GitHub backup, local clone)

### 0.2: Comprehensive Dependency Audit

**Build a complete map of the codebase before changing anything:**

- Scan all import statements across three applications
- Create dependency graph showing which files import from where
- Identify all components in `smartslate-app/` and their usage
- Identify all components in `frontend/smartslate-polaris/` and their usage
- List components that exist in multiple apps (duplicates)
- Document any unique functionality in apps marked for removal

**Deliverables:**

- `dependency-audit.md` document with full import/export mapping
- Spreadsheet listing all components with usage counts
- Visual dependency graph (using Mermaid or similar)
- Confirmation: Zero production imports from apps marked for removal

### 0.3: Security Scan and Credential Inventory

- Run `truffleHog` or `git-secrets` across entire repository
- Manual review of all files in `ssh_keys/` directory
- Scan `.env*` files for hardcoded secrets
- Check all configuration files for embedded credentials
- Search codebase for patterns: `password`, `secret`, `key`, `token`, `api_key`
- Document all secrets found and their rotation requirements

**Deliverables:**

- `security-audit.md` with all findings
- List of credentials requiring immediate rotation
- Plan for removing secrets from Git history

## Phase 1: Critical Security Remediation (Immediate, Non-Negotiable)

**Scope:** Remove all exposed credentials and establish security foundation

### 1.1: Remove Exposed Credentials from Repository

**This must happen immediately before any other work:**

- Remove `ssh_keys/` directory from working tree
- Commit removal with clear message
- Remove from Git history using `git filter-branch` or `BFG Repo-Cleaner`
- Force push to all branches (coordinate with team)
- Rotate all exposed SSH keys immediately
- Scan for any other exposed secrets and remove similarly

**Acceptance Criteria:**

- `ssh_keys/` directory does not exist in any branch
- `ssh_keys/` removed from entire Git history
- All SSH keys rotated and old keys invalidated
- Security scan shows zero exposed credentials

### 1.2: Implement Secrets Management

- Create `.env.example` template with all required variables
- Document each environment variable's purpose
- Update `.gitignore` to exclude all secret patterns
- Configure Vercel environment variables for production
- Set up GitHub Secrets for CI/CD
- Document secret rotation procedures in `docs/guides/security.md`

### 1.3: Install Security Prevention Tools

- Install `git-secrets` and configure patterns
- Add pre-commit hooks to prevent future secret commits
- Set up automated secret scanning in GitHub Actions
- Configure Vercel to fail builds if secrets detected in code
- Create security incident response runbook

**Deliverables:**

- Zero secrets in repository or Git history
- All secrets properly stored in environment variables
- Pre-commit hooks preventing future incidents
- Security documentation complete

## Phase 2: Application Consolidation Analysis (Foundation for Removal)

**Scope:** Detailed analysis ensuring safe removal of duplicate applications

### 2.1: Feature Parity Verification

- List all routes in `frontend/` (production app)
- List all routes in `smartslate-app/`
- List all routes in `frontend/smartslate-polaris/`
- Compare routing and identify any unique routes
- Test each unique route to confirm it's not used
- Document findings in `feature-parity-analysis.md`

### 2.2: Component Migration Planning

**For each application marked for removal:**

- List all components (React components, hooks, utilities)
- Check if component exists in production frontend
- If unique and potentially valuable:
  - Document component purpose
  - Plan migration path to production app
  - Update import paths
  - Test migrated component
- If duplicate or unused:
  - Confirm safe to delete
  - Document deletion rationale

**Deliverables:**

- List of components to migrate (if any)
- List of components confirmed safe to delete
- Migration plan for unique components
- Updated import paths for migrated code

### 2.3: Build Configuration Analysis

- List all build configurations across three apps:
  - `package.json` dependencies
  - `tsconfig.json` settings
  - `vite.config.ts` or `next.config.js`
  - Environment variable requirements
- Identify dependencies used only in apps being removed
- Plan for consolidating configurations
- Ensure production app has all necessary dependencies

## Phase 3: Remove Unused Applications (Major Cleanup)

**Scope:** Delete redundant applications after confirming safety

### 3.1: Archive and Remove smartslate-app/

**Pre-removal checklist:**

- ✅ Dependency audit confirms zero production imports
- ✅ Feature parity analysis shows no unique functionality
- ✅ Component migration complete (if any components needed)
- ✅ Team notified and approves removal
- ✅ Backup created and verified

**Removal process:**

```bash
# Create archive branch before deletion
git checkout -b archive/smartslate-app
git mv smartslate-app/ .archive/smartslate-app-removed-$(date +%Y%m%d)/
git commit -m "chore: archive unused smartslate-app application"
git push origin archive/smartslate-app

# Remove from main cleanup branch
git checkout cleanup/consolidation
git rm -rf smartslate-app/
git commit -m "chore: remove unused smartslate-app application

- Application not deployed or used in production
- Zero imports from production frontend
- Archived to archive/smartslate-app branch for reference
- Reduces codebase by 76 files"
```

**Post-removal verification:**

- Build succeeds: `npm run build`
- All tests pass: `npm run test`
- Development server runs: `npm run dev`
- Production deployment successful

### 3.2: Extract and Remove frontend/smartslate-polaris/

**Pre-removal checklist:**

- ✅ Unique components migrated to parent `frontend/`
- ✅ Import paths updated throughout codebase
- ✅ Tests updated with new import paths
- ✅ No broken references remaining

**Removal process:**

- Migrate unique components to `frontend/src/components/`
- Update all import statements
- Remove nested `package.json` and build configs
- Delete `frontend/smartslate-polaris/` directory
- Test all pages and features that used migrated components

**Post-removal verification:**

- All imports resolve correctly
- Component functionality unchanged
- Build and tests pass
- No broken links or references

### 3.3: Consolidate Root Configuration Files

**Current state:** Multiple overlapping config files from different apps

**Actions:**

- Keep single `package.json` with merged dependencies
- Keep single `tsconfig.json` for frontend
- Remove redundant ESLint, Prettier configs
- Consolidate into single `.eslintrc.js` and `.prettierrc`
- Update scripts to reference single application

**Deliverables:**

- Single application in `frontend/` directory
- 209+ files removed (27% reduction)
- Clean root directory with only essential configs
- Updated build and deployment scripts

## Phase 4: Documentation Organization System (Structural Foundation)

**Scope:** Create organized documentation hierarchy from scattered files

### 4.1: Documentation Audit and Categorization

**Systematic review of all 78+ markdown files:**

For each file:

1. Read content and determine type
2. Assign category:
   - **PRD** → `docs/prds/`
   - **Implementation Note** → `docs/implementation-notes/`
   - **Architecture Decision** → `docs/architecture/`
   - **User Guide** → `docs/guides/`
   - **Obsolete/Historical** → `docs/archived/`
3. Add metadata: date, status, author
4. Identify related documents for cross-linking
5. Check if superseded by newer document

**Deliverables:**

- Spreadsheet categorizing all 78+ files
- Naming convention defined (e.g., `YYYY-MM-DD-feature-name.md`)
- Metadata template created
- Categorization complete

### 4.2: Create Documentation Directory Structure

```bash
mkdir -p docs/{prds,implementation-notes,architecture,guides,archived}
mkdir -p docs/implementation-notes/{feature-implementations,bug-fixes,refactoring}
```

**For each directory:**

- Create `README.md` explaining purpose
- Add index of files with descriptions
- Include contribution guidelines
- Define naming conventions

### 4.3: Move and Organize Files

**Systematic migration:**

```bash
# Example: Moving PRD files
mv prd-blueprint-generation.md docs/prds/blueprint-generation.md
mv implementation-notes-claude-integration.md docs/implementation-notes/feature-implementations/2024-01-claude-integration.md
```

**For each moved file:**

- Add metadata header:
  ```markdown
  ---
  title: Blueprint Generation
  type: prd
  status: active
  created: 2024-01-15
  lastUpdated: 2024-10-02
  author: Product Team
  ---
  ```
- Update any hardcoded file paths in content
- Add cross-references to related docs
- Update any README indexes

### 4.4: Build Documentation Navigation System

**Create master documentation index:**

`docs/README.md`:

```markdown
# SmartSlate Polaris Documentation

## Quick Links

- [Product Requirements](./prds/README.md)
- [Architecture Docs](./architecture/README.md)
- [Developer Guides](./guides/README.md)
- [Implementation Notes](./implementation-notes/README.md)

## Recent Updates

- [Latest PRD Updates](./prds/README.md#recent)
- [Recent Features](./implementation-notes/feature-implementations/)
- [Latest Architecture Changes](./architecture/README.md)
```

**Each subdirectory README includes:**

- Purpose of the directory
- Alphabetical index of files
- Quick summary of each document
- "Last Updated" dates
- Links to related directories

**Deliverables:**

- All 78+ files organized in `docs/` hierarchy
- Zero markdown files in root directory
- Master documentation index
- Searchable and navigable structure

## Phase 5: Code Structure Standardization (Internal Organization)

**Scope:** Organize internal structure of consolidated frontend application

### 5.1: Establish Component Organization Pattern

**Reorganize components by feature and purpose:**

```
frontend/src/components/
├── ui/                        # Base UI primitives
│   ├── button.tsx
│   ├── card.tsx
│   ├── input.tsx
│   └── [shadcn components]
├── features/                  # Feature-specific components
│   ├── blueprint/
│   │   ├── BlueprintGenerator.tsx
│   │   ├── BlueprintViewer.tsx
│   │   ├── BlueprintCard.tsx
│   │   └── index.ts
│   ├── questionnaire/
│   │   ├── QuestionnaireForm.tsx
│   │   ├── QuestionDisplay.tsx
│   │   └── index.ts
│   └── auth/
│       ├── LoginForm.tsx
│       ├── SignupForm.tsx
│       └── index.ts
└── layouts/                   # Page layouts
    ├── MainLayout.tsx
    ├── AuthLayout.tsx
    └── DashboardLayout.tsx
```

**Migration strategy:**

- Move components to new structure one feature at a time
- Update imports progressively
- Test each feature after migration
- Keep existing structure until migration complete
- Remove old directories once empty

### 5.2: Organize Utilities and Services

```
frontend/src/lib/
├── api/                       # API client functions
│   ├── client.ts              # Base HTTP client
│   ├── claude.ts              # Claude API integration
│   ├── perplexity.ts          # Perplexity API integration
│   └── auth.ts                # Authentication API
├── hooks/                     # Custom React hooks
│   ├── useBlueprint.ts
│   ├── useQuestionnaire.ts
│   └── useAuth.ts
├── utils/                     # Helper functions
│   ├── formatting.ts
│   ├── validation.ts
│   └── date.ts
└── constants/                 # App-wide constants
    ├── routes.ts
    ├── config.ts
    └── api-endpoints.ts
```

### 5.3: Consolidate Testing Structure

```
frontend/tests/
├── unit/                      # Component & function tests
│   ├── components/
│   ├── hooks/
│   └── utils/
├── integration/               # Feature integration tests
│   ├── blueprint/
│   └── questionnaire/
├── e2e/                       # End-to-end tests
│   ├── user-flows/
│   └── critical-paths/
└── utils/                     # Test utilities
    ├── test-utils.tsx         # React Testing Library setup
    ├── mock-data.ts           # Mock data generators
    └── test-helpers.ts        # Helper functions
```

**Deliverables:**

- Organized component structure by feature
- Centralized utilities and services
- Consolidated test directory
- Updated import paths throughout application

## Phase 6: Quality Assurance and Validation (Safety Net)

**Scope:** Comprehensive testing to ensure nothing broke during cleanup

### 6.1: Automated Testing Suite

- Run all existing unit tests
- Run integration tests
- Run end-to-end tests
- Verify 100% test pass rate
- Check test coverage hasn't decreased
- Add tests for any untested critical paths exposed during cleanup

### 6.2: Manual Feature Verification

**Test each core feature end-to-end:**

1. **User Authentication Flow**
   - Sign up new user
   - Log in existing user
   - Password reset
   - Session persistence

2. **Blueprint Generation**
   - Create new blueprint
   - View blueprint details
   - Edit blueprint
   - Delete blueprint

3. **Questionnaire System**
   - Generate questionnaire
   - Answer questions
   - Submit responses
   - View results

4. **Profile Management**
   - View profile
   - Update profile information
   - View learning history
   - Track progress

### 6.3: Build and Deployment Verification

- Clean build: `rm -rf .next && npm run build`
- Build succeeds without warnings
- Bundle size analysis (should be smaller after cleanup)
- Deploy to staging environment
- Smoke test all routes in staging
- Performance metrics comparison (before/after)

### 6.4: Documentation Verification

- All internal links work (no broken references)
- Code examples in docs are valid
- API documentation matches implementation
- Setup guides work for new developers
- All READMEs are accurate and up-to-date

**Deliverables:**

- All tests passing
- All features verified working
- Successful staging deployment
- Documentation validated
- Sign-off from QA and stakeholders

## Phase 7: Production Deployment and Monitoring (Go-Live)

**Scope:** Deploy cleaned codebase to production with careful monitoring

### 7.1: Pre-Deployment Checklist

- ✅ All phases 0-6 complete
- ✅ Staging environment validated
- ✅ Team trained on new structure
- ✅ Rollback plan documented and rehearsed
- ✅ Monitoring and alerting configured
- ✅ Communication plan executed (notify users if needed)
- ✅ Deployment window scheduled (low-traffic time)

### 7.2: Deployment Process

1. Create release tag: `v3-cleanup-complete`
2. Merge `cleanup/consolidation` branch to `main`
3. Trigger production deployment (Vercel automatic deploy)
4. Monitor deployment logs for errors
5. Verify deployment successful
6. Run production smoke tests

### 7.3: Post-Deployment Monitoring

**First 24 hours (intensive monitoring):**

- Check error tracking (Sentry/similar)
- Monitor application performance metrics
- Watch user authentication success rates
- Track API response times
- Monitor build/deployment metrics

**First week (ongoing monitoring):**

- Daily review of error logs
- Performance trend analysis
- User feedback collection
- Team feedback on new structure

### 7.4: Post-Launch Documentation

- Document lessons learned
- Create "What Changed" guide for team
- Update onboarding materials
- Create changelog: `CHANGELOG-v3-cleanup.md`
- Archive old documentation appropriately

**Deliverables:**

- Production deployment successful
- Zero critical issues in first 24 hours
- Monitoring confirms stability
- Team comfortable with new structure
- Documentation complete

## Phase 8: Establish Maintenance Standards (Long-Term Success)

**Scope:** Prevent regression and maintain clean codebase

### 8.1: Contribution Guidelines

**Create `CONTRIBUTING.md` with clear rules:**

```markdown
# Contributing to SmartSlate Polaris

## Code Organization Rules

- New components go in `src/components/features/[feature-name]/`
- Shared UI components go in `src/components/ui/`
- Utilities go in `src/lib/utils/`
- Tests mirror source structure in `tests/`

## Documentation Requirements

- New features require PRD in `docs/prds/`
- Implementation notes in `docs/implementation-notes/feature-implementations/`
- Update relevant READMEs
- Add JSDoc comments for public APIs

## Before Submitting PR

- Run tests: `npm test`
- Run linter: `npm run lint`
- Build succeeds: `npm run build`
- Update documentation if needed
- No secrets in code
```

### 8.2: Automated Enforcement

**GitHub Actions workflows:**

```yaml
# .github/workflows/code-quality.yml
name: Code Quality Checks
on: [pull_request]
jobs:
  enforce-structure:
    - Check no files in wrong directories
    - Verify documentation exists for new features
    - Ensure tests exist for new components
    - Run secret scanning
    - Check import path conventions
```

### 8.3: Quarterly Maintenance

**Regular cleanup tasks:**

- Review and archive outdated documentation
- Update dependency versions
- Clean up unused dependencies
- Review and refactor technical debt
- Update contribution guidelines based on learnings

### 8.4: Knowledge Sharing

- Weekly "Codebase Tour" for new team members
- Document architecture decisions in `docs/architecture/`
- Maintain FAQ based on common questions
- Create video walkthroughs of key areas

**Deliverables:**

- Comprehensive contribution guidelines
- Automated quality checks in CI/CD
- Quarterly maintenance schedule
- Knowledge sharing system established

# Logical Dependency Chain

## Foundation Layer (Must Build First)

### 1. Security Foundation (Blocks Everything Else)

**Why First:** Cannot proceed with any development until credentials are secured

**Dependencies:** None (immediate action required)

**Enables:**

- Safe collaborative development
- Public repository if desired
- Security audits and compliance
- Team confidence in codebase

**Critical Path:**

- Remove exposed secrets → Implement secret management → Add prevention tools
- This must complete before any code changes to avoid compounding security issues

### 2. Repository Safety Net (Blocks Destructive Changes)

**Why Second:** Must have rollback capability before deleting anything

**Dependencies:**

- Security foundation (ensures backups don't contain secrets)

**Enables:**

- Safe deletion of applications
- Experimentation without fear
- Easy rollback if issues arise
- Team confidence during cleanup

**Critical Path:**

- Create backups → Tag current state → Create cleanup branch → Document rollback procedures

### 3. Dependency Audit (Blocks Application Removal)

**Why Third:** Must know what we're deleting before we delete it

**Dependencies:**

- Repository safety net (work happens on cleanup branch)

**Enables:**

- Safe removal of unused applications
- Identification of code to migrate
- Understanding of application relationships
- Informed decision-making

**Critical Path:**

- Scan all imports → Map dependencies → Identify unique code → Confirm safe to remove

## Cleanup Layer (Foundation Complete, Now Remove Cruft)

### 4. Remove Unused Applications (Enables Simplification)

**Why Fourth:** Reduces complexity early, enables focus on single application

**Dependencies:**

- Security foundation (no secrets in deleted code)
- Repository safety net (can rollback if needed)
- Dependency audit (know it's safe to delete)

**Enables:**

- Single application to focus on
- Simplified build configuration
- Clearer mental model for team
- Faster subsequent phases (fewer files to organize)

**Critical Path:**

- Remove `smartslate-app/` → Remove nested `frontend/smartslate-polaris/` → Consolidate configs

### 5. Documentation Organization (Enables Discovery)

**Why Fifth:** With applications consolidated, organize knowledge base

**Dependencies:**

- Application removal (fewer files to document, clearer structure)

**Enables:**

- Efficient feature development (can find specs quickly)
- Onboarding new developers
- Architectural decisions with context
- Knowledge preservation

**Critical Path:**

- Audit docs → Categorize → Move to hierarchy → Create navigation

## Optimization Layer (Clean Foundation, Now Polish)

### 6. Internal Code Organization (Enables Scalability)

**Why Sixth:** With single app and organized docs, optimize internal structure

**Dependencies:**

- Single application (know what structure to optimize)
- Documentation organized (can reference architecture decisions)

**Enables:**

- Predictable component location
- Easier code reuse
- Better testing strategy
- Team velocity improvements

**Critical Path:**

- Organize components → Organize utilities → Consolidate tests → Update imports

### 7. Quality Assurance (Validates Everything)

**Why Seventh:** After all changes, verify nothing broke

**Dependencies:**

- All cleanup and organization complete

**Enables:**

- Confident production deployment
- Stakeholder sign-off
- Team confidence in new structure

**Critical Path:**

- Run automated tests → Manual feature testing → Build verification → Staging deployment

### 8. Production Deployment (Makes It Real)

**Why Eighth:** After validation, deploy cleaned codebase

**Dependencies:**

- Quality assurance passed
- Stakeholder approval

**Enables:**

- Team works with new structure daily
- Benefits realized (faster development, better onboarding)
- Maintenance phase begins

**Critical Path:**

- Pre-deployment checklist → Deploy → Monitor → Post-launch docs

## Getting to Visible/Usable Fast: The 80/20 Approach

### Quick Win #1: Security + Single App (Days 1-3)

**Result:** Secure codebase with clear "main application"

- Day 1: Remove exposed credentials, implement secrets management
- Day 2: Dependency audit confirms safe to remove apps
- Day 3: Remove unused applications

**User-Visible Impact:**

- Team knows which application to work on
- No more confusion about production vs. unused apps
- Security team satisfied
- Can confidently onboard new developers

### Quick Win #2: Organized Docs (Days 4-5)

**Result:** Findable documentation

- Day 4: Categorize and move all markdown files
- Day 5: Create navigation system and README indexes

**User-Visible Impact:**

- Any document findable in < 30 seconds
- New developers can self-serve setup
- Product managers can reference PRDs independently
- Knowledge accessible without tribal expertise

### Quick Win #3: Clean Build (Day 6)

**Result:** Single, fast build process

- Day 6: Consolidate configurations, verify build succeeds

**User-Visible Impact:**

- One command to build: `npm run build`
- Faster build times (no redundant apps)
- Clear deployment target
- CI/CD simplified

### At This Point (End of Week 1): 80% of Value Delivered

**What's Working:**

- ✅ Secure codebase
- ✅ Single application (frontend/)
- ✅ Organized documentation
- ✅ Clean build process
- ✅ Clear production path

**What Remains:**

- Internal code organization (nice-to-have)
- Comprehensive testing (validation)
- Production deployment (go-live)
- Maintenance standards (long-term)

## Atomic Feature Scoping (Build Upon Previous Work)

### Atomic Unit: Application Removal

**Scope:** Remove one application at a time

**Iteration 1:** Remove `smartslate-app/`

- Audit this app only
- Confirm no production dependencies
- Archive and delete
- Verify build
- **Can use immediately:** Simplified mental model

**Iteration 2:** Remove `frontend/smartslate-polaris/`

- Audit nested app only
- Migrate any unique components
- Delete nested structure
- Verify build
- **Can use immediately:** Single clean application

### Atomic Unit: Documentation Category

**Scope:** Organize one documentation type at a time

**Iteration 1:** Organize PRDs

- Move all PRDs to `docs/prds/`
- Create PRD README
- **Can use immediately:** All product specs in one place

**Iteration 2:** Organize implementation notes

- Move to `docs/implementation-notes/`
- Categorize by type (features, bugs, refactoring)
- **Can use immediately:** Development history accessible

**Iteration 3:** Organize guides

- Move to `docs/guides/`
- Update setup documentation
- **Can use immediately:** Onboarding materials ready

### Atomic Unit: Component Organization

**Scope:** Reorganize one feature area at a time

**Iteration 1:** Blueprint components

- Move to `src/components/features/blueprint/`
- Update imports
- Test blueprint feature
- **Can use immediately:** Blueprint code organized

**Iteration 2:** Questionnaire components

- Move to `src/components/features/questionnaire/`
- Update imports
- Test questionnaire feature
- **Can use immediately:** Questionnaire code organized

**Each iteration is independently valuable and usable**

## Dependency Flow Visualization

```
Phase 0: Foundation & Safety
  ├─ 0.1: Repository Backup ────────────┐
  ├─ 0.2: Dependency Audit ─────────────┤
  └─ 0.3: Security Scan ────────────────┤
                                        ┃
Phase 1: Security (CRITICAL) ◄──────────┘
  ├─ 1.1: Remove Exposed Credentials
  ├─ 1.2: Implement Secrets Management
  └─ 1.3: Security Prevention Tools
                ┃
                ├──────────────────────────┐
                ┃                          ┃
Phase 2: Analysis ◄─────┘                  ┃
  ├─ 2.1: Feature Parity                   ┃
  ├─ 2.2: Component Migration Plan         ┃
  └─ 2.3: Build Config Analysis            ┃
                ┃                          ┃
Phase 3: Remove Apps ◄──┘                  ┃
  ├─ 3.1: Remove smartslate-app/           ┃
  ├─ 3.2: Remove nested app                ┃
  └─ 3.3: Consolidate configs              ┃
                ┃                          ┃
                ├──────────────────┐       ┃
                ┃                  ┃       ┃
Phase 4: Docs Org ◄────┘           ┃       ┃
  ├─ 4.1: Audit & Categorize       ┃       ┃
  ├─ 4.2: Create Structure         ┃       ┃
  ├─ 4.3: Move Files               ┃       ┃
  └─ 4.4: Build Navigation         ┃       ┃
                                   ┃       ┃
Phase 5: Code Structure ◄──────────┘       ┃
  ├─ 5.1: Component Organization           ┃
  ├─ 5.2: Utilities & Services             ┃
  └─ 5.3: Testing Structure                ┃
                ┃                          ┃
Phase 6: QA ◄───┴──────────────────────────┘
  ├─ 6.1: Automated Tests
  ├─ 6.2: Manual Verification
  ├─ 6.3: Build & Deploy Verification
  └─ 6.4: Documentation Verification
                ┃
Phase 7: Production ◄───┘
  ├─ 7.1: Pre-Deployment Checklist
  ├─ 7.2: Deployment Process
  ├─ 7.3: Post-Deployment Monitoring
  └─ 7.4: Post-Launch Documentation
                ┃
Phase 8: Maintenance ◄──┘
  ├─ 8.1: Contribution Guidelines
  ├─ 8.2: Automated Enforcement
  ├─ 8.3: Quarterly Maintenance
  └─ 8.4: Knowledge Sharing
```

# Risks and Mitigations

## Critical Risks (High Impact, Must Address)

### Risk 1: Breaking Production Deployment

**Probability:** Medium  
**Impact:** Critical (site goes down)

**Symptoms:**

- Build fails after removing applications
- Routes return 404 errors
- API integrations stop working
- Authentication fails

**Root Causes:**

- Vercel configuration points to wrong application
- Missing dependencies from removed apps
- Environment variables not properly configured
- Removed code still referenced somewhere

**Mitigations:**

**Preventive:**

- Comprehensive dependency audit before removal (Phase 0.2, Phase 2)
- Deploy to staging environment first (Phase 6.3)
- Run full test suite before production (Phase 6.1, 6.2)
- Verify Vercel configuration explicitly
- Tag every major step for easy rollback

**Detective:**

- Monitor error rates during and after deployment
- Set up alerts for build failures
- Implement health check endpoints
- Smoke test all routes immediately after deployment

**Corrective:**

- Documented rollback procedure: `git reset --hard v3-pre-cleanup`
- Emergency contact list for immediate rollback
- Rollback rehearsal before production deployment
- Keep old deployment available for 24 hours

**Estimated Time to Recover:** 5-15 minutes (with documented rollback)

### Risk 2: Lost Critical Code or Documentation

**Probability:** Low  
**Impact:** High (lost knowledge, must recreate)

**Symptoms:**

- Feature mentioned in docs doesn't exist
- Component referenced in code is missing
- Historical context lost
- Implementation details unavailable

**Root Causes:**

- Deleted application contained unique functionality
- Documentation moved to archived but still needed
- Removed code without checking all references
- Git history cleaned up too aggressively

**Mitigations:**

**Preventive:**

- Archive deleted applications to separate repository (Phase 3)
- Create comprehensive backup before starting (Phase 0.1)
- Dependency audit identifies all unique code (Phase 0.2, Phase 2.2)
- Migrate unique components before deletion (Phase 3.2)
- Document what was removed and why

**Detective:**

- Code review catches missing references
- Build errors indicate missing dependencies
- Test failures show broken functionality
- Team review identifies missing features

**Corrective:**

- Access archived repository to recover code
- Restore from git tag: `v3-pre-cleanup`
- Recover documentation from backup
- Recreate component if necessary (with reference)

**Estimated Time to Recover:** 1-4 hours (from archives)

### Risk 3: Exposed Secrets Remain in Git History

**Probability:** High (currently exposed)  
**Impact:** Critical (security breach possible)

**Symptoms:**

- Security scan finds secrets after cleanup
- Credentials still accessible in git history
- Old commits contain SSH keys
- Force push didn't clean all branches

**Root Causes:**

- Incomplete git history cleanup
- Secrets in multiple branches
- Force push didn't reach all remotes
- New secrets added during cleanup

**Mitigations:**

**Preventive:**

- Comprehensive secret scan before starting (Phase 0.3)
- Remove secrets as first step (Phase 1.1)
- Force push to ALL branches and remotes
- Verify cleanup with post-scan
- Implement pre-commit hooks immediately (Phase 1.3)

**Detective:**

- Automated secret scanning in CI/CD
- Regular security audits
- Team training on identifying secrets
- Pre-commit hooks catch new secrets

**Corrective:**

- Immediately rotate all exposed credentials
- Re-run git history cleanup
- Force push again to all branches
- Audit all code for hardcoded secrets
- Implement emergency secret rotation procedure

**Estimated Time to Recover:** 2-8 hours (rotation + re-cleanup)

## Medium Risks (Moderate Impact, Important but Not Critical)

### Risk 4: Team Confusion During Transition

**Probability:** High  
**Impact:** Medium (temporary productivity loss)

**Symptoms:**

- Developers can't find files
- Questions about which application to use
- Uncertainty about where new code goes
- Merge conflicts during transition period

**Root Causes:**

- Multiple people working during cleanup
- Insufficient communication about changes
- Lack of clear transition guide
- Old habits die hard

**Mitigations:**

**Preventive:**

- Clear communication plan from start
- "What Changed" guide published early
- Team training on new structure
- Work on cleanup branch first
- Gradual rollout with clear cutover date

**Detective:**

- Monitor team Slack/communication for confusion
- Track PR review times (longer = confusion)
- Regular check-ins during transition
- Anonymous feedback mechanism

**Corrective:**

- Office hours for questions
- Update documentation based on common questions
- Create video walkthroughs
- Pair programming sessions
- FAQ document updated continuously

**Estimated Time to Recover:** 1-2 weeks (learning curve)

### Risk 5: Documentation Becomes Outdated Again

**Probability:** Medium  
**Impact:** Medium (back to original problem)

**Symptoms:**

- New markdown files in root directory
- Documentation not updated with code changes
- README files out of sync
- Team bypasses documentation standards

**Root Causes:**

- No enforcement mechanism
- Documentation not part of PR checklist
- Unclear where to put new docs
- Time pressure leads to shortcuts

**Mitigations:**

**Preventive:**

- Clear contribution guidelines (Phase 8.1)
- Automated checks in CI/CD (Phase 8.2)
- PR template includes documentation checkbox
- Make documentation easy to update
- Quarterly maintenance schedule (Phase 8.3)

**Detective:**

- Automated checks for files in wrong places
- PR reviews check documentation
- Regular audits of doc structure
- Metrics on documentation freshness

**Corrective:**

- Gentle reminders in PR reviews
- Team retrospectives on process
- Improve documentation tooling
- Recognition for good documentation

**Estimated Time to Recover:** Ongoing maintenance

### Risk 6: Performance Degradation After Cleanup

**Probability:** Low  
**Impact:** Medium (user experience affected)

**Symptoms:**

- Slower page load times
- Increased bundle size
- Longer build times
- API response delays

**Root Causes:**

- Unoptimized imports after reorganization
- Missing code splitting
- Larger bundle from consolidated configs
- Database queries not optimized

**Mitigations:**

**Preventive:**

- Bundle size analysis before/after (Phase 6.3)
- Performance testing in staging
- Lighthouse score comparison
- Code splitting review

**Detective:**

- Monitor performance metrics
- Track bundle size in CI/CD
- User experience monitoring
- Real User Monitoring (RUM)

**Corrective:**

- Optimize imports and tree-shaking
- Implement dynamic imports where appropriate
- Review and optimize build configuration
- Lazy load components where possible

**Estimated Time to Recover:** 1-3 days (optimization)

## Low Risks (Low Impact or Low Probability)

### Risk 7: Merge Conflicts During Cleanup

**Probability:** Medium (if team is active)  
**Impact:** Low (easily resolved)

**Mitigations:**

- Work on dedicated cleanup branch
- Frequent communication with team
- Freeze non-critical development during key phases
- Clear branch strategy

### Risk 8: Incomplete Migration of Unique Components

**Probability:** Low  
**Impact:** Medium (missing functionality)

**Mitigations:**

- Thorough component audit (Phase 2.2)
- Manual testing of all features (Phase 6.2)
- Component migration checklist
- Code review catches missing components

### Risk 9: Build Time Increases (Unexpected)

**Probability:** Low  
**Impact:** Low (workflow friction)

**Mitigations:**

- Measure build times before/after
- Optimize build configuration
- Consider caching strategies
- Monitor CI/CD performance

## Figuring Out the MVP: What's Essential vs. Nice-to-Have

### MVP Definition: Minimum Viable Cleanup

**Essential (Cannot Launch Without):**

1. ✅ **Security Remediation** (Phase 1)
   - No exposed credentials
   - Secrets properly managed
   - Prevention tools installed
2. ✅ **Single Application** (Phase 3)
   - Removed unused apps
   - Consolidated to `frontend/` only
   - Clean build succeeds
3. ✅ **Production Deployment Works** (Phase 6, 7)
   - All tests pass
   - All features functional
   - Staging verified
   - Production deployed successfully

**Why This is MVP:**

- Solves critical security problem
- Eliminates major confusion (3 apps → 1 app)
- Maintains all production functionality
- Team can immediately work more effectively

**What Can Wait (Post-MVP):**

- Documentation organization (Phase 4)
  - _Impact:_ Improves discoverability but not blocking
  - _Can do gradually:_ Organize one category at a time
- Internal code organization (Phase 5)
  - _Impact:_ Better structure but works as-is
  - _Can do gradually:_ One feature at a time
- Maintenance standards (Phase 8)
  - _Impact:_ Prevents regression but not urgent
  - _Can do gradually:_ Implement guidelines over time

### Progressive Enhancement Path

**Week 1 MVP:** Secure, Single App, Working Production

- Security fixed
- Unused apps removed
- Production deployed
- **Value:** 70% of total benefit

**Week 2 Enhancement:** Organized Knowledge Base

- Documentation organized
- Navigation system built
- **Additional Value:** +20% of total benefit

**Week 3+ Optimization:** Polish and Standards

- Internal code organization
- Maintenance standards
- Team training
- **Additional Value:** +10% of total benefit

### MVP Risk Assessment

**Risks if we ship MVP only:**

- Documentation still chaotic (manageable, not blocking)
- Internal structure could be better (refactor later)
- No automated enforcement (manual process works)

**Benefits of shipping MVP early:**

- Security issues resolved immediately
- Team confusion eliminated quickly
- Can iterate on remaining improvements
- Faster time to value

**Recommendation:** Ship MVP (Phases 0-3, 6-7) as quickly as possible, then iterate on documentation and polish.

# Appendix

## A. Current Codebase Inventory

### Application File Counts

```
frontend/                    550+ files (PRODUCTION - Next.js)
├── app/                     ~200 files (pages, routes)
├── components/              ~250 files (UI components)
├── lib/                     ~50 files (utilities, API clients)
├── types/                   ~30 files (TypeScript definitions)
├── styles/                  ~20 files (CSS, Tailwind)
└── smartslate-polaris/      133 files (DUPLICATE - Vite)

smartslate-app/              76 files (UNUSED - Vite)
├── src/                     ~60 files
└── public/                  ~16 files

backend/                     ~200 files (Python FastAPI)

Root markdown files          78+ files (scattered docs)
```

**Total Frontend Files:** 759 files across 3 applications  
**Files to Remove:** 209 files (27% reduction)  
**Post-Cleanup:** 550 files in single application

### Documentation File Categories (Sample)

**PRDs (Product Requirements Documents):**

- `prd-blueprint-generation.md`
- `prd-perplexity-questionnaire.md`
- `prd-multi-agent-architecture.md`
- `prd-backend-production-readiness.md`
- `prd-claude-integration.md`

**Implementation Notes:**

- `implementation-notes-claude-api.md`
- `implementation-notes-perplexity-integration.md`
- `implementation-notes-auth-flow.md`
- `implementation-notes-database-schema.md`

**Bug Fixes:**

- `bugfix-session-timeout.md`
- `bugfix-api-rate-limiting.md`
- `bugfix-questionnaire-state.md`

**Architecture Decisions:**

- `architecture-multi-agent-design.md`
- `architecture-database-selection.md`
- `architecture-api-design.md`

**Historical/Obsolete:**

- `v1-migration-notes.md`
- `deprecated-features-list.md`
- `old-implementation-approaches.md`

## B. Dependency Analysis Example

### Frontend Application Dependencies

```json
{
  "name": "smartslate-polaris-frontend",
  "dependencies": {
    "next": "14.2.0",
    "react": "18.3.0",
    "react-dom": "18.3.0",
    "@anthropic-ai/sdk": "^0.20.0",
    "axios": "^1.6.0",
    "tailwindcss": "^3.4.0",
    "lucide-react": "^0.263.0",
    "@radix-ui/react-*": "various",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "@types/react": "^18.3.0",
    "@types/node": "^20.0.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0"
  }
}
```

### Unused Applications (No Production Dependencies)

- ✅ `smartslate-app/` has zero imports from production
- ✅ `frontend/smartslate-polaris/` has zero imports to/from parent
- ✅ Safe to remove after component migration

## C. Security Scan Results Template

### Exposed Credentials Found

```
Location: /ssh_keys/
- id_rsa (SSH private key)
- id_rsa.pub (SSH public key)
- authorized_keys

Location: Git History
- Commit abc123: Contains AWS credentials
- Commit def456: Contains API keys

Action Required:
1. Remove from working tree
2. Remove from Git history
3. Rotate all exposed credentials
4. Add to .gitignore
```

### Recommended .gitignore Additions

```gitignore
# Secrets
.env
.env.local
.env.*.local
*.pem
*.key
*.crt
ssh_keys/
secrets/
credentials/

# API Keys
*_api_key*
*_secret*
*_token*

# System Files
.DS_Store
Thumbs.db
*.swp
*.swo

# IDE
.vscode/
.idea/
*.sublime-*
```

## D. Environment Variables Template

### .env.example

```bash
# Application
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# AI APIs
CLAUDE_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxx
PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxxxxxxxxxx

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/smartslate
REDIS_URL=redis://localhost:6379

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32

# External Services
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=noreply@smartslate.com
SMTP_PASSWORD=xxxxxxxxxxxxxxxxxxxx

# Feature Flags
FEATURE_ADVANCED_ANALYTICS=false
FEATURE_BETA_FEATURES=false

# Monitoring
SENTRY_DSN=https://xxxxxxxxxxxxxxxxxxxx@sentry.io/xxxxxxxxxxxxxxxxxxxx
ANALYTICS_ID=UA-xxxxxxxxxxxxxxxxxxxx
```

## E. Vercel Configuration

### vercel.json

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "outputDirectory": "frontend/.next",
  "env": {
    "NEXT_PUBLIC_APP_URL": "@app-url"
  },
  "build": {
    "env": {
      "CLAUDE_API_KEY": "@claude-api-key",
      "PERPLEXITY_API_KEY": "@perplexity-api-key",
      "DATABASE_URL": "@database-url"
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://backend.smartslate.com/api/:path*"
    }
  ]
}
```

## F. Rollback Procedure

### Emergency Rollback Steps

```bash
# Step 1: Assess the situation
# Determine severity and impact

# Step 2: Immediate rollback (< 2 minutes)
git fetch origin
git reset --hard v3-pre-cleanup
git push --force origin main

# Step 3: Redeploy previous version
# Via Vercel dashboard or CLI:
vercel --prod

# Step 4: Verify rollback successful
curl https://smartslate.com/health
# Check error monitoring dashboard
# Verify core features working

#
```
