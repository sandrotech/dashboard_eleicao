// Gera src/data/brazilMap.ts a partir da malha de UFs do IBGE.
// Uso: node scripts/build-map.mjs [minima|intermediaria|maxima]
import { writeFileSync } from 'node:fs';

const QUALITY = process.argv[2] || 'intermediaria';
const MESH_URL =
  'https://servicodados.ibge.gov.br/api/v3/malhas/paises/BR?intrarregiao=UF&qualidade=' +
  QUALITY +
  '&formato=application/vnd.geo+json';

const UF_BY_IBGE = {
  11: 'RO', 12: 'AC', 13: 'AM', 14: 'RR', 15: 'PA', 16: 'AP', 17: 'TO',
  21: 'MA', 22: 'PI', 23: 'CE', 24: 'RN', 25: 'PB', 26: 'PE', 27: 'AL', 28: 'SE', 29: 'BA',
  31: 'MG', 32: 'ES', 33: 'RJ', 35: 'SP',
  41: 'PR', 42: 'SC', 43: 'RS',
  50: 'MS', 51: 'MT', 52: 'GO', 53: 'DF',
};

const MAX_MAINLAND_LON = -33; // descarta ilhas oceanicas (Trindade, Noronha...)
const LAT0 = (-14 * Math.PI) / 180;
const KX = Math.cos(LAT0);
const WIDTH = 1000;

const res = await fetch(MESH_URL);
if (!res.ok) throw new Error('IBGE respondeu ' + res.status);
const geo = await res.json();

// 1) coleta aneis validos por UF
const raw = {};
for (const f of geo.features) {
  const uf = UF_BY_IBGE[f.properties.codarea];
  if (!uf) continue;
  const polys = f.geometry.type === 'Polygon' ? [f.geometry.coordinates] : f.geometry.coordinates;
  const rings = [];
  for (const poly of polys) {
    for (const ring of poly) {
      const lonAvg = ring.reduce((s, p) => s + p[0], 0) / ring.length;
      if (lonAvg > MAX_MAINLAND_LON) continue;
      rings.push(ring);
    }
  }
  raw[uf] = rings;
}

// 2) bounds globais
let minLon = Infinity, maxLon = -Infinity, minLat = Infinity, maxLat = -Infinity;
for (const rings of Object.values(raw)) {
  for (const ring of rings) {
    for (const [lon, lat] of ring) {
      if (lon < minLon) minLon = lon;
      if (lon > maxLon) maxLon = lon;
      if (lat < minLat) minLat = lat;
      if (lat > maxLat) maxLat = lat;
    }
  }
}
const scale = WIDTH / ((maxLon - minLon) * KX);
const HEIGHT = Math.round((maxLat - minLat) * scale);
const px = (lon) => (lon - minLon) * KX * scale;
const py = (lat) => (maxLat - lat) * scale;
const r1 = (n) => Math.round(n * 10) / 10;

// 3) projeta e monta paths
const shapes = {};
for (const [uf, rings] of Object.entries(raw)) {
  let d = '';
  let bx0 = Infinity, by0 = Infinity, bx1 = -Infinity, by1 = -Infinity;
  let best = { area: 0, cx: 0, cy: 0 };
  for (const ring of rings) {
    const pts = [];
    for (const [lon, lat] of ring) {
      const p = [r1(px(lon)), r1(py(lat))];
      const last = pts[pts.length - 1];
      if (!last || last[0] !== p[0] || last[1] !== p[1]) pts.push(p);
    }
    if (pts.length < 4) continue;
    d += 'M' + pts.map((p) => p[0] + ' ' + p[1]).join('L') + 'Z';
    let a = 0, cx = 0, cy = 0;
    for (let i = 0; i < pts.length; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[(i + 1) % pts.length];
      const cr = x0 * y1 - x1 * y0;
      a += cr;
      cx += (x0 + x1) * cr;
      cy += (y0 + y1) * cr;
      bx0 = Math.min(bx0, x0); by0 = Math.min(by0, y0);
      bx1 = Math.max(bx1, x0); by1 = Math.max(by1, y0);
    }
    a /= 2;
    if (Math.abs(a) > best.area && a !== 0) {
      best = { area: Math.abs(a), cx: cx / (6 * a), cy: cy / (6 * a) };
    }
  }
  const w = bx1 - bx0, h = by1 - by0;
  shapes[uf] = {
    d,
    cx: r1(best.cx), cy: r1(best.cy),
    x: r1(bx0), y: r1(by0), w: r1(w), h: r1(h),
    small: w * h < 4500,
  };
}

const ordered = Object.keys(shapes).sort();
let out = '// ARQUIVO GERADO por scripts/build-map.mjs (malha IBGE, qualidade ' + QUALITY + '). Nao editar.\n';
out += 'export interface UfShape {\n  d: string;\n  cx: number;\n  cy: number;\n  x: number;\n  y: number;\n  w: number;\n  h: number;\n  small: boolean;\n}\n\n';
out += 'export const MAP_VIEWBOX = { w: ' + WIDTH + ', h: ' + HEIGHT + ' };\n\n';
out += 'export const UF_SHAPES: Record<string, UfShape> = {\n';
for (const uf of ordered) out += '  ' + uf + ': ' + JSON.stringify(shapes[uf]) + ',\n';
out += '};\n';

writeFileSync(new URL('../src/data/brazilMap.ts', import.meta.url), out, 'utf8');
console.log('OK', ordered.length, 'UFs | viewBox', WIDTH, 'x', HEIGHT, '| bytes', out.length);