---
title: "Success chance"
slug: /success-chance
---
> 🇰🇷 한국어 버전 — <a href="/rpg-mo-wiki/success-chance">see the English page</a>

To calculate the success chance, one must take into account the minimum (base) chance, the maximum (base) chance and other factors, depending on the skill or activity.

With the Right-Click Menu Extensions mod enabled, right clicking a mob, a fishing spot, etc., and clicking "Drops" shows the actual success chances, adjusted by the level of the player and reduced rate.

## Level based

Some activities have a higher success chance the higher the player's level on the corresponding skill is. They are listed below:

*   [Fishing](/fishing)
*   [Cooking](/cooking)
*   [Jewelry](/jewelry)
*   [Alchemy](/alchemy)
*   [Forging](/forging) bars
*   [Woodcutting](/woodcutting)
*   [Mining](/mining)
*   [Breeding](/breeding)

For every +1 level above the required one for the activity, the success chance increases by +1%, unless the maximum chance is reached.

## Reduced rate

Reduced rate applies when there are multiple possible outcomes from an activity. It applies to:

*   Fishing
*   [Making vials](/alchemy)
*   Breeding
*   Monster drops

The outcomes are ordered from highest to lowest required level for fishing and for making vials, from highest to lowest base success chance for breeding and varies for monster drops (is different for each monster). The game first checks if the first outcome was successful, if not, it checks for the second, etc. That way, if the base success chances for the first two outcomes are p1 and p2, respectively, the actual probability to get the second one is p2 \* (1 - p1) (the first one must fail first). Generally, the actual probability to get the nth outcome is given by:

[![Reduced rate](https://static.wikia.nocookie.net/rpg-mo/images/7/71/Reduced_rate.png/revision/latest?cb=20141003074601)](https://static.wikia.nocookie.net/rpg-mo/images/7/71/Reduced_rate.png/revision/latest?cb=20141003074601)

The reduced rate is applied _after_ the increased rates (from extra levels, for example).

## Maximum chance

Most activities have a maximum success chance lower than 100%. Some of the exceptions for that are:

*   Cooking
*   Forging bars
*   Mining ores
*   Woodcutting

The maximum chance is a hard cap. Increased rates of any sort do not increase the success chance further than the maximum chance.

Some of the activities that have the base chance equal to the maximum chance (fixed success chance) are:

*   Forging (except bars)
*   Mining gems
*   Fishing Raw Pearl Clam

## Other

Breeding also increases the base chance by +1% for each empty grass square inside the breeding pen (does not count the fence or the breeding nests), unless the maximum chance is reached.
