import { Inline } from "./inline.js";
import { DataTable } from "./data-table.js";
import {
  ageHeaders,
  ageNote,
  ageRows,
  contentUpdated,
  contentUpdatedLabel,
  faqs,
  formulaParagraphs,
  haveSaveHeaders,
  haveSaveRows,
  howToClose,
  howToSteps,
  intro,
  longHeaders,
  longRows,
  pageDisclaimer,
  pathNote,
  popularScenarios,
  returnBullets,
  returnCaveat,
  ruleNote,
  ruleRows,
  saveHeaders,
  saveNote,
  saveRows,
  sources,
  todayDollars,
} from "../content/home.js";

export function HomeContent() {
  return (
    <div className="app">
      <div className="content" id="content">
        <p>{intro}</p>
        <p>{pathNote}</p>

        <h2>How to use this calculator: can you become a millionaire?</h2>
        <ol>
          {howToSteps.map((step) => (
            <li key={step.title}>
              <strong>{step.title}.</strong> <Inline text={step.body} />
            </li>
          ))}
        </ol>
        <p>{howToClose}</p>

        <h2>Can I become a millionaire? Find your starting point</h2>
        <p>Time to reach $1,000,000 at an assumed 7% a year. Find what you have (rows) and what you can save (columns):</p>
        <DataTable headers={haveSaveHeaders} rows={haveSaveRows} />
        <p>
          Don&apos;t see your numbers? Enter them above. More: <a href="/can-i-become-a-millionaire">Can I become a millionaire?</a>
        </p>

        <h2>How much do I need to save each month to become a millionaire?</h2>
        <p>Starting from $0, here&apos;s the monthly deposit needed to reach $1,000,000:</p>
        <DataTable headers={saveHeaders} rows={saveRows} />
        <p><Inline text={saveNote} /></p>

        <h2>How long does it take to reach $1 million?</h2>
        <p>Starting from $0:</p>
        <DataTable headers={longHeaders} rows={longRows} />
        <p>
          More: <a href="/how-long-to-become-a-millionaire">How long to become a millionaire</a>.
        </p>

        <h2>Starting at 25 vs 35: the cost of waiting on your first million</h2>
        <p>To have $1 million by 65, starting from $0:</p>
        <DataTable headers={ageHeaders} rows={ageRows} />
        <p><Inline text={ageNote} /></p>

        <h2>The compound interest formula</h2>
        <p>{formulaParagraphs.intro}</p>
        <p>{formulaParagraphs.lumpLead}</p>
        <p className="eq">{formulaParagraphs.lump}</p>
        <ul>
          {formulaParagraphs.variables.map((line) => <li key={line}>{line}</li>)}
        </ul>
        <p>{formulaParagraphs.annuityLead}</p>
        <p className="eq">{formulaParagraphs.annuity}</p>
        <p>{formulaParagraphs.timing}</p>
        <p>{formulaParagraphs.worked}</p>
        <p>{formulaParagraphs.rearrange}</p>
        <p><Inline text={formulaParagraphs.otherFrequency} /></p>
        <p>{formulaParagraphs.daily}</p>

        <h2 id="returns">What return should I use?</h2>
        <p>Your path to $1 million depends heavily on the return you assume, and no one knows future returns. Treat the rate as a &quot;what if&quot; and try a few. These real-world numbers can help you choose a range:</p>
        <ul>
          {returnBullets.map((bullet) => (
            <li key={bullet.slice(0, 24)}><Inline text={bullet} /></li>
          ))}
        </ul>
        <p>{todayDollars}</p>
        <p>{returnCaveat}</p>

        <h2>Rule of 72: how many doublings to $1 million?</h2>
        <p>Divide 72 by your yearly return to estimate how many years it takes money to double. At 7%, 72 ÷ 7 ≈ 10.3 years. So money left alone roughly doubles three times in 30 years.</p>
        <DataTable
          headers={["Yearly return", "Rule of 72 estimate", "Exact (compounded yearly)"]}
          rows={ruleRows.map((row) => [row.rate, row.estimate, row.exact])}
        />
        <p>{ruleNote}</p>

        <h2>Popular paths to $1 million</h2>
        <ul>
          {popularScenarios.map((scenario) => (
            <li key={scenario.href}>
              <a href={scenario.href}>{scenario.label}</a>
              {scenario.blurb ? `: ${scenario.blurb}` : null}
            </li>
          ))}
        </ul>

        <h2 id="faqs">Frequently asked questions</h2>
        <div className="faq">
          {faqs.map((faq) => (
            <div key={faq.q}>
              <h3>{faq.q}</h3>
              <p><Inline text={faq.a} /></p>
            </div>
          ))}
        </div>

        <p className="updated">
          Last updated <time dateTime={contentUpdated}>{contentUpdatedLabel}</time>
          {" · "}
          Built by <a href="/about">Sean / Compound Jar</a>
          {" · "}
          <a href="/methodology">Methodology</a>
          {" · "}
          <a href="/privacy">Privacy</a>
        </p>
        <p className="page-note"><strong>Disclaimer:</strong> {pageDisclaimer}</p>
        <h2>Sources</h2>
        <ul className="src-list">
          {sources.map((source) => (
            <li key={source.url}>
              <a href={source.url} rel="noopener noreferrer">{source.name}</a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
