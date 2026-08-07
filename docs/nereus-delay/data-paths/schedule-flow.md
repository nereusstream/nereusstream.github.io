---
title: Schedule flow
description: The durable path from a prepared Schedule command to a managed delayed message.
sidebar_position: 1
product: nereus-delay
source_repository: nereusstream/nereus-delay
source_commit: 9281890f42772cc01b6b2b607fd93e31de64879b
source_paths:
  - docs/Nereus Delay V1 设计.md
  - docs/adr/0005-separate-command-queuing-from-application.md
  - docs/adr/0007-use-source-position-as-the-sole-command-order.md
last_verified: 2026-08-07
status: current-main
authority: reader-facing-summary
spec_revision: V1-FROZEN-2026-08-01
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline commit="9281890f42772cc01b6b2b607fd93e31de64879b" verified="2026-08-07" source="nereusstream/nereus-delay" />

# Schedule flow {#schedule-flow}

The normal managed path has separate preparation, enqueue, application, scheduling, and publication boundaries:

```mermaid
sequenceDiagram
  participant SDK
  participant Topic as Command Topic / Shard Log
  participant Shard as Delay Shard
  participant Lane as Destination Lane
  participant Adapter as Kafka / Pulsar Adapter
  SDK->>SDK: prepare exact IDs, bytes, hash, retry boundary
  SDK->>Topic: enqueue Prepared Command
  Topic-->>SDK: CommandQueuedReceipt
  Topic->>Shard: source-ordered record
  Shard->>Shard: validate and apply atomically to RocksDB
  Shard-->>SDK: applied result after Source barrier
  Shard->>Lane: create or advance durable work
  Lane->>Lane: Claim and Publish Admission
  Lane->>Adapter: publish only after timing and capability checks
  Adapter-->>Lane: evidence or explicit uncertainty
```

## 1. Prepare before I/O {#prepare-before-io}

The SDK fixes route incarnation, partition, command identity, `delayMessageId`, canonical body, command hash, and retry deadline locally. A caller may persist the prepared command before submitting it.

## 2. Enqueue is only queued {#enqueue-is-only-queued}

The Command Topic is a durable ingress boundary. A `CommandQueuedReceipt` proves Broker persistence for that physical enqueue, not authoritative application. Definitely-not-queued requires a closed non-persistence proof; timeout, cancellation, connection loss, and process exit remain uncertain.

## 3. Apply in Source Position order {#apply-in-source-position-order}

The Ingress Adapter supplies a physical Source Position. The Shard Runtime applies Commands and signed System Mutations in that order, using one atomic RocksDB batch before advancing the replay cursor. A successful Schedule creates a Delayed Message; a deterministic validation or policy failure records a stable rejection instead.

## 4. Claim and Publish Admission {#claim-and-publish-admission}

The Scheduler may select eligible Lane work, but only the ordered state machine can create the Claim and the Publish Admission. Admission is the point of no return for cancellation and rescheduling. The Producer call occurs only after the durable Admission batch, Owner/Store fence, time boundary, capability, and Lane readiness checks succeed.

## 5. Query and read barriers {#query-and-read-barriers}

An applied receipt or query must be tied to the correct Command identity, source metadata, and Source Position. The Query Barrier requires an active shard to have durably applied through the requested position; it does not require every Destination Lane to be ready.

## Recovery rule {#recovery-rule}

On response loss, retry behavior follows the typed outcome and capability evidence. The service never converts a missing callback into a definitive non-publication claim merely because the local future timed out.
