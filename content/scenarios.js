/**
 * Curated scenario pages for a follow-up.
 * Do not generate these from share links.
 *
 * When an entry is added, also add app/[slug]/page.js that looks the slug
 * up with findScenario() and renders the shared calculator. Each page should
 * set its own canonical to https://compoundjar.com/{slug} and be the only
 * place that fires a future scenario_page_view event.
 *
 * Shape:
 * { slug: "500-a-month-for-30-years", title: "...", description: "...", plan: { p, m, r, y, f } }
 */
export const scenarios = [];

export function findScenario(slug) {
  return scenarios.find((scenario) => scenario.slug === slug) || null;
}

export function scenarioPath(slug) {
  return `/${slug}`;
}
