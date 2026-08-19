#!/usr/bin/env python3
"""
translate-game-data-fr.py
Génère les pages FR de game-data dans i18n/fr/ :
  - bandeau 🇫🇷 + lien vers la version EN
  - en-têtes traduits (statique)
  - noms d'items + matériaux traduits via Google Translate
    format : Traduction *(Original)*
"""
import re, json, time, urllib.request, urllib.parse
from pathlib import Path

ROOT   = Path(__file__).parent.parent
SRC    = ROOT / 'docs' / 'game-data'
DST_FR = ROOT / 'i18n' / 'fr' / 'docusaurus-plugin-content-docs' / 'current' / 'game-data'

HEADERS_FR = {
    'Icon':'Icône','Name':'Nom','Price':'Prix','Stats':'Stats',
    'Combat Level':'Niveau de Combat','Health':'Santé',
    'Aggressive':'Agressif','Drops':'Butins',
    'XP Required':'XP requis','Happiness':'Bonheur',
    'Breeding Level':"Niveau d'élevage",'Eats':'Mange',
    'Level':'Niveau','XP':'XP','Chance':'Chance',
    'Materials':'Matériaux','Source':'Source',
    'Yes':'Oui','No':'Non',
    'Parent 1':'Parent 1','Parent 2':'Parent 2',
    'Duration':'Durée','Offspring (Chances)':'Descendants (Chances)',
}
ITEM_TITLES_FR   = {'Armor':'Armures','Weapon':'Armes','Food':'Nourriture','Material':'Matériaux','Tool':'Outils','Jewelry':'Bijoux','Spell':'Sorts','Pet Item':'Objets Familiers','House':'Maison','Archery':"Tir à l'arc"}
PET_TITLES_FR    = {'Common':'Commun','Rare':'Rare','Legendary':'Légendaire','Ancient':'Ancien','Artifact':'Artefact','Egg':'Œuf'}
RECIPE_TITLES_FR = {'Forging':'Forge','Farming':'Agriculture','Cooking':'Cuisine','Fishing':'Pêche','Jewelry':'Bijouterie','Woodcutting':'Bûcheronnage','Mining':'Minage','Alchemy':'Alchimie','Fungiculture':'Fongicoelture','Wizardry':'Sorcellerie','Carpentry':'Charpenterie','Fletching':'Fabrication de flèches','Breeding':'Élevage'}
MOB_TITLES_FR    = {'Unknown Location':'Emplacement Inconnu','Minigames':'Mini-jeux','Tutorial Island':'Île Tutoriel'}
INDEX_REPLACE_FR = [
    ('This section contains data extracted **directly from the official RPG MO game files**','Cette section contient des données extraites **directement depuis les fichiers officiels du jeu RPG MO**'),
    ('It is refreshed by running','Mis à jour en exécutant'),(' then ',' puis '),
    ('| Section | Total | Sub-categories |','| Section | Total | Sous-catégories |'),
    (' objects',' objets'),(' enemies',' ennemis'),(' companions',' compagnons'),(' formulas',' formules'),
    ('See [Sources & Credits](/sources) for full attribution.',"Voir [Sources et remerciements](/sources) pour l'attribution complète."),
]

_cache = {}
def gtranslate(texts):
    if not texts: return []
    todo = [t for t in texts if t not in _cache]
    for i in range(0, len(todo), 50):
        batch = todo[i:i+50]
        joined = '\n'.join(batch)
        url = ('https://translate.googleapis.com/translate_a/single'
               f'?client=gtx&sl=en&tl=fr&dt=t&q={urllib.parse.quote(joined)}')
        try:
            req = urllib.request.Request(url, headers={'User-Agent':'Mozilla/5.0'})
            with urllib.request.urlopen(req, timeout=15) as r:
                d = json.loads(r.read())
            lines = ''.join(p[0] for p in d[0]).split('\n')
            while len(lines) < len(batch): lines.append('')
            for orig, tr in zip(batch, lines):
                t = tr.strip()
                _cache[orig] = t if t and t.lower() != orig.lower() else orig
        except Exception as e:
            print(f'  [API err] {e}', flush=True)
            for orig in batch: _cache[orig] = orig
        time.sleep(0.2)
    return [_cache.get(t, t) for t in texts]

def banner(en_title, en_path):
    return (f'> 🇫🇷 Traduction française — nom original (anglais) : **{en_title}**'
            f' — <a href="/rpg-mo-wiki/{en_path}">voir la page en anglais</a>\n\n')

def split_cells(line):
    return [c.strip() for c in line.strip().strip('|').split('|')]

def is_sep(line):
    return bool(line.startswith('|') and all(c in '| :-' for c in line.strip()))

def is_header(line):
    c = split_cells(line)
    return bool(c and c[0] in HEADERS_FR)

def fmt_cell(en_text, trans):
    """Retourne 'Traduction *(Original)*' si la traduction differe, sinon l'original."""
    t = trans.strip()
    if not t or t.lower() == en_text.lower():
        return en_text
    return f'{t} *({en_text})*'

def translate_recipes_file(src_path, dst_path, title_fr, title_en, en_path):
    """
    Traduit une page de recettes game-data:
    - en-têtes: statique
    - colonne Name (col 1) : traduite
    - colonne Materials (dernière col) : chaque item traduit
    """
    content = src_path.read_text(encoding='utf-8')
    lines = content.splitlines(keepends=True)

    # 1. Collecter tous les noms à traduire (col 1 = nom, + noms dans Materials)
    names_to_translate = set()
    for line in lines:
        if not line.startswith('|'): continue
        if is_sep(line) or is_header(line): continue
        cells = split_cells(line)
        if len(cells) < 2: continue
        # Col 1 = nom de l'item produit (sans l'icone qui est en col 0)
        name = cells[1]  # Name est la 2ème colonne (après Icon)
        if name and name != '—': names_to_translate.add(name)
        # Dernière colonne = Materials : "3× Iron Ore<br/>1× Coal"
        mat_col = cells[-1]
        if mat_col and mat_col != '—':
            for part in re.split(r'<br/?>', mat_col):
                part = part.strip()
                # Format: "Nx Item Name" — on extrait le nom après le nombre
                m = re.match(r'^\d+[×x]\s*(.+)$', part)
                if m:
                    names_to_translate.add(m.group(1).strip())

    # 2. Traduire en batch
    names_list = sorted(names_to_translate)
    print(f'    Traduction de {len(names_list)} termes...', flush=True)
    translations = dict(zip(names_list, gtranslate(names_list)))

    # 3. Reconstruire le fichier
    out = []
    in_fm = False
    fm_done = False
    for i, line in enumerate(lines):
        if i == 0 and line.strip() == '---':
            in_fm = True; out.append(line); continue
        if in_fm and not fm_done:
            if line.strip() == '---':
                in_fm = False; fm_done = True
                out.append(line)
                out.append('\n')
                out.append(banner(title_en, en_path))
                continue
            if line.startswith('title:'):
                out.append(f'title: "{title_fr}"\n'); continue
            out.append(line); continue
        if line.startswith('|'):
            if is_sep(line): out.append(line); continue
            if is_header(line):
                cells = split_cells(line)
                out.append('| ' + ' | '.join(HEADERS_FR.get(c,c) for c in cells) + ' |\n')
                continue
            cells = split_cells(line)
            if len(cells) >= 2:
                # Col 0 = icône (inchangée)
                # Col 1 = nom de la recette
                orig_name = cells[1]
                if orig_name and orig_name != '—':
                    cells[1] = fmt_cell(orig_name, translations.get(orig_name, orig_name))
                # Dernière col = Materials
                if len(cells) >= 7:
                    mat_col = cells[-1]
                    if mat_col and mat_col != '—':
                        parts = re.split(r'<br/?>', mat_col)
                        new_parts = []
                        for part in parts:
                            part = part.strip()
                            m = re.match(r'^(\d+[×x]\s*)(.+)$', part)
                            if m:
                                qty = m.group(1)
                                mat_name = m.group(2).strip()
                                tr_name = translations.get(mat_name, mat_name)
                                new_parts.append(qty + fmt_cell(mat_name, tr_name))
                            else:
                                new_parts.append(part)
                        cells[-1] = '<br/>'.join(new_parts)
            out.append('| ' + ' | '.join(cells) + ' |\n')
            continue
        # Sections ##
        if line.startswith('## '):
            section = line[3:].strip()
            for mapping in (RECIPE_TITLES_FR, ITEM_TITLES_FR, PET_TITLES_FR, MOB_TITLES_FR):
                if section in mapping:
                    out.append(f'## {mapping[section]}\n'); break
            else:
                out.append(line)
            continue
        out.append(line)

    dst_path.parent.mkdir(parents=True, exist_ok=True)
    dst_path.write_text(''.join(out), encoding='utf-8')

def translate_file_simple(src_path, dst_path, title_fr, title_en, en_path):
    """Traduit les autres types de pages (items, pets, mobs) - pas de traduction des noms."""
    content = src_path.read_text(encoding='utf-8')
    lines = content.splitlines(keepends=True)
    out = []
    in_fm = False; fm_done = False
    for i, line in enumerate(lines):
        if i == 0 and line.strip() == '---': in_fm = True; out.append(line); continue
        if in_fm and not fm_done:
            if line.strip() == '---':
                in_fm = False; fm_done = True
                out.append(line); out.append('\n'); out.append(banner(title_en, en_path)); continue
            if line.startswith('title:'): out.append(f'title: "{title_fr}"\n'); continue
            out.append(line); continue
        if line.startswith('|'):
            if is_sep(line): out.append(line); continue
            if is_header(line):
                cells = split_cells(line)
                out.append('| ' + ' | '.join(HEADERS_FR.get(c,c) for c in cells) + ' |\n'); continue
            out.append(line.replace('| Yes |','| Oui |').replace('| No |','| Non |'))
            continue
        if line.startswith('## '):
            section = line[3:].strip()
            for mapping in (ITEM_TITLES_FR, PET_TITLES_FR, RECIPE_TITLES_FR, MOB_TITLES_FR):
                if section in mapping: out.append(f'## {mapping[section]}\n'); break
            else: out.append(line)
            continue
        out.append(line)
    dst_path.parent.mkdir(parents=True, exist_ok=True)
    dst_path.write_text(''.join(out), encoding='utf-8')

def translate_index(src_path, dst_path):
    content = src_path.read_text(encoding='utf-8')
    content = re.sub(r'^title: "Live Game Data"','title: "Données du Jeu en Direct"',content,flags=re.MULTILINE)
    for en, fr in INDEX_REPLACE_FR: content = content.replace(en, fr)
    parts = content.split('---\n', 2)
    if len(parts) == 3:
        b = banner('Live Game Data','game-data')
        content = parts[0] + '---\n' + parts[1] + '---\n\n' + b + parts[2]
    dst_path.parent.mkdir(parents=True, exist_ok=True)
    dst_path.write_text(content, encoding='utf-8')

def main():
    count = 0
    translate_index(SRC/'index.md', DST_FR/'index.md')
    print('  ✅ index.md'); count += 1

    for slug, title_fr in ITEM_TITLES_FR.items():
        fn = slug.lower().replace(' ','-').replace("'",'') + '.md'
        src = SRC/'items'/fn
        if not src.exists(): continue
        translate_file_simple(src, DST_FR/'items'/fn, title_fr, slug, f'game-data/items/{fn[:-3]}')
        print(f'  ✅ items/{fn}  →  {title_fr}'); count += 1

    for slug, title_fr in PET_TITLES_FR.items():
        fn = slug.lower() + '.md'
        src = SRC/'pets'/fn
        if not src.exists(): continue
        translate_file_simple(src, DST_FR/'pets'/fn, title_fr, slug, f'game-data/pets/{fn[:-3]}')
        print(f'  ✅ pets/{fn}  →  {title_fr}'); count += 1

    for slug, title_fr in RECIPE_TITLES_FR.items():
        fn = slug.lower() + '.md'
        src = SRC/'recipes'/fn
        if not src.exists(): continue
        print(f'  ⚙ recipes/{fn}  →  {title_fr}', flush=True)
        translate_recipes_file(src, DST_FR/'recipes'/fn, title_fr, slug, f'game-data/recipes/{fn[:-3]}')
        print(f'  ✅ recipes/{fn}  →  {title_fr}'); count += 1

    mob_count = 0
    for src in sorted((SRC/'mobs').glob('*.md')):
        dst = DST_FR/'mobs'/src.name
        zone_en = src.stem.replace('-',' ').title()
        title_fr = MOB_TITLES_FR.get(zone_en, zone_en)
        translate_file_simple(src, dst, title_fr, zone_en, f'game-data/mobs/{src.stem}')
        mob_count += 1; count += 1
    print(f'  ✅ mobs/ ({mob_count} zones)')
    print(f'\n✅ {count} fichiers game-data traduits en FR → i18n/fr/')

if __name__ == '__main__':
    main()
