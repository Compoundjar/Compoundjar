function fmtShort(n) {
  if (!Number.isFinite(n) || n <= 0) return "$0";
  if (n >= 1e15) {
    const exp = Math.floor(Math.log10(n));
    const mant = n / 10 ** exp;
    return `$${mant.toFixed(0)}e${exp}`;
  }
  if (n >= 1e12) return `$${(n / 1e12).toFixed(n >= 1e13 ? 0 : 1)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(n >= 1e10 ? 0 : 1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(n >= 1e7 ? 0 : 1)}M`;
  if (n >= 1e3) return `$${Math.round(n / 1e3)}k`;
  return `$${Math.round(n)}`;
}

function niceMax(v) {
  if (!Number.isFinite(v) || v <= 0) return 1;
  const e = Math.pow(10, Math.floor(Math.log10(v)));
  const m = v / e;
  const n = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((x) => m <= x) || 10;
  return n * e;
}

export function chartMarkup(res) {
  const W = 318;
  const H = 176;
  const PR = 34;
  const PT = 26;
  const PB = 20;
  const rows = res.rows.slice(1);
  const n = rows.length;
  if (!n) return "";
  const max = Math.max(...rows.map((r) => r.bal), 1);
  const nice = niceMax(max);
  const iw = W - PR;
  const ih = H - PT - PB;
  const step = iw / n;
  const bw = Math.max(1.5, step * 0.68);
  let s = "";
  for (let i = 0; i <= 2; i++) {
    const v = (nice * i) / 2;
    const y = PT + ih - (ih * v) / nice;
    s += `<line x1="0" x2="${W - PR + 4}" y1="${y}" y2="${y}" stroke="#F1EBE1" stroke-width="1"/>`;
    if (i > 0) {
      s += `<text class="axis" x="${W}" y="${y + 3.5}" text-anchor="end">${fmtShort(v)}</text>`;
    }
  }
  rows.forEach((r, i) => {
    const x = i * step + (step - bw) / 2;
    const hC = (ih * Math.min(r.con, r.bal)) / nice;
    const hT = (ih * r.bal) / nice;
    const after = res.cross !== null && r.yr >= res.cross;
    s += `<rect class="bar" x="${x}" y="${PT + ih - hC}" width="${bw}" height="${hC}" rx="${Math.min(2, bw / 2)}" fill="${after ? "#E2D2BA" : "#E9DDCB"}"/>`;
    if (hT - hC > 0.3) {
      s += `<rect class="bar" x="${x}" y="${PT + ih - hT}" width="${bw}" height="${hT - hC}" rx="${Math.min(2, bw / 2)}" fill="${after ? "url(#gI)" : "#F7B08E"}"/>`;
    }
  });
  if (res.cross !== null) {
    const i = res.cross - 1;
    const cx = i * step + step / 2;
    const r = rows[i];
    const top = PT + ih - (ih * r.bal) / nice;
    const label = `Year ${res.cross}: interest passes deposits`;
    const tw = label.length * 5.3 + 14;
    const lx = Math.min(Math.max(cx - tw / 2, 0), W - PR - tw + 30);
    s += `<line x1="${cx}" x2="${cx}" y1="12" y2="${PT + ih}" stroke="#1D1B18" stroke-width="1" stroke-dasharray="2 3" opacity=".55"/>`;
    s += `<rect x="${lx}" y="0" width="${tw}" height="18" rx="9" fill="#1D1B18"/><text class="cross-label" x="${lx + tw / 2}" y="12.4" text-anchor="middle" fill="#fff">${label}</text>`;
    s += `<circle cx="${cx}" cy="${top}" r="3.5" fill="#fff" stroke="#1D1B18" stroke-width="1.5"/>`;
  }
  const ticks = [1, Math.round(n / 2), n].filter((v, i, a) => a.indexOf(v) === i);
  ticks.forEach((t) => {
    const x = (t - 1) * step + step / 2;
    s += `<text class="axis" x="${x}" y="${H - 4}" text-anchor="middle">Yr ${t}</text>`;
  });
  return `<defs><linearGradient id="gI" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF9A5A"/><stop offset="1" stop-color="#F26B3A"/></linearGradient></defs>${s}`;
}
