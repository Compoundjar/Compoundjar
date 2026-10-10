import { footerPages } from "../content/footer.js";
import { contentUpdated } from "../content/home.js";
import { scenarioPath, scenarios } from "../content/scenarios.js";

export default function sitemap() {
  return [
    {
      url: "https://compoundjar.com/",
      lastModified: contentUpdated,
    },
    ...scenarios.map((scenario) => ({
      url: `https://compoundjar.com${scenarioPath(scenario.slug)}`,
      lastModified: contentUpdated,
    })),
    ...footerPages.map((page) => ({
      url: `https://compoundjar.com${page.href}`,
      lastModified: contentUpdated,
    })),
  ];
}
