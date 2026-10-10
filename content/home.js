/**
 * Homepage copy. Edit the words here.
 * Dollar amounts are computed from the assumptions below with lib/plan.js.
 * Do not paste balances by hand.
 */
import {
  DEFAULTS,
  answerSentence,
  formatFull,
  formatRate,
  project,
  ruleOf72,
  yearWord,
  yearsToTarget,
} from "../lib/plan.js";

export const contentUpdated = "2026-10-10";
export const contentUpdatedLabel = "October 10, 2026";

export const howToSteps = [
  {
    title: "Set your starting amount",
    body: "This is money already set aside, before the monthly deposit. Use 0 if you are starting from scratch.",
  },
  {
    title: "Set the monthly deposit",
    body: "The calculator adds this at the end of every month, for as many years as you choose.",
  },
  {
    title: "Set the yearly return",
    body: "One steady annual rate. Real returns move around. This shows what that rate would do if it held.",
  },
  {
    title: "Set the years",
    body: "How long the deposits and the compounding run. The chart and the table both follow this.",
  },
];

export const formula = {
  paragraphs: [
    "With a lump sum and no further deposits, the balance after t years is:",
  ],
  lump: "A = P(1 + r/n)^(nt)",
  variables: [
    "P is the starting amount.",
    "r is the annual rate as a decimal, so 7% is 0.07.",
    "n is how many times a year interest compounds.",
    "t is the number of years.",
  ],
  after: [
    "This calculator also adds a deposit at the end of every month. Each month the balance grows by g, then the deposit is added. g = (1 + r/n)^(n/12). When compounding is monthly, n is 12 and g is exactly 1 + r/12.",
    "Over t years, with a monthly deposit PMT, monthly compounding is the standard future-value formula:",
  ],
  annuity: "FV = P(1 + r/12)^(12t) + PMT × [((1 + r/12)^(12t) − 1) / (r/12)]",
  timing: [
    "Deposits go in at the end of the month, not the beginning. The rate stays flat. Taxes, fees, and inflation are not included.",
    "Yearly, quarterly, and daily compounding change n, and therefore g. The deposit is still monthly. Daily compounding finishes a little higher than monthly at the same stated annual rate. The comparison below shows the size of that gap.",
  ],
};

const lumpPlan = { p: 10000, m: 0, r: 7, f: 12 };
const monthlyPlan = { p: 0, r: 7, y: 30, f: 12 };
const waitingBase = { p: 0, m: 200, r: 7, f: 12 };
const frequencyBase = { p: 1000, m: 200, r: 7, y: 30 };
const millionPlan = { p: 0, m: 1000, r: 7, f: 12 };

function moneyRow(plan) {
  const result = project(plan);
  return {
    balance: formatFull(result.bal),
    contributed: formatFull(result.con),
    interest: formatFull(result.int),
    result,
  };
}

export const examples = {
  lump: {
    caption:
      "$10,000 to start, no monthly deposit, 7% a year, compounded monthly.",
    rows: [10, 20, 30].map((years) => ({
      label: `${years} ${yearWord(years)}`,
      ...moneyRow({ ...lumpPlan, y: years }),
    })),
  },
  monthly: {
    caption: "Nothing to start, 7% a year, compounded monthly, for 30 years.",
    rows: [200, 500, 1000].map((monthly) => ({
      label: `${formatFull(monthly)} / month`,
      ...moneyRow({ ...monthlyPlan, m: monthly }),
    })),
  },
  waiting: (() => {
    const early = moneyRow({ ...waitingBase, y: 40 });
    const late = moneyRow({ ...waitingBase, y: 30 });
    return {
      caption:
        "$200 a month, nothing to start, 7% compounded monthly. Starting at 25 means 40 years of deposits to age 65. Starting at 35 means 30 years.",
      rows: [
        { label: "Start at 25", ...early },
        { label: "Start at 35", ...late },
      ],
      note: `Starting at 25 also means you put in ${formatFull(early.result.con - late.result.con)} more. The balance gap is ${formatFull(early.result.bal - late.result.bal)}, because that extra money has time to compound and the earlier deposits grow for longer.`,
    };
  })(),
  frequency: (() => {
    const labels = { 1: "Yearly", 12: "Monthly", 365: "Daily" };
    const rows = [1, 12, 365].map((f) => ({
      label: labels[f],
      ...moneyRow({ ...frequencyBase, f }),
    }));
    const yearly = rows[0].result.bal;
    const monthly = rows[1].result.bal;
    const daily = rows[2].result.bal;
    return {
      caption:
        "$1,000 to start, $200 a month, 7% a year, 30 years. Only the compounding frequency changes.",
      rows,
      note: `Daily compounding ends at ${formatFull(daily)}, monthly at ${formatFull(monthly)}, and yearly at ${formatFull(yearly)}. At the same stated rate, compounding more often helps, and the gap is small next to the deposit and the rate.`,
    };
  })(),
};

export const returnSection = {
  paragraphs: [
    "The rate you type is an assumption, not a promise. A savings account, a bond fund, and a stock index do not behave like one flat percent every year.",
    "Placeholder for a sourced market statistic: add the long-run stock-index return you want to cite, the date range, and the primary source. Do not drop in a number without that citation.",
    "Placeholder for a current savings yield: add a high-yield savings APY range only with the source and the date you checked it. Yields move.",
    "This page shows nominal dollars. It does not subtract inflation, taxes, or fees. A balance that looks larger in 30 years can buy less if prices rise. The Bureau of Labor Statistics publishes the Consumer Price Index if you want a published inflation series to compare against.",
  ],
  sources: [
    {
      name: "Investor.gov — Compound interest",
      url: "https://www.investor.gov/introduction-investing/investing-basics/glossary/compound-interest",
    },
    {
      name: "Investor.gov — Compound interest calculator",
      url: "https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator",
    },
    {
      name: "U.S. Bureau of Labor Statistics — Consumer Price Index",
      url: "https://www.bls.gov/cpi/",
    },
  ],
};

export const ruleRows = [6, 8, 10].map((rate) => {
  const years = ruleOf72(rate);
  const text = Number.isInteger(years) ? String(years) : years.toFixed(1);
  return { rate: `${rate}%`, years: `${text} years` };
});

const defaultResult = project(DEFAULTS);
const millionYears = yearsToTarget(millionPlan, 1_000_000);
const freqMonthly = project({ ...frequencyBase, f: 12 });
const freqYearly = project({ ...frequencyBase, f: 1 });

export const faqs = [
  {
    q: "What is compound interest?",
    a: "Compound interest is growth on your balance and on the growth already added. A savings account that pays interest on earlier interest is compound interest. So is an investment account when the gains stay invested.",
  },
  {
    q: "What is the difference between simple and compound interest?",
    a: "Simple interest is calculated only on the original amount. Compound interest is calculated on the original amount plus interest already earned. Over long stretches, if the rate holds and the gains stay in, compounding is where most of a balance comes from.",
  },
  {
    q: "How often is interest compounded?",
    a: "Bank savings accounts often compound daily or monthly and quote an APY that already includes it. A stock index does not pay a smooth rate every month. This calculator applies one steady rate as often as you choose so you can compare plans. It is not a forecast of the market.",
  },
  {
    q: "Does monthly compounding beat annual, and by how much?",
    a: `On ${formatFull(frequencyBase.p)} to start and ${formatFull(frequencyBase.m)} a month at ${formatRate(frequencyBase.r)}% for ${frequencyBase.y} years, monthly compounding ends at ${formatFull(freqMonthly.bal)} and yearly compounding ends at ${formatFull(freqYearly.bal)}. The difference is ${formatFull(freqMonthly.bal - freqYearly.bal)}. Same deposits, same stated rate, more frequent compounding.`,
  },
  {
    q: "How much will $200 a month grow to?",
    a: answerSentence(DEFAULTS, defaultResult),
  },
  {
    q: "How long does it take to double my money?",
    a: `The rule of 72 is a shortcut for a lump sum and no deposits: years to double is about 72 divided by the annual rate. At 7% that is about ${(72 / 7).toFixed(1)} years. Monthly deposits change the picture, because later deposits have had less time to grow. Use the calculator for a plan that includes them.`,
  },
  {
    q: "How long does it take to reach $1 million?",
    a: millionYears
      ? `With ${formatFull(millionPlan.m)} a month, nothing to start, and ${formatRate(millionPlan.r)}% compounded monthly, the balance passes $1 million in year ${millionYears}. A different deposit or rate lands on a different year. This assumes the rate never changes and you never skip a deposit.`
      : `With ${formatFull(millionPlan.m)} a month at ${formatRate(millionPlan.r)}%, the balance does not pass $1 million inside ${80} years in this calculator.`,
  },
  {
    q: "Does this account for inflation and taxes?",
    a: "No. Results are before taxes, fees, and inflation. They are a steady-rate projection, not a spending-power forecast.",
  },
  {
    q: "Is this calculator accurate?",
    a: "It uses the formula on this page: end-of-month deposits and one unchanging rate. When compounding is monthly, that is the standard future-value formula. It is educational, not financial advice. Markets do not return the same percent every year.",
  },
  {
    q: "Is it free, and do you store my data?",
    a: "It is free. There is no account. The numbers live in your browser and in the link if you share it. The calendar file is built when you download it. We do not keep a copy of your plan.",
  },
];

export const scenarioNote =
  "Guides for common plans, such as $500 a month for 30 years, will be linked from here.";

export const aboutLine =
  "Compound Jar publishes this calculator and the notes on this page. No ads, no login, and nothing you type is stored on our servers.";

export const pageDisclaimer =
  "Educational only, not financial advice. A projection is not a promise. Returns are not guaranteed.";
