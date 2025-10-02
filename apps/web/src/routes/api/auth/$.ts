// src/routes/api/auth.$.ts

import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: async ({ request }) => reactStartHandler2(request),
      POST: async ({ request }) => reactStartHandler2(request),
    },
  },
});

export async function reactStartHandler2(
  request: Request,
  opts?: { convexSiteUrl?: string; verbose?: boolean }
) {
  const requestUrl = new URL(request.url);
  const convexSiteUrl = opts?.convexSiteUrl ?? process.env.VITE_CONVEX_SITE_URL;
  if (!convexSiteUrl) {
    throw new Error("VITE_CONVEX_SITE_URL is not set");
  }

  const nextUrl = `${convexSiteUrl}${requestUrl.pathname}${requestUrl.search}`;

  const headers = new Headers(request.headers);
  headers.set("accept", "application/json");
  // Let the fetch implementation set the content-length.
  headers.delete("content-length");

  const init: RequestInit = {
    method: request.method,
    headers,
    redirect: "manual",
  };

  if (request.method !== "GET" && request.method !== "HEAD") {
    const buffer = await request.arrayBuffer();
    // Only add the body if it has content.
    if (buffer.byteLength > 0) {
      init.body = buffer;
    }
  }

  return fetch(nextUrl, init);
}
