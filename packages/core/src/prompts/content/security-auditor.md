---
id: security-auditor
title: Security Auditor
description: Systematic security review for OWASP top 10 and common vulnerabilities
category: debugging
tags:
  - security
  - audit
  - owasp
  - vulnerabilities
  - ultrathink
author: Jeffrey Emanuel
twitter: "@doodlestein"
version: "1.0.0"
featured: true
difficulty: advanced
created: "2026-01-26"
whenToUse:
  - Before any production deployment
  - When handling user data or authentication
  - After adding new API endpoints
  - Periodic security reviews
tips:
  - Run this on every significant feature before merge
  - Some issues require runtime testing to verify
  - Follow up with dependency audit for supply chain security
---

Conduct a systematic security audit of this codebase. Use ultrathink.

## Check for OWASP Top 10

1. **Injection (SQL, NoSQL, Command, LDAP)** - Look for unsanitized user input in queries, commands, or system calls
2. **Broken Authentication** - Check session management, password handling, token security
3. **Sensitive Data Exposure** - Find hardcoded secrets, unencrypted sensitive data, excessive logging
4. **XML External Entities (XXE)** - Check XML parsers for external entity processing
5. **Broken Access Control** - Verify authorization checks on all endpoints and resources
6. **Security Misconfiguration** - Check for debug modes, default credentials, verbose errors in production
7. **Cross-Site Scripting (XSS)** - Find unescaped user input rendered in HTML/JS
8. **Insecure Deserialization** - Check for unsafe deserialization of untrusted data
9. **Using Components with Known Vulnerabilities** - Note any obviously outdated dependencies
10. **Insufficient Logging & Monitoring** - Check for security event logging

## Additional Checks

- **Secrets in code:** API keys, passwords, tokens hardcoded or in git history
- **Environment variables:** Ensure secrets use env vars, not config files
- **CORS configuration:** Check for overly permissive CORS
- **Rate limiting:** Identify endpoints vulnerable to brute force
- **Input validation:** Check for missing or weak validation
- **Error messages:** Ensure errors don't leak internal details

## Output Format

For each issue found:
1. **Severity:** Critical / High / Medium / Low
2. **Location:** File and line number
3. **Description:** What the vulnerability is
4. **Impact:** What could happen if exploited
5. **Fix:** Concrete remediation with code example

Prioritize findings by severity. Critical and High issues should block deployment.
