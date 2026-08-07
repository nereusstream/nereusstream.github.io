import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const nereusDelaySidebars: SidebarsConfig = {
  docsSidebar: [
    'index',
    {
      type: 'category',
      label: 'Overview',
      items: [
        'overview/why-nereus-delay',
        'overview/architecture',
        'overview/reading-guide',
      ],
    },
    {
      type: 'category',
      label: 'Concepts',
      items: [
        'concepts/delivery-time-and-action-time',
        'concepts/commands-messages-and-receipts',
      ],
    },
    {
      type: 'category',
      label: 'Data paths',
      items: ['data-paths/schedule-flow'],
    },
    {
      type: 'category',
      label: 'Operations',
      items: [
        'operations/destination-lane-isolation',
        'operations/checkpoints-and-recovery',
      ],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/glossary',
        'reference/authority-order',
        'reference/protocol-registry-guide',
        'reference/non-goals',
      ],
    },
    {
      type: 'category',
      label: 'Development',
      items: ['development/project-status'],
    },
  ],
};

export default nereusDelaySidebars;
