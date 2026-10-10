import { InfoPage, infoMetadata } from "../../components/info-page.js";
import { staticPages } from "../../content/pages.js";

const page = staticPages.privacy;

export function generateMetadata() {
  return infoMetadata(page);
}

export default function PrivacyPage() {
  return <InfoPage page={page} />;
}
