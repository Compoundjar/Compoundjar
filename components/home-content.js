import { footerPages } from "../content/footer.js";
import { scenarios, scenarioPath } from "../content/scenarios.js";
import {
  aboutLine,
  contentUpdated,
  contentUpdatedLabel,
  examples,
  faqs,
  formula,
  howToSteps,
  pageDisclaimer,
  returnSection,
  ruleRows,
  scenarioNote,
} from "../content/home.js";

function MoneyTable({ caption, rows }) {
  return (
    <div className="year-wrap">
      <table>
        <caption className="chart-cap">{caption}</caption>
        <thead>
          <tr>
            <th scope="col">Plan</th>
            <th scope="col">Balance</th>
            <th scope="col">You put in</th>
            <th scope="col">Interest</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td>{row.balance}</td>
              <td>{row.contributed}</td>
              <td>{row.interest}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function HomeContent() {
  return (
    <div className="app">
      <div className="content" id="content">
        <h2>How to use this calculator</h2>
        <ol>
          {howToSteps.map((step) => (
            <li key={step.title}><strong>{step.title}.</strong> {step.body}</li>
          ))}
        </ol>
        <p>Open Advanced to switch yearly, quarterly, monthly, or daily compounding. Monthly is the default. The result updates as you move a slider. There is no calculate button.</p>

        <h2>The compound interest formula</h2>
        {formula.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <p className="eq">{formula.lump}</p>
        <ul>
          {formula.variables.map((line) => <li key={line}>{line}</li>)}
        </ul>
        {formula.after.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <p className="eq">{formula.annuity}</p>
        {formula.timing.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}

        <h2>Worked examples</h2>
        <p>Every balance below is computed with the same engine as the calculator, rounded to the nearest dollar.</p>
        <h3>A $10,000 lump sum at 7%</h3>
        <MoneyTable caption={examples.lump.caption} rows={examples.lump.rows} />
        <h3>$200, $500, or $1,000 a month</h3>
        <MoneyTable caption={examples.monthly.caption} rows={examples.monthly.rows} />
        <h3>Starting at 25 versus 35</h3>
        <MoneyTable caption={examples.waiting.caption} rows={examples.waiting.rows} />
        <p>{examples.waiting.note}</p>
        <h3>Daily, monthly, and yearly compounding</h3>
        <MoneyTable caption={examples.frequency.caption} rows={examples.frequency.rows} />
        <p>{examples.frequency.note}</p>

        <h2>What return should I use?</h2>
        {returnSection.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        <ul className="src-list">
          {returnSection.sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} rel="noopener noreferrer">{source.name}</a>
            </li>
          ))}
        </ul>

        <h2>Rule of 72</h2>
        <p>For a lump sum and no deposits, years to double is about 72 divided by the annual percent. It is a shortcut, not this calculator&apos;s full formula. Deposits change the result.</p>
        <div className="year-wrap">
          <table>
            <caption className="chart-cap">Rule of 72 doubling times.</caption>
            <thead>
              <tr><th scope="col">Rate</th><th scope="col">Years to double</th></tr>
            </thead>
            <tbody>
              {ruleRows.map((row) => (
                <tr key={row.rate}><th scope="row">{row.rate}</th><td>{row.years}</td></tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 id="scenarios">Popular scenarios</h2>
        {scenarios.length ? (
          <ul>
            {scenarios.map((scenario) => (
              <li key={scenario.slug}>
                <a href={scenarioPath(scenario.slug)}>{scenario.title}</a>
              </li>
            ))}
          </ul>
        ) : (
          <p>{scenarioNote}</p>
        )}

        <h2 id="faqs">FAQs</h2>
        <div className="faq">
          {faqs.map((faq) => (
            <div key={faq.q}>
              <h3>{faq.q}</h3>
              <p>{faq.a}</p>
            </div>
          ))}
        </div>

        <p className="updated">
          Updated <time dateTime={contentUpdated}>{contentUpdatedLabel}</time>. {aboutLine}
        </p>
        <p className="page-note">{pageDisclaimer}</p>
        {footerPages.length ? (
          <ul>
            {footerPages.map((page) => (
              <li key={page.href}><a href={page.href}>{page.label}</a></li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>
  );
}
