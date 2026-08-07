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
        'concepts/shard-log-and-source-position',
        'concepts/managed-and-auto-fast',
        'concepts/delivery-guarantees-and-uncertainty',
      ],
    },
    {
      type: 'category',
      label: 'Data paths',
      items: [
        'data-paths/schedule-flow',
        'data-paths/due-claim-and-publish',
        'data-paths/cancel-and-reschedule',
        'data-paths/query-and-read-barrier',
      ],
    },
    {
      type: 'category',
      label: 'Operations',
      items: [
        'operations/destination-lane-isolation',
        'operations/checkpoints-and-recovery',
        'operations/ownership-and-activation',
        'operations/payload-lifecycle-and-gc',
        'operations/observability-and-release-gates',
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
