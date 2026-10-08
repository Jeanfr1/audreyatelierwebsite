import { defineConfig } from 'vite';
import { readFileSync } from 'node:fs';
import { site } from './src/data/site.js';

const meta = JSON.parse(readFileSync(new URL('./src/data/asset-meta.json', import.meta.url), 'utf8'));
const BLANK = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

const attr = (s, name) => (s.match(new RegExp(`\\b${name}="([^"]*)"`)) || [])[1];
const has = (s, name) => new RegExp(`\\b${name}(\\s|=|$)`).test(s);
const srcset = (name, fmt) => meta[name].files[fmt].map((f) => `/img/${f.file} ${f.w}w`).join(', ');

// <x-pic name="couleur" sizes="…" alt="…" class="…" loading="lazy"
//        [mobile="portrait-mobile"] [desktop-only] [fetchpriority="high"]></x-pic>
function picture(attrs) {
  const name = attr(attrs, 'name');
  if (!meta[name]) throw new Error(`x-pic: unknown asset "${name}"`);
  const sizes = attr(attrs, 'sizes') || '100vw';
  const mobile = attr(attrs, 'mobile');
  const desktopOnly = has(attrs, 'desktop-only');
  const media = desktopOnly ? ' media="(min-width: 1024px)"' : '';
  const sources = [];
  if (mobile) {
    for (const fmt of ['avif', 'webp']) {
      sources.push(`<source type="image/${fmt}" media="(max-width: 760px)" srcset="${srcset(mobile, fmt)}" sizes="100vw" width="${meta[mobile].width}" height="${meta[mobile].height}">`);
    }
  }
  for (const fmt of ['avif', 'webp']) {
    sources.push(`<source type="image/${fmt}"${media} srcset="${srcset(name, fmt)}" sizes="${sizes}">`);
  }
  const files = meta[name].files.webp;
  const fallback = desktopOnly ? BLANK : `/img/${files[0].file}`;
  const imgAttrs = [
    `src="${fallback}"`,
    `width="${meta[name].width}"`,
    `height="${meta[name].height}"`,
    `alt="${attr(attrs, 'alt') ?? ''}"`,
    attr(attrs, 'class') && `class="${attr(attrs, 'class')}"`,
    `loading="${attr(attrs, 'loading') || 'lazy'}"`,
    `decoding="${attr(attrs, 'decoding') || 'async'}"`,
    attr(attrs, 'fetchpriority') && `fetchpriority="${attr(attrs, 'fetchpriority')}"`,
  ].filter(Boolean).join(' ');
  return `<picture>${sources.join('')}<img ${imgAttrs}></picture>`;
}

const get = (obj, path) => path.split('.').reduce((o, k) => o?.[k], obj);

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'HairSalon',
  name: site.name,
  url: site.url,
  telephone: site.phone.e164,
  address: {
    '@type': 'PostalAddress',
    streetAddress: site.address.street,
    postalCode: site.address.postalCode,
    addressLocality: site.address.city,
    addressRegion: site.address.region,
    addressCountry: site.address.country,
  },
  sameAs: [site.reservation],
};

const audreyHtml = {
  name: 'atelier-audrey-html',
  transformIndexHtml: {
    order: 'pre',
    handler(html) {
      return html
        .replace(/<x-pic\b([^>]*)><\/x-pic>/g, (_, a) => picture(a))
        .replace('{{jsonld}}', JSON.stringify(jsonLd))
        .replace(/\{\{([\w.]+)\}\}/g, (m, key) => {
          const v = get({ site, meta }, key);
          if (v === undefined) throw new Error(`Unknown token ${m}`);
          return v;
        });
    },
  },
};

export default defineConfig({
  plugins: [audreyHtml],
  build: { target: 'es2020', assetsInlineLimit: 0 },
});
