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

export function analyticsPageUrl(href, referrer = "") {
  const url = new URL(href);
  const shared = url.searchParams.get("s") === "1" || url.searchParams.get("src") === "share";
  const ai = aiSource({ href, referrer });
  const reported = new URL(`${url.origin}/`);
  if (ai) reported.pathname = `/ai/${ai}`;
  else if (shared) reported.pathname = "/shared";
  if (shared) reported.searchParams.set("s", "1");
  return reported.toString();
}
