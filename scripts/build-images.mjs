// Builds responsive AVIF/WebP derivatives from the kit PNGs.
// Crops are measured on the 100 px grid overlays of the source photos
// (face of the portrait: x 900–1220, y 120–520 → centre 0.634 / 0.34).
// Output: public/img/<name>-<w>.<fmt> + src/data/asset-meta.json
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const KIT = 'atelier-audrey-editorial';
const OUT = 'public/img';

const jobs = [
  // Hero
  { name: 'macro', src: '02-hero/03-macro-hair.png', widths: [828, 1280, 1672] },
  { name: 'portrait', src: '02-hero/02-hero-portrait.png', widths: [960, 1280, 1672] },
  // Phone crop: face centred, both hair sides kept, full height
  { name: 'portrait-mobile', src: '02-hero/02-hero-portrait.png', crop: { left: 720, top: 0, width: 640, height: 941 }, widths: [640] },
  { name: 'meche', src: '03-camadas/07-meche-alpha.png', widths: [800, 1200, 1536], alpha: true },
  // Expertise cards (4:5) — also the hero panels on desktop
  { name: 'coupe', src: '04-secoes/06-geste-atelier.png', crop: { left: 160, top: 120, width: 600, height: 750 }, widths: [480, 600] },
  { name: 'couleur', src: '04-secoes/04-couleur-bronde.png', crop: { left: 0, top: 0, width: 1086, height: 1358 }, widths: [480, 800] },
  { name: 'texture', src: '02-hero/03-macro-hair.png', crop: { left: 760, top: 0, width: 752, height: 940 }, widths: [480, 752] },
  { name: 'hommes', src: '04-secoes/05-coupe-homme.png', crop: { left: 400, top: 0, width: 800, height: 1000 }, widths: [480, 800] },
  // Nuances
  { name: 'nuance-brun', src: '02-hero/03-macro-hair.png', crop: { left: 160, top: 0, width: 940, height: 940 }, widths: [560, 940] },
  { name: 'nuance-blond', src: '04-secoes/04-couleur-bronde.png', crop: { left: 330, top: 548, width: 720, height: 900 }, widths: [480, 720] },
  // L'atelier
  { name: 'geste', src: '04-secoes/06-geste-atelier.png', widths: [800, 1200, 1536] },
];

const meta = {};
await mkdir(OUT, { recursive: true });

for (const job of jobs) {
  const base = sharp(path.join(KIT, job.src));
  const src = job.crop ? base.extract(job.crop) : base;
  const buf = await src.toBuffer();
  const { width: w0, height: h0 } = await sharp(buf).metadata();
  const entry = { width: w0, height: h0, ratio: +(w0 / h0).toFixed(4), files: {} };

  for (const w of job.widths) {
    const resized = sharp(buf).resize({ width: Math.min(w, w0), withoutEnlargement: true });
    for (const fmt of ['avif', 'webp']) {
      const file = `${job.name}-${w}.${fmt}`;
      const opts = fmt === 'avif'
        ? { quality: job.alpha ? 58 : 52, effort: 6 }
        : { quality: job.alpha ? 80 : 76, alphaQuality: 90, effort: 5 };
      const info = await resized.clone()[fmt](opts).toFile(path.join(OUT, file));
      (entry.files[fmt] ||= []).push({ w, file, kb: Math.round(info.size / 1024) });
    }
  }
  meta[job.name] = entry;
  console.log(job.name.padEnd(16), `${w0}×${h0}`, entry.files.avif.map((f) => `${f.w}:${f.kb}k`).join(' '));
}

// Tiny blurred placeholders (inline backgrounds while the real image decodes)
for (const name of ['macro', 'portrait']) {
  const job = jobs.find((j) => j.name === name);
  const b = await sharp(path.join(KIT, job.src)).resize(24).blur(1.2).webp({ quality: 40 }).toBuffer();
  meta[name].lqip = `data:image/webp;base64,${b.toString('base64')}`;
}

await writeFile('src/data/asset-meta.json', JSON.stringify(meta, null, 2) + '\n');
console.log('→ src/data/asset-meta.json');
