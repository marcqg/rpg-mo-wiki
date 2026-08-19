#!/usr/bin/env node
// fetch-game-data.mjs
// Télécharge release.js et mod.js depuis https://data.mo.ee/
// et croise l'ensemble des données du jeu (items, monstres, familiers avec breeding, recettes, objets, sheets)
// avec les données existantes (locations, spawns).

import https from 'node:https';
import vm from 'node:vm';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const DATA_MODB_DIR = path.join(ROOT, 'data', 'modb');
const DATA_GAME_DIR = path.join(ROOT, 'data', 'game');

async function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return resolve(fetchUrl(res.headers.location));
      }
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

const dummyFn = () => {};
class DummyNode {
  constructor() {
    this.style = {};
    this.width = 100;
    this.height = 100;
  }
  setAttribute() {}
  getAttribute() { return ''; }
  appendChild() {}
  removeChild() {}
  addEventListener() {}
  removeEventListener() {}
  getContext() {
    return {
      drawImage: dummyFn, fillRect: dummyFn, clearRect: dummyFn,
      getImageData: () => ({ data: [] }), save: dummyFn, restore: dummyFn,
      scale: dummyFn, translate: dummyFn,
    };
  }
}

function DummyEvent() {}
DummyEvent.prototype = {};

async function loadExisting(name) {
  try {
    const p = path.join(DATA_MODB_DIR, `${name}.json`);
    if (existsSync(p)) {
      return JSON.parse(await readFile(p, 'utf-8'));
    }
  } catch (e) {}
  try {
    const raw = execSync(`git show HEAD:data/modb/${name}.json`).toString();
    return JSON.parse(raw);
  } catch (e) {
    return [];
  }
}

async function main() {
  console.log('1. Chargement des données existantes (locations, marchands)...');
  const [existingMobs, existingVendors] = await Promise.all([
    loadExisting('mobs'),
    loadExisting('vendors'),
  ]);
  const mobLocationsById = new Map();
  const mobCombatLevelById = new Map();
  for (const m of existingMobs) {
    if (m.locations && Object.keys(m.locations).length > 0) {
      mobLocationsById.set(m.id, m.locations);
    }
    if (m.params?.combat_level) {
      mobCombatLevelById.set(m.id, m.params.combat_level);
    }
  }

  console.log('2. Téléchargement de release.js et mod.js depuis data.mo.ee...');
  const [releaseJs, modJs] = await Promise.all([
    fetchUrl('https://data.mo.ee/release.js'),
    fetchUrl('https://data.mo.ee/mod.js'),
  ]);
  console.log(`   release.js: ${(releaseJs.length / 1024 / 1024).toFixed(2)} Mo`);
  console.log(`   mod.js: ${(modJs.length / 1024).toFixed(2)} Ko`);

  console.log('3. Exécution du moteur dans la VM...');
  const sandbox = {
    console: { log: dummyFn, error: dummyFn, warn: dummyFn },
    Math: Math,
    Date: Date,
    JSON: {
      stringify: JSON.stringify,
      parse: (str, ...args) => {
        if (str === 'undefined' || str === undefined || str === null || str === '') return {};
        try {
          return JSON.parse(str, ...args);
        } catch (e) {
          return {};
        }
      },
    },
    String: String,
    Array: Array,
    Object: Object,
    Number: Number,
    Boolean: Boolean,
    RegExp: RegExp,
    Error: Error,
    parseInt: parseInt,
    parseFloat: parseFloat,
    isNaN: isNaN,
    isFinite: isFinite,
    encodeURIComponent: encodeURIComponent,
    decodeURIComponent: decodeURIComponent,
    setTimeout: dummyFn,
    setInterval: dummyFn,
    clearTimeout: dummyFn,
    clearInterval: dummyFn,
    requestAnimationFrame: dummyFn,
    Storage: Object,
    Event: DummyEvent,
    CustomEvent: DummyEvent,
    WebSocket: function () {},
    Hammer: function () { return { on: dummyFn }; },
    HTMLCanvasElement: DummyNode,
    HTMLElement: DummyNode,
    HTMLDivElement: DummyNode,
    HTMLImageElement: DummyNode,
    HTMLScriptElement: DummyNode,
    HTMLStyleElement: DummyNode,
    Element: DummyNode,
    Node: DummyNode,
    socket: { on: dummyFn, send: dummyFn, emit: dummyFn },
    Socket: { on: dummyFn, send: dummyFn, emit: dummyFn },
    addChatText: dummyFn,
    addLog: dummyFn,
    document: {
      createElement: () => new DummyNode(),
      createElementNS: () => new DummyNode(),
      createEvent: () => ({ initCustomEvent: dummyFn }),
      head: { appendChild: dummyFn },
      body: { appendChild: dummyFn },
      getElementById: () => new DummyNode(),
      getElementsByClassName: () => [],
      querySelectorAll: () => [],
      getElementsByTagName: () => [{ appendChild: dummyFn }],
      addEventListener: dummyFn,
      removeEventListener: dummyFn,
      fonts: { ready: Promise.resolve() },
      title: '',
    },
    window: {
      addEventListener: dummyFn,
      removeEventListener: dummyFn,
      innerWidth: 1000,
      innerHeight: 800,
      Event: DummyEvent,
      CustomEvent: DummyEvent,
      Hammer: function () { return { on: dummyFn }; },
      socket: { on: dummyFn, send: dummyFn, emit: dummyFn },
      Socket: { on: dummyFn, send: dummyFn, emit: dummyFn },
      addChatText: dummyFn,
      addLog: dummyFn,
      location: { protocol: 'https:', hostname: 'data.mo.ee', pathname: '/', search: '' },
    },
    navigator: { userAgent: 'Mozilla/5.0' },
    location: { protocol: 'https:', hostname: 'data.mo.ee', pathname: '/', search: '' },
    localStorage: {},
    sessionStorage: {},
    players: [{ id: 1, name: 'Player', pet: { enabled: false }, temp: { inventory: [] } }],
    Image: function () { return new DummyNode(); },
    Audio: function () { return {}; },
    LazyLoad: { css: dummyFn, js: dummyFn },
  };
  sandbox.window.window = sandbox.window;
  sandbox.window.document = sandbox.document;
  sandbox.window.navigator = sandbox.navigator;
  sandbox.window.location = sandbox.location;
  sandbox.global = sandbox.window;
  sandbox.self = sandbox.window;

  const vmCtx = vm.createContext(sandbox);
  vm.runInContext(releaseJs, vmCtx, { timeout: 30000 });
  sandbox.players[0] = { id: 1, name: 'Player', pet: { enabled: false }, temp: { inventory: [] } };
  sandbox.socket = { on: dummyFn, send: dummyFn, emit: dummyFn };
  sandbox.Socket = { on: dummyFn, send: dummyFn, emit: dummyFn };
  sandbox.addChatText = dummyFn;
  sandbox.addLog = dummyFn;
  vm.runInContext(modJs, vmCtx, { timeout: 30000 });
  vm.runInContext('Mods.Load.wikimd();', vmCtx, { timeout: 30000 });

  console.log('4. Extraction et structuration des données...');

  // Items
  const itemsList = [];
  for (const k in sandbox.item_base) {
    const it = sandbox.item_base[k];
    if (!it) continue;
    itemsList.push({
      id: it.b_i,
      n: it.name,
      t: it.b_t,
      img: it.img,
      params: it.params || {},
      chances: it.chances || [],
    });
  }
  itemsList.sort((a, b) => a.id - b.id);

  // Pets
  const petsList = [];
  for (const k in sandbox.pets) {
    const p = sandbox.pets[k];
    if (!p) continue;
    petsList.push({
      id: p.b_i,
      n: p.name,
      item_id: p.params?.item_id,
      img: p.img,
      params: p.params || {},
    });
  }
  petsList.sort((a, b) => a.id - b.id);

  // Mobs / NPCs (croisé avec locations et combat level)
  const mobsList = [];
  for (const k in sandbox.npc_base) {
    const n = sandbox.npc_base[k];
    if (!n) continue;
    const locs = mobLocationsById.get(n.b_i) || n.locations || {};
    const combatLvl = n.params?.combat_level || mobCombatLevelById.get(n.b_i) || n.level || null;
    
    mobsList.push({
      id: n.b_i,
      n: n.name,
      t: n.b_t,
      type: n.type,
      img: n.img,
      params: {
        ...(n.params || {}),
        combat_level: combatLvl,
      },
      temp: n.temp || {},
      locations: locs,
    });
  }
  mobsList.sort((a, b) => a.id - b.id);

  // Objects
  const objectsList = [];
  for (const k in sandbox.object_base) {
    const o = sandbox.object_base[k];
    if (!o) continue;
    objectsList.push({
      id: o.b_i,
      n: o.name,
      t: o.b_t,
      img: o.img,
      params: o.params || {},
    });
  }
  objectsList.sort((a, b) => a.id - b.id);

  // Recipes — depuis object_base[X].params.results (vraies recettes avec ingrédients)
  // Chaque object_base (Anvil, Furnace, Campfire...) a params.results = liste de recettes
  // Structure : { requires:[itemId,...], skill:"forging", returns:[{id, level, xp, base_chance, consumes:[{id,count}]}] }
  const recipesList = [];
  const EXCLUDED_RECIPE_SKILLS = new Set(['health', '']); // "health" = coffres/loot, pas de crafting
  const objectBase = sandbox.object_base || [];
  for (const obj of objectBase) {
    if (!obj?.params?.results) continue;
    const objectName = obj.name || '';
    for (const result of obj.params.results) {
      if (!result?.returns) continue;
      const skill = (result.skill || '').toLowerCase();
      if (EXCLUDED_RECIPE_SKILLS.has(skill)) continue;
      for (const ret of result.returns) {
        const itemId  = ret.id;
        const itemDef = sandbox.item_base?.[itemId];
        const itemName = itemDef?.name || `#${itemId}`;
        const matts = (ret.consumes || []).map((c) => ({ id: c.id, c: c.count || 1 }));
        const chance = ret.base_chance != null ? Math.round(ret.base_chance * 100) : 100;
        recipesList.push({
          id: itemId,
          n: itemName,
          skill,
          level: ret.level || 1,
          xp: ret.xp || 0,
          min_chance: chance,
          max_chance: chance,
          matts,
          object: objectName,
        });
      }
    }
  }

  // Compléter avec Wikimd.formulas (recettes forge/anvil sans ingrédients dans object_base)
  const recipeIdSet = new Set(recipesList.map((r) => `${r.id}|${(r.skill||'').toLowerCase()}|${r.level}`));
  if (sandbox.Mods?.Wikimd?.formulas) {
    for (const k in sandbox.Mods.Wikimd.formulas) {
      const f = sandbox.Mods.Wikimd.formulas[k];
      if (!f) continue;
      const skill = (f.skill || '').toLowerCase();
      if (EXCLUDED_RECIPE_SKILLS.has(skill)) continue;
      const key = `${f.id}|${skill}|${f.level || 1}`;
      if (recipeIdSet.has(key)) continue; // déjà extrait de object_base
      recipesList.push({
        id: f.id,
        n: f.name || f.result?.name,
        skill,
        level: f.level || 1,
        xp: f.xp || 0,
        min_chance: f.min_chance ?? f.chance ?? 100,
        max_chance: f.max_chance ?? f.chance ?? 100,
        matts: (f.matts || f.materials || []).map((m) => ({ id: m.id, c: m.c || m.count || 1 })),
        object: f.object?.name,
        tool: f.tool,
      });
    }
  }

  // Pet Breeds & Families
  const petBreeds = sandbox.Mods?.Wikimd?.pet_breeds || [];
  const petFamily = sandbox.Mods?.Wikimd?.pet_family || {};

  // Vendors (keep existing vendors if present)
  const vendorsList = existingVendors.length > 0 ? existingVendors : [];

  // Sprite Sheets Metadata
  const sheets = {};
  for (const k in sandbox.IMAGE_SHEET) {
    const s = sandbox.IMAGE_SHEET[k];
    if (typeof s === 'object' && s.url) {
      sheets[k] = {
        url: s.url,
        tile_width: s.tile_width,
        tile_height: s.tile_height,
      };
    }
  }

  console.log(`   Items: ${itemsList.length}`);
  console.log(`   Pets: ${petsList.length}`);
  console.log(`   Mobs/NPCs: ${mobsList.length}`);
  console.log(`   Objects: ${objectsList.length}`);
  console.log(`   Recipes: ${recipesList.length}`);
  console.log(`   Pet Breeds: ${petBreeds.length}`);
  console.log(`   Vendors: ${vendorsList.length}`);
  console.log(`   Sprite Sheets: ${Object.keys(sheets).length}`);

  console.log('5. Enregistrement des fichiers JSON...');
  await mkdir(DATA_MODB_DIR, { recursive: true });
  await mkdir(DATA_GAME_DIR, { recursive: true });

  // Save to data/game/
  await writeFile(path.join(DATA_GAME_DIR, 'items.json'), JSON.stringify(itemsList, null, 2));
  await writeFile(path.join(DATA_GAME_DIR, 'pets.json'), JSON.stringify(petsList, null, 2));
  await writeFile(path.join(DATA_GAME_DIR, 'mobs.json'), JSON.stringify(mobsList, null, 2));
  await writeFile(path.join(DATA_GAME_DIR, 'objects.json'), JSON.stringify(objectsList, null, 2));
  await writeFile(path.join(DATA_GAME_DIR, 'recipes.json'), JSON.stringify(recipesList, null, 2));
  await writeFile(path.join(DATA_GAME_DIR, 'pet_breeds.json'), JSON.stringify(petBreeds, null, 2));
  await writeFile(path.join(DATA_GAME_DIR, 'pet_family.json'), JSON.stringify(petFamily, null, 2));
  await writeFile(path.join(DATA_GAME_DIR, 'sheets.json'), JSON.stringify(sheets, null, 2));
  await writeFile(path.join(DATA_GAME_DIR, 'vendors.json'), JSON.stringify(vendorsList, null, 2));

  // Also update data/modb/
  await writeFile(path.join(DATA_MODB_DIR, 'items.json'), JSON.stringify(itemsList, null, 2));
  await writeFile(path.join(DATA_MODB_DIR, 'pets.json'), JSON.stringify(petsList, null, 2));
  await writeFile(path.join(DATA_MODB_DIR, 'mobs.json'), JSON.stringify(mobsList, null, 2));
  if (recipesList.length > 0) {
    await writeFile(path.join(DATA_MODB_DIR, 'recipes.json'), JSON.stringify(recipesList, null, 2));
  }
  if (vendorsList.length > 0) {
    await writeFile(path.join(DATA_MODB_DIR, 'vendors.json'), JSON.stringify(vendorsList, null, 2));
  }

  console.log('✅ Extraction et croisement des données terminés avec succès !');
}

main().catch((err) => {
  console.error('Erreur lors de l\'extraction:', err);
  process.exit(1);
});
