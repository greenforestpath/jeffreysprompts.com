import { test, expect } from "../../lib/playwright-logger";
import {
  createShareLink,
  getShareLink,
  updateShareLink,
  createShareTestUserId,
} from "../../lib/sharing-helpers";

test.describe("Share Privacy Controls", () => {
  const demoPassword = ["sec", "ret"].join("");

  test("unknown share codes are not accessible", async ({ request, logger }) => {
    await logger.step("request unknown share code", async () => {
      const result = await getShareLink(request, "invalid-code-123");
      expect(result.status).toBe(404);
      expect(result.body?.error).toMatch(/not found/i);
    });
  });

  test("password protection blocks access until removed", async ({ request, logger }) => {
    let linkCode = "";

    await logger.step("create password-protected share link", async () => {
      const result = await createShareLink(request, {
        contentType: "prompt",
        contentId: "idea-wizard",
        password: demoPassword,
      });

      expect(result.status).toBe(200);
      linkCode = result.body?.linkCode ?? "";
      expect(linkCode).not.toBe("");
    });

    await logger.step("unauthenticated access requires password", async () => {
      const result = await getShareLink(request, linkCode);
      expect(result.status).toBe(401);
      expect(result.body?.requiresPassword).toBe(true);
    });

    await logger.step("remove password to make link public", async () => {
      const result = await updateShareLink(request, linkCode, { password: null });
      expect(result.status).toBe(200);
    });

    await logger.step("public link returns content", async () => {
      const result = await getShareLink(request, linkCode);
      expect(result.status).toBe(200);
      expect((result.body?.content as { id?: string } | undefined)?.id).toBe("idea-wizard");
    });
  });

  test("collection shares require valid content", async ({ request, logger }) => {
    const userId = createShareTestUserId("share-collection");

    await logger.step("attempt to share missing collection", async () => {
      const result = await createShareLink(
        request,
        { contentType: "collection", contentId: "missing-collection" },
        { userId }
      );

      expect(result.status).toBe(404);
      expect(result.body?.error).toMatch(/content not found/i);
    });
  });
});
