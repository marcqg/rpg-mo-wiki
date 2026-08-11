#!/usr/bin/env node
// Range les pages migrées du wiki Fandom (docs/*.md) dans des sous-dossiers
// thématiques (docs/wiki/<section>/) en s'appuyant sur les vraies catégories
// MediaWiki du wiki d'origine (voir scripts/fetch-wiki-categories.mjs), avec
// des heuristiques de titre en repli pour les pages non catégorisées.
//
// Chaque page garde son `slug` de frontmatter existant, donc son URL ne
// change pas : ce script ne fait que déplacer les fichiers pour réorganiser
// la sidebar, sans casser de liens.
//
// Usage: node scripts/reorganize-wiki.mjs

import { readFile, readdir, rename, mkdir, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';

const DOCS_DIR = path.resolve(import.meta.dirname, '..', 'docs');
const WIKI_DIR = path.join(DOCS_DIR, 'wiki');
const CATEGORIES_FILE = path.resolve(import.meta.dirname, '..', 'data', 'wiki-categories.json');

// Pages qui restent à la racine, non concernées par le classement.
const EXCLUDED_FILES = new Set(['main-page.md', 'liens-utiles.md', 'sources.md']);

const META_CATS = new Set([
  'Template documentation', 'Pages with broken file links', 'Candidates for deletion',
  'General wiki templates', 'Disambiguations', 'Lacks Image', 'Needs Improvement', 'Templates',
  'Image wiki templates', 'Infobox templates', 'Stub', 'Help', 'Table templates', 'Blog posts',
  'Community', 'Forums', 'Site maintenance', 'Videos', 'Article management templates', 'Browse',
  'Site administration', 'Category templates', 'Hidden categories', 'Images', 'Watercooler',
  'Help desk', 'Policy', 'Pages using duplicate arguments in template calls', 'Article stubs',
  'Content', 'Feature', 'Getting Started', 'Informational Page', 'Organization', 'Files',
]);

// Ordre de priorité: une page peut matcher plusieurs groupes (ex: un objet
// "Forging Items" ET "Equipment"), on prend le premier groupe de la liste
// qui matche.
const GROUP_ORDER = ['monstres-boss', 'pets', 'pnj', 'nourriture', 'equipement', 'collecte', 'competences'];

const GROUP_LABELS = {
  'collecte': 'Collecte',
  'pets': 'Pets',
  'monstres-boss': 'Monstres & Boss',
  'equipement': 'Équipement',
  'competences': 'Compétences',
  'pnj': 'PNJ',
  'nourriture': 'Nourriture',
  'autres': 'Autres',
};

const CATEGORY_TO_GROUP = {};
function register(group, cats) {
  for (const c of cats) CATEGORY_TO_GROUP[c] = group;
}
register('collecte', [
  'Ores', 'Mining', 'Tree', 'Woodcutting', 'Woodcutting Items', 'Woodcutting Loot',
  'Raw Fish', 'Fishing', 'Fishing Masters', 'Seeds', 'Farming', 'Farming Items', 'Farming Loot',
  'Alchemy Materials', 'Materials', 'Mining Potions', 'Souls', 'Steel', 'Ingots',
]);
register('pets', ['Pets']);
register('monstres-boss', ['Mob', 'Monster', 'Boss', 'Firelord']);
register('equipement', [
  'Weapons', 'Armor', 'Items', 'Tools', 'Wings', 'Jewelry', 'Shield', 'Boots', 'Helmet',
  'Head Armor', 'Gloves', 'Pants', 'Wands', 'Capes', 'Body Armor', 'Leg Armor', 'Neck Equipment',
  'Armor Set', 'Two-Handed Weapons', 'Guild Permission', 'Craftable Loot', 'Equipment', 'Chests',
  'Event Items', 'Event Item', 'Forging Items', 'Alchemy Items', 'Carpentry Items',
  'Fletching Items', 'Jewelry Items', 'Wizardry Items', 'Enchanting Scrolls',
]);
register('competences', [
  'Skills', 'Skill', 'Crafting', 'Forging', 'Enchanting', 'Alchemy', 'Magic', 'Spells',
  'Fletching', 'Carpentry', 'Wizardry', 'Combat', 'Strength',
]);
register('pnj', ['NPCs', 'Dorpat NPCs', 'Reval NPCs', 'NPCs by location', 'NPC vendor']);
register('nourriture', ['Food', 'Cooked Fish', 'Potions', 'Small Potions']);

// Heuristiques de repli sur le titre, appliquées seulement aux pages sans
// groupe déterminé par une vraie catégorie.
const TITLE_HEURISTICS = [
  { group: 'pets', pattern: /\((Common|Rare|Legendary|Ancient|Artifact)\)$/i },
  { group: 'equipement', pattern: /\+\d+$/ },
  { group: 'equipement', pattern: /Arrow$/i },
];

function slugify(str) {
  return String(str).trim().toLowerCase().replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function classify(title, categories) {
  const realCats = categories.filter((c) => !META_CATS.has(c));
  const matched = new Set();
  for (const c of realCats) {
    const g = CATEGORY_TO_GROUP[c];
    if (g) matched.add(g);
  }
  for (const g of GROUP_ORDER) {
    if (matched.has(g)) return g;
  }
  for (const { group, pattern } of TITLE_HEURISTICS) {
    if (pattern.test(title)) return group;
  }
  return 'autres';
}

async function writeCategoryJson(dir, label, position, key) {
  await mkdir(dir, { recursive: true });
  const json = key ? { label, position, key } : { label, position };
  await writeFile(path.join(dir, '_category_.json'), JSON.stringify(json, null, 2) + '\n');
}

async function main() {
  const categories = JSON.parse(await readFile(CATEGORIES_FILE, 'utf-8'));
  const files = (await readdir(DOCS_DIR)).filter((f) => f.endsWith('.md') && !EXCLUDED_FILES.has(f));

  await writeCategoryJson(WIKI_DIR, 'Wiki (Fandom)', 2);
  let pos = 1;
  for (const group of [...GROUP_ORDER, 'autres']) {
    // "wiki-<group>" évite un conflit de clé de traduction avec les
    // catégories de même nom sous docs/database/ (ex: "Pets").
    await writeCategoryJson(path.join(WIKI_DIR, group), GROUP_LABELS[group], pos++, `wiki-${group}`);
  }

  const counts = {};
  for (const file of files) {
    const filePath = path.join(DOCS_DIR, file);
    const content = await readFile(filePath, 'utf-8');
    const m = content.match(/^title: (.+)$/m);
    if (!m) continue;
    let title = m[1].trim();
    if (title.startsWith('"') && title.endsWith('"')) title = JSON.parse(title);

    const cats = categories[title] || [];
    const group = classify(title, cats);
    counts[group] = (counts[group] || 0) + 1;

    const destDir = path.join(WIKI_DIR, group);
    const destPath = path.join(destDir, file);
    await rename(filePath, destPath);
  }

  console.log('Répartition:', counts);
  console.log('Terminé.');
}

main();
