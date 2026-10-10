/**
 * Footer page copy. Placeholder until marketing replaces it.
 * The visible "Last updated" date comes from content/home.js.
 */
export const staticPages = {
  about: {
    href: "/about",
    title: "About",
    description: "Placeholder about page for Compound Jar. Marketing will replace this description.",
    paragraphs: [
      "Placeholder for marketing. Compound Jar is a free compound interest calculator. There is no account. Say who publishes it and why, in this space.",
      "Placeholder for marketing. Add a short note about the people or company behind the calculator. Do not invent a personal author here.",
    ],
  },
  methodology: {
    href: "/methodology",
    title: "Methodology",
    description: "Placeholder methodology page. Marketing will replace this description.",
    paragraphs: [
      "Placeholder for marketing. Describe how the calculator treats deposits, compounding, and rounding. The homepage already states the formula the engine uses: end-of-month deposits and one unchanging rate.",
      "Placeholder for marketing. Add any extra notes about what is left out, such as taxes, fees, and inflation, once the wording is final.",
    ],
  },
  privacy: {
    href: "/privacy",
    title: "Privacy",
    description: "Placeholder privacy page. Marketing will replace this description.",
    paragraphs: [
      "Placeholder for marketing. Explain what the site does and does not store. The calculator keeps a plan in the URL and in the visitor's calendar file. It does not ask for an account.",
      "Placeholder for marketing. Describe Vercel Web Analytics in the final privacy wording: page views and referrers on the free plan, and custom events only if the project is on a paid plan.",
    ],
  },
  disclaimer: {
    href: "/disclaimer",
    title: "Disclaimer",
    description: "Placeholder disclaimer page. Marketing will replace this description.",
    paragraphs: [
      "Educational only, not financial advice. A projection is not a promise. Returns are not guaranteed.",
      "Placeholder for marketing. Add any further disclaimer language here. The sentence above is the same short disclaimer shown on the calculator.",
    ],
  },
};

export const staticPageList = Object.values(staticPages);
