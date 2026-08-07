---
title: Query and read barrier
description: How applied results are routed and when a Nereus Delay query is conclusive.
sidebar_position: 4
product: nereus-delay
source_repository: nereusstream/nereus-delay
source_commit: 9281890f42772cc01b6b2b607fd93e31de64879b
source_paths:
  - docs/Nereus Delay V1 设计.md
  - docs/adr/0018-route-queries-by-receipt-and-read-through-a-source-barrier.md
  - docs/adr/0034-make-command-application-deterministic-under-replay.md
last_verified: 2026-08-07
status: current-main
authority: reader-facing-summary
spec_revision: V1-FROZEN-2026-08-01
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline commit="9281890f42772cc01b6b2b607fd93e31de64879b" verified="2026-08-07" source="nereusstream/nereus-delay" />

# Query and read barrier {#query-and-read-barrier}

Queries must be routed to the Delay Shard that owns the Command's receipt or Source Position. A random healthy Worker cannot answer an applied result from a stale local projection.

## Queued versus applied {#queued-versus-applied}

A `CommandQueuedReceipt` identifies the ingress persistence event and gives the caller a locator for later lookup. It does not prove Schedule application. A `CommandAppliedReceipt` or equivalent query result is produced only after the shard has durably recorded an `APPLIED` or `REJECTED` outcome.

## Query Barrier {#query-barrier}

The Query Barrier is a Source Position through which an `ACTIVE_FOR_COMMANDS` shard must have durably applied Commands before answering a read-after-command query conclusively. It is based on source progress and physical identity, not on receipt arrival at the SDK.

The barrier does not require every Destination Lane to be `READY`. A message can have a conclusive applied state while its destination is waiting for capability, capacity, recovery, retry, or evidence work.

## Safe projections {#safe-projections}

The query path verifies command identity, canonical hash, route/partition, source metadata, and the relevant state version. It distinguishes full state, compact terminal state, evidence-expired state, and pending state rather than inventing fields that are no longer retained.

Query results also retain the difference between business application and external publication:

```text
APPLIED Schedule -> Delayed Message state exists
PUBLISHING       -> a durable admission exists; producer outcome is pending
UNCERTAIN        -> side effect cannot yet be classified
PUBLISHED        -> capability-specific destination evidence exists
```

## Source anchors {#source-anchors}

- `docs/Nereus Delay V1 设计.md`, section 17.
- `docs/adr/0018-route-queries-by-receipt-and-read-through-a-source-barrier.md`.
- `docs/adr/0034-make-command-application-deterministic-under-replay.md`.
