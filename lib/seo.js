import { SHARE_DESCRIPTION, planSearchParams, readSrc } from "./plan.js";

export const CANONICAL_URL = "https://compoundjar.com/";

export const HOME_TITLE =
  "Compound Interest Calculator: Free, Monthly Contributions | Compound Jar";

export const HOME_DESCRIPTION =
  "Free compound interest calculator with monthly deposits. See what your money becomes in 10, 20, or 30 years. No login. Just keep compounding.";

export const TWITTER_SITE = "@compound_jar";

export function buildPageMeta({ model, plan, origin, src = "", indexable, canonical = CANONICAL_URL, title = HOME_TITLE, description = HOME_DESCRIPTION, path = "/" }) {
  const params = planSearchParams(plan, { src });
  const imageParams = planSearchParams(plan);
  const pagePath = path.startsWith("/") ? path : `/${path}`;
  const ogUrl = pagePath === "/"
    ? `${origin}/?${params.toString()}`
    : `${origin}${pagePath}${src ? `?src=${encodeURIComponent(src)}` : ""}`;
  return {
    title,
    description,
    canonical,
    robots: indexable ? "index, follow" : "noindex, follow",
    ogTitle: pagePath === "/" ? model.title : title,
    ogDescription: pagePath === "/" ? SHARE_DESCRIPTION : description,
    ogUrl,
    image: `${origin}/og?${imageParams.toString()}`,
    imageAlt: model.imageHeadline,
  };
}

export function readPageSrc(source) {
  return readSrc(source);
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

export function buildScenarioJsonLd({ crumbs, faqs }) {
  const graph = [
    {
      "@type": "BreadcrumbList",
      itemListElement: crumbs.map((crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: crumb.item,
      })),
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
