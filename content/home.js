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
  monthsToTarget,
  paymentNeeded,
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

const lumpPlan = { p: 10000, m: 0, r: 7, f: 12 };
const monthlyPlan = { p: 0, r: 7, y: 30, f: 12 };
const waitingBase = { p: 0, m: 300, r: 7, f: 12 };

function rowBalance(plan) {
  const result = project(plan);
  return {
    plan,
    balance: money(result.bal),
    contributed: money(result.con),
    growth: money(result.int),
    result,
  };
}

export const lumpRows = [10, 20, 30].map((years) => ({
  label: String(years),
  ...rowBalance({ ...lumpPlan, y: years }),
}));

export const monthlyRows = [200, 500, 1000].map((monthly) => ({
  label: money(monthly),
  ...rowBalance({ ...monthlyPlan, m: monthly }),
}));

const startAt25 = rowBalance({ ...waitingBase, y: 40 });
const startAt35 = rowBalance({ ...waitingBase, y: 30 });
const waitingGap = startAt25.result.bal - startAt35.result.bal;
const catchUp = paymentNeeded(startAt25.result.bal, { p: 0, r: 7, y: 30 });

export const waitingRows = [
  { label: "25", years: "40", ...startAt25 },
  { label: "35", years: "30", ...startAt35 },
];

export const waitingGapText = money(waitingGap);
export const catchUpText = money(catchUp);
export const depositGapText = money(startAt25.result.con - startAt35.result.con);

const freqLabels = [
  [1, "Yearly"],
  [4, "Quarterly"],
  [12, "Monthly"],
  [365, "Daily"],
];

export const frequencyRows = freqLabels.map(([f, label]) => ({
  label,
  f,
  lump: money(project({ ...lumpPlan, y: 30, f }).bal),
  deposits: money(project({ ...DEFAULTS, f }).bal),
}));

const defaultMonthly = project(DEFAULTS);
const defaultDaily = project({ ...DEFAULTS, f: 365 });
const defaultYearly = project({ ...DEFAULTS, f: 1 });
const dailyGap = defaultDaily.bal - defaultMonthly.bal;
const dailyGapPct = (dailyGap / defaultMonthly.bal) * 100;

export const defaultDailyGapText = money(dailyGap);
export const defaultDailyGapPct = dailyGapPct.toFixed(1);

const fourPct = project({ ...DEFAULTS, r: 4 });
export const fourPercentText = money(fourPct.bal);
export const defaultBalanceText = money(defaultMonthly.bal);
export const defaultContributionText = money(defaultMonthly.con);
export const defaultGrowthText = money(defaultMonthly.int);

const lumpYearly = project({ ...lumpPlan, y: 30, f: 1 });
const lumpMonthly = project({ ...lumpPlan, y: 30, f: 12 });
const lumpDaily = project({ ...lumpPlan, y: 30, f: 365 });
export const lumpFrequency = {
  yearly: money(lumpYearly.bal),
  monthly: money(lumpMonthly.bal),
  dailyAdds: money(lumpDaily.bal - lumpMonthly.bal),
};

const fiveHundred = (years) => project({ p: 0, m: 500, r: 7, y: years, f: 12 });

export const ruleRates = [4, 6, 7, 8, 10, 12];
export const ruleRows = ruleRates.map((rate) => ({
  rate: `${rate}%`,
  estimate: yearsLabel(ruleOf72(rate)),
  exact: yearsLabel(exactDoublingYears(rate)),
}));

export const howToSteps = [
  {
    title: "Starting amount",
    body: `What you have saved or invested today. Zero is fine. Everyone starts somewhere. (Default: ${money(DEFAULTS.p)}.)`,
  },
  {
    title: "Monthly deposit",
    body: `What you plan to add each month. Even $25 shows up on the chart. (Default: ${money(DEFAULTS.m)}.)`,
  },
  {
    title: "Yearly return",
    body: `The average annual growth rate you want to test. Not sure? See [What return should I use?](#returns) below. (Default: ${rateText(DEFAULTS.r)}.)`,
  },
  {
    title: "Years",
    body: `How long you'll let it grow. Try 10, 20 and 30 to see how much time matters. (Default: ${DEFAULTS.y}.)`,
  },
  {
    title: "Compounding frequency (optional)",
    body: "Under Advanced, choose yearly, quarterly, monthly or daily. Monthly is the default and matches the way deposits work here.",
  },
];

const worked = workedDefault();

export const formulaParagraphs = {
  intro:
    "Compound interest means you earn interest on your interest. Each period, growth is added to the jar, and the next period's growth is calculated on the bigger total.",
  lumpLead: "For a single starting amount:",
  lump: "A = P(1 + r/n)^(nt)",
  variables: [
    "A = the final amount",
    "P = the starting amount (principal)",
    "r = the yearly interest rate as a decimal (7% = 0.07)",
    "n = how many times per year interest compounds (12 for monthly)",
    "t = the number of years",
  ],
  annuityLead: "With a regular monthly deposit added, the formula becomes:",
  annuity: "FV = P(1 + r/n)^(nt) + PMT × [((1 + r/n)^(nt) − 1) / (r/n)]",
  timing:
    "where PMT is the monthly deposit. This version assumes deposits land at the end of each month, which is what Compound Jar uses. If you deposit at the start of each month, multiply the deposit part by (1 + r/n). That gives each deposit one extra month to grow, so the result comes out slightly higher.",
  worked: `Worked through for the default plan: (1 + ${worked.rateDecimal}/12)^${worked.exponent} ≈ ${worked.factorText}. The ${money(DEFAULTS.p)} grows to ${worked.lump}. The ${money(DEFAULTS.m)} deposits grow to ${worked.deposits}. Together that's ${worked.together} (each part rounded to the dollar).`,
  otherFrequency:
    "When you pick a compounding frequency other than monthly, Compound Jar converts the yearly rate into an equivalent monthly growth factor, (1 + r/n)^(n/12), so your monthly deposits still line up. The full method is on our [Methodology](/methodology) page.",
};

const lump20 = lumpRows[1];
const lump30 = lumpRows[2];
const lastDecade = lump30.result.bal - lump20.result.bal;

export const lumpNote = `The money roughly doubles every 10 years. The last decade adds ${money(lastDecade)}, more than the first two decades combined (${lump20.growth}).`;

export const monthlyNote = "In every row, about 70% of the ending balance is growth rather than deposits.";

export const waitingNote = `Starting ten years later costs about ${waitingGapText} by 65, even though the difference in deposits is only ${depositGapText}. To catch up, the 35-year-old would need to deposit about ${catchUpText} a month instead of ${money(waitingBase.m)}. More on this: [Cost of waiting: start at 25 vs 35](/cost-of-waiting-start-at-25-vs-35).`;

export const frequencyNote = `Going from monthly to daily compounding adds just ${defaultDailyGapText} over ${DEFAULTS.y} years on the default plan, about ${defaultDailyGapPct}%. How much you deposit, the rate you earn and how long you stay invested matter far more than how often interest compounds. More: [Daily compound interest calculator](/daily-compound-interest-calculator).`;

export const depositColumnLabel = `${money(DEFAULTS.p)} + ${money(DEFAULTS.m)}/month`;

export const returnBullets = [
  "U.S. stocks (S&P 500), long run. From 1928 to 2025, the S&P 500 with dividends reinvested returned about 10.0% a year compounded (a simple average of the yearly returns is about 11.9%). That's our calculation from NYU Stern's annual return data ([Damodaran, NYU Stern, updated Jan 2026](https://pages.stern.nyu.edu/~adamodar/New_Home_Page/datafile/histretSP.html)). The ride was bumpy: 26 of those 98 years were negative, including −43.8% in 1931 and −36.6% in 2008.",
  "Inflation, long run. Consumer prices (CPI-U) rose about 3.0% a year from December 1927 to December 2025. That's our calculation from the BLS index via [FRED (series CPIAUCNS)](https://fred.stlouisfed.org/series/CPIAUCNS). After that inflation, the S&P 500's ~10.0% works out to roughly 6.8% a year in today's dollars. That's one reason our default is 7%.",
  "Inflation, now. CPI-U rose 3.4% over the 12 months ending August 2026 ([BLS CPI release, Sept. 11, 2026](https://www.bls.gov/news.release/cpi.nr0.htm)). The Federal Reserve targets 2% inflation over the longer run ([Federal Reserve](https://www.federalreserve.gov/faqs/economy_14400.htm)).",
  "Savings accounts. The FDIC's national average savings rate was 0.37% in its September 21, 2026 update ([FDIC national rates](https://www.fdic.gov/national-rates-and-rate-caps)). Some high-yield accounts pay much more, so check your own bank's current APY and use that.",
];

export const todayDollars = `Want a "today's dollars" view? A rough shortcut is to subtract expected inflation from your return. For example, use 4% instead of ${rateText(DEFAULTS.r)} if you expect about 3% inflation. At 4%, the default plan comes to about ${fourPercentText} in today's purchasing power, compared with ${defaultBalanceText} at ${rateText(DEFAULTS.r)} in future dollars.`;

export const returnCaveat =
  "Past returns don't guarantee future ones, and real investments come with fees and taxes that this calculator doesn't subtract.";

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

export const popularScenarios = [
  {
    href: "/500-a-month-for-30-years",
    label: "$500 a month for 30 years",
    blurb: `about ${money(fiveHundred(30).bal)} at 7%`,
  },
  {
    href: "/1000-a-month-for-20-years",
    label: "$1,000 a month for 20 years",
    blurb: `about ${money(project({ p: 0, m: 1000, r: 7, y: 20, f: 12 }).bal)} at 7%`,
  },
  {
    href: "/how-long-to-reach-1-million",
    label: "How long to reach $1 million",
    blurb: "",
  },
  {
    href: "/daily-compound-interest-calculator",
    label: "Daily compound interest calculator",
    blurb: "",
  },
  {
    href: "/cost-of-waiting-start-at-25-vs-35",
    label: "Cost of waiting: start at 25 vs 35",
    blurb: "",
  },
];

const reach500 = formatMonths(monthsToTarget({ p: 0, m: 500, r: 7, f: 12 }, 1_000_000));
const reach1000 = formatMonths(monthsToTarget({ p: 0, m: 1000, r: 7, f: 12 }, 1_000_000));
const pmtMillion = money(paymentNeeded(1_000_000, { p: 0, r: 7, y: 30 }));

export const pageDisclaimer =
  "Compound Jar is an educational tool, not financial advice. Results are projections based on the numbers you enter and assume a steady rate of return and end-of-month deposits, before taxes, fees and inflation. Real returns vary, can be negative, and aren't guaranteed. Consider talking to a qualified professional before making investment decisions.";

export const privacyAnswer =
  "It's free, with no login and no account. Your plan lives in the link itself: the numbers are in the URL, so you can bookmark it or share it. We don't save your inputs in a database. Anonymous visit analytics records the page path and a source tag, not the plan numbers. Our host can still keep request logs of the URL you opened.";

export const faqs = [
  {
    q: "What is compound interest?",
    a: "Compound interest is interest earned on both your original money and the interest it has already earned. Because each period's growth builds on a bigger balance, the jar fills faster over time. That's why the curve on the chart bends upward.",
  },
  {
    q: "What's the difference between simple and compound interest?",
    a: `Simple interest is paid only on your original amount. Compound interest is also paid on past interest. $10,000 at 7% simple interest for 30 years earns ${money(10000 * 0.07 * 30)}, ending at ${money(10000 + 10000 * 0.07 * 30)}. Compounded monthly, it ends at ${lump30.balance}.`,
  },
  {
    q: "How often is interest compounded?",
    a: "It depends on the account. Savings accounts set their own schedule (daily and monthly are common), so check your account's terms. Stock index funds don't pay a fixed interest rate at all. Their prices move, and dividends get reinvested on their own schedule, so an \"average yearly return\" is an approximation. Monthly compounding is a reasonable default for a what-if.",
  },
  {
    q: "Does monthly compounding beat annual, and by how much?",
    a: `Yes, but by less than most people expect. On $10,000 at 7% for 30 years, yearly compounding gives ${lumpFrequency.yearly} and monthly gives ${lumpFrequency.monthly}. Daily adds only ${lumpFrequency.dailyAdds} more on top of monthly.`,
  },
  {
    q: "How much will $500 a month grow to?",
    a: `At 7% a year, $500 a month from $0 grows to about ${money(fiveHundred(10).bal)} in 10 years, ${money(fiveHundred(20).bal)} in 20 years and ${money(fiveHundred(30).bal)} in 30 years. Change any slider above to test your own amount.`,
  },
  {
    q: "How long does it take to double my money?",
    a: `Use the Rule of 72: divide 72 by your yearly return. At 7%, that's about ${yearsLabel(ruleOf72(7)).replace(" years", "")} years. At 10%, about ${yearsLabel(ruleOf72(10)).replace(" years", "")} years. Regular deposits make your balance grow faster than doubling alone would.`,
  },
  {
    q: "How long will it take to reach $1 million?",
    a: `At 7%, starting from $0: about ${reach500} at $500 a month, or ${reach1000} at $1,000 a month. To get there in exactly 30 years, you'd need about ${pmtMillion} a month. See [How long to reach $1 million](/how-long-to-reach-1-million).`,
  },
  {
    q: "Does this account for inflation and taxes?",
    a: "No. Results are before inflation, taxes and fees. For a rough today's-dollars view, lower the yearly return by your expected inflation rate (see above). Tax-advantaged accounts and fund fees vary too much to model in a quick what-if.",
  },
  {
    q: "Is this calculator accurate?",
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
