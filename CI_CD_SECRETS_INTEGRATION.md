# CI/CD Secrets Integration Guide

## Overview
This document provides comprehensive guidance for securely managing secrets and environment variables in CI/CD pipelines and deployment platforms.

## 🚀 Vercel Deployment Configuration

### Environment Variables Setup

#### 1. Access Vercel Dashboard
1. Go to [vercel.com](https://vercel.com) and sign in
2. Navigate to your project dashboard
3. Go to **Settings** → **Environment Variables**

#### 2. Required Environment Variables

Add these environment variables in your Vercel project settings:

```bash
# ==============================================================================
# PRODUCTION ENVIRONMENT VARIABLES
# ==============================================================================

# Application Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app

# Supabase Database (Required)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# Authentication
NEXTAUTH_URL=https://your-domain.vercel.app
NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32

# AI API Keys (Server-side only)
ANTHROPIC_API_KEY=sk-ant-your_production_claude_key
PERPLEXITY_API_KEY=pplx-your_production_perplexity_key
OPENAI_API_KEY=sk-your_production_openai_key

# Optional: OpenAI Configuration
OPENAI_BASE_URL=https://api.openai.com
OPENAI_MODEL=gpt-4o-mini
OPENAI_MAX_TOKENS=4096

# Optional: Perplexity Configuration
PERPLEXITY_BASE_URL=https://api.perplexity.ai
PERPLEXITY_MODEL=sonar
PPLX_SERVER_TIMEOUT_MS=50000

# Optional: Anthropic Configuration
ANTHROPIC_BASE_URL=https://api.anthropic.com
ANTHROPIC_MODEL=claude-3-5-sonnet-latest
ANTHROPIC_VERSION=2023-06-01
ANTHROPIC_MAX_TOKENS=12000

# Optional: Webhook Configuration
WEBHOOK_SECRET=your_webhook_secret_here
WEBHOOK_BASE_URL=https://your-domain.vercel.app/api/webhooks
WEBHOOK_TIMEOUT_MS=10000
WEBHOOK_MAX_RETRIES=3
```

#### 3. Environment Variable Scopes

Set the correct scope for each variable:

- **Production**: Variables that should only be available in production
- **Preview**: Variables for staging/preview deployments
- **Development**: Variables for all environments (use sparingly)

#### 4. Security Best Practices

##### Variable Naming
- Use descriptive names that don't reveal the service
- Avoid patterns that make it obvious what service they belong to
- Use consistent naming conventions across environments

##### Access Control
- Set environment variables before deploying to production
- Use Vercel's environment variable protection features
- Regularly audit who has access to environment variables

##### Rotation Schedule
- **API Keys**: Rotate every 90 days
- **Database Credentials**: Rotate every 180 days
- **Webhook Secrets**: Rotate every 365 days

## 🔧 GitHub Actions Integration (Optional)

If using GitHub Actions for additional CI/CD:

### 1. Repository Secrets
Add these to your GitHub repository settings (Settings → Secrets and variables → Actions):

```bash
# Vercel Token for automated deployments
VERCEL_TOKEN=your_vercel_token_here

# Optional: Additional secrets for testing
TEST_SUPABASE_URL=https://your-test-project.supabase.co
TEST_SUPABASE_SERVICE_ROLE_KEY=your_test_service_role_key
```

### 2. Secure Actions Workflow
```yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Vercel CLI
        run: npm install -g vercel

      - name: Deploy to Vercel
        run: vercel --prod --token ${{ secrets.VERCEL_TOKEN }}
        env:
          # Vercel will use environment variables from dashboard
          # No need to pass secrets through workflow
```

## 🧪 Testing Environment Variables

### Local Development Testing
```bash
# Verify environment variables are loaded correctly
node -e "console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')"
node -e "console.log('CLAUDE_KEY:', process.env.ANTHROPIC_API_KEY ? '✅ Set' : '❌ Missing')"
```

### Production Testing
```bash
# Test API endpoints with production environment
curl -H "Authorization: Bearer $PRODUCTION_TOKEN" \
     https://your-domain.vercel.app/api/claude/generate-blueprint
```

## 🔒 Security Monitoring

### Log Monitoring
Monitor your deployment platform logs for:
- Failed API authentication attempts
- Unusual API usage patterns
- Environment variable access attempts

### API Usage Monitoring
Set up monitoring for:
- API key usage rates
- Error rates by service
- Response times and timeouts

### Automated Alerts
Configure alerts for:
- API key expiration (if supported)
- Rate limit warnings
- Authentication failures

## 📋 Environment Variable Checklist

### Before Deployment
- [ ] All required environment variables set in Vercel dashboard
- [ ] Production values differ from development values
- [ ] Sensitive variables marked as "Production" scope only
- [ ] Test deployment with environment variables

### After Deployment
- [ ] Verify API endpoints return 200 status
- [ ] Check application logs for environment variable errors
- [ ] Monitor API usage for anomalies
- [ ] Test all integrated services (Supabase, AI APIs)

## 🚨 Emergency Procedures

### If Secrets Are Exposed
1. **Immediate Response**:
   ```bash
   # Regenerate all exposed API keys
   # Update Vercel environment variables immediately
   vercel env rm EXPOSED_VARIABLE production
   vercel env add NEW_VARIABLE production
   ```

2. **Rotate All Keys**:
   - Generate new API keys for all services
   - Update Vercel environment variables
   - Redeploy application
   - Monitor for unauthorized usage

3. **Incident Documentation**:
   - Document what was exposed and when
   - Identify root cause
   - Implement additional security measures

## 🔄 Maintenance Schedule

### Weekly
- Review deployment logs for security issues
- Check API usage patterns for anomalies

### Monthly
- Verify all environment variables are still valid
- Test API key rotation procedures

### Quarterly
- Rotate all API keys
- Audit environment variable access logs
- Update security documentation

### Annually
- Comprehensive security audit
- Review and update credential rotation policies
- Update emergency response procedures

---

**Last Updated**: October 2, 2025
**Next Review**: January 2, 2026
