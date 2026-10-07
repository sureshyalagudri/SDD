// One-off generator: writes 20 distinct SVG artworks to public/artwork. Output is committed.
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const outDir = resolve(process.cwd(), "public/artwork");
mkdirSync(outDir, { recursive: true });

const COUNT = 20;
for (let n = 1; n <= COUNT; n++) {
  const nn = String(n).padStart(2, "0");
  const h1 = (n * 137.508) % 360; // golden-angle spacing keeps hues distinct
  const h2 = (h1 + 48) % 360;
  const angle = (n * 23) % 360;
  const rot = (n * 17) % 90;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600" role="img" aria-labelledby="t">
<title id="t">Signal &amp; Noise, episode ${n}</title>
<defs>
<linearGradient id="g" gradientTransform="rotate(${angle} .5 .5)"><stop offset="0" stop-color="hsl(${h1} 72% 46%)"/><stop offset="1" stop-color="hsl(${h2} 78% 28%)"/></linearGradient>
<radialGradient id="r" cx=".8" cy=".2" r=".9"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
</defs>
<rect width="600" height="600" fill="url(#g)"/>
<rect width="600" height="600" fill="url(#r)"/>
<g transform="rotate(${rot} 300 300)" fill="none" stroke="#fff" stroke-opacity=".18" stroke-width="22" stroke-linecap="round">
<circle cx="300" cy="300" r="${150 + (n % 4) * 25}"/>
<path d="M120 300h360"/>
</g>
<text x="56" y="112" font-family="Inter,system-ui,sans-serif" font-size="40" font-weight="600" fill="#fff" fill-opacity=".85" letter-spacing="4">S&amp;N</text>
<text x="544" y="540" text-anchor="end" font-family="Inter,system-ui,sans-serif" font-size="220" font-weight="800" fill="#fff" fill-opacity=".92">${nn}</text>
</svg>
`;
  writeFileSync(resolve(outDir, `ep-${nn}.svg`), svg);
}
console.log(`Wrote ${COUNT} artworks to ${outDir}`);
