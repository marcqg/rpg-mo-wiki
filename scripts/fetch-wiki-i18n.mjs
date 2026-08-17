#!/usr/bin/env node
// Récupère les pages des wikis PT/PL/KO depuis Fandom via l'API MediaWiki
// et les convertit en Markdown pour les locales Docusaurus correspondantes.
//
// Usage: node scripts/fetch-wiki-i18n.mjs

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import TurndownService from 'turndown';
import { gfm } from 'turndown-plugin-gfm';

const WIKI_ORIGIN = 'https://rpg-mo.fandom.com';
const WIKI_API = `${WIKI_ORIGIN}/api.php`;
const ROOT = path.resolve(import.meta.dirname, '..');

// Pages à récupérer par locale
const PAGES = [
  { locale: 'pt', fandomTitle: 'Português', outFile: 'main-page.md', docTitle: 'Página Inicial', slug: '/', isHome: true, flagEmoji: '🇧🇷', englishLabel: 'Português' },
  { locale: 'pl', fandomTitle: 'Polski', outFile: 'main-page.md', docTitle: 'Strona Główna', slug: '/', isHome: true, flagEmoji: '🇵🇱', englishLabel: 'Polski' },
  { locale: 'ko', fandomTitle: '한국어(Korean)', outFile: 'main-page.md', docTitle: '메인 페이지', slug: '/', isHome: true, flagEmoji: '🇰🇷', englishLabel: '한국어(Korean)' },
  { locale: 'ko', fandomTitle: 'Korean', outFile: 'korean.md', docTitle: 'Korean', slug: '/korean', isHome: false, flagEmoji: '🇰🇷', englishLabel: 'Korean' },
  { locale: 'ko', fandomTitle: 'Korean Location', outFile: 'korean-location.md', docTitle: 'Korean Location', slug: '/korean-location', isHome: false, flagEmoji: '🇰🇷', englishLabel: 'Korean Location' },
];

// ─── Turndown setup ─────────────────────────────────────────────────────────
const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
turndown.use(gfm);

turndown.addRule('tableCellNoNewlines', {
  filter: ['th', 'td'],
  replacement: (content, node) => {
    const index = Array.prototype.indexOf.call(node.parentNode.childNodes, node);
    const prefix = index === 0 ? '| ' : ' ';
    const flat = content.trim().replace(/\r?\n+/g, '<br/>');
    return `${prefix}${flat} |`;
  },
});

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

turndown.remove(['style', 'script']);
turndown.addRule('stripFandomChrome', {
  filter: (node) =>
    node.classList?.contains('portable-infobox') ||
    node.classList?.contains('toc') ||
    node.classList?.contains('mw-editsection'),
  replacement: () => '',
});

turndown.addRule('lazyImage', {
  filter: 'img',
  replacement: (content, node) => {
    const alt = node.getAttribute('alt') || '';
    const src = node.getAttribute('data-src') || node.getAttribute('src') || '';
    if (!src || src.startsWith('data:')) return '';
    return `![${alt}](${src})`;
  },
});

turndown.addRule('resolveWikiLinks', {
  filter: (node) => node.nodeName === 'A' && (node.getAttribute('href') || '').startsWith('/wiki/'),
  replacement: (content, node) => {
    const href = node.getAttribute('href');
    if (!content.trim()) return '';
    return `[${content}](${WIKI_ORIGIN}${href})`;
  },
});

// ─── Helpers ────────────────────────────────────────────────────────────────
const BR_PLACEHOLDER = '@@BR@@';
function escapeForMdx(md) {
  return md.split('<br/>').join(BR_PLACEHOLDER).split('<').join('&lt;').split(BR_PLACEHOLDER).join('<br/>').split('{').join('&#123;');
}

async function fetchPageHtml(title) {
  const url = new URL(WIKI_API);
  url.search = new URLSearchParams({ action: 'parse', page: title, prop: 'text', format: 'json', formatversion: '2' }).toString();
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (data.error) throw new Error(data.error.info);
  return typeof data.parse.text === 'string' ? data.parse.text : data.parse.text['*'];
}

function buildFrontmatter({ title, slug, sidebarPosition }) {
  const lines = ['---', `title: ${JSON.stringify(title)}`, `slug: ${slug}`];
  if (sidebarPosition !== undefined) lines.push(`sidebar_position: ${sidebarPosition}`);
  lines.push('---', '');
  return lines.join('\n');
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  for (const page of PAGES) {
    const { locale, fandomTitle, outFile, docTitle, slug, isHome, englishLabel, flagEmoji } = page;
    console.log(`Fetching [${locale}] "${fandomTitle}"...`);

    let markdown;
    try {
      const html = await fetchPageHtml(fandomTitle);
      markdown = turndown.turndown(html);
      markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();
      markdown = escapeForMdx(markdown);
    } catch (err) {
      console.error(`  ✗ Échec: ${err.message}`);
      continue;
    }

    const outDir = path.join(ROOT, 'i18n', locale, 'docusaurus-plugin-content-docs', 'current');
    await mkdir(outDir, { recursive: true });

    const frontmatter = buildFrontmatter({ title: docTitle, slug: isHome ? '/' : slug, sidebarPosition: isHome ? 1 : undefined });
    const enSlug = isHome ? '' : slug.replace(/^\//, '');
    const enUrl = `/rpg-mo-wiki/${enSlug}`;
    const banner = `> ${flagEmoji} ${englishLabel} version — original English title: **${englishLabel}** — <a href="${enUrl}">see the English page</a>\n\n`;

    const content = frontmatter + banner + markdown + '\n';
    await writeFile(path.join(outDir, outFile), content, 'utf-8');
    console.log(`  ✓ i18n/${locale}/.../${outFile}`);
    await new Promise((r) => setTimeout(r, 300));
  }
  console.log('\nTerminé.');
}

main();

