#!/usr/bin/env node
// Extrait les données des outils de bobdylan sur rpgmobob.com (Farming,
// Fungiculture, Fishing Spots, World Map, liens utiles) depuis le code
// source public du site (https://github.com/thomporter/rpgmobob.com),
// distinct de modb.rpgmobob.com (voir scripts/fetch-modb.mjs).
//
// Contrairement à modb, ce site est un dépôt GitHub public avec du code
// source TypeScript lisible (pas un bundle minifié) : on récupère les
// fichiers de données directement et on en extrait le littéral JS.
//
// Usage: node scripts/fetch-rpgmobob.mjs
// Écrit data/rpgmobob/{farming,fungiculture,fishingSpots,worldMap,homeLinks}.json

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const REPO_RAW = 'https://raw.githubusercontent.com/thomporter/rpgmobob.com/main';
const OUT_DIR = path.resolve(import.meta.dirname, '..', 'data', 'rpgmobob');

// Pour chaque fichier source: le nom de la variable qui contient le tableau
// de données, et le nom de sortie.
const SOURCES = [
  { file: 'src/lib/farmingData.ts', varName: 'farmingData', out: 'farming' },
  { file: 'src/lib/fungiData.ts', varName: 'fungiData', out: 'fungiculture' },
  { file: 'src/lib/fishingSpots.ts', varName: 'fishingSpots', out: 'fishingSpots' },
  { file: 'src/lib/worldMapData.ts', varName: 'worldMapData', out: 'worldMap' },
  { file: 'src/lib/homeLinks.ts', varName: 'homeLinks', out: 'homeLinks' },
];

// Trouve la position du littéral `[...]` assigné à `varName` dans un fichier
// TS simple (pas de bundle minifié ici, donc un bracket-matcher respectant
// les chaînes suffit, pas besoin d'un vrai parseur).
function extractArrayLiteral(source, varName) {
  const marker = `const ${varName}`;
  const declStart = source.indexOf(marker);
  if (declStart === -1) throw new Error(`Variable "${varName}" introuvable`);
  const eq = source.indexOf('=', declStart);

  // La valeur peut être un tableau `[...]` ou un objet `{...}` : on prend le
  // premier des deux qui apparaît après le `=`.
  let i = eq + 1;
  while (i < source.length && /\s/.test(source[i])) i++;
  const openChar = source[i];
  const closeChar = openChar === '[' ? ']' : openChar === '{' ? '}' : null;
  if (!closeChar) throw new Error(`Valeur inattendue pour "${varName}": "${openChar}"`);
  const bracketStart = i;

  let depth = 0;
  const n = source.length;
  while (i < n) {
    const c = source[i];
    if (c === '"' || c === "'" || c === '`') {
      const quote = c;
      i++;
      while (i < n) {
        if (source[i] === '\\') { i += 2; continue; }
        if (source[i] === quote) { i++; break; }
        i++;
      }
      continue;
    }
    if (c === openChar) depth++;
    if (c === closeChar) {
      depth--;
      if (depth === 0) return source.slice(bracketStart, i + 1);
    }
    i++;
  }
  throw new Error(`Littéral non terminé pour "${varName}"`);
}

async function main() {
  await mkdir(OUT_DIR, { recursive: true });
  for (const { file, varName, out } of SOURCES) {
    const res = await fetch(`${REPO_RAW}/${file}`);
    if (!res.ok) throw new Error(`HTTP ${res.status} pour ${file}`);
    const source = await res.text();
    const literal = extractArrayLiteral(source, varName);
    const data = new Function('return (' + literal + ')')();
    await writeFile(path.join(OUT_DIR, `${out}.json`), JSON.stringify(data));
    console.log(`  ${out}: ${data.length} entrées -> data/rpgmobob/${out}.json`);
  }
}

main();
