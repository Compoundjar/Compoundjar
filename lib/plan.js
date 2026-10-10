/** Shared compound-interest math. The page, preview image, and calendar all use this. */

export const DEFAULTS = { p: 1000, m: 200, r: 7, y: 30, f: 12 };

export const LIMITS = {
  p: [0, 10000000],
  m: [0, 1000000],
  r: [0, 50],
  y: [1, 80],
};

export const FREQUENCIES = [1, 4, 12, 365];

export const RANGES = {
  p: { min: 0, max: 50000, step: 100 },
  m: { min: 0, max: 3000, step: 25 },
  r: { min: 0, max: 15, step: 0.5 },
  y: { min: 1, max: 50, step: 1 },
};

const SHARE_DESCRIPTION =
  "See how your money grows. Change the numbers and lock in your own plan.";

function readParam(source, key) {
  if (!source) return null;
  if (typeof source.get === "function") {
    const value = source.get(key);
    return value == null ? null : String(value);
  }
  if (Object.prototype.hasOwnProperty.call(source, key)) {
    const value = source[key];
    if (Array.isArray(value)) return value[0] == null ? null : String(value[0]);
    if (value == null) return null;
    return String(value);
  }
  return null;
}

export function parsePlan(source) {
  const plan = { ...DEFAULTS };
  for (const key of Object.keys(DEFAULTS)) {
    const raw = readParam(source, key);
    if (raw == null || raw.trim() === "") continue;
    const value = Number.parseFloat(raw);
    if (Number.isFinite(value)) plan[key] = value;
  }
  if (!FREQUENCIES.includes(plan.f)) plan.f = DEFAULTS.f;
  for (const key of Object.keys(LIMITS)) {
    const [min, max] = LIMITS[key];
    plan[key] = Math.min(max, Math.max(min, plan[key]));
  }
  plan.p = Math.round(plan.p);
  plan.m = Math.round(plan.m);
  plan.y = Math.round(plan.y);
  plan.r = Math.round(plan.r * 100) / 100;
  return plan;
}

export function isShareVisit(source) {
  return readParam(source, "s") === "1" || readParam(source, "src") === "share";
}

export function shareFlags(source) {
  return {
    share: readParam(source, "s") === "1",
    src: readParam(source, "src") === "share",
  };
}

/**
 * Deposits at the end of each month. The nominal annual rate compounds `f`
 * times a year and is converted to an equivalent monthly growth factor.
 * When f is 12, that factor is exactly 1 + r/12.
 */
export function project({ p, m, r, y, f }) {
  const g = Math.pow(1 + r / 100 / f, f / 12);
  let b = p;
  let c = p;
  const rows = [{ yr: 0, bal: b, con: c }];
  let cross = null;
  const months = Math.round(y) * 12;
  for (let mo = 1; mo <= months; mo++) {
    b = b * g + m;
    c += m;
    if (mo % 12 === 0) {
      const yr = mo / 12;
      rows.push({ yr, bal: b, con: c });
      if (cross === null && b - c > c) cross = yr;
    }
  }
  return { bal: b, con: c, int: b - c, rows, cross };
}

export function yearsToTarget(plan, target) {
  const result = project({ ...plan, y: LIMITS.y[1] });
  for (const row of result.rows) {
    if (row.yr > 0 && row.bal >= target) return row.yr;
  }
  return null;
}

export function ruleOf72(rate) {
  if (!rate) return null;
  return 72 / rate;
}

function groupDigits(value) {
  return String(Math.abs(Math.round(value))).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function formatFull(n) {
  const rounded = Math.round(Number(n));
  const sign = rounded < 0 ? "-" : "";
  return `${sign}$${groupDigits(rounded)}`;
}

function trimZeros(text) {
  return text.includes(".") ? text.replace(/\.0$/, "") : text;
}

export function formatCompact(n) {
  const rounded = Math.round(Number(n));
  const sign = rounded < 0 ? "-" : "";
  const abs = Math.abs(rounded);
  const tiers = [
    [1e12, "T"],
    [1e9, "B"],
    [1e6, "M"],
    [1e3, "K"],
  ];
  for (let i = 0; i < tiers.length; i++) {
    const [div, suffix] = tiers[i];
    if (abs < div) continue;
    const digits = abs >= div * 10 ? 0 : 1;
    let text = trimZeros((abs / div).toFixed(digits));
    if (Number(text) >= 1000 && i > 0) {
      const [upDiv, upSuffix] = tiers[i - 1];
      const upDigits = abs >= upDiv * 10 ? 0 : 1;
      text = trimZeros((abs / upDiv).toFixed(upDigits));
      return `${sign}$${text}${upSuffix}`;
    }
    return `${sign}$${text}${suffix}`;
  }
  return `${sign}$${groupDigits(abs)}`;
}

export function formatPreviewMoney(n) {
  const rounded = Math.round(Number(n));
  if (Math.abs(rounded) >= 10000) return formatCompact(rounded);
  return formatFull(rounded);
}

export function formatRate(r) {
  return String(Math.round(Number(r) * 100) / 100);
}

export function formatInput(kind, value) {
  if (kind === "r") return formatRate(value);
  return groupDigits(value);
}

export function sliderPercent(value, min, max) {
  if (max === min) return 0;
  const pct = ((Number(value) - min) / (max - min)) * 100;
  return Math.min(100, Math.max(0, pct));
}

export function yearWord(years) {
  return years === 1 ? "year" : "years";
}

export function previewModel(plan) {
  const result = project(plan);
  const years = Math.round(plan.y);
  const unit = yearWord(years);
  const monthly = formatPreviewMoney(plan.m);
  const total = formatCompact(result.bal);
  const rate = formatRate(plan.r);
  return {
    result,
    total,
    totalFull: formatFull(result.bal),
    monthly,
    monthlyFull: formatFull(plan.m),
    contributed: formatFull(result.con),
    interest: formatFull(result.int),
    years,
    yearWord: unit,
    rate,
    title: `${monthly}/mo becomes ${total} in ${years} ${unit}`,
    description: SHARE_DESCRIPTION,
    imageHeadline: `My jar hits ${total}`,
    imageSub: `${monthly} a month for ${years} ${unit} at ${rate}%`,
    imageFooter: "compoundjar.com · just keep compounding",
    shareText: `I just locked in my plan: ${formatFull(plan.m)} a month, ${formatFull(result.bal)} in ${years} ${unit}. Just keep compounding 🫙`,
  };
}

export function answerSentence(plan, result = project(plan)) {
  const years = Math.round(plan.y);
  const deposit =
    plan.m === 0 ? "no monthly deposit" : `${formatFull(plan.m)} a month`;
  return `With ${formatFull(plan.p)} to start and ${deposit} at ${formatRate(plan.r)}% for ${years} ${yearWord(years)}, you'd have about ${formatFull(result.bal)}; ${formatFull(result.con)} of that is money you put in and the rest is growth.`;
}

export function yearRows(result) {
  return result.rows.map((row) => ({
    label: row.yr === 0 ? "Start" : String(row.yr),
    balance: formatFull(row.bal),
    contributed: formatFull(row.con),
    interest: formatFull(row.bal - row.con),
  }));
}

export function planSearchParams(plan, { share = false, src = false } = {}) {
  const params = new URLSearchParams();
  params.set("p", String(plan.p));
  params.set("m", String(plan.m));
  params.set("r", formatRate(plan.r));
  params.set("y", String(plan.y));
  params.set("f", String(plan.f));
  if (share) params.set("s", "1");
  if (src) params.set("src", "share");
  return params;
}

export function nextMonthStart(now = new Date()) {
  const date = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}${month}01`;
}

export function addDays(yyyymmdd, days) {
  const year = Number(yyyymmdd.slice(0, 4));
  const month = Number(yyyymmdd.slice(4, 6));
  const day = Number(yyyymmdd.slice(6, 8));
  const date = new Date(Date.UTC(year, month - 1, day + days));
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}${m}${d}`;
}

export function sanitizeStartDate(value, now = new Date()) {
  if (
    typeof value === "string" &&
    /^20\d\d(0[1-9]|1[0-2])(0[1-9]|1\d|2[0-8])$/.test(value)
  ) {
    return value;
  }
  return nextMonthStart(now);
}

export function reminderCopy(plan, origin) {
  const model = previewModel(plan);
  const link = `${origin}/?${planSearchParams(plan).toString()}`;
  const summary = `Add ${model.monthlyFull} to your Compound Jar`;
  const details = [
    "Monthly deposit for your Compound Jar plan.",
    `${formatFull(plan.p)} to start, ${model.monthlyFull} a month, ${model.rate}% a year, ${model.years} ${model.yearWord}.`,
    `Projected total: ${model.totalFull}.`,
    `Open your plan: ${link}`,
    "Just keep compounding.",
  ].join("\n");
  return { summary, details, link, model };
}

export function googleCalendarUrl({ plan, origin, startDate }) {
  const start = sanitizeStartDate(startDate);
  const { summary, details } = reminderCopy(plan, origin);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: summary,
    details,
    dates: `${start}/${addDays(start, 1)}`,
    recur: "RRULE:FREQ=MONTHLY",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

export { SHARE_DESCRIPTION };
