const LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

export function plainText(text) {
  return String(text).replace(LINK, "$1");
}

export function Inline({ text }) {
  const value = String(text);
  const nodes = [];
  let last = 0;
  for (const match of value.matchAll(LINK)) {
    if (match.index > last) nodes.push(value.slice(last, match.index));
    const href = match[2];
    const external = href.startsWith("http");
    nodes.push(
      <a
        key={match.index}
        href={href}
        {...(external ? { rel: "noopener noreferrer" } : {})}
      >
        {match[1]}
      </a>,
    );
    last = match.index + match[0].length;
  }
  if (last < value.length) nodes.push(value.slice(last));
  if (!nodes.length) return value;
  return nodes;
}
