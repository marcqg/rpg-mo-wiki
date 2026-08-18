---
title: "Poziom walki"
---
> 🇵🇱 Wersja polska — <a href="/rpg-mo-wiki/database/guides/combat-level">see the English page</a>

## Poziom walki

According to bobdylan's [Combat Level Calculator](https://www.rpgmobob.com/cl), Combat Level is calculated from the character's stats (accuracy, strength, defense, health, magic, archery):

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

The idea: "physical" stats (accuracy, strength, defense, health) always count fully; magic and archery only count fully (divided by 4) if they exceed a quarter of the total of the other offensive stats, otherwise they count for less (divided by 6). This prevents a hybrid character from stacking a disproportionate combat level.

