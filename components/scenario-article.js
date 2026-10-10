import { Inline } from "./inline.js";
import { DataTable } from "./data-table.js";
import { contentUpdated, contentUpdatedLabel } from "../content/home.js";

export function ScenarioArticle({ scenario }) {
  return (
    <div className="app">
      <article className="content">
        <p className="crumbs">
          <a href="/">Home</a>
          {" › "}
          {scenario.crumb}
        </p>
        <p className="short"><strong>{scenario.short}</strong></p>
        {scenario.intro.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        {scenario.sections.map((section) => (
          <section key={section.heading}>
            <h2>{section.heading}</h2>
            {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            {section.table ? (
              <DataTable
                headers={section.table.headers}
                rows={section.table.rows}
                bold={section.table.bold}
              />
            ) : null}
            {section.after ? <p>{section.after}</p> : null}
          </section>
        ))}
        <h2>FAQs</h2>
        <div className="faq">
          {scenario.faqs.map((faq) => (
            <div key={faq.q}>
              <h3>{faq.q}</h3>
              <p><Inline text={faq.a} /></p>
            </div>
          ))}
        </div>
        <p>
          <a href={scenario.links[0].href}>{scenario.links[0].label}</a>
        </p>
        <p>
          Or open the full <a href={scenario.links[1].href}>{scenario.links[1].label}</a>
          {" "}
          and find your own path to $1M.
        </p>
        <p className="updated">
          Last updated <time dateTime={contentUpdated}>{contentUpdatedLabel}</time>
          {" · "}
          Projections, not promises. 7% is an assumption, not a guarantee. Assumes a steady yearly return, monthly compounding and end-of-month deposits, before taxes, fees and inflation. Educational only, not financial advice. <a href="/methodology">Methodology</a>
        </p>
      </article>
    </div>
  );
}
