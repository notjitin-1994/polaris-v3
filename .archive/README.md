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

## frontend/smartslate-polaris-removed-20251002

**Archive Date:** October 2, 2025
**Branch:** `feature/codebase-cleanup-consolidation` (removed from main branch)
**Files:** 199 files (22 components migrated, 177 files removed)
**Reason for Removal:** Duplicate nested Vite application with no production usage

### Background
The `frontend/smartslate-polaris` was a nested React/Vite application that duplicated functionality from the main Next.js frontend. A comprehensive component analysis (Task #26) revealed:

- 22 unique components that provided value
- 177 files that were redundant or unused
- No production deployment or usage
- Confusing development workflow with duplicate applications

### Migration Process
1. **Component Analysis:** Identified 22 unique components not present in main frontend
2. **Component Migration:** Moved valuable components to `frontend/src/components/features/`
3. **Service Migration:** Moved `polarisJobsService.ts` to `frontend/lib/services/`
4. **Dependency Updates:** Updated import paths and resolved all dependencies
5. **Application Removal:** Completely removed the nested application directory

### Migrated Components
The following 22 components were migrated to the main frontend:

**Core Components:**
- `AIReportEditor.tsx` & `AIReportEditor.css` - AI-powered report editing
- `AIReportEditorEnhanced.tsx` - Enhanced AI report editor
- `RichTextEditor.tsx` - Rich text editing capabilities

**Background & Animation:**
- `AnimatedSwirlBackground.tsx` - Animated background component
- `StarryBackground.tsx` - Star field background
- `StaticSwirls.tsx` - Static swirl animations

**Debug & Development:**
- `DevDebugButton.tsx` - Development debugging tools
- `LazyLoad.tsx` - Component lazy loading utility
- `WebhookMonitor.tsx` - Webhook monitoring interface

**Starmap Features:**
- `EnhancedStarmapCard.tsx` - Enhanced starmap card display
- `StarmapCard.tsx` - Basic starmap card component
- `StarmapJobCard.tsx` - Starmap job status cards
- `StarmapJobsDashboard.tsx` - Starmap jobs management dashboard
- `StarmapWizard.tsx` - Starmap creation wizard

**Polaris Features:**
- `PolarisJobsDashboard.tsx` - Polaris jobs dashboard
- `PolarisJobViewer.tsx` - Polaris job viewer
- `PolarisPerks.tsx` - Polaris perks display

**Utility Components:**
- `EnhancedReportDisplay.tsx` - Enhanced report display
- `ReportJobsMonitor.tsx` - Report job monitoring
- `SmallScreenNotice.tsx` - Small screen notification
- `SolaraLodestar.tsx` - Solara lodestar component
- `SwirlField.tsx` - Swirl field animation
- `ui/IconButton.tsx` - Icon button component

### Files Removed
- 177 files from the nested application
- Complete removal of duplicate API routes, services, and utilities
- Eliminated duplicate configuration files and build setup

### Benefits Achieved
- **Simplified Architecture:** Single application instead of nested duplicates
- **Reduced Complexity:** Eliminated confusion between applications
- **Preserved Functionality:** All valuable components migrated to main app
- **Easier Maintenance:** Single codebase to maintain and deploy
- **Better Performance:** Reduced bundle size and build complexity

### Verification
- ✅ Build completes successfully in 2.9s
- ✅ Development server starts correctly
- ✅ All imports resolve without errors
- ✅ No functionality lost in migration
- ✅ Linting issues in migrated components documented for future cleanup

### Future Considerations
- Migrated components may need linting cleanup (gradients, inline styles, semantic tokens)
- Consider gradual refactoring of migrated components to match main app standards
- Monitor for any missing dependencies or import issues

### Contact
For questions about this migration and removal, reference Task #26 in the project task management system.
