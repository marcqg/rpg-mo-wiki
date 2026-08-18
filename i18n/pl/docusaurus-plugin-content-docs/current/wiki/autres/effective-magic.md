---
title: "Effective magic"
slug: /effective-magic
---
> 🇵🇱 Wersja polska — <a href="/rpg-mo-wiki/effective-magic">see the English page</a>

The effective magic (M) is one of the five combat stats. For a player casting a [spell](/spells) with magic penetration _pen_, it is given by:

M = [Magic](/magic) (skill) + _pen_ + 5/6 \* Magic (equipment)

## Magic Damage

If the effective defense (D') of the enemy is lower than the effective magic (M) of the player casting the spell, the damage will be a random number between 25% and 100% of the maximum damage of that spell, with the same chances for each value ([uniform distribution](http://en.wikipedia.org/wiki/Uniform_distribution_\(discrete\))). Otherwise, the damage will be that random number multiplied by M/D' (will be reduced).

The magic damage is only applied to the enemy during the player's turn to hit. The image below shows magic damage being dealt to a monster.

[![Magic Damage](https://static.wikia.nocookie.net/rpg-mo/images/7/78/Magic_damage.png/revision/latest?cb=20141002135515)](https://static.wikia.nocookie.net/rpg-mo/images/7/78/Magic_damage.png/revision/latest?cb=20141002135515)

Magic Damage

On the left, 4 spells were cast at the same time, but the damage (7 + 2 + 2 + 4 = 15) was not applied yet. When it's the player's turn to attack, the damage displayed is 39, which is the total damage. That means that the physical damage dealt by the player was 24 (39 - 15). If the player runs away from a fight before his turn to attack, the damage bonus from spells cast since his last attack will be cancelled.
