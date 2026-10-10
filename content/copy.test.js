import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  depositColumnLabel,
  defaultBalanceText,
  defaultContributionText,
  defaultDailyGapText,
  defaultGrowthText,
  faqPlain,
  faqs,
  formulaParagraphs,
  fourPercentText,
  frequencyNote,
  frequencyRows,
  howToSteps,
  lumpFrequency,
  lumpNote,
  lumpRows,
  monthlyRows,
  todayDollars,
  waitingGapText,
  waitingNote,
  waitingRows,
  catchUpText,
  workedDefault,
  contentUpdatedLabel,
} from "./home.js";
import { staticPages } from "./pages.js";
import { findScenario, scenarios } from "./scenarios.js";
import {
  DEFAULTS,
  answerSentence,
  exactDoublingYears,
  formatFull,
  formatMonths,
  monthsToTarget,
  paymentNeeded,
  project,
  projectPaused,
  ruleOf72,
} from "../lib/plan.js";
import { buildJsonLd, buildScenarioJsonLd } from "../lib/seo.js";

const money = (n) => formatFull(n);

function textOf(scenario) {
  return [
    scenario.description,
    scenario.short,
    ...scenario.intro,
    ...scenario.sections.flatMap((section) => [
      section.heading,
      ...(section.paragraphs || []),
      section.after || "",
      ...(section.table ? section.table.rows.flat() : []),
    ]),
    ...scenario.faqs.map((faq) => faq.a),
  ].join("\n");
}

describe("default plan", () => {
  it("is $5,000 plus $800 a month, and the engine total is $1,016,559", () => {
    assert.deepEqual(DEFAULTS, { p: 5000, m: 800, r: 7, y: 30, f: 12 });
    const result = project(DEFAULTS);
    assert.equal(money(result.bal), "$1,016,559");
    assert.equal(defaultBalanceText, "$1,016,559");
    assert.equal(defaultContributionText, "$293,000");
    assert.equal(defaultGrowthText, "$723,559");
    assert.equal(result.cross, 18);
  });

  it("uses the engine for every homepage mention of the default plan", () => {
    const worked = workedDefault();
    assert.equal(worked.lump, "$40,582");
    assert.equal(worked.deposits, "$975,977");
    assert.equal(worked.together, "$1,016,559");
    assert.match(formulaParagraphs.worked, /\$5,000 grows to \$40,582/);
    assert.match(formulaParagraphs.worked, /\$800 deposits grow to \$975,977/);
    assert.match(formulaParagraphs.worked, /\$1,016,559/);
    assert.match(howToSteps[0].body, /Default: \$5,000/);
    assert.match(howToSteps[1].body, /Default: \$800/);
    assert.match(howToSteps[2].body, /Default: 7%/);
    assert.match(howToSteps[3].body, /Default: 30/);
    assert.equal(depositColumnLabel, "$5,000 + $800/month (default plan)");
    const four = project({ ...DEFAULTS, r: 4 });
    assert.equal(fourPercentText, money(four.bal));
    assert.equal(fourPercentText, "$571,807");
    assert.match(todayDollars, /\$571,807/);
    assert.match(todayDollars, /\$1,016,559/);
    for (const row of frequencyRows) {
      assert.equal(row.deposits, money(project({ ...DEFAULTS, f: row.f }).bal));
      assert.equal(row.lump, money(project({ p: 10000, m: 0, r: 7, y: 30, f: row.f }).bal));
    }
    assert.equal(defaultDailyGapText, "$4,058");
    assert.match(frequencyNote, /\$4,058/);
    assert.equal(formulaParagraphs.worked.includes("252,111"), false);
    assert.equal(todayDollars.includes("142,123"), false);
    assert.equal(staticPages.methodology.paragraphs.includes(formulaParagraphs.worked), true);
  });
});

describe("homepage figures", () => {
  it("matches lump, monthly, waiting, and frequency tables", () => {
    for (const years of [10, 20, 30]) {
      const row = lumpRows.find((item) => item.label === String(years));
      const result = project({ p: 10000, m: 0, r: 7, y: years, f: 12 });
      assert.equal(row.balance, money(result.bal));
      assert.equal(row.growth, money(result.int));
    }
    const lump20 = project({ p: 10000, m: 0, r: 7, y: 20, f: 12 });
    const lump30 = project({ p: 10000, m: 0, r: 7, y: 30, f: 12 });
    assert.match(lumpNote, new RegExp(money(lump30.bal - lump20.bal).replace("$", "\\$")));
    assert.match(lumpNote, new RegExp(money(lump20.int).replace("$", "\\$")));

    for (const monthly of [200, 500, 1000]) {
      const row = monthlyRows.find((item) => item.label === money(monthly));
      const result = project({ p: 0, m: monthly, r: 7, y: 30, f: 12 });
      assert.equal(row.contributed, money(result.con));
      assert.equal(row.balance, money(result.bal));
      assert.equal(row.growth, money(result.int));
    }

    const early = project({ p: 0, m: 300, r: 7, y: 40, f: 12 });
    const late = project({ p: 0, m: 300, r: 7, y: 30, f: 12 });
    assert.equal(waitingRows[0].balance, money(early.bal));
    assert.equal(waitingRows[1].balance, money(late.bal));
    assert.equal(waitingGapText, money(early.bal - late.bal));
    assert.equal(catchUpText, money(paymentNeeded(early.bal, { p: 0, r: 7, y: 30 })));
    assert.match(waitingNote, /\$645 a month/);
    assert.equal(lumpFrequency.yearly, money(project({ p: 10000, m: 0, r: 7, y: 30, f: 1 }).bal));
    assert.equal(lumpFrequency.dailyAdds, "$480");
  });

  it("publishes the ten marketing FAQs and no others", () => {
    assert.deepEqual(faqs.map((faq) => faq.q), [
      "What is compound interest?",
      "What's the difference between simple and compound interest?",
      "How often is interest compounded?",
      "Does monthly compounding beat annual, and by how much?",
      "How much will $500 a month grow to?",
      "How long does it take to double my money?",
      "How long will it take to reach $1 million?",
      "Does this account for inflation and taxes?",
      "Is this calculator accurate?",
      "Is it free, and do you store my data?",
    ]);
    const data = buildJsonLd({
      faqs: faqs.map((faq) => ({ q: faq.q, a: faqPlain(faq) })),
      sameAs: [],
    });
    const node = data["@graph"].find((item) => item["@type"] === "FAQPage");
    assert.equal(node.mainEntity.length, 10);
    assert.deepEqual(node.mainEntity.map((item) => item.name), faqs.map((faq) => faq.q));
    assert.deepEqual(
      node.mainEntity.map((item) => item.acceptedAnswer.text),
      faqs.map((faq) => faqPlain(faq)),
    );
    const privacy = faqs.at(-1).a;
    assert.equal(privacy.includes("CONFIRM WITH ENG"), false);
    assert.match(privacy, /don't save your inputs in a database/);
    assert.match(privacy, /Anonymous visit analytics/);
    assert.match(privacy, /request logs/);
    const million = faqs.find((faq) => faq.q.startsWith("How long will it take"));
    assert.match(million.a, /36 years, 5 months/);
    assert.match(million.a, /27 years, 7 months/);
    assert.match(million.a, /\$820 a month/);
    assert.match(million.a, /29 years, 10 months/);
    assert.equal(
      formatMonths(monthsToTarget(DEFAULTS, 1_000_000)),
      "29 years, 10 months",
    );
    assert.match(answerSentence(DEFAULTS), /makes you a millionaire, at an assumed 7%/);
    const nominal = project(DEFAULTS).bal;
    assert.equal(fourPercentText, formatFull(project({ ...DEFAULTS, r: 4 }).bal));
    assert.notEqual(formatFull(nominal / 1.03 ** 30), fourPercentText);
    assert.equal(ruleOf72(7).toFixed(1), "10.3");
    assert.equal(exactDoublingYears(8).toFixed(1).slice(0, 3), "9.0");
  });
});

describe("scenario pages", () => {
  it("ships the five launch slugs", () => {
    assert.deepEqual(scenarios.map((scenario) => scenario.slug), [
      "500-a-month-for-30-years",
      "how-long-to-reach-1-million",
      "1000-a-month-for-20-years",
      "daily-compound-interest-calculator",
      "cost-of-waiting-start-at-25-vs-35",
    ]);
  });

  it("matches every published table to the engine", () => {
    const five = findScenario("500-a-month-for-30-years");
    for (const row of five.sections[0].table.rows) {
      const result = project({ p: 0, m: 500, r: 7, y: Number(row[0]), f: 12 });
      assert.deepEqual(row.slice(1), [money(result.con), money(result.int), money(result.bal)]);
    }
    for (const row of five.sections[1].table.rows) {
      const rate = Number.parseInt(row[0], 10);
      const result = project({ p: 0, m: 500, r: rate, y: 30, f: 12 });
      assert.equal(row[1], money(result.bal));
      assert.equal(row[2], money(result.int));
      assert.equal(row[3], formatMonths(monthsToTarget({ p: 0, m: 500, r: rate, f: 12 }, 1_000_000)));
    }
    assert.match(five.description, /\$609,985/);
    assert.match(textOf(five), /\$691,150/);

    const million = findScenario("how-long-to-reach-1-million");
    for (const row of million.sections[0].table.rows) {
      const monthly = Number(row[0].replace(/[$,]/g, ""));
      for (const [index, rate] of [5, 7, 10].entries()) {
        assert.equal(row[index + 1], formatMonths(monthsToTarget({ p: 0, m: monthly, r: rate, f: 12 }, 1_000_000)));
      }
    }
    for (const row of million.sections[1].table.rows) {
      const years = Number(row[0]);
      for (const [index, rate] of [5, 7, 10].entries()) {
        assert.equal(row[index + 1], money(paymentNeeded(1_000_000, { p: 0, r: rate, y: years })));
      }
    }
    for (const row of million.sections[2].table.rows) {
      const result = project({ p: 0, m: 1000, r: 7, y: Number(row[0]), f: 12 });
      assert.deepEqual(row.slice(1), [money(result.con), money(result.int), money(result.bal)]);
    }
    assert.match(textOf(million), /\$411,987/);
    assert.equal(money(1_000_000 / 1.03 ** 30), "$411,987");

    const twenty = findScenario("1000-a-month-for-20-years");
    for (const row of twenty.sections[0].table.rows) {
      const result = project({ p: 0, m: 1000, r: 7, y: Number(row[0]), f: 12 });
      assert.deepEqual(row.slice(1), [money(result.con), money(result.int), money(result.bal)]);
    }
    for (const row of twenty.sections[1].table.rows) {
      const rate = Number.parseInt(row[0], 10);
      const result = project({ p: 0, m: 1000, r: rate, y: 20, f: 12 });
      assert.equal(row[1], money(result.bal));
      assert.equal(row[2], money(result.int));
    }
    assert.match(twenty.description, /\$520,927/);

    const daily = findScenario("daily-compound-interest-calculator");
    assert.deepEqual(daily.plan, { p: 10000, m: 200, r: 7, y: 30, f: 365 });
    for (const row of daily.sections[0].table.rows) {
      const year = Number(row[0]);
      const base = { p: 10000, m: 200, r: 7, y: year };
      assert.equal(row[1], money(project({ ...base, f: 12 }).con));
      assert.equal(row[2], money(project({ ...base, f: 1 }).bal));
      assert.equal(row[3], money(project({ ...base, f: 12 }).bal));
      assert.equal(row[4], money(project({ ...base, f: 365 }).bal));
    }
    for (const row of daily.sections[1].table.rows) {
      const rate = Number.parseInt(row[0], 10);
      const monthly = project({ p: 10000, m: 200, r: rate, y: 30, f: 12 });
      const dailyBal = project({ p: 10000, m: 200, r: rate, y: 30, f: 365 });
      assert.equal(row[1], money(monthly.bal));
      assert.equal(row[2], money(dailyBal.bal));
      assert.equal(row[3], money(dailyBal.bal - monthly.bal));
    }
    assert.deepEqual(daily.sections[2].table.rows.map((row) => row[1]), ["7.00%", "7.19%", "7.23%", "7.25%"]);
    assert.equal(daily.sections[3].table.rows[2][1], formatMonths(monthsToTarget({ p: 10000, m: 200, r: 7, f: 365 }, 1_000_000)));
    assert.match(textOf(daily), /\$343,826/);

    const waiting = findScenario("cost-of-waiting-start-at-25-vs-35");
    assert.deepEqual(waiting.plan, { p: 0, m: 300, r: 7, y: 40, f: 12 });
    for (const row of waiting.sections[0].table.rows) {
      const age = Number(row[0]);
      const early = project({ p: 0, m: 300, r: 7, y: age - 25, f: 12 }).bal;
      const lateYears = age - 35;
      const late = lateYears <= 0 ? 0 : project({ p: 0, m: 300, r: 7, y: lateYears, f: 12 }).bal;
      assert.equal(row[1], money(early));
      assert.equal(row[2], money(late));
      assert.equal(row[3], money(early - late));
    }
    const paused = projectPaused({ p: 0, m: 300, r: 7, f: 12, depositYears: 10, idleYears: 30 });
    assert.match(waiting.sections[1].paragraphs[0], new RegExp(money(paused.bal).replace("$", "\\$")));
    for (const row of waiting.sections[2].table.rows) {
      const rate = Number.parseInt(row[0], 10);
      const early = project({ p: 0, m: 300, r: rate, y: 40, f: 12 });
      const late = project({ p: 0, m: 300, r: rate, y: 30, f: 12 });
      assert.equal(row[1], money(early.bal));
      assert.equal(row[2], money(late.bal));
      assert.equal(row[3], money(early.bal - late.bal));
    }
    assert.match(textOf(waiting), /\$645 a month/);
    assert.match(waiting.description, /\$421,453/);

    for (const scenario of scenarios) {
      const data = buildScenarioJsonLd({
        crumbs: [
          { name: "Home", item: "https://compoundjar.com/" },
          { name: scenario.crumb, item: `https://compoundjar.com/${scenario.slug}` },
        ],
        faqs: scenario.faqs.map((faq) => ({ q: faq.q, a: faqPlain(faq) })),
      });
      assert.equal(data["@graph"][0]["@type"], "BreadcrumbList");
      assert.equal(data["@graph"][1].mainEntity.length, scenario.faqs.length);
      assert.equal(scenario.links[0].href.includes("src="), false);
    }
  });
});

describe("privacy and dates", () => {
  it("does not log or store plan inputs in app routes", () => {
    const files = [
      "app/page.js",
      "app/og/route.js",
      "app/reminder.ics/route.js",
      "app/[slug]/page.js",
      "lib/plan.js",
      "lib/analytics.js",
    ];
    for (const file of files) {
      const source = readFileSync(file, "utf8");
      assert.equal(source.includes("console."), false, file);
      assert.equal(/writeFile|appendFile|createWriteStream|prisma|mongodb/.test(source), false, file);
    }
    assert.equal(contentUpdatedLabel, "October 10, 2026");
    assert.equal(staticPages.privacy.paragraphs[0].includes("CONFIRM WITH ENG"), false);
    assert.match(staticPages.privacy.paragraphs[0], /Anonymous visit analytics/);
  });
});
