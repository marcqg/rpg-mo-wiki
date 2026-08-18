---
title: "Timer"
slug: /timer
---

> 🇫🇷 Traduction française — nom original (anglais) : **Timer** — <a href="/rpg-mo-wiki/timer">voir la page en anglais</a>

Utiliser la commande /timer peut vous aider à suivre des événements chronométrés comme le temps de pousse des plantes, le minuteur de skill quest, le minuteur d'île monstre, etc. En raison de certaines irrégularités internes, l'utilisation de /timer a des exigences un peu particulières.

## Compte à rebours

Utile pour la pousse des plantes, l'île monstre et les skill quests. Le protocole est le suivant :

/timer 1234567monster set 1h 50m 30s

Les chiffres « 1234567 » servent d'espaceurs, de sorte que le nom réel du minuteur sera (monster). « Set » sert pour les minuteurs à compte à rebours. « h », « m » et « s » désignent les heures, minutes et secondes. Utiliser seulement « m » suffit pour un minuteur de plus d'une heure.

## Compte écoulé (Elapsed Count-up)

Utile pour « depuis combien de temps je fais cette action », par exemple pour obtenir un butin spécifique d'un monstre.

/timer 1234567good loot start

Les chiffres « 1234567 » servent d'espaceurs, de sorte que le nom réel du minuteur sera (good loot). Tapez /timer pour voir le temps écoulé.

## Effacer

/timer clear est censé effacer tous les minuteurs, mais ne semble effacer que les minuteurs (par défaut), c'est-à-dire les minuteurs sans nom. Pour effacer un minuteur nommé, faites /timer 1234567monster clear OU /timer 1234567good loot clear pour effacer les minuteurs nommés ci-dessus.
