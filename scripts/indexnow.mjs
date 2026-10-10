import { indexnowKey } from "../content/indexnow.js";

const host = process.env.INDEXNOW_HOST || "compoundjar.com";
const keyLocation = `https://${host}/${indexnowKey}.txt`;
const url = process.env.INDEXNOW_URL || `https://${host}/`;

if (process.argv.includes("--dry-run")) {
  console.log(JSON.stringify({ host, keyLocation, url }, null, 2));
  process.exit(0);
}

const response = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host,
    key: indexnowKey,
    keyLocation,
    urlList: [url],
  }),
});

console.log(`IndexNow ${response.status} ${response.statusText}`);
if (!response.ok && response.status !== 202) {
  const text = await response.text();
  console.error(text.slice(0, 500));
  process.exit(1);
}
