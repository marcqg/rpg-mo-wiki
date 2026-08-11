#!/usr/bin/env node
// Retire le bandeau d'attribution par page (une ligne "> ..." juste après le
// frontmatter) de toutes les pages générées. L'attribution centralisée vit
// désormais sur docs/sources.md (voir aussi les générateurs, mis à jour pour
// ne plus insérer ce bandeau).
//
// Usage: node scripts/strip-attribution.mjs

import { readFile, writeFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const DOCS_DIR = path.resolve(import.meta.dirname, '..', 'docs');

const ATTRIBUTION_PREFIXES = [
  "> Traduit/adapté du [RPG MO Wiki]",
  "> Données extraites de [modb]",
  "> Données extraites de [rpgmobob.com]",
  "> Résumé (traduit et mis en tableau) du guide",
];

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

function stripAttribution(content) {
  const lines = content.split('\n');
  // Trouve la fin du frontmatter (deuxième ligne "---")
  if (lines[0] !== '---') return { content, changed: false };
  let end = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i] === '---') { end = i; break; }
  }
  if (end === -1) return { content, changed: false };

  // La ligne d'attribution est la première ligne non vide après le frontmatter.
  let i = end + 1;
  while (i < lines.length && lines[i].trim() === '') i++;
  if (i >= lines.length) return { content, changed: false };

  const isAttribution = ATTRIBUTION_PREFIXES.some((p) => lines[i].startsWith(p));
  if (!isAttribution) return { content, changed: false };

  // Retire la ligne d'attribution, garde une seule ligne vide de séparation.
  const before = lines.slice(0, end + 1);
  let after = lines.slice(i + 1);
  while (after.length > 0 && after[0].trim() === '') after.shift();
  const newLines = [...before, '', ...after];
  return { content: newLines.join('\n'), changed: true };
}

async function main() {
  const files = await walk(DOCS_DIR);
  let changed = 0;
  for (const file of files) {
    const content = await readFile(file, 'utf-8');
    const result = stripAttribution(content);
    if (result.changed) {
      await writeFile(file, result.content, 'utf-8');
      changed++;
    }
  }
  console.log(`${changed} / ${files.length} pages modifiées.`);
}

main();
