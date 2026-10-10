import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["client/main.js"],
  outfile: "public/calculator.js",
  bundle: true,
  format: "iife",
  platform: "browser",
  target: ["es2020"],
  minify: true,
  legalComments: "none",
  define: {
    "process.env.NODE_ENV": '"production"',
  },
});

const hash = createHash("sha256")
  .update(readFileSync("public/calculator.js"))
  .digest("hex")
  .slice(0, 10);

writeFileSync(
  "lib/client-asset.js",
  `export const calculatorSrc = "/calculator.js?v=${hash}";\n`,
);
