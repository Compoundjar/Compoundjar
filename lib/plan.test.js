import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { parseICS } from "node-ical";
import { analyticsPageUrl } from "./analytics.js";
import { indexnowKey } from "../content/indexnow.js";
import { sameAs } from "../content/social.js";
import { buildIcs } from "./ics.js";
import {
  DEFAULTS,
  answerSentence,
  formatCompact,
  formatFull,
  parsePlan,
  previewModel,
  project,
  yearsToTarget,
} from "./plan.js";
import { buildJsonLd } from "./seo.js";

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

  it("matches the default closed form and the $73,000 contribution", () => {
    const result = project(DEFAULTS);
    assert.equal(result.con, 73000);
    assert.ok(Math.abs(result.bal - closedForm(1000, 200, 7, 30)) < 0.02);
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
    assert.equal(formatCompact(1_200_000), "$1.2M");
    assert.equal(formatCompact(243_000), "$243K");
    assert.equal(formatCompact(999), "$999");
    assert.equal(formatCompact(10_000_000), "$10M");
    assert.equal(formatCompact(1_000_000), "$1M");
    assert.equal(formatCompact(1_500), "$1.5K");
    assert.equal(formatCompact(12_000), "$12K");
    assert.equal(formatCompact(999_500), "$1M");
  });
});

describe("parsePlan", () => {
  it("falls back to defaults and clamps out-of-range values", () => {
    assert.deepEqual(parsePlan({}), DEFAULTS);
    assert.deepEqual(parsePlan({ p: "-5", m: "nope", r: "50.129", y: "0", f: "7" }), {
      p: 0,
      m: 200,
      r: 50,
      y: 1,
      f: 12,
    });
    assert.equal(parsePlan({ p: "999999999" }).p, 10_000_000);
    assert.equal(parsePlan({ y: "100" }).y, 80);
  });

  it("ignores share and campaign params", () => {
    const plan = parsePlan({ p: "5000", s: "1", src: "share", utm_source: "chatgpt", extra: "1" });
    assert.equal(plan.p, 5000);
    assert.equal(plan.m, DEFAULTS.m);
    assert.equal("s" in plan, false);
  });
});

describe("preview copy", () => {
  it("writes the answer, title, and share text from the engine", () => {
    const model = previewModel(DEFAULTS);
    const answer = answerSentence(DEFAULTS);
    assert.match(answer, /you'd have about/);
    assert.match(answer, /\$73,000 of that is money you put in/);
    assert.equal(model.title, `${model.monthly}/mo becomes ${model.total} in 30 years`);
    assert.match(model.shareText, /\$200 a month/);
    assert.match(model.shareText, /Just keep compounding 🫙/);
    assert.equal(model.shareText.includes(formatFull(project(DEFAULTS).bal)), true);
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
    const shared = analyticsPageUrl("https://compoundjar.com/?p=1&s=1");
    assert.equal(shared, "https://compoundjar.com/shared?s=1");
    const chatgpt = analyticsPageUrl("https://compoundjar.com/", "https://chatgpt.com/c/abc");
    assert.equal(chatgpt, "https://compoundjar.com/ai/chatgpt");
    const utm = analyticsPageUrl("https://compoundjar.com/?utm_source=perplexity");
    assert.equal(utm, "https://compoundjar.com/ai/perplexity");
    const both = analyticsPageUrl("https://compoundjar.com/?s=1", "https://claude.ai/");
    assert.equal(both, "https://compoundjar.com/ai/claude?s=1");
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
    const parsed = parseICS(ics);
    const events = Object.values(parsed).filter((item) => item && item.type === "VEVENT");
    assert.equal(events.length, 1);
    assert.match(String(events[0].rrule), /FREQ=MONTHLY/);
    assert.match(events[0].description, /compoundjar\.com/);
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
