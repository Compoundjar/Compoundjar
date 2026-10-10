import { InfoPage, infoMetadata } from "../../components/info-page.js";
import { staticPages } from "../../content/pages.js";

const page = staticPages.methodology;

export function generateMetadata() {
  return infoMetadata(page);
}

export default function MethodologyPage() {
  return <InfoPage page={page} />;
}
