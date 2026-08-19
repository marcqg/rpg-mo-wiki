#!/usr/bin/env node
// generate-database-pages.mjs
// Génère des pages Markdown enrichies avec icônes et données complètes
// à partir des données extraites du jeu (data/game/ et data/modb/) vers docs/database/.

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA_GAME_DIR = path.join(ROOT, 'data', 'game');
const DATA_MODB_DIR = path.join(ROOT, 'data', 'modb');
const OUT_DIR = path.join(ROOT, 'docs', 'database');
const STATIC_DIR = path.join(ROOT, 'static');

const MAX_ROWS_PER_PAGE = Infinity;

function slugify(str) {
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

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

async function writePage(dir, slug, title, body) {
  const frontmatter = ['---', `title: ${JSON.stringify(title)}`, '---', ''].join('\n');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, `${slug}.md`), frontmatter + body + '\n', 'utf-8');
}

async function loadJson(fileName) {
  const gamePath = path.join(DATA_GAME_DIR, fileName);
  const modbPath = path.join(DATA_MODB_DIR, fileName);
  if (existsSync(gamePath)) {
    return JSON.parse(await readFile(gamePath, 'utf-8'));
  }
  if (existsSync(modbPath)) {
    return JSON.parse(await readFile(modbPath, 'utf-8'));
  }
  return [];
}

async function loadAll() {
  const [items, recipes, mobs, vendors, pets, petBreeds] = await Promise.all([
    loadJson('items.json'),
    loadJson('recipes.json'),
    loadJson('mobs.json'),
    loadJson('vendors.json'),
    loadJson('pets.json'),
    loadJson('pet_breeds.json'),
  ]);
  return { items, recipes, mobs, vendors, pets, petBreeds };
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

const ITEM_SLOTS = {
  0: 'Helmet',
  1: 'Cape',
  2: 'Chest',
  3: 'Right Hand',
  4: 'Left Hand',
  5: 'Gloves',
  6: 'Boots',
  7: 'Amulet',
  8: 'Ring',
  9: 'None',
  10: 'Magic',
  11: 'Pants',
  12: 'Pet',
  16: 'Key',
  20: 'Arrow',
  21: 'Spirit',
};

const STATS_EXCLUDE = new Set([
  'wearable', 'visible', 'slot', 'price', 'enchant_id', 'enchants_from',
  'att_anim', 'no_present', 'sc', 'desc', 'carpentry_type', 'carpentry_id',
  'farming_id', 'fungiculture_id', 'pet', 'item_id',
]);

function itemIcon(id, name) {
  const relPath = `/img/items/${id}.png`;
  const absPath = path.join(STATIC_DIR, 'img', 'items', `${id}.png`);
  if (existsSync(absPath)) {
    return `![${name}](${relPath})`;
  }
  return '—';
}

function petIcon(id, name) {
  const relPath = `/img/pets/${id}.png`;
  const absPath = path.join(STATIC_DIR, 'img', 'pets', `${id}.png`);
  if (existsSync(absPath)) {
    return `![${name}](${relPath})`;
  }
  return '—';
}

function mobIcon(id, name) {
  const relPath = `/img/mobs/${id}.png`;
  const absPath = path.join(STATIC_DIR, 'img', 'mobs', `${id}.png`);
  if (existsSync(absPath)) {
    return `![${name}](${relPath})`;
  }
  return '—';
}

function itemStats(item) {
  const params = item.params || {};
  const parts = [];

  if (params.slot !== undefined && ITEM_SLOTS[params.slot]) {
    parts.push(`Slot: ${ITEM_SLOTS[params.slot]}`);
  }
  if (params.power !== undefined) parts.push(`Power: ${params.power}`);
  if (params.aim !== undefined) parts.push(`Aim: ${params.aim}`);
  if (params.armor !== undefined) parts.push(`Armor: ${params.armor}`);
  if (params.magic !== undefined) parts.push(`Magic: ${params.magic}`);
  if (params.speed !== undefined) parts.push(`Speed: ${params.speed}`);
  if (params.heal !== undefined) parts.push(`Heal: ${params.heal}`);

  // Requirements
  const reqs = [];
  if (params.min_accuracy) reqs.push(`Accuracy ${params.min_accuracy}`);
  if (params.min_defense) reqs.push(`Defense ${params.min_defense}`);
  if (params.min_strength) reqs.push(`Strength ${params.min_strength}`);
  if (params.min_magic) reqs.push(`Magic ${params.min_magic}`);
  if (params.min_archery) reqs.push(`Archery ${params.min_archery}`);
  if (reqs.length > 0) parts.push(`Req: ${reqs.join(', ')}`);

  // Other remaining params
  for (const [k, v] of Object.entries(params)) {
    if (STATS_EXCLUDE.has(k)) continue;
    if (['power', 'aim', 'armor', 'magic', 'speed', 'heal', 'min_accuracy', 'min_defense', 'min_strength', 'min_magic', 'min_archery'].includes(k)) continue;
    if (v && typeof v === 'object') continue;
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
      const rows = part.map((it) => [
        itemIcon(it.id, it.n),
        it.n,
        fmtNumber(it.params?.price),
        itemStats(it),
      ]);
      const body = `## ${title}\n\n${table(['Icon', 'Name', 'Price', 'Stats'], rows)}\n`;
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
    const skill = (r.skill || 'Other').toLowerCase();
    if (!bySkill.has(skill)) bySkill.set(skill, []);
    bySkill.get(skill).push(r);
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
        return [
          itemIcon(r.id, r.n),
          r.n,
          r.level,
          r.xp,
          chance,
          materials,
        ];
      });
      const body = `## ${title}\n\n${table(['Icon', 'Name', 'Level', 'XP', 'Chance', 'Materials'], rows)}\n`;
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
    const locs = Object.keys(m.locations || {});
    if (locs.length === 0) {
      if (!byZone.has('Unknown Location')) byZone.set('Unknown Location', []);
      byZone.get('Unknown Location').push(m);
    } else {
      for (const zone of locs) {
        if (!byZone.has(zone)) byZone.set(zone, []);
        byZone.get(zone).push(m);
      }
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
        mobIcon(m.id, m.n),
        m.n,
        m.params?.combat_level ?? '—',
        m.params?.health ?? '—',
        m.params?.aggressive ? 'Yes' : 'No',
        drops,
      ];
    });
    const body = `## ${zone}\n\n${table(['Icon', 'Name', 'Combat Level', 'Health', 'Aggressive', 'Drops'], rows)}\n`;
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

async function generatePets(pets, petBreeds, itemById) {
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
        petIcon(p.id, p.n),
        p.n,
        fmtNumber(p.params?.xp_required),
        p.params?.happiness ?? '—',
        p.params?.breeding_level ?? '—',
        eats,
      ];
    });
    const body = `## ${rarity}\n\n${table(['Icon', 'Name', 'XP Required', 'Happiness', 'Breeding Level', 'Eats'], rows)}\n`;
    await writePage(dir, slugify(rarity), rarity, body);
    pageCount++;
  }

  // Breeding Guide / Matrix Page
  if (petBreeds && petBreeds.length > 0) {
    const rows = petBreeds.map((b) => {
      const p1 = b.parent1?.name ?? '—';
      const p2 = b.parent2?.name ?? '—';
      const p1Icon = b.parent1?.b_i !== undefined ? petIcon(b.parent1.b_i, p1) : '';
      const p2Icon = b.parent2?.b_i !== undefined ? petIcon(b.parent2.b_i, p2) : '';
      
      const offspring = (b.offspring || [])
        .map((o) => {
          const name = itemById.get(o.id) ?? `#${o.id}`;
          const chance = o.show_both ? `${o.min}–${o.max}%` : `${o.min}%`;
          const icon = itemIcon(o.id, name);
          return `${icon} ${name} (${chance})`;
        })
        .join('\n');

      return [
        `${p1Icon} ${p1}`.trim(),
        `${p2Icon} ${p2}`.trim(),
        b.level ?? '—',
        `${b.time ?? '—'} min`,
        b.xp ?? '—',
        offspring,
      ];
    });

    const body = `## Pet Breeding Combinations\n\n${table(
      ['Parent 1', 'Parent 2', 'Breeding Level', 'Duration', 'XP', 'Offspring (Chances)'],
      rows
    )}\n`;
    await writePage(dir, 'breeding', 'Breeding & Combinations', body);
    pageCount++;
  }

  console.log(`pets: ${pageCount} pages (${pets.length} familiers, ${byRarity.size} raretés + breeding)`);
}

async function generateIndex() {
  await mkdir(OUT_DIR, { recursive: true });
  await writeCategoryJson(OUT_DIR, 'Database', 3);
  const title = 'Database';
  const body = `
Cette section contient l'intégralité des données du jeu RPG MO, synchronisées directement avec les fichiers officiels de [data.mo.ee](https://data.mo.ee) et enrichies de toutes les icônes de sprites.

- **Items** — 5 500+ objets avec icônes, statistiques, emplacements d'équipement et prix
- **Recipes** — 3 000+ recettes d'artisanat par compétence (Forging, Carpentry, Fletching, Cooking, Alchemy, Wizardry...)
- **Mobs** — 900+ monstres, boss et PNJs avec points de vie, niveau de combat et tables de drops
- **Vendors** — marchands et inventaires de vente
- **Pets** — familiers groupés par rareté et **matrice complète de reproduction (Breeding)**

Voir [Sources et remerciements](/sources) pour l'attribution complète.
`;
  await writePage(OUT_DIR, 'index', title, body);
}

async function main() {
  console.log('Chargement des données...');
  const { items, recipes, mobs, vendors, pets, petBreeds } = await loadAll();
  const itemById = new Map(items.map((it) => [it.id, it.n]));

  for (const sub of ['items', 'recipes', 'mobs', 'vendors', 'pets', 'index.md']) {
    await rm(path.join(OUT_DIR, sub), { recursive: true, force: true });
  }

  await generateIndex();
  await generateItems(items);
  await generateRecipes(recipes, itemById);
  await generateMobs(mobs, itemById);
  await generateVendors(vendors, itemById);
  await generatePets(pets, petBreeds, itemById);

  console.log('Terminé.');
}

main();
