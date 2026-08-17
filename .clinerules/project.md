# RPG MO Wiki — Règles projet pour Cline

## Build obligatoire avant push

**Toujours vérifier que le build Docusaurus passe avant de committer/pousser des modifications.**

```bash
# Vérification rapide (locale EN uniquement, ~30s)
/opt/homebrew/bin/node node_modules/.bin/docusaurus build --locale en

# Vérification complète (toutes les locales, ~3min)
/opt/homebrew/bin/node node_modules/.bin/docusaurus build
```

En cas d'erreur `Broken links` ou `Broken anchors` :
- Corriger **tous** les liens cassés dans `docs/` **ET** dans `i18n/` (toutes les locales)
- Ne jamais supprimer un fichier `.md` sans vérifier les pages qui y font référence (`grep -rn 'slug-du-fichier' docs/ i18n/`)

## Commande node

Le binaire `node` n'est pas dans le PATH par défaut. Utiliser :
```
/opt/homebrew/bin/node
```

## CodeGraph

```
projectPath: "/Users/guillaume.marcq/Projets/Perso/RPG_MO_WIKI"
```

## Structure

- `docs/` — contenu EN (source de vérité)
- `i18n/<locale>/docusaurus-plugin-content-docs/current/` — traductions (miroir de `docs/`)
- Quand on modifie/supprime un fichier dans `docs/`, faire la même opération dans **tous** les dossiers `i18n/*/`
