/**
 * Curated scenario pages. Do not generate these from share links.
 * Marketing replaces the placeholder words. Dollar amounts are computed
 * from `plan` with lib/plan.js when the page renders.
 *
 * Each page is app/[slug]/page.js, canonical https://compoundjar.com/{slug},
 * and the only place that fires scenario_page_view.
 */
export const scenarios = [
  {
    slug: "500-a-month-for-30-years",
    title: "$500 a Month for 30 Years",
    description: "Placeholder. Marketing will replace this description for $500 a month invested for 30 years.",
    subhead: "Placeholder. A monthly deposit, compounded monthly, for 30 years.",
    paragraphs: [
      "Placeholder for marketing. Explain who this plan is for and what the chart is showing. The balance, the year-by-year table, and the answer sentence are computed by the calculator. Do not paste a dollar amount here.",
    ],
    plan: { p: 0, m: 500, r: 7, y: 30, f: 12 },
  },
  {
    slug: "200-a-month-for-30-years",
    title: "$200 a Month for 30 Years",
    description: "Placeholder. Marketing will replace this description for $200 a month invested for 30 years.",
    subhead: "Placeholder. A smaller monthly deposit, compounded monthly, for 30 years.",
    paragraphs: [
      "Placeholder for marketing. This page is the $200 a month scenario. Replace this paragraph with the real guide. The numbers below come from the shared engine.",
    ],
    plan: { p: 0, m: 200, r: 7, y: 30, f: 12 },
  },
  {
    slug: "1000-a-month-for-30-years",
    title: "$1,000 a Month for 30 Years",
    description: "Placeholder. Marketing will replace this description for $1,000 a month invested for 30 years.",
    subhead: "Placeholder. A larger monthly deposit, compounded monthly, for 30 years.",
    paragraphs: [
      "Placeholder for marketing. This page is the $1,000 a month scenario. Replace this paragraph with the real guide. The numbers below come from the shared engine.",
    ],
    plan: { p: 0, m: 1000, r: 7, y: 30, f: 12 },
  },
  {
    slug: "10000-lump-sum-for-30-years",
    title: "$10,000 Lump Sum for 30 Years",
    description: "Placeholder. Marketing will replace this description for a $10,000 lump sum left for 30 years.",
    subhead: "Placeholder. One starting amount, no monthly deposit, compounded monthly.",
    paragraphs: [
      "Placeholder for marketing. This page is the lump-sum scenario. Replace this paragraph with the real guide. The numbers below come from the shared engine.",
    ],
    plan: { p: 10000, m: 0, r: 7, y: 30, f: 12 },
  },
  {
    slug: "200-a-month-for-40-years",
    title: "$200 a Month for 40 Years",
    description: "Placeholder. Marketing will replace this description for $200 a month invested for 40 years.",
    subhead: "Placeholder. The same monthly deposit, given ten more years.",
    paragraphs: [
      "Placeholder for marketing. This page is the longer $200 a month scenario. Replace this paragraph with the real guide. The numbers below come from the shared engine.",
    ],
    plan: { p: 0, m: 200, r: 7, y: 40, f: 12 },
  },
];

export function findScenario(slug) {
  return scenarios.find((scenario) => scenario.slug === slug) || null;
}

export function scenarioPath(slug) {
  return `/${slug}`;
}
