/**
 * Curated scenario pages. Figures come from lib/plan.js.
 * These are not generated from share links.
 */
import {
  formatFull,
  formatMonths,
  monthlyNeeded,
  monthsToTarget,
  project,
} from "../lib/plan.js";

const money = (n) => formatFull(n);

function timeTo(plan, target = 1_000_000) {
  return formatMonths(monthsToTarget({ f: 12, ...plan }, target, 1200));
}

function needed(years, rate, start = 0) {
  return monthlyNeeded(1_000_000, { p: start, r: rate, y: years, f: 12 });
}

function neededText(years, rate, start = 0) {
  return money(needed(years, rate, start));
}

function at(plan) {
  return project({ f: 12, ...plan });
}

function balanceCell(result) {
  const bal = Math.round(result.bal);
  const mark = bal >= 1_000_000 ? " ✅ $1M+" : "";
  return `${money(bal)}${mark}`;
}

function yearRows(plan, years) {
  return years.map((year) => {
    const result = at({ ...plan, y: year });
    return [String(year), money(result.con), money(result.int), balanceCell(result)];
  });
}

function rateRows(plan, years) {
  return [5, 7, 10].map((rate) => {
    const result = at({ ...plan, r: rate, y: years });
    return [`${rate}%`, money(result.bal), money(result.int), timeTo({ ...plan, r: rate })];
  });
}

const reach800 = monthsToTarget({ p: 0, m: 800, r: 7, f: 12 }, 1_000_000, 1200);
const headStarts = [0, 5_000, 25_000, 50_000, 100_000];

const fast1500 = timeTo({ p: 5_000, m: 1_500, r: 7 });
const first100 = timeTo({ p: 5_000, m: 800, r: 7 }, 100_000);
const toMillion = monthsToTarget({ p: 5_000, m: 800, r: 7, f: 12 }, 1_000_000, 1200);
const to900 = monthsToTarget({ p: 5_000, m: 800, r: 7, f: 12 }, 900_000, 1200);
const last100 = formatMonths(toMillion - to900);

const pmt820 = needed(30, 7);
const pmt1235 = needed(25, 7);
const five37 = at({ p: 0, m: 500, r: 7, y: 37 });
const five30 = at({ p: 0, m: 500, r: 7, y: 30 });
const inflation = money(1_000_000 / 1.03 ** 30);
const realFromZero = neededText(30, 4);

export const scenarios = [
  {
    slug: "how-long-to-become-a-millionaire",
    title: "How Long to Be a Millionaire | Compound Interest Calculator",
    description: `Compound interest calculator table: how long to reach $1 million saving $300–$2,000 a month at 5%, 7% or 10%. $1,000/mo at 7%: about ${timeTo({ p: 0, m: 1000, r: 7 })}.`,
    h1: "How long does it take to become a millionaire?",
    crumb: "How long does it take to become a millionaire?",
    plan: { p: 5000, m: 800, r: 7, y: 30, f: 12 },
    short: `At an assumed 7% a year, starting from $0, it takes about ${timeTo({ p: 0, m: 500, r: 7 })} at $500 a month, ${timeTo({ p: 0, m: 800, r: 7 })} at $800 a month and ${timeTo({ p: 0, m: 1000, r: 7 })} at $1,000 a month. A $5,000 head start trims the $800 plan to ${timeTo({ p: 5000, m: 800, r: 7 })}.`,
    intro: [
      "The time it takes to become a millionaire comes down to two dials you control, your monthly deposit and your head start, plus one you don't: the return. Find your row.",
    ],
    sections: [
      {
        heading: "Time to $1 million, starting from $0",
        table: {
          headers: ["Monthly deposit", "at 5%", "at 7%", "at 10%"],
          rows: [300, 500, 800, 1000, 1500, 2000].map((monthly) => [
            money(monthly),
            ...[5, 7, 10].map((rate) => timeTo({ p: 0, m: monthly, r: rate })),
          ]),
        },
      },
      {
        heading: "What a head start does ($800 a month at 7%)",
        table: {
          headers: ["Starting amount", "Time to $1M", "Time saved vs $0"],
          rows: headStarts.map((start) => {
            const months = monthsToTarget({ p: start, m: 800, r: 7, f: 12 }, 1_000_000, 1200);
            return [
              money(start),
              formatMonths(months),
              start === 0 ? "—" : formatMonths(reach800 - months),
            ];
          }),
        },
      },
      {
        heading: "Year by year: the calculator's starting example ($5,000 + $800/month at 7%)",
        table: {
          headers: ["Year", "You've put in", "Growth", "Balance"],
          rows: yearRows({ p: 5000, m: 800, r: 7 }, [5, 10, 15, 20, 25, 30]),
          bold: 3,
        },
      },
      {
        heading: "Rate comparison: $5,000 + $800/month",
        table: {
          headers: ["Yearly return", "Balance after 30 years", "Growth", "Time to $1M"],
          rows: rateRows({ p: 5000, m: 800 }, 30),
        },
      },
    ],
    faqs: [
      {
        q: "What's the fastest way to become a millionaire with compound interest?",
        a: `Raise the monthly deposit and start as early as you can. Going from $800 to $1,500 a month (with $5,000 to start, at 7%) cuts the time from ${timeTo({ p: 5000, m: 800, r: 7 })} to ${fast1500}. Daily vs monthly compounding barely matters: it saves about a month in that example.`,
      },
      {
        q: "Why does the first $100,000 feel so slow?",
        a: `Early on, most of your balance is your own deposits. In the calculator's starting example ($5,000 + $800/month), the first $100,000 takes about ${first100}. The last $100,000 before $1M takes about ${last100}, because by then growth is doing most of the work.`,
      },
      {
        q: "Is $1 million in 30 years worth $1 million today?",
        a: `No. At about 3% inflation (the 1927–2025 average, our calculation from [FRED CPI](https://fred.stlouisfed.org/series/CPIAUCNS)), it would buy roughly what ${inflation} buys today. Lower the assumed return by your inflation guess to plan in today's dollars.`,
      },
    ],
    links: [
      { href: "https://compoundjar.com/?p=5000&m=800&r=7&y=30&f=12", label: "Find your time to $1M in the calculator →" },
      { href: "https://compoundjar.com/", label: "compound interest calculator" },
    ],
  },
  {
    slug: "how-much-to-save-a-month-to-be-a-millionaire",
    title: "How Much a Month for $1M? | Compound Interest Calculator",
    description: `Compound interest calculator: how much to save each month to reach $1 million in 10–40 years at 5%, 7% or 10%. At 7%, about ${neededText(30, 7)}/month for 30 years.`,
    h1: "How much do you need to save a month to be a millionaire?",
    crumb: "How much do you need to save a month to be a millionaire?",
    plan: { p: 0, m: pmt820, r: 7, y: 30, f: 12 },
    short: `Starting from $0 at an assumed 7% a year, you'd need to invest about ${neededText(30, 7)} a month for 30 years, ${neededText(20, 7)} a month for 20 years or ${neededText(40, 7)} a month for 40 years to reach $1 million.`,
    intro: [
      "Work backward from the million: pick your timeline, read across to your assumed return, and that's your monthly number. Every extra year you give it lowers the number.",
    ],
    sections: [
      {
        heading: "Monthly deposit needed to reach $1 million (from $0)",
        table: {
          headers: ["Years", "at 5%", "at 7%", "at 10%"],
          rows: [10, 15, 20, 25, 30, 35, 40].map((years) => [
            String(years),
            ...[5, 7, 10].map((rate) => neededText(years, rate)),
          ]),
        },
      },
      {
        heading: "With a head start (7%, 30 years)",
        table: {
          headers: ["Already invested", "Monthly needed for $1M in 30 years"],
          rows: [0, 5_000, 10_000, 25_000, 50_000].map((start) => [
            money(start),
            neededText(30, 7, start),
          ]),
        },
      },
      {
        heading: `Year by year: ${money(pmt820)} a month at 7% from $0`,
        table: {
          headers: ["Year", "You've put in", "Growth", "Balance"],
          rows: yearRows({ p: 0, m: pmt820, r: 7 }, [5, 10, 15, 20, 25, 30]),
          bold: 3,
        },
      },
      {
        heading: `Rate comparison: ${money(pmt820)} a month for 30 years`,
        table: {
          headers: ["Yearly return", "Balance after 30 years", "Growth", "Time to $1M"],
          rows: rateRows({ p: 0, m: pmt820 }, 30),
        },
      },
    ],
    faqs: [
      {
        q: "How is the monthly amount calculated?",
        a: "With the future-value formula solved for the deposit: PMT = (Goal − P(1 + r/12)^(12t)) × (r/12) / ((1 + r/12)^(12t) − 1), using end-of-month deposits. We round up to the next dollar so the plan clears $1M.",
      },
      {
        q: "What if I can't afford that much yet?",
        a: `Start with what you can and raise it over time. Every dollar you add moves the finish line closer. At 7%, $500 a month from $0 reaches $1M in about ${timeTo({ p: 0, m: 500, r: 7 })}, and $1,000 a month in about ${timeTo({ p: 0, m: 1000, r: 7 })}.`,
      },
      {
        q: "How much a month to be a millionaire in today's dollars?",
        a: `Use a lower, after-inflation return. At 4% (roughly 7% minus 3% inflation), reaching $1M in 30 years from $0 takes about ${realFromZero} a month.`,
      },
    ],
    links: [
      { href: `https://compoundjar.com/?p=0&m=${pmt820}&r=7&y=30&f=12`, label: "Find your monthly number in the calculator →" },
      { href: "https://compoundjar.com/", label: "compound interest calculator" },
    ],
  },
  {
    slug: "can-i-become-a-millionaire",
    title: "Can I Become a Millionaire? | Compound Interest Calculator",
    description: "Compound interest calculator: enter what you have and what you can save each month to see if you can become a millionaire. Time-to-$1M table at 5%, 7% and 10%.",
    h1: "Can I become a millionaire?",
    crumb: "Can I become a millionaire?",
    plan: { p: 25000, m: 500, r: 7, y: 30, f: 12 },
    short: `Probably, if you give it enough time. At an assumed 7% a year, $500 a month from $0 reaches $1 million in about ${timeTo({ p: 0, m: 500, r: 7 })}. $25,000 already invested plus $500 a month gets there in about ${timeTo({ p: 25000, m: 500, r: 7 })}. Find your row below, or enter your own numbers in the calculator.`,
    intro: [
      "Tell us what you have. Tell us what you think you can save. The tables below answer the question for common starting points. Returns aren't guaranteed, so check a cautious rate too.",
    ],
    sections: [
      {
        heading: "Time to $1 million at 7%: what you have × what you can save",
        table: {
          headers: ["What you have", "$200/mo", "$300/mo", "$500/mo", "$800/mo", "$1,000/mo", "$1,500/mo"],
          rows: [0, 5_000, 10_000, 25_000, 50_000, 100_000].map((start) => [
            money(start),
            ...[200, 300, 500, 800, 1000, 1500].map((monthly) => timeTo({ p: start, m: monthly, r: 7 })),
          ]),
        },
      },
      {
        heading: "Same table at 5% (cautious) and 10% (hopeful), $500 a month",
        table: {
          headers: ["What you have", "at 5%", "at 7%", "at 10%"],
          rows: [0, 5_000, 10_000, 25_000, 50_000, 100_000].map((start) => [
            money(start),
            ...[5, 7, 10].map((rate) => timeTo({ p: start, m: 500, r: rate })),
          ]),
        },
      },
      {
        heading: "Year by year: $25,000 already invested + $500 a month at 7%",
        table: {
          headers: ["Year", "You've put in", "Growth", "Balance"],
          rows: yearRows({ p: 25000, m: 500, r: 7 }, [5, 10, 15, 20, 25, 30, 35]),
          bold: 3,
        },
      },
      {
        heading: "Rate comparison: $25,000 + $500/month for 30 years",
        table: {
          headers: ["Yearly return", "Balance after 30 years", "Growth", "Time to $1M"],
          rows: rateRows({ p: 25000, m: 500 }, 30),
        },
      },
    ],
    faqs: [
      {
        q: "I'm starting from zero. Can I still become a millionaire?",
        a: `Yes, with time. At 7%, $300 a month from $0 takes about ${timeTo({ p: 0, m: 300, r: 7 })} and $1,000 a month takes about ${timeTo({ p: 0, m: 1000, r: 7 })}. Starting small and raising the deposit over time shortens the road.`,
      },
      {
        q: "What if I have savings but can't add much each month?",
        a: `Money already invested does a lot of the work. $100,000 with just $200 a month reaches $1M in about ${timeTo({ p: 100000, m: 200, r: 7 })} at 7%. $50,000 with $200 a month takes about ${timeTo({ p: 50000, m: 200, r: 7 })}.`,
      },
      {
        q: "Does this tell me what to invest in?",
        a: "No. Compound Jar models steady deposits at an assumed average return. It doesn't recommend specific investments, and no return is guaranteed. The patient, boring path is easy to model. Whether it fits you is your call.",
      },
    ],
    links: [
      { href: "https://compoundjar.com/?p=25000&m=500&r=7&y=30&f=12", label: "Enter your own numbers →" },
      { href: "https://compoundjar.com/", label: "compound interest calculator" },
    ],
  },
  {
    slug: "become-a-millionaire-by-50",
    title: "Become a Millionaire by 50 | Compound Interest Calculator",
    description: `Compound interest calculator: the monthly amount to have $1 million by 50, starting at 22–40, at 5%, 7% or 10%. From 25 at 7%: about ${neededText(25, 7)}/mo.`,
    h1: "How to become a millionaire by 50",
    crumb: "How to become a millionaire by 50",
    plan: { p: 0, m: pmt1235, r: 7, y: 25, f: 12 },
    short: `Starting from $0 at an assumed 7% a year, reaching $1 million by 50 takes about ${neededText(28, 7)} a month if you start at 22, ${neededText(25, 7)} at 25 and ${neededText(20, 7)} at 30.`,
    intro: [
      "Millionaire by 50 is a deadline, so the math is all about how many years you give compounding. Each five years you wait raises the monthly number a lot.",
    ],
    sections: [
      {
        heading: "Monthly deposit needed for $1M by age 50 (from $0)",
        table: {
          headers: ["Start age", "Years", "at 5%", "at 7%", "at 10%"],
          rows: [
            [22, 28],
            [25, 25],
            [30, 20],
            [35, 15],
            [40, 10],
          ].map(([age, years]) => [
            String(age),
            String(years),
            ...[5, 7, 10].map((rate) => neededText(years, rate)),
          ]),
        },
      },
      {
        heading: `Age by age: start at 25 with ${money(pmt1235)} a month (7%)`,
        table: {
          headers: ["Year", "Age", "You've put in", "Growth", "Balance"],
          rows: [
            [5, 30],
            [10, 35],
            [15, 40],
            [20, 45],
            [25, 50],
          ].map(([year, age]) => {
            const result = at({ p: 0, m: pmt1235, r: 7, y: year });
            return [String(year), String(age), money(result.con), money(result.int), balanceCell(result)];
          }),
          bold: 4,
        },
      },
      {
        heading: `Rate comparison: ${money(pmt1235)} a month from 25 to 50`,
        table: {
          headers: ["Yearly return", "Balance after 25 years", "Growth", "Time to $1M"],
          rows: rateRows({ p: 0, m: pmt1235 }, 25),
        },
      },
      {
        heading: "Would $800 a month get there?",
        paragraphs: [
          `Starting at 25 with $5,000 and $800 a month at 7%, you'd have about ${money(at({ p: 5000, m: 800, r: 7, y: 25 }).bal)} at 50 and cross $1M around age 55. To make it by 50 on that plan, you'd need about ${neededText(25, 7, 5000)} a month.`,
        ],
      },
    ],
    faqs: [
      {
        q: "Is becoming a millionaire by 50 realistic?",
        a: `It depends on your income, start age and returns, and none of that is guaranteed. The math says that starting at 25 takes about ${neededText(25, 7)} a month at 7%. At 10% it takes about ${neededText(25, 10)}, and at 5% about ${neededText(25, 5)}. Test the rate you're comfortable assuming.`,
      },
      {
        q: "I'm 35. Can I still be a millionaire by 50?",
        a: `At 7% from $0, it takes about ${neededText(15, 7)} a month for 15 years. If that's too steep, aim for 55: about ${neededText(20, 7)} a month for 20 years.`,
      },
      {
        q: "Does a lump sum help?",
        a: `Yes. Starting at 30 with $25,000 already invested, you'd need about ${neededText(20, 7, 25000)} a month at 7% to reach $1M by 50, versus ${neededText(20, 7)} from $0.`,
      },
    ],
    links: [
      { href: `https://compoundjar.com/?p=0&m=${pmt1235}&r=7&y=25&f=12`, label: "Plan your millionaire-by-50 path →" },
      { href: "https://compoundjar.com/", label: "compound interest calculator" },
    ],
  },
  {
    slug: "500-a-month-to-1-million",
    title: "$500 a Month to $1 Million | Compound Interest Calculator",
    description: `Compound interest calculator: $500 a month at 7% reaches $1 million in about ${timeTo({ p: 0, m: 500, r: 7 })}. Year-by-year table, 5/7/10% returns, faster paths.`,
    h1: "$500 a month to $1 million",
    crumb: "$500 a month to $1 million",
    plan: { p: 0, m: 500, r: 7, y: 37, f: 12 },
    short: `At an assumed 7% a year, investing $500 a month from $0 reaches $1 million in about ${timeTo({ p: 0, m: 500, r: 7 })}. After 37 years, the jar holds about ${money(five37.bal)}, from ${money(five37.con)} in deposits.`,
    intro: [
      "$500 a month (about $16 a day) is a path to $1M that a lot of people in their 20s can picture. It takes patience: most of the million shows up in the final decade.",
    ],
    sections: [
      {
        heading: "Year by year (7%, from $0)",
        table: {
          headers: ["Year", "You've put in", "Growth", "Balance"],
          rows: yearRows({ p: 0, m: 500, r: 7 }, [5, 10, 15, 20, 25, 30, 35, 40]),
          bold: 3,
        },
      },
      {
        heading: "What if the return is 5%, 7% or 10%?",
        table: {
          headers: ["Yearly return", "Balance after 40 years", "Growth", "Time to $1M"],
          rows: rateRows({ p: 0, m: 500 }, 40),
        },
      },
      {
        heading: "Ways to get there faster (7%)",
        table: {
          headers: ["Change", "Time to $1M"],
          rows: [
            ["$500/month from $0", timeTo({ p: 0, m: 500, r: 7 })],
            ["Start with $5,000", timeTo({ p: 5000, m: 500, r: 7 })],
            ["$650/month", timeTo({ p: 0, m: 650, r: 7 })],
            ["$800/month + $5,000 start", timeTo({ p: 5000, m: 800, r: 7 })],
          ],
        },
      },
    ],
    faqs: [
      {
        q: "Can $500 a month make me a millionaire?",
        a: `At 7%, yes, in about ${timeTo({ p: 0, m: 500, r: 7 })}. At 10%, it's about ${timeTo({ p: 0, m: 500, r: 10 })}. At 5%, about ${timeTo({ p: 0, m: 500, r: 5 })}. Returns aren't guaranteed, so treat these as what-ifs.`,
      },
      {
        q: "What does $500 a month become in 30 years?",
        a: `About ${money(five30.bal)} at 7%. That's ${money(1_000_000 - five30.bal)} short of $1M. Reaching $1M in 30 years at 7% takes about ${neededText(30, 7)} a month.`,
      },
      {
        q: "If I start at 25 with $500 a month, when do I hit $1M?",
        a: "At 7%, around age 61. Starting at 30, it's around 66.",
      },
    ],
    links: [
      { href: "https://compoundjar.com/?p=0&m=500&r=7&y=37&f=12", label: "Open the $500 plan in the calculator →" },
      { href: "https://compoundjar.com/", label: "compound interest calculator" },
    ],
  },
];

export function findScenario(slug) {
  return scenarios.find((scenario) => scenario.slug === slug) || null;
}

export function scenarioPath(slug) {
  return `/${slug}`;
}
