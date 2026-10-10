import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { CalculatorView } from "../../components/calculator-view.js";
import { ClientBoot } from "../../components/client-boot.js";
import { JsonLd } from "../../components/json-ld.js";
import { ScenarioArticle } from "../../components/scenario-article.js";
import { SiteFooter } from "../../components/site-footer.js";
import { faqPlain } from "../../content/home.js";
import { findScenario, scenarios } from "../../content/scenarios.js";
import { isPreviewHost, requestHost, requestOrigin } from "../../lib/http.js";
import { formatShareStamp, previewModel, readShareDate, readShareStamp, readSrc } from "../../lib/plan.js";
import { TWITTER_SITE, buildPageMeta, buildScenarioJsonLd } from "../../lib/seo.js";

export function generateStaticParams() {
  return scenarios.map((scenario) => ({ slug: scenario.slug }));
}

export async function generateMetadata({ params, searchParams }) {
  const { slug } = await params;
  const scenario = findScenario(slug);
  if (!scenario) return {};
  const query = await searchParams;
  const headerList = await headers();
  const origin = requestOrigin(headerList);
  const shareDate = readShareDate(query);
  const meta = buildPageMeta({
    model: previewModel(scenario.plan, { shareDate, origin }),
    plan: scenario.plan,
    origin,
    src: readSrc(query),
    shareDate: formatShareStamp(shareDate),
    preview: Boolean(readShareStamp(query)),
    indexable: !isPreviewHost(requestHost(headerList)),
    canonical: `https://compoundjar.com/${scenario.slug}`,
    title: scenario.title,
    description: scenario.description,
    path: `/${scenario.slug}`,
  });
  const index = meta.robots.startsWith("index");
  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: { canonical: meta.canonical },
    robots: { index, follow: true },
    openGraph: {
      title: meta.ogTitle,
      description: meta.ogDescription,
      url: meta.ogUrl,
      siteName: "Compound Jar",
      type: "article",
      images: [{ url: meta.image, width: 1200, height: 630, alt: meta.imageAlt }],
    },
    twitter: {
      card: "summary_large_image",
      site: TWITTER_SITE,
      title: meta.ogTitle,
      description: meta.ogDescription,
      images: [meta.image],
    },
  };
}

export default async function ScenarioPage({ params }) {
  const { slug } = await params;
  const scenario = findScenario(slug);
  if (!scenario) notFound();
  const headerList = await headers();
  const origin = requestOrigin(headerList);
  const faqs = scenario.faqs.map((faq) => ({ q: faq.q, a: faqPlain(faq) }));
  return (
    <>
      <CalculatorView
        plan={scenario.plan}
        origin={origin}
        title={scenario.h1}
        subhead={scenario.subhead}
        scenario={scenario.slug}
        tableOpen
      />
      <ScenarioArticle scenario={scenario} />
      <SiteFooter />
      <JsonLd
        data={buildScenarioJsonLd({
          crumbs: [
            { name: "Home", item: "https://compoundjar.com/" },
            { name: scenario.crumb, item: `https://compoundjar.com/${scenario.slug}` },
          ],
          faqs,
        })}
      />
      <ClientBoot />
    </>
  );
}
