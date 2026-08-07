export type ProductStatus = 'testing' | 'in-development' | 'stable';

export interface ProductDefinition {
  id: 'nereus' | 'nereus-delay';
  name: string;
  slug: string;
  summary: string;
  description: string;
  status: ProductStatus;
  statusLabel: string;
  featured: boolean;
  accent: 'cyan' | 'indigo';
  productPath: string;
  docsPath: string;
  repositoryUrl: string;
  sourceCommit: string;
  lastVerified: string;
}

export const products: ProductDefinition[] = [
  {
    id: 'nereus',
    name: 'Nereus',
    slug: 'nereus',
    summary: 'Shared stream storage for Pulsar and Native Kafka.',
    description:
      'Stable logical offsets, explicit commit boundaries, physical generations, recovery, retention, and safe reclamation beneath protocol-facing brokers.',
    status: 'testing',
    statusLabel: 'Flagship · v0.1.0 testing',
    featured: true,
    accent: 'cyan',
    productPath: '/products/nereus/',
    docsPath: '/docs/nereus/',
    repositoryUrl: 'https://github.com/nereusstream/nereus',
    sourceCommit: 'c820391dc1de4229362ddf833487066c32609cba',
    lastVerified: '2026-08-07',
  },
  {
    id: 'nereus-delay',
    name: 'Nereus Delay',
    slug: 'nereus-delay',
    summary: 'Durable delayed-message scheduling across Kafka and Pulsar destinations.',
    description:
      'Managed scheduling, cancellation and rescheduling with durable shard state, destination isolation, explicit uncertainty, and checkpoint-based recovery.',
    status: 'in-development',
    statusLabel: 'V1 in development',
    featured: false,
    accent: 'indigo',
    productPath: '/products/nereus-delay/',
    docsPath: '/docs/nereus-delay/',
    repositoryUrl: 'https://github.com/nereusstream/nereus-delay',
    sourceCommit: '9281890f42772cc01b6b2b607fd93e31de64879b',
    lastVerified: '2026-08-07',
  },
];

export function getProduct(id: ProductDefinition['id']): ProductDefinition {
  const product = products.find((candidate) => candidate.id === id);

  if (!product) {
    throw new Error(`Unknown NereusStream product: ${id}`);
  }

  return product;
}
