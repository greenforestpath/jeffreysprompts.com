---
id: "deployment-verifier"
title: "Deployment Verifier"
description: "Verify live deployment works with automated browser testing"
category: "testing"
tags:
  - "deployment"
  - "verification"
  - "playwright"
  - "ultrathink"
author: "Jeffrey Emanuel"
twitter: "@doodlestein"
version: "1.0.0"
featured: false
difficulty: "intermediate"
estimatedTokens: 250
created: "2025-09-17"
whenToUse:
  - "After deploying to production"
  - "For automated deployment verification"
  - "To catch runtime issues that static analysis misses"
tips:
  - "Test both desktop and mobile viewports"
  - "Check browser console for JS errors"
  - "Screenshots help catch visual regressions"
---

Deploy to vercel and verify that the deployment worked properly without any errors (iterate and fix if there were errors). Then visit the live site with playwright as both desktop and mobile browser and take screenshots and check for js errors and look at the screenshots for potential problems and iterate and fix them all super carefully! Use ultrathink.
