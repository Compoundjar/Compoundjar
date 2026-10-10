import { Inline } from "./inline.js";
import { DataTable } from "./data-table.js";
import { footerPages } from "../content/footer.js";
import {
  contentUpdated,
  contentUpdatedLabel,
  depositColumnLabel,
  faqs,
  formulaParagraphs,
  frequencyNote,
  frequencyRows,
  howToSteps,
  lumpNote,
  lumpRows,
  monthlyNote,
  monthlyRows,
  pageDisclaimer,
  popularScenarios,
  returnBullets,
  returnCaveat,
  ruleRows,
  sources,
  todayDollars,
  waitingNote,
  waitingRows,
} from "../content/home.js";

export function HomeContent() {
  return (
    <div className="app">
      <div className="content" id="content">
        <h2>How to use this calculator</h2>
        <p>It takes about ten seconds. Drag a slider or type a number, and the jar refills instantly.</p>
        <ol>
          {howToSteps.map((step) => (
            <li key={step.title}>
              <strong>{step.title}.</strong> <Inline text={step.body} />
            </li>
          ))}
        </ol>
        <p>
          The big number at the top is your total. The chart shows how much of it is your deposits and how much is growth. When you like the plan, tap <strong>Lock in this plan</strong>. You&apos;ll get a link you can share or bookmark, plus a monthly calendar reminder to make your deposit.
        </p>

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
        <p><Inline text={formulaParagraphs.otherFrequency} /></p>

        <h2>Worked examples</h2>
        <p>All examples use 7% a year, compounded monthly, unless noted.</p>

        <h3>$10,000 lump sum, no extra deposits</h3>
        <DataTable
          headers={["Years", "Ending balance", "Growth"]}
          rows={lumpRows.map((row) => [row.label, row.balance, row.growth])}
        />
        <p>{lumpNote}</p>

        <h3>Monthly deposits for 30 years (starting from $0)</h3>
        <DataTable
          headers={["Monthly deposit", "You put in", "Ending balance", "Growth"]}
          rows={monthlyRows.map((row) => [row.label, row.contributed, row.balance, row.growth])}
        />
        <p>{monthlyNote}</p>

        <h3>Starting at 25 vs 35: the cost of waiting</h3>
        <p>$300 a month until age 65:</p>
        <DataTable
          headers={["Start age", "Years", "You put in", "Balance at 65"]}
          rows={waitingRows.map((row) => [row.label, row.years, row.contributed, row.balance])}
        />
        <p><Inline text={waitingNote} /></p>

        <h3>Daily vs monthly vs yearly compounding</h3>
        <p>Same 7% rate, 30 years:</p>
        <DataTable
          headers={["Compounding", "$10,000 lump sum", depositColumnLabel]}
          rows={frequencyRows.map((row) => [row.label, row.lump, row.deposits])}
        />
        <p><Inline text={frequencyNote} /></p>

        <h2 id="returns">What return should I use?</h2>
        <p>No one knows future returns, so treat the rate as a &quot;what if.&quot; Try a few. These real-world numbers can help you choose a range:</p>
        <ul>
          {returnBullets.map((bullet) => (
            <li key={bullet.slice(0, 24)}><Inline text={bullet} /></li>
          ))}
        </ul>
        <p>{todayDollars}</p>
        <p>{returnCaveat}</p>

        <h2>Rule of 72: how long to double your money</h2>
        <p>Divide 72 by your yearly return to estimate how many years it takes your money to double. At 7%, 72 ÷ 7 ≈ 10.3 years.</p>
        <DataTable
          headers={["Yearly return", "Rule of 72 estimate", "Exact (compounded yearly)"]}
          rows={ruleRows.map((row) => [row.rate, row.estimate, row.exact])}
        />
        <p>The shortcut is closest around 8%. It&apos;s a quick mental check, not a replacement for running the numbers above.</p>

        <h2 id="scenarios">Popular scenarios</h2>
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
          {footerPages.map((page, index) => (
            <span key={page.href}>
              {index ? " · " : null}
              <a href={page.href}>{page.label}</a>
            </span>
          ))}
        </p>
        <p className="page-note">{pageDisclaimer}</p>
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
