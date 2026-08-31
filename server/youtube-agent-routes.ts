/**
 * YouTube Agent API Routes
 *
 * Exposes the HeroSplit YouTube automation agent over HTTP so the
 * frontend dashboard can trigger content generation, fetch status,
 * and retrieve AI-generated suggestions — all without leaving the app.
 *
 * All routes require authentication (isAuthenticated middleware).
 * The heavy agent modules are loaded lazily on first request, so
 * the server starts fast even if the agent repo hasn't been cloned.
 */

import type { Express, Request, Response } from "express";
import path from "path";
import { isAuthenticated } from "./replit_integrations/auth";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AgentStatus {
  agentPath: string;
  agentRepoFound: boolean;
  credentialsConfigured: boolean;
  initialized: boolean;
  channelName: string;
  contentPillars: string[];
  postingFrequency: string;
}

// ─── Lazy agent singleton ─────────────────────────────────────────────────────

// We use require() here so the CJS module loads cleanly at runtime.
// The agent itself is CommonJS; TypeScript import() would work too.
let agentInstance: any = null;

function getAgent() {
  if (!agentInstance) {
    const agentModulePath = path.resolve(process.cwd(), "youtube-agent", "herosplit-agent.js");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { HeroSplitAgent } = require(agentModulePath);
    agentInstance = new HeroSplitAgent();
  }
  return agentInstance;
}

// ─── Route registration ───────────────────────────────────────────────────────

export function registerYouTubeAgentRoutes(app: Express) {
  const prefix = "/api/youtube-agent";

  // ── GET /api/youtube-agent/status ──────────────────────────────────────────
  // Returns agent health — works even without initializing the full pipeline.
  app.get(`${prefix}/status`, isAuthenticated, (_req: Request, res: Response) => {
    try {
      const status: AgentStatus = getAgent().getStatus();
      res.json({ ok: true, status });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // ── GET /api/youtube-agent/briefs ──────────────────────────────────────────
  // Returns content briefs for all (or filtered) workouts.
  // Query param: ?type=hero|villain|anime
  app.get(`${prefix}/briefs`, isAuthenticated, async (req: Request, res: Response) => {
    try {
      const type = req.query.type as string | undefined;
      const briefs = await getAgent().getContentBriefs(type);
      res.json({ ok: true, briefs });
    } catch (err: any) {
      res.status(500).json({ ok: false, error: err.message });
    }
  });

  // ── GET /api/youtube-agent/suggestions ────────────────────────────────────
  // Returns AI-ranked content opportunities.
  // Query param: ?type=hero|villain|anime
  app.get(`${prefix}/suggestions`, isAuthenticated, async (req: Request, res: Response) => {
    try {
      const type = req.query.type as string | undefined;
      const suggestions = await getAgent().getSuggestions(type);
      res.json({ ok: true, suggestions });
    } catch (err: any) {
      // Suggestions require the full agent; surface a helpful error
      if (err.message?.includes("not found at")) {
        res.status(503).json({
          ok: false,
          error: "Agent not configured",
          hint: err.message,
        });
      } else {
        res.status(500).json({ ok: false, error: err.message });
      }
    }
  });

  // ── POST /api/youtube-agent/generate/script ───────────────────────────────
  // Generates a full video script for a given workout.
  // Body: { slug: string }
  app.post(`${prefix}/generate/script`, isAuthenticated, async (req: Request, res: Response) => {
    const { slug } = req.body as { slug?: string };
    if (!slug) {
      return res.status(400).json({ ok: false, error: "slug is required" });
    }

    try {
      const result = await getAgent().generateScript(slug);
      res.json({ ok: true, ...result });
    } catch (err: any) {
      if (err.message?.includes("not found")) {
        res.status(503).json({ ok: false, error: "Agent not configured", hint: err.message });
      } else {
        res.status(500).json({ ok: false, error: err.message });
      }
    }
  });

  // ── POST /api/youtube-agent/generate/seo ─────────────────────────────────
  // Generates SEO metadata (title variants, description, tags) for a workout.
  // Body: { slug: string }
  app.post(`${prefix}/generate/seo`, isAuthenticated, async (req: Request, res: Response) => {
    const { slug } = req.body as { slug?: string };
    if (!slug) {
      return res.status(400).json({ ok: false, error: "slug is required" });
    }

    try {
      const result = await getAgent().generateSEO(slug);
      res.json({ ok: true, ...result });
    } catch (err: any) {
      if (err.message?.includes("not found")) {
        res.status(503).json({ ok: false, error: "Agent not configured", hint: err.message });
      } else {
        res.status(500).json({ ok: false, error: err.message });
      }
    }
  });
}
