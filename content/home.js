/**
 * Homepage copy. Projection totals come from lib/plan.js.
 * Market statistics below are cited; they are not engine outputs.
 */
import {
  DEFAULTS,
  exactDoublingYears,
  formatFull,
  formatMonths,
  formatRate,
  monthlyNeeded,
  monthsToTarget,
  project,
  ruleOf72,
} from "../lib/plan.js";

export const contentUpdated = "2026-10-10";
export const contentUpdatedLabel = "October 10, 2026";

const money = (n) => formatFull(n);
const rateText = (rate) => `${formatRate(rate)}%`;

function yearsLabel(n) {
  const rounded = Math.round(n * 10) / 10;
  return `${rounded.toFixed(1)} years`;
}

function timeTo(plan, target = 1_000_000) {
  return formatMonths(monthsToTarget({ f: 12, ...plan }, target, 1200));
}

function needed(years, rate, start = 0) {
  return money(monthlyNeeded(1_000_000, { p: start, r: rate, y: years, f: 12 }));
}

export function workedDefault() {
  const i = DEFAULTS.r / 100 / 12;
  const n = DEFAULTS.y * 12;
  const factor = (1 + i) ** n;
  const lump = DEFAULTS.p * factor;
  const deposits = DEFAULTS.m * ((factor - 1) / i);
  return {
    factorText: factor.toFixed(4),
    lump: money(lump),
    deposits: money(deposits),
    together: money(lump + deposits),
    exponent: n,
    rateDecimal: DEFAULTS.r / 100,
  };
}

const defaultResult = project(DEFAULTS);
const defaultDaily = project({ ...DEFAULTS, f: 365 });
const fourPct = project({ ...DEFAULTS, r: 4 });
const lump125 = project({ p: 125_000, m: 0, r: 7, y: 30, f: 12 });

export const defaultBalanceText = money(defaultResult.bal);
export const defaultContributionText = money(defaultResult.con);
export const defaultGrowthText = money(defaultResult.int);
export const defaultCrossText = timeTo(DEFAULTS);
export const defaultDailyGapText = money(defaultDaily.bal - defaultResult.bal);
export const defaultDailyTimeText = timeTo({ ...DEFAULTS, f: 365 });
export const fourPercentText = money(fourPct.bal);
export const lump125Text = money(lump125.bal);
export const realMillionMonthly = needed(30, 4, DEFAULTS.p);
export const inflationMillion = money(1_000_000 / 1.03 ** 30);

export const intro =
  "Tell us your starting amount. Tell us what you think you can save each month. This compound interest calculator shows whether your jar can reach $1 million, how long it might take, and what would get you there sooner. No hot tips, no casino energy, no login. Just steady deposits, time and math you can check. Turns out boring is the new rebellious. Just keep compounding.";

export const pathNote =
  "Becoming a millionaire usually isn't about a lucky pick or perfect timing. It comes down to three things you control (what you start with, what you add each month and how long you stay invested) and one you don't: the return. We've all felt the pull of the next big thing. The quietly rebellious move is the patient one: steady deposits you can actually plan around, even though no return is guaranteed.";

export const howToSteps = [
  {
    title: "What you have",
    body: `Enter what you've invested today. Zero is a fine place to start. (The example starts at ${money(DEFAULTS.p)}.)`,
  },
  {
    title: "What you can save",
    body: `Enter the monthly amount you think you can keep up. This is the biggest lever you control. (The example uses ${money(DEFAULTS.m)}.)`,
  },
  {
    title: "Yearly return",
    body: `The average annual growth you want to assume. Test a cautious and a hopeful rate. See [What return should I use?](#returns) below. (The example uses ${rateText(DEFAULTS.r)}, an assumption, not a guarantee.)`,
  },
  {
    title: "Years",
    body: `How long you're willing to let it grow. Try 20, 30 and 40. (The example uses ${DEFAULTS.y}.)`,
  },
  {
    title: "Compounding frequency (optional)",
    body: "Under Advanced, choose yearly, quarterly, monthly or daily. Monthly matches monthly deposits.",
  },
];

export const howToClose =
  "If the big number reads $1,000,000 or more, you're on track for $1M under those assumptions. If not, nudge the monthly deposit or the years until it does. That's your path. Tap Lock in this plan to save your link and set a monthly calendar reminder.";

const gridStarts = [0, 10_000, 25_000, 50_000, 100_000];
const gridSaves = [300, 500, 800, 1_000, 1_500];

export const haveSaveHeaders = ["What you have", ...gridSaves.map((m) => `${money(m)}/mo`)];
export const haveSaveRows = gridStarts.map((start) => [
  money(start),
  ...gridSaves.map((monthly) => timeTo({ p: start, m: monthly, r: 7 })),
]);

const saveYears = [20, 25, 30, 35, 40];
const saveRates = [5, 7, 10];

export const saveHeaders = ["Years to $1M", ...saveRates.map((rate) => `at ${rate}%`)];
export const saveRows = saveYears.map((years) => [
  String(years),
  ...saveRates.map((rate) => needed(years, rate)),
]);

export const saveNote = `Time is the cheat code. At 7%, giving yourself 40 years instead of 20 cuts the monthly deposit from ${needed(20, 7)} to ${needed(40, 7)}. More: [How much to save a month to be a millionaire](/how-much-to-save-a-month-to-be-a-millionaire).`;

const longDeposits = [300, 500, 800, 1_000, 1_500];
export const longHeaders = ["Monthly deposit", ...saveRates.map((rate) => `at ${rate}%`)];
export const longRows = longDeposits.map((monthly) => [
  money(monthly),
  ...saveRates.map((rate) => timeTo({ p: 0, m: monthly, r: rate })),
]);

export const ageHeaders = ["Start age", ...saveRates.map((rate) => `at ${rate}%`)];
export const ageRows = [
  ["25", ...saveRates.map((rate) => `${needed(40, rate)}/mo`)],
  ["35", ...saveRates.map((rate) => `${needed(30, rate)}/mo`)],
];

export const ageNote = `At 7%, waiting ten years more than doubles the monthly deposit, from ${needed(40, 7)} to ${needed(30, 7)}. More: [Become a millionaire by 50](/become-a-millionaire-by-50).`;

const worked = workedDefault();

export const formulaParagraphs = {
  intro:
    "Compound interest means you earn returns on your returns. Each period, growth is added to the jar, and the next period's growth is calculated on the bigger total. That snowball is how ordinary monthly deposits can turn into $1 million.",
  lumpLead: "For a single starting amount:",
  lump: "A = P(1 + r/n)^(nt)",
  variables: [
    "A = the final amount",
    "P = the starting amount (principal)",
    "r = the yearly interest rate as a decimal (7% = 0.07)",
    "n = how many times per year interest compounds (12 for monthly)",
    "t = the number of years",
  ],
  annuityLead: "With a regular monthly deposit added:",
  annuity: "FV = P(1 + r/n)^(nt) + PMT × [((1 + r/n)^(nt) − 1) / (r/n)]",
  timing:
    "where PMT is the monthly deposit. This version assumes deposits land at the end of each month, which is what Compound Jar uses. If you deposit at the start of each month, multiply the deposit part by (1 + r/n). That gives each deposit one extra month to grow, so the result comes out slightly higher.",
  worked: `Worked through for the starting example: (1 + ${worked.rateDecimal}/12)^${worked.exponent} ≈ ${worked.factorText}. The ${money(DEFAULTS.p)} grows to ${worked.lump}. The ${money(DEFAULTS.m)} deposits grow to ${worked.deposits}. Together that's ${worked.together} (each part rounded to the dollar), just over $1 million.`,
  rearrange:
    "To find the monthly deposit that reaches a goal, rearrange the formula: PMT = (Goal − P(1 + r/n)^(nt)) × (r/n) / ((1 + r/n)^(nt) − 1). That's how the \"monthly needed\" table above is calculated.",
  otherFrequency:
    "When you pick a compounding frequency other than monthly, Compound Jar converts the yearly rate into an equivalent monthly growth factor, (1 + r/n)^(n/12), so your monthly deposits still line up. The full method is on our [Methodology](/methodology) page.",
  daily: `Does daily compounding get you to $1M faster? Barely. In the starting example, daily beats monthly by ${defaultDailyGapText} over 30 years and reaches $1M about a month sooner (${defaultDailyTimeText} vs ${timeTo(DEFAULTS)}). What you save and how long you stay invested move the finish line far more.`,
};

export const returnBullets = [
  "U.S. stocks (S&P 500), long run. From 1928 to 2025, the S&P 500 with dividends reinvested returned about 10.0% a year compounded (a simple average of the yearly returns is about 11.9%). That's our calculation from NYU Stern's annual return data ([Damodaran, NYU Stern, updated Jan 2026](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html)). The ride was bumpy: 26 of those 98 years were negative, including −43.8% in 1931 and −36.6% in 2008.",
  "Inflation, long run. Consumer prices (CPI-U) rose about 3.0% a year from December 1927 to December 2025. That's our calculation from the BLS index via [FRED (series CPIAUCNS)](https://fred.stlouisfed.org/series/CPIAUCNS). After that inflation, the S&P 500's ~10.0% works out to roughly 6.8% a year in today's dollars. That's one reason our default is 7%.",
  "Inflation, now. CPI-U rose 3.4% over the 12 months ending August 2026 ([BLS CPI release, Sept. 11, 2026](https://www.bls.gov/news.release/cpi.nr0.htm)). The Federal Reserve targets 2% inflation over the longer run ([Federal Reserve](https://www.federalreserve.gov/faqs/economy_14400.htm)).",
  "Savings accounts. The FDIC's national average savings rate was 0.37% in its September 21, 2026 update ([FDIC national rates](https://www.fdic.gov/national-rates-and-rate-caps)). At savings-account rates, $1M takes far longer, so check your own account's current APY.",
];

export const todayDollars = `A future million isn't today's million. At about 3% inflation, $1,000,000 thirty years from now buys roughly what ${inflationMillion} buys today. For a "today's dollars" view, lower the return by your expected inflation. At 4% instead of 7%, the starting example comes to about ${fourPercentText}. To reach a real $1M at 4%, you'd need about ${realMillionMonthly} a month for 30 years.`;

export const returnCaveat =
  "Past returns don't guarantee future ones. The 7% default is an assumption, not a promise, and real investments carry fees and taxes this calculator doesn't subtract.";

export const ruleRates = [4, 6, 7, 8, 10, 12];
export const ruleRows = ruleRates.map((rate) => ({
  rate: `${rate}%`,
  estimate: yearsLabel(ruleOf72(rate)),
  exact: yearsLabel(exactDoublingYears(rate)),
}));

export const ruleNote = `That's why $125,000 invested at 7% with nothing added grows to about ${lump125Text} in 30 years (compounded monthly). The shortcut is closest around 8%. It's a quick mental check, not a replacement for running the numbers.`;

export const popularScenarios = [
  {
    href: "/how-long-to-become-a-millionaire",
    label: "How long to become a millionaire",
  },
  {
    href: "/how-much-to-save-a-month-to-be-a-millionaire",
    label: "How much to save a month to be a millionaire",
  },
  {
    href: "/can-i-become-a-millionaire",
    label: "Can I become a millionaire?",
  },
  {
    href: "/500-a-month-to-1-million",
    label: "$500 a month to $1 million",
    blurb: `about ${timeTo({ p: 0, m: 500, r: 7 })} at 7%`,
  },
  {
    href: "/become-a-millionaire-by-50",
    label: "Become a millionaire by 50",
  },
];

export const sources = [
  {
    name: "NYU Stern, Aswath Damodaran, Historical Returns on Stocks, Bonds and Bills (annual S&P 500 returns incl. dividends, 1928–2025; updated Jan 5, 2026)",
    url: "https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html",
  },
  {
    name: "U.S. Bureau of Labor Statistics, CPI-U via FRED, series CPIAUCNS",
    url: "https://fred.stlouisfed.org/series/CPIAUCNS",
  },
  {
    name: "U.S. Bureau of Labor Statistics, Consumer Price Index – August 2026 (Sept. 11, 2026)",
    url: "https://www.bls.gov/news.release/cpi.nr0.htm",
  },
  {
    name: "Federal Reserve, Why does the Federal Reserve aim for inflation of 2 percent over the longer run?",
    url: "https://www.federalreserve.gov/faqs/economy_14400.htm",
  },
  {
    name: "FDIC, National Rates and Rate Caps (Sept. 21, 2026)",
    url: "https://www.fdic.gov/national-rates-and-rate-caps",
  },
];

export const pageDisclaimer =
  "Compound Jar is an educational compound interest calculator, not financial advice. Reaching $1 million is not guaranteed. Every result is a projection based on the numbers you enter. The 7% default is an assumption, not a forecast or a promise. Projections assume a steady rate of return and end-of-month deposits, before taxes, fees and inflation. Real returns vary, can be negative for years at a time, and you could end up with less than you put in. Consider talking to a qualified professional before making investment decisions.";

export const privacyAnswer =
  "It's free, with no login and no account. Your plan lives in the link itself: the numbers are in the URL, so you can bookmark it or share it. We don't save your inputs in a database. Anonymous visit analytics records the page path and a source tag, not the plan numbers. Our host can still keep request logs of the URL you opened.";

const fromZero500 = timeTo({ p: 0, m: 500, r: 7 });
const fromZero1000 = timeTo({ p: 0, m: 1000, r: 7 });
const fromZero1500 = timeTo({ p: 0, m: 1500, r: 7 });
const with50k = timeTo({ p: 50_000, m: 500, r: 7 });

export const faqs = [
  {
    q: "Can I become a millionaire?",
    a: "Enter what you have and what you can save each month, plus a return you're comfortable assuming. If the total reaches $1,000,000 within your timeline, you're on track under those assumptions. If not, raise the monthly deposit or add years until it does. The tables below show common starting points. Returns aren't guaranteed, so test a cautious rate too.",
  },
  {
    q: "How much do I need to save each month to become a millionaire?",
    a: `It depends on your timeline and return. From $0 at an assumed 7%, it's about ${needed(30, 7)} a month for 30 years, ${needed(20, 7)} for 20 years or ${needed(40, 7)} for 40 years. Already have $25,000 invested? For 30 years it drops to about ${needed(30, 7, 25_000)} a month.`,
  },
  {
    q: "How long does it take to become a millionaire?",
    a: `At 7% from $0: about ${fromZero500} at $500 a month, ${fromZero1000} at $1,000 a month and ${fromZero1500} at $1,500 a month. With $50,000 already invested and $500 a month, it's about ${with50k}. See [How long to become a millionaire](/how-long-to-become-a-millionaire).`,
  },
  {
    q: "Isn't it faster to go all in on a hot stock or coin?",
    a: "Honestly, we've all wondered. Sometimes a big bet pays off, and often it doesn't. Either way, you can't plan around it. Steady deposits into a diversified investment don't promise a return either, but they turn the question into math you can see and adjust. This calculator models the steady path. It doesn't recommend any specific investment.",
  },
  {
    q: "What is compound interest?",
    a: "Compound interest is growth on both your original money and the growth it has already earned. Each period builds on a bigger balance, so the jar fills faster over time. That's why most of a million-dollar balance arrives in the later years.",
  },
  {
    q: "What's the difference between simple and compound interest?",
    a: `Simple interest is paid only on your original amount. Compound interest is also paid on past interest. In the starting example, the 30 years of deposits total ${defaultContributionText}. Compounding at 7% adds ${defaultGrowthText} on top. Simple interest couldn't get you close to a million on the same deposits.`,
  },
  {
    q: "Is $1 million in 30 years the same as $1 million today?",
    a: `No. At about 3% inflation (the 1927–2025 average, our calculation from [FRED CPI](https://fred.stlouisfed.org/series/CPIAUCNS)), a future $1M buys roughly what ${inflationMillion} buys today. Lower the return by your inflation guess to plan in today's dollars.`,
  },
  {
    q: "Does this account for taxes and fees?",
    a: "No. Results are before taxes, fees and inflation. Tax-advantaged accounts and fund fees vary too much to model in a quick what-if.",
  },
  {
    q: "Is this compound interest calculator accurate?",
    a: "The math is exact for the inputs you give it. It uses the standard future-value formula with end-of-month deposits, and you can check it by hand with the formula above. Our [Methodology](/methodology) page spells out every assumption. What no calculator can promise is the return: real markets rise and fall, sometimes sharply.",
  },
  {
    q: "Is it free, and do you store my data?",
    a: privacyAnswer,
  },
];

export function faqPlain(faq) {
  return faq.a.replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
}
