# Archived Applications

This directory contains applications that have been removed from the main codebase but preserved for reference and potential future use.

## smartslate-app-removed-20251002

**Archive Date:** October 2, 2025
**Branch:** `archive/smartslate-app`
**Files:** 78 files
**Reason for Archival:** Unused Vite-based application with no production dependencies

### Background
The `smartslate-app` was a React/Vite application that was not deployed or used in production. A comprehensive dependency audit (Task #24) confirmed:

- Zero imports from the production frontend application
- No references in deployment configurations
- Not included in any CI/CD pipelines
- Served as a development/testing environment only

### Archival Process
1. **Created Archive Branch:** `archive/smartslate-app`
2. **Moved Directory:** `smartslate-app/` → `.archive/smartslate-app-removed-20251002/`
3. **Committed Changes:** Added descriptive commit message referencing the audit findings
4. **Pushed to Remote:** Archive branch pushed to GitHub for permanent storage

### Recovery Process
If needed in the future:
```bash
# Checkout the archive branch
git checkout archive/smartslate-app

# Restore the application
git checkout HEAD -- smartslate-app/
# or
cp -r .archive/smartslate-app-removed-20251002/ ./smartslate-app/

# Commit the restoration
git add smartslate-app/
git commit -m "feat: restore smartslate-app from archive"
```

### Contact
For questions about this archival, reference Task #25 in the project task management system.
