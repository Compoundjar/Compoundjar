function escapeChar(ch) {
  if (ch === "&") return "&amp;";
  if (ch === "<") return "&lt;";
  if (ch === ">") return "&gt;";
  return ch;
}

export function odometerHtml(str) {
  let html = "";
  for (const ch of String(str)) {
    if (ch >= "0" && ch <= "9") {
      const n = ch.charCodeAt(0) - 48;
      let col = "";
      for (let i = 0; i < 10; i++) col += `<span>${i}</span>`;
      html += `<span class="dg"><span class="col" style="transform:translateY(${-n}em)">${col}</span></span>`;
    } else {
      html += `<span class="ch">${escapeChar(ch)}</span>`;
    }
  }
  return html;
}
