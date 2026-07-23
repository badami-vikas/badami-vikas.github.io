import { scoreBrief } from "../../assets/operating-brief.mjs";

const ALLOWED_ORIGINS = new Set([
  "https://zazoo.me",
  "https://www.zazoo.me",
  "https://badami-vikas.github.io",
  "http://127.0.0.1:4173"
]);

function corsHeaders(origin) {
  return {
    "access-control-allow-origin": origin,
    "access-control-allow-methods": "POST, OPTIONS",
    "access-control-allow-headers": "content-type",
    "access-control-max-age": "86400",
    "content-type": "application/json; charset=utf-8",
    "vary": "Origin",
    "cache-control": "no-store"
  };
}

function json(origin, value, status) {
  return new Response(JSON.stringify(value), {
    status,
    headers: corsHeaders(origin)
  });
}

function isShortText(value, max) {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= max;
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("origin") || "";
    if (!ALLOWED_ORIGINS.has(origin)) {
      return json("null", { error: "Origin not allowed" }, 403);
    }
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    const url = new URL(request.url);
    if (request.method !== "POST" || url.pathname !== "/submissions") {
      return json(origin, { error: "Not found" }, 404);
    }
    const declaredSize = Number(request.headers.get("content-length") || 0);
    if (declaredSize > 32_000) {
      return json(origin, { error: "Request too large" }, 413);
    }

    let payload;
    try {
      payload = await request.json();
    } catch {
      return json(origin, { error: "Invalid JSON" }, 400);
    }

    if (
      !isShortText(payload.name, 120) ||
      !isShortText(payload.email, 240) ||
      !payload.email.includes("@") ||
      !isShortText(payload.profession, 160) ||
      !Array.isArray(payload.answers)
    ) {
      return json(origin, { error: "Incomplete submission" }, 400);
    }

    let result;
    try {
      result = scoreBrief(payload.answers);
    } catch {
      return json(origin, { error: "Answers must contain seven scores from 1 to 5" }, 400);
    }

    const id = crypto.randomUUID();
    const createdAt = new Date().toISOString();
    const raw = {
      answers: payload.answers,
      answerText: Array.isArray(payload.answerText) ? payload.answerText : [],
      submittedFrom: typeof payload.submittedFrom === "string" ? payload.submittedFrom.slice(0, 500) : ""
    };

    try {
      await env.DB.prepare(
        `INSERT INTO operating_briefs (
          id, created_at, name, email, profession, raw_data,
          current_layer, bottleneck, unlock, next_move, dimensions,
          origin, user_agent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        id,
        createdAt,
        payload.name.trim(),
        payload.email.trim(),
        payload.profession.trim(),
        JSON.stringify(raw),
        result.currentLayer,
        result.bottleneck,
        result.unlock,
        result.nextMove,
        JSON.stringify(result.dimensions),
        origin,
        (request.headers.get("user-agent") || "").slice(0, 500)
      ).run();
    } catch (error) {
      console.error(JSON.stringify({ event: "brief_save_failed", id, message: String(error) }));
      return json(origin, { error: "Unable to save submission" }, 500);
    }

    console.log(JSON.stringify({ event: "brief_saved", id, createdAt }));
    return json(origin, { saved: true }, 201);
  }
};
