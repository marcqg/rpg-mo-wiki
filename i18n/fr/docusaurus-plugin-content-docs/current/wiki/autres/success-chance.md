---
title: "Success chance"
slug: /success-chance
---

> 🇫🇷 Traduction française — nom original (anglais) : **Success chance** — <a href="/rpg-mo-wiki/success-chance">voir la page en anglais</a>

Pour calculer la chance de réussite, il faut prendre en compte la chance minimale (de base), la chance maximale (de base) et d'autres facteurs, selon la compétence ou l'activité concernée.

Avec le mod Right-Click Menu Extensions activé, faire un clic droit sur un monstre, un spot de pêche, etc., puis cliquer sur « Drops » affiche les chances de réussite réelles, ajustées selon le niveau du joueur et le taux réduit (reduced rate).

## Basé sur le niveau

Certaines activités ont une chance de réussite plus élevée lorsque le niveau du joueur dans la compétence correspondante est plus élevé. Les voici :

*   [Fishing](/fishing)
*   [Cooking](/cooking)
*   [Jewelry](/jewelry)
*   [Alchemy](/alchemy)
*   [Forging](/forging) (barres)
*   [Woodcutting](/woodcutting)
*   [Mining](/mining)
*   [Breeding](/breeding)

Pour chaque niveau supplémentaire au-dessus du niveau requis pour l'activité, la chance de réussite augmente de +1%, à moins que la chance maximale ne soit atteinte.

## Taux réduit (Reduced rate)

Le taux réduit s'applique lorsqu'il existe plusieurs résultats possibles pour une activité. Il s'applique à :

*   Fishing
*   [La fabrication de fioles](/alchemy)
*   Breeding
*   Le butin des monstres

Les résultats sont classés du niveau requis le plus élevé au plus bas pour la pêche et la fabrication de fioles, de la chance de réussite de base la plus élevée à la plus basse pour l'élevage (breeding), et cela varie selon le monstre pour les butins. Le jeu vérifie d'abord si le premier résultat a réussi ; sinon, il vérifie le second, etc. Ainsi, si les chances de réussite de base pour les deux premiers résultats sont p1 et p2 respectivement, la probabilité réelle d'obtenir le deuxième résultat est p2 \* (1 - p1) (le premier doit d'abord échouer). De manière générale, la probabilité réelle d'obtenir le n-ième résultat est donnée par :

[![Reduced rate](https://static.wikia.nocookie.net/rpg-mo/images/7/71/Reduced_rate.png/revision/latest?cb=20141003074601)](https://static.wikia.nocookie.net/rpg-mo/images/7/71/Reduced_rate.png/revision/latest?cb=20141003074601)

Le taux réduit est appliqué _après_ les taux augmentés (par exemple, dus aux niveaux supplémentaires).

## Chance maximale

La plupart des activités ont une chance de réussite maximale inférieure à 100%. Voici quelques exceptions :

*   Cooking
*   Forging (barres)
*   Mining (minerais)
*   Woodcutting

La chance maximale est un plafond strict. Aucune augmentation de taux, quelle qu'elle soit, ne permet de dépasser la chance de réussite maximale.

Certaines activités ont une chance de base égale à la chance maximale (chance de réussite fixe) :

*   Forging (sauf barres)
*   Mining (gemmes)
*   Fishing du Raw Pearl Clam

## Autre

Le Breeding augmente aussi la chance de base de +1% pour chaque case d'herbe vide à l'intérieur de l'enclos d'élevage (les clôtures et les nids d'élevage ne comptent pas), à moins que la chance maximale ne soit atteinte.
