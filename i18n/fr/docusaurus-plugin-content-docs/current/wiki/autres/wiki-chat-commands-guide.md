---
title: "Wiki Chat Commands Guide"
slug: /wiki-chat-commands-guide
---

> 🇫🇷 Traduction française — nom original (anglais) : **Wiki Chat Commands Guide** — <a href="/rpg-mo-wiki/wiki-chat-commands-guide">voir la page en anglais</a>

## Le long guide de Hiyocchi pour utiliser les commandes du wiki

Pour en savoir plus sur quelque chose, vous pouvez souvent le faire depuis le jeu, en le recherchant avec la commande /wiki. Plutôt que de cliquer lentement à travers les différentes options de la fenêtre du wiki, vous pouvez rapidement remplir chaque champ en tapant /wiki \[champ1\] \[champ2\] etc. dans la fenêtre de chat. C'est particulièrement utile lorsque vous avez souvent besoin de rechercher des informations.

N'hésitez pas à passer directement à quelques [commandes vraiment utiles](/wiki-chat-commands-guide#hiyocchis-personal-favorite-commands).

### Précisez d'abord quel type d'information vous recherchez.

Sept options : **item**, **mob**, **npc**, **craft**, **enchant**, **spell**, **pet**.

**item** - informations de base sur les objets, y compris les familiers, mais pas les monstres.

**mob** - informations sur un monstre, ou informations sur ses butins.

**npc** - informations sur ce que les PNJ achètent/vendent.

**craft** - informations sur les objets que le joueur peut obtenir personnellement, y compris les objets fabriqués et récoltés (via le bûcheronnage, le minage, la pêche).

**enchant** - informations sur les taux d'enchantement et les progressions d'enchantement.

**spell** - informations sur les sorts, les médaillons ne sont pas inclus.

**pet** - informations sur les statistiques des familiers, et les progressions d'évolution des familiers.

### Ensuite, entrez dans les détails.

D'abord, quelques précisions :

\>>>>Si vous tapez simplement /wiki mob/npc/craft/enchant/spell/pet sans rien préciser, ou si la syntaxe est incorrecte, le wiki listera tous les monstres/PNJ/« objets fabricables »/progressions d'enchantement/sorts/familiers. Si vous tapez _/wiki item_, le wiki sélectionnera la catégorie mais n'affichera rien à moins de cliquer sur le bouton « go » et de charger tout ce qui se trouve sous cette catégorie.

\>>>>Si vous connaissez le nom partiel ou complet d'un objet que vous recherchez, pour **npc**, **mob**, et **craft**, utilisez :

/wiki npc/mob/craft **item** \[nom de l'objet\]

Et pour **item**, **enchant**, **spell**, et **pet**, utilisez :

/wiki item/enchant/spell/pet **name** \[nom de l'objet\]

\>>>>Tous les \[noms d'objets\] et similaires ne peuvent pas utiliser d'abréviations. Par exemple, pas de _/wiki item name ench chaos blade_.

\>>>>La recherche cherche exactement ce qui est tapé, par exemple, _/wiki mob item weapon scroll_ recherchera « weapon scroll » et n'affichera aucun « weapon enchantment scroll » d'aucun niveau ; c'est une syntaxe incorrecte. Vous pourriez cependant rechercher « scroll » et obtenir une liste de tous les monstres qui laissent tomber un objet avec « scroll » dans le nom. Les noms de compétences ont l'exigence supplémentaire d'être donnés en entier, et pour clarifier, woodcutting c'est woodcutting, pas woodcut.

\>>>>\[nom de compétence\] \[niveau\] \[borne inférieure\] \[borne supérieure\] est une syntaxe très souvent utilisée. Les compétences font référence aux diverses compétences qu'un personnage peut avoir, comme accuracy, strength, fishing, woodcutting, et mining. Level fait référence au niveau de cette compétence particulière, et non au niveau de combat/niveau du personnage. C'est important à noter lorsqu'il s'agit de compétences de combat.

\>>>>« range » n'est pas un mot acceptable à mettre où que ce soit dans aucune fonction, jamais. C'est un espace réservé, et donc une syntaxe incorrecte lorsqu'utilisé dans une commande _/wiki_.

**item**

/wiki item name \[nom partiel ou complet de l'objet\] - comme indiqué dans l'introduction.

_/wiki item type_ \[type\] vous permet de préciser quel type d'objet vous recherchez, comme « weapon », « chest », « magic », « cape » (wings), « food », etc.

_/wiki item skill_ \[nom de compétence\] vous donne une liste d'objets associés aux différentes compétences du personnage. La compétence associée à un objet est la compétence requise pour utiliser cet objet.

Tant _/wiki item type_ que _/wiki item skill_ vous permettent ensuite d'affiner davantage votre recherche, avec « level », « price », « speed », et les 4 compétences de combat (power, aim, armor, magic). Si cela est précisé, entrez deux nombres après, la borne inférieure et la borne supérieure, incluses. Une borne supérieure n'est pas nécessaire. Exemples :

_/wiki item skill accuracy level 40 60_ vous donnera une liste d'objets nécessitant un niveau 40-60 en accuracy. Cliquer sur les différents attributs dans l'en-tête triera les résultats. _/wiki item skill accuracy level 50 50_ fonctionnera aussi pour donner une liste d'armes nécessitant un niveau 50 en accuracy. (Astuce : en général, pour trouver une pièce d'équipement optimale pour votre niveau de compétence, ne recherchez pas seulement votre niveau exact, mais une large fourchette autour de votre niveau, car certains équipements nécessitent un niveau plus élevé mais ont de moins bonnes statistiques. Et aussi, rien ne nécessite 73 en accuracy, mais beaucoup d'armes nécessitent 70 en accuracy.)

_/wiki item type cape level 20 30_ vous donnera une liste d'armures dorsales (généralement des wings) nécessitant un niveau de compétence de 20 à 30. Les wings nécessitent parfois strength et parfois defense, et vous pouvez cliquer sur « skill » dans l'en-tête de la liste pour trier les résultats par compétence, ou cliquer sur d'autres attributs pour trier en conséquence.

**mob**

/wiki mob name \[nom partiel ou complet du monstre\] - comme indiqué dans l'introduction.

_/wiki mob item_ \[nom partiel ou complet de l'objet à obtenir\] listera les monstres qui laissent tomber cet objet particulier. Par exemple, _/wiki mob item low weapon_ listera les monstres qui laissent tomber des parchemins d'enchantement d'arme de bas niveau.

_/wiki mob all_ peut être utilisé pour lister les monstres selon une plage d'un attribut particulier ; les attributs acceptés sont « level », « health », « acc », « str », et « def ». Après avoir précisé l'attribut, indiquez une borne inférieure et une borne supérieure. Une borne supérieure n'est pas requise.

**npc**

_/wiki npc item_ \[nom partiel ou complet de l'objet\] - liste les PNJ qui achètent ou vendent cet objet, comme indiqué dans l'introduction.

_/wiki npc name_ \[nom partiel ou complet du PNJ\] - liste les PNJ avec ce nom partiel ou complet.

**craft**

/wiki craft item \[nom partiel ou complet du réactif, du produit, ou de l'outil utilisé\] - comme indiqué dans l'introduction.

Il existe deux façons de rechercher les objets directement fabricables ou produits par le joueur, par compétence et par source. Le craft inclut la pêche et le minage, ainsi que d'autres récoltes de ressources naturelles, mais n'inclut pas l'enchantement ; pour l'enchantement, utilisez _/wiki enchant item_ \[nom partiel ou complet de l'objet\].

_/wiki craft skill_ \[nom de compétence\] vous donnera une liste d'objets producibles avec cette compétence particulière, qui fait référence aux diverses compétences du personnage, comme woodcutting et carpentry.

_/wiki craft source_ \[source\] vous donnera une liste d'objets producibles à cette source particulière (aka station de fabrication) ; la liste des sources est « furnace », « anvil », « campfire », et « kettle ». Encore une fois, les enchantements d'équipement n'apparaîtront pas sous _/wiki craft source anvil._

Comme pour /wiki **item**, _/wiki craft skill_ et _/wiki craft source_ vous permettront d'affiner davantage votre recherche, en précisant le **level** de compétence requis, ou l'**exp** gagnée quand l'objet est produit. Si cela est précisé, entrez deux nombres pour la borne inférieure et la borne supérieure pour le level ou l'exp après, incluses ; une borne supérieure n'est pas requise. Exemples :

_/wiki craft skill woodcutting level 30_ vous donnera une liste de bûches que vous pouvez couper une fois le niveau 30 atteint et au-delà. Cependant, _/wiki craft skill fishing level 45 60_ vous donnera une liste de poissons nécessitant un niveau de 45 à 60, mais pas de niveau inférieur ou supérieur.

_/wiki craft skill mining exp 50_ vous donnera une liste de minerais qui donnent 50 exp à chaque fois que vous les minez. C'est utile lorsque vous essayez d'équilibrer un entraînement rentable, où vous voulez faire des profits tout en montant de niveau plus rapidement.

_/wiki craft source kettle level 100_ vous donnera une liste de délicieux plats que vous pouvez fabriquer une fois le niveau 100 en cooking atteint. Vous vous êtes déjà demandé à quoi sert le seaweed ?

**enchant**

/wiki enchant item \[nom partiel ou complet de l'objet enchantable/enchanté\] - comme indiqué dans l'introduction.

Si un objet ne peut pas être enchanté, quand son nom est recherché avec _/wiki enchant_ \[nom de l'objet\], le nom de l'objet ne sera pas listé.

**spell**

/wiki spell name \[nom partiel ou complet du sort\] - comme indiqué dans l'introduction.

_/wiki spell name bolt_ listera tous les sorts de tier 1, par exemple.

_/wiki spell_ listera tous les sorts, et vous pouvez les trier en cliquant sur divers attributs dans l'en-tête, pour comparer les sorts.

**pet**

/wiki pet est actuellement buggé. Seul _/wiki pet name_ \[nom partiel ou complet du familier\] fonctionnera pour donner une liste de familiers avec ce nom partiel ou complet, toutes les autres commandes _/wiki pet_ donneront une liste complète de tous les familiers. Cliquez sur les différents attributs dans l'en-tête de la liste pour trier les familiers afin de les comparer.

Exemples : _/wiki pet name dragon_ listera tous les dragons.

## Les commandes préférées de Hiyocchi

/wiki craft skill \[nom de compétence\] level \[nombre\] \[nombre\] - liste les choses qu'une compétence de niveau x à niveau y peut produire. Un exemple : /wiki craft skill woodcutting level 1 10

/wiki craft item bronze - liste tous les objets fabricables ayant « bronze » dans leur nom, ou nécessitant un objet avec « bronze » dans son nom pour être fabriqué. _/wiki craft item fishing rod_ listera tout ce qu'une canne à pêche peut produire.

/wiki mob item \[nom de l'objet\] - liste les monstres qui laissent tomber l'objet spécifié.

/wiki mob all level 100 300 - liste les monstres de niveau 100 à 300. On ne parle pas de _level 3000 à level 3987._

/wiki item skill accuracy level \[nombre\] \[nombre\] - liste les épées nécessitant un niveau d'accuracy de x à y. Cliquez sur les en-têtes pour trier.

/wiki item skill defense level \[nombre\] \[nombre\] - liste les armures nécessitant un niveau de defense de x à y. Cliquez sur les en-têtes pour trier.

/wiki item name bronze - liste les objets ayant « bronze » dans leur nom. Utile pour rechercher tout l'équipement en bronze.

/wiki pet - liste tous les familiers. Cliquez sur les en-têtes pour trier.
