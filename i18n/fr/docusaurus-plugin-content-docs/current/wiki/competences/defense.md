---
title: "Defense"
slug: /defense
---

> 🇫🇷 Traduction française — nom original (anglais) : **Defense** — <a href="/rpg-mo-wiki/defense">voir la page en anglais</a>

La Défense (Defense) est une [Compétence](/skills) qui réduit la chance qu'un ennemi t'inflige des [Dégâts Physiques](/physical-damage), réduit directement les [Dégâts Magiques](/magic-damage) et qui est requise pour l'[Équipement](/equipment), principalement pour les [Armures](/armors).

## Effet sur le combat

Prendre moins de dégâts est essentiel pour tenir en combat prolongé, en économisant du temps (moins besoin de se réapprovisionner en nourriture) et de l'argent (consommation réduite de nourriture).

L'armure de l'équipement s'ajoute à ta statistique de défense, à raison de 3 armure pour 1 défense.

## Formule des dégâts physiques

(Note : formule basée sur le code source au 16/05/2015)

En utilisant les variables suivantes :

*   str = force de l'attaquant
*   acc = précision de l'attaquant
*   pow = puissance de l'attaquant
*   aim = visée de l'attaquant
*   def = défense de la cible
*   arm = armure de la cible

Et les fonctions suivantes :

*   Random() - donne un nombre aléatoire entre 0 et 1
*   Max(a, b) - égal à « a » ou « b », le plus grand des deux
*   Ceiling(a) - donne le plus petit entier égal ou supérieur à « a »

Les dégâts sont calculés comme suit :

1.  tot\_str = str + pow / 2
2.  tot\_acc = acc + aim / 2
3.  tot\_def = def + arm / 3
4.  si le style de combat est agressif, tot\_str = tot\_str + 1
5.  si le style de combat est défensif, tot\_def = tot\_def + 1
6.  si le style de combat est précis, tot\_acc = tot\_acc + 1
7.  temp\_damage = 1 + (tot\_str / 5) \* Random()
8.  temp\_defense = Max(0, tot\_def - tot\_acc) \* Random()
9.  final\_damage = Max(0, Ceiling(temp\_damage - temp\_defense))
