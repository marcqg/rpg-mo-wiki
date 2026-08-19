import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'RPG MO Wiki',
  tagline: 'Miroir non officiel du wiki RPG MO',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  clientModules: [
    './src/client-modules/sortable-tables.js',
  ],

  // Set the production url of your site here
  url: 'https://marcqg.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/rpg-mo-wiki/',

  // GitHub pages deployment config.
  organizationName: 'marcqg', // GitHub org/user name.
  projectName: 'rpg-mo-wiki', // Repo name.
  deploymentBranch: 'gh-pages',

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'pt', 'pl', 'ko'],
    localeConfigs: {
      en: { label: 'English' },
      fr: { label: 'Français' },
      pt: { label: 'Português' },
      pl: { label: 'Polski' },
      ko: { label: '한국어' },
    },
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/', // le wiki est la page d'accueil du site
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/marcqg/rpg-mo-wiki/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
        gtag: {
          trackingID: 'G-SXQRRGS87M',
          anonymizeIP: true,
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'RPG MO Wiki',
      items: [
        {
          type: 'localeDropdown',
          position: 'right',
        },
        {
          href: 'https://rpg-mo.fandom.com/wiki/Main_Page',
          label: 'Wiki original (Fandom)',
          position: 'right',
        },
        {
          href: 'https://github.com/marcqg/rpg-mo-wiki',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Source',
          items: [
            {
              label: 'Wiki original (Fandom)',
              href: 'https://rpg-mo.fandom.com/wiki/Main_Page',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/marcqg/rpg-mo-wiki',
            },
          ],
        },
      ],
      copyright: `Contenu adapté du <a href="https://rpg-mo.fandom.com/wiki/Main_Page">RPG MO Wiki</a> (Fandom), sous licence CC BY-SA. Ce site n'est pas affilié à Fandom ni aux développeurs de RPG MO.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
