import { chartMarkup } from "../lib/chart.js";
import { odometerHtml } from "../lib/odometer.js";
import {
  FREQUENCIES,
  RANGES,
  answerSentence,
  chartCaption,
  formatFull,
  formatHeadline,
  formatInput,
  formatMoney,
  formatRate,
  nextMonthStart,
  planKey,
  planSearchParams,
  previewModel,
  project,
  sliderMax,
  sliderPercent,
  sliderPos,
  totalFontSize,
  yearRows,
  yearWord,
} from "../lib/plan.js";

const FREQ_LABELS = [
  [1, "Yearly"],
  [4, "Quarterly"],
  [12, "Monthly"],
  [365, "Daily"],
];

function Logo() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 18c5 0 9-3 12-10" />
      <path d="M12 7h5v5" />
    </svg>
  );
}

export function CalculatorView({ plan, origin, title, subhead, scenario, tableOpen = false }) {
  const result = project(plan);
  const model = previewModel(plan);
  const years = plan.y;
  const host = origin.replace(/^https?:\/\//, "");
  const shareQuery = planSearchParams(plan, { src: "share" }).toString();
  const shown = formatHeadline(result.bal);
  const icsQuery = planSearchParams(plan);
  icsQuery.set("d", nextMonthStart());
  const rows = yearRows(result);
  const chart = chartMarkup(result);

  return (
    <>
      <a className="skip" href="#calculator">Skip to the calculator</a>
      <div className="app">
        <header className="top">
          <a className="brand" href="/">
            <div className="logo"><Logo /></div>
            <span>
              <span className="brand-name">Compound Jar</span>
              <span className="brand-tag">just keep compounding</span>
            </span>
          </a>
          <div className="pill">Free · no sign-up</div>
        </header>

        <section
          id="calculator"
          aria-labelledby="page-title"
          data-scenario={scenario || undefined}
          data-plan={scenario ? planKey(plan) : undefined}
        >
          <h1 id="page-title">{title || "Compound Interest Calculator"}</h1>
          <p className="subhead">{subhead || "See what your money becomes. Just keep compounding."}</p>

          <div className="pin" id="pin" aria-live="polite">
            <div className="eyebrow">Your money could grow to</div>
            <output
              className="big"
              id="big"
              name="balance"
              htmlFor="p-n m-n r-n y-n"
              data-value={shown}
              aria-label={shown}
              style={{ fontSize: `${totalFontSize(shown)}px` }}
              dangerouslySetInnerHTML={{ __html: odometerHtml(shown) }}
            />
            <div className="sub">
              after <b id="yrsLbl">{years} {yearWord(years)}</b> at <b id="rateLbl">{formatRate(plan.r)}%</b> a year
            </div>
          </div>

          <section className="result" aria-live="polite">
            <div className="split">
              <div className="chip">
                <div className="k"><span className="dot" style={{ background: "var(--sand-d)" }} />You put in</div>
                <output className="v" id="contrib" htmlFor="p-n m-n">{model.contributed}</output>
              </div>
              <div className="chip int">
                <div className="k"><span className="dot" style={{ background: "var(--coral)" }} />Interest earned</div>
                <output className="v" id="interest" htmlFor="p-n m-n r-n y-n">{model.interest}</output>
              </div>
            </div>
            <p className="answer" id="answer">{answerSentence(plan, result)}</p>
          </section>

          <figure className="card">
            <div className="chart-head">
              <h2 className="chart-title">Growth by year</h2>
              <div className="legend">
                <span><i className="dot" style={{ background: "var(--sand)" }} />Contributions</span>
                <span><i className="dot" style={{ background: "var(--coral)" }} />Interest</span>
              </div>
            </div>
            <svg
              className="chart"
              id="chart"
              viewBox="0 0 318 176"
              role="img"
              aria-label="Stacked bar chart of balance by year"
              dangerouslySetInnerHTML={{ __html: chart }}
            />
            <figcaption className="chart-cap" id="chart-cap">{chartCaption(plan, result)}</figcaption>
          </figure>

          <details className="table-toggle card" id="year-details" open={tableOpen || undefined}>
            <summary>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
              Show year-by-year table
            </summary>
            <div className="year-wrap">
              <table>
                <caption className="chart-cap">End-of-year balance for this plan. Deposits are added at the end of each month.</caption>
                <thead>
                  <tr>
                    <th scope="col">Year</th>
                    <th scope="col">Balance</th>
                    <th scope="col">You put in</th>
                    <th scope="col">Interest</th>
                  </tr>
                </thead>
                <tbody id="year-body">
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
          </details>

          <section className="card inputs" aria-label="Plan inputs">
            <Field kind="p" label="Starting amount" plan={plan} prefix="$" />
            <Field kind="m" label="Monthly contribution" plan={plan} prefix="$" />
            <Field kind="r" label="Annual return" plan={plan} suffix="%" ticks />
            <Field kind="y" label="Years" plan={plan} suffix="yrs" />
            <details className="adv" id="adv" {...(plan.f !== 12 ? { open: true } : {})}>
              <summary>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
                Advanced
              </summary>
              <p className="adv-label">Interest compounds</p>
              <div className="seg" id="seg">
                {FREQ_LABELS.map(([value, label]) => (
                  <button key={value} type="button" data-f={value} className={plan.f === value ? "on" : undefined}>
                    {label}
                  </button>
                ))}
              </div>
            </details>
          </section>

          <p className="disc">These are projections, not promises. Real returns go up and down and aren&apos;t guaranteed. Assumes a steady rate and deposits at the end of each month, before taxes, fees and inflation.</p>
        </section>
      </div>

      <div className="cta-wrap">
        <a className="cta" id="lock" href="#sheet">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <rect x="4" y="11" width="16" height="10" rx="2.5" />
            <path d="M8 11V8a4 4 0 0 1 8 0v3" />
          </svg>
          Lock in this plan
        </a>
      </div>

      <a className="scrim" id="scrim" href="#calculator" aria-label="Close" />
      <div className="sheet" id="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-t">
        <div className="grab" />
        <h2 id="sh-t">Lock in this plan</h2>
        <p className="lead">Save this plan as a link you can share or come back to, and get a reminder each month to make your deposit.</p>
        <div className="plan">
          <div>
            <div className="pv" id="sh-total">{shown}</div>
            <div className="pk" id="sh-yrs">in {years} {yearWord(years)}</div>
          </div>
            <div className="pp" id="sh-plan">
            {formatMoney(plan.p)} to start<br />
            {formatFull(plan.m)} / month<br />
            {formatRate(plan.r)}% a year
          </div>
        </div>
        <div className="step"><i>1</i>Your plan link</div>
        <div className="link">
          <code id="sh-link">{host}/?{shareQuery}</code>
          <button type="button" id="share" className="share" hidden>Share</button>
          <button type="button" id="copy">Copy</button>
        </div>
        <div className="step"><i>2</i>Monthly reminder</div>
        <div className="opts">
          <button type="button" className="opt sel" data-o="ics" aria-pressed="true">
            <span className="ic" style={{ background: "#EAF3EE" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1F6B4F" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <rect x="3.5" y="5" width="17" height="15" rx="3" />
                <path d="M3.5 10h17M8 3v4M16 3v4" />
              </svg>
            </span>
            <span><div className="t">Add to calendar</div><div className="d">A monthly .ics reminder. Works on iPhone.</div></span>
            <span className="r" />
          </button>
          <button type="button" className="opt" data-o="google" aria-pressed="false">
            <span className="ic" style={{ background: "#E8F0FE" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A73E8" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <rect x="3.5" y="5" width="17" height="15" rx="3" />
                <path d="M3.5 10h17M8 3v4M16 3v4" />
              </svg>
            </span>
            <span><div className="t">Google Calendar</div><div className="d">Opens a monthly event. Handy on Android.</div></span>
            <span className="r" />
          </button>
        </div>
        <a className="cta" id="confirm" href={`/reminder.ics?${icsQuery.toString()}`}>Add monthly reminder</a>
        <p className="fine">Nothing is stored on our servers. The reminder lives in your calendar.</p>
      </div>
      <div className="toast" id="toast" role="status" />
      <span hidden data-freqs={FREQUENCIES.join(",")} />
    </>
  );
}

function Field({ kind, label, plan, prefix, suffix, ticks }) {
  const value = plan[kind];
  const min = kind === "y" ? RANGES.y.min : 0;
  const pct = sliderPercent(kind, value);
  return (
    <div className="field" data-k={kind}>
      <div className="frow">
        <label htmlFor={`${kind}-r`}>{label}</label>
        <div className="num">
          {prefix ? <span className="aff">{prefix}</span> : null}
          <input
            id={`${kind}-n`}
            inputMode={kind === "r" ? "decimal" : "numeric"}
            aria-label={label}
            autoComplete="off"
            defaultValue={formatInput(kind, value)}
          />
          {suffix ? <span className="aff">{suffix === "yrs" ? "\u00a0yrs" : suffix}</span> : null}
        </div>
      </div>
      <input
        type="range"
        id={`${kind}-r`}
        min={min}
        max={sliderMax(kind)}
        step={1}
        defaultValue={sliderPos(kind, value)}
        style={{ "--p": `${pct}%` }}
        aria-label={label}
      />
      {ticks ? (
        <div className="ticks curve">
          <span style={{ left: "0%" }}>0%</span>
          <span style={{ left: "75%" }}>15%</span>
          <span style={{ left: "88%" }}>30%</span>
          <span style={{ left: "100%" }}>100%</span>
        </div>
      ) : null}
    </div>
  );
}
