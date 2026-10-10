export const metadata = {
  title: { absolute: "Page not found | Compound Jar" },
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <main className="missing">
      <h1>Page not found</h1>
      <p>That page is not on Compound Jar.</p>
      <p><a href="/">Back to the calculator</a></p>
    </main>
  );
}
