/** Shared compound-interest math. The page, preview image, and calendar all use this. */

export const DEFAULTS = { p: 5000, m: 800, r: 7, y: 30, f: 12 };

export const LIMITS = {
  p: [0, 50000000],
  m: [0, 100000],
  r: [0, 100],
  y: [1, 80],
};

export const FREQUENCIES = [1, 4, 12, 365];

/** Years stay linear. The other sliders use CURVES and 1,000 positions. */
export const RANGES = {
  y: { min: 1, max: 50, step: 1 },
};

const POSITIONS = 1000;

/** [t0, t1, v0, v1, step] as fractions of slider travel. */
export const CURVES = {
  p: [
    [0, 0.3, 0, 10_000, 100],
    [0.3, 0.65, 10_000, 100_000, 1_000],
    [0.65, 0.85, 100_000, 1_000_000, 10_000],
    [0.85, 0.95, 1_000_000, 10_000_000, 100_000],
    [0.95, 1, 10_000_000, 50_000_000, 1_000_000],
  ],
  m: [
    [0, 0.4, 0, 1_000, 25],
    [0.4, 0.7, 1_000, 5_000, 100],
    [0.7, 0.85, 5_000, 20_000, 500],
    [0.85, 1, 20_000, 100_000, 1_000],
  ],
  r: [
    [0, 0.75, 0, 15, 0.1],
    [0.75, 0.88, 15, 30, 0.5],
    [0.88, 1, 30, 100, 1],
  ],
};

const SRC_RE = /^[a-z0-9][a-z0-9-]{0,31}$/;

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

export function readSrc(source) {
  const raw = (readParam(source, "src") || "").trim().toLowerCase();
  if (SRC_RE.test(raw)) return raw;
  if (readParam(source, "s") === "1") return "share";
  return "";
}

export function isShareVisit(source) {
  return readSrc(source) === "share";
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

/** Month count when the balance first reaches `target`. Cap is 100 years. */
export function monthsToTarget(plan, target, cap = 1200) {
  const p = plan.p;
  const m = plan.m;
  const r = plan.r;
  const f = plan.f;
  if (p >= target) return 0;
  const g = Math.pow(1 + r / 100 / f, f / 12);
  let b = p;
  for (let mo = 1; mo <= cap; mo++) {
    b = b * g + m;
    if (b >= target) return mo;
  }
  return null;
}

export function formatMonths(months) {
  if (months == null) return null;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const yearPart = `${years} ${years === 1 ? "year" : "years"}`;
  if (!rest) return yearPart;
  const monthPart = `${rest} ${rest === 1 ? "month" : "months"}`;
  return `${yearPart}, ${monthPart}`;
}

/** Monthly end-of-month deposit that reaches `target` in `y` years. Monthly compounding. */
export function paymentNeeded(target, { p = 0, r, y }) {
  const i = r / 100 / 12;
  const n = 12 * Math.round(y);
  if (i === 0) return (target - p) / n;
  const growth = Math.pow(1 + i, n);
  return ((target - p * growth) * i) / (growth - 1);
}

/** Deposit for `depositYears`, then compound with no new deposits for `idleYears`. */
export function projectPaused({ p, m, r, f = 12, depositYears, idleYears }) {
  const saving = project({ p, m, r, y: depositYears, f });
  const riding = project({ p: saving.bal, m: 0, r, y: idleYears, f });
  return { bal: riding.bal, con: saving.con, int: riding.bal - saving.con, rows: riding.rows };
}

export function ruleOf72(rate) {
  if (!rate) return null;
  return 72 / rate;
}

/** Years for a lump sum to double at a yearly compound rate. */
export function exactDoublingYears(rate) {
  if (!rate) return null;
  return Math.log(2) / Math.log(1 + rate / 100);
}

/** Effective annual rate for a nominal rate compounded `periods` times a year. */
export function effectiveAnnualRate(rate, periods) {
  return Math.pow(1 + rate / 100 / periods, periods) - 1;
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
  if (!text.includes(".")) return text;
  return text.replace(/0+$/, "").replace(/\.$/, "");
}

function compactDigits(abs, div, suffix) {
  if (abs >= div * 10) return 0;
  if (suffix === "K") return 1;
  return 2;
}

export function formatCompact(n) {
  const value = Number(n);
  if (!Number.isFinite(value)) return "$0";
  const sign = value < 0 ? "-" : "";
  const abs = Math.abs(value);
  if (abs >= 1e15) {
    const exp = Math.floor(Math.log10(abs));
    const mant = abs / 10 ** exp;
    return `${sign}$${trimZeros(mant.toFixed(2))}e${exp}`;
  }
  const rounded = Math.round(abs);
  const tiers = [
    [1e12, "T"],
    [1e9, "B"],
    [1e6, "M"],
    [1e3, "K"],
  ];
  for (let i = 0; i < tiers.length; i++) {
    const [div, suffix] = tiers[i];
    if (rounded < div) continue;
    const digits = compactDigits(rounded, div, suffix);
    let text = trimZeros((rounded / div).toFixed(digits));
    if (Number(text) >= 1000 && i > 0) {
      const [upDiv, upSuffix] = tiers[i - 1];
      const upDigits = compactDigits(rounded, upDiv, upSuffix);
      text = trimZeros((rounded / upDiv).toFixed(upDigits));
      return `${sign}$${text}${upSuffix}`;
    }
    return `${sign}$${text}${suffix}`;
  }
  return `${sign}$${groupDigits(rounded)}`;
}

/** Full dollars below $1 billion. Short form at and above that, including $2.71B. */
export function formatMoney(n) {
  const value = Number(n);
  if (!Number.isFinite(value)) return "$0";
  if (Math.abs(value) >= 1e9) return formatCompact(value);
  return formatFull(value);
}

/**
 * Big total and other headlines. Millions under $10M keep two decimals
 * ($1.02M) and drop a trailing .0. Smaller totals stay in full dollars.
 */
export function formatHeadline(n) {
  const value = Number(n);
  if (!Number.isFinite(value)) return "$0";
  const abs = Math.abs(value);
  if (abs >= 1e6 && abs < 1e7) return formatCompact(value);
  return formatMoney(value);
}

/** 56px for short totals, down to 26px so a long total stays inside the column. */
export function totalFontSize(text) {
  const chars = Math.max(1, String(text).length);
  const size = Math.round(340 / (chars * 0.62));
  return Math.max(26, Math.min(56, size));
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

function segmentForT(segments, t) {
  for (let i = 0; i < segments.length; i++) {
    if (t <= segments[i][1] || i === segments.length - 1) return segments[i];
  }
  return segments[segments.length - 1];
}

function segmentForValue(segments, value) {
  for (let i = 0; i < segments.length; i++) {
    if (value <= segments[i][3] || i === segments.length - 1) return segments[i];
  }
  return segments[segments.length - 1];
}

function snap(value, step, min, max) {
  const steps = Math.round((value - min) / step);
  let snapped = min + steps * step;
  snapped = step < 1 ? Math.round(snapped * 10) / 10 : Math.round(snapped);
  return Math.min(max, Math.max(min, snapped));
}

export function sliderMax(kind) {
  return kind === "y" ? RANGES.y.max : POSITIONS;
}

export function sliderValue(kind, pos) {
  if (kind === "y") return Math.min(RANGES.y.max, Math.max(RANGES.y.min, Math.round(Number(pos))));
  const t = Math.min(1, Math.max(0, Number(pos) / POSITIONS));
  const [t0, t1, v0, v1, step] = segmentForT(CURVES[kind], t);
  const raw = v0 + ((t - t0) / (t1 - t0)) * (v1 - v0);
  return snap(raw, step, v0, v1);
}

/** Thumb position for a value. Off-step amounts land on the nearest step. */
export function sliderPos(kind, value) {
  const numeric = Number(value);
  if (kind === "y") return Math.min(RANGES.y.max, Math.max(RANGES.y.min, Math.round(numeric)));
  const [t0, t1, v0, v1, step] = segmentForValue(CURVES[kind], numeric);
  const snapped = snap(numeric, step, v0, v1);
  const u = v1 === v0 ? 0 : (snapped - v0) / (v1 - v0);
  const t = t0 + u * (t1 - t0);
  return Math.round(Math.min(1, Math.max(0, t)) * POSITIONS);
}

export function sliderPercent(kind, value) {
  const max = sliderMax(kind);
  const min = kind === "y" ? RANGES.y.min : 0;
  if (max === min) return 0;
  const pct = ((sliderPos(kind, value) - min) / (max - min)) * 100;
  return Math.min(100, Math.max(0, pct));
}

export function planKey(plan) {
  return JSON.stringify({ p: plan.p, m: plan.m, r: plan.r, y: plan.y, f: plan.f });
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
    totalFull: formatMoney(result.bal),
    monthly,
    monthlyFull: formatFull(plan.m),
    contributed: formatMoney(result.con),
    interest: formatMoney(result.int),
    years,
    yearWord: unit,
    rate,
    title: `${monthly}/mo becomes ${total} in ${years} ${unit}`,
    description: SHARE_DESCRIPTION,
    imageHeadline: `My jar hits ${total}`,
    imageSub: `${monthly} a month for ${years} ${unit} at ${rate}%`,
    imageFooter: "compoundjar.com · just keep compounding",
    shareText: `I just locked in my plan: ${formatFull(plan.m)} a month, ${formatMoney(result.bal)} in ${years} ${unit}. Just keep compounding 🫙`,
  };
}

export function answerSentence(plan, result = project(plan)) {
  const years = Math.round(plan.y);
  const deposit =
    plan.m === 0 ? "no monthly deposit" : `${formatFull(plan.m)} a month`;
  return `With ${formatMoney(plan.p)} to start and ${deposit} at ${formatRate(plan.r)}% for ${years} ${yearWord(years)}, you'd have about ${formatMoney(result.bal)}. ${formatMoney(result.con)} of that is money you put in, and the other ${formatMoney(result.int)} is growth.`;
}

export function chartCaption(plan, result = project(plan)) {
  const years = Math.round(plan.y);
  const lead = `Your jar after ${years} ${yearWord(years)}: ${formatMoney(result.con)} in deposits, ${formatMoney(result.int)} in growth.`;
  if (!result.cross) return lead;
  return `${lead} By year ${result.cross}, growth has outpaced everything you've put in.`;
}

export function yearRows(result) {
  return result.rows.map((row) => ({
    label: row.yr === 0 ? "Start" : String(row.yr),
    balance: formatMoney(row.bal),
    contributed: formatMoney(row.con),
    interest: formatMoney(row.bal - row.con),
  }));
}

export function planSearchParams(plan, { src = "" } = {}) {
  const params = new URLSearchParams();
  params.set("p", String(plan.p));
  params.set("m", String(plan.m));
  params.set("r", formatRate(plan.r));
  params.set("y", String(plan.y));
  params.set("f", String(plan.f));
  if (src) params.set("src", src);
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
