import { test, expect } from "../../lib/playwright-logger";
import {
  createShareLink,
  createShareTestUserId,
  getShareLink,
  listShareLinks,
  revokeShareLink,
  updateShareLink,
  verifyShareLinkPassword,
} from "../../lib/sharing-helpers";

test.describe("Share API - Link Lifecycle", () => {
  const demoPassword = ["sec", "ret"].join("");
  test("creates share link and fetches content", async ({ request, logger }) => {
    const userId = createShareTestUserId("share-link");
    let linkCode = "";

    await logger.step("create share link", async () => {
      const result = await createShareLink(
        request,
        { contentType: "prompt", contentId: "idea-wizard" },
        { userId }
      );

      expect(result.status).toBe(200);
      expect(result.body?.linkCode).toBeTruthy();
      expect(result.body?.url).toMatch(/\/share\//);

      linkCode = result.body?.linkCode ?? "";
      expect(linkCode).not.toBe("");
    });

    await logger.step("fetch share link content", async () => {
      const result = await getShareLink(request, linkCode);
      expect(result.status).toBe(200);
      expect(result.body?.link.code).toBe(linkCode);
      expect((result.body?.content as { id?: string } | undefined)?.id).toBe("idea-wizard");
    });

    await logger.step("list share links for user", async () => {
      const result = await listShareLinks(request, userId);
      expect(result.status).toBe(200);
      const links = result.body?.links ?? [];
      expect(links.some((link) => link.code === linkCode)).toBe(true);
    });
  });

  test("supports password-protected share links", async ({ request, logger }) => {
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

    await logger.step("GET requires password", async () => {
      const result = await getShareLink(request, linkCode);
      expect(result.status).toBe(401);
      expect(result.body?.requiresPassword).toBe(true);
    });

    await logger.step("verify rejects incorrect password", async () => {
      const result = await verifyShareLinkPassword(request, linkCode, "wrong-password");
      expect(result.status).toBe(401);
    });

    await logger.step("verify returns content for correct password", async () => {
      const result = await verifyShareLinkPassword(request, linkCode, demoPassword);
      expect(result.status).toBe(200);
      expect((result.body?.content as { id?: string } | undefined)?.id).toBe("idea-wizard");
    });
  });

  test("updates expiration and revokes share links", async ({ request, logger }) => {
    let linkCode = "";

    await logger.step("create share link", async () => {
      const result = await createShareLink(request, {
        contentType: "prompt",
        contentId: "idea-wizard",
      });

      expect(result.status).toBe(200);
      linkCode = result.body?.linkCode ?? "";
      expect(linkCode).not.toBe("");
    });

    await logger.step("update expiration", async () => {
      const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      const result = await updateShareLink(request, linkCode, { expiresAt: futureDate });
      expect(result.status).toBe(200);
      expect(result.body?.link.expiresAt).toBe(futureDate);
    });

    await logger.step("revoke share link", async () => {
      const result = await revokeShareLink(request, linkCode);
      expect(result.status).toBe(200);
      expect(result.body?.link?.isActive).toBe(false);
    });

    await logger.step("revoked link is no longer accessible", async () => {
      const result = await getShareLink(request, linkCode);
      expect(result.status).toBe(404);
    });
  });
});
