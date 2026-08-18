---
title: "Defense"
slug: /defense
---
> 🇰🇷 한국어 버전 — <a href="/rpg-mo-wiki/defense">see the English page</a>

Defense is a [Skill](/skills) that reduces the chance an enemy will deal [Physical Damage](/physical-damage), directly reduces [Magic Damage](/magic-damage) and is a requirement for [Equipment](/equipment), primarily for [Armors](/armors).

## Effect on Combat

Taking less damage is key for sustained combat, saving time by not refilling on food as often and money by consuming less food.

Equipment's armor is added to your defense stat, at a rate of 3 armor for 1 defense.

## Physical Damage Formula

(Note: formula based on source code on 16/05/2015)

Using the following variables:

*   str = attacker's strength
*   acc = attacker's accuracy
*   pow = attacker's power
*   aim = attacker's aim
*   def = target defense
*   arm = target armor

And the following functions:

*   Random() - gives a random number between 0 and 1
*   Max(a, b) - equal to "a" or "b", whichever is larger
*   Ceiling(a) - gives the smallest integer equal or larger than "a"

Damage is calculated as follows:

1.  tot\_str = str + pow / 2
2.  tot\_acc = acc + aim / 2
3.  tot\_def = def + arm / 3
4.  if combat style is aggressive, tot\_str = tot\_str + 1
5.  if combat style is defensive, tot\_def = tot\_def + 1
6.  if combat style is accurate, tot\_acc = tot\_acc + 1
7.  temp\_damage = 1 + (tot\_str / 5) \* Random()
8.  temp\_defense = Max(0, tot\_def - tot\_acc) \* Random()
9.  final\_damage = Max(0, Ceiling(temp\_damage - temp\_defense))
