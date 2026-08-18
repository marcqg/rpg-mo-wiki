---
title: "Timer"
slug: /timer
---
> 🇧🇷 Versão em Português — <a href="/rpg-mo-wiki/timer">see the English page</a>

Using the /timer command can help you keep track of timed events such as plant grow times, skill quest timer, monster island timer etc. Due to some behind the scenes irregularities, using /timer has some odd requierments.

## Countdown

Useful for plant growth, monster island and skill quest. The protocol is as follows:

/timer 1234567monster set 1h 50m 30s

The numbers '1234567' are spacers so the actual timer name will be (monster). 'Set' is for countdown timers. 'h', 'm' and 's' are for hours, minutes and seconds. Using only 'm' is sufficient for a more than one hour timer.

## Elapsed Count-up

Useful for 'how long have I been doing this action' such as getting a specific loot from a mob.

/timer 1234567good loot start

The numbers '1234567' are spacers so the actual timer name will be (good loot). Type /timer to see elapsed time.

## Clear

/timer clear should clear all timers but only seems to clear (default) timers i.e. unnamed timers. To clear a named timer do /timer 1234567monster clear OR /timer 1234567good loot clear to clear the above named timers.
