#!/usr/bin/env node
// generate-game-data-pages.mjs
// Génère docs/game-data/ à partir de data/game/ (données extraites directement
// de data.mo.ee via fetch-game-data.mjs) et injecte une section récapitulative
// sur toutes les pages d'accueil (EN + FR + KO + PL + PT).

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA_GAME_DIR = path.join(ROOT, 'data', 'game');
const OUT_DIR = path.join(ROOT, 'docs', 'game-data');
const STATIC_DIR = path.join(ROOT, 'static');

const HOMEPAGE_MARKER_START = '{/* LIVE-GAME-DATA-START */}';
const HOMEPAGE_MARKER_END   = '{/* LIVE-GAME-DATA-END */}';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function slugify(str) {
  return String(str).trim().toLowerCase()
    .replace(/'/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const BR_PH = '@@BR@@';
function mdxSafe(value) {
  return String(value)
    .split('<br/>').join(BR_PH).split('<').join('&lt;')
    .split(BR_PH).join('<br/>').split('{').join('&#123;');
}
function cell(value) {
  return mdxSafe(String(value ?? '').trim().replace(/\r?\n+/g, '<br/>')) || '—';
}
function table(headers, rows) {
  const head = `| ${headers.join(' | ')} |`;
  const sep  = `| ${headers.map(() => '---').join(' | ')} |`;
  const body = rows.map((r) => `| ${r.map(cell).join(' | ')} |`).join('\n');
  return `${head}\n${sep}\n${body}`;
}
function fmtNumber(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '—';
  return n.toLocaleString('en-US');
}
function fmtCount(n) { return Number(n).toLocaleString('en-US'); }

function itemIcon(id, name) {
  if (existsSync(path.join(STATIC_DIR, 'img', 'items', `${id}.png`)))
    return `![${name}](/img/items/${id}.png)`;
  return '—';
}
function petIcon(id, name) {
  if (existsSync(path.join(STATIC_DIR, 'img', 'pets', `${id}.png`)))
    return `![${name}](/img/pets/${id}.png)`;
  return '—';
}
function mobIcon(id, name) {
  if (existsSync(path.join(STATIC_DIR, 'img', 'mobs', `${id}.png`)))
    return `![${name}](/img/mobs/${id}.png)`;
  return '—';
}

async function writeCategoryJson(dir, label, position) {
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, '_category_.json'),
    JSON.stringify({ label, position }, null, 2) + '\n');
}
async function writePage(dir, slug, title, body) {
  const fm = ['---', `title: ${JSON.stringify(title)}`, '---', ''].join('\n');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, `${slug}.md`), fm + body + '\n', 'utf-8');
}
async function loadJson(fileName) {
  const p = path.join(DATA_GAME_DIR, fileName);
  if (existsSync(p)) return JSON.parse(await readFile(p, 'utf-8'));
  return [];
}

// ─── Constantes jeu ──────────────────────────────────────────────────────────

const ITEM_CATEGORIES = {
  0: 'Armor', 1: 'Food', 2: 'Jewelry', 3: 'Material', 4: 'Tool',
  5: 'Weapon', 6: 'Spell', 7: 'Pet Item', 8: 'House', 9: 'Archery',
};
const ITEM_SLOTS = {
  0:'Helmet',1:'Cape',2:'Chest',3:'Right Hand',4:'Left Hand',5:'Gloves',
  6:'Boots',7:'Amulet',8:'Ring',9:'None',10:'Magic',11:'Pants',
  12:'Pet',16:'Key',20:'Arrow',21:'Spirit',
};
const STATS_EXCLUDE = new Set([
  'wearable','visible','slot','price','enchant_id','enchants_from',
  'att_anim','no_present','sc','desc','carpentry_type','carpentry_id',
  'farming_id','fungiculture_id','pet','item_id',
]);

function itemStats(item) {
  const p = item.params || {};
  const parts = [];
  if (p.slot !== undefined && ITEM_SLOTS[p.slot]) parts.push(`Slot: ${ITEM_SLOTS[p.slot]}`);
  if (p.power  !== undefined) parts.push(`Power: ${p.power}`);
  if (p.aim    !== undefined) parts.push(`Aim: ${p.aim}`);
  if (p.armor  !== undefined) parts.push(`Armor: ${p.armor}`);
  if (p.magic  !== undefined) parts.push(`Magic: ${p.magic}`);
  if (p.speed  !== undefined) parts.push(`Speed: ${p.speed}`);
  if (p.heal   !== undefined) parts.push(`Heal: ${p.heal}`);
  const reqs = [];
  if (p.min_accuracy) reqs.push(`Accuracy ${p.min_accuracy}`);
  if (p.min_defense)  reqs.push(`Defense ${p.min_defense}`);
  if (p.min_strength) reqs.push(`Strength ${p.min_strength}`);
  if (p.min_magic)    reqs.push(`Magic ${p.min_magic}`);
  if (p.min_archery)  reqs.push(`Archery ${p.min_archery}`);
  if (reqs.length > 0) parts.push(`Req: ${reqs.join(', ')}`);
  for (const [k, v] of Object.entries(p)) {
    if (STATS_EXCLUDE.has(k)) continue;
    if (['power','aim','armor','magic','speed','heal',
         'min_accuracy','min_defense','min_strength','min_magic','min_archery'].includes(k)) continue;
    if (v && typeof v === 'object') continue;
    parts.push(`${k}: ${v}`);
  }
  return parts.join(', ');
}

function petRarity(petName) {
  const m = String(petName).match(/\[(.+?)\]$/);
  return m ? m[1] : 'Other';
}

// ─── Générateurs de pages ─────────────────────────────────────────────────────

async function generateItems(items) {
  const dir = path.join(OUT_DIR, 'items');
  await writeCategoryJson(dir, 'Items', 2);
  const byCategory = new Map();
  for (const it of items) {
    const cat = ITEM_CATEGORIES[it.t] ?? `Unknown (${it.t})`;
    if (!byCategory.has(cat)) byCategory.set(cat, []);
    byCategory.get(cat).push(it);
  }
  const stats = {};
  let pageCount = 0;
  for (const [cat, list] of byCategory) {
    stats[cat] = list.length;
    list.sort((a, b) => a.n.localeCompare(b.n));
    const rows = list.map((it) => [
      itemIcon(it.id, it.n), it.n, fmtNumber(it.params?.price), itemStats(it),
    ]);
    const body = `## ${cat}\n\n${table(['Icon', 'Name', 'Price', 'Stats'], rows)}\n`;
    await writePage(dir, slugify(cat), cat, body);
    pageCount++;
  }
  console.log(`  items: ${pageCount} pages (${items.length} entrées)`);
  return stats;
}

async function generateMobs(mobs, itemById) {
  const dir = path.join(OUT_DIR, 'mobs');
  await writeCategoryJson(dir, 'Mobs', 3);
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
  const zoneSlugs = new Map();
  for (const [zone, list] of byZone) {
    const dedup = [...new Map(list.map((m) => [m.id, m])).values()];
    dedup.sort((a, b) => a.n.localeCompare(b.n));
    const rows = dedup.map((m) => {
      const drops = (m.params?.drops || []).slice()
        .sort((a, b) => (b.actualChance ?? b.chance) - (a.actualChance ?? a.chance))
        .map((d) => `${itemById.get(d.id) ?? `#${d.id}`} (${d.actualChance ?? (d.chance * 100).toFixed(2)}%)`)
        .join('\n');
      return [mobIcon(m.id, m.n), m.n, m.params?.combat_level ?? '—',
              m.params?.health ?? '—', m.params?.aggressive ? 'Yes' : 'No', drops];
    });
    const body = `## ${zone}\n\n${table(['Icon','Name','Combat Level','Health','Aggressive','Drops'], rows)}\n`;
    const slug = slugify(zone);
    await writePage(dir, slug, zone, body);
    zoneSlugs.set(zone, slug);
    pageCount++;
  }
  console.log(`  mobs: ${pageCount} pages (${mobs.length} entrées)`);
  return { zoneCount: pageCount, firstSlug: zoneSlugs.get('Dorpat') ?? [...zoneSlugs.values()][0] };
}

async function generatePets(pets, itemById) {
  const dir = path.join(OUT_DIR, 'pets');
  await writeCategoryJson(dir, 'Pets', 4);
  const byRarity = new Map();
  for (const p of pets) {
    const rarity = petRarity(p.n);
    if (!byRarity.has(rarity)) byRarity.set(rarity, []);
    byRarity.get(rarity).push(p);
  }
  const stats = {};
  let pageCount = 0;
  for (const [rarity, list] of byRarity) {
    stats[rarity] = list.length;
    list.sort((a, b) => a.n.localeCompare(b.n));
    const rows = list.map((p) => {
      const eats = Object.entries(p.params?.eats || {})
        .map(([id, w]) => `${itemById.get(Number(id)) ?? `#${id}`} (${(w * 100).toFixed(0)}%)`)
        .join('\n');
      return [petIcon(p.id, p.n), p.n, fmtNumber(p.params?.xp_required),
              p.params?.happiness ?? '—', p.params?.breeding_level ?? '—', eats];
    });
    const body = `## ${rarity}\n\n${table(
      ['Icon','Name','XP Required','Happiness','Breeding Level','Eats'], rows)}\n`;
    await writePage(dir, slugify(rarity), rarity, body);
    pageCount++;
  }
  console.log(`  pets: ${pageCount} pages (${pets.length} entrées)`);
  return stats;
}

async function generateRecipes(recipes, itemById) {
  const dir = path.join(OUT_DIR, 'recipes');
  await writeCategoryJson(dir, 'Recipes', 5);
  const bySkill = new Map();
  for (const r of recipes) {
    const skill = (r.skill || 'Other').toLowerCase();
    if (!bySkill.has(skill)) bySkill.set(skill, []);
    bySkill.get(skill).push(r);
  }
  const stats = {};
  let pageCount = 0;
  for (const [skill, list] of bySkill) {
    stats[skill] = list.length;
    list.sort((a, b) => (a.n ?? '').localeCompare(b.n ?? ''));
    const label = skill.charAt(0).toUpperCase() + skill.slice(1);
    const rows = list.map((r) => {
      const chance = r.min_chance === r.max_chance
        ? `${r.min_chance}%` : `${r.min_chance}–${r.max_chance}%`;
      const materials = (r.matts || [])
        .map((m) => `${m.c}× ${itemById.get(Number(m.id)) ?? `#${m.id}`}`).join('\n');
      return [itemIcon(r.id, r.n), r.n ?? '—', r.level ?? '—', r.xp ?? '—', chance, materials];
    });
    const body = `## ${label}\n\n${table(['Icon','Name','Level','XP','Chance','Materials'], rows)}\n`;
    await writePage(dir, skill, label, body);
    pageCount++;
  }
  console.log(`  recipes: ${pageCount} pages (${recipes.length} entrées)`);
  return stats;
}

async function generateIndex(allStats) {
  await writeCategoryJson(OUT_DIR, 'Live Game Data', 4);
  const { itemStats, mobStats, petStats, recipeStats } = allStats;
  const totalItems   = Object.values(itemStats).reduce((a, b) => a + b, 0);
  const totalPets    = Object.values(petStats).reduce((a, b) => a + b, 0);
  const totalRecipes = Object.values(recipeStats).reduce((a, b) => a + b, 0);
  const body = `
This section contains data extracted **directly from the official RPG MO game files** at [data.mo.ee](https://data.mo.ee).  
It is refreshed by running \`node scripts/fetch-game-data.mjs\` then \`node scripts/generate-game-data-pages.mjs\`.

| Section | Total | Sub-categories |
| --- | --- | --- |
| [Items](./items/armor) | ${fmtCount(totalItems)} objects | Armor · Weapon · Material · Jewelry · Pet Item · Archery · House · Food · Tool · Spell |
| [Mobs](./mobs/${mobStats.firstSlug}) | ${fmtCount(mobStats.totalMobs)} enemies | ${mobStats.zoneCount} zones |
| [Pets](./pets/common) | ${fmtCount(totalPets)} companions | Common · Rare · Legendary · Ancient · Artifact · Egg |
| [Recipes](./recipes/forging) | ${fmtCount(totalRecipes)} formulas | Forging · Alchemy · Fletching · Wizardry · Mining · Carpentry · Jewelry · Fishing · Cooking · Farming · Woodcutting · Fungiculture · Breeding |

See [Sources & Credits](/sources) for full attribution.
`;
  await writePage(OUT_DIR, 'index', 'Live Game Data', body);
}

// ─── Injection homepage ───────────────────────────────────────────────────────

function buildHomepageBlock(locale, allStats) {
  const { itemStats, mobStats, petStats, recipeStats } = allStats;
  const totalItems   = Object.values(itemStats).reduce((a, b) => a + b, 0);
  const totalPets    = Object.values(petStats).reduce((a, b) => a + b, 0);
  const totalRecipes = Object.values(recipeStats).reduce((a, b) => a + b, 0);
  const today = new Date().toISOString().slice(0, 10);
  const firstMobSlug = mobStats.firstSlug;

  const i18n = {
    en: {
      title: '## 🎮 Live Game Data',
      intro: `> All data below is extracted directly from the official game files at [data.mo.ee](https://data.mo.ee) — automatically generated and kept in sync.\n> *Last updated: ${today}*`,
      itemsHeader: `### 🗡️ Items — ${fmtCount(totalItems)} objects`,
      catCol: 'Category', countCol: 'Entries', linkCol: 'Browse',
      mobsHeader: `### 👾 Mobs — ${fmtCount(mobStats.totalMobs)} enemies across ${mobStats.zoneCount} zones`,
      mobsLink: `[Browse all zones →](/game-data/mobs/${firstMobSlug})`,
      petsHeader: `### 🐾 Pets — ${fmtCount(totalPets)} companions`,
      recipesHeader: `### 📖 Recipes — ${fmtCount(totalRecipes)} crafting formulas`,
      skillCol: 'Skill',
    },
    fr: {
      title: '## 🎮 Données du jeu en direct',
      intro: `> Toutes les données ci-dessous sont extraites directement des fichiers officiels du jeu sur [data.mo.ee](https://data.mo.ee) — générées automatiquement et maintenues à jour.\n> *Dernière mise à jour : ${today}*`,
      itemsHeader: `### 🗡️ Objets — ${fmtCount(totalItems)} entrées`,
      catCol: 'Catégorie', countCol: 'Entrées', linkCol: 'Voir',
      mobsHeader: `### 👾 Monstres — ${fmtCount(mobStats.totalMobs)} ennemis dans ${mobStats.zoneCount} zones`,
      mobsLink: `[Parcourir toutes les zones →](/game-data/mobs/${firstMobSlug})`,
      petsHeader: `### 🐾 Familiers — ${fmtCount(totalPets)} compagnons`,
      recipesHeader: `### 📖 Recettes — ${fmtCount(totalRecipes)} formules d'artisanat`,
      skillCol: 'Compétence',
    },
    ko: {
      title: '## 🎮 라이브 게임 데이터',
      intro: `> 아래 데이터는 공식 게임 파일 [data.mo.ee](https://data.mo.ee)에서 직접 추출된 것으로, 자동으로 생성되어 최신 상태로 유지됩니다.\n> *마지막 업데이트: ${today}*`,
      itemsHeader: `### 🗡️ 아이템 — ${fmtCount(totalItems)}개`,
      catCol: '카테고리', countCol: '수량', linkCol: '보기',
      mobsHeader: `### 👾 몬스터 — ${mobStats.zoneCount}개 지역의 ${fmtCount(mobStats.totalMobs)}마리`,
      mobsLink: `[모든 지역 보기 →](/game-data/mobs/${firstMobSlug})`,
      petsHeader: `### 🐾 펫 — ${fmtCount(totalPets)}마리`,
      recipesHeader: `### 📖 레시피 — ${fmtCount(totalRecipes)}개 공식`,
      skillCol: '스킬',
    },
    pl: {
      title: '## 🎮 Dane z gry na żywo',
      intro: `> Wszystkie poniższe dane są wyodrębnione bezpośrednio z oficjalnych plików gry na [data.mo.ee](https://data.mo.ee) — generowane automatycznie i synchronizowane.\n> *Ostatnia aktualizacja: ${today}*`,
      itemsHeader: `### 🗡️ Przedmioty — ${fmtCount(totalItems)} wpisów`,
      catCol: 'Kategoria', countCol: 'Liczba', linkCol: 'Przeglądaj',
      mobsHeader: `### 👾 Potwory — ${fmtCount(mobStats.totalMobs)} wrogów w ${mobStats.zoneCount} strefach`,
      mobsLink: `[Przeglądaj wszystkie strefy →](/game-data/mobs/${firstMobSlug})`,
      petsHeader: `### 🐾 Zwierzaki — ${fmtCount(totalPets)} towarzyszy`,
      recipesHeader: `### 📖 Receptury — ${fmtCount(totalRecipes)} receptur`,
      skillCol: 'Umiejętność',
    },
    pt: {
      title: '## 🎮 Dados do Jogo em Tempo Real',
      intro: `> Todos os dados abaixo são extraídos diretamente dos arquivos oficiais do jogo em [data.mo.ee](https://data.mo.ee) — gerados automaticamente e mantidos atualizados.\n> *Última atualização: ${today}*`,
      itemsHeader: `### 🗡️ Itens — ${fmtCount(totalItems)} entradas`,
      catCol: 'Categoria', countCol: 'Entradas', linkCol: 'Ver',
      mobsHeader: `### 👾 Monstros — ${fmtCount(mobStats.totalMobs)} inimigos em ${mobStats.zoneCount} zonas`,
      mobsLink: `[Ver todas as zonas →](/game-data/mobs/${firstMobSlug})`,
      petsHeader: `### 🐾 Pets — ${fmtCount(totalPets)} companheiros`,
      recipesHeader: `### 📖 Receitas — ${fmtCount(totalRecipes)} fórmulas`,
      skillCol: 'Habilidade',
    },
  };

  const t = i18n[locale] ?? i18n.en;
  const ITEM_CAT_ORDER = ['Armor','Weapon','Material','Jewelry','Pet Item','Archery','House','Food','Tool','Spell'];
  const itemRows = ITEM_CAT_ORDER.filter((c) => itemStats[c])
    .map((c) => [c, fmtCount(itemStats[c]), `[→](/game-data/items/${slugify(c)})`]);
  const PET_RARITY_ORDER = ['Common','Rare','Legendary','Ancient','Artifact','Egg'];
  const petRows = PET_RARITY_ORDER.filter((r) => petStats[r])
    .map((r) => [r, fmtCount(petStats[r]), `[→](/game-data/pets/${slugify(r)})`]);
  const RECIPE_SKILL_ORDER = ['forging','fletching','wizardry','alchemy','mining','jewelry',
    'carpentry','fishing','cooking','woodcutting','farming','fungiculture','breeding'];
  const recipeRows = RECIPE_SKILL_ORDER.filter((s) => recipeStats[s])
    .map((s) => [s.charAt(0).toUpperCase()+s.slice(1), fmtCount(recipeStats[s]), `[→](/game-data/recipes/${s})`]);

  return [
    HOMEPAGE_MARKER_START, '',
    t.title, '',
    t.intro, '',
    t.itemsHeader, '',
    table([t.catCol, t.countCol, t.linkCol], itemRows), '',
    t.mobsHeader, '',
    t.mobsLink, '',
    t.petsHeader, '',
    table([t.catCol, t.countCol, t.linkCol], petRows), '',
    t.recipesHeader, '',
    table([t.skillCol, t.countCol, t.linkCol], recipeRows), '',
    HOMEPAGE_MARKER_END,
  ].join('\n');
}

async function updateHomepage(filePath, locale, allStats) {
  if (!existsSync(filePath)) {
    console.log(`  [skip] fichier introuvable : ${filePath}`);
    return;
  }
  let content = await readFile(filePath, 'utf-8');
  const block = buildHomepageBlock(locale, allStats);
  if (content.includes(HOMEPAGE_MARKER_START)) {
    const startIdx = content.indexOf(HOMEPAGE_MARKER_START);
    const endIdx   = content.indexOf(HOMEPAGE_MARKER_END);
    if (endIdx === -1) {
      content = content.slice(0, startIdx) + block;
    } else {
      content = content.slice(0, startIdx) + block + content.slice(endIdx + HOMEPAGE_MARKER_END.length);
    }
  } else {
    content = content.trimEnd() + '\n\n' + block + '\n';
  }
  await writeFile(filePath, content, 'utf-8');
  console.log(`  ✅ ${path.relative(ROOT, filePath)}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

// Labels traduits pour les _category_.json i18n
const I18N_CATEGORY_LABELS = {
  fr: { 'game-data': 'Données du Jeu', items: 'Objets', mobs: 'Monstres', pets: 'Familiers', recipes: 'Recettes' },
  ko: { 'game-data': '게임 데이터',    items: '아이템', mobs: '몬스터',    pets: '펫',       recipes: '레시피' },
  pl: { 'game-data': 'Dane z Gry',     items: 'Przedmioty', mobs: 'Potwory', pets: 'Zwierzaki', recipes: 'Receptury' },
  pt: { 'game-data': 'Dados do Jogo',  items: 'Itens',      mobs: 'Monstros', pets: 'Pets',     recipes: 'Receitas' },
};
const CATEGORY_POSITIONS = { 'game-data': 4, items: 2, mobs: 3, pets: 4, recipes: 5 };

async function generateI18nCategories() {
  const i18nBase = path.join(ROOT, 'i18n');
  for (const [locale, labels] of Object.entries(I18N_CATEGORY_LABELS)) {
    for (const [folder, label] of Object.entries(labels)) {
      const dir = folder === 'game-data'
        ? path.join(i18nBase, locale, 'docusaurus-plugin-content-docs', 'current', 'game-data')
        : path.join(i18nBase, locale, 'docusaurus-plugin-content-docs', 'current', 'game-data', folder);
      await mkdir(dir, { recursive: true });
      await writeFile(
        path.join(dir, '_category_.json'),
        JSON.stringify({ label, position: CATEGORY_POSITIONS[folder] }, null, 2) + '\n',
      );
    }
    console.log(`  ✅ i18n/${locale}/game-data/ (${Object.keys(labels).length} catégories)`);
  }
}

async function main() {
  console.log('📂 Chargement des données de data/game/...');
  const [items, mobs, pets, recipes] = await Promise.all([
    loadJson('items.json'), loadJson('mobs.json'),
    loadJson('pets.json'),  loadJson('recipes.json'),
  ]);
  const itemById = new Map(items.map((it) => [it.id, it.n]));
  console.log(`   Items: ${items.length} | Mobs: ${mobs.length} | Pets: ${pets.length} | Recipes: ${recipes.length}`);

  console.log('\n🧹 Nettoyage de docs/game-data/...');
  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });

  console.log('\n📝 Génération des pages...');
  const [itemStats, mobResult, petStats, recipeStats] = await Promise.all([
    generateItems(items),
    generateMobs(mobs, itemById),
    generatePets(pets, itemById),
    generateRecipes(recipes, itemById),
  ]);
  const allStats = {
    itemStats,
    mobStats: { ...mobResult, totalMobs: mobs.length },
    petStats,
    recipeStats,
  };
  await generateIndex(allStats);

  console.log('\n🌍 Génération des _category_.json traduits (i18n)...');
  await generateI18nCategories();

  console.log('\n🏠 Injection de la section dans les pages d\'accueil...');
  const i18nBase = path.join(ROOT, 'i18n');
  const homepages = [
    { file: path.join(ROOT, 'docs', 'main-page.md'), locale: 'en' },
    { file: path.join(i18nBase, 'fr', 'docusaurus-plugin-content-docs', 'current', 'main-page.md'), locale: 'fr' },
    { file: path.join(i18nBase, 'ko', 'docusaurus-plugin-content-docs', 'current', 'main-page.md'), locale: 'ko' },
    { file: path.join(i18nBase, 'pl', 'docusaurus-plugin-content-docs', 'current', 'main-page.md'), locale: 'pl' },
    { file: path.join(i18nBase, 'pt', 'docusaurus-plugin-content-docs', 'current', 'main-page.md'), locale: 'pt' },
  ];
  for (const { file, locale } of homepages) {
    await updateHomepage(file, locale, allStats);
  }

  console.log('\n✅ Génération terminée !');
  console.log('   → docs/game-data/ créé (Items / Mobs / Pets / Recipes)');
  console.log('   → Section injectée dans les 5 pages d\'accueil');
}

main().catch((err) => {
  console.error('Erreur :', err);
  process.exit(1);
});
