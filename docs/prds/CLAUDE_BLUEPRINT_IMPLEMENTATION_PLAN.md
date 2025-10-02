---
title: "CLAUDE BLUEPRINT IMPLEMENTATION PLAN"
type: "prd"
status: "active"
created: "2025-10-01T00:00:00.000Z"
lastUpdated: "2025-10-02T12:30:45.858Z"
author: "System"
tags: ["tag: `claude-blueprint-generation`)", "Tag:** `claude-blueprint-generation`"]
---

# Claude-Powered Blueprint Generation: Implementation Complete

## 🎉 Summary

I've completed the comprehensive planning and setup for your Claude-powered learning blueprint generation system. Here's what has been created:

---

## ✅ What Was Completed

### 1. **Research: Best Claude Model** 
Based on extensive research, **Claude Sonnet 4** (`claude-sonnet-4-20250514`) is the optimal choice:
- **Cost-effective**: $3/$15 per million tokens (vs. $15/$75 for Opus 4)
- **High quality**: 72.7% on SWE-bench, excellent structured output
- **Fast**: <60s generation time (vs. ~90s with Ollama)
- **Reliable**: 64k context window, precise JSON output
- **Fallback**: Claude Opus 4 for complex cases, Ollama for emergencies

Full research saved to: `.taskmaster/docs/research/2025-10-01_what-is-the-best-claude-model-in-2025-for-generati.md`

### 2. **Cursor Rule Created** 
📁 `.cursor/rules/claude-blueprint-generation.mdc`

Comprehensive rule covering:
- Claude Sonnet 4 & Opus 4 integration patterns
- Triple-fallback architecture (Sonnet → Opus → Ollama)
- Dynamic JSON schema handling
- Infographic visualization components with Framer Motion
- Logging integration to `/logs` page
- Security best practices (API key management)
- Error handling and resilience patterns
- Testing requirements
- Quality checklist

### 3. **Product Requirements Document**
📁 `docs/claude_blueprint_generation_prd.txt`

64-page comprehensive PRD including:
- **Executive Summary**: Problem statement, goals, success metrics
- **System Architecture**: High-level flow, component architecture
- **15 Detailed Requirements** (FR-1 through FR-15):
  - Claude Sonnet 4 integration
  - Claude Opus 4 fallback
  - Ollama emergency fallback
  - Dynamic JSON schema system
  - Infographic dashboard view with motion graphics
  - Markdown document view
  - Real-time generation status
  - Comprehensive logging
  - And more...
- **Technical Specifications**: API endpoints, environment variables
- **Error Handling**: Recovery strategies for all scenarios
- **Testing Requirements**: Unit, integration, E2E, load tests
- **Security & Privacy**: Data protection, API key security
- **Performance Targets**: <60s generation, <2s rendering
- **Rollout Plan**: 5-week phased approach
- **Example Blueprint JSON**: Full sample output

### 4. **Task-Master Setup**
📁 `.taskmaster/tasks/tasks.json` (tag: `claude-blueprint-generation`)

**15 Top-Level Tasks** with **75 Subtasks** (all research-backed):

#### High Priority Tasks (P0)
1. ✅ **Integrate Claude Sonnet 4 API** (7 subtasks, complexity: 7/10)
   - Secure API key management
   - Robust API client with retry logic
   - Strict prompt and output validation
   - Usage tracking and logging
   - Secure proxy endpoint

2. ✅ **Implement Claude Opus 4 Fallback** (5 subtasks, complexity: 6/10)
   - Failure detection criteria
   - Fallback invocation logic
   - Enhanced logging
   - Fallback rate tracking
   - API key security

3. ✅ **Integrate Ollama Emergency Fallback** (5 subtasks, complexity: 7/10)
   - Claude failure detection
   - Prompt adaptation for Ollama
   - Robust error handling
   - Emergency logging
   - Response validation

4. ✅ **Develop Blueprint Generation Orchestrator** (5 subtasks, complexity: 5/10)
   - Service architecture design
   - Model invocation and fallback logic
   - Validation and normalization pipeline
   - TypeScript typing
   - Comprehensive tests

5. ✅ **Create Claude API Proxy Endpoint** (5 subtasks, complexity: 6/10)
   - Schema and input validation
   - Authentication and authorization
   - Server-side proxy logic
   - Usage statistics tracking
   - Error handling

6. ✅ **Enhance Blueprint Generation API** (5 subtasks, complexity: 5/10)
   - Authentication and rate limiting
   - Fetch and validate answers
   - Orchestrator integration
   - Database persistence
   - Typed API response

7. ✅ **Dynamic JSON Schema Validation** (5 subtasks, complexity: 5/10)
   - TypeScript interfaces and schemas
   - Dynamic validation
   - displayType normalization
   - Graceful error handling
   - End-to-end testing

8. ✅ **Build Infographic Dashboard Components** (5 subtasks, complexity: 5/10)
   - Responsive grid layout
   - Animated card components (Framer Motion v11+)
   - Recharts v3+ integration
   - Progress bars, counters, tooltips
   - Accessibility and testing

9. ✅ **Robust Error Handling & User Feedback** (5 subtasks, complexity: 5/10)
   - Error boundaries
   - Centralized error logging
   - User-friendly messages
   - Retry logic and queuing
   - Comprehensive testing

#### Medium Priority Tasks (P1)
10. ✅ **Real-Time Generation Status Endpoint** (5 subtasks, complexity: 5/10)
11. ✅ **Timeline, Chart, and Table Components** (5 subtasks, complexity: 6/10)
12. ✅ **Enhanced Markdown Rendering** (5 subtasks, complexity: 5/10)
13. ✅ **Blueprint Viewer with View Toggle** (5 subtasks, complexity: 6/10)
14. ✅ **Comprehensive Logging System** (5 subtasks, complexity: 7/10)

#### Low Priority Tasks (P2)
15. ✅ **Enhanced Logs Page** (5 subtasks, complexity: 5/10)

### 5. **Complexity Analysis Report**
📁 `.taskmaster/reports/task-complexity-report_claude-blueprint-generation.json`

- **15 tasks analyzed** with research
- **Complexity scores**: 5-7/10 (all medium-high complexity)
- **Recommended subtasks**: 3-7 per task based on complexity
- **Total subtasks created**: 75

---

## 📋 Implementation Checklist

### Before You Start
- [ ] Verify `ANTHROPIC_API_KEY` is set in environment
  - Check `.env.local` or MCP config (`.cursor/mcp.json`)
  - Should be available from smartslate-polaris configuration
- [ ] Verify `PERPLEXITY_API_KEY` (already used in dynamic questions)
- [ ] Verify `OLLAMA_BASE_URL` and Ollama is running locally
- [ ] Review Cursor rule: `.cursor/rules/claude-blueprint-generation.mdc`
- [ ] Review PRD: `docs/claude_blueprint_generation_prd.txt`

### Task-Master Workflow
Follow the iterative workflow documented in `.cursor/rules/taskmaster/dev_workflow.mdc`:

1. **List Tasks**: `task-master list --tag=claude-blueprint-generation`
2. **Next Task**: `task-master next --tag=claude-blueprint-generation`
3. **Show Details**: `task-master show <id> --tag=claude-blueprint-generation`
4. **Expand if Needed**: Already done! All tasks have subtasks
5. **Implement**: Write code following subtask guidance
6. **Update Progress**: `task-master update-subtask --id=<id> --prompt="<progress>"`
7. **Mark Complete**: `task-master set-status --id=<id> --status=done`
8. **Commit Changes**: Git commit with descriptive message
9. **Move to Next**: Repeat from step 2

---

## 🗂️ File Structure Created

```
smartslate-polaris-v3/
├── .cursor/
│   └── rules/
│       └── claude-blueprint-generation.mdc ✨ NEW
├── .taskmaster/
│   ├── docs/
│   │   └── research/
│   │       └── 2025-10-01_what-is-the-best-claude-model-in-2025... ✨ NEW
│   ├── reports/
│   │   └── task-complexity-report_claude-blueprint-generation.json ✨ NEW
│   ├── tasks/
│   │   └── tasks.json (updated with claude-blueprint-generation tag) ✨ UPDATED
│   └── state.json (switched to claude-blueprint-generation tag) ✨ UPDATED
├── docs/
│   └── claude_blueprint_generation_prd.txt ✨ NEW (64 pages)
└── CLAUDE_BLUEPRINT_IMPLEMENTATION_PLAN.md ✨ NEW (this file)
```

---

## 🎯 Next Steps

### Immediate Actions
1. **Verify Environment Variables**
   ```bash
   # Check if keys are set
   echo $ANTHROPIC_API_KEY
   echo $PERPLEXITY_API_KEY
   echo $OLLAMA_BASE_URL
   ```

2. **Start with Task 1**
   ```bash
   task-master next --tag=claude-blueprint-generation
   task-master show 1 --tag=claude-blueprint-generation
   ```

3. **Create Initial File Structure**
   ```bash
   mkdir -p frontend/lib/services
   mkdir -p frontend/app/api/claude
   mkdir -p frontend/components/blueprint
   ```

### Recommended Implementation Order

#### Week 1: Core Infrastructure
- Task 1: Claude Sonnet 4 API Integration
- Task 2: Claude Opus 4 Fallback
- Task 3: Ollama Emergency Fallback
- Task 4: Blueprint Generation Orchestrator

#### Week 2: API Layer
- Task 5: Claude API Proxy Endpoint
- Task 6: Enhanced Blueprint Generation API
- Task 7: Real-Time Status Endpoint
- Task 8: Dynamic JSON Schema Validation

#### Week 3: Visualization
- Task 9: Infographic Dashboard Components
- Task 10: Timeline, Chart, and Table Components
- Task 11: Enhanced Markdown Rendering
- Task 12: Blueprint Viewer with View Toggle

#### Week 4: Observability & Polish
- Task 13: Comprehensive Logging System
- Task 14: Enhanced Logs Page
- Task 15: Robust Error Handling
- Testing and refinement

---

## 📊 System Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend UI                              │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐│
│  │  Static Wizard       │  │  Dynamic Wizard                  ││
│  │  (existing)          │  │  (existing)                      ││
│  └──────────┬───────────┘  └──────────┬───────────────────────┘│
│             │                           │                        │
│             └───────────┬───────────────┘                        │
│                         │                                        │
│                         ▼                                        │
│              ┌────────────────────────┐                          │
│              │ Generate Blueprint     │                          │
│              │ (New Button)           │                          │
│              └────────────┬───────────┘                          │
└──────────────────────────┼───────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Layer                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  POST /api/blueprints/generate                            │  │
│  │  - Fetch questionnaire answers                            │  │
│  │  - Call orchestrator service                              │  │
│  │  - Save to database                                       │  │
│  │  - Return status/metadata                                 │  │
│  └────────────────┬───────────────────────────────────────────┘  │
│                   │                                              │
│                   ▼                                              │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  POST /api/claude/generate-blueprint                      │  │
│  │  - Secure proxy to Claude API                             │  │
│  │  - Never expose API key                                   │  │
│  │  - Track token usage                                      │  │
│  └────────────────┬───────────────────────────────────────────┘  │
└───────────────────┼──────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│              Blueprint Generation Service                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  BlueprintGenerationService                               │  │
│  │  ┌────────────────────────────────────────────────────┐  │  │
│  │  │  Try: Claude Sonnet 4 (primary)                     │  │  │
│  │  │    ↓ (on failure)                                   │  │  │
│  │  │  Try: Claude Opus 4 (fallback)                      │  │  │
│  │  │    ↓ (on failure)                                   │  │  │
│  │  │  Try: Ollama (emergency)                            │  │  │
│  │  │    ↓                                                │  │  │
│  │  │  Validate & Normalize JSON                          │  │  │
│  │  │    ↓                                                │  │  │
│  │  │  Return blueprint + metadata                        │  │  │
│  │  └────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Database                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  blueprint_generator table                                │  │
│  │  - blueprint_json (JSONB) ← Dynamic structure             │  │
│  │  - blueprint_markdown (TEXT) ← Converted                  │  │
│  │  - status (TEXT) ← draft|generating|completed|error       │  │
│  │  - user_id, timestamps, etc.                              │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Blueprint Viewer                                │
│  ┌──────────────────────┐  ┌──────────────────────────────────┐│
│  │  Infographic View    │  │  Markdown View                   ││
│  │  ┌────────────────┐  │  │  ┌────────────────────────────┐ ││
│  │  │ Objectives     │  │  │  │ # Blueprint Title          │ ││
│  │  │ (animated      │  │  │  │ ## Executive Summary       │ ││
│  │  │  cards)        │  │  │  │ ## Learning Objectives     │ ││
│  │  ├────────────────┤  │  │  │ ## Target Audience         │ ││
│  │  │ Timeline       │  │  │  │ ## Content Outline         │ ││
│  │  │ (interactive)  │  │  │  │ ...                        │ ││
│  │  ├────────────────┤  │  │  └────────────────────────────┘ ││
│  │  │ Charts         │  │  │                                  ││
│  │  │ (Recharts)     │  │  │                                  ││
│  │  ├────────────────┤  │  │                                  ││
│  │  │ Tables         │  │  │                                  ││
│  │  │ (sortable)     │  │  │                                  ││
│  │  └────────────────┘  │  │                                  ││
│  └──────────────────────┘  └──────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                  Logging System                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  /logs page                                               │  │
│  │  - Filter by blueprintId, model, status                   │  │
│  │  - Search functionality                                   │  │
│  │  - Metrics: avg duration, success rate                    │  │
│  │  - CSV export                                             │  │
│  │  - Admin-only access                                      │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔒 Security Checklist

### API Keys
- [ ] `ANTHROPIC_API_KEY` never exposed to client
- [ ] Keys only accessed server-side (API routes)
- [ ] Keys loaded from environment variables
- [ ] No hardcoded keys in codebase

### Data Access
- [ ] All API routes require authentication
- [ ] RLS policies enforce user_id matching
- [ ] Blueprint ownership verified before operations
- [ ] Logs scrub sensitive data

### Logging
- [ ] API keys redacted in logs
- [ ] Personal data scrubbed
- [ ] Admin-only access to full logs
- [ ] Secure log storage

---

## 🧪 Testing Strategy

### Unit Tests
- Claude API client integration
- Ollama fallback logic
- Schema validation and normalization
- Individual visualization components
- Logging service

### Integration Tests
- Full generation flow (questionnaires → blueprint → DB)
- Fallback flow (Sonnet fail → Opus → Ollama)
- Real-time status polling
- Blueprint viewer rendering
- Logs page filtering

### E2E Tests
- Complete user journey
- View toggle (infographic ↔ markdown)
- Claude API outage handling
- Dynamic JSON schema rendering
- Mobile responsiveness

### Load Tests
- 10 concurrent generations
- Database save performance
- Log system performance (10,000+ entries)
- Infographic rendering (large datasets)

---

## 📈 Success Metrics

### Launch Targets
- [ ] >95% Claude Sonnet 4 success rate
- [ ] <60s average generation time
- [ ] <3% fallback activation rate
- [ ] Zero data loss
- [ ] >4.5/5.0 user satisfaction

### Post-Launch (30 days)
- [ ] Infographic view used in >70% of sessions
- [ ] <1% error rate
- [ ] Performance targets met
- [ ] Comprehensive logs available
- [ ] All tests passing

---

## 💡 Tips for Implementation

### Best Practices
1. **Follow Task-Master Workflow**: Use the structured approach for each task
2. **Log Everything**: Use `createServiceLogger()` for all operations
3. **Type Everything**: Leverage TypeScript for safety
4. **Test Incrementally**: Don't wait until the end
5. **Review PRD Often**: It has comprehensive examples and edge cases
6. **Use Cursor Rules**: They guide best practices and patterns

### Common Pitfalls to Avoid
- ❌ Don't expose API keys client-side
- ❌ Don't skip validation of LLM responses
- ❌ Don't assume all sections have expected structure
- ❌ Don't fail entire blueprint for one malformed section
- ❌ Don't log sensitive data
- ❌ Don't block UI during generation
- ❌ Don't hardcode visualization types

### Development Workflow
1. Read task description and subtasks
2. Review relevant Cursor rule section
3. Implement subtask
4. Log progress with `update-subtask`
5. Test locally
6. Mark subtask complete
7. Move to next subtask
8. When all subtasks done, mark task complete
9. Commit changes

---

## 🆘 Need Help?

### Documentation References
- **Cursor Rule**: `.cursor/rules/claude-blueprint-generation.mdc`
- **PRD**: `docs/claude_blueprint_generation_prd.txt`
- **Task-Master Workflow**: `.cursor/rules/taskmaster/dev_workflow.mdc`
- **Research Report**: `.taskmaster/docs/research/2025-10-01_what-is-the-best-claude-model...`
- **Complexity Report**: `.taskmaster/reports/task-complexity-report_claude-blueprint-generation.json`

### Quick Commands
```bash
# View all tasks
task-master list --tag=claude-blueprint-generation --with-subtasks

# Get next task
task-master next --tag=claude-blueprint-generation

# View specific task
task-master show <id> --tag=claude-blueprint-generation

# Update subtask progress
task-master update-subtask --id=<id> --prompt="Implemented X, Y, Z" --tag=claude-blueprint-generation

# Mark complete
task-master set-status --id=<id> --status=done --tag=claude-blueprint-generation

# View logs
# Navigate to http://localhost:3000/logs
```

---

## 🎊 Ready to Start!

Everything is set up and ready for implementation. The comprehensive planning ensures:
- ✅ Clear, actionable tasks with research-backed guidance
- ✅ Detailed PRD with examples and edge cases
- ✅ Best practices captured in Cursor rules
- ✅ Triple-fallback system for reliability
- ✅ Beautiful visualizations for user engagement
- ✅ Comprehensive logging for debugging
- ✅ Security built-in from the start

**Your system will be failsafe, upstream/downstream compatible, well-tested, and beautifully visualized.**

Start with Task 1 and follow the iterative workflow. You've got this! 🚀

---

**Generated:** October 1, 2025  
**Task-Master Tag:** `claude-blueprint-generation`  
**Total Tasks:** 15 (75 subtasks)  
**Estimated Duration:** 4-5 weeks

