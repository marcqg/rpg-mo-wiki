#!/usr/bin/env python3
"""
translate-game-data-fr.py
Génère les pages FR de game-data dans i18n/fr/ en suivant exactement
le même pattern que les pages database FR existantes :
  - bandeau 🇫🇷 avec lien vers la version EN
  - titres et en-têtes de colonnes traduits
  - noms propres du jeu conservés en anglais (comme dans database/)
"""
import os, re
from pathlib import Path

ROOT   = Path(__file__).parent.parent
SRC    = ROOT / 'docs' / 'game-data'
DST_FR = ROOT / 'i18n' / 'fr' / 'docusaurus-plugin-content-docs' / 'current' / 'game-data'

# ─── Tables de traduction ────────────────────────────────────────────────────

HEADERS_FR = {
    'Icon': 'Icône', 'Name': 'Nom', 'Price': 'Prix', 'Stats': 'Stats',
    'Combat Level': 'Niveau de Combat', 'Health': 'Santé',
    'Aggressive': 'Agressif', 'Drops': 'Butins',
    'XP Required': 'XP requis', 'Happiness': 'Bonheur',
    'Breeding Level': "Niveau d'élevage", 'Eats': 'Mange',
    'Level': 'Niveau', 'XP': 'XP', 'Chance': 'Chance',
    'Materials': 'Matériaux', 'Yes': 'Oui', 'No': 'Non',
    'Parent 1': 'Parent 1', 'Parent 2': 'Parent 2',
    'Duration': 'Durée', 'Offspring (Chances)': 'Descendants (Chances)',
}

ITEM_TITLES_FR = {
    'Armor': 'Armures', 'Weapon': 'Armes', 'Food': 'Nourriture',
    'Material': 'Matériaux', 'Tool': 'Outils', 'Jewelry': 'Bijoux',
    'Spell': 'Sorts', 'Pet Item': 'Objets Familiers',
    'House': 'Maison', 'Archery': "Tir à l'arc",
}

PET_TITLES_FR = {
    'Common': 'Commun', 'Rare': 'Rare', 'Legendary': 'Légendaire',
    'Ancient': 'Ancien', 'Artifact': 'Artefact', 'Egg': 'Œuf',
}

RECIPE_TITLES_FR = {
    'Forging': 'Forge', 'Farming': 'Agriculture', 'Cooking': 'Cuisine',
    'Fishing': 'Pêche', 'Jewelry': 'Bijouterie', 'Woodcutting': 'Bûcheronnage',
    'Mining': 'Minage', 'Alchemy': 'Alchimie', 'Fungiculture': 'Fongicoelture',
    'Wizardry': 'Sorcellerie', 'Carpentry': 'Charpenterie',
    'Fletching': 'Fabrication de flèches', 'Breeding': 'Élevage',
}

MOB_TITLES_FR = {
    'Unknown Location': 'Emplacement Inconnu',
    'Minigames': 'Mini-jeux',
    'Tutorial Island': 'Île Tutoriel',
}

INDEX_REPLACE_FR = [
    ('This section contains data extracted **directly from the official RPG MO game files**',
     'Cette section contient des données extraites **directement depuis les fichiers officiels du jeu RPG MO**'),
    ('It is refreshed by running', 'Mis à jour en exécutant'),
    (' then ', ' puis '),
    ('| Section | Total | Sub-categories |', '| Section | Total | Sous-catégories |'),
    (' objects', ' objets'), (' enemies', ' ennemis'),
    (' companions', ' compagnons'), (' formulas', ' formules'),
    ('See [Sources & Credits](/sources) for full attribution.',
     "Voir [Sources et remerciements](/sources) pour l'attribution complète."),
]

# ─── Helpers ─────────────────────────────────────────────────────────────────

def banner(en_title, en_path):
    return (f'> 🇫🇷 Traduction française — nom original (anglais) : **{en_title}**'
            f' — <a href="/rpg-mo-wiki/{en_path}">voir la page en anglais</a>\n\n')

def is_separator_row(line):
    return bool(line.startswith('|') and all(c in '| :-' for c in line.strip()))

def translate_table_line(line, hmap):
    cells = [c.strip() for c in line.strip().strip('|').split('|')]
    new_cells = [hmap.get(c, c) for c in cells]
    return '| ' + ' | '.join(new_cells) + ' |\n'

def is_header_row(line, hmap):
    cells = [c.strip() for c in line.strip().strip('|').split('|')]
    return bool(cells and cells[0] in hmap)

# ─── Traducteur de fichier ────────────────────────────────────────────────────

def translate_file(src_path, dst_path, title_fr, en_web_path, title_en=None):
    if title_en is None:
        title_en = title_fr  # fallback
    content = src_path.read_text(encoding='utf-8')
    lines = content.splitlines(keepends=True)
    out = []
    in_fm = False
    fm_done = False

    for i, line in enumerate(lines):
        if i == 0 and line.strip() == '---':
            in_fm = True
            out.append(line)
            continue
        if in_fm and not fm_done:
            if line.strip() == '---':
                in_fm = False
                fm_done = True
                out.append(line)
                out.append('\n')
                out.append(banner(title_en, en_web_path))
                continue
            if line.startswith('title:'):
                out.append(f'title: "{title_fr}"\n')
                continue
            out.append(line)
            continue
        # Lignes de tableau
        if line.startswith('|'):
            if is_separator_row(line):
                out.append(line)
                continue
            if is_header_row(line, HEADERS_FR):
                out.append(translate_table_line(line, HEADERS_FR))
                continue
            out.append(line.replace('| Yes |', '| Oui |').replace('| No |', '| Non |'))
            continue
        # Sections ##
        if line.startswith('## '):
            section = line[3:].strip()
            for mapping in (ITEM_TITLES_FR, PET_TITLES_FR, RECIPE_TITLES_FR, MOB_TITLES_FR):
                if section in mapping:
                    out.append(f'## {mapping[section]}\n')
                    break
            else:
                out.append(line)
            continue
        out.append(line)

    dst_path.parent.mkdir(parents=True, exist_ok=True)
    dst_path.write_text(''.join(out), encoding='utf-8')

# ─── Index ────────────────────────────────────────────────────────────────────

def translate_index(src_path, dst_path):
    content = src_path.read_text(encoding='utf-8')
    import re
    content = re.sub(r'^title: "Live Game Data"', 'title: "Données du Jeu en Direct"',
                     content, flags=re.MULTILINE)
    for en, fr in INDEX_REPLACE_FR:
        content = content.replace(en, fr)
    parts = content.split('---\n', 2)
    if len(parts) == 3:
        b = banner('Live Game Data', 'game-data')
        content = parts[0] + '---\n' + parts[1] + '---\n\n' + b + parts[2]
    dst_path.parent.mkdir(parents=True, exist_ok=True)
    dst_path.write_text(content, encoding='utf-8')

# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    count = 0

    translate_index(SRC / 'index.md', DST_FR / 'index.md')
    print('  ✅ index.md')
    count += 1

    for slug, title_fr in ITEM_TITLES_FR.items():
        fn = slug.lower().replace(' ', '-').replace("'", '') + '.md'
        src = SRC / 'items' / fn
        if not src.exists():
            continue
        translate_file(src, DST_FR / 'items' / fn, title_fr, f'game-data/items/{fn[:-3]}', slug)
        print(f'  ✅ items/{fn}  →  {title_fr}')
        count += 1

    for slug, title_fr in PET_TITLES_FR.items():
        fn = slug.lower() + '.md'
        src = SRC / 'pets' / fn
        if not src.exists():
            continue
        translate_file(src, DST_FR / 'pets' / fn, title_fr, f'game-data/pets/{fn[:-3]}', slug)
        print(f'  ✅ pets/{fn}  →  {title_fr}')
        count += 1

    for slug, title_fr in RECIPE_TITLES_FR.items():
        fn = slug.lower() + '.md'
        src = SRC / 'recipes' / fn
        if not src.exists():
            continue
        translate_file(src, DST_FR / 'recipes' / fn, title_fr, f'game-data/recipes/{fn[:-3]}', slug)
        print(f'  ✅ recipes/{fn}  →  {title_fr}')
        count += 1

    mob_count = 0
    for src in sorted((SRC / 'mobs').glob('*.md')):
        dst = DST_FR / 'mobs' / src.name
        zone_en = src.stem.replace('-', ' ').title()
        title_fr = MOB_TITLES_FR.get(zone_en, zone_en)
        translate_file(src, dst, title_fr, f'game-data/mobs/{src.stem}', zone_en)
        mob_count += 1
        count += 1
    print(f'  ✅ mobs/ ({mob_count} zones)')

    print(f'\n✅ {count} fichiers game-data traduits en FR → i18n/fr/')

if __name__ == '__main__':
    main()

