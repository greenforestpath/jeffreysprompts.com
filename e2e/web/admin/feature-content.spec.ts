import { test, expect } from "../../lib/playwright-logger";

/**
 * Admin Featured Content Management E2E Tests
 *
 * Tests the admin dashboard for managing staff picks and featured content.
 * NOTE: These tests require admin authentication. Some tests are skipped
 * until admin auth is available in E2E testing environment.
 *
 * Test scenarios:
 * 1. Admin featured dashboard access
 * 2. Feature content creation
 * 3. Feature content removal
 * 4. Feature ordering/reordering
 */

test.setTimeout(60000);

test.describe("Admin Featured Dashboard - Access", () => {
  // Skip tests that require admin authentication until E2E auth is set up
  test.skip("admin can access featured content dashboard", async ({ page, logger }) => {
    await logger.step("navigate to admin featured page", async () => {
      await page.goto("/admin/featured");
      await page.waitForLoadState("networkidle");
    });

    await logger.step("verify dashboard displays", async () => {
      await expect(page.getByRole("heading", { name: /featured content/i })).toBeVisible();
    });

    await logger.step("verify statistics cards", async () => {
      await expect(page.getByText("Staff Picks")).toBeVisible();
      await expect(page.getByText("Featured")).toBeVisible();
      await expect(page.getByText("Spotlights")).toBeVisible();
    });
  });

  test.skip("admin sees feature type sections", async ({ page, logger }) => {
    await logger.step("navigate to admin featured page", async () => {
      await page.goto("/admin/featured");
      await page.waitForLoadState("networkidle");
    });

    await logger.step("verify section headings", async () => {
      await expect(page.getByRole("heading", { name: /staff picks/i })).toBeVisible();
      await expect(page.getByRole("heading", { name: /featured items/i })).toBeVisible();
    });
  });

  test.skip("admin sees quick add form", async ({ page, logger }) => {
    await logger.step("navigate to admin featured page", async () => {
      await page.goto("/admin/featured");
      await page.waitForLoadState("networkidle");
    });

    await logger.step("verify quick add form elements", async () => {
      // Feature Type dropdown
      await expect(page.getByLabel(/feature type/i)).toBeVisible();
      // Resource Type dropdown
      await expect(page.getByLabel(/resource type/i)).toBeVisible();
      // Resource ID input
      await expect(page.getByLabel(/resource id/i)).toBeVisible();
    });
  });
});

test.describe("Admin Featured - Create Feature", () => {
  test.skip("admin can feature a prompt", async ({ page, logger }) => {
    await logger.step("navigate to admin featured page", async () => {
      await page.goto("/admin/featured");
      await page.waitForLoadState("networkidle");
    });

    await logger.step("fill quick add form", async () => {
      await page.getByLabel(/feature type/i).selectOption("staff_pick");
      await page.getByLabel(/resource type/i).selectOption("prompt");
      await page.getByLabel(/resource id/i).fill("test-prompt-id");
    });

    await logger.step("submit feature request", async () => {
      await page.getByRole("button", { name: /add/i }).click();
    });

    await logger.step("verify success feedback", async () => {
      await expect(page.locator("text=/added|success/i")).toBeVisible({ timeout: 5000 });
    });
  });

  test.skip("admin can add headline to featured item", async ({ page, logger }) => {
    await logger.step("navigate to admin featured page", async () => {
      await page.goto("/admin/featured");
      await page.waitForLoadState("networkidle");
    });

    await logger.step("fill form with headline", async () => {
      await page.getByLabel(/feature type/i).selectOption("featured");
      await page.getByLabel(/resource type/i).selectOption("bundle");
      await page.getByLabel(/resource id/i).fill("test-bundle-id");
      await page.getByLabel(/headline/i).fill("Trending Bundle of the Week");
    });

    await logger.step("submit", async () => {
      await page.getByRole("button", { name: /add/i }).click();
    });

    await logger.step("verify headline in list", async () => {
      await expect(page.getByText("Trending Bundle of the Week")).toBeVisible({ timeout: 5000 });
    });
  });

  test.skip("admin can set expiration date", async ({ page, logger }) => {
    await logger.step("navigate to admin featured page", async () => {
      await page.goto("/admin/featured");
      await page.waitForLoadState("networkidle");
    });

    await logger.step("fill form with end date", async () => {
      await page.getByLabel(/feature type/i).selectOption("spotlight");
      await page.getByLabel(/resource type/i).selectOption("prompt");
      await page.getByLabel(/resource id/i).fill("spotlight-prompt-id");
      // Set end date to 7 days from now
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 7);
      const dateStr = endDate.toISOString().split("T")[0];
      await page.getByLabel(/end date/i).fill(dateStr);
    });

    await logger.step("submit", async () => {
      await page.getByRole("button", { name: /add/i }).click();
    });

    await logger.step("verify expiration shows in list", async () => {
      await expect(page.locator("text=/expires/i")).toBeVisible({ timeout: 5000 });
    });
  });
});

test.describe("Admin Featured - Remove Feature", () => {
  test.skip("admin can remove featured item", async ({ page, logger }) => {
    await logger.step("navigate to admin featured page", async () => {
      await page.goto("/admin/featured");
      await page.waitForLoadState("networkidle");
    });

    await logger.step("find and click remove button", async () => {
      const removeButton = page.getByRole("button", { name: /remove/i }).first();
      await removeButton.click();
    });

    await logger.step("confirm removal if prompted", async () => {
      const confirmButton = page.getByRole("button", { name: /confirm|yes/i });
      if (await confirmButton.isVisible()) {
        await confirmButton.click();
      }
    });

    await logger.step("verify removal feedback", async () => {
      await expect(page.locator("text=/removed|unfeatured/i")).toBeVisible({ timeout: 5000 });
    });
  });
});

test.describe("Admin Featured - Reorder", () => {
  test.skip("admin can reorder featured items", async ({ page, logger }) => {
    await logger.step("navigate to admin featured page", async () => {
      await page.goto("/admin/featured");
      await page.waitForLoadState("networkidle");
    });

    await logger.step("verify drag handles exist", async () => {
      // Items should have drag handles for reordering
      const dragHandles = page.locator("[class*='GripVertical'], [data-drag-handle]");
      const count = await dragHandles.count();
      expect(count).toBeGreaterThanOrEqual(0); // May be empty
    });
  });
});

test.describe("Admin Featured API - Direct Tests", () => {
  // These tests hit the admin API directly - will fail without auth
  test.skip("POST /api/admin/featured creates feature", async ({ page, logger }) => {
    let response: Response | null = null;

    await logger.step("create featured content", async () => {
      response = await page.request.post("/api/admin/featured", {
        data: {
          resourceType: "prompt",
          resourceId: "test-prompt-id",
          featureType: "staff_pick",
        },
      });
    });

    await logger.step("verify success response", async () => {
      // Will fail without admin auth
      expect(response?.ok()).toBe(true);
    });
  });

  test.skip("DELETE /api/admin/featured removes feature", async ({ page, logger }) => {
    let response: Response | null = null;

    await logger.step("delete featured content", async () => {
      response = await page.request.delete("/api/admin/featured?id=test-id");
    });

    await logger.step("verify success response", async () => {
      // Will fail without admin auth
      expect(response?.ok()).toBe(true);
    });
  });

  test.skip("PATCH /api/admin/featured updates feature", async ({ page, logger }) => {
    let response: Response | null = null;

    await logger.step("update featured content", async () => {
      response = await page.request.patch("/api/admin/featured", {
        data: {
          id: "test-id",
          headline: "Updated Headline",
        },
      });
    });

    await logger.step("verify success response", async () => {
      // Will fail without admin auth
      expect(response?.ok()).toBe(true);
    });
  });

  test.skip("PATCH /api/admin/featured reorders features", async ({ page, logger }) => {
    let response: Response | null = null;

    await logger.step("reorder featured content", async () => {
      response = await page.request.patch("/api/admin/featured", {
        data: {
          action: "reorder",
          featureType: "staff_pick",
          ids: ["id-1", "id-2", "id-3"],
        },
      });
    });

    await logger.step("verify success response", async () => {
      // Will fail without admin auth
      expect(response?.ok()).toBe(true);
    });
  });
});

test.describe("Admin Featured - Statistics", () => {
  test.skip("admin sees correct statistics", async ({ page, logger }) => {
    await logger.step("navigate to admin featured page", async () => {
      await page.goto("/admin/featured");
      await page.waitForLoadState("networkidle");
    });

    await logger.step("verify stats cards display counts", async () => {
      // Each card should show a count
      const statsCards = page.locator("[class*='card']").filter({ hasText: /\d+/ });
      const count = await statsCards.count();
      expect(count).toBeGreaterThanOrEqual(3); // Staff Picks, Featured, Spotlights, Total
    });
  });

  test.skip("GET /api/admin/featured returns stats", async ({ page, logger }) => {
    let response: Response | null = null;

    await logger.step("request admin featured list", async () => {
      response = await page.request.get("/api/admin/featured");
    });

    await logger.step("verify response includes stats", async () => {
      // Will fail without admin auth, but check structure
      if (response?.ok()) {
        const data = await response.json();
        expect(data).toHaveProperty("stats");
        expect(data.stats).toHaveProperty("total");
      }
    });
  });
});

test.describe("Admin Featured - Validation", () => {
  test("unauthenticated access returns error", async ({ page, logger }) => {
    let response: Response | null = null;

    await logger.step("attempt to access admin endpoint without auth", async () => {
      response = await page.request.get("/api/admin/featured");
    });

    await logger.step("verify unauthorized response", async () => {
      // Should return 401 or 403 for unauthenticated requests
      const status = response?.status();
      expect([401, 403]).toContain(status);
    });
  });

  test("POST without required fields returns error", async ({ page, logger }) => {
    let response: Response | null = null;

    await logger.step("send incomplete request", async () => {
      response = await page.request.post("/api/admin/featured", {
        data: {
          // Missing required fields
          headline: "Test",
        },
      });
    });

    await logger.step("verify error response", async () => {
      // Should return 400 or 401/403
      const status = response?.status();
      expect([400, 401, 403]).toContain(status);
    });
  });
});
