import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import clsx from 'clsx';

import {projectStatus} from '../data/projectStatus';
import {storageProfiles} from '../data/storageProfiles';
import styles from './index.module.css';

const architectureLayers = [
  {
    label: 'Protocol entry points',
    body: 'Pulsar Broker and native Kafka retain topic, partition, subscription, transaction, and leader semantics.',
    accent: 'blue',
  },
  {
    label: 'Protocol adapters',
    body: 'ManagedLedger, Pulsar, and Kafka adapters translate protocol coordinates into streamId + offset operations.',
    accent: 'cyan',
  },
  {
    label: 'Nereus storage core',
    body: 'Append, read, recovery, generation publication, retention, and physical reclamation share one logical stream truth.',
    accent: 'indigo',
  },
  {
    label: 'Metadata and bytes',
    body: 'Oxia owns visibility and coordination; BookKeeper and object storage hold durable physical representations.',
    accent: 'violet',
  },
];

const invariants = [
  {
    number: '01',
    title: 'Stable logical coordinates',
    code: 'streamId + offset',
    body: 'Physical data may move between WALs and generations without changing the protocol-facing logical position.',
  },
  {
    number: '02',
    title: 'One logical commit point',
    code: 'stream head version-CAS',
    body: 'A successful WAL write or object PUT is not a committed offset. The head CAS is the linearization point.',
  },
  {
    number: '03',
    title: 'Physical evolution through generations',
    code: 'same range, new representation',
    body: 'Read-optimized generations can replace older physical layouts while readers pin and drain the source safely.',
  },
];

function ArchitectureOverview() {
  return (
    <div className={styles.architectureDiagram} aria-label="Nereus layered architecture">
      <div className={styles.architectureInputs}>
        <span>Pulsar Client</span>
        <span>Kafka Client</span>
      </div>
      <div className={styles.architectureArrow} aria-hidden="true">↓</div>
      <div className={styles.architectureStack}>
        {architectureLayers.map((layer) => (
          <div key={layer.label} className={clsx(styles.architectureLayer, styles[`accent-${layer.accent}`])}>
            <div>
              <strong>{layer.label}</strong>
              <p>{layer.body}</p>
            </div>
            <span className={styles.layerMark} aria-hidden="true" />
          </div>
        ))}
      </div>
    </div>
  );
}

function Home() {
  return (
    <Layout title="Nereus" description="Shared stream storage for Pulsar and Native Kafka">
      <main>
        <section className={styles.hero}>
          <div className={clsx('container', styles.heroGrid)}>
            <div className={styles.heroCopy}>
              <div className={styles.eyebrow}><span className={styles.eyebrowDot} /> v0.1.0 · testing</div>
              <h1>Nereus</h1>
              <p className={styles.heroLead}>Shared stream storage for Pulsar and Native Kafka.</p>
              <p className={styles.heroBody}>
                Protocol systems keep their semantics. Nereus manages durable bytes, logical offsets,
                committed heads, physical generations, recovery, and safe reclamation beneath them.
              </p>
              <div className={styles.heroActions}>
                <Link className={clsx('button button--primary', styles.primaryButton)} to="/docs">
                  Read the docs <span aria-hidden="true">→</span>
                </Link>
                <a className={clsx('button button--outline', styles.secondaryButton)} href="https://github.com/nereusstream/nereus">
                  View on GitHub <span aria-hidden="true">↗</span>
                </a>
              </div>
              <div className={styles.heroFacts}>
                <div><strong>5</strong><span>storage profiles</span></div>
                <div><strong>1</strong><span>stream truth</span></div>
                <div><strong>2</strong><span>protocol paths</span></div>
              </div>
            </div>
            <div className={styles.heroVisual}>
              <div className={clsx(styles.orbit, styles.orbitOne)} />
              <div className={clsx(styles.orbit, styles.orbitTwo)} />
              <div className={clsx(styles.heroNode, styles.heroNodeTop)}>Pulsar</div>
              <div className={clsx(styles.heroNode, styles.heroNodeRight)}>Kafka</div>
              <div className={styles.heroCore}>
                <img src="/img/nereus-icon.png" alt="" />
                <span>stream<br />truth</span>
              </div>
              <div className={clsx(styles.heroNode, styles.heroNodeBottom)}>WAL · Object · Oxia</div>
            </div>
          </div>
        </section>

        <section className={clsx('container', styles.section)}>
          <div className={styles.sectionIntro}>
            <p className={styles.sectionKicker}>What Nereus does</p>
            <h2>One storage core beneath two protocol worlds.</h2>
            <p>
              Nereus sits below protocol-specific brokers. It gives each integration a stable logical stream
              while allowing the physical WAL, object layout, and recovery path to evolve independently.
            </p>
          </div>
          <ArchitectureOverview />
        </section>

        <section className={clsx(styles.invariantSection, styles.section)}>
          <div className="container">
            <div className={styles.sectionIntro}>
              <p className={styles.sectionKicker}>The model</p>
              <h2>Three invariants anchor every path.</h2>
            </div>
            <div className={styles.invariantGrid}>
              {invariants.map((invariant) => (
                <article className={styles.invariantCard} key={invariant.number}>
                  <span className={styles.invariantNumber}>{invariant.number}</span>
                  <h3>{invariant.title}</h3>
                  <code>{invariant.code}</code>
                  <p>{invariant.body}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className={clsx('container', styles.section)}>
          <div className={styles.sectionIntroInline}>
            <div>
              <p className={styles.sectionKicker}>Storage profiles</p>
              <h2>Choose a persistence boundary per stream.</h2>
            </div>
            <Link to="/docs/concepts/primary-wal">Understand the write path →</Link>
          </div>
          <div className={styles.profileGrid}>
            {storageProfiles.map((profile) => (
              <article className={styles.profileCard} key={profile.name}>
                <div className={styles.profileHeader}>
                  <span className={clsx(styles.profileBadge, profile.mode === 'sync' ? styles.sync : styles.async)}>{profile.mode}</span>
                  <span className={styles.profileIndex}>{profile.index}</span>
                </div>
                <h3>{profile.name}</h3>
                <dl>
                  <div><dt>Primary WAL</dt><dd>{profile.wal}</dd></div>
                  <div><dt>Object work</dt><dd>{profile.objectWork}</dd></div>
                  <div><dt>Producer boundary</dt><dd>{profile.boundary}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.exploreSection}>
          <div className="container">
            <div className={styles.sectionIntro}>
              <p className={styles.sectionKicker}>Explore the documentation</p>
              <h2>Follow the dependency order.</h2>
            </div>
            <div className={styles.exploreGrid}>
              <Link className={styles.exploreCard} to="/docs/overview/architecture"><span>01</span><strong>Architecture</strong><small>Boundaries, authorities, and source anchors</small></Link>
              <Link className={styles.exploreCard} to="/docs/concepts/stream-record-entry-offset"><span>02</span><strong>Logical coordinates</strong><small>Stream, record, entry, batch, and offset</small></Link>
              <Link className={styles.exploreCard} to="/docs/concepts/stream-head-and-commit-chain"><span>03</span><strong>Commit protocol</strong><small>WAL durability, head CAS, and recovery</small></Link>
              <Link className={styles.exploreCard} to="/docs/development/project-status"><span>04</span><strong>Current status</strong><small>Implementation baseline and migration coverage</small></Link>
            </div>
          </div>
        </section>

        <section className={clsx('container', styles.statusSection)}>
          <div className={styles.statusPanel}>
            <div>
              <p className={styles.sectionKicker}>Current status</p>
              <h2>{projectStatus.stage}</h2>
              <p>{projectStatus.summary}</p>
            </div>
            <dl className={styles.statusFacts}>
              <div><dt>Source baseline</dt><dd><code>{projectStatus.sourceCommit.slice(0, 12)}</code></dd></div>
              <div><dt>PDF snapshot</dt><dd><code>{projectStatus.pdfCommit.slice(0, 12)}</code></dd></div>
              <div><dt>Verified</dt><dd>{projectStatus.verified}</dd></div>
              <div><dt>Documentation</dt><dd>{projectStatus.documentation}</dd></div>
            </dl>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default Home;
