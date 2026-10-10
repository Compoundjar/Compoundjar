const AI_SOURCES = [
  ["chatgpt.com", "chatgpt"],
  ["chat.openai.com", "chatgpt"],
  ["perplexity.ai", "perplexity"],
  ["gemini.google.com", "gemini"],
  ["copilot.microsoft.com", "copilot"],
  ["claude.ai", "claude"],
];

function hostOf(value) {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export function aiSource({ href = "", referrer = "" } = {}) {
  let utm = "";
  try {
    utm = (new URL(href).searchParams.get("utm_source") || "").toLowerCase();
  } catch {
    utm = "";
  }
  const refHost = hostOf(referrer);
  for (const [host, slug] of AI_SOURCES) {
    if (refHost === host || refHost.endsWith(`.${host}`)) return slug;
    if (utm === host || utm === slug) return slug;
  }
  return null;
}

const SRC_RE = /^[a-z0-9][a-z0-9-]{0,31}$/;

const PLAN_FIELDS = new Set(["p", "m", "r", "y", "f"]);

/** Event properties may keep src and event fields. Plan numbers never go out. */
export function analyticsPayload(data) {
  const payload = {};
  if (!data || typeof data !== "object") return payload;
  for (const [key, value] of Object.entries(data)) {
    if (PLAN_FIELDS.has(key) || value == null) continue;
    payload[key] = value;
  }
  return payload;
}

export function analyticsPageUrl(href, referrer = "") {
  const url = new URL(href);
  let src = (url.searchParams.get("src") || "").trim().toLowerCase();
  if (!SRC_RE.test(src)) src = url.searchParams.get("s") === "1" ? "share" : "";
  const ai = src ? null : aiSource({ href, referrer });
  const reported = new URL(`${url.origin}/`);
  const path = url.pathname.replace(/\/+$/, "") || "/";
  if (path === "/") {
    if (src) reported.pathname = `/src/${src}`;
    else if (ai) reported.pathname = `/ai/${ai}`;
  } else if (src) {
    reported.pathname = `${path}/src/${src}`;
  } else if (ai) {
    reported.pathname = `${path}/ai/${ai}`;
  } else {
    reported.pathname = path;
  }
  reported.search = "";
  return reported.toString();
}

/** Pageview payload: path plus src (or an AI slug). Query plan params are dropped. */
export function analyticsEvent(event, href, referrer = "") {
  const next = { ...(event || {}) };
  try {
    next.url = analyticsPageUrl(href, referrer);
  } catch {
    try {
      const bare = new URL(href);
      bare.search = "";
      next.url = bare.toString();
    } catch {
      next.url = href;
    }
  }
  if (next.data && typeof next.data === "object") next.data = analyticsPayload(next.data);
  if (next.properties && typeof next.properties === "object") {
    next.properties = analyticsPayload(next.properties);
  }
  return next;
}
