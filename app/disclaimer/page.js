import { InfoPage, infoMetadata } from "../../components/info-page.js";
import { staticPages } from "../../content/pages.js";

const page = staticPages.disclaimer;

export function generateMetadata() {
  return infoMetadata(page);
}

export default function DisclaimerPage() {
  return <InfoPage page={page} />;
}
