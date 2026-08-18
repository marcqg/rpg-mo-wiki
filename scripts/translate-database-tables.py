#!/usr/bin/env python3
"""Traduit les tableaux database pour une locale donnee.
Usage: python3 scripts/translate-database-tables.py fr"""
import json, re, sys, time, urllib.request, urllib.parse
from pathlib import Path

LOCALE = sys.argv[1] if len(sys.argv) > 1 else 'fr'
ROOT   = Path(__file__).parent.parent
I18N   = ROOT / 'i18n' / LOCALE / 'docusaurus-plugin-content-docs/current/database'

HEADERS = {
 'fr': {'Name':'Nom','Price':'Prix','Stats':'Stats','Combat Level':'Niveau de Combat',
  'Health':'Santé','Aggressive':'Agressif','Drops':'Butins','Coordinates':'Coordonnées',
  'Sells':'Vend','XP Required':'XP requis','Happiness':'Bonheur',
  'Breeding Level':"Niveau d'\u00e9levage",'Eats':'Mange','Level':'Niveau','XP':'XP',
  'Chance':'Chance','Materials':'Matériaux','Seed':'Graine','Cost':'Coût',
  'Time (min)':'Durée (min)','Grows Into':'Produit','Sells For':'Prix de vente',
  'Buy From':'Achat chez','Sell To':'Vendu \u00e0','Spore':'Spore',
  'Spore Vendor':'Vendeur de spores','Mushroom Buyer':'Acheteur de champignons',
  'Growing Locations':'Emplacements de culture','Material':'Matériau',
  'Level Required':'Niveau requis','Location':'Emplacement',
  'Distance (tiles)':'Distance (cases)','Notes':'Notes','Optimal':'Optimal',
  'Zone':'Zone','See also':'Voir aussi','Yes':'Oui','No':'Non'},
 'pt': {'Name':'Nome','Price':'Pre\u00e7o','Stats':'Stats','Combat Level':'N\u00edvel de Combate',
  'Health':'Vida','Aggressive':'Agressivo','Drops':'Drops','Coordinates':'Coordenadas',
  'Sells':'Vende','XP Required':'XP necess\u00e1rio','Happiness':'Felicidade',
  'Breeding Level':'N\u00edvel de reprodu\u00e7\u00e3o','Eats':'Come','Level':'N\u00edvel','XP':'XP',
  'Chance':'Chance','Materials':'Materiais','Seed':'Semente','Cost':'Custo',
  'Time (min)':'Tempo (min)','Grows Into':'Produz','Sells For':'Pre\u00e7o de venda',
  'Buy From':'Comprar em','Sell To':'Vender a','Spore':'Esporo',
  'Spore Vendor':'Vendedor de esporos','Mushroom Buyer':'Comprador de cogumelos',
  'Growing Locations':'Locais de cultivo','Material':'Material',
  'Level Required':'N\u00edvel necess\u00e1rio','Location':'Local',
  'Distance (tiles)':'Dist\u00e2ncia (tiles)','Notes':'Notas','Optimal':'\u00d3timo',
  'Zone':'Zona','See also':'Ver tamb\u00e9m','Yes':'Sim','No':'N\u00e3o'},
 'pl': {'Name':'Nazwa','Price':'Cena','Stats':'Statystyki','Combat Level':'Poziom walki',
  'Health':'\u017bycie','Aggressive':'Agresywny','Drops':'\u0141upy','Coordinates':'Wsp\u00f3\u0142rz\u0119dne',
  'Sells':'Sprzedaje','XP Required':'Wymagane XP','Happiness':'Szcz\u0119\u015bcie',
  'Breeding Level':'Poziom hodowli','Eats':'Je','Level':'Poziom','XP':'XP',
  'Chance':'Szansa','Materials':'Materia\u0142y','Seed':'Nasiono','Cost':'Koszt',
  'Time (min)':'Czas (min)','Grows Into':'Wyrasta w','Sells For':'Cena sprzeda\u017cy',
  'Buy From':'Kup od','Sell To':'Sprzedaj do','Spore':'Spora',
  'Spore Vendor':'Sprzedawca spor','Mushroom Buyer':'Kupiec grzyb\u00f3w',
  'Growing Locations':'Miejsca uprawy','Material':'Materia\u0142',
  'Level Required':'Wymagany poziom','Location':'Lokalizacja',
  'Distance (tiles)':'Dystans (kafelki)','Notes':'Uwagi','Optimal':'Optymalny',
  'Zone':'Strefa','See also':'Zobacz te\u017c','Yes':'Tak','No':'Nie'},
 'ko': {'Name':'\uc774\ub984','Price':'\uac00\uaca9','Stats':'\uc2a4\ud0ef','Combat Level':'\uc804\ud22c \ub808\ubca8',
  'Health':'\uccb4\ub825','Aggressive':'\uacf5\uaca9\uc801','Drops':'\ub4dc\ub86d','Coordinates':'\uc88c\ud45c',
  'Sells':'\ud310\ub9e4','XP Required':'\ud544\uc694 XP','Happiness':'\ud589\ubcf5\ub3c4',
  'Breeding Level':'\uc0ac\uc721 \ub808\ubca8','Eats':'\uba39\uc774','Level':'\ub808\ubca8','XP':'XP',
  'Chance':'\ud655\ub960','Materials':'\uc7ac\ub8cc','Seed':'\uc528\uc558','Cost':'\ube44\uc6a9',
  'Time (min)':'\uc2dc\uac04 (\ubd84)','Grows Into':'\uc0dd\uc0b0\ubb3c','Sells For':'\ud310\ub9e4 \uac00\uaca9',
  'Buy From':'\uad6c\ub9e4\ucc98','Sell To':'\ud310\ub9e4\ucc98','Spore':'\ud3ec\uc790',
  'Spore Vendor':'\ud3ec\uc790 \ud310\ub9e4\uc790','Mushroom Buyer':'\ubc84\uc12f \uad6c\ub9e4\uc790',
  'Growing Locations':'\uc7ac\ubc30 \uc704\uce58','Material':'\uc7ac\ub8cc',
  'Level Required':'\ud544\uc694 \ub808\ubca8','Location':'\uc704\uce58',
  'Distance (tiles)':'\uac70\ub9ac (\ud0c0\uc77c)','Notes':'\ube44\uace0','Optimal':'\ucd5c\uc801',
  'Zone':'\uc9c0\uc5ed','See also':'\ucc38\uace0','Yes':'\uc608','No':'\uc544\ub2c8\uc624'},
}

hmap = HEADERS[LOCALE]
lang = LOCALE

def batch_translate(texts):
    if not texts: return []
    joined = '\n'.join(texts)
    url = ('https://translate.googleapis.com/translate_a/single'
           f'?client=gtx&sl=en&tl={lang}&dt=t&q={urllib.parse.quote(joined)}')
    try:
        with urllib.request.urlopen(url, timeout=15) as r:
            d = json.loads(r.read())
        result = ''.join(p[0] for p in d[0])
        lines = result.split('\n')
        if len(lines) >= len(texts): return lines[:len(texts)]
        return lines + texts[len(lines):]
    except Exception as e:
        print(f'  API err: {e}', file=sys.stderr); return texts

def process_file(path):
    lines = path.read_text(encoding='utf-8').splitlines(keepends=True)
    names, idxs = [], []
    for i, line in enumerate(lines):
        if not line.startswith('|'): continue
        if all(c in '| :-' for c in line.strip()): continue
        cells = [c.strip() for c in line.strip().strip('|').split('|')]
        if not cells: continue
        n = cells[0]
        if n and n not in hmap and n != '---':
            names.append(n); idxs.append(i)
    if not names: return ''.join(lines), 0
    trans = {}
    for s in range(0, len(names), 50):
        batch = names[s:s+50]
        results = batch_translate(batch)
        for o, t in zip(batch, results):
            t = t.strip()
            if t and t.lower() != o.lower(): trans[o] = t
        time.sleep(0.15)
    modified = 0
    out = list(lines)
    for i, line in enumerate(lines):
        if not line.startswith('|'): continue
        if all(c in '| :-' for c in line.strip()): continue
        cells = [c.strip() for c in line.strip().strip('|').split('|')]
        if not cells: continue
        n = cells[0]
        if n in hmap:
            new_cells = [hmap.get(c, c) for c in cells]
            out[i] = '| ' + ' | '.join(new_cells) + ' |\n'
            modified += 1
        elif n and n != '---' and n in trans:
            cells[0] = f'{trans[n]} *({n})*'
            out[i] = '| ' + ' | '.join(cells) + ' |\n'
            modified += 1
    return ''.join(out), modified

if not I18N.exists(): print(f'Absent: {I18N}'); sys.exit(1)
total_f = total_c = 0
for md in sorted(I18N.rglob('*.md')):
    if '_category_' in md.name: continue
    new_c, cnt = process_file(md)
    if cnt > 0:
        md.write_text(new_c, encoding='utf-8')
        print(f'  {cnt:>4}  {md.relative_to(ROOT/"i18n"/LOCALE)}')
        total_f += 1; total_c += cnt
print(f'\n[{LOCALE}] {total_f} fichiers, {total_c} cellules.')
