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

- Inputs: starting amount, monthly deposit, yearly return, years, and compounding frequency. Results update as you move a slider. Slider travel is piecewise: most of the track covers everyday amounts (about $0–$100K to start, $0–$5K a month, and 0–15%), and the rest reaches $50M, $100K a month, and 100%. Years run 1–50 on the slider. A typed or linked year can still be up to 80. The big total stays pinned while you scroll to the sliders. Millions under $10M show two decimals ($1.02M) and drop a trailing .0. Larger totals use a short form such as $2.71B.
- Query params: `p`, `m`, `r`, `y`, `f`. Missing params use the defaults ($5,000, $800/month, 7%, 30 years, monthly), which the engine totals at $1,016,559. The big total and the preview image show that as $1.02M.
- **Lock in this plan** shares a link tagged `src=share`, including when the visitor arrived from another `src`. Marketing links use their own values (`tt-01`, `ig-01`, `x-01`, `yt-01`, `tt-bio`, `ig-bio`, `x-bio`, `rd-01`, `ph`). `src` is not part of the canonical URL. On the free analytics plan, visits are reported as `/src/{value}` so the Pages panel can split them. Custom events also send `src` for a paid plan. An old `s=1` link is treated as `src=share`.
- `/og` draws the link-preview image for the same numbers. Crawlers get the title, description, and image in the HTML. They do not need JavaScript.
- The document title and meta description stay the homepage SEO copy. `og:title`, `og:description`, and `og:url` stay specific to the plan in the URL. The canonical URL is always `https://compoundjar.com/`.

## Deploy

Import this repo in Vercel. Next.js is detected from `package.json`. No environment variables are required. After the project is connected, each push to a pull request branch gets a preview deployment. The preview URL shows up on the pull request checks.

After the first deployment:

1. Enable **Web Analytics** in the project dashboard. The page calls `track()` for `lock_plan_tap`, `share_copy`, `calendar_add`, and `scenario_page_view` (scenario pages only). On the Hobby plan those custom events are not stored. Page views and referrers are. The script rewrites a visit with `src` to `/src/{value}`, and a visit with no `src` but a known AI referrer to `/ai/{slug}`, because the Pages panel drops query strings. Custom events start recording if the project moves to Pro or Enterprise. Nothing else has to change in the code.
2. Add `compoundjar.com`. `www.compoundjar.com` already 301s to the apex.
3. When the domain answers, submit the homepage to IndexNow:

```bash
npm run indexnow
```

`npm run indexnow -- --dry-run` prints the payload and does not send it. The key file is `public/6b9f300eee51ff9d82164cdd73f3226d.txt`.

Search Console and Bing Webmaster Tools are separate dashboard steps.

`*.vercel.app` preview hosts send `noindex, follow`. The production domain and localhost stay indexable.

## Editing copy

- Words on the homepage: `content/home.js`. Projection totals, including the default plan, are computed there from `lib/plan.js`. The visible date is `contentUpdatedLabel` (October 10, 2026).
- Social profiles for Organization `sameAs`: `content/social.js`.
- Scenario pages live in `content/scenarios.js`. `app/[slug]/page.js` renders one curated plan per slug, with its own canonical URL and a `scenario_page_view` event. Do not add a page for a share link. The sitemap includes the five launch slugs.
- Footer pages are About, Methodology, Privacy, and Disclaimer. Methodology repeats the homepage formula section. Each page shows the last-updated date.
- Analytics pageviews keep the path plus `src` and drop `p`, `m`, `r`, `y`, and `f` before they are sent. A homepage visit with `src` is reported as `/src/{value}`. A scenario visit with `src` is reported as `/{slug}/src/{value}`.

## Lighthouse

A throttled mobile run of the production build on localhost scored 97 performance, 100 accessibility, 100 best practices, and 100 SEO. Largest Contentful Paint was 2.4s, cumulative layout shift was 0.008, and total blocking time was 86ms.

## Analytics hosts

AI referrers matched today: chatgpt.com, chat.openai.com, perplexity.ai, gemini.google.com, copilot.microsoft.com, claude.ai, plus a `utm_source` equal to that host or slug. `utm_source`, `utm_medium`, and `utm_campaign` stay on the real URL.
