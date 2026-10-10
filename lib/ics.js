import { addDays, reminderCopy, sanitizeStartDate } from "./plan.js";

function escapeText(value) {
  return String(value)
    .replace(/\\/g, "\\\\")
    .replace(/\r\n|\n|\r/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
}

function foldLine(line) {
  const bytes = Buffer.from(line, "utf8");
  if (bytes.length <= 75) return line;
  const parts = [];
  let offset = 0;
  let limit = 75;
  while (offset < bytes.length) {
    let end = Math.min(offset + limit, bytes.length);
    while (end > offset && end < bytes.length && (bytes[end] & 0xc0) === 0x80) end -= 1;
    if (end === offset) end = Math.min(offset + limit, bytes.length);
    const chunk = bytes.subarray(offset, end).toString("utf8");
    parts.push(offset === 0 ? chunk : ` ${chunk}`);
    offset = end;
    limit = 74;
  }
  return parts.join("\r\n");
}

function formatStamp(now) {
  const date = now instanceof Date ? now : new Date(now);
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  const hh = String(date.getUTCHours()).padStart(2, "0");
  const mm = String(date.getUTCMinutes()).padStart(2, "0");
  const ss = String(date.getUTCSeconds()).padStart(2, "0");
  return `${y}${m}${d}T${hh}${mm}${ss}Z`;
}

export function buildIcs({ plan, origin, startDate, now = new Date() }) {
  const start = sanitizeStartDate(startDate, now);
  const end = addDays(start, 1);
  const { summary, details, link } = reminderCopy(plan, origin);
  const uid = `compound-jar-${plan.p}-${plan.m}-${plan.r}-${plan.y}-${plan.f}@compoundjar.com`;
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Compound Jar//Compound Jar//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${formatStamp(now)}`,
    `DTSTART;VALUE=DATE:${start}`,
    `DTEND;VALUE=DATE:${end}`,
    "RRULE:FREQ=MONTHLY",
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(details)}`,
    `URL:${link}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeText(summary)}`,
    "TRIGGER:PT9H",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return `${lines.map(foldLine).join("\r\n")}\r\n`;
}
