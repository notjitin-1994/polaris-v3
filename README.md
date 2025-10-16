# SmartSlate Polaris v3 - AI-Powered Learning Blueprint Generation System

## Overview

SmartSlate Polaris v3 is a sophisticated SaaS platform that generates personalized learning blueprints through an intelligent two-phase questionnaire system. The platform uses advanced AI (Claude, GPT-4, Perplexity) to create comprehensive, implementation-ready learning and development strategies tailored to individual organizations and their specific needs.

## Mission Statement

Transform how organizations approach learning and development by providing AI-powered, personalized learning blueprint generation that delivers immediate, actionable insights for creating world-class training programs.

## Core Value Proposition

**"Transform thoughts into powerful Starmaps with AI-powered intelligence"** - Generate comprehensive learning blueprints in minutes instead of months, with personalized recommendations that address specific organizational contexts, compliance requirements, and learning objectives.

## Tech Stack

### Frontend Architecture
- **Framework**: Next.js 15 with App Router (React 19)
- **Language**: TypeScript 5.7 with strict type checking
- **Styling**: Tailwind CSS v4 with custom design system and semantic tokens
- **State Management**: Zustand for global state, React Hook Form for form handling
- **UI Components**: Custom component library with Radix UI primitives
- **Animation**: Framer Motion for smooth interactions
- **Charts/Visualization**: Recharts for data visualization
- **Form Handling**: React Hook Form with Zod validation

### Backend Infrastructure
- **Database**: PostgreSQL via Supabase (hosted)
- **Authentication**: Supabase Auth with email/password and OAuth
- **API Layer**: Next.js API routes with middleware
- **Real-time**: Supabase real-time subscriptions
- **File Storage**: Supabase Storage (for future use)

### AI & LLM Integration
- **Primary Provider**: Anthropic Claude 3.5 Sonnet (primary)
- **Fallback Providers**:
  - OpenAI GPT-4o
  - Perplexity Sonar Pro
  - Ollama (local fallback for development)
- **Cost Optimization**: Intelligent provider selection with retry logic

### Development Tools
- **Build System**: Turbopack (Next.js built-in)
- **Testing**: Vitest with React Testing Library
- **Linting**: ESLint with Next.js and Prettier configs
- **Type Checking**: TypeScript with strict mode
- **Code Quality**: Husky for pre-commit hooks, lint-staged for formatting

## Architecture Overview

### System Architecture
```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Next.js App   │───▶│   Supabase DB    │───▶│   LLM APIs      │
│   (Frontend)    │    │   (PostgreSQL)   │    │   (Claude/GPT)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         ▼                        ▼                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Questionnaire   │    │   Blueprint      │    │   Admin         │
│   Generation    │    │   Generation     │    │   Dashboard     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### Data Flow Architecture
1. **Static Questionnaire** → User completes 3-section form (30+ fields)
2. **Dynamic Question Generation** → AI creates 10 sections (50-70 personalized questions)
3. **Answer Collection** → User completes dynamic questionnaire with auto-save
4. **Blueprint Generation** → AI creates comprehensive learning blueprint
5. **Export & Sharing** → Users can export as PDF/Word and share via links

## Database Schema

### Core Tables

#### `blueprint_generator` (Main Data Table)
```sql
- id: UUID (Primary Key)
- user_id: UUID (FK to auth.users)
- version: INTEGER (Schema versioning)
- static_answers: JSONB (Section 1-3 responses)
- dynamic_questions: JSONB (AI-generated form schema)
- dynamic_questions_raw: JSONB (Raw LLM response)
- dynamic_answers: JSONB (User responses)
- blueprint_json: JSONB (Final blueprint data)
- blueprint_markdown: TEXT (Markdown export)
- status: TEXT (draft/generating/answering/completed/error)
- title: TEXT (Blueprint title)
- created_at, updated_at: TIMESTAMPTZ
```

#### `user_profiles` (User Data)
```sql
- id: UUID (FK to auth.users)
- subscription_tier: TEXT (explorer/navigator/voyager)
- user_role: TEXT (explorer/navigator/voyager/developer)
- subscription_metadata: JSONB (Tier-specific data)
- usage_metadata: JSONB (Monthly usage tracking)
- created_at, updated_at: TIMESTAMPTZ
```

## Business Model & Pricing

### Subscription Tiers

#### Personal Plans (Individual Creators)
1. **Explorer** - $19/month, $153/year (20% savings)
   - 5 starmap generations (60/year)
   - 5 saved starmaps (roll over 12 months)
   - Best for beginners

2. **Navigator** - $39/month, $374/year (20% savings)
   - 20 starmap generations (240/year)
   - 10 saved starmaps (roll over 12 months)
   - Most popular plan

3. **Voyager** - $79/month, $758/year (20% savings)
   - 50 starmap generations (600/year)
   - 50 saved starmaps (roll over 12 months)
   - Professional tier

#### Team Plans (Organizations)
1. **Crew** - $25/seat/month (2-5 seats)
   - 5 starmap generations/user
   - 5 saved starmaps/user (roll over 12 months)
   - Shared workspace, real-time collaboration

2. **Fleet** - $49/seat/month (6-15 seats)
   - 20 starmap generations/user
   - 10 saved starmaps/user (roll over 12 months)
   - SSO/SAML, advanced analytics

3. **Armada** - $99/seat/month (16-50 seats)
   - 50 starmap generations/user
   - 50 saved starmaps/user (roll over 12 months)
   - Dedicated success manager, custom integrations

#### Enterprise
- **Custom pricing** starting at $49/seat/month
- Unlimited everything (fair usage policy)
- Advanced security (SSO, SCIM, audit logs)
- Dedicated support (24/7, 99.9% SLA)
- Custom integrations and API access

### Pricing Features
- **20% annual discount** on all plans
- **Rollover policy**: Unused generations roll over monthly for up to 12 months
- **14-day free trial** with 3 starmap generations that roll over when you subscribe
- **No credit card required** for trial
- **Cancel anytime** with 30-day data retention

## User Flow & Experience

### User Personas

#### Primary: Learning & Development Manager
- **Context**: Manages L&D for 50-500 employees
- **Goal**: Create comprehensive learning blueprints quickly
- **Pain Points**: Limited time, needs expert guidance
- **Technical Comfort**: Moderate

#### Secondary: Instructional Designer
- **Context**: Designs and develops learning content
- **Goal**: Detailed implementation guidance
- **Pain Points**: Balance pedagogy with organizational constraints
- **Technical Comfort**: High

#### Tertiary: HR Director / CLO
- **Context**: Strategic learning leadership
- **Goal**: High-level blueprints for executive presentation
- **Pain Points**: Limited technical knowledge
- **Technical Comfort**: Low to Moderate

### Complete User Journey

#### Phase 1: Static Questionnaire (10 minutes)
1. **Landing** → User sees dashboard with "Create New Blueprint" CTA
2. **Section 1**: Role & Experience Intelligence (30+ fields)
   - Current role, experience, industries, team size, budget
3. **Section 2**: Organization Context & Compliance
   - Company details, industry, size, compliance requirements
4. **Section 3**: Learning Gap & Audience Profile
   - Gap description, learner demographics, timeline, budget
5. **Auto-save** after each section with progress indicator

#### Phase 2: Dynamic Question Generation (30-90 seconds)
1. **Loading Screen** with status updates
2. **AI Processing** using Claude 3.5 Sonnet (primary)
3. **Fallback Chain**: OpenAI → Perplexity → Ollama if needed
4. **Output**: 10 sections with 50-70 personalized questions

#### Phase 3: Dynamic Questionnaire (20 minutes)
1. **Section Navigation** (1 of 10 progress indicator)
2. **Modern Input Types**:
   - Radio pills, checkbox cards, scales, sliders
   - Toggle switches, text areas, currency inputs
3. **Auto-save** every 30 seconds
4. **Resume Functionality** if interrupted
5. **Validation** on section completion

#### Phase 4: Blueprint Generation (60-120 seconds)
1. **Loading Screen** with progress steps
2. **AI Blueprint Creation** using collected answers
3. **Comprehensive Output**:
   - Executive summary
   - Learning objectives with KPIs
   - Target audience analysis
   - Instructional strategy
   - Content outline with timeline
   - Resource requirements
   - Assessment strategy
   - Implementation plan
   - Risk mitigation
   - Success metrics

#### Phase 5: Blueprint Consumption
1. **Interactive Dashboard** with multiple view modes
2. **Export Options**: PDF, Word, Markdown
3. **Share Links** for collaboration
4. **Regeneration** of specific sections
5. **Iteration** and refinement capabilities

## AI System Prompts & Intelligence

### Dynamic Question Generation Prompt (1100+ lines)

The system uses a sophisticated multi-expert prompt that creates a "world-class Learning Experience Design team" including:

- **Chief Learning Officer** (20+ years experience)
- **Instructional Design Director** (ADDIE, SAM, Agile methodologies)
- **Learning Technology Architect** (LMS, authoring tools, AI integration)
- **Performance Consultant** (Business impact, ROI)
- **Compliance Specialist** (Regulatory adherence, universal design)
- **Data Scientist** (Learning analytics, predictive modeling)
- **Prompt Engineering Expert** (Precise question flows)

### Personalization Intelligence

The AI analyzes 3-section static questionnaire data to generate hyper-personalized questions:

1. **Role-Specific Language**:
   - C-Suite: Strategic impact, board reporting, competitive advantage
   - Directors: Program oversight, resource optimization
   - Managers: Implementation tactics, team development
   - Instructional Designers: Pedagogical approaches, learning science

2. **Industry-Specific Context**:
   - Healthcare: Clinical outcomes, HIPAA compliance, patient safety
   - Financial Services: Risk management, SOX compliance, audit trails
   - Technology: Rapid skill evolution, technical depth, sandbox environments

3. **Compliance-Aware Filtering**:
   - GDPR regions → Data residency questions
   - HIPAA compliance → PHI handling requirements
   - SOX/Financial → Audit trail requirements

4. **Scale-Appropriate Recommendations**:
   - 1-50 employees: Agile, flexible solutions
   - 1000+ employees: Enterprise governance, phased rollouts

### Blueprint Generation Intelligence

The final blueprint generation uses the collected dynamic answers to create:

- **Executive Summary** with business case and ROI projections
- **Learning Objectives** with Bloom's taxonomy alignment
- **Target Audience** analysis with segmentation strategies
- **Instructional Strategy** with modality recommendations
- **Content Outline** with detailed module structure
- **Resource Requirements** with budget and timeline
- **Assessment Strategy** with KPI definitions
- **Implementation Timeline** with critical path
- **Risk Mitigation** plans
- **Success Metrics** dashboard
- **Sustainability Plan** for long-term maintenance

## File Structure

```
/polaris-v3/
├── frontend/                          # Next.js application
│   ├── app/                           # App Router structure
│   │   ├── (auth)/                    # Protected routes
│   │   │   ├── static-wizard/         # Static questionnaire
│   │   │   ├── dynamic-questionnaire/ # Dynamic questionnaire
│   │   │   ├── blueprint/             # Blueprint viewer
│   │   │   └── admin/                 # Admin dashboard
│   │   ├── api/                       # API routes
│   │   │   ├── questionnaire/         # Questionnaire endpoints
│   │   │   ├── generate-dynamic-questions/ # Question generation
│   │   │   └── blueprint/             # Blueprint operations
│   │   └── components/                # Reusable components
│   ├── components/                    # Component library
│   │   ├── demo-dynamicv2/            # Dynamic question renderer
│   │   ├── pricing/                   # Pricing page components
│   │   └── ui/                        # Base UI components
│   ├── lib/                           # Business logic
│   │   ├── services/                  # Core services
│   │   │   ├── dynamicQuestionGenerationV2.ts # AI question generation
│   │   │   └── blueprintGenerationService.ts  # Blueprint creation
│   │   ├── auth/                      # Authentication utilities
│   │   ├── hooks/                     # Custom React hooks
│   │   └── stores/                    # Zustand stores
│   ├── types/                         # TypeScript definitions
│   └── styles/                        # Global styles
├── supabase/                          # Database and migrations
│   └── migrations/                    # SQL migration files
├── scripts/                           # Utility scripts
└── docs/                             # Documentation
```

## Development Workflow

### Getting Started

1. **Environment Setup**:
   ```bash
   # Install dependencies
   npm install

   # Set up Supabase (local or remote)
   supabase start  # Local development
   # OR configure remote Supabase project

   # Environment variables (.env.local)
   NEXT_PUBLIC_SUPABASE_URL=your_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_key
   ANTHROPIC_API_KEY=your_claude_key
   ```

2. **Development**:
   ```bash
   # Frontend development
   cd frontend && npm run dev

   # Database operations
   npm run db:status
   npm run db:push
   ```

3. **Testing**:
   ```bash
   cd frontend && npm run test
   npm run test:integration  # Ollama integration tests
   ```

### Key Development Commands

```bash
# Project root
npm run supabase          # Supabase CLI
npm run db:reset         # Reset local database
npm run db:push          # Push migrations to remote
npm run db:migrations:new # Create new migration

# Frontend
cd frontend
npm run dev              # Development server
npm run build           # Production build
npm run typecheck       # TypeScript checking
npm run test            # Run tests
npm run cleanup-duplicates # Remove duplicate files
```

## Deployment

### Production Deployment (Vercel)
- **Configuration**: `vercel.json` at root for monorepo setup
- **Frontend**: Deployed from `frontend/` directory
- **Database**: Supabase hosted instance
- **Environment**: Production environment variables in Vercel dashboard

### Deployment Process
1. **Staging**: Deploy to staging environment for testing
2. **Production**: Deploy to production with feature flags initially disabled
3. **Canary**: 10% rollout for monitoring
4. **Full Rollout**: 100% deployment after validation

## Monitoring & Observability

### Logging Infrastructure
- **Server-side**: Comprehensive logging with structured data
- **Client-side**: Error tracking and user behavior analytics
- **LLM Operations**: Token usage, response times, error rates
- **Admin Dashboard**: `/admin/logs` for debugging and monitoring

### Key Metrics
- **User Engagement**: Questionnaire completion rates, time per section
- **AI Performance**: Provider success rates, generation times
- **Business Metrics**: Conversion rates, churn, expansion revenue
- **Technical Metrics**: Error rates, API response times, database performance

## Security & Compliance

### Authentication & Authorization
- **Supabase Auth**: Email/password and OAuth providers
- **Row Level Security**: User data isolation at database level
- **Middleware**: Role-based access control for API endpoints

### Data Protection
- **GDPR Compliance**: Data residency options, right-to-erasure
- **Industry Compliance**: HIPAA, SOX, PCI-DSS support
- **Security Levels**: From unrestricted to highly restricted/classified

### Subscription Management
- **Role-Based Access**: Explorer, Navigator, Voyager, Developer roles
- **Usage Tracking**: Monthly limits with rollover policy
- **Audit Logging**: All role changes and admin actions logged

## API Reference

### Core Endpoints

#### Questionnaire APIs
- `POST /api/questionnaire/save` - Save static questionnaire answers
- `POST /api/generate-dynamic-questions` - Generate dynamic questions
- `GET /api/dynamic-questions/:blueprintId` - Fetch dynamic questions
- `POST /api/dynamic-answers/save` - Auto-save dynamic answers
- `POST /api/dynamic-answers/submit` - Submit complete answers

#### Blueprint APIs
- `POST /api/blueprints/generate` - Generate learning blueprint
- `GET /api/blueprints/:id` - Fetch blueprint data
- `POST /api/blueprints/regenerate` - Regenerate sections

#### Admin APIs
- `GET /api/logs` - Admin log viewer (developer role required)
- `POST /api/admin/assign-role` - Role management
- `GET /api/admin/users` - User management

## Future Roadmap

### Phase 1 (Current): Complete Dynamic Questionnaire Flow
- ✅ Static questionnaire (V2.0)
- ✅ Dynamic question generation
- 🔄 Dynamic question rendering and answer collection
- 🔄 Blueprint generation integration
- 🔄 Error handling and recovery
- 🔄 Mobile optimization

### Phase 2: Enhanced User Experience
- Mobile-first responsive design
- Advanced accessibility features
- Progressive Web App capabilities
- Offline mode support
- Advanced collaboration features

### Phase 3: Enterprise Features
- Advanced integrations (HR systems, LMS)
- Custom branding and white-label options
- Advanced analytics and reporting
- Multi-organization support
- Advanced security controls

### Phase 4: AI Enhancement
- Advanced personalization algorithms
- Predictive learning path recommendations
- Automated content suggestions
- Learning outcome prediction
- Advanced analytics and insights

## Contributing

### Development Guidelines
- **Code Style**: ESLint + Prettier configuration
- **TypeScript**: Strict mode with explicit types
- **Commits**: Conventional commit messages
- **PR Process**: Code review required for all changes
- **Testing**: Unit tests for business logic, integration tests for APIs

### Code Quality Standards
- **Test Coverage**: 80%+ for critical business logic
- **Performance**: <2s page loads, <500KB initial bundle
- **Accessibility**: WCAG AA compliance
- **Security**: Regular security audits and penetration testing

## Support & Contact

### Customer Support
- **Email**: support@smartslate.io
- **Response Time**: 24h for paid plans, 48h for trial users
- **Enterprise**: Dedicated success manager with 4h SLA

### Technical Support
- **Documentation**: Comprehensive setup and troubleshooting guides
- **Community**: User forums and knowledge base
- **Status Page**: System status and incident reporting

## License & Terms

- **Terms of Service**: Available at `/terms`
- **Privacy Policy**: Available at `/privacy`
- **Data Retention**: 30 days for cancelled accounts, 7 years for enterprise
- **Compliance**: GDPR, CCPA, and industry-specific regulation support

---

*Built with ❤️ by the SmartSlate team - Transforming learning through intelligent design*
