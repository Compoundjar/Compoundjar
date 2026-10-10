/**
 * Curated scenario pages. Figures come from lib/plan.js.
 * These are not generated from share links.
 */
import {
  effectiveAnnualRate,
  formatFull,
  formatMonths,
  monthsToTarget,
  paymentNeeded,
  project,
  projectPaused,
} from "../lib/plan.js";

const money = (n) => formatFull(n);
const timeTo = (plan, target = 1_000_000) => formatMonths(monthsToTarget(plan, target));
const pmt = (target, r, y, p = 0) => money(paymentNeeded(target, { p, r, y }));

function at({ p = 0, m, r = 7, y, f = 12 }) {
  return project({ p, m, r, y, f });
}

function sampleRows(plan, years) {
  return years.map((year) => {
    const result = at({ ...plan, y: year });
    return [String(year), money(result.con), money(result.int), money(result.bal)];
  });
}

const plan500 = { p: 0, m: 500, r: 7, f: 12 };
const plan1000 = { p: 0, m: 1000, r: 7, f: 12 };
const plan300 = { p: 0, m: 300, r: 7, f: 12 };
const dailyBase = { p: 10000, m: 200, r: 7 };

const fiveAt30 = at({ ...plan500, y: 30 });
const fiveAt20 = at({ ...plan500, y: 20 });
const withHeadStart = at({ p: 10000, m: 500, r: 7, y: 30, f: 12 });
const thousand30 = at({ ...plan1000, y: 30 });
const thousand20 = at({ ...plan1000, y: 20 });
const thousand15 = at({ ...plan1000, y: 15 });
const thousand25 = at({ ...plan1000, y: 25 });
const five20 = at({ ...plan500, y: 20 });
const start25 = at({ ...plan300, y: 40 });
const start35 = at({ ...plan300, y: 30 });
const start30 = at({ ...plan300, y: 35 });
const sprint = projectPaused({ p: 0, m: 300, r: 7, f: 12, depositYears: 10, idleYears: 30 });
const twenty300 = at({ ...plan300, y: 20 });
const catchUp = paymentNeeded(start25.bal, { p: 0, r: 7, y: 30 });
const inflationDollars = 1_000_000 / 1.03 ** 30;

function returnRows(plan, years) {
  return [5, 7, 10].map((rate) => {
    const result = at({ ...plan, r: rate, y: years });
    return [
      `${rate}%`,
      money(result.bal),
      money(result.int),
      timeTo({ ...plan, r: rate }),
    ];
  });
}

const millionDeposits = [200, 500, 1000, 1500, 2000];
const millionRates = [5, 7, 10];
const millionYears = [20, 25, 30, 35, 40];

const ageRows = [30, 35, 40, 45, 50, 55, 60, 65].map((age) => {
  const earlyYears = age - 25;
  const lateYears = age - 35;
  const early = at({ ...plan300, y: earlyYears }).bal;
  const late = lateYears <= 0 ? 0 : at({ ...plan300, y: lateYears }).bal;
  return [String(age), money(early), money(late), money(early - late)];
});

const waitRateRows = [5, 7, 10].map((rate) => {
  const early = at({ p: 0, m: 300, r: rate, y: 40, f: 12 });
  const late = at({ p: 0, m: 300, r: rate, y: 30, f: 12 });
  return [`${rate}%`, money(early.bal), money(late.bal), money(early.bal - late.bal)];
});

const dailyYears = [5, 10, 15, 20, 25, 30].map((year) => {
  const contributed = at({ ...dailyBase, y: year, f: 12 }).con;
  return [
    String(year),
    money(contributed),
    money(at({ ...dailyBase, y: year, f: 1 }).bal),
    money(at({ ...dailyBase, y: year, f: 12 }).bal),
    money(at({ ...dailyBase, y: year, f: 365 }).bal),
  ];
});

const dailyRateRows = [5, 7, 10].map((rate) => {
  const monthly = at({ ...dailyBase, r: rate, y: 30, f: 12 });
  const daily = at({ ...dailyBase, r: rate, y: 30, f: 365 });
  return [`${rate}%`, money(monthly.bal), money(daily.bal), money(daily.bal - monthly.bal)];
});

const apyLabels = [
  [1, "Yearly"],
  [4, "Quarterly"],
  [12, "Monthly"],
  [365, "Daily"],
];

const bumped = at({ p: 10000, m: 200, r: 7.25, y: 30, f: 12 });
const dailyEnd = at({ ...dailyBase, y: 30, f: 365 });
const monthlyEnd = at({ ...dailyBase, y: 30, f: 12 });
const yearlyEnd = at({ ...dailyBase, y: 30, f: 1 });
const multiple = fiveAt30.bal / fiveAt30.con;
const multipleText = `${(Math.round(multiple * 10) / 10).toFixed(1)}×`;
const catchMultiple = `${(Math.round((catchUp / 300) * 10) / 10).toFixed(1)}×`;

export const scenarios = [
  {
    slug: "500-a-month-for-30-years",
    title: "$500 a Month for 30 Years: What It Grows To | Compound Jar",
    description:
      "Investing $500 a month for 30 years at 7% grows to about $609,985. See the year-by-year table, 5/7/10% returns and time to $1M.",
    h1: "What $500 a month becomes in 30 years",
    crumb: "What $500 a month becomes in 30 years",
    subhead: "$500 a month, compounded monthly, starting from $0.",
    plan: { p: 0, m: 500, r: 7, y: 30, f: 12 },
    short: `$500 a month for 30 years at a 7% average yearly return grows to about ${money(fiveAt30.bal)}. You put in ${money(fiveAt30.con)}, and about ${money(fiveAt30.int)} is growth.`,
    intro: [
      `$500 a month is about $16 a day. That's a common target once a first real paycheck or a raise comes in. Here's how that jar fills up over three decades. Notice how slow the first decade feels and how fast the last one moves. Growth overtakes your deposits in year ${fiveAt30.cross}.`,
    ],
    sections: [
      {
        heading: "Year by year (7%, compounded monthly, starting from $0)",
        table: {
          headers: ["Year", "You've put in", "Growth", "Balance"],
          rows: sampleRows(plan500, [5, 10, 15, 20, 25, 30]),
          bold: 3,
        },
        after: `The final 10 years add ${money(fiveAt30.bal - fiveAt20.bal)}, more than the first 20 years combined (${money(fiveAt20.bal)}).`,
      },
      {
        heading: "What if the return is 5%, 7% or 10%?",
        table: {
          headers: ["Yearly return", "Balance after 30 years", "Growth", "Time to $1M"],
          rows: returnRows(plan500, 30),
        },
      },
      {
        heading: "How long until $500 a month reaches $1 million?",
        paragraphs: [
          `At 7%, about ${timeTo(plan500)}. At 10%, about ${timeTo({ ...plan500, r: 10 })}. To reach $1M in exactly 30 years at 7%, you'd need about ${pmt(1_000_000, 7, 30)} a month.`,
        ],
      },
    ],
    faqs: [
      {
        q: "How much is $500 a month for 30 years with no growth?",
        a: `${money(fiveAt30.con)}. At 7%, compounding turns that into about ${money(fiveAt30.bal)}, roughly ${multipleText} what you put in.`,
      },
      {
        q: "What if I already have $10,000 saved?",
        a: `Starting with $10,000 plus $500 a month at 7% for 30 years gives about ${money(withHeadStart.bal)}. That's ${money(withHeadStart.bal - fiveAt30.bal)} more than starting from zero, because the $10,000 compounds for all 30 years.`,
      },
      {
        q: "Is 7% a realistic return?",
        a: "Nobody can promise one. From 1928 to 2025, the S&P 500 returned about 10.0% a year compounded before inflation, and about 6.8% after inflation (our calculations from [NYU Stern data](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html) and [BLS CPI via FRED](https://fred.stlouisfed.org/series/CPIAUCNS)). It lost money in 26 of those 98 years. Try 5% too, to see a more cautious case.",
      },
    ],
    links: [
      { href: "/?p=0&m=500&r=7&y=30&f=12", label: "Open this plan in the calculator" },
      { href: "/", label: "compound interest calculator" },
    ],
    linkLead: "Or go back to the full",
  },
  {
    slug: "how-long-to-reach-1-million",
    title: "How Long to Reach $1 Million? Time Table | Compound Jar",
    description:
      "How long to reach $1 million investing $200–$2,000 a month at 5%, 7% or 10%. At 7%, $1,000 a month gets there in about 27 years, 7 months.",
    h1: "How long does it take to reach $1 million?",
    crumb: "How long does it take to reach $1 million?",
    subhead: "Time and the monthly deposit, starting from $0.",
    plan: { p: 0, m: 1000, r: 7, y: 30, f: 12 },
    short: `Starting from $0 at a 7% average yearly return, it takes about ${timeTo(plan1000)} at $1,000 a month, ${timeTo(plan500)} at $500 a month, and ${timeTo({ p: 0, m: 200, r: 7, f: 12 })} at $200 a month.`,
    intro: [
      "A million dollars sounds like a finish line for someone else. It's really just two dials: how much you add each month and how long you let it sit. Find your row below.",
    ],
    sections: [
      {
        heading: "Time to $1 million, starting from $0",
        table: {
          headers: ["Monthly deposit", "at 5%", "at 7%", "at 10%"],
          rows: millionDeposits.map((monthly) => [
            money(monthly),
            ...millionRates.map((rate) => timeTo({ p: 0, m: monthly, r: rate, f: 12 })),
          ]),
        },
      },
      {
        heading: "Monthly deposit needed to reach $1 million (from $0)",
        table: {
          headers: ["Years", "at 5%", "at 7%", "at 10%"],
          rows: millionYears.map((years) => [
            String(years),
            ...millionRates.map((rate) => pmt(1_000_000, rate, years)),
          ]),
        },
      },
      {
        heading: "Year by year: $1,000 a month at 7%",
        table: {
          headers: ["Year", "You've put in", "Growth", "Balance"],
          rows: sampleRows(plan1000, [5, 10, 15, 20, 25, 30]),
          bold: 3,
        },
        after: `The jar crosses $1 million between years 27 and 28. The final five years in this table add ${money(thousand30.bal - thousand25.bal)}, more than the first 15 years combined (${money(thousand15.bal)}).`,
      },
      {
        heading: "Rate comparison: $1,000 a month for 30 years",
        table: {
          headers: ["Yearly return", "Balance after 30 years", "Growth", "Time to $1M"],
          rows: returnRows(plan1000, 30),
        },
      },
    ],
    faqs: [
      {
        q: "Does a head start help?",
        a: `A lot. With $10,000 already invested plus $500 a month at 7%, you reach $1M in about ${timeTo({ p: 10000, m: 500, r: 7, f: 12 })}, versus ${timeTo(plan500)} from $0.`,
      },
      {
        q: "Is $1 million in 30 years worth $1 million today?",
        a: `No. At the long-run inflation rate of about 3.0% a year (CPI, 1927–2025, [FRED](https://fred.stlouisfed.org/series/CPIAUCNS)), $1M in 30 years would buy roughly what ${money(inflationDollars)} buys today. To plan in today's dollars, lower the return by your inflation guess.`,
      },
      {
        q: "Can I reach $1 million with just $200 a month?",
        a: `At 7%, yes, eventually: it takes about ${timeTo({ p: 0, m: 200, r: 7, f: 12 })}. Raising the deposit, even gradually, shortens that a lot. At $500 a month it's about ${timeTo(plan500)}.`,
      },
    ],
    links: [
      { href: "/?p=0&m=1000&r=7&y=30&f=12", label: "Test your own path to $1M" },
      { href: "/", label: "compound interest calculator" },
    ],
    linkLead: "Or go back to the full",
  },
  {
    slug: "1000-a-month-for-20-years",
    title: "$1,000 a Month for 20 Years: What It Grows To | Compound Jar",
    description:
      "$1,000 a month for 20 years at 7% grows to about $520,927 from $240,000 in deposits. See the 5-year table, 5/7/10% returns, time to $1M.",
    h1: "What $1,000 a month becomes in 20 years",
    crumb: "What $1,000 a month becomes in 20 years",
    subhead: "$1,000 a month, compounded monthly, starting from $0.",
    plan: { p: 0, m: 1000, r: 7, y: 20, f: 12 },
    short: `Investing $1,000 a month for 20 years at a 7% average yearly return grows to about ${money(thousand20.bal)}. You put in ${money(thousand20.con)}, and about ${money(thousand20.int)} is growth.`,
    intro: [
      "Twenty years is a realistic window if you're starting in your 30s, or if you want a big number by your 50s. $1,000 a month is ambitious, and it moves fast.",
    ],
    sections: [
      {
        heading: "Year by year (7%, compounded monthly, starting from $0)",
        table: {
          headers: ["Year", "You've put in", "Growth", "Balance"],
          rows: sampleRows(plan1000, [5, 10, 15, 20]),
          bold: 3,
        },
      },
      {
        heading: "What if the return is 5%, 7% or 10%?",
        table: {
          headers: ["Yearly return", "Balance after 20 years", "Growth", "Time to $1M"],
          rows: returnRows(plan1000, 20),
        },
      },
      {
        heading: "When does $1,000 a month reach $1 million?",
        paragraphs: [
          `At 7%, about ${timeTo(plan1000)}, so keep going about 7½ years past this page's 20. At 10%, it's about ${timeTo({ ...plan1000, r: 10 })}. To hit $1M in exactly 20 years at 7%, you'd need about ${pmt(1_000_000, 7, 20)} a month.`,
        ],
      },
    ],
    faqs: [
      {
        q: "What about $1,000 a month for 30 years?",
        a: `At 7%, about ${money(thousand30.bal)}. The extra 10 years add ${money(thousand30.bal - thousand20.bal)}, with only ${money(thousand30.con - thousand20.con)} more in deposits.`,
      },
      {
        q: "What if I can only do $500 a month for 20 years?",
        a: `About ${money(five20.bal)} at 7%. That's exactly half, because each deposit grows the same way no matter its size.`,
      },
      {
        q: "Should I use 7% or 10%?",
        a: "That's your call, and it's worth testing both. 10% is close to the S&P 500's 1928–2025 compounded average before inflation (about 10.0%). 7% is closer to its after-inflation figure (about 6.8%). Both are our calculations from [NYU Stern](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html) and [FRED CPI](https://fred.stlouisfed.org/series/CPIAUCNS) data. Neither is guaranteed.",
      },
    ],
    links: [
      { href: "/?p=0&m=1000&r=7&y=20&f=12", label: "Open this plan in the calculator" },
      { href: "/", label: "compound interest calculator" },
    ],
    linkLead: "Or go back to the full",
  },
  {
    slug: "daily-compound-interest-calculator",
    title: "Daily Compound Interest Calculator | Compound Jar",
    description:
      "Compare daily, monthly and yearly compounding side by side. See how much daily compounding really adds, with year-by-year tables and APY math.",
    h1: "Daily compound interest calculator",
    crumb: "Daily compound interest calculator",
    subhead: "Daily compounding, with the same monthly deposit.",
    plan: { p: 10000, m: 200, r: 7, y: 30, f: 365 },
    short: `Daily compounding beats monthly, but only by a little. With $10,000 to start plus $200 a month at 7% for 30 years, daily compounding ends at ${money(dailyEnd.bal)}, monthly at ${money(monthlyEnd.bal)} and yearly at ${money(yearlyEnd.bal)}. Daily over monthly is a difference of ${money(dailyEnd.bal - monthlyEnd.bal)} (${(((dailyEnd.bal - monthlyEnd.bal) / monthlyEnd.bal) * 100).toFixed(1)}%).`,
    intro: [
      "If your savings account compounds daily, you might wonder whether that matters. Here's the honest answer: frequency matters a little, while the rate, the deposit and time matter a lot. Pick Daily under Advanced in the calculator to see it live.",
    ],
    sections: [
      {
        heading: "Year by year: $10,000 + $200/month at 7%",
        table: {
          headers: ["Year", "You've put in", "Yearly", "Monthly", "Daily"],
          rows: dailyYears,
        },
      },
      {
        heading: "Rate comparison: daily vs monthly after 30 years",
        table: {
          headers: ["Yearly rate", "Monthly compounding", "Daily compounding", "Daily adds"],
          rows: dailyRateRows,
        },
      },
      {
        heading: "What compounding frequency does to the yearly rate (APY)",
        table: {
          headers: ["7% nominal, compounded…", "Effective yearly rate (APY)"],
          rows: apyLabels.map(([periods, label]) => [
            label,
            `${(effectiveAnnualRate(7, periods) * 100).toFixed(2)}%`,
          ]),
        },
        after:
          "That's why banks quote APY: it already includes compounding. If your account lists an APY, enter that APY with Yearly compounding to match it most closely.",
      },
      {
        heading: "Time to $1 million ($10,000 + $200/month at 7%)",
        table: {
          headers: ["Compounding", "Time to $1M"],
          rows: [
            ["Yearly", timeTo({ ...dailyBase, f: 1 })],
            ["Monthly", timeTo({ ...dailyBase, f: 12 })],
            ["Daily", timeTo({ ...dailyBase, f: 365 })],
          ],
        },
        after: `Daily compounding saves a few months over a span of decades. Adding $100 a month saves years: at $300 a month with monthly compounding, it's about ${timeTo(plan300)}.`,
      },
    ],
    faqs: [
      {
        q: "What is the formula for daily compound interest?",
        a: "A = P(1 + r/365)^(365t). With monthly deposits, Compound Jar converts the daily rate into an equivalent monthly growth factor, (1 + r/365)^(365/12), and adds each deposit at the end of the month.",
      },
      {
        q: "Is daily compounding worth switching accounts for?",
        a: `Usually the rate matters more than the frequency. On this example, going from 7% to 7.25% with monthly compounding gives ${money(bumped.bal)}. That beats 7% compounded daily (${money(dailyEnd.bal)}).`,
      },
      {
        q: "Do stocks compound daily?",
        a: "Not the way a savings account does. Stock prices move every trading day, and dividends are paid on their own schedule (often quarterly). An average yearly return already bakes in all that compounding, so monthly is a reasonable default for investing what-ifs.",
      },
    ],
    links: [
      { href: "/?p=10000&m=200&r=7&y=30&f=12", label: "Compare compounding in the calculator" },
      { href: "/", label: "compound interest calculator" },
    ],
    linkLead: "Or go back to the full",
  },
  {
    slug: "cost-of-waiting-start-at-25-vs-35",
    title: "Cost of Waiting: Investing at 25 vs 35 | Compound Jar",
    description:
      "Start investing $300/month at 25 vs 35 and the gap at 65 is about $421,453 at 7%. See the age-by-age table and what it takes to catch up.",
    h1: "The cost of waiting: starting at 25 vs 35",
    crumb: "The cost of waiting: starting at 25 vs 35",
    subhead: "$300 a month from 25 to 65, compounded monthly.",
    plan: { p: 0, m: 300, r: 7, y: 40, f: 12 },
    short: `Investing $300 a month at 7% from age 25 grows to about ${money(start25.bal)} by 65. Starting at 35 grows to about ${money(start35.bal)}. Waiting 10 years costs about ${money(start25.bal - start35.bal)}, even though the difference in deposits is only ${money(start25.con - start35.con)}.`,
    intro: [
      "This isn't meant to make anyone who's 35 feel bad. It's meant to show what those early years are worth. If you're 25, they're your superpower. If you're 35, the best time to start is today, and the catch-up math is below.",
    ],
    sections: [
      {
        heading: "Age by age: $300 a month at 7%",
        table: {
          headers: ["Age", "Started at 25", "Started at 35", "Gap"],
          rows: ageRows,
        },
      },
      {
        heading: "The 10-year sprint",
        paragraphs: [
          `Here's the surprising part. Invest $300 a month only from 25 to 35 (10 years, ${money(sprint.con)}), then stop and let it ride. At 7%, that grows to about ${money(sprint.bal)} by 65. That's more than investing $300 a month every month from 35 to 65 (${money(start35.bal)} on ${money(start35.con)} of deposits). It's exactly the gap in the table above, and that's no coincidence: those first 10 years of deposits are the whole difference. They just get three extra decades to compound.`,
        ],
      },
      {
        heading: "Rate comparison: balance at 65",
        table: {
          headers: ["Yearly return", "Start at 25", "Start at 35", "Cost of waiting"],
          rows: waitRateRows,
        },
        after: "The higher the return, the more waiting costs, because compounding rewards time.",
      },
      {
        heading: "Time to $1 million on $300 a month",
        paragraphs: [
          `At 7%, $300 a month takes about ${timeTo(plan300)} to reach $1M. Starting at 25, that's around age 68. Starting at 35, it's around age 78. At 10%, it takes about ${timeTo({ ...plan300, r: 10 })}. A 35-year-old who wants the same ${money(start25.bal)} by 65 would need about ${money(catchUp)} a month, more than double.`,
        ],
      },
    ],
    faqs: [
      {
        q: "How much more do I need to save if I start at 35?",
        a: `To match a 25-year-old's $300 a month at 7%, you'd need about ${money(catchUp)} a month from 35 to 65, about ${catchMultiple}.`,
      },
      {
        q: "What if I start at 30?",
        a: `$300 a month from 30 to 65 at 7% grows to about ${money(start30.bal)}. That's ${money(start25.bal - start30.bal)} less than starting at 25 and ${money(start30.bal - start35.bal)} more than starting at 35.`,
      },
      {
        q: "I'm already past 35. Is it too late?",
        a: `No. Compounding works from whatever day you start. $300 a month for 20 years at 7% still grows to about ${money(twenty300.bal)} from ${money(twenty300.con)} in deposits. Start where you are and raise the deposit when you can.`,
      },
    ],
    links: [
      { href: "/?p=0&m=300&r=7&y=40&f=12", label: "Run your own start age" },
      { href: "/", label: "compound interest calculator" },
    ],
    linkLead: "Or go back to the full",
  },
];

export function findScenario(slug) {
  return scenarios.find((scenario) => scenario.slug === slug) || null;
}

export function scenarioPath(slug) {
  return `/${slug}`;
}

export function scenarioPlain(scenario) {
  const parts = [scenario.short, ...scenario.intro];
  for (const section of scenario.sections) {
    parts.push(section.heading);
    if (section.paragraphs) parts.push(...section.paragraphs);
    if (section.after) parts.push(section.after);
    if (section.table) {
      parts.push(section.table.headers.join(" "));
      for (const row of section.table.rows) parts.push(row.join(" "));
    }
  }
  for (const faq of scenario.faqs) parts.push(faq.q, faq.a);
  return parts.join("\n");
}
