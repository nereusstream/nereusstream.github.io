import type {Config} from '@docusaurus/types';
import type {Options, ThemeConfig} from '@docusaurus/preset-classic';

import {products} from './src/data/products';
import {legacyDocRedirects} from './migration/legacy-redirects';

const config: Config = {
  title: 'NereusStream',
  tagline: 'Infrastructure for durable streams and scheduled delivery',
  favicon: 'img/nereus-icon.png',

  url: 'https://nereusstream.github.io',
  baseUrl: '/',
  organizationName: 'nereusstream',
  projectName: 'nereusstream.github.io',
  trailingSlash: true,

  onBrokenLinks: 'throw',

  markdown: {
    mermaid: true,
    hooks: {
      onBrokenMarkdownLinks: 'throw',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  themes: ['@docusaurus/theme-mermaid'],

  presets: [
    [
      'classic',
      {
        docs: {
          path: 'docs/nereus',
          routeBasePath: 'docs/nereus',
          sidebarPath: require.resolve('./sidebars.nereus.ts'),
          editUrl: 'https://github.com/nereusstream/nereusstream.github.io/edit/master/',
          showLastUpdateAuthor: true,
          showLastUpdateTime: true,
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      } satisfies Options,
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-docs',
      {
        id: 'nereusDelay',
        path: 'docs/nereus-delay',
        routeBasePath: 'docs/nereus-delay',
        sidebarPath: require.resolve('./sidebars.nereus-delay.ts'),
        editUrl: 'https://github.com/nereusstream/nereusstream.github.io/edit/master/',
        showLastUpdateAuthor: true,
        showLastUpdateTime: true,
      },
    ],
    [
      '@docusaurus/plugin-client-redirects',
      {
        redirects: legacyDocRedirects,
      },
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'NereusStream',
      logo: {
        alt: 'NereusStream',
        src: 'img/nereus-icon.png',
        width: 42,
        height: 21,
      },
      items: [
        {
          type: 'dropdown',
          label: 'Products',
          position: 'left',
          items: products.map((product) => ({
            label: product.name,
            to: product.productPath,
          })),
        },
        {
          label: 'Documentation',
          to: '/docs/',
          position: 'left',
        },
        {
          href: 'https://github.com/nereusstream',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'NereusStream GitHub organization',
        },
      ],
    },
    docs: {
      sidebar: {
        hideable: true,
        autoCollapseCategories: true,
      },
    },
    colorMode: {
      respectPrefersColorScheme: true,
    },
    prism: {
      additionalLanguages: ['bash', 'diff', 'java', 'json', 'yaml'],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Products',
          items: [
            ...products.map((product) => ({
              label: product.name,
              to: product.productPath,
            })),
          ],
        },
        {
          title: 'Documentation',
          items: [
            {label: 'Documentation home', to: '/docs/'},
            {label: 'Nereus docs', to: '/docs/nereus/'},
            {label: 'Nereus Delay docs', to: '/docs/nereus-delay/'},
          ],
        },
        {
          title: 'Organization',
          items: [
            {label: 'GitHub', href: 'https://github.com/nereusstream'},
            {
              label: 'Website source',
              href: 'https://github.com/nereusstream/nereusstream.github.io',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} NereusStream.`,
    },
  } satisfies ThemeConfig,
};

export default config;
