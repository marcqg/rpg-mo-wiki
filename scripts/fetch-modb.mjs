#!/usr/bin/env node
// Extrait les bases de données (Items, Recipes, Mobs, Vendors, Pets) depuis
// le bundle JS de modb.rpgmobob.com (https://modb.rpgmobob.com/#/), une base
// de données communautaire pour RPG MO, plus complète et à jour que le wiki
// Fandom. Les données sont embarquées en dur dans le bundle JS de l'app (pas
// d'API JSON publique) sous forme de littéraux JS (pas du JSON strict:
// clés non citées, `!0`/`!1` pour booléens). On les repère par leur "forme"
// (les clés du premier élément de chaque gros tableau d'objets) plutôt que
// par un offset fixe dans le fichier, pour rester robuste aux mises à jour
// du site source.
//
// Usage: node scripts/fetch-modb.mjs
// Écrit data/modb/{items,recipes,mobs,vendors,pets}.json

import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { parse } from 'acorn';

const MODB_ORIGIN = 'https://modb.rpgmobob.com';
const OUT_DIR = path.resolve(import.meta.dirname, '..', 'data', 'modb');

// Signature = ensemble de clés attendues sur le premier élément du tableau.
// On matche par sous-ensemble (le tableau doit contenir au moins ces clés)
// pour tolérer l'ajout de nouveaux champs côté modb sans casser le script.
const SIGNATURES = {
  items: ['id', 'n', 't', 'img', 'params'],
  recipes: ['id', 'n', 'level', 'skill', 'matts', 'pattern'],
  mobs: ['id', 'n', 't', 'img', 'params', 'locations'],
  vendors: ['id', 'n', 'map', 'coords'],
  pets: ['id', 'n', 'item_id', 'params'],
};

async function findAppBundleUrl() {
  const res = await fetch(MODB_ORIGIN + '/');
  const html = await res.text();
  const match = html.match(/src="(\/?js\/app\.[a-z0-9]+\.js)"/);
  if (!match) throw new Error("Impossible de trouver le bundle app.*.js dans index.html");
  const src = match[1].startsWith('/') ? match[1] : '/' + match[1];
  return MODB_ORIGIN + src;
}

function objectKeys(objectExpressionNode) {
  return objectExpressionNode.properties
    .map((p) => p.key && (p.key.name ?? p.key.value))
    .filter(Boolean);
}

function findDataArrays(sourceText) {
  const ast = parse(sourceText, { ecmaVersion: 2022, sourceType: 'script' });
  const found = {}; // name -> {start, end, count}

  function matches(keys, signature) {
    return signature.every((k) => keys.includes(k));
  }

  function walk(node) {
    if (!node || typeof node.type !== 'string') return;
    if (node.type === 'ArrayExpression' && node.elements.length > 50) {
      const first = node.elements[0];
      if (first && first.type === 'ObjectExpression') {
        const keys = objectKeys(first);
        for (const [name, signature] of Object.entries(SIGNATURES)) {
          if (!found[name] && matches(keys, signature)) {
            found[name] = { start: node.start, end: node.end, count: node.elements.length };
          }
        }
      }
    }
    for (const key in node) {
      if (key === 'start' || key === 'end' || key === 'loc' || key === 'range') continue;
      const val = node[key];
      if (Array.isArray(val)) {
        for (const v of val) if (v && typeof v.type === 'string') walk(v);
      } else if (val && typeof val.type === 'string') {
        walk(val);
      }
    }
  }

  walk(ast);
  return found;
}

async function main() {
  console.log('Résolution du bundle app.*.js...');
  const bundleUrl = await findAppBundleUrl();
  console.log(`Bundle: ${bundleUrl}`);

  const res = await fetch(bundleUrl);
  const source = await res.text();
  console.log(`Bundle téléchargé: ${(source.length / 1e6).toFixed(1)} Mo`);

  console.log('Analyse du bundle (acorn) pour localiser les jeux de données...');
  const found = findDataArrays(source);

  const missing = Object.keys(SIGNATURES).filter((k) => !found[k]);
  if (missing.length > 0) {
    console.error(`Jeux de données introuvables (structure modb probablement changée): ${missing.join(', ')}`);
  }

  await mkdir(OUT_DIR, { recursive: true });
  for (const [name, info] of Object.entries(found)) {
    const literal = source.slice(info.start, info.end);
    // Ce sont des littéraux JS de données pures (pas d'appels de fonction),
    // extraits par acorn depuis le bundle officiel du site — sûr à évaluer.
    const data = new Function('return (' + literal + ')')();
    await writeFile(path.join(OUT_DIR, `${name}.json`), JSON.stringify(data));
    console.log(`  ${name}: ${data.length} entrées -> data/modb/${name}.json`);
  }
}

main();
