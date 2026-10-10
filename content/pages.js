/**
 * Footer pages. The methodology section is the same formula text as the homepage.
 */
import { formulaParagraphs, pageDisclaimer, privacyAnswer } from "./home.js";

export const staticPages = {
  about: {
    href: "/about",
    title: "About",
    description: "Compound Jar is a free compound interest calculator published by Sean. No account.",
    paragraphs: [
      "Compound Jar is a free compound interest calculator. Sean publishes it. There is no login and no account.",
      "The numbers you try stay in the link. The methodology page is the formula the calculator uses. The privacy page says what a visit records.",
    ],
  },
  methodology: {
    href: "/methodology",
    title: "Methodology",
    description: "How Compound Jar compounds a balance: end-of-month deposits and one yearly rate.",
    paragraphs: [
      formulaParagraphs.intro,
      formulaParagraphs.lumpLead,
      formulaParagraphs.lump,
      ...formulaParagraphs.variables,
      formulaParagraphs.annuityLead,
      formulaParagraphs.annuity,
      formulaParagraphs.timing,
      formulaParagraphs.worked,
      formulaParagraphs.rearrange,
      "When you pick a compounding frequency other than monthly, Compound Jar converts the yearly rate into an equivalent monthly growth factor, (1 + r/n)^(n/12), so your monthly deposits still line up.",
      formulaParagraphs.daily,
    ],
  },
  privacy: {
    href: "/privacy",
    title: "Privacy",
    description: "Compound Jar does not save your plan. Analytics records the page path and source tag, not the plan numbers.",
    paragraphs: [
      privacyAnswer,
      "The preview image and the calendar file are built for that single request. The app does not write them to a database. A shared link always uses src=share and does not include the marketing tag you arrived with.",
    ],
  },
  disclaimer: {
    href: "/disclaimer",
    title: "Disclaimer",
    description: "Compound Jar is an educational calculator, not financial advice.",
    paragraphs: [pageDisclaimer],
  },
};

export const staticPageList = Object.values(staticPages);
