import { headers } from "next/headers";
import { CalculatorView } from "../components/calculator-view.js";
import { ClientBoot } from "../components/client-boot.js";
import { HomeContent } from "../components/home-content.js";
import { JsonLd } from "../components/json-ld.js";
import { faqPlain, faqs } from "../content/home.js";
import { sameAs } from "../content/social.js";
import { isPreviewHost, requestHost, requestOrigin } from "../lib/http.js";
import { formatShareStamp, hasSharePreview, parsePlan, previewModel, readShareDate, readSrc } from "../lib/plan.js";
import { TWITTER_SITE, buildJsonLd, buildPageMeta } from "../lib/seo.js";

export async function generateMetadata({ searchParams }) {
  const params = await searchParams;
  const headerList = await headers();
  const origin = requestOrigin(headerList);
  const plan = parsePlan(params);
  const shareDate = readShareDate(params);
  const meta = buildPageMeta({
    model: previewModel(plan, { shareDate, origin }),
    plan,
    origin,
    src: readSrc(params),
    shareDate: formatShareStamp(shareDate),
    preview: hasSharePreview(params),
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
  return (
    <>
      <CalculatorView plan={plan} origin={origin} />
      <HomeContent />
      <JsonLd data={buildJsonLd({ faqs: faqs.map((faq) => ({ q: faq.q, a: faqPlain(faq) })), sameAs })} />
      <ClientBoot />
    </>
  );
}
