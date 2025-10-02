# Developer Secrets Management Onboarding

## 🎯 Welcome to SmartSlate Polaris v3

This guide will help you set up your development environment securely and understand our secrets management practices.

## 🚨 Security First Mindset

**Critical**: Never commit secrets, API keys, or sensitive credentials to version control. This project uses automated tools to prevent accidental exposure.

## 🛠️ Initial Setup

### 1. Environment Variables Setup

#### Copy the Template
```bash
# In the project root
cp .env.example .env.local
```

#### Edit Your Local Environment File
```bash
# Open .env.local and add your actual values:
# NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
# ANTHROPIC_API_KEY=sk-ant-your_actual_claude_key
# PERPLEXITY_API_KEY=pplx-your_actual_perplexity_key
```

**Important**: `.env.local` is automatically gitignored and will never be committed.

### 2. API Key Setup

#### Required API Keys
You'll need accounts and API keys for:

1. **Supabase** (Database)
   - Create account at [supabase.com](https://supabase.com)
   - Create new project
   - Copy URL and anon key from dashboard

2. **Anthropic Claude** (AI)
   - Create account at [anthropic.com](https://anthropic.com)
   - Generate API key from console
   - Keys start with `sk-ant-`

3. **Perplexity AI** (Research)
   - Create account at [perplexity.ai](https://perplexity.ai)
   - Generate API key from dashboard
   - Keys start with `pplx-`

#### Optional API Keys
- **OpenAI** (Fallback AI) - `sk-` prefixed keys

## 🔒 Secrets Management Tools

### git-secrets (Automatic Protection)

This repository uses `git-secrets` to automatically detect and prevent commits containing secrets.

#### How It Works
- Scans all files before commits
- Blocks commits containing API keys, passwords, or other secrets
- Provides helpful error messages and remediation steps

#### What It Detects
- SSH private keys (`-----BEGIN OPENSSH PRIVATE KEY-----`)
- API keys (`sk-ant-*`, `pplx-*`, `sk-*`)
- Passwords in configuration (`password = "secret"`)
- AWS access keys and other common secret patterns

#### If You Get Blocked
```bash
# If git-secrets blocks your commit:
git secrets --list  # See what patterns matched
git config --add secrets.allowed your-pattern-here  # Allow false positives
# Or fix the actual secret in your code
```

### .gitignore Protection

The repository is configured to ignore:
- All `.env*` files
- SSH keys and certificates (`*.key`, `*.pem`, `*.crt`)
- API key files and credential directories
- Cursor MCP configuration (contains API keys)

## 🚀 Development Workflow

### Starting Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# The app will load with your local environment variables
```

### Making Changes Safely
1. **Environment Variables Only**: Never hardcode secrets in source code
2. **Test Locally**: Verify your changes work with your local API keys
3. **Commit Safely**: git-secrets will catch any accidental secret exposure

### Testing with Different APIs
```typescript
// In your code, check for API availability
const claudeAvailable = !!process.env.ANTHROPIC_API_KEY;
const perplexityAvailable = !!process.env.PERPLEXITY_API_KEY;

// Graceful fallbacks if APIs aren't configured
if (!claudeAvailable) {
  // Use alternative AI or show user-friendly error
}
```

## 🔧 Troubleshooting Common Issues

### "API Key Not Configured" Errors

**Symptom**: Application shows API errors or falls back to demo mode

**Solutions**:
1. Check `.env.local` exists and has correct values
2. Verify API keys are valid and have credits
3. Check API service status (Anthropic, Perplexity dashboards)
4. Ensure no typos in environment variable names

### "git-secrets Blocked My Commit"

**Symptom**: Commit fails with "Matched one or more prohibited patterns"

**Solutions**:
1. Check what pattern matched: `git secrets --list`
2. If false positive: `git config --add secrets.allowed your-pattern`
3. If actual secret: Remove it from your code immediately
4. Re-commit after fixing

### Environment Variables Not Loading

**Symptom**: `process.env.VARIABLE_NAME` is undefined

**Solutions**:
1. Ensure `.env.local` exists in project root
2. Restart development server after adding variables
3. Check for typos in variable names
4. Verify file permissions (should be readable)

### Production Deployment Issues

**Symptom**: App works locally but fails in production

**Solutions**:
1. Check Vercel environment variables are set correctly
2. Ensure production values match expected formats
3. Verify API keys have production access/credits
4. Check deployment logs in Vercel dashboard

## 📋 Code Review Checklist

When reviewing pull requests, check for:

- [ ] No hardcoded API keys or secrets in source code
- [ ] Environment variables used correctly (`process.env.VARIABLE`)
- [ ] Error handling for missing API keys
- [ ] No accidental commits of `.env` files
- [ ] Proper fallback behavior when APIs unavailable

## 🔄 Rotating Secrets

### When to Rotate
- **API Keys**: Every 90 days (quarterly)
- **Database Credentials**: Every 180 days (biannually)
- **After Security Incidents**: Immediately

### How to Rotate
1. Generate new API keys from service dashboards
2. Update local `.env.local` file
3. Update Vercel environment variables
4. Deploy updated configuration
5. Invalidate old keys after confirming new ones work

### Emergency Rotation
If a secret is compromised:
```bash
# 1. Generate new keys immediately
# 2. Update all environments (local, staging, production)
# 3. Deploy changes
# 4. Monitor for unauthorized usage
# 5. Document incident for security review
```

## 🚨 Security Incident Response

### If You Accidentally Commit Secrets

**IMMEDIATE ACTION REQUIRED**:

1. **Stop all work** on that branch
2. **Remove the commit**:
   ```bash
   git reset --hard HEAD~1  # Remove last commit
   # OR for older commits:
   git revert <commit-hash>  # Create reverting commit
   ```

3. **Clean git history**:
   ```bash
   ./git-secrets --scan  # Check for remaining secrets
   git push --force-with-lease origin branch-name  # Force push clean history
   ```

4. **Rotate all exposed credentials**:
   - Generate new API keys
   - Update all environment configurations
   - Test that new keys work

5. **Notify team** of the incident

### Reporting Incidents
- **Immediate**: Alert repository owner
- **Documentation**: Log incident in security documentation
- **Review**: Schedule security review to prevent recurrence

## 📚 Additional Resources

- [CREDENTIAL_ROTATION_GUIDE.md](./CREDENTIAL_ROTATION_GUIDE.md) - Detailed rotation procedures
- [CI_CD_SECRETS_INTEGRATION.md](./CI_CD_SECRETS_INTEGRATION.md) - Deployment configuration
- [SECURITY_CLEANUP_VERIFICATION.md](./SECURITY_CLEANUP_VERIFICATION.md) - Security audit results
- [Supabase Documentation](https://supabase.com/docs) - Database setup
- [Anthropic API Docs](https://docs.anthropic.com/) - Claude integration
- [Perplexity API Docs](https://docs.perplexity.ai/) - Research API

## ✅ Onboarding Checklist

- [ ] Set up local `.env.local` file with API keys
- [ ] Verify application starts and APIs work
- [ ] Understand git-secrets protection
- [ ] Know how to handle blocked commits
- [ ] Understand credential rotation procedures
- [ ] Know who to contact for security incidents

---

**Questions?** Contact the repository owner or check the security documentation in this repository.

**Remember**: Security is everyone's responsibility. When in doubt, ask before committing!
