/**
 * Serves the Vercel-style serverless handlers in `api/` during `vite dev`.
 *
 * Production (Vercel) compiles every file in `api/` into a function. This plugin
 * keeps a single source of truth by loading the exact same modules through Vite's
 * SSR pipeline and adapting Node's `req`/`res` to the Vercel `req.query` /
 * `res.status().json()` shape the handlers expect.
 */
import fs from "node:fs/promises";
import path from "node:path";
import type { ServerResponse } from "node:http";
import type { Connect, Plugin, ViteDevServer } from "vite";

type VercelResponse = {
  statusCode: number;
  headersSent: boolean;
  status(code: number): VercelResponse;
  setHeader(key: string, value: string | number | readonly string[]): VercelResponse;
  removeHeader(key: string): VercelResponse;
  json(body: unknown): void;
  send(body: string | Buffer): void;
  end(body?: string | Buffer): void;
};

type VercelRequest = {
  method?: string;
  url?: string;
  headers: Record<string, string | string[] | undefined>;
  query: Record<string, string | string[]>;
  body?: unknown;
};

type Handler = (req: VercelRequest, res: VercelResponse) => void | Promise<void>;

async function resolveHandler(segments: string[]): Promise<string | null> {
  const base = path.join(process.cwd(), "api", ...segments);
  const candidates = [`${base}.ts`, `${base}.js`, path.join(base, "index.ts"), path.join(base, "index.js")];
  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate);
      if (stat.isFile()) return candidate;
    } catch {
      /* keep looking */
    }
  }
  return null;
}

function createResponseShim(raw: ServerResponse): VercelResponse {
  let statusCode = 200;
  let finished = false;

  const write = (body: string | Buffer | undefined, type: string) => {
    if (finished) return;
    finished = true;
    if (!raw.headersSent) {
      if (!raw.getHeader("content-type")) raw.setHeader("content-type", type);
      raw.statusCode = statusCode;
    }
    if (body === undefined) raw.end();
    else raw.end(body);
  };

  const shim: VercelResponse = {
    get statusCode() {
      return statusCode;
    },
    set statusCode(code: number) {
      statusCode = code;
    },
    get headersSent() {
      return raw.headersSent;
    },
    set headersSent(value: boolean) {
      if (value) finished = true;
    },
    status(code: number) {
      statusCode = code;
      return shim;
    },
    setHeader(key, value) {
      raw.setHeader(key, value);
      return shim;
    },
    removeHeader(key) {
      raw.removeHeader(key);
      return shim;
    },
    json(body) {
      write(JSON.stringify(body), "application/json; charset=utf-8");
    },
    send(body) {
      write(body, typeof body === "string" ? "text/plain; charset=utf-8" : "application/octet-stream");
    },
    end(body) {
      write(body, "text/plain; charset=utf-8");
    },
  };

  return shim;
}

type MiddlewareRequest = Parameters<Connect.NextHandleFunction>[0];

async function handleRequest(
  req: MiddlewareRequest,
  res: ServerResponse,
  next: () => void,
  server: ViteDevServer,
): Promise<void> {
  if (!req.url || !req.url.startsWith("/api/")) {
    next();
    return;
  }

  const url = new URL(req.url, "http://localhost");
  const segments = url.pathname
    .replace(/^\/api\//, "")
    .split("/")
    .filter(Boolean);

  // Directories and files prefixed with `_` are shared helpers, never endpoints.
  if (!segments.length || segments.some((segment) => segment.startsWith("_"))) {
    next();
    return;
  }

  const file = await resolveHandler(segments);
  if (!file) {
    next();
    return;
  }

  try {
    const mod = (await server.ssrLoadModule(file)) as { default?: Handler };
    if (typeof mod.default !== "function") {
      next();
      return;
    }

    const vercelReq = req as unknown as VercelRequest;
    vercelReq.query = Object.fromEntries(url.searchParams.entries());

    const shim = createResponseShim(res);
    await mod.default(vercelReq, shim);
    if (!res.writableEnded) res.end();
  } catch (error) {
    server.config.logger.error(`[api] ${url.pathname} failed: ${String(error)}`);
    if (!res.headersSent) res.statusCode = 500;
    if (!res.writableEnded) {
      res.setHeader("content-type", "application/json; charset=utf-8");
      res.end(JSON.stringify({ error: "Internal server error." }));
    }
  }
}

export function apiDevServer(): Plugin {
  const apiDir = path.join(process.cwd(), "api");

  return {
    name: "pixora:api-dev-server",
    configureServer(server: ViteDevServer) {
      // Invalidate cached API modules when they change so edits hot-reload.
      server.watcher.on("change", (file) => {
        if (!file.startsWith(apiDir)) return;
        for (const [id, mod] of server.moduleGraph.idToModuleMap) {
          if (id.startsWith(apiDir)) server.moduleGraph.invalidateModule(mod);
        }
      });

      server.middlewares.use((req, res, next) => {
        void handleRequest(req, res, next, server);
      });
    },
  };
}
