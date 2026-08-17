#!/usr/bin/env node
// Génère des pages Markdown groupées par sous-catégorie à partir des données
// extraites de modb.rpgmobob.com (voir scripts/fetch-modb.mjs) dans
// data/modb/*.json, vers docs/database/.

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA_DIR = path.join(ROOT, 'data', 'modb');
const OUT_DIR = path.join(ROOT, 'docs', 'database');
const MODB_URL = 'https://modb.rpgmobob.com/#/';
const MAX_ROWS_PER_PAGE = Infinity;

function slugify(str) {
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// Même logique d'échappement MDX que scripts/fetch-wiki.mjs : `<` et `{`
// cassent la compilation MDX de Docusaurus s'ils ne sont pas échappés.
const BR_PLACEHOLDER = '@@BR@@';
function mdxSafe(value) {
  return String(value)
    .split('<br/>').join(BR_PLACEHOLDER)
    .split('<').join('&lt;')
    .split(BR_PLACEHOLDER).join('<br/>')
    .split('{').join('&#123;');
}

function cell(value) {
  const flat = String(value ?? '').trim().replace(/\r?\n+/g, '<br/>');
  return mdxSafe(flat) || '—';
}

function table(headers, rows) {
  const head = `| ${headers.join(' | ')} |`;
  const sep = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((r) => `| ${r.map(cell).join(' | ')} |`).join('\n');
  return `${head}\n${sep}\n${body}`;
}

function chunkBy(sortedItems, maxSize) {
  const chunks = [];
  for (let i = 0; i < sortedItems.length; i += maxSize) {
    chunks.push(sortedItems.slice(i, i + maxSize));
  }
  return chunks;
}

function fmtNumber(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '—';
  return n.toLocaleString('en-US');
}

async function writeCategoryJson(dir, label, position, key) {
  await mkdir(dir, { recursive: true });
  const json = key ? { label, position, key } : { label, position };
  await writeFile(path.join(dir, '_category_.json'), JSON.stringify(json, null, 2) + '\n');
}

// L'attribution à la source (modb) vit sur docs/sources.md, pas sur chaque
// page individuelle.
async function writePage(dir, slug, title, body) {
  const frontmatter = ['---', `title: ${JSON.stringify(title)}`, '---', ''].join('\n');
  await writeFile(path.join(dir, `${slug}.md`), frontmatter + body + '\n', 'utf-8');
}

async function loadAll() {
  const names = ['items', 'recipes', 'mobs', 'vendors', 'pets'];
  const data = {};
  for (const name of names) {
    data[name] = JSON.parse(await readFile(path.join(DATA_DIR, `${name}.json`), 'utf-8'));
  }
  return data;
}

const ITEM_CATEGORIES = {
  0: 'Armor',
  1: 'Food',
  2: 'Jewelry',
  3: 'Material',
  4: 'Tool',
  5: 'Weapon',
  6: 'Spell',
  7: 'Pet Item',
  8: 'House',
  9: 'Archery',
};

// Clés de `params` à ne pas afficher telles quelles dans la colonne Stats
// (détails d'implémentation internes au client du jeu, pas utiles côté wiki).
const STATS_EXCLUDE = new Set([
  'wearable', 'visible', 'slot', 'price', 'enchant_id', 'enchants_from',
  'att_anim', 'no_present', 'sc', 'desc', 'carpentry_type', 'carpentry_id',
]);

function itemStats(item) {
  const params = item.params || {};
  const parts = [];
  for (const [k, v] of Object.entries(params)) {
    if (STATS_EXCLUDE.has(k)) continue;
    if (v && typeof v === 'object') continue; // structures imbriquées (ex: visible) déjà exclues sinon
    parts.push(`${k}: ${v}`);
  }
  return parts.join(', ');
}

async function generateItems(items) {
  const dir = path.join(OUT_DIR, 'items');
  await writeCategoryJson(dir, 'Items', 2);

  const byCategory = new Map();
  for (const it of items) {
    const cat = ITEM_CATEGORIES[it.t] ?? `Unknown (${it.t})`;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat).push(it);
  }

  let pageCount = 0;
  for (const [cat, list] of byCategory) {
    list.sort((a, b) => a.n.localeCompare(b.n));
    const chunks = chunkBy(list, MAX_ROWS_PER_PAGE);
    for (let i = 0; i < chunks.length; i++) {
      const part = chunks[i];
      const suffix = chunks.length > 1 ? `-${i + 1}` : '';
      const title = chunks.length > 1 ? `${cat} (${i + 1}/${chunks.length})` : cat;
      const rows = part.map((it) => [it.n, fmtNumber(it.params?.price), itemStats(it)]);
      const body = `## ${title}\n\n${table(['Name', 'Price', 'Stats'], rows)}\n`;
      await writePage(dir, `${slugify(cat)}${suffix}`, title, body);
      pageCount++;
    }
  }
  console.log(`items: ${pageCount} pages (${items.length} entrées, ${byCategory.size} catégories)`);
}

async function generateRecipes(recipes, itemById) {
  const dir = path.join(OUT_DIR, 'recipes');
  await writeCategoryJson(dir, 'Recipes', 3);

  const bySkill = new Map();
  for (const r of recipes) {
    if (!bySkill.has(r.skill)) bySkill.set(r.skill, []);
    bySkill.get(r.skill).push(r);
  }

  let pageCount = 0;
  for (const [skill, list] of bySkill) {
    list.sort((a, b) => a.n.localeCompare(b.n));
    const chunks = chunkBy(list, MAX_ROWS_PER_PAGE);
    const label = skill.charAt(0).toUpperCase() + skill.slice(1);
    for (let i = 0; i < chunks.length; i++) {
      const part = chunks[i];
      const suffix = chunks.length > 1 ? `-${i + 1}` : '';
      const title = chunks.length > 1 ? `${label} (${i + 1}/${chunks.length})` : label;
      const rows = part.map((r) => {
        const chance = r.min_chance === r.max_chance ? `${r.min_chance}%` : `${r.min_chance}–${r.max_chance}%`;
        const materials = (r.matts || [])
          .map((m) => `${m.c}× ${itemById.get(Number(m.id)) ?? `#${m.id}`}`)
          .join('\n');
        return [r.n, r.level, r.xp, chance, materials];
      });
      const body = `## ${title}\n\n${table(['Name', 'Level', 'XP', 'Chance', 'Materials'], rows)}\n`;
      await writePage(dir, `${slugify(skill)}${suffix}`, title, body);
      pageCount++;
    }
  }
  console.log(`recipes: ${pageCount} pages (${recipes.length} entrées, ${bySkill.size} compétences)`);
}

async function generateMobs(mobs, itemById) {
  const dir = path.join(OUT_DIR, 'mobs');
  await writeCategoryJson(dir, 'Mobs', 4);

  const byZone = new Map();
  for (const m of mobs) {
    for (const zone of Object.keys(m.locations || {})) {
      if (!byZone.has(zone)) byZone.set(zone, []);
      byZone.get(zone).push(m);
    }
  }

  let pageCount = 0;
  for (const [zone, list] of byZone) {
    const dedup = [...new Map(list.map((m) => [m.id, m])).values()];
    dedup.sort((a, b) => a.n.localeCompare(b.n));
    const rows = dedup.map((m) => {
      const drops = (m.params?.drops || [])
        .slice()
        .sort((a, b) => (b.actualChance ?? b.chance) - (a.actualChance ?? a.chance))
        .map((d) => `${itemById.get(d.id) ?? `#${d.id}`} (${d.actualChance ?? (d.chance * 100).toFixed(2)}%)`)
        .join('\n');
      return [
        m.n,
        m.params?.combat_level ?? '—',
        m.params?.health ?? '—',
        m.params?.aggressive ? 'Yes' : 'No',
        drops,
      ];
    });
    const body = `## ${zone}\n\n${table(['Name', 'Combat Level', 'Health', 'Aggressive', 'Drops'], rows)}\n`;
    await writePage(dir, slugify(zone), zone, body);
    pageCount++;
  }
  console.log(`mobs: ${pageCount} pages (${mobs.length} entrées, ${byZone.size} zones)`);
}

async function generateVendors(vendors, itemById) {
  const dir = path.join(OUT_DIR, 'vendors');
  await writeCategoryJson(dir, 'Vendors', 5);

  const byMap = new Map();
  for (const v of vendors) {
    const map = v.map && v.map !== 'undefined' ? v.map : 'Unknown Location';
    if (!byMap.has(map)) byMap.set(map, []);
    byMap.get(map).push(v);
  }

  let pageCount = 0;
  for (const [map, list] of byMap) {
    list.sort((a, b) => a.n.localeCompare(b.n));
    const rows = list.map((v) => {
      const coords = v.coords ? `(${v.coords.x}, ${v.coords.y})` : '—';
      const content = v.temp?.content || [];
      let sells;
      if (content.length > 0) {
        sells = content.map((c) => itemById.get(c.id) ?? `#${c.id}`).join('\n');
      } else if (typeof v.temp?.general === 'number') {
        sells = `General goods (${(v.temp.general * 100).toFixed(0)}% markup)`;
      } else {
        sells = '—';
      }
      return [v.n, coords, sells];
    });
    const body = `## ${map}\n\n${table(['Name', 'Coordinates', 'Sells'], rows)}\n`;
    await writePage(dir, slugify(map), map, body);
    pageCount++;
  }
  console.log(`vendors: ${pageCount} pages (${vendors.length} entrées, ${byMap.size} lieux)`);
}

async function generatePets(pets, itemById) {
  const dir = path.join(OUT_DIR, 'pets');
  await writeCategoryJson(dir, 'Pets', 6, 'database-pets');

  const byRarity = new Map();
  for (const p of pets) {
    const m = p.n.match(/\[(.*?)\]/);
    const rarity = m ? m[1] : 'Other';
    if (!byRarity.has(rarity)) byRarity.set(rarity, []);
    byRarity.get(rarity).push(p);
  }

  let pageCount = 0;
  for (const [rarity, list] of byRarity) {
    list.sort((a, b) => a.n.localeCompare(b.n));
    const rows = list.map((p) => {
      const eats = Object.entries(p.params?.eats || {})
        .map(([id, weight]) => `${itemById.get(Number(id)) ?? `#${id}`} (${(weight * 100).toFixed(0)}%)`)
        .join('\n');
      return [
        p.n,
        fmtNumber(p.params?.xp_required),
        p.params?.happiness ?? '—',
        p.params?.breeding_level ?? '—',
        eats,
      ];
    });
    const body = `## ${rarity}\n\n${table(['Name', 'XP Required', 'Happiness', 'Breeding Level', 'Eats'], rows)}\n`;
    await writePage(dir, slugify(rarity), rarity, body);
    pageCount++;
  }
  console.log(`pets: ${pageCount} pages (${pets.length} entrées, ${byRarity.size} raretés)`);
}

async function generateIndex() {
  await mkdir(OUT_DIR, { recursive: true });
  await writeCategoryJson(OUT_DIR, 'Database (modb)', 3);
  const title = 'Database (modb)';
  const body = `
Cette section complète le wiki avec les données du jeu extraites de [modb](${MODB_URL}) : objets, monstres, recettes, vendeurs et familiers. Contrairement aux pages du wiki (texte libre traduit/adapté), ces pages sont des tableaux générés automatiquement depuis les données brutes du jeu.

- **Items** — tous les objets du jeu, groupés par catégorie
- **Recipes** — recettes d'artisanat, groupées par compétence
- **Mobs** — monstres, groupés par zone
- **Vendors** — marchands, groupés par lieu
- **Pets** — familiers, groupés par rareté

Ces pages sont régénérées via \`scripts/fetch-modb.mjs\` puis \`scripts/generate-database-pages.mjs\` — voir le README.

Voir [Sources et remerciements](/sources) pour l'attribution complète.
`;
  await writePage(OUT_DIR, 'index', title, body);
}

async function main() {
  console.log('Chargement des données modb...');
  const { items, recipes, mobs, vendors, pets } = await loadAll();
  const itemById = new Map(items.map((it) => [it.id, it.n]));

  // On repart d'un dossier propre pour éviter des pages orphelines si le
  // découpage en catégories change d'une exécution à l'autre. On ne touche
  // qu'aux sous-dossiers gérés par ce script (pas docs/database/guides/,
  // géré par scripts/generate-bob-pages.mjs).
  for (const sub of ['items', 'recipes', 'mobs', 'vendors', 'pets', 'index.md']) {
    await rm(path.join(OUT_DIR, sub), { recursive: true, force: true });
  }

  await generateIndex();
  await generateItems(items);
  await generateRecipes(recipes, itemById);
  await generateMobs(mobs, itemById);
  await generateVendors(vendors, itemById);
  await generatePets(pets, itemById);

  console.log('Terminé.');
}

main();
