# SmartSlate Polaris v3 - AI Learning Blueprint Platform

<div align="center">

![SmartSlate Logo](https://via.placeholder.com/200x80/3b82f6/ffffff?text=SmartSlate+Polaris+v3)

**AI-Powered Learning Blueprint Generation Platform**

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38b2ac)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

*Next.js 15 • React 19 • TypeScript 5.7 • Supabase PostgreSQL • AI Integration*

</div>

## 📋 Table of Contents

1. [🎯 Overview](#-overview)
2. [🏗️ Architecture](#️-architecture)
3. [🚀 Tech Stack](#-tech-stack)
4. [📁 Project Structure](#-project-structure)
5. [🔧 Development Setup](#-development-setup)
6. [🔐 Authentication](#-authentication)
7. [🎨 Features](#-features)
8. [📊 Database Schema](#-database-schema)
9. [🤖 AI Integration](#-ai-integration)
10. [💳 Payment System](#-payment-system)
11. [🔒 Security](#-security)
12. [🧪 Testing](#-testing)
13. [📚 API Documentation](#-api-documentation)
14. [🚀 Deployment](#-deployment)
15. [📈 Monitoring](#-monitoring)
16. [🤝 Contributing](#-contributing)

## 🎯 Overview

SmartSlate Polaris v3 is an advanced AI-powered learning platform that generates personalized learning blueprints through a sophisticated two-phase questionnaire system. Users complete a static questionnaire followed by AI-generated dynamic questions, resulting in comprehensive learning blueprints tailored to their specific needs and goals.

### Key Features

- **🤖 Dual-Phase AI System**: Static questionnaire (30+ fields) → AI dynamic generation (50-70 questions) → Comprehensive blueprint
- **🔄 Triple-Fallback AI Architecture**: Claude Sonnet 4.5 → Claude Sonnet 4 → Local Ollama for maximum reliability
- **💳 Complete Subscription System**: 7-tier subscription model with Razorpay integration
- **📊 Real-time State Management**: Zustand + TanStack Query with optimistic updates
- **🎨 Premium UI/UX**: Glass morphism design with Tailwind CSS v4 and Radix UI
- **🔒 Enterprise Security**: Row-Level Security, comprehensive audit trails, role-based access

## 🏗️ Architecture

### High-Level Data Flow

```
User Authentication (Supabase Auth)
    ↓
Static Questionnaire (Phase 1 - 30+ fields)
    ↓
AI Dynamic Question Generation (Claude API)
    ↓
Dynamic Questionnaire (Phase 2 - 50-70 questions)
    ↓
AI Blueprint Generation (Comprehensive learning plan)
    ↓
Multi-format Export (PDF/Word/Markdown) + Sharing
```

### System Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend       │    │   External      │
│                 │    │                  │    │   Services      │
│ Next.js 15      │◄──►│  Supabase        │◄──►│  Claude API     │
│ React 19        │    │  PostgreSQL      │    │  Razorpay       │
│ TypeScript 5.7  │    │  RLS Security    │    │  Ollama (Local) │
│ Tailwind v4     │    │  Realtime        │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🚀 Tech Stack

### Frontend Technologies

- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19 with Server Components
- **Language**: TypeScript 5.7 (strict mode)
- **Styling**: Tailwind CSS v4 with custom design system
- **Components**: Radix UI primitives with custom implementations
- **State Management**: Zustand + TanStack Query hybrid
- **Forms**: React Hook Form + Zod validation
- **Authentication**: Supabase Auth with middleware

### Backend Technologies

- **Database**: Supabase PostgreSQL 15+
- **API**: Next.js API Routes with middleware
- **Authentication**: Supabase Auth with Row Level Security (RLS)
- **Real-time**: Supabase Realtime subscriptions
- **File Storage**: Supabase Storage with CDN

### AI & Payment Integration

- **AI Services**: Claude API (Sonnet 4.5/4) + Ollama fallback
- **Payment Gateway**: Razorpay with comprehensive webhook handling
- **Validation**: Zod schemas for API and AI responses
- **Caching**: Intelligent blueprint caching system

### Development & Deployment

- **Platform**: Vercel with optimized deployment
- **Testing**: Vitest with comprehensive test suites
- **Code Quality**: ESLint + Prettier + Husky
- **Performance**: Bundle splitting, lazy loading, CDN optimization

## 📁 Project Structure

```
polaris-v3/
├── frontend/                     # Next.js 15 application
│   ├── app/                     # App Router structure
│   │   ├── (auth)/             # Authenticated routes
│   │   │   ├── dashboard/      # User dashboard
│   │   │   ├── static-wizard/  # Static questionnaire
│   │   │   └── subscription/   # Subscription management
│   │   ├── api/                # API routes
│   │   │   ├── auth/           # Authentication endpoints
│   │   │   ├── blueprints/     # Blueprint management
│   │   │   ├── webhooks/       # Razorpay webhooks
│   │   │   └── subscriptions/  # Payment processing
│   │   └── (public)/           # Public routes
│   ├── components/             # React components
│   │   ├── ui/                 # Base UI components
│   │   ├── questionnaire/      # Questionnaire components
│   │   ├── blueprint/          # Blueprint viewers
│   │   └── auth/               # Auth components
│   ├── lib/                    # Utility libraries
│   │   ├── supabase/           # Supabase clients
│   │   ├── claude/             # AI integration
│   │   ├── razorpay/           # Payment processing
│   │   ├── auth/               # Authentication middleware
│   │   ├── stores/             # State management
│   │   └── services/           # Business logic
│   └── types/                  # TypeScript definitions
├── supabase/                   # Database configuration
│   └── migrations/             # Database migrations
├── docs/                       # Documentation
└── scripts/                    # Build and deployment scripts
```

## 🔧 Development Setup

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL 15+ (via Supabase)
- Git

### Environment Variables

Create `frontend/.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Services
ANTHROPIC_API_KEY=your_anthropic_api_key
OLLAMA_BASE_URL=http://localhost:11434  # Optional for local fallback

# Razorpay Payment Gateway
NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_key_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Application Settings
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

### Installation & Setup

```bash
# Clone the repository
git clone https://github.com/your-org/polaris-v3.git
cd polaris-v3

# Install frontend dependencies
cd frontend
npm install

# Start development server
npm run dev

# In a separate terminal, reset database (if needed)
cd ..
npm run db:reset
```

### Available Scripts

```bash
# Frontend Development (from frontend/ directory)
npm run dev              # Start development server on localhost:3000
npm run build            # Production build
npm run start            # Start production server
npm run lint             # ESLint with auto-fix
npm run format           # Prettier formatting
npm run typecheck        # TypeScript type checking

# Testing
npm run test             # Run all tests with Vitest
npm run test:watch       # Watch mode for development
npm run test:integration # Integration tests only
npm run test:coverage    # Generate coverage report

# Database Operations (from project root)
npm run db:reset         # Reset local Supabase database
npm run db:push          # Push migrations to remote
npm run db:status        # Check Supabase connection status
npm run db:migrations:new <name> # Create new migration
```

## 🔐 Authentication

### Authentication Flow

1. **User Registration/Login**: Supabase Auth with email/password or OAuth
2. **Session Management**: Server-side sessions with HTTP-only cookies
3. **Profile Creation**: Automatic user profile creation with default tier
4. **Role Assignment**: Automatic role assignment based on subscription

### Authentication Components

- **Server Components**: `getSupabaseServerClient()`, `getServerSession()`
- **Middleware**: `requireAuth()`, `requireRole()`, `requireTier()`
- **Client Components**: `ProtectedRoute`, `AuthProvider`
- **Session Management**: Automatic token refresh and session validation

### Role-Based Access Control

```typescript
// API Route Protection
import { requireAuth, requireRole } from '@/lib/auth/middleware';

const authResult = await requireAuth(request);
const roleResult = await requireRole(request, ['admin', 'developer']);
```

## 🎨 Features

### Core Features

#### 🎯 Two-Phase Questionnaire System

**Phase 1: Static Questionnaire**
- 30+ structured questions across multiple domains
- Real-time auto-save every 30 seconds
- Progress tracking and validation
- Mobile-responsive design

**Phase 2: Dynamic Questionnaire**
- AI-generated questions based on static responses
- 50-70 personalized questions across 10 sections
- Adaptive questioning based on user responses
- Section-by-section navigation

#### 🤖 AI Blueprint Generation

**Triple-Fallback Architecture**
1. **Primary**: Claude Sonnet 4.5 (cost-effective, high-quality)
2. **Fallback**: Claude Sonnet 4 (reliability)
3. **Local**: Ollama (offline capability)

**Blueprint Features**
- Comprehensive learning roadmaps
- Personalized content recommendations
- Multiple export formats (PDF, Word, Markdown)
- Shareable blueprint links

#### 💳 Subscription & Payment System

**Subscription Tiers**
- **Explorer**: Free - 2 blueprints/month
- **Navigator**: ₹29/month - 25 blueprints/month
- **Voyager**: ₹59/month - 50 blueprints/month
- **Crew**: ₹99/month - Team features
- **Fleet**: ₹199/month - Advanced collaboration
- **Armada**: ₹499/month - Enterprise features
- **Developer**: Unlimited access for development

**Payment Features**
- Razorpay integration with webhooks
- Automatic subscription management
- Usage tracking and limits
- Grace period and downgrades

#### 📊 Advanced State Management

**Zustand + TanStack Query Hybrid**
- Optimistic updates for instant UI feedback
- Automatic background sync with Supabase
- Conflict resolution with server-side timestamps
- Action history for undo/redo functionality
- Performance monitoring and debugging

### UI/UX Features

#### 🎨 Premium Design System

**Glass Morphism Design**
- Advanced backdrop filters and blur effects
- Carefully curated color palette
- Smooth animations and transitions
- Dark/light mode support
- Reduced motion accessibility

**Responsive Design**
- Mobile-first approach
- iPad-optimized layouts
- Touch-friendly interactions
- Progressive enhancement

#### ♿ Accessibility Features

- WCAG AA compliance
- Keyboard navigation support
- Screen reader compatibility
- Focus management
- ARIA labels and descriptions

## 📊 Database Schema

### Core Tables

#### `blueprint_generator`
Main data table for questionnaire and blueprint storage.

```sql
CREATE TABLE public.blueprint_generator (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  version INTEGER NOT NULL DEFAULT 1,
  static_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  dynamic_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
  dynamic_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  blueprint_json JSONB NOT NULL default '{}'::jsonb,
  blueprint_markdown TEXT,
  status TEXT NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','generating','completed','error')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `user_profiles`
User management and subscription tracking.

```sql
CREATE TABLE public.user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  subscription_tier TEXT NOT NULL DEFAULT 'explorer',
  user_role TEXT NOT NULL DEFAULT 'explorer',
  blueprint_creation_count INTEGER DEFAULT 0,
  blueprint_creation_limit INTEGER DEFAULT 2,
  blueprint_saving_count INTEGER DEFAULT 0,
  blueprint_saving_limit INTEGER DEFAULT 2,
  subscription_metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### `subscriptions`
Razorpay subscription management.

```sql
CREATE TABLE public.subscriptions (
  subscription_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  razorpay_subscription_id VARCHAR(255) NOT NULL UNIQUE,
  razorpay_plan_id VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'created',
  plan_name VARCHAR(100) NOT NULL,
  plan_amount INTEGER NOT NULL, -- Amount in paise
  subscription_tier VARCHAR(50) NOT NULL,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  next_billing_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
```

### Security Features

- **Row Level Security (RLS)**: All tables use RLS for data isolation
- **Audit Trails**: Comprehensive logging for role changes and subscriptions
- **Soft Deletes**: Data retention with soft delete functionality
- **Constraints**: Database-level validation with check constraints

## 🤖 AI Integration

### Claude API Integration

#### Service Architecture

```typescript
// lib/claude/
├── client.ts          # HTTP client with retry logic
├── config.ts          # API configuration
├── prompts.ts         # System and user prompts
├── validation.ts      # Response validation
├── fallback.ts        # Fallback logic
└── index.ts           # Service orchestration
```

#### Dual-Fallback System

**Primary Flow**: Claude Sonnet 4.5
- Cost-effective with high-quality responses
- Automatic retry with exponential backoff
- Comprehensive error handling

**Fallback Flow**: Claude Sonnet 4
- Triggered on API failures or rate limits
- Maintains service reliability
- Transparent to users

**Local Fallback**: Ollama
- Offline capability for development
- Emergency fallback during service outages
- Self-hosted models

### Question Generation

```typescript
// Dynamic question generation based on static answers
const dynamicQuestions = await claudeService.generateQuestions({
  staticAnswers: userStaticAnswers,
  context: {
    userLevel: 'intermediate',
    goals: ['career_growth', 'skill_development'],
    timeframe: '6_months'
  }
});
```

### Blueprint Generation

```typescript
// Comprehensive blueprint generation
const blueprint = await blueprintService.generate({
  staticAnswers: staticData,
  dynamicAnswers: responseData,
  context: {
    userId: user.id,
    blueprintId: blueprint.id
  }
});
```

## 💳 Payment System

### Razorpay Integration

#### Payment Flow

1. **Plan Selection**: User chooses subscription tier
2. **Checkout Creation**: Razorpay checkout session
3. **Payment Processing**: Secure payment via Razorpay
4. **Webhook Verification**: Automatic payment confirmation
5. **Subscription Activation**: User tier updated in database

#### Webhook Handling

```typescript
// Comprehensive webhook processing
app.post('/api/webhooks/razorpay', async (request) => {
  // 1. Signature verification
  const isValid = validateWebhookSignature(request);

  // 2. Event parsing and routing
  const event = parseWebhookEvent(body);
  const handler = getEventHandler(event.type);

  // 3. Business logic execution
  const result = await handler.process(event);

  // 4. Database updates and user notifications
  await updateSubscriptionStatus(result);
});
```

#### Supported Events

- `subscription.authorized`: New subscription created
- `payment.captured`: Successful payment
- `subscription.completed`: Subscription finished
- `subscription.cancelled`: User cancelled subscription

### Subscription Management

#### Tier System

| Tier | Price | Blueprints/Month | Features |
|------|-------|------------------|----------|
| Explorer | Free | 2 | Basic features |
| Navigator | ₹29 | 25 | Advanced blueprints |
| Voyager | ₹59 | 50 | Priority support |
| Crew | ₹99 | 10 | Team collaboration |
| Fleet | ₹199 | 30 | Advanced analytics |
| Armada | ₹499 | 60 | Enterprise features |
| Developer | - | Unlimited | Full access |

#### Usage Tracking

```typescript
// Atomic usage tracking
await supabase.rpc('increment_blueprint_creation_count', {
  user_id: userId
});

// Limit checking
const canCreate = await checkUserLimits(userId, 'blueprint_creation');
if (!canCreate) {
  return { error: 'Limit reached', upgradeUrl: '/pricing' };
}
```

## 🔒 Security

### Authentication & Authorization

#### Supabase Auth Integration

- **JWT Tokens**: Secure session management
- **OAuth Providers**: Google, GitHub, etc.
- **Email Verification**: Required for account activation
- **Password Reset**: Secure password recovery

#### Row Level Security (RLS)

```sql
-- Example RLS policy for blueprint access
CREATE POLICY "Users can access own blueprints"
  ON public.blueprint_generator
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
```

### API Security

#### Middleware Implementation

```typescript
// Authentication middleware
const authResult = await requireAuth(request);
if (!authResult.success) {
  return NextResponse.json({ error: authResult.error }, { status: 401 });
}

// Role-based access
const roleResult = await requireRole(request, ['admin', 'developer']);
if (!roleResult.success) {
  return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
}
```

#### Input Validation

```typescript
// Zod schema validation
const CreateBlueprintSchema = z.object({
  title: z.string().min(1).max(200),
  staticAnswers: z.record(z.any()),
  settings: z.object({
    isPublic: z.boolean().default(false),
    allowComments: z.boolean().default(false)
  }).optional()
});
```

### Data Protection

- **Encryption**: All data encrypted at rest and in transit
- **Audit Logs**: Comprehensive logging for all actions
- **Rate Limiting**: API rate limiting by user and IP
- **CORS**: Configured for production domains only

## 🧪 Testing

### Testing Architecture

#### Test Structure

```
frontend/
├── __tests__/
│   ├── unit/              # Unit tests (95%+ coverage)
│   ├── integration/       # API and database tests
│   ├── components/        # React component tests
│   ├── e2e/              # End-to-end tests
│   └── fixtures/         # Test data and factories
```

#### Testing Tools

- **Framework**: Vitest for fast unit and integration tests
- **Components**: React Testing Library for component testing
- **E2E**: Playwright for end-to-end testing
- **Coverage**: Built-in coverage reporting
- **Mocking**: Supabase and API mocking

### Running Tests

```bash
# All tests
npm run test

# Watch mode for development
npm run test:watch

# Coverage report
npm run test:coverage

# Integration tests only
npm run test:integration

# Specific test file
npm run test blueprint.test.ts
```

### Test Examples

#### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { validateBlueprintData } from '@/lib/validation';

describe('Blueprint Validation', () => {
  it('should validate correct blueprint data', () => {
    const validData = {
      title: 'Test Blueprint',
      sections: [
        {
          title: 'Section 1',
          content: 'Content here'
        }
      ]
    };

    expect(() => validateBlueprintData(validData)).not.toThrow();
  });
});
```

#### Integration Test Example

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '@/app/api/blueprints/generate/route';

describe('Blueprint Generation API', () => {
  beforeEach(async () => {
    // Setup test database
    await setupTestDatabase();
  });

  it('should generate blueprint for authenticated user', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: { staticAnswers: {}, dynamicAnswers: {} },
      user: testUser
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.blueprint).toBeDefined();
  });
});
```

## 📚 API Documentation

### Core API Endpoints

#### Authentication

```typescript
// POST /api/auth/signin
POST /api/auth/signin
{
  "email": "user@example.com",
  "password": "securepassword"
}

// Response
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "explorer"
  },
  "session": {
    "access_token": "jwt_token",
    "expires_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Blueprint Management

```typescript
// POST /api/questionnaire/save
POST /api/questionnaire/save
{
  "staticAnswers": {
    "goals": ["career_growth"],
    "experience": "intermediate",
    "timeframe": "6_months"
  },
  "blueprintId": "optional-existing-uuid"
}

// POST /api/generate-dynamic-questions
POST /api/generate-dynamic-questions
{
  "blueprintId": "uuid",
  "staticAnswers": { /* static questionnaire data */ }
}

// POST /api/blueprints/generate
POST /api/blueprints/generate
{
  "blueprintId": "uuid",
  "staticAnswers": { /* static data */ },
  "dynamicAnswers": { /* dynamic responses */ }
}
```

#### Subscription Management

```typescript
// POST /api/subscriptions/create-subscription
POST /api/subscriptions/create-subscription
{
  "planId": "navigator",
  "billingCycle": "monthly"
}

// GET /api/user/usage
GET /api/user/usage

// Response
{
  "usage": {
    "blueprintsCreated": 3,
    "blueprintsSaved": 5,
    "exportsPdf": 2,
    "exportsWord": 1
  },
  "limits": {
    "blueprintsCreated": 25,
    "blueprintsSaved": 50,
    "exportsPdf": 25,
    "exportsWord": 50
  },
  "subscription": {
    "tier": "navigator",
    "status": "active",
    "nextBilling": "2024-02-01T00:00:00Z"
  }
}
```

### Error Handling

All API endpoints follow consistent error handling:

```typescript
// Standard error response
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation_error",
    "message": "Specific error details"
  },
  "timestamp": "2024-01-01T00:00:00Z"
}
```

### Rate Limiting

API endpoints implement rate limiting:

- **General API**: 100 requests per minute per user
- **AI Generation**: 10 requests per minute per user
- **Webhook Processing**: 1000 requests per minute per IP

## 🚀 Deployment

### Vercel Deployment

#### Environment Configuration

Set up environment variables in Vercel dashboard:

```bash
# Production Environment Variables
NEXT_PUBLIC_SUPABASE_URL=production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=production_anon_key
SUPABASE_SERVICE_ROLE_KEY=production_service_role_key
ANTHROPIC_API_KEY=production_anthropic_key
NEXT_PUBLIC_RAZORPAY_KEY_ID=production_razorpay_key
RAZORPAY_KEY_SECRET=production_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=production_webhook_secret
```

#### Build Configuration

```javascript
// next.config.ts
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  images: {
    domains: ['your-cdn-domain.com'],
    formats: ['image/webp', 'image/avif']
  },
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  }
};

export default nextConfig;
```

#### Deployment Steps

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Deploy to Vercel
cd frontend
vercel --prod

# 3. Set up custom domain (optional)
vercel domains add yourdomain.com

# 4. Configure environment variables
vercel env pull .env.production

# 5. Deploy with production variables
vercel --prod
```

### Database Migration

```bash
# Push local migrations to production
cd frontend
npm run db:push

# Check migration status
npm run db:status

# Reset production database (emergency only)
npm run db:reset -- --remote
```

### Post-Deployment Checklist

- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Custom domains set up
- [ ] SSL certificates active
- [ ] API endpoints responding
- [ ] Authentication working
- [ ] Payment webhooks configured
- [ ] Error monitoring set up
- [ ] Performance monitoring active

## 📈 Monitoring

### Performance Monitoring

#### Frontend Performance

```typescript
// Performance monitoring setup
import { performanceMonitor } from '@/lib/performance/performanceMonitor';

// Monitor API calls
const metric = performanceMonitor.startTimer('api_call', {
  endpoint: '/api/blueprints/generate',
  userId: user.id
});

// API call here...

const result = metric.end();
logger.info('api_call_completed', 'API call successful', {
  duration: result.duration,
  success: true
});
```

#### Database Performance

- **Query Optimization**: Indexed queries with EXPLAIN analysis
- **Connection Pooling**: Supabase connection management
- **Caching Strategy**: Redis caching for frequently accessed data
- **Monitoring**: Built-in Supabase performance dashboard

### Error Tracking

#### Structured Logging

```typescript
// Comprehensive error logging
import { createServiceLogger } from '@/lib/logging';

const logger = createServiceLogger('blueprint-service');

try {
  await generateBlueprint(data);
} catch (error) {
  logger.error('blueprint_generation_failed', 'Failed to generate blueprint', {
    blueprintId: data.blueprintId,
    userId: data.userId,
    error: error.message,
    stack: error.stack,
    context: {
      phase: 'ai_generation',
      model: 'claude-sonnet-4-5',
      attempts: 3
    }
  });
}
```

#### Health Checks

```typescript
// GET /api/health
app.get('/api/health', async () => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      database: await checkDatabaseHealth(),
      ai_service: await checkAIServiceHealth(),
      payment_gateway: await checkPaymentHealth()
    }
  };

  return Response.json(health);
});
```

### Analytics

#### User Analytics

- **Blueprint Generation**: Track generation success rates and patterns
- **User Behavior**: Questionnaire completion and engagement metrics
- **Subscription Analytics**: Conversion rates and churn analysis
- **Performance Metrics**: API response times and error rates

#### Business Intelligence

```typescript
// Analytics tracking
import { analytics } from '@/lib/analytics';

analytics.track('blueprint_generated', {
  userId: user.id,
  blueprintId: blueprint.id,
  generationTime: duration,
  modelUsed: 'claude-sonnet-4-5',
  fallbackUsed: false,
  subscriptionTier: user.subscription_tier
});
```

## 🤝 Contributing

### Development Workflow

#### 1. Fork and Clone

```bash
git clone https://github.com/your-username/polaris-v3.git
cd polaris-v3
```

#### 2. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

#### 3. Development Setup

```bash
cd frontend
npm install
cp .env.example .env.local
# Configure .env.local with your development keys
npm run dev
```

#### 4. Make Changes

- Follow TypeScript strict mode guidelines
- Write tests for new functionality
- Update documentation as needed
- Ensure all tests pass: `npm run test`

#### 5. Commit and Push

```bash
git add .
git commit -m "feat: add your feature description"
git push origin feature/your-feature-name
```

#### 6. Pull Request

- Create detailed PR description
- Include screenshots for UI changes
- Ensure CI/CD checks pass
- Request code review from team members

### Code Standards

#### TypeScript Guidelines

```typescript
// ✅ DO: Use explicit types
interface BlueprintData {
  id: string;
  title: string;
  sections: BlueprintSection[];
  createdAt: Date;
}

// ❌ DON'T: Use 'any' type
function processBlueprint(data: any): any {
  // Avoid implicit any types
}

// ✅ DO: Use discriminated unions
type Status = 'draft' | 'generating' | 'completed' | 'error';

// ✅ DO: Use proper error handling
async function generateBlueprint(data: BlueprintData): Promise<Blueprint> {
  try {
    return await blueprintService.generate(data);
  } catch (error) {
    logger.error('generation_failed', 'Blueprint generation failed', {
      blueprintId: data.id,
      error: error.message
    });
    throw new BlueprintGenerationError('Failed to generate blueprint', error);
  }
}
```

#### Component Guidelines

```tsx
// ✅ DO: Use proper TypeScript and accessibility
interface ButtonProps {
  children: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  'aria-label'?: string;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  ...ariaProps
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        disabled && disabledClasses
      )}
      {...ariaProps}
    >
      {children}
    </button>
  );
};
```

### Testing Guidelines

#### Test Coverage Requirements

- **Unit Tests**: 95%+ coverage for business logic
- **Integration Tests**: 85%+ coverage for API endpoints
- **Component Tests**: All interactive components tested
- **E2E Tests**: Critical user paths covered

#### Test Writing Standards

```typescript
// ✅ DO: Write descriptive test names
describe('Blueprint Generation Service', () => {
  it('should generate blueprint with valid data', async () => {
    // Test implementation
  });

  it('should handle AI service failures gracefully', async () => {
    // Test error handling
  });

  it('should cache generated blueprints for identical inputs', async () => {
    // Test caching behavior
  });
});
```

### Git Commit Convention

```bash
# Format: <type>(<scope>): <description>

# Types:
feat:     New feature
fix:      Bug fix
docs:     Documentation change
style:    Code formatting change
refactor: Code refactoring
test:     Test addition/modification
chore:    Build process or dependency change

# Examples:
feat(auth): add OAuth provider support
fix(blueprint): resolve caching issue
docs(api): update API documentation
test(questionnaire): add integration tests
```

### License

By contributing to SmartSlate Polaris v3, you agree that your contributions will be licensed under the same license as the project.

---

## 📞 Support

For support and questions:

- **Documentation**: [docs/](./docs/)
- **Issues**: [GitHub Issues](https://github.com/your-org/polaris-v3/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-org/polaris-v3/discussions)
- **Email**: support@smartslate.dev

---

<div align="center">

**Built with ❤️ by the SmartSlate Team**

*Next.js 15 • React 19 • TypeScript • Supabase • AI Integration*

</div>