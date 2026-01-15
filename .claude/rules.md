# Claude Development Rules for This Project

## Documentation Updates

### MANDATORY: Always Update Documentation
When making ANY changes to the codebase, you MUST update the relevant documentation in `/docs/`.

### Documentation Structure
```
docs/
├── done/           # Completed features and implementations
├── in-progress/    # Current work being done
└── plans/          # Future enhancements and roadmap
```

### When to Update Each Folder

#### `/docs/done/`
Update when you:
- Complete a new feature
- Finish implementing a component
- Merge functionality from multiple files
- Fix a significant bug
- Add security improvements
- Restructure the codebase

**Files to maintain:**
- `authentication.md` - All auth-related features
- `dashboard-ui.md` - Dashboard and UI components
- `security.md` - Security implementations and best practices

#### `/docs/in-progress/`
Update when you:
- Start working on a new feature
- Begin a multi-step implementation
- Need to track ongoing work

**File to maintain:**
- `current-work.md` - Active tasks and progress

#### `/docs/plans/`
Update when you:
- Identify a future enhancement
- Receive user feedback about desired features
- Discover technical debt to address
- Plan architectural changes

**File to maintain:**
- `future-enhancements.md` - Prioritized feature backlog

### Recommendations Must Be Documented
**MANDATORY RULE:** When you make ANY recommendation (security, feature, improvement, optimization, etc.):

1. **IMMEDIATELY add it to `/docs/plans/future-enhancements.md`**
2. **Include all required details:**
   - Priority level (High/Medium/Low)
   - Estimated effort (Low/Medium/High)
   - Clear description of what and why
   - Implementation details and approach
   - File paths that would be affected
   - External services or dependencies needed
   - Links to documentation or resources

3. **Categories of recommendations to document:**
   - Security improvements or concerns
   - Performance optimizations
   - Feature enhancements
   - Code refactoring opportunities
   - Technical debt identified
   - Accessibility improvements
   - User experience enhancements
   - Monitoring or logging additions
   - Testing improvements
   - DevOps or deployment optimizations

4. **When to document recommendations:**
   - During code reviews or exploration
   - When implementing related features
   - When noticing limitations or issues
   - When user mentions future needs
   - When encountering edge cases
   - When researching solutions

**Never keep recommendations only in your head or only in conversation - they must be written down in the plans documentation.**

### Update Checklist
Before completing ANY task, verify:
- [ ] Relevant `/docs/done/` file updated with new implementation
- [ ] `/docs/in-progress/current-work.md` reflects current status
- [ ] `/docs/plans/future-enhancements.md` updated if new ideas emerged OR recommendations made
- [ ] Main `README.md` updated if user-facing changes made
- [ ] Code comments added for complex logic
- [ ] All recommendations properly documented in future plans

### Documentation Style Guide

**Be Specific:**
- Include file paths
- List exact function/component names
- Show code snippets for complex implementations
- Provide configuration examples

**Be Complete:**
- Document WHY decisions were made, not just WHAT
- Include security considerations
- List prerequisites and dependencies
- Note any limitations or known issues

**Be Organized:**
- Use clear headings and subheadings
- Include tables of contents for long documents
- Cross-reference related documentation
- Date all updates

### Example Documentation Update

When adding a new feature:

1. **Add to `/docs/done/[relevant-file].md`:**
   ```markdown
   ### X. New Feature Name
   **Status:** ✅ Complete
   **Date:** January 14, 2026

   **Implementation:**
   - Description of what was built
   - Key files changed
   - Technical decisions made

   **Files:**
   - `/path/to/file.ts` - What this file does

   **Usage:**
   - How to use the feature
   ```

2. **Update `/docs/in-progress/current-work.md`:**
   - Move completed item to "Recently Completed"
   - Update current active tasks

3. **Update `README.md`:**
   - Add to features list if user-facing
   - Update setup instructions if needed
   - Add to troubleshooting if relevant

## Security Rules

### Always Consider Security
When implementing ANY feature, consider:
- Input validation
- Output sanitization
- Authentication/authorization
- Rate limiting
- Error handling (avoid info leakage)
- OWASP Top 10 vulnerabilities

### Security Review Checklist
Before marking security-related code as complete:
- [ ] Input is validated (client AND server side)
- [ ] Outputs are sanitized to prevent XSS
- [ ] Authentication is required where needed
- [ ] Authorization checks are in place
- [ ] Rate limiting is implemented for sensitive endpoints
- [ ] Errors don't leak sensitive information
- [ ] Secrets are in environment variables
- [ ] HTTPS is enforced in production
- [ ] Security headers are configured
- [ ] Dependencies are up to date

## Code Quality Rules

### TypeScript
- Always use proper types (avoid `any` unless absolutely necessary)
- Define interfaces for component props
- Type all function parameters and returns
- Use type guards for conditional logic

### React/Next.js
- Use 'use client' directive only when needed
- Implement proper loading states
- Handle errors gracefully
- Clean up effects with return functions
- Avoid prop drilling (use Context where appropriate)

### Styling
- Use Tailwind CSS classes consistently
- Follow mobile-first responsive design
- Maintain color scheme consistency
- Ensure accessibility (ARIA labels, semantic HTML)

### File Organization
- Group related components in directories
- Separate business logic from UI components
- Use barrel exports (index.ts) for clean imports
- Follow Next.js app router conventions

## Git Commit Rules

### Commit Message Format
```
type(scope): brief description

Longer description if needed

Docs updated:
- /docs/done/file.md - what changed
- README.md - what changed
```

### Types
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation only
- `style:` - Code style changes (formatting)
- `refactor:` - Code restructuring
- `security:` - Security improvements
- `perf:` - Performance improvements
- `test:` - Adding tests
- `chore:` - Maintenance tasks

### Always Include "Docs updated" Section
Every commit that changes functionality MUST include documentation updates in the commit message.

## Testing Rules

### Manual Testing Checklist
Before marking ANY auth-related feature as complete:
- [ ] Test on mobile device
- [ ] Test on tablet
- [ ] Test on desktop
- [ ] Test with slow network
- [ ] Test error scenarios
- [ ] Test edge cases
- [ ] Test accessibility with keyboard only
- [ ] Test with screen reader (if possible)

### Security Testing
For security features:
- [ ] Test with invalid inputs
- [ ] Test with malicious inputs (XSS attempts)
- [ ] Test rate limiting
- [ ] Test session expiration
- [ ] Test authorization bypasses
- [ ] Test with expired tokens

## Project-Specific Rules

### This is an Authentication Template
Remember:
- Keep it generic and reusable
- Document ALL configuration steps
- Provide clear examples
- Make it easy to customize
- Avoid project-specific hardcoding

### Supabase Integration
- Always use `@supabase/ssr` for SSR support
- Use browser client for client components
- Use server client for server components/routes
- Handle Supabase errors gracefully
- Test with Supabase local development when possible

### Responsive Design
- Mobile-first approach
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Test on actual devices when possible
- Ensure touch targets are at least 44x44px
- Optimize images for mobile

## Reminder System

### At the Start of Every Task
1. Read this rules file
2. Check `/docs/in-progress/current-work.md`
3. Review relevant `/docs/done/` files
4. Plan documentation updates

### Before Completing Every Task
1. Update all relevant documentation
2. Run through testing checklist
3. Update `/docs/in-progress/current-work.md`
4. Verify README.md is current

### When Stuck
1. Check `/docs/plans/future-enhancements.md` for context
2. Review `/docs/done/` for patterns to follow
3. Ask user for clarification rather than guessing

## Emergency Rules

### If You Realize Documentation is Outdated
1. **STOP** current work
2. Update documentation first
3. Inform user about the update
4. Resume work

### If You Notice Security Issues
1. **IMMEDIATELY** note the issue
2. Assess severity (Critical/High/Medium/Low)
3. Document in `/docs/plans/future-enhancements.md`
4. If Critical/High, inform user immediately
5. Propose fix

### If Tests Fail
1. **DO NOT** mark feature as complete
2. Document the failure
3. Fix the issue
4. Retest
5. Update documentation with any learnings

---

## Quick Reference

**Starting new feature:**
→ Create todo list → Update `/docs/in-progress/` → Code → Test → Update `/docs/done/` → Update `README.md` if needed

**Completing existing feature:**
→ Test thoroughly → Update `/docs/done/` → Move item in `/docs/in-progress/` → Update `README.md` if needed

**Found security issue:**
→ Assess severity → Document in `/docs/plans/` → Inform user if Critical/High → Propose fix

**Unclear requirement:**
→ Check existing docs → Ask user → Document decision in relevant `/docs/done/` file

---

**Remember:** Documentation is not optional. It's as important as the code itself. This project is meant to be a template, so clear documentation ensures it can be reused effectively.

**Last Updated:** January 14, 2026
