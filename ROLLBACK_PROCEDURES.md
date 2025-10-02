# Repository Rollback Procedures

## Overview
This document provides comprehensive rollback procedures for the SmartSlate Polaris v3 repository in case of emergency situations during cleanup and consolidation operations.

## Emergency Contact Information
- **Repository Owner**: Jitin M Nair
- **Backup Location**: `/home/jitin-m-nair/Desktop/smartslate-polaris-v3-backup/`
- **Mirror Backup**: `smartslate-polaris-v3-mirror.git`
- **Pre-cleanup Tag**: `pre-cleanup-backup-YYYYMMDD-HHMMSS` (latest: `pre-cleanup-backup-$(date +%Y%m%d-%H%M%S)`)

## Emergency Rollback Scenarios

### Scenario 1: Critical Data Loss
**When**: Complete repository corruption or critical file deletion.

**Immediate Actions**:
1. **Stop all work** on the affected branch
2. **Notify team members** about the rollback
3. **Preserve current state** if partially recoverable

**Rollback Steps**:
```bash
# Navigate to backup location
cd /home/jitin-m-nair/Desktop/smartslate-polaris-v3-backup

# Extract the latest backup
tar -xzf smartslate-polaris-v3-backup-*.tar.gz

# Navigate to project directory
cd /home/jitin-m-nair/Desktop/smartslate-polaris-v3

# Reset to backup state (WARNING: This will overwrite current changes)
git reset --hard HEAD
git clean -fd

# Restore from mirror backup
git clone /home/jitin-m-nair/Desktop/smartslate-polaris-v3-backup/smartslate-polaris-v3-mirror.git temp-restore
cp -r temp-restore/. .
rm -rf temp-restore

# Verify restoration
git log --oneline -5
git status
```

### Scenario 2: Branch Corruption
**When**: Specific branch becomes corrupted or has critical issues.

**Rollback Steps**:
```bash
# Delete corrupted branch
git branch -D feature/corrupted-branch

# Restore from pre-cleanup tag
git checkout pre-cleanup-backup-YYYYMMDD-HHMMSS
git checkout -b feature/restored-branch

# Push restored branch
git push origin feature/restored-branch
```

### Scenario 3: Production Deployment Failure
**When**: Production deployment fails after cleanup changes.

**Rollback Steps**:
```bash
# Quick revert to last known good state
git revert HEAD --no-edit
git push origin main

# Or reset to specific commit if needed
git reset --hard <last-good-commit-hash>
git push origin main --force-with-lease
```

## Testing Rollback Procedures

### Test Environment Setup
```bash
# Create test directory
mkdir -p /home/jitin-m-nair/Desktop/rollback-test
cd /home/jitin-m-nair/Desktop/rollback-test

# Clone fresh copy for testing
git clone /home/jitin-m-nair/Desktop/smartslate-polaris-v3-backup/smartslate-polaris-v3-mirror.git test-repo
cd test-repo

# Make test changes
echo "# Test change" >> README.md
git add README.md
git commit -m "Test change for rollback testing"
```

### Execute Test Rollback
```bash
# Simulate rollback from backup
cd /home/jitin-m-nair/Desktop/rollback-test/test-repo
git reset --hard HEAD~1  # Remove test commit

# Verify rollback
git log --oneline -3
git status
```

### Cleanup Test Environment
```bash
cd /home/jitin-m-nair/Desktop
rm -rf rollback-test
```

## Verification Checklist

After any rollback, verify:

- [ ] Repository builds successfully (`npm run build`)
- [ ] All tests pass (`npm test`)
- [ ] Git history is intact
- [ ] No uncommitted changes remain
- [ ] Remote branches are synchronized
- [ ] Team members are notified

## Automated Rollback Scripts

### Emergency Reset Script
```bash
#!/bin/bash
# emergency-reset.sh

echo "🚨 EMERGENCY REPOSITORY RESET"
echo "This will restore from the latest backup tag"
read -p "Are you sure? (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🔄 Restoring from backup..."
    git reset --hard pre-cleanup-backup-$(date +%Y%m%d)*
    git push origin main --force-with-lease
    echo "✅ Repository restored"
else
    echo "❌ Operation cancelled"
fi
```

## Maintenance

- **Backup Verification**: Test backup integrity monthly
- **Tag Updates**: Create new snapshot tags before major changes
- **Documentation Updates**: Keep this document current with repository changes
- **Team Training**: Ensure all team members understand rollback procedures

## Support Resources

- **Git Documentation**: https://git-scm.com/docs
- **GitHub Branch Protection**: https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/defining-the-mergeability-of-pull-requests/managing-a-branch-protection-rule
- **Repository Backup Strategy**: See `BACKUP_STRATEGY.md`
