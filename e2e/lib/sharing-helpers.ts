import { randomUUID } from "crypto";
import type { APIRequestContext } from "@playwright/test";

export interface CreateSharePayload {
  contentType: "prompt" | "bundle" | "workflow" | "collection" | "user_prompt";
  contentId: string;
  password?: string | null;
  expiresIn?: number | string | null;
  expiresAt?: string | null;
}

export interface ShareApiResult<T> {
  status: number;
  body: T | null;
}

export interface ShareLinkCreateResponse {
  linkCode: string;
  url: string;
  expiresAt: string | null;
}

export interface ShareLinkGetResponse {
  link: {
    code: string;
    contentType: string;
    contentId: string;
    viewCount: number;
    expiresAt: string | null;
    createdAt: string;
    isActive?: boolean;
  };
  content?: unknown;
  requiresPassword?: boolean;
  error?: string;
}

export interface ShareLinkListResponse {
  links: Array<{
    code: string;
    contentType: string;
    contentId: string;
    viewCount: number;
    expiresAt: string | null;
    isExpired: boolean;
    isActive: boolean;
    createdAt: string;
    url: string;
  }>;
}

export function createShareTestUserId(prefix: string = "e2e-share"): string {
  return `${prefix}-${randomUUID()}`;
}

export async function createShareLink(
  request: APIRequestContext,
  payload: CreateSharePayload,
  options?: { userId?: string }
): Promise<ShareApiResult<ShareLinkCreateResponse>> {
  const response = await request.post("/api/share", {
    data: payload,
    headers: {
      "Content-Type": "application/json",
      ...(options?.userId ? { "x-user-id": options.userId } : null),
    },
  });

  return {
    status: response.status(),
    body: await response.json().catch(() => null),
  };
}

export async function getShareLink(
  request: APIRequestContext,
  code: string
): Promise<ShareApiResult<ShareLinkGetResponse>> {
  const response = await request.get(`/api/share/${code}`);

  return {
    status: response.status(),
    body: await response.json().catch(() => null),
  };
}

export async function updateShareLink(
  request: APIRequestContext,
  code: string,
  payload: { password?: string | null; expiresAt?: string | null }
): Promise<ShareApiResult<ShareLinkGetResponse>> {
  const response = await request.put(`/api/share/${code}`, {
    data: payload,
    headers: {
      "Content-Type": "application/json",
    },
  });

  return {
    status: response.status(),
    body: await response.json().catch(() => null),
  };
}

export async function revokeShareLink(
  request: APIRequestContext,
  code: string
): Promise<ShareApiResult<ShareLinkGetResponse>> {
  const response = await request.delete(`/api/share/${code}`);

  return {
    status: response.status(),
    body: await response.json().catch(() => null),
  };
}

export async function verifyShareLinkPassword(
  request: APIRequestContext,
  code: string,
  password: string
): Promise<ShareApiResult<ShareLinkGetResponse>> {
  const response = await request.post(`/api/share/${code}/verify`, {
    data: { password },
    headers: {
      "Content-Type": "application/json",
    },
  });

  return {
    status: response.status(),
    body: await response.json().catch(() => null),
  };
}

export async function listShareLinks(
  request: APIRequestContext,
  userId: string,
  includeInactive: boolean = false
): Promise<ShareApiResult<ShareLinkListResponse>> {
  const response = await request.get(
    `/api/share/mine?userId=${encodeURIComponent(userId)}&includeInactive=${includeInactive ? "true" : "false"}`
  );

  return {
    status: response.status(),
    body: await response.json().catch(() => null),
  };
}
