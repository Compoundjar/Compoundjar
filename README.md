# Compound Jar

Free compound interest calculator for [compoundjar.com](https://compoundjar.com/). No account, no database. The plan lives in the URL.

## Local development

```bash
npm install
npm run dev
```

Open http://localhost:3000. `npm run dev` bundles `client/main.js` into `public/calculator.js`, then starts Next.js.

```bash
npm test
npm run build
npm start
```

`public/calculator.js` and `lib/client-asset.js` are generated. Do not commit them.

## What the page does

- Inputs: starting amount, monthly deposit, yearly return, years, and compounding frequency. Results update as you move a slider.
- Query params: `p`, `m`, `r`, `y`, `f`. Missing params use the defaults ($1,000, $200/month, 7%, 30 years, monthly).
- **Lock in this plan** shares a link tagged `s=1`, and offers a monthly calendar reminder (`.ics` plus Google Calendar).
- `/og` draws the link-preview image for the same numbers. Crawlers get the title, description, and image in the HTML. They do not need JavaScript.
- The document title and meta description stay the homepage SEO copy. `og:title`, `og:description`, and `og:url` stay specific to the plan in the URL. The canonical URL is always `https://compoundjar.com/`.

## Deploy

Import this repo in Vercel. Next.js is detected from `package.json`. No environment variables are required.

After the first deployment:

1. Enable **Web Analytics** in the project dashboard. The page calls `track()` for `lock_plan_tap`, `share_copy`, and `calendar_add`. On the Hobby plan those custom events are not stored. Page views and referrers are. The script rewrites share visits to `/shared?s=1` and known AI referrers to `/ai/{slug}` so they show up in the Pages panel, which drops query strings. Custom events start recording if the project moves to Pro or Enterprise. Nothing else has to change in the code.
2. Add `compoundjar.com`. `www.compoundjar.com` already 301s to the apex.
3. When the domain answers, submit the homepage to IndexNow:

```bash
npm run indexnow
```

`npm run indexnow -- --dry-run` prints the payload and does not send it. The key file is `public/6b9f300eee51ff9d82164cdd73f3226d.txt`.

Search Console and Bing Webmaster Tools are separate dashboard steps.

`*.vercel.app` preview hosts send `noindex, follow`. The production domain and localhost stay indexable.

## Editing copy

- Words on the homepage: `content/home.js`. Dollar amounts in the examples and FAQs are computed in that file from `lib/plan.js`. Do not paste balances by hand.
- Social profiles for Organization `sameAs`: `content/social.js`.
- Scenario pages are not built yet. Add an entry to `content/scenarios.js`, then add `app/[slug]/page.js` that looks the slug up with `findScenario()`. Give that page its own canonical and, later, a `scenario_page_view` event. The sitemap already includes whatever is in the list.
- Footer pages (About, Methodology, Privacy) are not built yet. Add `{ href, label }` entries to `content/footer.js` when those routes exist.

## Lighthouse

A throttled mobile run of the production build on localhost scored 99 performance, 100 accessibility, 100 best practices, and 100 SEO. Largest Contentful Paint was 2.0s, cumulative layout shift was 0.008, and total blocking time was 51ms.

## Analytics hosts

AI referrers matched today: chatgpt.com, chat.openai.com, perplexity.ai, gemini.google.com, copilot.microsoft.com, claude.ai, plus a `utm_source` equal to that host or slug. `utm_source`, `utm_medium`, and `utm_campaign` stay on the real URL.
