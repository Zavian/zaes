// Post-build step: prerenders every route to static HTML and writes the crawler files
// (404.html, robots.txt, sitemap.xml, llms.txt, llms-full.txt) into dist/.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from '../src/App';
import { aboutContent } from '../src/content/about';
import { cvData } from '../src/content/cv';
import { otherInterests } from '../src/content/other';
import { projects } from '../src/content/projects';
import { skillCategories } from '../src/content/skills';
import { workExperience } from '../src/content/work';
import { Route, SITE_URL, routes } from '../src/seo';
import { Project } from '../src/types';

const dist = resolve(dirname(fileURLToPath(import.meta.url)), '../dist');
const template = readFileSync(resolve(dist, 'index.html'), 'utf8');

const PERSON_ID = `${SITE_URL}/#person`;
const IMAGE_URL = `${SITE_URL}/android-chrome-512x512.png`;
const ROBOTS_INDEX = '<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />';
const EMPTY_ROOT = '<div id="root"></div>';

const write = (file: string, content: string) => {
  const target = resolve(dist, file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
  console.log(`  dist/${file}`);
};

const escapeHtml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Replace exactly one occurrence, failing the build if the template no longer matches
const replaceOnce = (html: string, pattern: RegExp | string, replacement: string) => {
  if (!(typeof pattern === 'string' ? html.includes(pattern) : pattern.test(html))) {
    throw new Error(`prerender: no match for ${pattern} in dist/index.html`);
  }
  return html.replace(pattern, () => replacement);
};

const setMeta = (html: string, attr: 'name' | 'property', key: string, content: string) =>
  replaceOnce(
    html,
    new RegExp(`<meta ${attr}="${key}" content="[^"]*"`),
    `<meta ${attr}="${key}" content="${escapeHtml(content)}"`
  );

const pageUrl = (path: string) => `${SITE_URL}${path}`;

// ---------- JSON-LD ----------

const homeJsonLd = () => {
  const [addressLocality, addressCountry] = cvData.location.split(', ');
  return {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: aboutContent.domain, inLanguage: 'en' },
      {
        '@type': 'ProfilePage',
        '@id': `${SITE_URL}/#profilepage`,
        url: `${SITE_URL}/`,
        name: routes[0].title,
        inLanguage: 'en',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        mainEntity: {
          '@type': 'Person',
          '@id': PERSON_ID,
          name: aboutContent.name,
          alternateName: 'Zavian',
          jobTitle: aboutContent.role,
          description: cvData.overview,
          url: `${SITE_URL}/`,
          image: IMAGE_URL,
          email: `mailto:${cvData.email}`,
          address: { '@type': 'PostalAddress', addressLocality, addressCountry },
          worksFor: { '@type': 'Organization', name: workExperience.brands[0] },
          sameAs: [cvData.github, cvData.linkedin],
          knowsAbout: skillCategories.flatMap((category) => category.skills),
          knowsLanguage: cvData.languages.flatMap((l) => l.language.split(' / ')),
        },
      },
    ],
  };
};

const projectJsonLd = (project: Project) => {
  const url = pageUrl(`/projects/${project.id}`);
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CreativeWork',
        '@id': `${url}#creativework`,
        name: project.title,
        headline: project.subtitle,
        description: project.summary,
        url,
        keywords: project.technologies,
        author: { '@id': PERSON_ID, name: aboutContent.name },
        sameAs: (project.detailedContent?.links ?? []).map((link) => link.url),
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
          { '@type': 'ListItem', position: 2, name: 'Projects', item: `${SITE_URL}/#projects` },
          { '@type': 'ListItem', position: 3, name: project.title, item: url },
        ],
      },
    ],
  };
};

// ---------- HTML pages ----------

const renderPage = (route: Route) => {
  const markup = renderToString(
    <StrictMode>
      <App initialPath={route.path} />
    </StrictMode>
  );
  const canonical = pageUrl(route.canonical);
  const jsonLd = JSON.stringify(route.project ? projectJsonLd(route.project) : homeJsonLd()).replace(/</g, '\\u003c');

  let html = replaceOnce(template, EMPTY_ROOT, `<div id="root">${markup}</div>`);
  html = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${escapeHtml(route.title)}</title>`);
  html = setMeta(html, 'name', 'description', route.description);
  html = replaceOnce(html, /<link rel="canonical" href="[^"]*"/, `<link rel="canonical" href="${escapeHtml(canonical)}"`);
  html = setMeta(html, 'property', 'og:url', canonical);
  // The home page keeps its hand-written social title/description from index.html
  if (route.project) {
    html = setMeta(html, 'property', 'og:title', route.title);
    html = setMeta(html, 'property', 'og:description', route.description);
    html = setMeta(html, 'name', 'twitter:title', route.title);
    html = setMeta(html, 'name', 'twitter:description', route.description);
  }
  return replaceOnce(html, '</head>', `  <script type="application/ld+json">${jsonLd}</script>\n  </head>`);
};

const outputFile = (path: string) => (path === '/' ? 'index.html' : `${path.slice(1)}.html`);

// ---------- Markdown (llms.txt / llms-full.txt) ----------

const bullets = (items: string[]) => items.map((item) => `- ${item}`).join('\n');

const facts = bullets([
  `Role: ${aboutContent.role}`,
  `Location: ${aboutContent.location}`,
  `Employer: ${workExperience.company} (${workExperience.role}, ${workExperience.period})`,
  `Email: ${cvData.email}`,
  `GitHub: ${cvData.github}`,
  `LinkedIn: ${cvData.linkedin}`,
  `Website: ${SITE_URL}`,
]);

const llmsTxt = () =>
  [
    `# ${aboutContent.name} (${aboutContent.domain})`,
    `> ${cvData.overview}`,
    facts,
    '## Projects',
    bullets(projects.map((p) => `[${p.title}](${pageUrl(`/projects/${p.id}`)}): ${p.summary}`)),
    '## Work',
    bullets([
      `${workExperience.role} at ${workExperience.company} (${workExperience.period}, ${workExperience.location}): ${workExperience.summary}`,
      ...workExperience.technicalHighlights,
    ]),
    '## Optional',
    bullets([
      `[CV (PDF)](${SITE_URL}/cv.pdf): Full curriculum vitae`,
      `[Full site content](${SITE_URL}/llms-full.txt): Every section of ${aboutContent.domain} as a single markdown document`,
    ]),
  ].join('\n\n') + '\n';

const section = (heading: string, items?: string[]) => (items?.length ? [heading, bullets(items)] : []);

const projectMarkdown = (p: Project) => {
  const d = p.detailedContent;
  return [
    `### ${p.title}`,
    `${p.subtitle}`,
    bullets([
      `URL: ${pageUrl(`/projects/${p.id}`)}`,
      `Period: ${p.period}`,
      `Technologies: ${p.technologies.join(', ')}`,
      ...(d?.currentStatus ? [`Status: ${d.currentStatus}`] : []),
    ]),
    p.summary,
    ...section('#### Highlights', p.highlights),
    ...(d?.overview.length ? ['#### Overview', ...d.overview] : []),
    ...section('#### Architecture', d?.architecture),
    ...section('#### Key Features', d?.keyFeatures),
    ...section('#### Technical Challenges', d?.technicalChallenges),
    ...section('#### Links', d?.links?.map((link) => `[${link.label}](${link.url})`)),
  ].join('\n\n');
};

const llmsFullTxt = () =>
  [
    `# ${aboutContent.name} (${aboutContent.domain})`,
    `> ${cvData.overview}`,
    facts,
    '## About',
    ...aboutContent.paragraphs,
    '## Work Experience',
    `### ${workExperience.role}, ${workExperience.company}`,
    `${workExperience.period} · ${workExperience.location}`,
    workExperience.summary,
    `Brands: ${workExperience.brands.join(', ')}`,
    ...section('#### Responsibilities', workExperience.responsibilities),
    ...section('#### Technical Highlights', workExperience.technicalHighlights),
    '## Projects',
    ...projects.map(projectMarkdown),
    '## Other Interests',
    ...otherInterests.flatMap((o) => [
      `### ${o.title}`,
      `${o.role} · ${o.period}`,
      o.summary,
      bullets(o.points),
      ...(o.automationSystem
        ? [
            `#### ${o.automationSystem.title}`,
            o.automationSystem.description,
            `Stack: ${o.automationSystem.stack.join(', ')}`,
            bullets(o.automationSystem.steps.map((step) => `${step.title}: ${step.desc}`)),
          ]
        : []),
    ]),
    '## Skills',
    bullets(skillCategories.map((category) => `${category.title}: ${category.skills.join(', ')}`)),
    '## Languages',
    bullets(cvData.languages.map((l) => `${l.language}: ${l.level}`)),
    '## Education',
    ...cvData.education.flatMap((e) => [
      `### ${e.degree}`,
      `${e.institution}, ${e.location} · ${e.period}`,
      ...(e.description ? [e.description] : []),
    ]),
  ].join('\n\n') + '\n';

// ---------- Output ----------

console.log('Prerendering:');

for (const route of routes) {
  write(outputFile(route.path), renderPage(route));
}

// Fallback for unknown URLs: empty root so client routing still works, never indexed
write('404.html', replaceOnce(template, ROBOTS_INDEX, '<meta name="robots" content="noindex" />'));

write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

const lastmod = new Date().toISOString().slice(0, 10);
const sitemapPaths = [...routes.filter((route) => route.path === route.canonical).map((route) => route.path), '/cv.pdf'];
write(
  'sitemap.xml',
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    sitemapPaths.map((path) => `  <url><loc>${pageUrl(path)}</loc><lastmod>${lastmod}</lastmod></url>\n`).join('') +
    `</urlset>\n`
);

write('llms.txt', llmsTxt());
write('llms-full.txt', llmsFullTxt());
