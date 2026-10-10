import { SHARE_DESCRIPTION, planSearchParams } from "./plan.js";

export const CANONICAL_URL = "https://compoundjar.com/";

export const HOME_TITLE =
  "Compound Interest Calculator: Free, Monthly Contributions | Compound Jar";

export const HOME_DESCRIPTION =
  "Free compound interest calculator with monthly deposits. See what your money becomes in 10, 20, or 30 years. No login. Just keep compounding.";

export const TWITTER_SITE = "@compound_jar";

export function buildPageMeta({ model, plan, origin, flags, indexable }) {
  const params = planSearchParams(plan, flags || {});
  const imageParams = planSearchParams(plan);
  return {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    canonical: CANONICAL_URL,
    robots: indexable ? "index, follow" : "noindex, follow",
    ogTitle: model.title,
    ogDescription: SHARE_DESCRIPTION,
    ogUrl: `${origin}/?${params.toString()}`,
    image: `${origin}/og?${imageParams.toString()}`,
    imageAlt: model.imageHeadline,
  };
}

export function buildJsonLd({ faqs, sameAs = [] }) {
  const graph = [
    {
      "@type": "WebApplication",
      name: "Compound Jar",
      url: CANONICAL_URL,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Any",
      description: HOME_DESCRIPTION,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
    {
      "@type": "Organization",
      name: "Compound Jar",
      url: CANONICAL_URL,
      logo: "https://compoundjar.com/icon.svg",
      ...(sameAs.length ? { sameAs } : {}),
    },
  ];
  if (faqs?.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faqs.map((faq) => ({
        "@type": "Question",
        name: faq.q,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.a,
        },
      })),
    });
  }
  return {
    "@context": "https://schema.org",
    "@graph": graph,
  };
}
