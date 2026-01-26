---
id: dependency-auditor
title: Dependency Auditor
description: Audit dependencies for security vulnerabilities, outdated packages, and bloat
category: refactoring
tags:
  - dependencies
  - security
  - audit
  - npm
  - maintenance
author: Jeffrey Emanuel
twitter: "@doodlestein"
version: "1.0.0"
featured: false
difficulty: intermediate
created: "2026-01-26"
whenToUse:
  - Before production deployments
  - Monthly maintenance reviews
  - When adding new dependencies
  - After security advisories
tips:
  - Run npm audit or equivalent first
  - Check if unused dependencies can be removed
  - Consider maintenance status of packages (last update, open issues)
---

Audit the project's dependencies for security, maintenance, and bloat issues.

## Audit Checklist

### 1. Security Vulnerabilities
- Run `npm audit` / `yarn audit` / `pnpm audit`
- Check for known CVEs in dependencies
- Note severity levels and available fixes

### 2. Outdated Packages
- Run `npm outdated` or equivalent
- Identify packages more than 1 major version behind
- Check changelogs for breaking changes before updating

### 3. Unused Dependencies
- Identify packages in package.json not imported anywhere
- Check for dev dependencies that should be regular deps (or vice versa)
- Look for duplicate packages serving same purpose

### 4. Maintenance Status
For each major dependency, check:
- Last publish date (>1 year = concerning)
- Open issues count and response time
- Is it deprecated or archived?
- Are there better-maintained alternatives?

### 5. Bundle Size Impact
- Which dependencies contribute most to bundle size?
- Are there lighter alternatives?
- Can any be lazy-loaded?

## Output Format

```markdown
## Security Issues
| Package | Severity | CVE | Fix Available |
|---------|----------|-----|---------------|

## Outdated (Major)
| Package | Current | Latest | Breaking Changes |
|---------|---------|--------|------------------|

## Unused
- package-name (reason it appears unused)

## Maintenance Concerns
- package-name: [last updated X ago, Y open issues, etc.]

## Recommendations
1. [Priority action items]
```

## Action Priority

1. **Critical/High security** - Fix immediately
2. **Unused dependencies** - Remove now (easy win)
3. **Outdated major versions** - Plan upgrade path
4. **Maintenance concerns** - Evaluate alternatives
