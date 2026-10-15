// Post-build: prerender each route to static HTML (so crawlers and link previews see real content and
// titles), plus 404.html (SPA fallback served by Cloudflare as the 404 page), robots.txt and sitemap.xml.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from '../src/App';
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL, tools } from '../src/tools';

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
const template = readFileSync(resolve(dist, 'index.html'), 'utf8');

const escapeHtml = (v: string) => v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const replaceOnce = (html: string, pattern: RegExp | string, replacement: string) => {
  if (!(typeof pattern === 'string' ? html.includes(pattern) : pattern.test(html))) {
    throw new Error(`postbuild: no match for ${pattern} in dist/index.html`);
  }
  return html.replace(pattern, () => replacement);
};

const setMeta = (html: string, attr: 'name' | 'property', key: string, content: string) =>
  replaceOnce(html, new RegExp(`<meta ${attr}="${key}" content="[^"]*"`), `<meta ${attr}="${key}" content="${escapeHtml(content)}"`);

const write = (file: string, content: string) => {
  const target = resolve(dist, file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
  console.log(`  dist/${file}`);
};

interface Page {
  path: string;
  title: string;
  description: string;
  jsonLd: object;
}

const pages: Page[] = [
  {
    path: '/',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    jsonLd: { '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: `${SITE_URL}/`, description: SITE_DESCRIPTION },
  },
  ...tools.map((t) => ({
    path: t.path,
    title: `${t.title} | ${SITE_NAME}`,
    description: t.description,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: t.title,
      url: `${SITE_URL}${t.path}`,
      description: t.description,
      applicationCategory: 'GameApplication',
      operatingSystem: 'Any (modern web browser)',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
      author: { '@type': 'Person', name: 'Zavian' },
    },
  })),
];

const render = (page: Page) => {
  const markup = renderToString(
    <StrictMode>
      <App initialPath={page.path} />
    </StrictMode>
  );
  const url = `${SITE_URL}${page.path === '/' ? '/' : page.path}`;
  let html = replaceOnce(template, '<div id="root"></div>', `<div id="root">${markup}</div>`);
  html = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${escapeHtml(page.title)}</title>`);
  html = setMeta(html, 'name', 'description', page.description);
  html = replaceOnce(html, /<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${url}"`);
  html = setMeta(html, 'property', 'og:title', page.title);
  html = setMeta(html, 'property', 'og:description', page.description);
  html = setMeta(html, 'property', 'og:url', url);
  html = setMeta(html, 'name', 'twitter:title', page.title);
  html = setMeta(html, 'name', 'twitter:description', page.description);
  const jsonLd = JSON.stringify(page.jsonLd).replace(/</g, '\\u003c');
  return replaceOnce(html, '</head>', `  <script type="application/ld+json">${jsonLd}</script>\n  </head>`);
};

console.log('Prerendering:');
for (const page of pages) write(page.path === '/' ? 'index.html' : `${page.path.slice(1)}.html`, render(page));
// Unknown URLs fall back to the app (which shows the home page).
write('404.html', render(pages[0]));
write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);
const lastmod = new Date().toISOString().slice(0, 10);
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    pages.map((p) => `  <url><loc>${SITE_URL}${p.path}</loc><lastmod>${lastmod}</lastmod></url>\n`).join('') +
    `</urlset>\n`
);
