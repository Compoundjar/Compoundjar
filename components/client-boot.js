import Script from "next/script";
import { calculatorSrc } from "../lib/client-asset.js";

export function ClientBoot() {
  const analyticsConfig = process.env.NEXT_PUBLIC_VERCEL_OBSERVABILITY_CLIENT_CONFIG || "";
  const configJson = JSON.stringify(analyticsConfig).replace(/</g, "\\u003c");
  return (
    <>
      <script id="cj-analytics" type="application/json" dangerouslySetInnerHTML={{ __html: configJson }} />
      <Script src={calculatorSrc} strategy="afterInteractive" />
    </>
  );
}
