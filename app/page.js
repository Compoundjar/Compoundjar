import { headers } from "next/headers";
import { CalculatorView } from "../components/calculator-view.js";
import { HomeContent } from "../components/home-content.js";
import { JsonLd } from "../components/json-ld.js";
import { faqs } from "../content/home.js";
import { sameAs } from "../content/social.js";
import { calculatorSrc } from "../lib/client-asset.js";
import { isPreviewHost, requestHost, requestOrigin } from "../lib/http.js";
import { parsePlan, previewModel, shareFlags } from "../lib/plan.js";
import { TWITTER_SITE, buildJsonLd, buildPageMeta } from "../lib/seo.js";

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const headerList = await headers();
  const origin = requestOrigin(headerList);
  const plan = parsePlan(params);
  const meta = buildPageMeta({
    model: previewModel(plan),
    plan,
    origin,
    flags: shareFlags(params),
    indexable: !isPreviewHost(requestHost(headerList)),
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
      type: "website",
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

export default async function Page({ searchParams }) {
  const params = await searchParams;
  const headerList = await headers();
  const origin = requestOrigin(headerList);
  const plan = parsePlan(params);
  const analyticsConfig = process.env.NEXT_PUBLIC_VERCEL_OBSERVABILITY_CLIENT_CONFIG || "";
  const configJson = JSON.stringify(analyticsConfig).replace(/</g, "\\u003c");
  return (
    <>
      <CalculatorView plan={plan} origin={origin} />
      <HomeContent />
      <JsonLd data={buildJsonLd({ faqs, sameAs })} />
      <script id="cj-analytics" type="application/json" dangerouslySetInnerHTML={{ __html: configJson }} />
      <script src={calculatorSrc} defer />
    </>
  );
}
