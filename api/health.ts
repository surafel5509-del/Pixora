/**
 * GET /api/health — liveness + configuration probe used by uptime checks and
 * the in-app status indicator. Never exposes secrets.
 */

import { applyBaseHeaders, sendJson, type ApiRequest, type ApiResponse } from "./_lib/http";
import { isProviderConfigured } from "./_lib/pixabay";
import type { HealthResponse } from "../shared/types";

const startedAt = Date.now();

export default function handler(_req: ApiRequest, res: ApiResponse): void {
  const configured = isProviderConfigured();
  const body: HealthResponse = {
    ok: true,
    service: "pixora",
    version: "2.0.0",
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
    uptimeSeconds: Math.round((Date.now() - startedAt) / 1000),
    provider: {
      name: "pixabay",
      configured,
      mode: configured ? "live" : "demo",
    },
    timestamp: new Date().toISOString(),
  };

  applyBaseHeaders(res, "public, max-age=0, must-revalidate");
  sendJson(res, 200, body);
}
