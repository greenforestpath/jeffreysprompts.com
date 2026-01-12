import { createHash } from "crypto";

export type ShareContentType = "prompt" | "bundle" | "workflow" | "collection";

export interface ShareLink {
  id: string;
  userId?: string | null;
  contentType: ShareContentType;
  contentId: string;
  linkCode: string;
  passwordHash?: string | null;
  expiresAt?: string | null;
  viewCount: number;
  isActive: boolean;
  createdAt: string;
}

export interface ShareLinkView {
  id: string;
  linkId: string;
  viewerId?: string | null;
  ipHash?: string | null;
  userAgent?: string | null;
  viewedAt: string;
}

interface ShareLinkStore {
  links: Map<string, ShareLink>;
  linksByCode: Map<string, string>;
  views: Map<string, ShareLinkView[]>;
  order: string[];
}

const STORE_KEY = "__jfp_share_link_store__";
const CODE_LENGTH = 12;
const MAX_CODE_ATTEMPTS = 10;
const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";

function getStore(): ShareLinkStore {
  const globalStore = globalThis as typeof globalThis & {
    [STORE_KEY]?: ShareLinkStore;
  };

  if (!globalStore[STORE_KEY]) {
    globalStore[STORE_KEY] = {
      links: new Map(),
      linksByCode: new Map(),
      views: new Map(),
      order: [],
    };
  }

  return globalStore[STORE_KEY];
}

function touchLink(store: ShareLinkStore, linkId: string) {
  store.order = [linkId, ...store.order.filter((id) => id !== linkId)];
}

function createLinkCode(): string {
  let code = "";
  for (let i = 0; i < CODE_LENGTH; i += 1) {
    code += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return code;
}

function hashValue(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

export function hashPassword(password: string): string {
  return hashValue(password);
}

export function verifyPassword(password: string, hash: string | null | undefined): boolean {
  if (!hash) return true;
  return hashValue(password) === hash;
}

export function createShareLink(input: {
  userId?: string | null;
  contentType: ShareContentType;
  contentId: string;
  password?: string | null;
  expiresAt?: string | null;
}): ShareLink {
  const store = getStore();
  const now = new Date().toISOString();

  let linkCode = "";
  let attempts = 0;
  while (!linkCode || store.linksByCode.has(linkCode)) {
    linkCode = createLinkCode();
    attempts += 1;
    if (attempts > MAX_CODE_ATTEMPTS) {
      linkCode = `${createLinkCode()}${Math.floor(Math.random() * 10)}`.slice(0, CODE_LENGTH);
    }
  }

  const link: ShareLink = {
    id: crypto.randomUUID(),
    userId: input.userId ?? null,
    contentType: input.contentType,
    contentId: input.contentId,
    linkCode,
    passwordHash: input.password ? hashPassword(input.password) : null,
    expiresAt: input.expiresAt ?? null,
    viewCount: 0,
    isActive: true,
    createdAt: now,
  };

  store.links.set(link.id, link);
  store.linksByCode.set(link.linkCode, link.id);
  store.views.set(link.id, []);
  touchLink(store, link.id);
  return link;
}

export function getShareLinkByCode(code: string): ShareLink | null {
  const store = getStore();
  const linkId = store.linksByCode.get(code);
  if (!linkId) return null;
  return store.links.get(linkId) ?? null;
}

export function listShareLinks(filters?: {
  userId?: string | null;
  includeInactive?: boolean;
}): ShareLink[] {
  const store = getStore();
  const includeInactive = filters?.includeInactive ?? false;
  const userId = filters?.userId ?? null;

  return store.order
    .map((id) => store.links.get(id))
    .filter((link): link is ShareLink => Boolean(link))
    .filter((link) => {
      if (!includeInactive && !link.isActive) return false;
      if (userId && link.userId !== userId) return false;
      return true;
    });
}

export function updateShareLinkSettings(input: {
  code: string;
  password?: string | null;
  expiresAt?: string | null;
}): ShareLink | null {
  const store = getStore();
  const link = getShareLinkByCode(input.code);
  if (!link) return null;

  if (input.password !== undefined) {
    link.passwordHash = input.password ? hashPassword(input.password) : null;
  }
  if (input.expiresAt !== undefined) {
    link.expiresAt = input.expiresAt;
  }

  store.links.set(link.id, link);
  touchLink(store, link.id);
  return link;
}

export function revokeShareLink(code: string): ShareLink | null {
  const store = getStore();
  const link = getShareLinkByCode(code);
  if (!link) return null;
  link.isActive = false;
  store.links.set(link.id, link);
  touchLink(store, link.id);
  return link;
}

export function recordShareLinkView(input: {
  linkId: string;
  viewerId?: string | null;
  ip?: string | null;
  userAgent?: string | null;
}): ShareLinkView | null {
  const store = getStore();
  const link = store.links.get(input.linkId);
  if (!link) return null;

  const view: ShareLinkView = {
    id: crypto.randomUUID(),
    linkId: input.linkId,
    viewerId: input.viewerId ?? null,
    ipHash: input.ip ? hashValue(input.ip) : null,
    userAgent: input.userAgent ?? null,
    viewedAt: new Date().toISOString(),
  };

  const list = store.views.get(input.linkId) ?? [];
  list.push(view);
  store.views.set(input.linkId, list);

  link.viewCount += 1;
  store.links.set(link.id, link);
  touchLink(store, link.id);

  return view;
}
