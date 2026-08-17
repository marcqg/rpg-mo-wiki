---
title: "Movement speed"
slug: /movement-speed
---

> 🇫🇷 Traduction française — nom original (anglais) : **Movement speed** — <a href="/rpg-mo-wiki/movement-speed">voir la page en anglais</a>

La vitesse de déplacement (movement speed) est influencée par :

*   les bottes.
*   les capes.
*   l'équipement d'archerie.
*   les pets.

La plupart de ces objets ont un modificateur positif, mais certains _(par exemple le piglet)_ ont un modificateur négatif.

Une vitesse élevée est très utile pour récolter des ressources, mais peut entraîner davantage d'attaques accidentelles de la part des monstres.

*   La vitesse de base est de 0.
*   La vitesse maximale est de 60.

_(des valeurs plus élevées sont possibles mais sont plafonnées à 60)_

## Formule

La formule déduite du code source est :

*   `= 300ms - <vitesse> * 3ms`
*   `= 3ms * (100 - <vitesse>)`

La vitesse correspond donc à la réduction relative (en %) du temps de déplacement.

Exemples :

|  | vitesse | réduction | temps de déplacement en ms |
| --- | --- | --- | --- |
|  | \-20 | \-20% | 360 |
|  | \-10 | \-10% | 330 |
| par défaut | 0 | 0% | 300 |
|  | 20 | 20% | 240 |
|  | 40 | 40% | 180 |
|  | 50 | 50% | 150 |
| maximum | 60 | 60% | 120 |

_Une vitesse de 60 est trois fois plus rapide qu'une vitesse de -20 !_
