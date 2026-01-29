# E2E Testing Guide

This directory contains end-to-end tests for JeffreysPrompts.com using Playwright.

## Quick Start

```bash
# Run all E2E tests against local dev server
bun run test:e2e:web

# Run with Playwright UI for debugging
bun run test:e2e:web:ui

# Run against production
bun run test:e2e:prod

# Run console health checks only
bun run test:e2e:console-health

# Run Page Object Model demo tests
bun run test:e2e:pom
```

## Directory Structure

```
e2e/
├── fixtures/           # Playwright fixtures for dependency injection
│   ├── pages.ts        # Page Object fixtures
│   └── index.ts
├── pages/              # Page Object Model classes
│   ├── BasePage.ts     # Base class with common utilities
│   ├── HomePage.ts     # Homepage interactions
│   ├── PromptDetailPage.ts
│   ├── PricingPage.ts
│   └── index.ts
├── utils/              # Testing utilities
│   ├── console-monitor.ts  # Browser console capture
│   └── index.ts
├── lib/                # Legacy helpers (still supported)
│   ├── playwright-logger.ts
│   ├── test-logger.ts
│   └── *.helpers.ts
├── web/                # Web app test specs
│   ├── homepage.spec.ts
│   ├── homepage-pom.spec.ts  # Page Object Model version
│   ├── console-health.spec.ts
│   └── ...
├── playwright.config.ts           # Development config
└── playwright.production.config.ts # Production config
```

## Test Patterns

### Using Page Objects (Recommended)

```typescript
import { test, expect } from "../fixtures/pages";

test("homepage loads correctly", async ({ homePage }) => {
  await homePage.goto();

  const cardCount = await homePage.getPromptCardCount();
  expect(cardCount).toBeGreaterThan(0);
});
```

### Console Error Monitoring

```typescript
import { test, expect } from "../fixtures/pages";

test("no console errors on page load", async ({ homePage, assertNoConsoleErrors }) => {
  await homePage.goto();

  // Fails test if unexpected console errors occurred
  await assertNoConsoleErrors();
});

test("check for hydration errors", async ({ homePage }) => {
  await homePage.goto();

  // Hydration errors indicate SSR/client mismatch
  expect(homePage.hasHydrationErrors()).toBe(false);
});
```

### Using Legacy Logger Pattern

```typescript
import { test } from "../lib/playwright-logger";

test("my test", async ({ page, logger }) => {
  await logger.step("navigate to homepage", async () => {
    await page.goto("/");
  });

  await logger.step("verify hero", async () => {
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});
```

## Console Monitoring

The `ConsoleMonitor` class captures and categorizes browser console messages:

| Category | Examples | Severity |
|----------|----------|----------|
| `hydration` | SSR/client mismatch | **Critical** |
| `runtime` | TypeError, ReferenceError | **High** |
| `network` | Failed fetch, CORS | **Medium** |
| `react` | Hook warnings | **Medium** |
| `security` | CSP violations | **Medium** |
| `deprecation` | Deprecated API | **Low** |

### Accessing Console Data

```typescript
// In Page Objects
const errors = homePage.getConsoleErrors("network");
const allErrors = homePage.getUnexpectedErrors();
const summary = homePage.getConsoleSummary();

// Direct access
import { ConsoleMonitor } from "../utils/console-monitor";

const monitor = new ConsoleMonitor(page);
// ... navigate and interact
monitor.printErrors();
```

## Page Object Model

### BasePage

All page objects extend `BasePage`, which provides:

- `goto(path)` - Navigate with configurable wait states
- `getByTestId()`, `getByRole()`, etc. - Locator helpers
- `assertVisible()`, `assertText()` - Common assertions
- `screenshot()` - Capture and attach to report
- `getConsoleErrors()` - Console monitoring
- `waitForSpinnersToDisappear()` - UI stability
- `isMobile()`, `isDesktop()` - Viewport detection

### Creating New Page Objects

```typescript
import { BasePage } from "./BasePage";
import { type Page, type Locator, type TestInfo } from "@playwright/test";

export class MyPage extends BasePage {
  static readonly PATH = "/my-page";

  readonly myButton: Locator;
  readonly myInput: Locator;

  constructor(page: Page, testInfo?: TestInfo) {
    super(page, testInfo);

    this.myButton = page.getByRole("button", { name: "Click me" });
    this.myInput = page.getByPlaceholder("Enter text...");
  }

  async goto() {
    await super.goto(MyPage.PATH, { waitUntil: "networkidle" });
  }

  async doSomething() {
    await this.myButton.click();
    await this.page.waitForTimeout(300);
  }
}
```

Then add to `fixtures/pages.ts`:

```typescript
import { MyPage } from "../pages/MyPage";

export const test = base.extend<PageFixtures>({
  // ...existing...
  myPage: async ({ page }, use, testInfo) => {
    await use(new MyPage(page, testInfo));
  },
});
```

## Production Testing

Use `playwright.production.config.ts` to test against the live site:

```bash
# Default production URL (jeffreysprompts.com)
bun run test:e2e:prod

# Custom URL
E2E_PROD_URL=https://staging.jeffreysprompts.com bun run test:e2e:prod

# With visible browser
bun run test:e2e:prod:headed
```

Production config includes:
- Longer timeouts (60s default)
- Full trace capture on failure
- Video recording
- Multiple device viewports (Desktop, Mobile, Tablet)
- Cross-browser testing (Chrome, Firefox, Safari)

## CI Integration

Add to GitHub Actions workflow:

```yaml
- name: Run E2E Tests
  run: bun run test:e2e:web

- name: Upload Playwright Report
  if: failure()
  uses: actions/upload-artifact@v4
  with:
    name: playwright-report
    path: playwright-report/
    retention-days: 7
```

## Best Practices

1. **Use Page Objects** for encapsulation and maintainability
2. **Check console errors** after significant interactions
3. **Avoid hardcoded waits** - use `waitForLoadState()` or element assertions
4. **Use role-based locators** (`getByRole`) for accessibility
5. **Take screenshots** at key steps for debugging
6. **Run console health checks** before releases
7. **Test responsive layouts** with mobile fixtures
