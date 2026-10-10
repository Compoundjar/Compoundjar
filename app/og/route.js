import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { parsePlan, previewModel, readStartYear } from "../../lib/plan.js";

function loadFont(name) {
  const buf = readFileSync(join(process.cwd(), "assets/fonts", name));
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

const fraunces = loadFont("Fraunces-600.ttf");
const inter500 = loadFont("Inter-500.ttf");
const inter600 = loadFont("Inter-600.ttf");

function headlineSize(text) {
  const chars = String(text).length;
  if (chars <= 16) return 80;
  if (chars <= 24) return 64;
  if (chars <= 36) return 54;
  return 46;
}

export async function GET(request) {
  const plan = parsePlan(request.nextUrl.searchParams);
  const startYear = readStartYear(request.nextUrl.searchParams);
  const model = previewModel(plan, { startYear });
  const totalSize = headlineSize(model.imageHeadline);
  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#FBF6EE",
          display: "flex",
          padding: "72px 76px",
          color: "#1D1B18",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            flex: 1,
            paddingRight: "36px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", width: 740 }}>
            <div
              style={{
                fontFamily: "Fraunces",
                fontWeight: 600,
                fontSize: totalSize,
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
              }}
            >
              {model.imageHeadline}
            </div>
            <div
              style={{
                fontFamily: "Inter",
                fontWeight: 500,
                fontSize: 32,
                lineHeight: 1.3,
                marginTop: 28,
                color: "#1D1B18",
              }}
            >
              {model.imageSub}
            </div>
          </div>
          <div
            style={{
              fontFamily: "Inter",
              fontWeight: 600,
              fontSize: 26,
              color: "#F26B3A",
            }}
          >
            {model.imageFooter}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            width: 260,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                width: 118,
                height: 22,
                background: "#1D1B18",
                borderRadius: 8,
              }}
            />
            <div style={{ width: 64, height: 16, background: "#E7D9C4" }} />
            <div
              style={{
                width: 210,
                height: 268,
                background: "#FFFFFF",
                border: "8px solid #1D1B18",
                borderRadius: 88,
                display: "flex",
                alignItems: "flex-end",
                overflow: "hidden",
              }}
            >
              <div style={{ width: "100%", height: 158, background: "#F26B3A" }} />
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Fraunces", data: fraunces, weight: 600, style: "normal" },
        { name: "Inter", data: inter500, weight: 500, style: "normal" },
        { name: "Inter", data: inter600, weight: 600, style: "normal" },
      ],
      headers: {
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
      },
    },
  );
}
