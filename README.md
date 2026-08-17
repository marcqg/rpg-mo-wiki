# RPG MO Wiki (miroir)

Miroir non officiel du [RPG MO Wiki](https://rpg-mo.fandom.com/wiki/Main_Page) (Fandom), avec pour objectif à terme une version traduite en français, hébergé sur GitHub Pages via [Docusaurus](https://docusaurus.io/).

Ce site n'est pas affilié à Fandom, à modb, à rpgmobob.com, ni aux développeurs de RPG MO. Le contenu du wiki est adapté depuis le wiki d'origine, sous licence **CC BY-SA** — chaque page conserve un lien vers sa source. Les pages de la section Database sont générées depuis les données publiques de [modb](https://modb.rpgmobob.com/#/) et de [rpgmobob.com](https://www.rpgmobob.com/), deux outils communautaires du même auteur ("bobdylan").

## Sources

- **Wiki** (`docs/*.md`, racine) — contenu texte libre migré depuis le [wiki Fandom](https://rpg-mo.fandom.com/wiki/Main_Page) (1522 pages).
- **Database** (`docs/database/`) — objets, monstres, recettes, vendeurs et familiers, extraits de [modb](https://modb.rpgmobob.com/#/), présentés sous forme de tableaux groupés par sous-catégorie (catégorie d'objet, compétence, zone, lieu, rareté).
- **Guides** (`docs/database/guides/`) — Farming, Fungiculture, Fishing Spots, World Map et Combat Level, extraits du code source public de [rpgmobob.com](https://github.com/thomporter/rpgmobob.com).
- **Liens utiles** (`docs/liens-utiles.md`) — catalogue des ressources communautaires référencées sur rpgmobob.com (calculateurs, cartes, guides tiers), avec attribution à leurs auteurs respectifs.

## Pipeline

1. **Extraction wiki** — `scripts/fetch-wiki.mjs` interroge l'API MediaWiki de Fandom (`action=parse`), récupère le HTML rendu de chaque page, puis le convertit en Markdown (via [turndown](https://github.com/mixmark-io/turndown) + [turndown-plugin-gfm](https://github.com/mixmark-io/turndown-plugin-gfm)) dans `docs/`.
2. **Extraction database (modb)** — `scripts/fetch-modb.mjs` télécharge le bundle JS de modb.rpgmobob.com et en extrait les jeux de données (Items, Recipes, Mobs, Vendors, Pets, embarqués en dur dans le bundle) via une analyse AST (acorn), vers `data/modb/*.json`. `scripts/generate-database-pages.mjs` transforme ensuite ce JSON en pages Markdown groupées, dans `docs/database/`.
3. **Extraction guides (rpgmobob.com)** — `scripts/fetch-rpgmobob.mjs` récupère les fichiers de données TypeScript depuis le [dépôt GitHub public](https://github.com/thomporter/rpgmobob.com) du site et en extrait les littéraux JS, vers `data/rpgmobob/*.json`. `scripts/generate-bob-pages.mjs` génère les pages `docs/database/guides/*` et `docs/liens-utiles.md`.
4. **Site** — Docusaurus génère le site statique à partir de `docs/`, avec navigation, recherche et sidebar auto-générée.
5. **Traduction FR** — pas encore automatisée (prévue dans une étape ultérieure, une fois le contenu anglais stabilisé).
6. **Déploiement** — `.github/workflows/deploy.yml` build et déploie automatiquement sur GitHub Pages à chaque push sur `main`.

## Récupérer des pages du wiki

```bash
# Échantillon de test par défaut (voir SAMPLE_PAGES dans le script)
node scripts/fetch-wiki.mjs

# Pages spécifiques
node scripts/fetch-wiki.mjs "Woodcutting" "Fishing" "Combat"

# Tout le wiki (~1500 pages, découverte automatique via l'API)
node scripts/fetch-wiki.mjs --all
```

Chaque page est écrite dans `docs/<slug>.md` avec un frontmatter (`title`, `slug`) et un bandeau d'attribution vers la page Fandom d'origine. Les liens internes du wiki (`/wiki/...`) qui ne correspondent à aucune page migrée pointent vers le wiki Fandom d'origine.

**Limites connues** : les infobox complexes et certaines mises en forme spécifiques à Fandom peuvent nécessiter un nettoyage manuel après extraction — relire chaque page migrée avant de l'ajouter en nombre.

## Régénérer la section Database (modb)

```bash
node scripts/fetch-modb.mjs               # rafraîchit data/modb/*.json depuis modb.rpgmobob.com
node scripts/generate-database-pages.mjs  # régénère docs/database/ à partir de data/modb/
```

`fetch-modb.mjs` repère les jeux de données dans le bundle JS par la « forme » de leurs objets (clés attendues) plutôt que par un offset fixe, pour rester robuste si modb change de bundle. Si la structure de modb change fortement, le script échouera avec un message listant les jeux de données introuvables.

**Limites connues** : les catégories volumineuses (ex: Armor, Forging) sont découpées en plusieurs pages de ~350 lignes ; la colonne "Stats" des objets est une liste générique de tous les champs numériques du jeu (pas de mise en forme par type d'objet) ; les données de reproduction des familiers (`likes`/breeding) ne sont pas encore importées.

## Régénérer les guides et liens utiles (rpgmobob.com)

```bash
node scripts/fetch-rpgmobob.mjs     # rafraîchit data/rpgmobob/*.json depuis le dépôt GitHub du site
node scripts/generate-bob-pages.mjs # régénère docs/database/guides/ et docs/liens-utiles.md
```

Seuls les outils propres à bobdylan (Farming, Fungiculture, Fishing Spots, World Map, Combat Level) sont importés en pages structurées. Les autres liens du site (calculateurs, cartes et guides faits par d'autres membres de la communauté, captures d'écran personnelles) sont soit catalogués dans `liens-utiles.md` avec attribution, soit volontairement exclus (captures d'écran).

**Limites connues** : la page World Map ne reprend que la liste des zones (pas la carte interactive elle-même, qui reste sur le site d'origine) ; une zone ("Fellin Island") n'a pas de correspondance dans les données mobs de modb et n'a donc pas de lien croisé.

## Développement local

```bash
npm install
npm start       # serveur de dev avec rechargement à chaud
npm run build   # build statique de production dans build/
```

## Indexation CodeGraph (IA)

Ce dépôt est indexé avec [CodeGraph](https://github.com/colbymchenry/codegraph), un outil qui construit un graphe de la structure du code et du contenu pour le rendre directement explorable par des agents IA (ex: Claude, Copilot, ou tout assistant basé sur un MCP). Cela permet à une IA de naviguer dans les pages du wiki, de comprendre l'organisation des données et de répondre à des questions précises sur le jeu à partir du contenu de ce repo.

## Déploiement

Le déploiement est automatique via GitHub Actions à chaque push sur `main`. Il faut activer GitHub Pages sur le repo (Settings → Pages → Source: GitHub Actions) une première fois.
