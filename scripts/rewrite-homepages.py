#!/usr/bin/env python3
"""Réécrit toutes les main-page.md et sources.md dans toutes les locales."""
import os

ROOT = '/Users/guillaume.marcq/Projets/Perso/RPG_MO_WIKI'
MARKER_START = '{/* LIVE-GAME-DATA-START */}'
MARKER_END   = '{/* LIVE-GAME-DATA-END */}'

def extract_live_block(content):
    if MARKER_START not in content:
        return ''
    start = content.index(MARKER_START)
    end   = content.index(MARKER_END) + len(MARKER_END)
    return content[start:end]

def write_file(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)

def read_file(path):
    if not os.path.exists(path):
        return ''
    with open(path, encoding='utf-8') as f:
        return f.read()

# ─── MAIN PAGES ──────────────────────────────────────────────────────────────

MAIN_EN = """\
---
title: "Main Page"
slug: /
sidebar_position: 1
---
[![Rpgmo title](https://static.wikia.nocookie.net/rpg-mo/images/a/af/Rpgmo_title.PNG/revision/latest/scale-to-width-down/228?cb=20150525232005)](https://static.wikia.nocookie.net/rpg-mo/images/a/af/Rpgmo_title.PNG/revision/latest?cb=20150525232005)

[![Rpgmocharimg](https://static.wikia.nocookie.net/rpg-mo/images/a/a6/Rpgmocharimg.png/revision/latest/scale-to-width-down/180?cb=20150525232804)](https://static.wikia.nocookie.net/rpg-mo/images/a/a6/Rpgmocharimg.png/revision/latest?cb=20150525232804)

## About this Wiki

This wiki combines three complementary sources to bring together the most complete information on RPG MO:

- **[Live Game Data](/game-data)** — data extracted directly and automatically from the official game files at [data.mo.ee](https://data.mo.ee): every item, mob, pet, recipe and vendor with up-to-date stats and drop tables. This is the most accurate source for raw game data.
- **[RPG MO Wiki (Fandom)](https://rpg-mo.fandom.com/wiki/Main_Page)** — the community wiki, patiently built by volunteer editors. It provides skill guides, lore, event history, tips and in-depth articles that go far beyond raw data.
- **[modb / rpgmobob.com](https://modb.rpgmobob.com/#/)** — a community database by **bobdylan**, providing a structured view of items, mobs and recipes. The [Database](/database) section of this wiki is built on this source.

This repository is also indexed with [CodeGraph](https://github.com/colbymchenry/codegraph) to make its structure directly explorable by AI tools. If you want to contribute, report an error, or request the removal of content you authored, please open an issue on the [GitHub repository](https://github.com/marcqg/rpg-mo-wiki).

See [Sources & Credits](/sources) for full attribution.

## _Welcome to the RPG MO Wiki!_ **What is RPG MO?**

[RPG MO](https://data.mo.ee/loader.html) is a sandbox, 2D style game with 19 skills to train and new content being introduced in regular updates.

It can be played from almost any web browser that supports HTML 5, from a variety of game hosting websites like [Kongregate](https://www.kongregate.com/games/MarxGames/rpg-mo-sandbox), [itch.io](https://marxgames.itch.io/rpg) and [Steam](http://store.steampowered.com/app/372800/). It is available from the [Google Play Store](https://play.google.com/store/apps/details?id=ee.mo.rpgnew) for Android and from the [App Store](https://apps.apple.com/us/app/rpg-mo/id601177570) for iOS and MacOS, with standalone clients also available for download for [Windows, Mac, and Linux/Android](http://mo.ee/download.html).

\\* Secure game link: [https://data.mo.ee/index2.html](https://data.mo.ee/index2.html)

[Credits](https://mo.ee/credits.html)

## Getting Started

*   [New Player Guide](/new-player-guide)
*   [Maps of all zones](/locations)
*   [Guides](/database/guides)
*   [Keybindings](/keybinding)
*   [Chat Commands](/chat-commands)
*   [Official Forums](http://forums.mo.ee/)
*   [Official Site](http://mo.ee/)

## General System Requirements

*   Internet connection
*   Web Browser: latest Chrome/Firefox/Internet Explorer/Opera
*   Steam
*   CPU: 1GHz+ (recommended)
*   RAM: At least 256 MB (512 MB recommended)
*   Hard drive: 50 MB of free space (for cache)
*   Input: Mouse, keyboard, touch, game pad
"""

MAIN_FR = """\
---
title: "Accueil"
slug: /
sidebar_position: 1
---

> 🇫🇷 Traduction française — nom original (anglais) : **Main Page** — <a href="/rpg-mo-wiki/">voir la page en anglais</a>

[![Rpgmo title](https://static.wikia.nocookie.net/rpg-mo/images/a/af/Rpgmo_title.PNG/revision/latest/scale-to-width-down/228?cb=20150525232005)](https://static.wikia.nocookie.net/rpg-mo/images/a/af/Rpgmo_title.PNG/revision/latest?cb=20150525232005)

[![Rpgmocharimg](https://static.wikia.nocookie.net/rpg-mo/images/a/a6/Rpgmocharimg.png/revision/latest/scale-to-width-down/180?cb=20150525232804)](https://static.wikia.nocookie.net/rpg-mo/images/a/a6/Rpgmocharimg.png/revision/latest?cb=20150525232804)

## À propos de ce wiki

Ce wiki combine trois sources complémentaires pour rassembler les informations les plus complètes sur RPG MO :

- **[Données du Jeu en direct](/game-data)** — données extraites directement et automatiquement depuis les fichiers officiels du jeu sur [data.mo.ee](https://data.mo.ee) : chaque objet, monstre, familier, recette et marchand avec leurs statistiques et tables de drops à jour. C'est la source la plus précise pour les données brutes du jeu.
- **[RPG MO Wiki (Fandom)](https://rpg-mo.fandom.com/wiki/Main_Page)** — le wiki communautaire, patiemment construit par des éditeurs bénévoles. Il fournit des guides de compétences, de l'histoire, des événements, des astuces et des articles détaillés.
- **[modb / rpgmobob.com](https://modb.rpgmobob.com/#/)** — une base de données communautaire par **bobdylan**, offrant une vue structurée des objets, monstres et recettes. La section [Database](/database) de ce wiki est construite sur cette source.

Ce dépôt est également indexé avec [CodeGraph](https://github.com/colbymchenry/codegraph) pour rendre sa structure directement explorable par des outils d'IA. Si tu veux contribuer, signaler une erreur ou demander le retrait d'un contenu, ouvre une issue sur le [dépôt GitHub](https://github.com/marcqg/rpg-mo-wiki).

Voir [Sources et remerciements](/sources) pour l'attribution complète.

## _Bienvenue sur le RPG MO Wiki !_ **Qu'est-ce que RPG MO ?**

[RPG MO](https://data.mo.ee/loader.html) est un bac à sable (sandbox) en 2D avec 19 compétences à entraîner, et du nouveau contenu ajouté régulièrement.

Le jeu se joue depuis quasiment n'importe quel navigateur compatible HTML5, via [Kongregate](https://www.kongregate.com/games/MarxGames/rpg-mo-sandbox), [itch.io](https://marxgames.itch.io/rpg) et [Steam](http://store.steampowered.com/app/372800/). Disponible sur le [Google Play Store](https://play.google.com/store/apps/details?id=ee.mo.rpgnew) pour Android et sur l'[App Store](https://apps.apple.com/us/app/rpg-mo/id601177570) pour iOS et MacOS.

\\* Lien sécurisé vers le jeu : [https://data.mo.ee/index2.html](https://data.mo.ee/index2.html)

[Crédits](https://mo.ee/credits.html)

## Pour commencer

*   [Guide du nouveau joueur](/new-player-guide)
*   [Cartes de toutes les zones](/locations)
*   [Guides](/database/guides)
*   [Raccourcis clavier](/keybinding)
*   [Commandes du chat](/chat-commands)
*   [Forums officiels](http://forums.mo.ee/)
*   [Site officiel](http://mo.ee/)

## Configuration système générale

*   Connexion Internet
*   Navigateur web : dernière version de Chrome/Firefox/Internet Explorer/Opera
*   Steam
*   CPU : 1GHz+ (recommandé)
*   RAM : au moins 256 Mo (512 Mo recommandé)
*   Disque dur : 50 Mo d'espace libre (pour le cache)
*   Entrée : souris, clavier, tactile, manette
"""

MAIN_KO = """\
---
title: "메인 페이지"
slug: /
sidebar_position: 1
---
> 🇰🇷 한국어 버전 — 영어 원본 제목: **Main Page** — <a href="/rpg-mo-wiki/">see the English page</a>

## 이 위키에 대하여

이 위키는 RPG MO에 대한 가장 완전한 정보를 모으기 위해 세 가지 보완적인 소스를 결합합니다:

- **[라이브 게임 데이터](/game-data)** — [data.mo.ee](https://data.mo.ee)의 공식 게임 파일에서 직접 자동으로 추출한 데이터: 모든 아이템, 몬스터, 펫, 레시피 및 상인의 최신 스탯과 드롭 테이블. 원시 게임 데이터에 가장 정확한 소스입니다.
- **[RPG MO Wiki (Fandom)](https://rpg-mo.fandom.com/wiki/Main_Page)** — 자원봉사자들이 구축한 커뮤니티 위키. 스킬 가이드, 이벤트 역사, 팁 등 다양한 정보를 제공합니다.
- **[modb / rpgmobob.com](https://modb.rpgmobob.com/#/)** — **bobdylan**이 만든 커뮤니티 데이터베이스. 이 위키의 [Database](/database) 섹션이 이 소스를 기반으로 합니다.

기여, 오류 신고 또는 콘텐츠 제거 요청은 [GitHub 저장소](https://github.com/marcqg/rpg-mo-wiki)에서 issue를 열어주세요.

## _RPG MO 위키에 오신걸 환영합니다!_ **RPG MO 란?**

[RPG MO](https://data.mo.ee/loader.html)는 19가지의 스킬을 훈련시키는 샌드박스, 2D 스타일의 게임입니다.

게임 소스 링크: [https://data.mo.ee/index2.html](https://data.mo.ee/index2.html)

## 게임 안내

*   [입문서](/new-player-guide)
*   [지도로 보기](/locations)
*   [가이드](/database/guides)
*   [키열맞춤](/keybinding)
*   [채팅 명령어](/chat-commands)
*   [공식 포럼 사이트](http://forums.mo.ee/)
*   [공식 사이트](http://mo.ee/)

## 게임 기본 사양

*   인터넷 연결 필수
*   웹 브라우저: 최신 업데이트된 크롬/파이어폭스/인터넷 익스플로러/오페라
*   CPU: 1GHz+ (권장)
*   RAM: At least 256 MB (512 MB 권장)
*   Hard drive: 50 MB of free space (캐시 파일 용)
*   Input: 마우스, 키보드, 터치, 게임 패드
"""

MAIN_PL = """\
---
title: "Strona Główna"
slug: /
sidebar_position: 1
---
> 🇵🇱 Wersja polska — oryginalny tytuł (angielski): **Main Page** — <a href="/rpg-mo-wiki/">see the English page</a>

## O tym wiki

To wiki łączy trzy uzupełniające się źródła, aby zebrać najpełniejsze informacje o RPG MO:

- **[Dane z Gry na Żywo](/game-data)** — dane wyodrębnione bezpośrednio z oficjalnych plików gry na [data.mo.ee](https://data.mo.ee): każdy przedmiot, potwora, zwierzaka, recepturę i kupca z aktualnymi statystykami i tabelami dropów. Najdokładniejsze źródło surowych danych.
- **[RPG MO Wiki (Fandom)](https://rpg-mo.fandom.com/wiki/Main_Page)** — wiki społecznościowe zbudowane przez wolontariuszy. Zawiera poradniki, historię wydarzeń i szczegółowe artykuły.
- **[modb / rpgmobob.com](https://modb.rpgmobob.com/#/)** — baza danych społecznościowa autorstwa **bobdylan**. Sekcja [Database](/database) tego wiki jest oparta na tym źródle.

Aby wnieść wkład lub zgłosić błąd, otwórz issue w [repozytorium GitHub](https://github.com/marcqg/rpg-mo-wiki).

Zob. [Źródła i podziękowania](/sources) w celu pełnego uznania.

## _Witajcie na RPG MO Wiki!_ **Co to jest RPG MO?**

RPG MO to gra sandboxowa w stylu 2D z 19 umiejętnościami do wytrenowania i ciągłymi aktualizacjami.

Link do gry: [https://data.mo.ee/index2.html](https://data.mo.ee/index2.html)

## Zaczynamy

*   [Poradnik dla nowego gracza](/new-player-guide)
*   [Lokacje](/locations)
*   [Poradniki](/database/guides)
*   [Skróty klawiszowe](/keybinding)
*   [Komendy czatu](/chat-commands)
*   [Oficjalne Forum](https://forums.mo.ee/)
*   [Oficjalna Strona](https://mo.ee/)

## Wymagania Systemowe

*   Połączenie z internetem
*   Przeglądarka Internetowa: Najnowszy Chrome/Firefox/Internet Explorer/Opera
*   CPU: 1GHz+ (rekomendowane)
*   RAM: Minimum 256 MB (512 MB rekomendowane)
*   Dysk Twardy: 50 MB wolnej przestrzeni (na cache)
*   Wejścia: Mysz, Klawiatura, Dotyk, Pad do gry
"""

MAIN_PT = """\
---
title: "Página Inicial"
slug: /
sidebar_position: 1
---
> 🇧🇷 Versão em Português — título original (inglês): **Main Page** — <a href="/rpg-mo-wiki/">see the English page</a>

## Sobre este wiki

Este wiki combina três fontes complementares para reunir as informações mais completas sobre RPG MO:

- **[Dados do Jogo em Tempo Real](/game-data)** — dados extraídos diretamente dos arquivos oficiais do jogo em [data.mo.ee](https://data.mo.ee): cada item, monstro, pet, receita e comerciante com estatísticas atualizadas e tabelas de drops. A fonte mais precisa para dados brutos do jogo.
- **[RPG MO Wiki (Fandom)](https://rpg-mo.fandom.com/wiki/Main_Page)** — wiki comunitária construída por voluntários. Fornece guias de habilidades, histórico de eventos e artigos detalhados.
- **[modb / rpgmobob.com](https://modb.rpgmobob.com/#/)** — banco de dados comunitário por **bobdylan**. A seção [Database](/database) deste wiki é baseada nesta fonte.

Para contribuir ou reportar erros, abra uma issue no [repositório GitHub](https://github.com/marcqg/rpg-mo-wiki).

Veja [Fontes e Créditos](/sources) para atribuição completa.

## [RPG MO](https://data.mo.ee/loader.html) é um jogo sandbox 2D com 19 habilidades para desenvolver e atualizações regulares.

Link do jogo: [https://data.mo.ee/index2.html](https://data.mo.ee/index2.html)

## Começando

*   [Guia de novos jogadores](/new-player-guide)
*   [Localizações](/locations)
*   [Guias](/database/guides)
*   [Atalhos de teclado](/keybinding)
*   [Comandos de Chat](/chat-commands)
*   [Forum Oficial](http://forums.mo.ee/)
*   [Site Oficial](http://mo.ee/)

## Requisitos Gerais de Sistema

*   Conexão à Internet
*   Navegadores: Ultimas versões Chrome/Firefox/Internet Explorer/Opera
*   CPU: 1GHz+ (recomendado)
*   RAM: Pelo menos 256 MB (512 MB recomendado)
*   Disco Rígido: 50 MB de espaço livre (para o cache)
*   Entradas: Mouse, Teclado, Touch, Game pad
"""

# ─── SOURCES PAGES ───────────────────────────────────────────────────────────

SOURCES_EN = """\
---
title: "Sources & Credits"
slug: /sources
sidebar_position: 5
---

This wiki is not an original work: it's a compilation, a reformatting, and a translation of the work of people who patiently documented RPG MO long before us, often as volunteers over many years. This site is not affiliated with any of the sources below, nor with the developers of RPG MO. A huge thank you to all of them.

## How this wiki is built

This wiki brings together **three complementary sources**:

| Source | What it provides | Where it appears |
| --- | --- | --- |
| **Game files** ([data.mo.ee](https://data.mo.ee)) | Items, mobs, pets, recipes, vendors — extracted directly from the official game engine | [Live Game Data](/game-data) |
| **modb** ([modb.rpgmobob.com](https://modb.rpgmobob.com/#/)) | Structured community database by **bobdylan** | [Database](/database) |
| **RPG MO Wiki (Fandom)** ([rpg-mo.fandom.com](https://rpg-mo.fandom.com/wiki/Main_Page)) | Skill guides, lore, events, tips — built by volunteer editors | [Wiki](/wiki) |

## RPG MO Wiki (Fandom)

[rpg-mo.fandom.com](https://rpg-mo.fandom.com/wiki/Main_Page)

The text content of this wiki (skill guides, mobs, items, NPCs, etc.) is translated and adapted from the **RPG MO Wiki** hosted on Fandom, under a **CC BY-SA** license. It's the work of countless volunteer editors who, page after page, documented this game in depth — a remarkable collective effort, without which this site simply wouldn't exist.

## modb

[modb.rpgmobob.com](https://modb.rpgmobob.com/#/) — by **bobdylan**

The [Database](/database) section of this wiki (items, mobs, recipes, vendors, pets) is built on data from **modb**, a community database built and maintained by bobdylan. It's a tool of impressive thoroughness and reliability, kept up to date as the game evolves.

## Official Game Data (data.mo.ee)

[data.mo.ee](https://data.mo.ee) — by the **RPG MO developers**

The [Live Game Data](/game-data) section is generated automatically from the official game files (`release.js`, `mod.js`) published by the game developers at data.mo.ee. This includes the complete list of items, mobs, pets with breeding data, crafting recipes and vendors — always in sync with the latest game version.

## rpgmobob.com

[www.rpgmobob.com](https://www.rpgmobob.com/) — by **bobdylan**

The Farming, Fungiculture, Fishing Spots, World Map and Combat Level guides come from bobdylan's personal tools on rpgmobob.com, whose source code is generously shared publicly.

## Mining Routes

[zybuluo.com/sulphate](https://www.zybuluo.com/sulphate/note/1241013) — by **sulphate**

The mining routes guide is a summary of sulphate's work, who hand-mapped the optimal paths for each type of ore.

## Useful Links

The [Useful Links](/liens-utiles) page also catalogs many other community resources (calculators, maps, guides) made by different members of the RPG MO community — each entry credits its author.

---

If you're the author of one of these resources and would like an attribution correction, or the removal of your content, feel free to open an issue on this wiki's [GitHub repository](https://github.com/marcqg/rpg-mo-wiki).
"""

SOURCES_FR = """\
---
title: "Sources & Remerciements"
slug: /sources
sidebar_position: 5
---

> 🇫🇷 Traduction française — nom original (anglais) : **Sources & Credits**

Ce wiki n'est pas un travail original : c'est une compilation, un reformatage et une traduction du travail de personnes qui ont patiemment documenté RPG MO. Un immense merci à tous.

## Comment ce wiki est construit

| Source | Ce qu'elle apporte | Où on la retrouve |
| --- | --- | --- |
| **Fichiers du jeu** ([data.mo.ee](https://data.mo.ee)) | Objets, monstres, familiers, recettes, marchands | [Données du Jeu en direct](/game-data) |
| **modb** ([modb.rpgmobob.com](https://modb.rpgmobob.com/#/)) | Base de données par **bobdylan** | [Database](/database) |
| **RPG MO Wiki (Fandom)** ([rpg-mo.fandom.com](https://rpg-mo.fandom.com/wiki/Main_Page)) | Guides, lore, événements | [Wiki](/wiki) |

Le contenu textuel est traduit du **RPG MO Wiki** Fandom (**CC BY-SA**). La section [Données du Jeu en direct](/game-data) est générée automatiquement depuis les fichiers officiels du jeu sur data.mo.ee. La section [Database](/database) est construite sur les données de **modb** par bobdylan.

Les guides de Farming, Carte du Monde, etc. proviennent de [rpgmobob.com](https://www.rpgmobob.com/) et les routes de minage de [zybuluo.com/sulphate](https://www.zybuluo.com/sulphate/note/1241013).

---

Si vous êtes l'auteur de l'une de ces ressources, ouvrez une issue sur le [dépôt GitHub](https://github.com/marcqg/rpg-mo-wiki).
"""

SOURCES_KO = """\
---
title: "출처 및 크레딧"
slug: /sources
sidebar_position: 5
---

> 🇰🇷 한국어 버전 — 영어 원본 제목: **Sources & Credits**

## 이 위키의 구성

| 소스 | 제공 내용 | 위치 |
| --- | --- | --- |
| **게임 파일** ([data.mo.ee](https://data.mo.ee)) | 아이템, 몬스터, 펫, 레시피, 상인 | [라이브 게임 데이터](/game-data) |
| **modb** ([modb.rpgmobob.com](https://modb.rpgmobob.com/#/)) | **bobdylan**의 데이터베이스 | [Database](/database) |
| **RPG MO Wiki (Fandom)** ([rpg-mo.fandom.com](https://rpg-mo.fandom.com/wiki/Main_Page)) | 스킬 가이드, 이벤트, 팁 | [Wiki](/wiki) |

텍스트 콘텐츠는 Fandom의 **RPG MO Wiki** (**CC BY-SA**)에서 번역. [라이브 게임 데이터](/game-data)는 data.mo.ee에서 자동 생성.

---

출처 수정 요청은 [GitHub 저장소](https://github.com/marcqg/rpg-mo-wiki)에서 issue를 열어주세요.
"""

SOURCES_PL = """\
---
title: "Źródła i Podziękowania"
slug: /sources
sidebar_position: 5
---

> 🇵🇱 Wersja polska — oryginalny tytuł (angielski): **Sources & Credits**

## Jak zbudowane jest to wiki

| Źródło | Co zapewnia | Gdzie się pojawia |
| --- | --- | --- |
| **Pliki gry** ([data.mo.ee](https://data.mo.ee)) | Przedmioty, potwory, zwierzaki, receptury, kupcy | [Dane z Gry na Żywo](/game-data) |
| **modb** ([modb.rpgmobob.com](https://modb.rpgmobob.com/#/)) | Baza danych autorstwa **bobdylan** | [Database](/database) |
| **RPG MO Wiki (Fandom)** ([rpg-mo.fandom.com](https://rpg-mo.fandom.com/wiki/Main_Page)) | Poradniki, historia, wskazówki | [Wiki](/wiki) |

Treść tekstowa tłumaczona z Fandom (**CC BY-SA**). Sekcja [Dane z Gry](/game-data) generowana z plików data.mo.ee.

---

Aby poprawić atrybucję, otwórz issue w [repozytorium GitHub](https://github.com/marcqg/rpg-mo-wiki).
"""

SOURCES_PT = """\
---
title: "Fontes e Créditos"
slug: /sources
sidebar_position: 5
---

> 🇧🇷 Versão em Português — título original (inglês): **Sources & Credits**

## Como este wiki é construído

| Fonte | O que fornece | Onde aparece |
| --- | --- | --- |
| **Arquivos do jogo** ([data.mo.ee](https://data.mo.ee)) | Itens, monstros, pets, receitas, comerciantes | [Dados do Jogo em Tempo Real](/game-data) |
| **modb** ([modb.rpgmobob.com](https://modb.rpgmobob.com/#/)) | Banco de dados por **bobdylan** | [Database](/database) |
| **RPG MO Wiki (Fandom)** ([rpg-mo.fandom.com](https://rpg-mo.fandom.com/wiki/Main_Page)) | Guias, eventos, dicas | [Wiki](/wiki) |

Conteúdo textual traduzido do Fandom (**CC BY-SA**). Seção [Dados do Jogo](/game-data) gerada de data.mo.ee.

---

Para correção de atribuição, abra uma issue no [repositório GitHub](https://github.com/marcqg/rpg-mo-wiki).
"""

# ─── Écriture ────────────────────────────────────────────────────────────────

HOMEPAGES = [
    ('docs/main-page.md', MAIN_EN),
    ('i18n/fr/docusaurus-plugin-content-docs/current/main-page.md', MAIN_FR),
    ('i18n/ko/docusaurus-plugin-content-docs/current/main-page.md', MAIN_KO),
    ('i18n/pl/docusaurus-plugin-content-docs/current/main-page.md', MAIN_PL),
    ('i18n/pt/docusaurus-plugin-content-docs/current/main-page.md', MAIN_PT),
]

SOURCES_PAGES = [
    ('docs/sources.md', SOURCES_EN),
    ('i18n/fr/docusaurus-plugin-content-docs/current/sources.md', SOURCES_FR),
    ('i18n/ko/docusaurus-plugin-content-docs/current/sources.md', SOURCES_KO),
    ('i18n/pl/docusaurus-plugin-content-docs/current/sources.md', SOURCES_PL),
    ('i18n/pt/docusaurus-plugin-content-docs/current/sources.md', SOURCES_PT),
]

if __name__ == '__main__':
    for rel, new_content in HOMEPAGES:
        fpath = os.path.join(ROOT, rel)
        old = read_file(fpath)
        live_block = extract_live_block(old)
        final = new_content.rstrip()
        if live_block:
            final += '\n\n' + live_block + '\n'
        else:
            final += '\n'
        write_file(fpath, final)
        print(f'  ✅ {rel}')

    for rel, content in SOURCES_PAGES:
        fpath = os.path.join(ROOT, rel)
        write_file(fpath, content)
        print(f'  ✅ {rel}')

    print('\nDone.')

