import { footerPages } from "../content/footer.js";
import { contentUpdated, contentUpdatedLabel } from "../content/home.js";

export function SiteFooter() {
  return (
    <div className="app plain">
      <div className="content">
        <p className="updated">
          Last updated <time dateTime={contentUpdated}>{contentUpdatedLabel}</time>.
        </p>
        <ul>
          <li><a href="/">Calculator</a></li>
          {footerPages.map((page) => (
            <li key={page.href}><a href={page.href}>{page.label}</a></li>
          ))}
        </ul>
      </div>
    </div>
  );
}
