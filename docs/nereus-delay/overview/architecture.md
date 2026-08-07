---
title: Architecture
description: Nereus Delay components, authority boundaries, and the one-Shard recovery unit.
sidebar_position: 2
product: nereus-delay
source_repository: nereusstream/nereus-delay
source_commit: 9281890f42772cc01b6b2b607fd93e31de64879b
source_paths:
  - docs/Nereus Delay V1 设计.md
  - docs/adr/0004-use-one-rocksdb-database-per-delay-shard.md
  - docs/adr/0017-require-source-assignment-and-an-oxia-owner-lease.md
last_verified: 2026-08-07
status: current-main
authority: reader-facing-summary
spec_revision: V1-FROZEN-2026-08-01
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline product="Nereus Delay" repository="nereusstream/nereus-delay" authority="reader-facing-summary" commit="9281890f42772cc01b6b2b607fd93e31de64879b" verified="2026-08-07" />

# Architecture {#architecture}

The V1 architecture is organized around a durable source order and an explicit authority split:

```mermaid
flowchart LR
  SDK[Unified Delay SDK] -->|Prepared Command| TOPIC[Kafka or Pulsar Command Topic]
  TOPIC --> LOG[Shard Log / Source Position]
  LOG --> SHARD[Delay Shard Runtime]
  SHARD <--> DB[One RocksDB per Delay Shard]
  SHARD --> SCHED[Two-level DRR Scheduler]
  SCHED --> KA[Kafka Adapter]
  SCHED --> PA[Pulsar Adapter]
  KA --> KT[Kafka target]
  PA --> PT[Pulsar target]
  KA <--> KE[Kafka receipt partitions]
  PA <--> PE[Pulsar Attempt Journal]
  SHARD <--> OX[Oxia config / placement / lease / catalog]
  DB --> CP[Checkpoint]
  CP --> OS[Object Store]
  SDK -->|large payload| OS
```

## One Delay Shard {#one-delay-shard}

V1 fixes the following identity:

```text
one Ingress Route partition
= one Shard Log source order
= one Delay Shard application and ownership unit
= one RocksDB database
= one checkpoint / restore / local migration unit
```

The Shard Runtime is the single-writer boundary for the local state machine. It atomically applies Commands and authenticated System Mutations to RocksDB before advancing the source cursor.

## Authority boundaries {#authority-boundaries}

| Component | Owns | Does not own |
| --- | --- | --- |
| Command Topic / Shard Log | Durable source order and replay input | Materialized message state |
| Delay Shard / RocksDB | Applied commands, message state, indexes, receipts, and runtime projections | Cross-shard transactions |
| Scheduler | Eligibility, fairness, Claim, and Publish Admission | Sending around the state machine |
| Destination Adapter | Target identity, capability evidence, and publish outcome classification | Rewriting payload or binding |
| Oxia | Configuration, placement, Owner Lease, and checkpoint catalog CAS | Large payload bytes |
| Object Store | Immutable payloads and checkpoint objects | Which checkpoint is authoritative |

## Readiness is layered {#readiness-is-layered}

Ownership and command readiness are not the same as destination Lane readiness. A restored shard must verify its source assignment, replay through its activation barrier, and hold a valid Owner Lease before applying Commands. Each Destination Lane separately verifies its capability and evidence boundary before the scheduler may admit work.

## Source anchors {#source-anchors}

- `docs/Nereus Delay V1 设计.md`, sections 1, 4, 9, 10, 12, and 16.
- `docs/adr/0004-use-one-rocksdb-database-per-delay-shard.md`.
- `docs/adr/0017-require-source-assignment-and-an-oxia-owner-lease.md`.
