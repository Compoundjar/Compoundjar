export function requestOrigin(headerList) {
  const rawHost = headerList.get("x-forwarded-host") || headerList.get("host") || "compoundjar.com";
  const host = rawHost.split(",")[0].trim();
  if (!/^[A-Za-z0-9.:-]+$/.test(host)) return "https://compoundjar.com";
  let proto = (headerList.get("x-forwarded-proto") || "").split(",")[0].trim().toLowerCase();
  if (proto !== "http" && proto !== "https") {
    proto = host.startsWith("localhost") || host.startsWith("127.0.0.1") ? "http" : "https";
  }
  return `${proto}://${host}`;
}

export function requestHost(headerList) {
  const rawHost = headerList.get("x-forwarded-host") || headerList.get("host") || "";
  return rawHost.split(",")[0].trim().split(":")[0].toLowerCase();
}

export function isPreviewHost(host) {
  return host.endsWith(".vercel.app");
}
