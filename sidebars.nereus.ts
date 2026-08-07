import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    'index',
    {
      type: 'category',
      label: 'Overview',
      link: {
        type: 'generated-index',
        title: 'Nereus overview',
        description: 'The problem, architecture, and reading order for Nereus.',
      },
      items: [
        'overview/why-nereus',
        'overview/architecture',
        'overview/reading-guide',
      ],
    },
    {
      type: 'category',
      label: 'Concepts',
      items: [
        'concepts/stream-record-entry-offset',
        'concepts/protocol-logical-physical-coordinates',
        'concepts/primary-wal',
        'concepts/stream-head-and-commit-chain',
        'concepts/cas-and-linearization-point',
        'concepts/read-target-and-offset-index',
      ],
    },
    {
      type: 'category',
      label: 'Write and read paths',
      items: [
        'data-paths/append-flow',
        'data-paths/append-outcomes',
        'data-paths/append-recovery',
        'data-paths/read-flow',
        'data-paths/read-boundaries',
        'data-paths/index-repair-and-fallback',
      ],
    },
    {
      type: 'category',
      label: 'Storage and physical evolution',
      items: [
        'storage/storage-profiles',
        'storage/object-wal',
        'storage/bookkeeper-wal',
        'storage/generation-overview',
        'storage/generation-lifecycle',
        'storage/generation-selection-and-fallback',
        'storage/materialization',
      ],
    },
    {
      type: 'category',
      label: 'Integrations',
      items: [
        'integrations/pulsar',
        'integrations/pulsar-cursor-and-subscription',
        'integrations/native-kafka',
        'integrations/kafka-produce-and-fetch',
        'integrations/kafka-recovery-and-compaction',
        'integrations/kop-vs-native-kafka',
      ],
    },
    {
      type: 'category',
      label: 'Operations',
      items: [
        'operations/retention-and-gc',
        'operations/object-gc-state-machine',
        'operations/bookkeeper-retention',
        'operations/failure-and-recovery',
        'operations/backpressure-and-timeouts',
        'operations/observability',
        'operations/security-and-multitenancy',
      ],
    },
    {
      type: 'category',
      label: 'Examples',
      items: [
        'examples/pulsar-object-wal-sync',
        'examples/pulsar-bookkeeper-async-object',
        'examples/bookkeeper-sync-object-timeout',
        'examples/kafka-transaction-and-delete-records',
      ],
    },
    {
      type: 'category',
      label: 'Development',
      items: ['development/module-boundaries', 'development/source-reading-map'],
    },
    {
      type: 'category',
      label: 'Reference',
      items: [
        'reference/correctness-authorities',
        'reference/non-goals',
        'reference/glossary',
        'reference/state-machines',
        'reference/end-to-end-cheatsheet',
      ],
    },
    {
      type: 'category',
      label: 'Migration status',
      items: ['development/project-status', 'reference/document-baseline'],
    },
  ],
};

export default sidebars;
