import { InfoPage, infoMetadata } from "../../components/info-page.js";
import { staticPages } from "../../content/pages.js";

const page = staticPages.about;

export function generateMetadata() {
  return infoMetadata(page);
}

export default function AboutPage() {
  return <InfoPage page={page} />;
}
