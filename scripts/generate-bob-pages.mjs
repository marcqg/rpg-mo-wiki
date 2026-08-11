#!/usr/bin/env node
// Génère les pages Markdown pour les outils de bobdylan (rpgmobob.com) à
// partir de data/rpgmobob/*.json (voir scripts/fetch-rpgmobob.mjs), vers
// docs/database/guides/, plus une page "Liens utiles" à la racine du wiki.

import { readFile, writeFile, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA_DIR = path.join(ROOT, 'data', 'rpgmobob');
const GUIDES_DIR = path.join(ROOT, 'docs', 'database', 'guides');
const DOCS_DIR = path.join(ROOT, 'docs');
const SITE_ORIGIN = 'https://www.rpgmobob.com';

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

function slugify(str) {
  return String(str)
    .trim()
    .toLowerCase()
    .replace(/'/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// L'attribution à la source (rpgmobob.com) vit sur docs/sources.md, pas sur
// chaque page individuelle.
async function writePage(dir, slug, title, body) {
  const frontmatter = ['---', `title: ${JSON.stringify(title)}`, '---', ''].join('\n');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, `${slug}.md`), frontmatter + body + '\n', 'utf-8');
}

async function load(name) {
  return JSON.parse(await readFile(path.join(DATA_DIR, `${name}.json`), 'utf-8'));
}

async function generateFarming() {
  const data = await load('farming');
  data.sort((a, b) => a.level - b.level || a.seed.localeCompare(b.seed));
  const rows = data.map((d) => [
    d.seed, d.level, d.cost, d.xp, d.time, d.grows, d.sells_for, d.buy_from, d.sell_to,
  ]);
  const body = `## Farming\n\n${table(
    ['Seed', 'Level', 'Cost', 'XP', 'Time (min)', 'Grows Into', 'Sells For', 'Buy From', 'Sell To'],
    rows,
  )}\n`;
  await writePage(GUIDES_DIR, 'farming', 'Farming', body);
  console.log(`farming: 1 page (${data.length} entrées)`);
}

async function generateFungiculture() {
  const data = await load('fungiculture');
  data.sort((a, b) => a.level - b.level || a.spore.localeCompare(b.spore));
  const rows = data.map((d) => {
    const locations = (d.locations || []).map((l) => `${l.l} (${l.n})`).join('\n');
    return [
      d.spore, d.level, d.cost, d.xp, d.time, d.grows, d.sells_for,
      d.spores_npc, d.shroom_npc, locations,
    ];
  });
  const body = `## Fungiculture\n\n${table(
    ['Spore', 'Level', 'Cost', 'XP', 'Time (min)', 'Grows Into', 'Sells For', 'Spore Vendor', 'Mushroom Buyer', 'Growing Locations'],
    rows,
  )}\n`;
  await writePage(GUIDES_DIR, 'fungiculture', 'Fungiculture', body);
  console.log(`fungiculture: 1 page (${data.length} entrées)`);
}

async function generateFishingSpots() {
  const data = await load('fishingSpots');
  let sections = [];
  let total = 0;
  for (const [tool, ranges] of Object.entries(data)) {
    sections.push(`## ${tool}`);
    for (const [range, spots] of Object.entries(ranges)) {
      const rows = spots.map((s) => [s.location, s.coords, s.optimal ? 'Yes' : 'No', s.notes]);
      total += spots.length;
      sections.push(`### Levels ${range}\n\n${table(['Location', 'Coordinates', 'Optimal', 'Notes'], rows)}`);
    }
  }
  await writePage(GUIDES_DIR, 'fishing-spots', 'Fishing Spots', sections.join('\n\n'));
  console.log(`fishing-spots: 1 page (${total} spots)`);
}

async function generateWorldMap() {
  const data = await load('worldMap');
  const names = [...new Set(data.map((d) => d.name))].sort((a, b) => a.localeCompare(b));
  const { existsSync } = await import('node:fs');
  const mobsDir = path.join(ROOT, 'docs', 'database', 'mobs');
  const rows = names.map((n) => {
    const mobSlug = slugify(n);
    const hasMobPage = existsSync(path.join(mobsDir, `${mobSlug}.md`));
    const mobLink = hasMobPage ? `[Monsters in ${n}](/database/mobs/${mobSlug})` : '—';
    return [n, mobLink];
  });
  const body = `## Zones\n\nListe des zones de la carte du monde. La carte interactive elle-même (avec navigation visuelle) reste disponible sur le site d'origine.\n\n${table(
    ['Zone', 'See also'],
    rows,
  )}\n`;
  await writePage(GUIDES_DIR, 'world-map', 'World Map', body);
  console.log(`world-map: 1 page (${names.length} zones)`);
}

async function generateCombatLevel() {
  const body = `## Combat Level Formula\n
According to bobdylan's [Combat Level Calculator](${SITE_ORIGIN}/cl), Combat Level is calculated from the character's stats (accuracy, strength, defense, health, magic, archery):

\`\`\`
opt1 = accuracy + strength + defense + magic + health
opt2 = accuracy + strength + defense + archery + health

magic_mod  = magic   > opt2 / 4 ? 4 : 6
archery_mod = archery > opt1 / 4 ? 4 : 6

combat_level = floor(
  (accuracy + strength + defense + health) / 4
  + magic / magic_mod
  + archery / archery_mod
)
\`\`\`

The idea: "physical" stats (accuracy, strength, defense, health) always count fully; magic and archery only count fully (divided by 4) if they exceed a quarter of the total of the other offensive stats, otherwise they count for less (divided by 6). This prevents a hybrid character from stacking a disproportionate combat level.
`;
  await writePage(GUIDES_DIR, 'combat-level', 'Combat Level', body);
  console.log('combat-level: 1 page');
}

// Contrairement aux autres guides (données structurées de rpgmobob.com), ce
// guide vient d'une page tierce (sulphate, sur zybuluo.com) faite de
// captures d'écran annotées à la main montrant des chemins de minage. On ne
// reproduit pas ces images (travail créatif de l'auteur) : seules les
// informations factuelles qu'elles montrent (matériau, niveau, zone,
// distance, obstacles) sont reprises ici, traduites en anglais et mises en
// tableau, avec attribution vers la page d'origine pour le tracé visuel.
async function generateMiningRoutes() {
  const rows = [
    ['Sand', 1, 'Reval', 41, '—'],
    ['Copper', 1, 'Dungeon I', 36, '—'],
    ['Tin', 1, 'Dungeon I', 26, '—'],
    ['Clay', 1, 'Dungeon I', 25, '—'],
    ['Iron', 25, 'Dungeon I', 44, '—'],
    ['Silver (ore)', 25, "No Man's Land", 38, '—'],
    ['Silver (vein)', 25, 'Dorpat', 62, '—'],
    ['Coal (vein)', 40, 'Reval', 144, '—'],
    ['Coal (vein)', 40, 'Mining Guild', 58, 'Requires mining level 65 + Mining Guild Permit'],
    ['Gold (ore)', 45, "No Man's Land", 40, 'Route A: must block a CL53 knight 3 times'],
    ['Gold (ore)', 45, "No Man's Land", 55, 'Route B: no combat'],
    ['Gold (vein)', 45, 'Reval', 97, 'Must kill 1× CL58 fire viper'],
    ['Kaolinite', 50, 'Dungeon I', 80, 'Requires CL45'],
    ['Kaolinite', 50, 'Jewelry Guild', 99, 'Requires jewelry level 60 + Jewelry Guild Permit'],
    ['White Gold (ore)', 55, "No Man's Land", 52, '—'],
    ['White Gold (ore)', 55, 'Heaven', 28, 'Must kill 2× CL159 gray-robed Gandalf'],
    ['White Gold (vein)', 55, 'Rakblood', 112, 'Requires CL46, must kill 1× CL26 bronze golem'],
    ['Azurite (ore)', 60, "No Man's Land", 84, 'Must block a CL30 knight apprentice 3 times'],
    ['Azurite (ore)', 60, 'Hell', 80, 'Requires CL135, must kill 1× CL95 great devil'],
    ['Azurite (vein)', 60, "Devil's Triangle", 148, 'Requires CL70; must block CL115 skeleton assassin ×3 and CL210 skull summoner ×3. Route: up → down'],
    ['Platinum (ore)', 75, "No Man's Land", 80, 'Must block a CL30 knight apprentice 3 times'],
    ['Platinum (vein)', 75, "Devil's Triangle", 156, 'Requires CL70; must block CL115 skeleton assassin ×3. Route: down → up → up → up → down'],
    ['Redhodium (ore)', 90, "Devil's Triangle", 186, 'Route 1 (Walco → DT): must block CL115 skeleton assassin ×3. Route: down → up → down → down → down → up. No fighting needed at CL115+'],
    ['Redhodium (ore)', 90, "Devil's Triangle", 185, 'Route 2: down → down → up → down → down. No fighting needed at CL150+'],
    ['Redhodium (vein)', 90, "No Man's Land", '—', 'Can drop a Pluto Permit here; the spot where miners are most commonly killed'],
  ];

  const body = `## Mining Routes\n\n${table(
    ['Material', 'Level Required', 'Location', 'Distance (tiles)', 'Notes'],
    rows,
  )}\n\n*CL = Combat Level. « Ore » et « vein » distinguent deux gisements différents du même minerai mentionnés séparément dans le guide d'origine.*\n`;

  const frontmatter = ['---', `title: "Mining Routes"`, '---', ''].join('\n');
  await mkdir(GUIDES_DIR, { recursive: true });
  await writeFile(path.join(GUIDES_DIR, 'mining-routes.md'), frontmatter + body, 'utf-8');
  console.log(`mining-routes: 1 page (${rows.length} entrées)`);
}

async function generateGuidesCategory() {
  await mkdir(GUIDES_DIR, { recursive: true });
  await writeFile(
    path.join(GUIDES_DIR, '_category_.json'),
    JSON.stringify({ label: 'Guides (rpgmobob.com)', position: 7 }, null, 2) + '\n',
  );
}

async function generateLiensUtiles() {
  const links = await load('homeLinks');
  // On exclut les captures d'écran/vidéos personnelles (contenu anecdotique,
  // pas une ressource de référence) et on ne garde que les liens externes ou
  // vers un outil qu'on n'a pas nous-mêmes importé.
  const EXCLUDED_CATS = new Set(['Screenshots']);
  const INTERNAL_TITLES = new Set([
    'Combat Level Calculator', 'Fungiculture App', 'Interactive World Map', 'Fishing Spots', 'Farming App',
    'Mining Maps',
  ]);
  const INTERNAL_LINK_MAP = {
    'Combat Level Calculator': '/database/guides/combat-level',
    'Fungiculture App': '/database/guides/fungiculture',
    'Interactive World Map': '/database/guides/world-map',
    'Fishing Spots': '/database/guides/fishing-spots',
    'Farming App': '/database/guides/farming',
    'Mining Maps': '/database/guides/mining-routes',
  };

  const byCat = new Map();
  for (const l of links) {
    if (EXCLUDED_CATS.has(l.cat)) continue;
    if (!byCat.has(l.cat)) byCat.set(l.cat, []);
    byCat.get(l.cat).push(l);
  }

  const sections = [];
  for (const [cat, items] of byCat) {
    const lines = items.map((l) => {
      const isInternal = INTERNAL_TITLES.has(l.title);
      const href = isInternal ? INTERNAL_LINK_MAP[l.title] : (l.link.startsWith('/') ? SITE_ORIGIN + l.link : l.link);
      let line = `- [${mdxSafe(l.title)}](${href})`;
      if (l.badge) line += ` \`${mdxSafe(l.badge)}\``;
      if (l.notes) {
        line += l.notes_link ? ` — [${mdxSafe(l.notes)}](${l.notes_link})` : ` — ${mdxSafe(l.notes)}`;
      }
      return line;
    });
    sections.push(`## ${cat}\n\n${lines.join('\n')}`);
  }

  const intro = `Cette page recense des ressources communautaires utiles pour RPG MO, cataloguées à l'origine sur [rpgmobob.com](${SITE_ORIGIN}/) par "bobdylan". Les entrées internes (Combat Level, Farming, Fungiculture, Fishing Spots, World Map) pointent vers les pages équivalentes de ce wiki ; le reste pointe vers les sites/outils d'origine, faits par différents membres de la communauté (voir attribution sur chaque entrée, et [Sources et remerciements](/sources)).`;

  const frontmatter = ['---', `title: "Liens utiles"`, '---', '', intro, ''].join('\n');
  await writeFile(path.join(DOCS_DIR, 'liens-utiles.md'), frontmatter + sections.join('\n\n') + '\n', 'utf-8');
  console.log(`liens-utiles: 1 page (${links.length - links.filter(l => EXCLUDED_CATS.has(l.cat)).length} liens, ${byCat.size} catégories)`);
}

async function main() {
  await rm(GUIDES_DIR, { recursive: true, force: true });
  await generateGuidesCategory();
  await generateFarming();
  await generateFungiculture();
  await generateFishingSpots();
  await generateWorldMap();
  await generateCombatLevel();
  await generateMiningRoutes();
  await generateLiensUtiles();
  console.log('Terminé.');
}

main();
