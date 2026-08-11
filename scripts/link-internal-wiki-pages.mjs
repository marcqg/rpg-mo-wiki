#!/usr/bin/env node
// Réécrit les liens vers rpg-mo.fandom.com dans les pages migrées (docs/wiki/)
// pour pointer vers la page interne équivalente quand elle existe sur ce
// site, au lieu du wiki Fandom d'origine. Les liens vers des pages non
// migrées (ou vers des espaces de noms hors contenu, ex: Category:, File:)
// restent inchangés, pointant vers Fandom.
//
// À exécuter après scripts/fetch-wiki.mjs et scripts/reorganize-wiki.mjs,
// puisqu'il s'appuie sur le slug final (post-déduplication) de chaque page.
//
// Usage:
//   node scripts/link-internal-wiki-pages.mjs                  # docs/wiki (anglais)
//   node scripts/link-internal-wiki-pages.mjs <dossier-cible>   # ex: pages traduites en i18n/fr/...

import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const DOCS_DIR = path.resolve(import.meta.dirname, '..', 'docs');
const WIKI_DIR = path.join(DOCS_DIR, 'wiki');
const TARGET_DIR = process.argv[2] ? path.resolve(process.argv[2]) : WIKI_DIR;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  let files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files = files.concat(await walk(full));
    else if (e.name.endsWith('.md')) files.push(full);
  }
  return files;
}

function readFrontmatter(content) {
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return {};
  const fm = {};
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    if (value.startsWith('"') && value.endsWith('"')) value = JSON.parse(value);
    fm[kv[1]] = value;
  }
  return fm;
}

// Reproduit le titre de page Fandom depuis le chemin d'URL /wiki/<...>.
function decodeFandomTitle(urlPathSegment) {
  try {
    return decodeURIComponent(urlPathSegment).replace(/_/g, ' ');
  } catch {
    return urlPathSegment.replace(/_/g, ' ');
  }
}

async function buildTitleToSlugMap() {
  const files = [
    ...(await walk(WIKI_DIR)),
    path.join(DOCS_DIR, 'main-page.md'),
  ];
  const map = new Map();
  for (const file of files) {
    let content;
    try {
      content = await readFile(file, 'utf-8');
    } catch {
      continue;
    }
    const { title, slug } = readFrontmatter(content);
    if (title && slug) map.set(title, slug);
  }
  return map;
}

const FANDOM_LINK_RE = /https:\/\/rpg-mo\.fandom\.com\/wiki\/([^)"\s]+)/g;

async function main() {
  const titleToSlug = await buildTitleToSlugMap();
  console.log(`${titleToSlug.size} pages internes connues.`);

  const files = await walk(TARGET_DIR);
  let filesChanged = 0;
  let linksRewritten = 0;
  let linksKeptExternal = 0;

  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    if (!FANDOM_LINK_RE.test(content)) continue;
    FANDOM_LINK_RE.lastIndex = 0;

    let changed = false;
    // Remplacement en une seule passe sur le contenu d'origine : évite qu'une
    // URL courte (ex: .../wiki/Cactus) ne corrompe une URL dont elle est le
    // préfixe littéral (ex: .../wiki/Cactus_Log) lors d'un split/join naïf.
    const newContent = content.replace(FANDOM_LINK_RE, (fullMatch, pathPart) => {
      const [pagePath, fragment] = pathPart.split('#');
      const title = decodeFandomTitle(pagePath);
      const slug = titleToSlug.get(title);
      if (!slug) {
        linksKeptExternal++;
        return fullMatch;
      }
      linksRewritten++;
      changed = true;
      return slug + (fragment ? `#${fragment}` : '');
    });

    if (changed) {
      await writeFile(file, newContent, 'utf-8');
      filesChanged++;
    }
  }

  console.log(`Terminé: ${filesChanged} fichiers modifiés, ${linksRewritten} liens internalisés, ${linksKeptExternal} liens laissés vers Fandom (page non migrée).`);
}

main();
