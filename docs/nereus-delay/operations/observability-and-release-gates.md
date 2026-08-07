---
title: Observability and release gates
description: Durable SLO evidence, bounded metrics, failure-cut coverage, and the conditions required before a V1 release claim.
sidebar_position: 5
product: nereus-delay
source_repository: nereusstream/nereus-delay
source_commit: 9281890f42772cc01b6b2b607fd93e31de64879b
source_paths:
  - docs/Nereus Delay V1 设计.md
  - docs/V1-DESIGN-AUDIT.md
  - docs/adr/0032-use-two-level-bounded-deficit-round-robin.md
  - docs/adr/0041-persist-slo-samples-before-they-can-be-lost.md
  - docs/adr/0030-limit-v1-to-one-active-recovery-cell.md
last_verified: 2026-08-07
status: current-main
authority: reader-facing-summary
spec_revision: V1-FROZEN-2026-08-01
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline commit="9281890f42772cc01b6b2b607fd93e31de64879b" verified="2026-08-07" source="nereusstream/nereus-delay" />

# Observability and release gates {#observability-and-release-gates}

Nereus Delay treats observability as durable evidence with its own bounded capacity. A dashboard scrape is not the SLO denominator, a percentile is not a correctness proof, and a local implementation test is not a production release gate.

## 1. Metrics expose correctness boundaries {#metrics}

The core metric families cover:

- source applied position, source end, retention margin, lease guard, activation, checkpoint age, Recovery Floor age, and replay work;
- publish Admission totals and `PUBLISHED`/`NOT_PUBLISHED`/`UNKNOWN` outcomes;
- uncertain age and duplicate risk;
- due lag, due-not-admitted reasons, ready-lane discovery, DRR service gap, Claim/materialization latency, retry, and circuit state;
- pending/inflight/retained bytes and messages, quota, Control Reserve, RocksDB/WAL/compaction/disk/FD watermarks;
- checkpoint, DLQ, audit, quarantine, evidence-gap, dependency, and invariant signals.

Labels remain bounded and opaque. Full message IDs, topics, credentials, payloads, and free-form error text do not become Prometheus labels. Persisted counters and attempt ledgers are the authority for pending/inflight accounting; an exporter must not infer usage from a public aggregate state that can hide an open `UNCERTAIN` obligation.

## 2. SLO samples are durable {#durable-slo-samples}

Each objective pins a Registry-defined objective digest, population, threshold, window, sample-event schema, load envelope, and exclusion set. The measured success event is exact:

| Objective | Start | Success |
| --- | --- | --- |
| `command_queued_latency` | Exact prepared bytes handed to the ingress adapter | Guarded Broker durability receipt |
| `command_applied_latency` | Broker persistence time and Source Position | Applied result/state RocksDB WAL sync |
| `due_admission_lag` | `deliverAt` for ordinary managed delivery, `actionAt` for managed handoff | Admission WAL sync and qualified durable Final observation |
| `native_handoff_ack_lag` | Native prepared `actionAt` | Pinned Broker native receipt |
| `ownership_failover_rto` | Durable fault cut closing the old Owner gate | New `ACTIVE_FOR_COMMANDS` Owner and first bounded source turn |
| `lane_recovery_ready_rto` | Lane-specific recovery fault cut | New certificate and `READY` key WAL sync |

`AUTO_FAST` native handoff does not enter managed `due_admission_lag`; it has its own objective. A `HEALTHY` population is paired with an `ALL_ACCEPTED` population using the same semantic event. A blocked record is not silently removed from the denominator; it carries a closed reason such as `CAPABILITY_BLOCKED`, `CLOCK_GATED`, `ORDER_HEAD_BLOCKED`, or `CAPACITY_GATED`.

The Start is durably recorded before the component can lose ownership, or is reconstructible from an already durable Shard/Message/Attempt/Lane/Recovery authority. Shard-derived samples use `meta_cf/SLO_OUTBOX`; SDK, Gateway, and control/RTO detectors need their own bounded outbox. Final evidence is written only after the exact success event. Timeout, uncertainty, restart, or an evidence gap makes the sample worse; it cannot disappear or become a good result because a scrape was missed.

SLO storage and export capacity is disjoint from correctness and Outcome Reserve. If it is exhausted, the objective becomes `BAD_EVIDENCE_GAP` and alerts/release checks fail; the system does not weaken delivery correctness or shrink the population.

## 3. Release gates are evidence gates {#release-gates}

V1 is not release-ready until all ten design gates have fresh evidence:

1. Protocol, state, key-codec, and golden-vector tests pass across all supported languages.
2. Correctness failure cuts pass in fresh processes.
3. Real Kafka, Pulsar, Oxia, and Object Store integration gates pass.
4. No-early delivery tests cover Worker/target clock bounds and Pulsar strictness.
5. Benchmarks produce every required configuration artifact.
6. Capacity proofs cover memory/RSS/cgroup, file descriptors, disk/temp, Control Reserve, adapter physical/zombie limits, work classes, Lane fairness, and durable SLO outbox/collector capacity.
7. Soak covers the longest checkpoint/Floor, retry, uncertainty, and GC interaction period without source gaps, counter drift, unbounded resources, or aged unexplained uncertainty.
8. Upgrade/downgrade proves writer-before-reader compatibility and prevents old dedupe from accepting same bytes under a different version.
9. Restore, fence, checkpoint, DLQ replay, uncertain override, and disaster-boundary runbooks are exercised on the release candidate.
10. Kafka pinned-topic-ID client and Pulsar Broker resource-guard source locks, binary digests, full rollout, and delete/recreate cuts pass; name-only or stock fallback paths are excluded.

The release artifact matrix also requires golden vectors, semantic catalogs, real-service conformance, chaos evidence, binary/source attestation, SLO evidence, runbooks, and soak/upgrade reports. The current public posture remains `V1 in development` until those artifacts and the implementation-status blockers are complete.

## 4. Failure signals stay separate {#failure-signals}

Destination failure, Lane backlog, circuit-open, or executor saturation must not be relabeled as a source pause. Source safety gates are reserved for ownership ambiguity, durability/corruption, disk safety, control integrity, time-fence capacity, ingress abuse, placement capacity, or recovery-retention risk. This separation lets Command application and healthy Lanes continue while the affected Lane remains blocked and observable.

## Source anchors {#source-anchors}

- `docs/Nereus Delay V1 设计.md`, sections 20, 22, and 23.5.
- `docs/V1-DESIGN-AUDIT.md`, Release artifact matrix and Final gate.
- `docs/adr/0041-persist-slo-samples-before-they-can-be-lost.md`.
- `docs/adr/0032-use-two-level-bounded-deficit-round-robin.md`.
- `docs/adr/0030-limit-v1-to-one-active-recovery-cell.md`.
