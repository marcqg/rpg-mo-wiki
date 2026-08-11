#!/usr/bin/env node
// Extrait des pages du wiki Fandom RPG MO via l'API MediaWiki et les convertit
// en Markdown pour le site Docusaurus (docs/).
//
// Usage:
//   node scripts/fetch-wiki.mjs                    # échantillon de test (SAMPLE_PAGES)
//   node scripts/fetch-wiki.mjs "Page One" "Page Two"
//   node scripts/fetch-wiki.mjs --all               # tout le wiki (découverte via l'API)

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const WIKI_ORIGIN = 'https://rpg-mo.fandom.com';
const WIKI_API = `${WIKI_ORIGIN}/api.php`;
const WIKI_BASE = `${WIKI_ORIGIN}/wiki/`;
const OUT_DIR = path.resolve(import.meta.dirname, '..', 'docs');

// Échantillon de test (5-10 pages représentatives : accueil, compétence, guide, matériel).
const SAMPLE_PAGES = [
  'Main Page',
  'Magic',
  'Mining',
  'Market Guide',
  'Materials',
  'Mini Games',
];

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
});
turndown.use(gfm);

// La règle `tableCell` de turndown-plugin-gfm ne neutralise pas les retours
// à la ligne internes (ex: cellules contenant plusieurs images/lignes), ce
// qui casse la syntaxe des tableaux Markdown. On la remplace par une version
// qui les convertit en <br/>.
turndown.addRule('tableCellNoNewlines', {
  filter: ['th', 'td'],
  replacement: (content, node) => {
    const index = Array.prototype.indexOf.call(node.parentNode.childNodes, node);
    const prefix = index === 0 ? '| ' : ' ';
    const flat = content.trim().replace(/\r?\n+/g, '<br/>');
    return `${prefix}${flat} |`;
  },
});

// turndown-plugin-gfm ne convertit que les tableaux ayant une vraie ligne
// d'en-tête (<th>) ; les autres (ex: tables de butin sans en-tête) sont
// laissés tels quels en HTML brut par sa règle `keep`. Ce HTML brut contient
// des balises non fermées (<img>, <br>) qui cassent la compilation MDX. On
// force donc la conversion de TOUS les tableaux, en ajoutant une ligne de
// séparation Markdown si elle n'a pas déjà été générée par la ligne d'en-tête.
turndown.addRule('tableAlwaysConvert', {
  filter: (node) => node.nodeName === 'TABLE',
  replacement: (content) => {
    const lines = content.replace(/^\n+|\n+$/g, '').split('\n').filter(Boolean);
    if (lines.length > 0 && !/^\|?\s*:?-{2,}/.test(lines[1] || '')) {
      const cols = Math.max((lines[0].match(/\|/g) || []).length - 1, 1);
      lines.splice(1, 0, '| ' + Array(cols).fill('---').join(' | ') + ' |');
    }
    return '\n\n' + lines.join('\n') + '\n\n';
  },
});

// Les infobox/side-panels de Fandom deviennent illisibles en Markdown : on les retire.
turndown.remove(['style', 'script']);
turndown.addRule('stripFandomChrome', {
  filter: (node) =>
    node.classList?.contains('portable-infobox') ||
    node.classList?.contains('toc') ||
    node.classList?.contains('mw-editsection'),
  replacement: () => '',
});

// Fandom charge les images en lazy-load : `src` contient un GIF de 1x1 en
// base64 et la vraie URL est dans `data-src`.
turndown.addRule('lazyImage', {
  filter: 'img',
  replacement: (content, node) => {
    const alt = node.getAttribute('alt') || '';
    const src = node.getAttribute('data-src') || node.getAttribute('src') || '';
    if (!src || src.startsWith('data:')) return '';
    return `![${alt}](${src})`;
  },
});

// Les liens internes du wiki (/wiki/Xxx) n'existent pas sur ce site tant que
// la page correspondante n'a pas été migrée : on les fait pointer vers le
// wiki Fandom d'origine.
turndown.addRule('resolveWikiLinks', {
  filter: (node) => node.nodeName === 'A' && (node.getAttribute('href') || '').startsWith('/wiki/'),
  replacement: (content, node) => {
    const href = node.getAttribute('href');
    if (!content.trim()) return '';
    return `[${content}](${WIKI_ORIGIN}${href})`;
  },
});

function slugify(title) {
  return title
    .trim()
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

async function fetchAllTitles() {
  const titles = [];
  let apcontinue;
  do {
    const params = {
      action: 'query',
      list: 'allpages',
      apnamespace: '0',
      apfilterredir: 'nonredirects',
      aplimit: '500',
      format: 'json',
      formatversion: '2',
    };
    if (apcontinue) params.apcontinue = apcontinue;
    const url = new URL(WIKI_API);
    url.search = new URLSearchParams(params).toString();
    const res = await fetch(url);
    const data = await res.json();
    for (const p of data.query.allpages) titles.push(p.title);
    apcontinue = data.continue?.apcontinue;
  } while (apcontinue);
  return titles;
}

// Limite le nombre de requêtes simultanées vers l'API Fandom.
async function runPool(items, worker, concurrency) {
  let i = 0;
  async function next() {
    while (i < items.length) {
      const item = items[i++];
      await worker(item);
    }
  }
  await Promise.all(Array.from({ length: concurrency }, next));
}

async function fetchPageHtml(title) {
  const url = new URL(WIKI_API);
  url.search = new URLSearchParams({
    action: 'parse',
    page: title,
    prop: 'text|displaytitle',
    format: 'json',
    formatversion: '2',
  }).toString();

  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} pour "${title}"`);
  const data = await res.json();
  if (data.error) throw new Error(`API error pour "${title}": ${data.error.info}`);
  return data.parse;
}

// L'attribution à la source (RPG MO Wiki / Fandom, CC BY-SA) vit sur
// docs/sources.md, pas sur chaque page individuelle.
function toFrontmatter({ title, slug, isHome }) {
  const lines = [
    '---',
    `title: ${JSON.stringify(title)}`,
    `slug: ${isHome ? '/' : `/${slug}`}`,
    '---',
    '',
  ];
  return lines.join('\n');
}

// Docusaurus compile le Markdown en MDX, qui interprète `<...>` comme du JSX
// et `{...}` comme une expression JS. Le contenu du wiki (texte libre)
// contient parfois ce genre de motifs (ex: "<PlayerName>") sans intention de
// balisage : on les échappe, à l'exception des `<br/>` qu'on insère nous-mêmes.
const BR_PLACEHOLDER = '@@BR@@';
function escapeForMdx(markdown) {
  return markdown
    .split('<br/>').join(BR_PLACEHOLDER)
    .split('<').join('&lt;')
    .split(BR_PLACEHOLDER).join('<br/>')
    .split('{').join('&#123;');
}

async function processPage(title, usedSlugs) {
  const { text, displaytitle } = await fetchPageHtml(title);
  const html = typeof text === 'string' ? text : text['*'];
  let markdown = turndown.turndown(html);

  // Nettoyage: lignes vides multiples laissées par turndown
  markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();
  markdown = escapeForMdx(markdown);

  const isHome = title === 'Main Page';
  let slug = slugify(title);
  if (usedSlugs.has(slug)) {
    const n = usedSlugs.get(slug) + 1;
    usedSlugs.set(slug, n);
    slug = `${slug}-${n}`;
  } else {
    usedSlugs.set(slug, 1);
  }

  const frontmatter = toFrontmatter({ title: displaytitle.replace(/<[^>]+>/g, ''), slug, isHome });

  await mkdir(OUT_DIR, { recursive: true });
  const filePath = path.join(OUT_DIR, `${slug}.md`);
  await writeFile(filePath, frontmatter + markdown + '\n', 'utf-8');
  return filePath;
}

async function main() {
  const args = process.argv.slice(2);
  let pages;

  if (args.includes('--all')) {
    console.log('Découverte de toutes les pages du wiki...');
    pages = await fetchAllTitles();
    console.log(`${pages.length} pages trouvées.`);
  } else {
    pages = args.length > 0 ? args : SAMPLE_PAGES;
  }

  const usedSlugs = new Map();
  let done = 0;
  let failed = 0;

  await runPool(
    pages,
    async (title) => {
      try {
        const filePath = await processPage(title, usedSlugs);
        done++;
        if (done % 25 === 0 || done === pages.length) {
          console.log(`[${done}/${pages.length}] ${path.relative(process.cwd(), filePath)}`);
        }
      } catch (err) {
        failed++;
        console.error(`Échec pour "${title}": ${err.message}`);
      }
    },
    5,
  );

  console.log(`Terminé: ${done} pages écrites, ${failed} échecs.`);
}

main();
