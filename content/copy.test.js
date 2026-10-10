import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  ageRows,
  contentUpdatedLabel,
  defaultBalanceText,
  defaultContributionText,
  defaultDailyGapText,
  defaultDailyTimeText,
  defaultGrowthText,
  faqPlain,
  faqs,
  formulaParagraphs,
  fourPercentText,
  haveSaveRows,
  howToSteps,
  inflationMillion,
  longRows,
  privacyAnswer,
  realMillionMonthly,
  ruleRows,
  saveRows,
  todayDollars,
  workedDefault,
} from "./home.js";
import { staticPages } from "./pages.js";
import { findScenario, scenarios } from "./scenarios.js";
import {
  DEFAULTS,
  answerSentence,
  exactDoublingYears,
  formatFull,
  formatMonths,
  monthlyNeeded,
  monthsToTarget,
  project,
  ruleOf72,
} from "../lib/plan.js";
import { HOME_DESCRIPTION, HOME_TITLE, WEBAPP_DESCRIPTION, buildJsonLd, buildScenarioJsonLd } from "../lib/seo.js";

const money = (n) => formatFull(n);
const time = (plan) => formatMonths(monthsToTarget({ f: 12, ...plan }, 1_000_000, 1200));
const needed = (years, rate, start = 0) => money(monthlyNeeded(1_000_000, { p: start, r: rate, y: years, f: 12 }));

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
    assert.equal(time(DEFAULTS), "29 years, 10 months");
  });

  it("uses the engine for every homepage mention of the starting example", () => {
    const worked = workedDefault();
    assert.equal(worked.lump, "$40,582");
    assert.equal(worked.deposits, "$975,977");
    assert.equal(worked.together, "$1,016,559");
    assert.match(formulaParagraphs.worked, /\$5,000 grows to \$40,582/);
    assert.match(formulaParagraphs.worked, /\$800 deposits grow to \$975,977/);
    assert.match(formulaParagraphs.daily, new RegExp(defaultDailyGapText.replace("$", "\\$")));
    assert.match(formulaParagraphs.daily, new RegExp(defaultDailyTimeText));
    assert.match(howToSteps[0].body, /\$5,000/);
    assert.match(howToSteps[1].body, /\$800/);
    assert.equal(fourPercentText, "$571,807");
    assert.match(todayDollars, /\$571,807/);
    assert.match(todayDollars, new RegExp(inflationMillion.replace("$", "\\$")));
    assert.match(todayDollars, new RegExp(realMillionMonthly.replace("$", "\\$")));
    assert.equal(realMillionMonthly, needed(30, 4, 5000));
    assert.equal(staticPages.methodology.paragraphs.includes(formulaParagraphs.worked), true);
    assert.match(answerSentence(DEFAULTS), /crossing \$1 million in about 29 years, 10 months/);
  });
});

describe("homepage figures", () => {
  it("matches the millionaire grids to the engine", () => {
    const starts = [0, 10_000, 25_000, 50_000, 100_000];
    const saves = [300, 500, 800, 1_000, 1_500];
    haveSaveRows.forEach((row, index) => {
      saves.forEach((monthly, saveIndex) => {
        assert.equal(row[saveIndex + 1], time({ p: starts[index], m: monthly, r: 7 }));
      });
    });
    const years = [20, 25, 30, 35, 40];
    saveRows.forEach((row, index) => {
      [5, 7, 10].forEach((rate, rateIndex) => {
        assert.equal(row[rateIndex + 1], needed(years[index], rate));
      });
    });
    const deposits = [300, 500, 800, 1_000, 1_500];
    longRows.forEach((row, index) => {
      [5, 7, 10].forEach((rate, rateIndex) => {
        assert.equal(row[rateIndex + 1], time({ p: 0, m: deposits[index], r: rate }));
      });
    });
    assert.equal(ageRows[0][2], `${needed(40, 7)}/mo`);
    assert.equal(ageRows[1][2], `${needed(30, 7)}/mo`);
    assert.equal(ruleOf72(7).toFixed(1), "10.3");
    assert.equal(exactDoublingYears(8).toFixed(1).slice(0, 3), "9.0");
    assert.equal(ruleRows[3].exact, "9.0 years");
  });

  it("publishes the ten marketing FAQs and no others", () => {
    assert.deepEqual(faqs.map((faq) => faq.q), [
      "Can I become a millionaire?",
      "How much do I need to save each month to become a millionaire?",
      "How long does it take to become a millionaire?",
      "Isn't it faster to go all in on a hot stock or coin?",
      "What is compound interest?",
      "What's the difference between simple and compound interest?",
      "Is $1 million in 30 years the same as $1 million today?",
      "Does this account for taxes and fees?",
      "Is this compound interest calculator accurate?",
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
    assert.equal(data["@graph"][0].description, WEBAPP_DESCRIPTION);
    assert.match(HOME_TITLE, /Compound Interest Calculator/);
    assert.match(HOME_DESCRIPTION, /compound interest calculator/);
    const privacy = faqs.at(-1).a;
    assert.equal(privacy, privacyAnswer);
    assert.equal(privacy.includes("CONFIRM WITH ENG"), false);
    assert.match(privacy, /don't save your inputs in a database/);
    assert.match(privacy, /Anonymous visit analytics/);
    assert.match(privacy, /request logs/);
  });
});

describe("scenario pages", () => {
  it("ships the five launch slugs", () => {
    assert.deepEqual(scenarios.map((scenario) => scenario.slug), [
      "how-long-to-become-a-millionaire",
      "how-much-to-save-a-month-to-be-a-millionaire",
      "can-i-become-a-millionaire",
      "become-a-millionaire-by-50",
      "500-a-month-to-1-million",
    ]);
    for (const slug of [
      "500-a-month-for-30-years",
      "how-long-to-reach-1-million",
      "1000-a-month-for-20-years",
      "daily-compound-interest-calculator",
      "cost-of-waiting-start-at-25-vs-35",
    ]) {
      assert.equal(findScenario(slug), null);
    }
  });

  it("matches every published table to the engine", () => {
    for (const scenario of scenarios) {
      assert.match(scenario.title, /Compound Interest Calculator/);
      assert.equal(scenario.links[0].href.includes("src="), false);
      assert.equal(scenario.links[1].href, "https://compoundjar.com/");
      const data = buildScenarioJsonLd({
        crumbs: [
          { name: "Home", item: "https://compoundjar.com/" },
          { name: scenario.crumb, item: `https://compoundjar.com/${scenario.slug}` },
        ],
        faqs: scenario.faqs.map((faq) => ({ q: faq.q, a: faqPlain(faq) })),
      });
      assert.equal(data["@graph"][0]["@type"], "BreadcrumbList");
      assert.equal(data["@graph"][1].mainEntity.length, scenario.faqs.length);
      for (const section of scenario.sections) {
        if (!section.table) continue;
        for (const cell of section.table.rows.flat()) {
          assert.equal(String(cell).includes("NaN"), false);
        }
      }
    }

    const howLong = findScenario("how-long-to-become-a-millionaire");
    assert.equal(howLong.sections[0].table.rows[3][2], time({ p: 0, m: 1000, r: 7 }));
    assert.equal(howLong.sections[1].table.rows[1][2], "6 months");
    assert.equal(
      monthsToTarget({ p: 5000, m: 800, r: 7, f: 12 }, 1_000_000, 1200)
        - monthsToTarget({ p: 5000, m: 800, r: 7, f: 365 }, 1_000_000, 1200),
      1,
    );
    assert.match(textOf(howLong), /about a month/);
    assert.match(textOf(howLong), /\$1,016,559/);
    assert.match(textOf(howLong), /\$411,987/);

    const howMuch = findScenario("how-much-to-save-a-month-to-be-a-millionaire");
    assert.equal(howMuch.plan.m, monthlyNeeded(1_000_000, { p: 0, r: 7, y: 30, f: 12 }));
    assert.equal(howMuch.sections[1].table.rows[1][1], needed(30, 7, 5000));
    assert.match(textOf(howMuch), /\$1,441/);

    const can = findScenario("can-i-become-a-millionaire");
    assert.equal(can.sections[0].table.rows[3][3], time({ p: 25000, m: 500, r: 7 }));
    assert.match(textOf(can), /\$1,188,181/);

    const by50 = findScenario("become-a-millionaire-by-50");
    assert.equal(by50.plan.m, monthlyNeeded(1_000_000, { p: 0, r: 7, y: 25, f: 12 }));
    assert.equal(by50.sections[0].table.rows[1][3], needed(25, 7));
    assert.match(by50.sections[3].paragraphs[0], /\$676,684/);
    assert.match(by50.sections[3].paragraphs[0], /\$1,200/);

    const five = findScenario("500-a-month-to-1-million");
    assert.deepEqual(five.plan, { p: 0, m: 500, r: 7, y: 37, f: 12 });
    assert.match(five.short, /\$1,048,272/);
    assert.match(five.short, /\$222,000/);
    assert.equal(five.sections[2].table.rows[2][1], "33 years");
    assert.match(textOf(five), /\$609,985/);
    assert.match(textOf(five), /\$390,015/);
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
    assert.match(staticPages.privacy.paragraphs[0], /request logs/);
  });
});
