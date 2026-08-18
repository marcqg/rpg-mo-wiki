---
title: "Niveau de Combat"
---

> 🇫🇷 Traduction française — nom original (anglais) : **Combat Level** — <a href="/rpg-mo-wiki/database/guides/combat-level">voir la page en anglais</a>

## Niveau de Combat

D'après le [Calculateur de Niveau de Combat](https://www.rpgmobob.com/cl) de bobdylan, le Niveau de Combat est calculé à partir des statistiques du personnage (précision, force, défense, santé, magie, archérie) :

```
opt1 = précision + force + défense + magie + santé
opt2 = précision + force + défense + archérie + santé

modificateur_magie    = magie    > opt2 / 4 ? 4 : 6
modificateur_archerie = archérie > opt1 / 4 ? 4 : 6

niveau_combat = floor(
  (précision + force + défense + santé) / 4
  + magie    / modificateur_magie
  + archérie / modificateur_archerie
)
```

L'idée : les stats « physiques » (précision, force, défense, santé) comptent toujours à 100 %; la magie et l'archérie comptent à 100 % (divisées par 4) uniquement si elles dépassent un quart du total des autres stats offensives — sinon elles comptent moins (divisées par 6). Cela empêche un personnage hybride d'accumuler un niveau de combat disproportionné.
