import { HOME_SHARE_DESCRIPTION, HOME_SHARE_TITLE, formatShareStamp, planSearchParams, readSrc } from "./plan.js";

export const CANONICAL_URL = "https://compoundjar.com/";

export const HOME_TITLE =
  "Compound Interest Calculator: Path to $1M | Compound Jar";

export const HOME_DESCRIPTION =
  "Free compound interest calculator: enter what you have and what you can save, and see if you can become a millionaire. No login. Just keep compounding.";

export const WEBAPP_DESCRIPTION =
  "Free compound interest calculator that shows how long it takes to reach $1 million and how much to invest each month to get there. Monthly deposits, no login.";

export const TWITTER_SITE = "@compound_jar";

export function buildPageMeta({ model, plan, origin, src = "", shareDate = null, preview = false, indexable, canonical = CANONICAL_URL, title = HOME_TITLE, description = HOME_DESCRIPTION, path = "/" }) {
  const stamp = shareDate ? (typeof shareDate === "string" ? shareDate : formatShareStamp(shareDate)) : "";
  const imageParams = planSearchParams(plan, { shareDate: stamp || null });
  const pageParams = planSearchParams(plan, { src, shareDate: stamp || null });
  const pagePath = path.startsWith("/") ? path : `/${path}`;
  const scenarioQuery = new URLSearchParams();
  if (src) scenarioQuery.set("src", src);
  if (preview && stamp) scenarioQuery.set("t", stamp);
  const scenarioSearch = scenarioQuery.toString();
  const ogUrl = pagePath === "/"
    ? (preview ? `${origin}/?${pageParams.toString()}` : `${origin}/`)
    : `${origin}${pagePath}${scenarioSearch ? `?${scenarioSearch}` : ""}`;
  return {
    title,
    description,
    canonical,
    robots: indexable ? "index, follow" : "noindex, follow",
    ogTitle: pagePath === "/" ? (preview ? model.title : HOME_SHARE_TITLE) : title,
    ogDescription: pagePath === "/" ? (preview ? model.description : HOME_SHARE_DESCRIPTION) : description,
    ogUrl,
    image: `${origin}/og?${imageParams.toString()}`,
    imageAlt: model.imageAlt,
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
      description: WEBAPP_DESCRIPTION,
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
