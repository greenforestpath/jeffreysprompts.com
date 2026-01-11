import { test, expect } from "../lib/playwright-logger";

/**
 * Health Check Endpoints Integration Tests
 *
 * Tests the health check API endpoints for:
 * - /api/health - Basic health check
 * - /api/health/ready - Readiness check with service status
 * - /api/health/status - Detailed status (admin-protected)
 *
 * @see jeffreysprompts.com-3w6v
 */

test.describe("Health Check - Basic Endpoint (/api/health)", () => {
  test("returns 200 status and valid JSON", async ({ logger, request }) => {
    const response = await logger.step("fetch /api/health", async () => {
      return await request.get("/api/health");
    });

    await logger.step("verify HTTP status is 200", async () => {
      expect(response.status()).toBe(200);
    });

    const body = await logger.step("parse JSON response", async () => {
      return await response.json();
    });

    await logger.step("verify status field is ok", async () => {
      expect(body.status).toBe("ok");
    }, { data: { status: body.status } });

    await logger.step("verify timestamp is present and valid ISO string", async () => {
      expect(body.timestamp).toBeDefined();
      expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
    }, { data: { timestamp: body.timestamp } });

    await logger.step("verify prompts metadata is present", async () => {
      expect(body.prompts).toBeDefined();
      expect(typeof body.prompts.count).toBe("number");
      expect(typeof body.prompts.categories).toBe("number");
      expect(typeof body.prompts.tags).toBe("number");
      expect(body.prompts.count).toBeGreaterThan(0);
    }, { data: { prompts: body.prompts } });

    await logger.step("verify environment is present", async () => {
      expect(body.environment).toBeDefined();
      expect(["development", "production", "test"]).toContain(body.environment);
    }, { data: { environment: body.environment } });
  });

  test("returns Cache-Control no-cache header", async ({ logger, request }) => {
    const response = await logger.step("fetch /api/health", async () => {
      return await request.get("/api/health");
    });

    const headers = response.headers();

    await logger.step("verify Cache-Control header prevents caching", async () => {
      const cacheControl = headers["cache-control"];
      expect(cacheControl).toBeDefined();
      expect(cacheControl).toContain("no-cache");
      expect(cacheControl).toContain("no-store");
    }, { data: { cacheControl: headers["cache-control"] } });
  });

  test("returns correct Content-Type header", async ({ logger, request }) => {
    const response = await logger.step("fetch /api/health", async () => {
      return await request.get("/api/health");
    });

    const headers = response.headers();

    await logger.step("verify Content-Type is application/json", async () => {
      expect(headers["content-type"]).toContain("application/json");
    }, { data: { contentType: headers["content-type"] } });
  });
});

test.describe("Health Check - Ready Endpoint (/api/health/ready)", () => {
  test("returns 200 status when services are healthy", async ({ logger, request }) => {
    const response = await logger.step("fetch /api/health/ready", async () => {
      return await request.get("/api/health/ready");
    });

    await logger.step("verify HTTP status is 200 or 503", async () => {
      // Ready endpoint can return 200 (ready) or 503 (not ready)
      expect([200, 503]).toContain(response.status());
    }, { data: { status: response.status() } });

    const body = await logger.step("parse JSON response", async () => {
      return await response.json();
    });

    await logger.step("verify status field is present", async () => {
      expect(body.status).toBeDefined();
      expect(["ready", "degraded"]).toContain(body.status);
    }, { data: { status: body.status } });

    await logger.step("verify checks object is present", async () => {
      expect(body.checks).toBeDefined();
      expect(typeof body.checks).toBe("object");
    }, { data: { checks: body.checks } });

    await logger.step("verify timestamp is present", async () => {
      expect(body.timestamp).toBeDefined();
    });
  });

  test("returns boolean values for each check", async ({ logger, request }) => {
    const response = await logger.step("fetch /api/health/ready", async () => {
      return await request.get("/api/health/ready");
    });

    const body = await response.json();

    await logger.step("verify all check values are booleans", async () => {
      for (const [key, value] of Object.entries(body.checks)) {
        expect(typeof value).toBe("boolean");
      }
    }, { data: { checkKeys: Object.keys(body.checks) } });
  });

  test("status matches HTTP status code", async ({ logger, request }) => {
    const response = await logger.step("fetch /api/health/ready", async () => {
      return await request.get("/api/health/ready");
    });

    const body = await response.json();
    const httpStatus = response.status();

    await logger.step("verify status consistency", async () => {
      if (body.status === "ready") {
        expect(httpStatus).toBe(200);
      } else {
        expect(httpStatus).toBe(503);
      }
    }, { data: { bodyStatus: body.status, httpStatus } });
  });

  test("returns Cache-Control no-store header", async ({ logger, request }) => {
    const response = await logger.step("fetch /api/health/ready", async () => {
      return await request.get("/api/health/ready");
    });

    const headers = response.headers();

    await logger.step("verify Cache-Control prevents caching", async () => {
      const cacheControl = headers["cache-control"];
      expect(cacheControl).toBeDefined();
      expect(cacheControl).toContain("no-store");
    }, { data: { cacheControl: headers["cache-control"] } });
  });
});

test.describe("Health Check - Status Endpoint (/api/health/status)", () => {
  /**
   * Note: In development mode (without JFP_HEALTH_STATUS_TOKEN set),
   * the /api/health/status endpoint is accessible without auth.
   * In production, it requires a valid token.
   * These tests validate the endpoint works correctly in dev mode.
   */

  test("returns 200 status in development mode", async ({ logger, request }) => {
    const response = await logger.step("fetch /api/health/status", async () => {
      return await request.get("/api/health/status");
    });

    await logger.step("verify HTTP status is 200 (dev mode allows access)", async () => {
      // In dev mode without JFP_HEALTH_STATUS_TOKEN, access is allowed
      expect(response.status()).toBe(200);
    });

    const body = await logger.step("parse JSON response", async () => {
      return await response.json();
    });

    await logger.step("verify response has expected fields", async () => {
      expect(body.status).toBeDefined();
      expect(body.timestamp).toBeDefined();
      expect(body.version).toBeDefined();
      expect(body.environment).toBeDefined();
    }, { data: { keys: Object.keys(body) } });
  });

  test("returns detailed status information", async ({ logger, request }) => {
    const response = await logger.step("fetch /api/health/status", async () => {
      return await request.get("/api/health/status");
    });

    const body = await response.json();

    await logger.step("verify status field", async () => {
      expect(body.status).toBeDefined();
      expect(["ready", "degraded"]).toContain(body.status);
    }, { data: { status: body.status } });

    await logger.step("verify version field", async () => {
      expect(typeof body.version).toBe("string");
    }, { data: { version: body.version } });

    await logger.step("verify environment field", async () => {
      expect(["development", "production", "test"]).toContain(body.environment);
    }, { data: { environment: body.environment } });

    await logger.step("verify checks object is present", async () => {
      expect(body.checks).toBeDefined();
      expect(typeof body.checks).toBe("object");
    }, { data: { checks: body.checks } });
  });

  test("returns memory usage when available", async ({ logger, request }) => {
    const response = await logger.step("fetch /api/health/status", async () => {
      return await request.get("/api/health/status");
    });

    const body = await response.json();

    await logger.step("verify memory info structure (if present)", async () => {
      if (body.memory !== null) {
        expect(typeof body.memory).toBe("object");
        if (body.memory) {
          expect(typeof body.memory.heapUsed).toBe("number");
          expect(typeof body.memory.heapTotal).toBe("number");
        }
      }
    }, { data: { memory: body.memory } });
  });

  test("returns uptime when available", async ({ logger, request }) => {
    const response = await logger.step("fetch /api/health/status", async () => {
      return await request.get("/api/health/status");
    });

    const body = await response.json();

    await logger.step("verify uptimeSeconds (if present)", async () => {
      if (body.uptimeSeconds !== null) {
        expect(typeof body.uptimeSeconds).toBe("number");
        expect(body.uptimeSeconds).toBeGreaterThanOrEqual(0);
      }
    }, { data: { uptimeSeconds: body.uptimeSeconds } });
  });

  test("returns Cache-Control no-store header", async ({ logger, request }) => {
    const response = await logger.step("fetch /api/health/status", async () => {
      return await request.get("/api/health/status");
    });

    const headers = response.headers();

    await logger.step("verify Cache-Control prevents caching", async () => {
      const cacheControl = headers["cache-control"];
      expect(cacheControl).toBeDefined();
      expect(cacheControl).toContain("no-store");
    }, { data: { cacheControl: headers["cache-control"] } });
  });
});

test.describe("Health Endpoints - Response Time", () => {
  test("basic health endpoint responds quickly (< 500ms)", async ({ logger, request }) => {
    const startTime = Date.now();

    const response = await logger.step("fetch /api/health with timing", async () => {
      return await request.get("/api/health");
    });

    const duration = Date.now() - startTime;

    await logger.step("verify response time is under 500ms", async () => {
      expect(response.status()).toBe(200);
      expect(duration).toBeLessThan(500);
    }, { data: { durationMs: duration } });
  });

  test("ready endpoint responds within reasonable time (< 2000ms)", async ({ logger, request }) => {
    const startTime = Date.now();

    const response = await logger.step("fetch /api/health/ready with timing", async () => {
      return await request.get("/api/health/ready");
    });

    const duration = Date.now() - startTime;

    await logger.step("verify response time is under 2000ms", async () => {
      expect([200, 503]).toContain(response.status());
      expect(duration).toBeLessThan(2000);
    }, { data: { durationMs: duration, status: response.status() } });
  });
});

test.describe("Health Endpoints - JSON Schema Validation", () => {
  test("/api/health follows expected schema", async ({ logger, request }) => {
    const response = await logger.step("fetch /api/health", async () => {
      return await request.get("/api/health");
    });

    const body = await response.json();

    await logger.step("validate schema structure", async () => {
      // Required fields
      expect(body).toHaveProperty("status");
      expect(body).toHaveProperty("timestamp");
      expect(body).toHaveProperty("prompts");
      expect(body).toHaveProperty("environment");

      // Nested prompts structure
      expect(body.prompts).toHaveProperty("count");
      expect(body.prompts).toHaveProperty("categories");
      expect(body.prompts).toHaveProperty("tags");

      // Type validation
      expect(typeof body.status).toBe("string");
      expect(typeof body.timestamp).toBe("string");
      expect(typeof body.environment).toBe("string");
      expect(typeof body.prompts.count).toBe("number");
    }, { data: { schema: Object.keys(body) } });
  });

  test("/api/health/ready follows expected schema", async ({ logger, request }) => {
    const response = await logger.step("fetch /api/health/ready", async () => {
      return await request.get("/api/health/ready");
    });

    const body = await response.json();

    await logger.step("validate schema structure", async () => {
      // Required fields
      expect(body).toHaveProperty("status");
      expect(body).toHaveProperty("checks");
      expect(body).toHaveProperty("timestamp");

      // Type validation
      expect(typeof body.status).toBe("string");
      expect(typeof body.checks).toBe("object");
      expect(typeof body.timestamp).toBe("string");
    }, { data: { schema: Object.keys(body) } });
  });
});
