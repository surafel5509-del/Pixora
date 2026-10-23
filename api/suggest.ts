/**
 * GET /api/suggest?q=
 *
 * Lightweight type-ahead used by the search bar and command palette. Runs
 * entirely over the shared taxonomy — no provider quota is consumed.
 */

import { DEMO_LIBRARY } from "../shared/demo-library";
import { TRENDING_TOPICS, categoryLabel } from "../shared/taxonomy";
import type { Suggestion, SuggestResponse } from "../shared/types";
import {
  applyBaseHeaders,
  ensureReadMethod,
  sendJson,
  stringParam,
  type ApiRequest,
  type ApiResponse,
} from "./_lib/http";

const TAG_SUGGESTIONS: Suggestion[] = Array.from(new Set(DEMO_LIBRARY.flatMap((item) => item.tags)))
  .sort()
  .map((tag) => ({
    label: tag.charAt(0).toUpperCase() + tag.slice(1),
    kind: "tag" as const,
    category: categoryLabel(DEMO_LIBRARY.find((item) => item.tags.includes(tag))?.category ?? "for-you"),
  }));

const CREATOR_SUGGESTIONS: Suggestion[] = Array.from(new Set(DEMO_LIBRARY.map((item) => item.creator)))
  .sort()
  .map((creator) => ({ label: creator, kind: "creator" as const }));

const TOPIC_SUGGESTIONS: Suggestion[] = TRENDING_TOPICS.map((topic) => ({
  label: topic,
  kind: "topic",
}));

const ALL: Suggestion[] = [...TOPIC_SUGGESTIONS, ...TAG_SUGGESTIONS, ...CREATOR_SUGGESTIONS];

export default function handler(req: ApiRequest, res: ApiResponse): void {
  applyBaseHeaders(res);
  if (!ensureReadMethod(req, res)) return;

  const term = stringParam(req.query.q, "", 60).toLowerCase();
  const matches = term ? ALL.filter((entry) => entry.label.toLowerCase().includes(term)) : TOPIC_SUGGESTIONS;

  const suggestions = matches.slice(0, 8);
  const body: SuggestResponse = { suggestions, source: "demo" };
  sendJson(res, 200, body);
}
