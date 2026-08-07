import type {Config} from '@docusaurus/types';
import type {Options, ThemeConfig} from '@docusaurus/preset-classic';

const config: Config = {
  title: 'Nereus',
  tagline: 'Shared stream storage for Pulsar and Native Kafka',
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
          path: 'docs',
          routeBasePath: 'docs',
          sidebarPath: require.resolve('./sidebars.ts'),
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
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          label: 'Docs',
          position: 'left',
        },
        {
          href: 'https://github.com/nereusstream/nereus',
          position: 'right',
          className: 'header-github-link',
          'aria-label': 'Nereus GitHub repository',
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
          title: 'Documentation',
          items: [
            {label: 'Overview', to: '/docs'},
            {label: 'Architecture', to: '/docs/overview/architecture'},
          ],
        },
        {
          title: 'Project',
          items: [
            {label: 'GitHub', href: 'https://github.com/nereusstream/nereus'},
            {label: 'Issues', href: 'https://github.com/nereusstream/nereus/issues'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} NereusStream.`,
    },
  } satisfies ThemeConfig,
};

export default config;
