---
title: Why Nereus Delay?
description: The problem boundary and V1 goals for durable delayed-message scheduling.
sidebar_position: 1
product: nereus-delay
source_repository: nereusstream/nereus-delay
source_commit: 9281890f42772cc01b6b2b607fd93e31de64879b
source_paths:
  - README.md
  - docs/Nereus Delay V1 设计.md
last_verified: 2026-08-07
status: current-main
authority: reader-facing-summary
spec_revision: V1-FROZEN-2026-08-01
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline commit="9281890f42772cc01b6b2b607fd93e31de64879b" verified="2026-08-07" source="nereusstream/nereus-delay" />

# Why Nereus Delay? {#why-nereus-delay}

Applications often need a message to become eligible for a destination consumer no earlier than a business time. Kafka and Pulsar expose different producer, partition, delayed-delivery, and acknowledgement semantics. Nereus Delay provides a durable scheduling boundary above those systems while keeping the destination-specific evidence visible.

## V1 goals {#v1-goals}

- Accept immutable Schedule, Cancel, Reschedule, Payload Commit, and control commands through a durable Command Topic.
- Apply the complete Shard Log in source order to one RocksDB database per Delay Shard.
- Schedule destination work with persistent Destination Lanes, bounded fairness, retry policy, and lane-local failure isolation.
- Make query, cancellation, rescheduling, recovery, retention, and cleanup depend on explicit durable state.
- Avoid early delivery when the scheduler's trusted time is uncertain.

## The central boundary {#central-boundary}

`deliverAt` is a not-before visibility boundary. It is not a promise that publishing starts exactly at that instant or that a consumer receives the message at that instant. Backlog, target throttling, retries, Broker dispatch, and consumer availability can make delivery later.

The service also distinguishes a Command being queued from the Delay Shard authoritatively applying that Command. A Broker acknowledgement alone cannot prove that a delayed message exists.

## What this product does not promise {#what-this-product-does-not-promise}

Nereus Delay does not claim universal exactly-once delivery, global ordering, arbitrary per-message destination configuration, online migration between destinations, or release readiness while the external adapter and evidence gates remain incomplete. See [V1 non-goals](../reference/non-goals.md) and [current project status](../development/project-status.md).

## Related reading {#related-reading}

- [Architecture](./architecture.md)
- [Delivery time and action time](../concepts/delivery-time-and-action-time.md)
- [Authority order](../reference/authority-order.md)
