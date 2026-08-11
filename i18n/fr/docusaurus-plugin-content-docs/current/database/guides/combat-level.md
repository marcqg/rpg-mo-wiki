---
title: "Combat Level"
---

> 🇫🇷 Traduction française — nom original (anglais) : **Combat Level** — <a href="/rpg-mo-wiki/database/guides/combat-level">voir la page en anglais</a>

## Formule du Combat Level

D'après la [Combat Level Calculator](https://www.rpgmobob.com/cl) de bobdylan, le niveau de combat (Combat Level) se calcule à partir des statistiques du personnage (accuracy, strength, defense, health, magic, archery) :

```
opt1 = accuracy + strength + defense + magic + health
opt2 = accuracy + strength + defense + archery + health

magic_mod  = magic   > opt2 / 4 ? 4 : 6
archery_mod = archery > opt1 / 4 ? 4 : 6

combat_level = floor(
  (accuracy + strength + defense + health) / 4
  + magic / magic_mod
  + archery / archery_mod
)
```

Le principe : les stats "physiques" (accuracy, strength, defense, health) comptent toujours ; magic et archery ne comptent pleinement (division par 4) que si elles dépassent un quart du total des autres stats offensives, sinon elles comptent moins (division par 6). Cela évite qu'un personnage hybride cumule un niveau de combat disproportionné.
