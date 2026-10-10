import { headers } from "next/headers";
import { SiteFooter } from "./site-footer.js";
import { isPreviewHost, requestHost } from "../lib/http.js";

export async function infoMetadata(page) {
  const headerList = await headers();
  const indexable = !isPreviewHost(requestHost(headerList));
  return {
    title: { absolute: `${page.title} | Compound Jar` },
    description: page.description,
    alternates: { canonical: `https://compoundjar.com${page.href}` },
    robots: { index: indexable, follow: true },
  };
}

export function InfoPage({ page }) {
  return (
    <>
      <a className="skip" href="#content">Skip to content</a>
      <div className="app plain">
        <header className="top">
          <a className="brand" href="/">
            <span className="brand-name">Compound Jar</span>
          </a>
        </header>
        <article className="content" id="content">
          <h1>{page.title}</h1>
          {page.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </article>
      </div>
      <SiteFooter />
    </>
  );
}
