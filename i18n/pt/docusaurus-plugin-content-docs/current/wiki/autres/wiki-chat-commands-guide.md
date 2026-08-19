---
title: "Wiki Chat Commands Guide"
slug: /wiki-chat-commands-guide
---
> 🇧🇷 Versão em Português — <a href="/rpg-mo-wiki/wiki-chat-commands-guide">see the English page</a>

## Hiyocchi's lengthy guide to using wiki commands

To find out more about something, you can often do it on the wiki, by searching it with the /wiki command. Instead of slowly clicking through the various options on the wiki window, you can quickly fill in each box by typing /wiki \[box1\] \[box2\] etcetc in the chat box. This is especially useful when you often need to search up information.

Feel free to skip right to some actually [useful commands](/wiki-chat-commands-guide#hiyocchis-personal-favorite-commands).

### Specify what kind of information you need in the first blank.

Seven options: **item**, **mob**, **npc**, **craft**, **enchant**, **spell**, **pet**.

**item** - basic information about items, including pets, but not mobs.

**mob** - information about a mob, or information about mob drops.

**npc** - information about what npcs buy/sell.

**craft** - information about items the player can obtain personally, including crafted items and gathered items. (through wood cutting, mining, fishing)

**enchant** - information about enchantment rates and enchantment progressions.

**spell** - information about spells, medallions not included.

**pet** - information about pet stats, and pet evolution progressions.

### Next, go into detail.

First, a few things to note:

\>>>>If you simply type /wiki mob/npc/craft/enchant/spell/pet without specifying anything, or if the syntax is incorrect, the wiki will list all mobs/npcs/"craftable items"/enchantment progressions/spells/pets. If you attempt _/wiki item_, the wiki have the category selected but not display anything unless you hit the "go" button and load everything under that category.

\>>>>If you know the partial or full name of an item you are searching up, for **npc**, **mob**, and **craft**, use:

/wiki npc/mob/craft **item** \[name of item\]

And for **item**, **enchant**, **spell**, and **pet**, use:

/wiki item/enchant/spell/pet **name** \[name of item\]

\>>>>All \[name of items\] and the like cannot use abbreviations. For example, no _/wiki item name ench chaos blade_.

\>>>>The search searches for exactly what is typed, for example, _/wiki mob item weapon scroll_ will search for "weapon scroll" and not display any "weapon enchantment scrolls" of any tier; it is incorrect syntax. You could however search for "scroll" and get a list of all mobs that drop an item with "scroll" in the items name. Skill names have the added requirement of being given in full, and to clarify, woodcutting is woodcutting, not woodcut.

\>>>>\[skill name\] \[level\] \[lower bound\] \[upper bound\] is a syntax used very often. Skills refer to the various skills that a character can have, such as accuracy, strength, fishing, woodcutting, and mining. Level refers to the level of that particular skill, and not combat level/character level. This is important to note when dealing with combat skills.

\>>>>"range" is not an acceptable word to put anywhere in any function ever. It is a placeholder, and thus incorrect syntax when used in a _/wiki_ command.

**item**

/wiki item name \[partial or full name of item\] - as covered in the introduction.

_/wiki item type_ \[type\] allows you to specify what type of item you are searching for, such as "weapon", "chest", "magic", "cape" (wings), "food", etc.

_/wiki item skill_ \[skill name\] gives you a list of items associated to the various character skills. The associated skill of an item is the skill required to use that item.

Both _/wiki item type_ and _/wiki item skill_ then allows you to narrow down your search further, with "level", "price", "speed", and the 4 combat skills. (power, aim, armor, magic) If this is specified, fill in two numbers after that, the lower bound and upper bound, inclusive. An upper bound is not necessary. Examples:

_/wiki item skill accuracy level 40 60_ will give you a list of items that require level 40-60 accuracy. Clicking on the various attributes in the header will sort the results. _/wiki item skill accuracy level 50 50_ will also work to give you a list of weapons requiring accuracy level 50 to 50. (Tip: In general, to find a piece of equipment that is best for your skill level, do not search just your skill level, but a large range around your level, because some equipment require a higher skill level but has worse stats. And also, nothing requires 73 accuracy, but many weapons require 70 accuracy.)

_/wiki item type cape level 20 30_ will give you a list of back armor (generally wings) that require a skill level of 20 to 30. Wings sometimes require strength and sometimes defense, and you can click "skill" in the list header to sort the results by skill, or click other attributes to sort accordingly.

**mob**

/wiki mob name \[partial or full name of mob\] - as covered in the introduction.

_/wiki mob item_ \[partial or full name of droppable item\] will list mobs that drop the particular item. For example, _/wiki mob item low weapon_ will list mobs that drop low weapon enchantment scrolls.

_/wiki mob all_ can be used to list mobs based on a range of a particular attribute; acceptable attributes are "level", "health", "acc", "str", and "def". After specifying the attribute, specify a lower bound and upper bound. An upper bound is not required.

**npc**

_/wiki npc item_ \[partial or full name of item\] - lists npcs that buy or sell that item, as covered in the introduction.

_/wiki npc name_ \[partial or full name of npc\] - lists npcs with that partial name or full name.

**craft**

/wiki craft item \[partial or full name of reagent or product, or tool used\] - as covered in the introduction.

There are two ways to search up items that can be directly crafted or produced by the player, by skill and by source. Crafting includes fishing and mining, and other gathering of natural resources, but does not include enchanting; for enchanting, use _/wiki enchant item_ \[partial or full name of item\].

_/wiki craft skill_ \[skill name\] will give you list of items producible with that particular skill, which refers to the various character skills, such as woodcutting and carpentry.

_/wiki craft source_ \[source\] will give you a list of items producible at that particular source(aka crafting station); the list of sources are, "furnace", "anvil", "campfire", and "kettle". Once again, equipment enchantments will not show up under _/wiki craft source anvil._

Similar to /wiki **item**, _/wiki craft skill_ and _/wiki craft source_ will allow you to narrow down your search further, by allowing you to specify the **level** of the skill required, or the **exp** gained when the item is produced. If this is specified, enter in two numbers for the lower bound and upper bound for the level or exp after that, inclusive; an upper bound is not required. Examples:

_/wiki craft skill woodcutting level 30_ will give you a list of logs that you can chop once you reach level 30 and above. However, _/wiki craft skill fishing level 45 60_ will give you a list of fishes that requires level 45 to 60, but not lower or higher level fishes.

_/wiki craft skill mining exp 50_ will give you a list of ores that will give 50 exp each time you mine them. This is useful when you're trying to balance profitable training, where you want to make profits but want faster leveling.

_/wiki craft source kettle level 100_ will give you a list of delicious food that you can craft once you reach level 100 cooking. Ever wonder what seaweed is for?

**enchant**

/wiki enchant item \[partial or full name of enchantable/enchanted item\] - as covered in the introduction.

If an item cannot be enchanted, when it's name is searched up with _/wiki enchant_ \[item name\], the name of the item will not be listed.

**spell**

/wiki spell name \[partial or full name of spell\] - as covered in the introduction.

_/wiki spell name bolt_ will list all tier-1 spells, for example.

_/wiki spell_ will list all spells, and you can sort them by clicking on various attributes in the header, to compare spells.

**pet**

/wiki pet is currently bugged. Only _/wiki pet name_ \[partial or full name of pet\] will work to give you a list of pets with that partial name or full name, all other _/wiki pet_ commands will give you a full list of all the pets. Click on the various attributes in the header of the list to sort the pets in order to compare pets.

Examples: _/wiki pet name dragon_ will list all dragons.

## Hiyocchi's personal favorite commands

/wiki craft skill \[skillname\] level \[number\] \[number\] - lists things a skill of level x to level y can produce. An example: /wiki craft skill woodcutting level 1 10

/wiki craft item bronze - lists all craftable items that have "bronze" in their name, or require an item with "bronze" in their name to craft. _/wiki craft item fishing rod_ will list everything a fishing rod can produce.

/wiki mob item \[name of item\] - lists mobs that drop the specified item.

/wiki mob all level 100 300 - lists mobs that are level 100 to 300. We do not talk about _level 3000 to level 3987._

/wiki item skill accuracy level \[number\] \[number\] - lists swords that require accuracy level x to y. Click on headers to sort.

/wiki item skill defense level \[number\] \[number\] - lists armor that require defense level x to y. Click on headers to sort.

/wiki item name bronze - lists items that have "bronze" in their name. Useful to search up all bronze equipment.

/wiki pet - lists all pets. Click on headers to sort.
