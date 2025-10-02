# Credential Rotation Guide

## Overview
This document provides comprehensive guidance for rotating credentials that were exposed during the security cleanup process.

## 🔐 SSH Key Rotation

### SSH Keys Removed
- **Files Removed**: `sshkey` (private key) and `sshkey.pub` (public key)
- **Key Type**: Ed25519 SSH key pair
- **Exposure**: Keys were committed to repository root directory

### Rotation Steps

#### 1. Generate New SSH Key Pair
```bash
# Generate new Ed25519 key pair
ssh-keygen -t ed25519 -C "jitin@smartslate.io" -f ~/.ssh/smartslate_production

# Set proper permissions
chmod 600 ~/.ssh/smartslate_production
chmod 644 ~/.ssh/smartslate_production.pub
```

#### 2. Update Server Access
```bash
# Copy public key to servers that need access
ssh-copy-id -i ~/.ssh/smartslate_production.pub user@server1
ssh-copy-id -i ~/.ssh/smartslate_production.pub user@server2

# Or manually add to authorized_keys
cat ~/.ssh/smartslate_production.pub >> ~/.ssh/authorized_keys
```

#### 3. Update Local SSH Configuration
```bash
# Update ~/.ssh/config if using named hosts
echo "Host production-server
  HostName server.example.com
  User jitin
  IdentityFile ~/.ssh/smartslate_production" >> ~/.ssh/config
```

#### 4. Test New Key
```bash
# Test connection with new key
ssh -i ~/.ssh/smartslate_production user@server.example.com
```

#### 5. Remove Old Keys from Servers
```bash
# On each server, remove the old public key from authorized_keys
# The old key fingerprint was: SHA256:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

## 🔑 API Key Rotation

### API Keys Removed
- **Perplexity API Key**: Hardcoded key removed from `frontend/smartslate-polaris/src/config/env.ts`
- **Location**: Previously used as fallback in environment configuration
- **Exposure**: Hardcoded in source code and configuration files

### Rotation Steps

#### 1. Generate New API Keys
```bash
# Perplexity AI - Generate new API key from dashboard
# Claude/Anthropic - Generate new API key from console
# OpenAI - Generate new API key from platform
```

#### 2. Update Environment Variables
```bash
# Update local environment files
echo "PERPLEXITY_API_KEY=pplx-new-key-here" >> .env.local
echo "ANTHROPIC_API_KEY=sk-ant-new-key-here" >> .env.local

# Update production environment (Vercel/Netlify)
vercel env add PERPLEXITY_API_KEY production
vercel env add ANTHROPIC_API_KEY production
```

#### 3. Update Documentation
- Remove all references to old API keys from documentation
- Update example environment files (`.env.example`)
- Remove hardcoded keys from configuration files

#### 4. Test API Integration
```bash
# Test that new keys work with the application
npm run dev
# Verify API calls work in browser console
```

## 🛠️ Development Environment Setup

### For Local Development
```bash
# Create .env.local file
cp .env.example .env.local

# Add your new API keys
echo "PERPLEXITY_API_KEY=pplx-your-new-key" >> .env.local
echo "ANTHROPIC_API_KEY=sk-ant-your-new-key" >> .env.local
```

### For Production Deployment
```bash
# Set environment variables in deployment platform
vercel env add PERPLEXITY_API_KEY production
vercel env add ANTHROPIC_API_KEY production

# Pull latest environment variables
vercel env pull .env.local
```

## 🔒 Security Best Practices

### Immediate Actions Taken
- ✅ Removed SSH private key from repository
- ✅ Removed hardcoded API keys from source code
- ✅ Updated fallback mechanisms to require environment variables
- ✅ Cleaned git history of sensitive data

### Ongoing Security Measures
- **Environment Variables Only**: All secrets must come from environment variables
- **No Hardcoded Secrets**: Code should never contain actual secrets
- **Regular Rotation**: Rotate API keys quarterly
- **Access Monitoring**: Monitor API key usage and access logs
- **Git Secrets Scanning**: Use tools like `git-secrets` to prevent future exposures

## 📋 Verification Checklist

- [ ] New SSH keys generated and tested
- [ ] Old SSH keys removed from all servers
- [ ] New API keys generated for all services
- [ ] Environment variables updated in all environments
- [ ] Application tested with new credentials
- [ ] Documentation updated to remove old keys
- [ ] Git history verified to be clean

## 🚨 Emergency Contacts

If credentials are compromised in the future:

1. **Immediate Response**: Generate new keys and invalidate old ones
2. **Team Notification**: Alert all team members of the breach
3. **Service Monitoring**: Check for unauthorized usage
4. **Incident Documentation**: Log the incident for security review

## 🔄 Regular Maintenance

- **Monthly**: Review git history for any accidental secret commits
- **Quarterly**: Rotate API keys and SSH keys
- **Annually**: Audit all credentials and access permissions
- **Post-Incident**: Update security procedures based on lessons learned

---

**Last Updated**: October 2, 2025
**Next Rotation Due**: January 2, 2026
