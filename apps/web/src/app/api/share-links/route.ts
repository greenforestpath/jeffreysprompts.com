import { NextRequest, NextResponse } from "next/server";
import { getPrompt } from "@jeffreysprompts/core/prompts";
import { getBundle } from "@jeffreysprompts/core/prompts/bundles";
import { getWorkflow } from "@jeffreysprompts/core/prompts/workflows";
import {
  createShareLink,
  type ShareContentType,
} from "@/lib/share-links/share-link-store";

const VALID_TYPES: ShareContentType[] = ["prompt", "bundle", "workflow", "collection"];
const MAX_PASSWORD_LENGTH = 64;

function isValidType(type: string): type is ShareContentType {
  return VALID_TYPES.includes(type as ShareContentType);
}

function contentExists(type: ShareContentType, id: string): boolean {
  switch (type) {
    case "prompt":
      return Boolean(getPrompt(id));
    case "bundle":
      return Boolean(getBundle(id));
    case "workflow":
      return Boolean(getWorkflow(id));
    case "collection":
      return false;
    default:
      return false;
  }
}

export async function POST(request: NextRequest) {
  let payload: {
    contentType?: string;
    contentId?: string;
    password?: string;
    expiresAt?: string;
  };

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const contentType = payload.contentType?.trim() ?? "";
  const contentId = payload.contentId?.trim() ?? "";
  const password = payload.password?.trim();
  const expiresAt = payload.expiresAt?.trim();

  if (!contentType || !contentId) {
    return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
  }

  if (!isValidType(contentType)) {
    return NextResponse.json({ error: "Invalid content type." }, { status: 400 });
  }

  if (password && password.length > MAX_PASSWORD_LENGTH) {
    return NextResponse.json(
      { error: `Password must be ${MAX_PASSWORD_LENGTH} characters or fewer.` },
      { status: 400 }
    );
  }

  if (!contentExists(contentType, contentId)) {
    return NextResponse.json({ error: "Content not found." }, { status: 404 });
  }

  const link = createShareLink({
    contentType,
    contentId,
    password: password ?? null,
    expiresAt: expiresAt || null,
  });

  return NextResponse.json({
    success: true,
    link: {
      id: link.id,
      code: link.linkCode,
      contentType: link.contentType,
      contentId: link.contentId,
      expiresAt: link.expiresAt,
      isActive: link.isActive,
      viewCount: link.viewCount,
      createdAt: link.createdAt,
      url: `https://jeffreysprompts.com/share/${link.linkCode}`,
    },
  });
}
