---
title: "Movement speed"
slug: /movement-speed
---
The movement speed is Influenced by:

*   boots.
*   capes.
*   archery gear.
*   pets.

Most of these items have a positive modifier, but some _(e.g. piglet)_ have a negative modifier.

High speed is very helpful when gathering resources but can lead to more accidental attacks by monsters.

*   The Base speed is 0.
*   The Max speed is 60.

_(higher values are possible but are capped to 60)_

## Formula

The formula deduced from the source code is:

*   `= 300ms - &lt;speed> * 3ms`
*   `= 3ms * (100 - &lt;speed>)`

Therefore the speed is the relative reduction (in %) of the movement time.

Examples:

|  | speed | reduction | movement time in ms |
| --- | --- | --- | --- |
|  | \-20 | \-20% | 360 |
|  | \-10 | \-10% | 330 |
| default | 0 | 0% | 300 |
|  | 20 | 20% | 240 |
|  | 40 | 40% | 180 |
|  | 50 | 50% | 150 |
| maximum | 60 | 60% | 120 |

_60 speed is three times as fast as -20 speed!_
