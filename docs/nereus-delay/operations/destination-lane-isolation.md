---
title: Destination Lane isolation
description: How Nereus Delay isolates target destinations, fairness, retries, and unresolved publish work.
sidebar_position: 1
product: nereus-delay
source_repository: nereusstream/nereus-delay
source_commit: 9281890f42772cc01b6b2b607fd93e31de64879b
source_paths:
  - docs/Nereus Delay V1 设计.md
  - docs/adr/0008-isolate-destination-lanes-from-command-application.md
  - docs/adr/0032-use-two-level-bounded-deficit-round-robin.md
last_verified: 2026-08-07
status: current-main
authority: reader-facing-summary
spec_revision: V1-FROZEN-2026-08-01
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline commit="9281890f42772cc01b6b2b607fd93e31de64879b" verified="2026-08-07" source="nereusstream/nereus-delay" />

# Destination Lane isolation {#destination-lane-isolation}

A Destination Lane is a stable, bounded group of messages within one Delay Shard that share destination, tenancy, and Ordering Domain characteristics. It is the unit for publish fairness, capacity, retry, circuit state, and fault isolation.

It is not an ownership unit, checkpoint unit, or recovery unit. Those remain scoped to the Delay Shard.

## Lane identity {#lane-identity}

V1 derives a Lane ID from a canonical tuple including tenant routing scope, adapter kind, authenticated target cluster, Broker Resource Incarnation, physical topic and partition, Destination Profile version, Ordering Domain or unordered bucket, and Delivery Capability Profile. The tuple uses Registry-defined encoding and a domain-separated hash; display names and delimiter strings are not identity.

If a Lane is closed, broken, or retired, a compact terminal guard prevents the same tuple from silently reopening. Continued traffic must use a new Profile, Ordering Domain, or Broker Resource Incarnation and therefore a new Lane identity.

## Command application stays independent {#command-application-stays-independent}

Destination failure must not pause the Shard Log or block unrelated Lanes. Commands continue to apply through the local state machine while the affected Lane records its own retry, circuit, capacity, evidence, and readiness state.

## Fairness and work classes {#fairness-and-work-classes}

V1 uses bounded weighted deficit round robin at the Lane and Worker levels. Scheduler counters and ready projections are persisted and rebuilt with identity, generation, digest, and owner checks. Recovery starts with a bounded first pass so one newly restored Lane cannot monopolize all work.

Admission, retry, and uncertainty are distinct work classes. An unresolved publish obligation remains attached to its exact generation and attempt evidence; it cannot be replaced by an unrelated retry that hides possible duplication.

## Capability boundaries {#capability-boundaries}

Baseline `AT_LEAST_ONCE` allows bounded retries and possible duplicates. Kafka transactional receipt and Pulsar Broker dedup capabilities are opt-in and require all registered prerequisites. Capability drift blocks Lane readiness rather than silently downgrading the guarantee.

## Source anchors {#source-anchors}

- `docs/Nereus Delay V1 设计.md`, sections 12, 13, and 15.
- `docs/adr/0008-isolate-destination-lanes-from-command-application.md`.
- `docs/adr/0032-use-two-level-bounded-deficit-round-robin.md`.
