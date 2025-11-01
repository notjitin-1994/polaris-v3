# Claude Code Agents - SmartSlate Polaris

This directory contains specialized AI agents for Claude Code that understand your project's architecture, brand identity, and best practices.

## 📁 Available Agents

### 🎨 [UX/UI Design Agent](./ux-ui.md)
**Purpose**: Create world-class, brand-compliant UI components and experiences

**Expertise**:
- SmartSlate Polaris brand guidelines (colors, typography, spacing)
- Glassmorphism and premium dark mode design
- Touch-first, mobile-responsive layouts
- WCAG AA accessibility compliance
- Component library best practices

**Use When**:
- Designing new features or pages
- Creating UI components
- Fixing accessibility issues
- Optimizing for mobile
- Implementing animations
- Applying brand styling

**Example Usage**:
```bash
# Create a new feature
claude "Create a premium pricing card with glassmorphism and our brand colors"

# Fix accessibility
claude "Add keyboard navigation and ARIA labels to this dashboard"

# Mobile optimization
claude "Make this form mobile-friendly with proper touch targets"

# Brand consistency
claude "Update this component to match SmartSlate design system"
```

---

### 🐛 [Debugging Agent](./debugger.md)
**Purpose**: Systematically diagnose and resolve technical issues

**Expertise**:
- React/Next.js debugging
- TypeScript error resolution
- API and database issues
- Performance optimization
- Build tool problems

**Use When**:
- Getting cryptic error messages
- Components not rendering correctly
- API endpoints failing
- Performance issues
- Build failures

**Example Usage**:
```bash
claude "debug: Getting hydration error in Next.js"
claude "debug: TypeScript complaining about missing types"
claude "debug: API returning 500 error"
```

---

## 🚀 How to Use Agents

### Method 1: Natural Language (Recommended)
Just describe what you need in natural language. Claude Code will automatically activate the relevant agent based on context:

```bash
# UX/UI Agent activates
claude "Design a dashboard card for displaying blueprint stats"

# Debugging Agent activates
claude "Help me fix this CORS error"
```

### Method 2: Explicit Invocation
Mention the agent type directly:

```bash
claude "ux: Create a mobile nav menu"
claude "debug: Find why this component re-renders infinitely"
```

### Method 3: File-Based Context
When working in specific files, agents automatically understand context:

- Working in `components/ui/*.tsx` → UX/UI agent active
- Seeing error messages → Debugging agent active
- Editing forms → UX/UI agent considers accessibility
- API routes → Debugging agent watches for common mistakes

---

## 🎯 Agent Capabilities

### What These Agents Know

✅ **Project Structure**
- Next.js 15 App Router architecture
- TypeScript strict mode patterns
- Supabase integration patterns
- Component library organization

✅ **Brand Identity**
- SmartSlate color palette (#a7dadb primary, #4f46e5 secondary)
- Glassmorphism design patterns
- Typography system (Lato body, Quicksand headings)
- Spacing and layout standards

✅ **Best Practices**
- WCAG AA accessibility standards
- Touch-first design (44px minimum)
- Mobile-responsive patterns
- Performance optimization
- Security best practices

✅ **Tech Stack**
- React 19 + Next.js 15
- TypeScript 5.7
- Tailwind CSS v4
- Radix UI components
- Zustand state management

---

## 📚 Quick Reference

### UX/UI Agent

#### Common Requests
```bash
# Components
"Create a card component with glassmorphism"
"Design a button with loading state"
"Build a responsive navigation menu"

# Layouts
"Create a 3-column grid that collapses on mobile"
"Design a hero section with our brand styling"
"Build a dashboard layout"

# Styling
"Apply brand colors to this component"
"Add hover animations"
"Make this accessible"

# Forms
"Create a multi-step form wizard"
"Build a dynamic questionnaire"
"Design input validation states"
```

#### Key Principles
- **Glass First**: Use `.glass-card` for containers
- **Touch Friendly**: 44px+ minimum for interactive elements
- **Brand Colors**: Use CSS variables (`--primary-accent`, etc.)
- **Spacing**: Follow 4px grid (`space-4`, `space-6`, etc.)
- **Animations**: Keep under 300ms, use brand easing

---

### Debugging Agent

#### Common Requests
```bash
# React Issues
"debug: Component not re-rendering"
"debug: Getting 'Cannot read property' error"
"debug: Infinite loop in useEffect"

# TypeScript Issues
"debug: Type error in this component"
"debug: 'Property does not exist on type'"

# API Issues
"debug: Getting 401 unauthorized"
"debug: CORS error on fetch"
"debug: Supabase query failing"

# Build Issues
"debug: Next.js build failing"
"debug: Module not found"
"debug: TypeScript compilation error"
```

#### Debugging Workflow
1. **Gather Context**: Agent examines relevant files
2. **Generate Hypotheses**: Multiple possible causes
3. **Investigate**: Systematic testing
4. **Provide Solution**: Clear fix with code
5. **Prevent**: Guidance to avoid future issues

---

## 💡 Pro Tips

### For Better UX/UI Results
1. **Be Specific About Context**: "Create a mobile-friendly pricing card" vs "Create a card"
2. **Mention Constraints**: "Design for mobile first" or "Must work on small screens"
3. **Reference Examples**: "Similar to the dashboard cards we have"
4. **Ask for Variants**: "Show me 2-3 design options"

### For Better Debugging
1. **Provide Error Messages**: Copy full stack traces
2. **Share Context**: What were you trying to do?
3. **Mention Recent Changes**: What did you modify?
4. **Test Suggestions**: Report back if fixes work

### For Both
1. **Iterate**: Start simple, refine with feedback
2. **Ask Questions**: Agents can clarify requirements
3. **Request Explanations**: "Why did you use X instead of Y?"
4. **Combine Agents**: "Debug this component and then improve its UX"

---

## 🔄 Agent Updates

Agents are living documents that evolve with your project:

- **Brand Updates**: When design system changes, agents stay in sync
- **New Patterns**: As you create new components, agents learn them
- **Best Practices**: Agents enforce current standards
- **Project Growth**: Agents scale with your codebase

To update an agent:
1. Edit the corresponding `.md` file in `.claude/agents/`
2. Add new patterns, remove deprecated ones
3. Claude Code automatically picks up changes

---

## 🎓 Learning from Agents

Agents don't just solve problems—they teach you:

- **UX/UI Agent**: Learn design system thinking, accessibility patterns
- **Debugging Agent**: Understand root causes, not just fixes
- **Both**: Reinforce project standards and best practices

Pay attention to:
- ✅ Code patterns agents use consistently
- 📚 Explanations agents provide
- 🛡️ Prevention guidance for future issues
- 🎯 Links to documentation and resources

---

## 📞 Getting Help

If an agent doesn't understand your request:

1. **Provide More Context**: Share relevant code or files
2. **Clarify Requirements**: Be more specific about what you want
3. **Ask for Alternatives**: "Show me other ways to do this"
4. **Reference Examples**: Point to existing components

Agents are designed to ask clarifying questions when needed!

---

## 🚀 Next Steps

**Start using agents today:**

```bash
# Try the UX/UI agent
claude "Create a feature card for the dashboard with our brand styling"

# Try the debugging agent
claude "Help me understand why this API call is failing"

# Combine both
claude "Debug this form and then make it mobile-friendly"
```

**The more you use them, the better they work!** Agents learn from your feedback and adapt to your project's evolution.

---

**Ready to build world-class UIs and debug like a pro? Just ask!** ✨
