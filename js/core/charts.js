// Прості SVG-графіки без бібліотек.
import { esc } from './ui.js';

const niceMax = v => { if (v <= 10) return 10; const p = 10 ** Math.floor(Math.log10(v)); return Math.ceil(v / p) * p; };

// series: [{values:[...], cls:'', label}], labels: підписи осі X
export function lineChart({ series, labels = [], height = 220, yLabel = '', max = null, title = '' }) {
  const W = 640, H = height, L = 44, R = 14, T = 16, B = 30;
  const all = series.flatMap(s => s.values);
  const top = max ?? niceMax(Math.max(1, ...all));
  const n = Math.max(...series.map(s => s.values.length), 1);
  const x = i => L + (n === 1 ? (W - L - R) / 2 : (i / (n - 1)) * (W - L - R));
  const y = v => T + (1 - v / top) * (H - T - B);
  let g = '';
  for (let k = 0; k <= 4; k++) {
    const v = (top / 4) * k, yy = y(v);
    g += `<line class="grid-l" x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}"/><text x="${L - 8}" y="${yy + 4}" text-anchor="end">${Math.round(v)}</text>`;
  }
  const step = Math.ceil(labels.length / 8) || 1;
  labels.forEach((lb, i) => { if (i % step === 0 || i === labels.length - 1) g += `<text x="${x(i)}" y="${H - 8}" text-anchor="middle">${esc(lb)}</text>`; });
  const lines = series.map((s, si) => {
    if (!s.values.length) return '';
    const pts = s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ');
    const area = si === 0 && s.values.length > 1 ? `<polygon class="area" points="${x(0)},${y(0)} ${pts} ${x(s.values.length - 1)},${y(0)}"/>` : '';
    const dots = s.values.length <= 30 ? s.values.map((v, i) => `<circle class="dot" cx="${x(i)}" cy="${y(v)}" r="3.5"${s.cls === 'v' ? ' style="stroke:var(--violet)"' : ''}/>`).join('') : '';
    return `${area}<polyline class="line ${s.cls || ''}" points="${pts}"/>${dots}`;
  }).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}">${g}<line class="axis" x1="${L}" x2="${W - R}" y1="${y(0)}" y2="${y(0)}"/>${lines}${yLabel ? `<text x="${L}" y="10">${esc(yLabel)}</text>` : ''}</svg>`;
}

export function barChart({ values, labels, height = 180, highlightLast = true, title = '', unit = '' }) {
  const W = 640, H = height, L = 40, R = 10, T = 14, B = 28;
  const top = niceMax(Math.max(1, ...values));
  const n = values.length, bw = (W - L - R) / n;
  let g = '';
  for (let k = 0; k <= 2; k++) {
    const v = (top / 2) * k, yy = T + (1 - v / top) * (H - T - B);
    g += `<line class="grid-l" x1="${L}" x2="${W - R}" y1="${yy}" y2="${yy}"/><text x="${L - 6}" y="${yy + 4}" text-anchor="end">${Math.round(v)}</text>`;
  }
  values.forEach((v, i) => {
    const h = (v / top) * (H - T - B);
    g += `<rect class="bar${highlightLast && i === n - 1 ? ' today' : ''}" x="${L + i * bw + bw * 0.18}" y="${H - B - h}" width="${bw * 0.64}" height="${Math.max(h, v ? 2 : 0)}" rx="4"><title>${esc(labels[i])}: ${Math.round(v)} ${esc(unit)}</title></rect>`;
    if (n <= 14 || i % 2 === 0) g += `<text x="${L + i * bw + bw / 2}" y="${H - 8}" text-anchor="middle">${esc(labels[i])}</text>`;
  });
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(title)}">${g}<line class="axis" x1="${L}" x2="${W - R}" y1="${H - B}" y2="${H - B}"/></svg>`;
}
