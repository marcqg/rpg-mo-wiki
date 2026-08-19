---
title: "Developer Notes - Game Data Extraction"
draft: true
sidebar_position: 99
---

> WARNING: Ce document est en mode `draft: true` -- non publie en production. Visible uniquement en developpement local (`npm run start`).

Cette page documente le pipeline complet d'extraction des donnees depuis le jeu RPG MO, pour permettre a quiconque de comprendre, reproduire ou etendre le travail effectue.

---

## 1. Vue d'ensemble

Le jeu RPG MO publie publiquement tous ses fichiers de donnees sur **`https://data.mo.ee/`**. Deux fichiers JavaScript contiennent la quasi-totalite des donnees :

| Fichier | Taille | Contenu |
| --- | --- | --- |
| `https://data.mo.ee/release.js` | ~5,1 Mo | Toutes les donnees du jeu (items, mobs, recettes, objets, sprites...) |
| `https://data.mo.ee/mod.js` | ~495 Ko | Modules communautaires dont `Wikimd` (formules d'affichage wiki) |

Ces fichiers sont du **JavaScript minifie**. Le script `fetch-game-data.mjs` les execute dans une sandbox Node.js (`vm.createContext`) et lit directement les variables globales peuplees.

---

## 2. Variables globales dans `release.js`

### 2.1 `item_base` -- Items

```js
item_base[0] = createObject({
  b_i: 0, b_t: ITEM_CATEGORY.WEAPON, name: "Bronze Dagger",
  img: { sheet: IMAGE_SHEET.WEAPONS, x: 0, y: 10 },
  params: { wearable: true, slot: 4, aim: 6, power: 4, min_accuracy: 1, price: 132 }
})
```

**Champs extraits :** `b_i` (id), `name`, `b_t` (categorie : 0=Armor, 5=Weapon...), `img.sheet/x/y`, `params.*` (stats, prix, slot...)

**Fichier produit :** `data/game/items.json` -- 5 587 items

### 2.2 `npc_base` -- Mobs & PNJ

```js
npc_base[0] = { b_i: 0, name: "Gray Wizard",
  params: { health: 10, aggressive: false, drops: [{id: 271, chance: 0.01}], combat_level: 4 },
  locations: { "Dorpat": 42, "Moche I": 10 } }
```

**Champs extraits :** `b_i`, `name`, `params.health/aggressive/drops/combat_level`, `locations`

**Fichier produit :** `data/game/mobs.json` -- 904 entrees

### 2.3 `object_base` -- Objets du monde & Recettes avec ingredients

Source principale des **recettes avec ingredients**. Chaque objet interactif (Furnace, Campfire, Alchemy Table...) a `params.results` :

```js
object_base[35] = createObject({ name: "Furnace", params: { results: [
  { requires: [186, 31], skill: "forging",
    returns: [{ id: 291, level: 40, xp: 30, base_chance: 0.4,
                consumes: [{ id: 31, count: 1 }, { id: 186, count: 1 }] }] }
]}})
// Steel Bar = niveau 40, 40%, consomme 1x Iron Ore + 1x Coal
```

**Skills couverts :** alchemy, breeding, cooking (Campfire + Kettle), jewelry, fungiculture (partiel), wizardry (Altars), forging (Furnace)

**Exclusion :** skill `"health"` filtre (= coffres/loot, pas du crafting)

### 2.4 `FORGE_FORMULAS` -- Recettes Enclume (Forge, Wizardry, Fletching)

Les recettes craftees a l'Enclume ne sont **pas** dans `object_base` -- elles sont dans une variable globale separee avec un systeme de grille :

```js
FORGE_FORMULAS = {
  0: { item_id: 0, level: 1, chance: 1, pattern: [[34],[34],[29]] },
  // Bronze Dagger: pattern [[Bronze Bar],[Bronze Bar],[Fir Log]] -> 2x Bronze Bar + 1x Fir Log
}
```

**Format du `pattern` :** tableau de colonnes, chaque colonne = liste d'IDs. `-1` = case vide. Pour les ingredients : compter les occurrences de chaque ID positif dans toute la grille.

**Skill detecte par :** presence de `fletching_level` (fletching), `wizardry_level` (wizardry), sinon `forging`.

**1 251 formules** -- couvre forging (armes, armures), wizardry (sorts), fletching (arcs, carquois)

### 2.5 `CARPENTRY_FORMULAS` -- Recettes Charpenterie

```js
CARPENTRY_FORMULAS = {
  floors: [
    { id: 0, item_id: 730, level: 1, consumes: [{ id: 29, count: 100 }] },
    // Fir Floor = 100x Fir Log
  ],
  walls: [...], furniture: [...], ...
}
```

Structure : objet de categories (floors, walls, furniture, fences...), chaque categorie = tableau de formules avec `item_id`, `level`, `consumes:[{id,count}]`.

**204 formules** avec ingredients

### 2.6 `FLETCHING_FORMULAS` -- Recettes Fleches

```js
FLETCHING_FORMULAS = {
  0: { item_id: 2028, level: 1, chance: 1, pattern: [34, 29, 2033] },
  // Bronze Fir Arrow = 1x Bronze Bar + 1x Fir Log + 1x Feather
}
```

**Format du `pattern` :** tableau simple `[metal_id, wood_id, feather_id]` -- 1x de chaque.

**155 formules** de fleches avec ingredients

### 2.7 `IMAGE_SHEET` -- Planches de sprites

```js
IMAGE_SHEET = {
  WEAPONS: { url: "sheet/dgweapon32.png", tile_width: 32, tile_height: 32 },
  PETS:    { url: "sheet/pets.png",       tile_width: 32, tile_height: 32 },
}
```

**87 planches** sur `https://data.mo.ee/sheet/<nom>.png`

**Fichier produit :** `data/game/sheets.json`

---

## 3. Variables dans `mod.js`

### 3.1 `Mods.Wikimd.formulas` -- Formules Wiki (fallback)

Agregation dynamique de toutes les recettes, destinee a l'outil wiki in-game (`/wiki`). Utilise comme **fallback** uniquement quand une recette n'a pas d'ingredients dans les sources primaires.

**Note :** dans la version actuelle, `materials` est souvent vide -- les sources primaires (`object_base`, `FORGE_FORMULAS`, etc.) sont donc toujours preferees.

### 3.2 `Mods.Wikimd.pet_breeds` -- Reproduction des familiers

```js
Mods.Wikimd.pet_breeds = [
  { parent1: { name, b_i }, parent2: { name, b_i },
    offspring: [{ id, min, max, show_both }], level, time, xp }
]
```

**62 combinaisons** de breeding -- fichier `data/game/pet_breeds.json`

### 3.3 `Mods.Wikimd.pet_family` -- Famille des familiers

Arbre hierarchique des familles de pets -- fichier `data/game/pet_family.json`

---

## 4. Skills sans ingredients -- Explication

Ces skills sont de type **recolte** (le joueur agit sur un objet du monde, sans combiner des ingredients) :

| Skill | Comportement | Colonne Materiaux |
| --- | --- | --- |
| **Farming** | Planter une graine, recolter la plante | `--` normal |
| **Fishing** | Pecher avec canne/filet/harpon | `--` normal |
| **Mining** | Miner une veine dans le monde | `--` normal |
| **Woodcutting** | Couper un arbre | `--` normal |
| **Fungiculture** (partiel) | Recolter un champignon cultive (les 24 sans ingr.) | `--` normal |

---

## 5. Extraction des sprites

**Script :** `scripts/extract-images.py` (Python + Pillow)

```bash
# Prerequis: pip install Pillow
python3 scripts/extract-images.py
```

Algorithme :
1. Lit `data/game/sheets.json` pour connaitre l'URL et les dimensions de tuile de chaque planche
2. Telecharge en parallele les 87 planches depuis `https://data.mo.ee/sheet/`
3. Pour chaque item/mob/pet/object : lit `img.sheet` + `img.x` + `img.y`, calcule les coordonnees pixel, decouppe avec `PIL.Image.crop()`
4. Sauvegarde en `static/img/{items,mobs,pets,objects}/<id>.png`

**Resultats actuels :**

| Dossier | Fichiers |
| --- | --- |
| `static/img/items/` | 5 432 PNG |
| `static/img/mobs/` | 560 PNG |
| `static/img/pets/` | 477 PNG |

**Limite :** certains mobs utilsent des calques composites (NPC = base + equipement) -- leur sprite ne peut pas etre extrait par un simple crop.

---

## 6. Pipeline complet -- Ordre d'execution

```bash
# 1. Fetch des donnees depuis data.mo.ee (release.js + mod.js)
#    Remplit data/game/*.json
node scripts/fetch-game-data.mjs

# 2. Extraction des sprites
#    Remplit static/img/{items,mobs,pets,objects}/
python3 scripts/extract-images.py

# 3. Generation des pages Live Game Data
#    Cree/met a jour docs/game-data/ (76 pages)
#    Injecte la section recapitulative sur les homepages (5 locales)
#    Genere les _category_.json traduits (FR/KO/PL/PT)
node scripts/generate-game-data-pages.mjs

# 4. Traduction francaise
#    Cree i18n/fr/game-data/ avec noms traduits via Google Translate
#    Format: Traduction *(Original)*
python3 scripts/translate-game-data-fr.py
```

---

## 7. Fichiers JSON produits dans `data/game/`

| Fichier | Contenu | Nb entrees |
| --- | --- | --- |
| `items.json` | Items : id, nom, categorie, img, params | 5 587 |
| `mobs.json` | Mobs/PNJ : id, nom, health, drops, locations | 904 |
| `pets.json` | Familiers : id, nom, img, params (xp, happiness, eats) | 495 |
| `recipes.json` | Recettes : id, nom, skill, level, xp, chance, matts, object | 4 678 |
| `objects.json` | Objets du monde : id, nom, img, params | 1 107 |
| `sheets.json` | Planches de sprites : url, tile_width, tile_height | 87 |
| `pet_breeds.json` | Combinaisons de breeding | 62 |
| `pet_family.json` | Hierarchie des familles de pets | -- |
| `vendors.json` | Marchands : nom, map, coords, inventaire | 136 |

---

## 8. Structure de `recipes.json`

```json
{
  "id": 291,
  "n": "Steel Bar",
  "skill": "forging",
  "level": 40,
  "xp": 30,
  "min_chance": 40,
  "max_chance": 40,
  "matts": [
    { "id": 31,  "c": 1 },
    { "id": 186, "c": 1 }
  ],
  "object": "Furnace"
}
```

**Source par skill :**

| Skill | Source primaire | % avec `matts` |
| --- | --- | --- |
| alchemy | `object_base` (Alchemy Table) | 100% |
| breeding | `object_base` (Altar, Broken Altar, Royal Altar) | 100% |
| carpentry | `CARPENTRY_FORMULAS` | 43% |
| cooking | `object_base` (Campfire + Kettle) | 100% |
| farming | `object_base` -- recolte pure | 0% (normal) |
| fishing | `object_base` -- recolte pure | 0% (normal) |
| fletching | `FLETCHING_FORMULAS` + `FORGE_FORMULAS` (arcs/carquois) | 45% |
| forging | `FORGE_FORMULAS` (grille pattern) + `object_base` (Furnace) | 43% |
| fungiculture | `object_base` -- mi-recolte mi-craft | 50% |
| jewelry | `object_base` (Furnace + Magma Furnace + Inventory) | 100% |
| mining | `object_base` -- recolte pure | 0% (normal) |
| wizardry | `FORGE_FORMULAS` (wizardry_level) + `object_base` (Altars) | 48% |
| woodcutting | `object_base` -- recolte pure | 0% (normal) |

---

## 9. Pages generees -- `docs/game-data/`

76 pages Markdown generees par `generate-game-data-pages.mjs` :

| Section | Pages | Tri | Colonnes |
| --- | --- | --- | --- |
| `game-data/items/` | 10 (par categorie) | Alphabetique | Icone, Nom, Prix, Stats |
| `game-data/mobs/` | 46 (par zone) | Alphabetique | Icone, Nom, Niveau Combat, Sante, Agressif, Drops |
| `game-data/pets/` | 6 (par rarete) | Alphabetique | Icone, Nom, XP requis, Bonheur, Niveau elevage, Mange |
| `game-data/recipes/` | 13 (par skill) | **Niveau ASC** | Icone, Nom, Niveau, XP, Chance, Source, Materiaux |

Toutes les tables ont **recherche + tri** interactifs via `src/client-modules/sortable-tables.js`.

---

## 10. Traductions i18n

**Script :** `scripts/translate-game-data-fr.py`

- En-tetes colonnes : traduction statique (dictionnaire `HEADERS_FR`)
- Titres de pages : traduction statique (Armor=Armures, Forging=Forge, Common=Commun...)
- Noms d'items + materiaux dans recettes : **Google Translate API gratuite** (batch 50 termes, delai 200ms)
  - Format : `Traduction *(Original)*` -- identique au pattern `database/`
  - Bandeau : `Traduction francaise -- nom original : **X** -- voir la page en anglais`
- Noms propres du jeu (zones, objets techniques) : conserves en anglais

Autres locales (KO/PL/PT) : `_category_.json` traduits statiquement, pages copiees depuis EN (fallback Docusaurus).

---

## 11. Limites connues

| Limitation | Cause | Impact |
| --- | --- | --- |
| 698 recettes Forging sans ingredients | Ces recettes sont dans `Wikimd.formulas` uniquement, ou `materials` est vide | Colonne Materiaux = `--` |
| 334 recettes Wizardry sans ingredients | Meme raison | Idem |
| ~340 sprites mobs manquants | Mobs a calques composites (NPC = base + equipement) -- crop simple impossible | Icone `--` |
| `Mods.Wikimd.formulas.materials` vide | Peuple dynamiquement au runtime du jeu, pas a l'extraction statique | Fallback inutilisable |

---

## 12. Ressources utiles

- **Game data** : [https://data.mo.ee/](https://data.mo.ee/)
- **release.js** : [https://data.mo.ee/release.js](https://data.mo.ee/release.js)
- **mod.js** : [https://data.mo.ee/mod.js](https://data.mo.ee/mod.js)
- **Spritesheet exemple** : [https://data.mo.ee/sheet/dgweapon32.png](https://data.mo.ee/sheet/dgweapon32.png)
- **Depot GitHub** : [https://github.com/marcqg/rpg-mo-wiki](https://github.com/marcqg/rpg-mo-wiki)
