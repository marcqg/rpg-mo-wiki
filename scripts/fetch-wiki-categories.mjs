#!/usr/bin/env node
// Récupère les catégories MediaWiki de chaque page migrée dans docs/ (hors
// docs/database/) depuis l'API Fandom, pour permettre de ranger les pages
// dans des sections thématiques (voir scripts/reorganize-wiki.mjs).
//
// Usage: node scripts/fetch-wiki-categories.mjs
// Écrit data/wiki-categories.json : { "<titre>": ["Cat1", "Cat2", ...] }

import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const WIKI_API = 'https://rpg-mo.fandom.com/api.php';
const DOCS_DIR = path.resolve(import.meta.dirname, '..', 'docs');
const OUT_FILE = path.resolve(import.meta.dirname, '..', 'data', 'wiki-categories.json');

async function loadTitles() {
  const files = (await readdir(DOCS_DIR)).filter((f) => f.endsWith('.md'));
  const titles = [];
  for (const f of files) {
    const content = await readFile(path.join(DOCS_DIR, f), 'utf-8');
    const m = content.match(/^title: (.+)$/m);
    if (!m) continue;
    let t = m[1].trim();
    if (t.startsWith('"') && t.endsWith('"')) t = JSON.parse(t);
    titles.push(t);
  }
  return titles;
}

async function fetchCategoriesBatch(batch) {
  const params = new URLSearchParams({
    action: 'query',
    prop: 'categories',
    titles: batch.join('|'),
    cllimit: '50',
    format: 'json',
    formatversion: '2',
  });
  const res = await fetch(`${WIKI_API}?${params.toString()}`);
  const data = await res.json();
  return data.query.pages;
}

async function main() {
  const titles = await loadTitles();
  console.log(`${titles.length} pages à classer.`);

  const result = {};
  for (let i = 0; i < titles.length; i += 50) {
    const batch = titles.slice(i, i + 50);
    const pages = await fetchCategoriesBatch(batch);
    for (const p of pages) {
      result[p.title] = (p.categories || []).map((c) => c.title.replace(/^Category:/, ''));
    }
    process.stdout.write('.');
    await new Promise((r) => setTimeout(r, 150));
  }
  console.log();

  await mkdir(path.dirname(OUT_FILE), { recursive: true });
  await writeFile(OUT_FILE, JSON.stringify(result));
  console.log(`Terminé: ${Object.keys(result).length} pages -> data/wiki-categories.json`);
}

main();
