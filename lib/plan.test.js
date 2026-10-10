import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { parseICS } from "node-ical";
import { analyticsEvent, analyticsPageUrl, analyticsPayload } from "./analytics.js";
import { indexnowKey } from "../content/indexnow.js";
import { sameAs } from "../content/social.js";
import { buildIcs } from "./ics.js";
import {
  DEFAULTS,
  answerSentence,
  chartCaption,
  formatCompact,
  formatFull,
  formatHeadline,
  formatMoney,
  formatShareStamp,
  millionaireCalendarYear,
  millionaireMonths,
  monthlyNeeded,
  parsePlan,
  parseShareDate,
  planSearchParams,
  previewModel,
  project,
  readShareDate,
  readSrc,
  sliderPos,
  sliderValue,
  totalFontSize,
  yearsToTarget,
} from "./plan.js";
import { buildJsonLd, buildPageMeta } from "./seo.js";

function closedForm(p, m, r, y) {
  const months = y * 12;
  const i = r / 100 / 12;
  if (i === 0) return p + m * months;
  const growth = (1 + i) ** months;
  return p * growth + m * ((growth - 1) / i);
}

describe("project", () => {
  it("matches the monthly closed form", () => {
    const plan = { p: 5000, m: 500, r: 8, y: 25, f: 12 };
    const got = project(plan).bal;
    assert.ok(Math.abs(got - closedForm(5000, 500, 8, 25)) < 0.02);
  });

  it("matches the default closed form and the $293,000 contribution", () => {
    const result = project(DEFAULTS);
    assert.equal(result.con, 293000);
    assert.equal(Math.round(result.bal), 1_016_559);
    assert.ok(Math.abs(result.bal - closedForm(5000, 800, 7, 30)) < 0.02);
  });

  it("treats a zero rate as deposits only", () => {
    const result = project({ p: 1000, m: 200, r: 0, y: 2, f: 12 });
    assert.equal(result.bal, 1000 + 200 * 24);
    assert.equal(result.int, 0);
  });

  it("ranks daily at least as high as monthly, and monthly at least as high as yearly", () => {
    const base = { p: 1000, m: 200, r: 7, y: 30 };
    const daily = project({ ...base, f: 365 }).bal;
    const monthly = project({ ...base, f: 12 }).bal;
    const yearly = project({ ...base, f: 1 }).bal;
    assert.ok(daily >= monthly);
    assert.ok(monthly >= yearly);
  });

  it("gives the longer plan a higher balance and more contributions", () => {
    const early = project({ p: 0, m: 200, r: 7, f: 12, y: 40 });
    const late = project({ p: 0, m: 200, r: 7, f: 12, y: 30 });
    assert.ok(early.bal > late.bal);
    assert.ok(early.con > late.con);
  });

  it("finds a year for the million example", () => {
    const years = yearsToTarget({ p: 0, m: 1000, r: 7, f: 12 }, 1_000_000);
    assert.equal(typeof years, "number");
    assert.ok(years > 0);
  });
});

describe("formatCompact", () => {
  it("uses K, M, and a carry into the next tier", () => {
    assert.equal(formatCompact(1_016_559), "$1.02M");
    assert.equal(formatCompact(1_100_000), "$1.1M");
    assert.equal(formatCompact(2_710_000), "$2.71M");
    assert.equal(formatCompact(1_200_000), "$1.2M");
    assert.equal(formatCompact(243_000), "$243K");
    assert.equal(formatCompact(999), "$999");
    assert.equal(formatCompact(10_000_000), "$10M");
    assert.equal(formatCompact(1_000_000), "$1M");
    assert.equal(formatCompact(1_500), "$1.5K");
    assert.equal(formatCompact(12_000), "$12K");
    assert.equal(formatCompact(999_500), "$1M");
    assert.equal(formatCompact(1_200_000_000), "$1.2B");
    assert.equal(formatCompact(2_710_000_000), "$2.71B");
    assert.equal(formatCompact(3_400_000_000_000), "$3.4T");
    assert.equal(formatCompact(1.7e33), "$1.7e33");
    assert.equal(formatHeadline(1_016_559), "$1.02M");
    assert.equal(formatHeadline(252_111), "$252,111");
    assert.equal(formatHeadline(609_985), "$609,985");
  });
});

describe("parsePlan", () => {
  it("falls back to defaults and clamps out-of-range values", () => {
    assert.deepEqual(parsePlan({}), DEFAULTS);
    assert.deepEqual(parsePlan({ p: "-5", m: "nope", r: "120.129", y: "0", f: "7" }), {
      p: 0,
      m: 800,
      r: 100,
      y: 1,
      f: 12,
    });
    assert.equal(parsePlan({ p: "999999999" }).p, 50_000_000);
    assert.equal(parsePlan({ m: "100000" }).m, 100_000);
    assert.equal(parsePlan({ y: "80" }).y, 80);
    assert.equal(parsePlan({ y: "100" }).y, 80);
  });

  it("ignores share and campaign params", () => {
    const plan = parsePlan({ p: "5000", s: "1", src: "share", utm_source: "chatgpt", extra: "1", t: "2026" });
    assert.equal(plan.p, 5000);
    assert.equal(plan.m, DEFAULTS.m);
    assert.equal("s" in plan, false);
    assert.equal("t" in plan, false);
  });
});

const OCT_2026 = { year: 2026, month: 10 };

describe("preview copy", () => {
  it("writes the starting-example answer from the engine", () => {
    const answer = answerSentence(DEFAULTS);
    assert.match(answer, /The calculator opens on an example, not a recommendation/);
    assert.match(answer, /grows to about \$1,016,559 in 30 years, crossing \$1 million in about 29 years, 10 months/);
    assert.match(answer, /\$293,000 of that is deposits, and \$723,559 is growth/);
    assert.match(answer, /Swap in your own numbers/);
    assert.equal(answerSentence({ p: 0, m: 200, r: 7, y: 10, f: 12 }).includes("example, not a recommendation"), false);
    assert.match(chartCaption(DEFAULTS), /In the starting example, growth passes total deposits in year 18/);
    assert.equal(formatHeadline(project(DEFAULTS).bal), "$1.02M");
  });

  it("counts the millionaire year from the share month", () => {
    assert.equal(millionaireMonths(DEFAULTS), 358);
    assert.equal(millionaireCalendarYear(OCT_2026, 358), 2056);
    assert.equal(millionaireCalendarYear(OCT_2026, 326), 2053);
    assert.equal(millionaireCalendarYear(OCT_2026, 437), 2063);
    assert.equal(millionaireCalendarYear({ year: 2026, month: 1 }, 358), 2055);
    const model = previewModel(DEFAULTS, { shareDate: OCT_2026 });
    assert.equal(model.imageHeadline, "I'm on track to be a millionaire by 2056");
    assert.equal(model.imageSub, "$800/mo at 7% · $1,016,559 in 30 years");
    assert.equal(model.title, "On track to be a millionaire by 2056 🫙 | Compound Jar");
    assert.match(model.shareText, /I'm on track to be a millionaire by 2056 🫙 \$800\/mo at an assumed 7% → \$1,016,559 in 30 years/);
    assert.match(model.shareText, /t=2026-10/);
    assert.match(model.description, /compound interest calculator/);
    assert.equal(model.imageFooter, "compoundjar.com · Projection at an assumed 7%/yr, not a promise");
    assert.equal(model.imageNote, "");
    const faster = previewModel({ p: 5000, m: 1000, r: 7, y: 30, f: 12 }, { shareDate: OCT_2026 });
    assert.equal(faster.imageHeadline, "I'm on track to be a millionaire by 2053");
    assert.equal(Math.round(faster.result.bal), 1_260_553);
  });

  it("uses the already-past headline when the jar starts at $1M", () => {
    const rich = { p: 2_000_000, m: 0, r: 7, y: 1, f: 12 };
    assert.equal(millionaireMonths(rich), 0);
    const model = previewModel(rich, { shareDate: OCT_2026 });
    assert.equal(model.imageHeadline, "My jar is already past $1M 🫙");
    assert.match(model.imageSub, /^\$0\/mo at 7% · /);
    assert.match(model.imageSub, / in 1 year$/);
    assert.equal(model.full, true);
  });

  it("shows the monthly needed when the total stays under $1M", () => {
    const plan = { p: 5000, m: 500, r: 7, y: 30, f: 12 };
    const model = previewModel(plan, { shareDate: OCT_2026 });
    assert.equal(Math.round(project(plan).bal), 650_568);
    assert.equal(monthlyNeeded(1_000_000, plan), 787);
    assert.equal(model.imageHeadline, "My jar hits $650,568. Here's my path to $1M");
    assert.equal(model.imageSub, "$500/mo at 7% · 30 years · $787/mo gets me to $1M");
    assert.equal(model.imageNote, "At this pace, $1M by 2062.");
    assert.match(model.shareText, /\$787\/mo at an assumed 7%/);
    assert.match(model.shareText, /At this pace, \$1M by 2062\./);
    assert.equal(model.imageFooter, "compoundjar.com · Projection at an assumed 7%/yr, not a promise");
    assert.equal(model.full, false);
    const stalled = previewModel({ p: 0, m: 0, r: 0, y: 30, f: 12 }, { shareDate: OCT_2026 });
    assert.equal(stalled.imageNote, "");
    assert.equal(stalled.shareText.includes("At this pace"), false);
    assert.match(stalled.imageSub, /\$2,778\/mo gets me to \$1M/);
  });

  it("keeps a huge total short and still names the assumed rate", () => {
    const huge = { p: 0, m: 100_000, r: 100, y: 80, f: 12 };
    const result = project(huge);
    assert.equal(Number.isFinite(result.bal), true);
    assert.ok(result.bal >= 1e15);
    const model = previewModel(huge, { shareDate: OCT_2026 });
    const total = formatMoney(result.bal);
    assert.match(model.imageHeadline, /^I'm on track to be a millionaire by /);
    assert.equal(model.imageSub, `$100,000/mo at 100% · ${total} in 80 years`);
    assert.ok(total.length < 16, total);
    assert.match(model.imageFooter, /assumed 100%\/yr, not a promise/);
    assert.match(model.shareText, /at an assumed 100%/);
  });
});

describe("share date", () => {
  it("reads t as a year-month and falls back without drifting", () => {
    assert.deepEqual(parseShareDate({ t: "2026-10" }), { year: 2026, month: 10 });
    assert.deepEqual(parseShareDate(new URLSearchParams("t=2026-10")), { year: 2026, month: 10 });
    assert.deepEqual(parseShareDate({ t: "2026" }), { year: 2026, month: null });
    assert.equal(parseShareDate({}), null);
    assert.equal(parseShareDate({ t: "nope" }), null);
    assert.equal(parseShareDate({ t: "1899" }), null);
    assert.equal(parseShareDate({ t: "2026-13" }), null);
    assert.deepEqual(readShareDate({ t: "2026-10" }, new Date("2030-06-01T00:00:00Z")), { year: 2026, month: 10 });
    assert.deepEqual(readShareDate({ t: "2026" }, new Date("2030-06-01T00:00:00Z")), { year: 2026, month: 1 });
    assert.deepEqual(readShareDate({}, new Date("2030-06-15T00:00:00Z")), { year: 2030, month: 6 });
    assert.equal(formatShareStamp({ year: 2026, month: 10 }), "2026-10");
  });

  it("stamps t on the share link and keeps it off the canonical URL", () => {
    const shared = planSearchParams(DEFAULTS, { src: "share", shareDate: "2026-10" });
    assert.equal(shared.get("src"), "share");
    assert.equal(shared.get("t"), "2026-10");
    assert.equal(planSearchParams(DEFAULTS).has("t"), false);
    const model = previewModel(DEFAULTS, { shareDate: OCT_2026 });
    const meta = buildPageMeta({
      model,
      plan: DEFAULTS,
      origin: "https://compoundjar.com",
      src: "share",
      shareDate: "2026-10",
      preview: true,
    });
    assert.equal(meta.canonical, "https://compoundjar.com/");
    assert.equal(meta.canonical.includes("t="), false);
    assert.equal(meta.title.includes("compound interest calculator") || meta.title.includes("Compound Interest Calculator"), true);
    assert.equal(meta.ogTitle, "On track to be a millionaire by 2056 🫙 | Compound Jar");
    assert.match(meta.ogUrl, /[?&]t=2026-10(?:&|$)/);
    assert.match(meta.image, /[?&]t=2026-10(?:&|$)/);
    assert.equal(meta.image.includes("src="), false);
    const bare = buildPageMeta({
      model,
      plan: DEFAULTS,
      origin: "https://compoundjar.com",
      shareDate: "2026-10",
    });
    assert.equal(bare.ogUrl, "https://compoundjar.com/");
    assert.equal(bare.ogTitle, "Compound Interest Calculator: How Long Until You Hit $1M?");
    assert.match(bare.description, /compound interest calculator/);
    assert.match(bare.image, /t=2026-10/);
    assert.equal(bare.canonical.includes("t="), false);
  });
});

describe("json-ld", () => {
  it("lists the confirmed profiles and skips ratings", () => {
    assert.deepEqual(sameAs, [
      "https://www.tiktok.com/@compound_jar",
      "https://www.instagram.com/compound_jar_/",
      "https://x.com/compound_jar",
    ]);
    const data = buildJsonLd({
      faqs: [{ q: "What is compound interest?", a: "Growth on growth." }],
      sameAs,
    });
    assert.deepEqual(data["@graph"][1].sameAs, sameAs);
    assert.equal(JSON.stringify(data).includes("aggregateRating"), false);
    assert.equal(data["@graph"][0].offers.price, "0");
    const empty = buildJsonLd({ faqs: [], sameAs: [] });
    assert.equal("sameAs" in empty["@graph"][1], false);
    assert.equal(empty["@graph"].some((node) => node["@type"] === "FAQPage"), false);
  });
});

describe("analytics urls", () => {
  it("rewrites share visits and AI referrers", () => {
    const plain = analyticsPageUrl("https://compoundjar.com/?p=1");
    assert.equal(plain, "https://compoundjar.com/");
    const shared = analyticsPageUrl("https://compoundjar.com/?p=1&src=share");
    assert.equal(shared, "https://compoundjar.com/src/share");
    const legacy = analyticsPageUrl("https://compoundjar.com/?s=1");
    assert.equal(legacy, "https://compoundjar.com/src/share");
    const tiktok = analyticsPageUrl("https://compoundjar.com/?src=tt-01");
    assert.equal(tiktok, "https://compoundjar.com/src/tt-01");
    const chatgpt = analyticsPageUrl("https://compoundjar.com/", "https://chatgpt.com/c/abc");
    assert.equal(chatgpt, "https://compoundjar.com/ai/chatgpt");
    const utm = analyticsPageUrl("https://compoundjar.com/?utm_source=perplexity");
    assert.equal(utm, "https://compoundjar.com/ai/perplexity");
    const both = analyticsPageUrl("https://compoundjar.com/?src=ig-bio", "https://claude.ai/");
    assert.equal(both, "https://compoundjar.com/src/ig-bio");
    const scenario = analyticsPageUrl(
      "https://compoundjar.com/500-a-month-to-1-million?p=0&m=500&r=7&y=37&f=12&src=ig-01",
    );
    assert.equal(scenario, "https://compoundjar.com/500-a-month-to-1-million/src/ig-01");
    assert.equal(scenario.includes("m="), false);
    const stamped = analyticsPageUrl(
      "https://compoundjar.com/?p=5000&m=800&r=7&y=30&f=12&src=share&t=2026",
    );
    assert.equal(stamped, "https://compoundjar.com/src/share");
    assert.equal(stamped.includes("t="), false);
    const event = analyticsEvent(
      { url: "https://compoundjar.com/?p=5000&m=800&r=7&y=30&f=12", data: { p: 5000, m: 800, r: 7, y: 30, f: 12, src: "share" } },
      "https://compoundjar.com/?p=5000&m=800&r=7&y=30&f=12&src=share",
    );
    assert.equal(event.url, "https://compoundjar.com/src/share");
    assert.deepEqual(event.data, { src: "share" });
    assert.deepEqual(analyticsPayload({ method: "copy", p: 1, m: 2, r: 3, y: 4, f: 12 }), { method: "copy" });
  });
});

describe("ics", () => {
  it("is a monthly calendar file with a plan link and folded lines", () => {
    const plan = { p: 1000, m: 200, r: 7, y: 30, f: 12 };
    const ics = buildIcs({
      plan,
      origin: "https://compoundjar.com",
      startDate: "20261101",
      now: new Date("2026-10-10T12:00:00Z"),
    });
    assert.equal(ics.includes("\n") && ics.replace(/\r\n/g, "").includes("\n"), false);
    for (const line of ics.split("\r\n")) {
      assert.ok(Buffer.byteLength(line) <= 75, line);
    }
    assert.match(ics, /RRULE:FREQ=MONTHLY/);
    assert.match(ics, /TRIGGER:PT9H/);
    assert.match(ics, /https:\/\/compoundjar\.com\/\?p=1000/);
    assert.equal(ics.includes("s=1"), false);
    assert.equal(ics.includes("t="), false);
    const parsed = parseICS(ics);
    const events = Object.values(parsed).filter((item) => item && item.type === "VEVENT");
    assert.equal(events.length, 1);
    assert.match(String(events[0].rrule), /FREQ=MONTHLY/);
    assert.match(events[0].description, /compoundjar\.com/);
  });
});

describe("sliders and sources", () => {
  it("hits the starting-amount breakpoints", () => {
    assert.equal(sliderValue("p", 0), 0);
    assert.equal(sliderValue("p", 300), 10_000);
    assert.equal(sliderValue("p", 650), 100_000);
    assert.equal(sliderValue("p", 850), 1_000_000);
    assert.equal(sliderValue("p", 950), 10_000_000);
    assert.equal(sliderValue("p", 1000), 50_000_000);
  });

  it("hits the monthly and return breakpoints", () => {
    assert.equal(sliderValue("m", 0), 0);
    assert.equal(sliderValue("m", 400), 1_000);
    assert.equal(sliderValue("m", 700), 5_000);
    assert.equal(sliderValue("m", 850), 20_000);
    assert.equal(sliderValue("m", 1000), 100_000);
    assert.equal(sliderValue("r", 0), 0);
    assert.equal(sliderValue("r", 750), 15);
    assert.equal(sliderValue("r", 880), 30);
    assert.equal(sliderValue("r", 1000), 100);
  });

  it("parks an off-step amount on the nearest slider point", () => {
    const nearest = sliderValue("p", sliderPos("p", 150));
    assert.ok(nearest === 100 || nearest === 200);
    assert.notEqual(nearest, 150);
    assert.equal(sliderPos("y", 80), 50);
    assert.equal(sliderValue("y", 50), 50);
  });

  it("shares with src and keeps canonical params free of it", () => {
    const params = planSearchParams(DEFAULTS, { src: "share", shareDate: "2026-10" });
    assert.equal(params.get("src"), "share");
    assert.equal(params.get("t"), "2026-10");
    assert.equal(params.has("s"), false);
    assert.equal(planSearchParams(DEFAULTS).has("src"), false);
    assert.equal(planSearchParams(DEFAULTS).has("t"), false);
    assert.equal(readSrc({ src: "tt-01" }), "tt-01");
    assert.equal(readSrc({ s: "1" }), "share");
    assert.equal(readSrc({ src: "https://evil.example" }), "");
    assert.equal(formatMoney(2_710_000_000), "$2.71B");
    assert.equal(totalFontSize("$252,111"), 56);
    assert.equal(totalFontSize("$123,456,789,012,345,678"), 26);
  });
});

describe("crawl files", () => {
  it("allows the named bots and publishes the indexnow key", () => {
    const robots = readFileSync("public/robots.txt", "utf8");
    for (const bot of ["Googlebot", "Bingbot", "OAI-SearchBot", "PerplexityBot", "ClaudeBot"]) {
      assert.match(robots, new RegExp(`User-agent: ${bot}\\nAllow: /`));
    }
    assert.equal(robots.includes("Disallow"), false);
    assert.match(robots, /Sitemap: https:\/\/compoundjar\.com\/sitemap\.xml/);
    assert.equal(readFileSync(`public/${indexnowKey}.txt`, "utf8").trim(), indexnowKey);
  });
});
