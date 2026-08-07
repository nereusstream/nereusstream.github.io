import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import clsx from 'clsx';

import {getProduct} from '../../../data/products';
import styles from './index.module.css';

const product = getProduct('nereus-delay');

const capabilities = [
  {
    title: 'Schedule',
    body: 'Prepare an immutable command and enqueue it to the configured Kafka or Pulsar Command Topic.',
  },
  {
    title: 'Cancel and reschedule',
    body: 'Managed messages retain query, cancellation, and rescheduling boundaries before publish admission.',
  },
  {
    title: 'Payload commit',
    body: 'Large payloads use reserve, upload, attest, and commit as separate durable stages.',
  },
  {
    title: 'Query',
    body: 'Queued and applied outcomes remain distinct; a query barrier determines when an applied answer is conclusive.',
  },
];

const boundaries = [
  {
    label: 'Queued',
    body: 'The ingress Broker durably accepted a Command. It does not mean that the Delay Shard applied the requested operation.',
    tone: 'queued',
  },
  {
    label: 'Applied',
    body: 'The Delay Shard durably recorded an authoritative applied or rejected result in its ordered state machine.',
    tone: 'applied',
  },
  {
    label: 'Published',
    body: 'A destination adapter has durable evidence for the target append or handoff inside its configured capability.',
    tone: 'published',
  },
  {
    label: 'Uncertain',
    body: 'The system cannot prove whether a producer-side operation became durable; recovery keeps the duplicate-risk boundary explicit.',
    tone: 'uncertain',
  },
];

function DelayArchitecture() {
  return (
    <div className={styles.flow} aria-label="Nereus Delay end-to-end flow">
      <div className={styles.flowNode}>SDK</div>
      <span className={styles.flowArrow} aria-hidden="true">→</span>
      <div className={styles.flowNode}>Command Topic<br /><small>Shard Log</small></div>
      <span className={styles.flowArrow} aria-hidden="true">→</span>
      <div className={styles.flowNode}>Delay Shard<br /><small>RocksDB</small></div>
      <span className={styles.flowArrow} aria-hidden="true">→</span>
      <div className={styles.flowNode}>Scheduler<br /><small>Destination Lane</small></div>
      <span className={styles.flowArrow} aria-hidden="true">→</span>
      <div className={styles.flowNode}>Kafka / Pulsar<br /><small>destination</small></div>
    </div>
  );
}

function NereusDelayPage() {
  return (
    <Layout title="Nereus Delay | NereusStream" description={product.summary}>
      <main>
        <section className={styles.hero}>
          <div className={clsx('container', styles.heroGrid)}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}><span className={styles.eyebrowDot} /> {product.statusLabel}</p>
              <h1>Nereus Delay</h1>
              <p className={styles.heroLead}>{product.summary}</p>
              <p className={styles.heroBody}>{product.description}</p>
              <div className={styles.actions}>
                <Link className={clsx('button button--primary', styles.primaryButton)} to={product.docsPath}>
                  Read Delay docs <span aria-hidden="true">→</span>
                </Link>
                <a className={clsx('button button--outline', styles.secondaryButton)} href={product.repositoryUrl}>
                  Nereus Delay on GitHub <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
            <div className={styles.heroVisual}>
              <div className={styles.clock} aria-hidden="true"><span className={styles.clockHand} /></div>
              <div className={clsx(styles.heroNode, styles.heroNodeTop)}>deliverAt</div>
              <div className={clsx(styles.heroNode, styles.heroNodeRight)}>actionAt</div>
              <div className={clsx(styles.heroNode, styles.heroNodeBottom)}>Kafka · Pulsar</div>
            </div>
          </div>
        </section>

        <section className={clsx('container', styles.section)}>
          <div className={styles.sectionIntro}>
            <p className={styles.kicker}>What it does</p>
            <h2>Scheduling is a durable state machine, not a timer.</h2>
            <p>Nereus Delay separates command ordering, shard application, destination admission, and producer evidence so each result has a concrete meaning during retries and recovery.</p>
          </div>
          <div className={styles.capabilityGrid}>
            {capabilities.map((capability, index) => (
              <article className={styles.capabilityCard} key={capability.title}>
                <span>0{index + 1}</span>
                <h3>{capability.title}</h3>
                <p>{capability.body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.architectureSection}>
          <div className="container">
            <div className={styles.sectionIntro}>
              <p className={styles.kicker}>End-to-end flow</p>
              <h2>One Delay Shard owns one ordered recovery unit.</h2>
              <p>The V1 identity is fixed: one Ingress Route partition is one Shard Log, one Delay Shard, one RocksDB instance, and one ownership/recovery unit. Oxia coordinates configuration, placement, leases, and checkpoint catalog; Object Store holds checkpoints and large payloads.</p>
            </div>
            <DelayArchitecture />
          </div>
        </section>

        <section className={clsx('container', styles.section)}>
          <div className={styles.splitGrid}>
            <article className={styles.semanticPanel}>
              <p className={styles.kicker}>Timing semantics</p>
              <h2><code>deliverAt</code> is a not-before boundary.</h2>
              <p>It is the earliest instant at which a destination consumer may become eligible to see the message. It is not the time publishing starts and it is not an exact-time visibility guarantee.</p>
              <dl className={styles.factList}>
                <div><dt><code>actionAt</code></dt><dd>The earliest time Nereus Delay may start the destination action.</dd></div>
                <div><dt>Trusted UTC interval</dt><dd>Clock uncertainty can delay a decision, but cannot authorize an early publish or premature expiration.</dd></div>
                <div><dt><code>expireAt</code></dt><dd>A durable Publish Admission boundary; source lag does not rewrite an already valid admission into rejection.</dd></div>
              </dl>
            </article>
            <article className={styles.semanticPanel}>
              <p className={styles.kicker}>Delivery boundaries</p>
              <h2>Every outcome keeps its evidence level.</h2>
              <div className={styles.boundaryList}>
                {boundaries.map((boundary) => (
                  <div className={styles.boundary} key={boundary.label}>
                    <span className={clsx(styles.boundaryMarker, styles[boundary.tone])} aria-hidden="true" />
                    <div><strong>{boundary.label}</strong><p>{boundary.body}</p></div>
                  </div>
                ))}
              </div>
              <p className={styles.note}>The baseline delivery capability is bounded at-least-once. A destination may observe a duplicate; Nereus Delay does not claim universal exactly-once.</p>
            </article>
          </div>
        </section>

        <section className={styles.recoverySection}>
          <div className="container">
            <div className={styles.sectionIntro}>
              <p className={styles.kicker}>Isolation and recovery</p>
              <h2>Failure in one destination lane should not stop unrelated work.</h2>
            </div>
            <div className={styles.recoveryGrid}>
              <article><span className={styles.recoveryIcon}>01</span><h3>Destination Lane isolation</h3><p>Lane state carries destination, tenancy, ordering, capacity, retry, circuit, fairness, and due-lag boundaries. It is not an ownership or checkpoint unit.</p></article>
              <article><span className={styles.recoveryIcon}>02</span><h3>Checkpoint and Recovery Floor</h3><p>A published checkpoint belongs to a bounded Recovery Set. The Recovery Floor protects state and external objects required by every permitted recovery image.</p></article>
              <article><span className={styles.recoveryIcon}>03</span><h3>Replay before readiness</h3><p>Restore, verify identity and integrity, replay the Shard Log, and cross the activation barrier before command application resumes. Lane readiness remains a separate gate.</p></article>
            </div>
          </div>
        </section>

        <section className={clsx('container', styles.statusSection)}>
          <div className={styles.statusPanel}>
            <div>
              <p className={styles.kicker}>Current status</p>
              <h2>V1 in development</h2>
              <p>Core protocol, deterministic state-machine, local RocksDB, scheduler, and typed evidence boundaries are being built in testable layers. Release readiness still depends on concrete broker adapters, authenticated external evidence, Oxia authority, real-service integration, chaos, benchmark, and upgrade evidence.</p>
            </div>
            <dl className={styles.statusFacts}>
              <div><dt>Source baseline</dt><dd><code>{product.sourceCommit.slice(0, 12)}</code></dd></div>
              <div><dt>Spec revision</dt><dd>V1-FROZEN-2026-08-01</dd></div>
              <div><dt>Verified</dt><dd>{product.lastVerified}</dd></div>
              <div><dt>Release posture</dt><dd>Not release-ready</dd></div>
            </dl>
          </div>
        </section>

        <section className={styles.docsSection}>
          <div className="container">
            <div className={styles.docsPanel}>
              <div>
                <p className={styles.kicker}>Documentation</p>
                <h2>Follow the V1 reading path.</h2>
                <p>Start with the architecture and time model, then move to commands, scheduling, lane isolation, recovery, and the current implementation status.</p>
              </div>
              <Link className={clsx('button button--primary', styles.primaryButton)} to={product.docsPath}>Open Nereus Delay docs <span aria-hidden="true">→</span></Link>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export default NereusDelayPage;
