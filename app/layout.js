import { Fraunces, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-inter",
  preload: false,
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: "600",
  display: "swap",
  variable: "--font-fraunces",
  preload: true,
});

export const viewport = {
  themeColor: "#FBF6EE",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata = {
  applicationName: "Compound Jar",
  icons: { icon: "/icon.svg" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body>{children}</body>
    </html>
  );
}
