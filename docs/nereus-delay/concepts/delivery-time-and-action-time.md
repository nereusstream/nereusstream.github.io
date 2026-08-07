---
title: Delivery time and action time
description: The not-before visibility boundary, earliest destination action, and trusted UTC interval.
sidebar_position: 1
product: nereus-delay
source_repository: nereusstream/nereus-delay
source_commit: 9281890f42772cc01b6b2b607fd93e31de64879b
source_paths:
  - CONTEXT.md
  - docs/Nereus Delay V1 设计.md
  - docs/adr/0001-define-deliver-at-as-earliest-consumer-visibility.md
last_verified: 2026-08-07
status: current-main
authority: reader-facing-summary
spec_revision: V1-FROZEN-2026-08-01
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline commit="9281890f42772cc01b6b2b607fd93e31de64879b" verified="2026-08-07" source="nereusstream/nereus-delay" />

# Delivery time and action time {#delivery-time-and-action-time}

## Delivery time (`deliverAt`) {#deliver-at}

`deliverAt` is a UTC Unix epoch-millisecond boundary: the earliest instant at which a destination consumer may become eligible to receive a delayed message. It is not publish start time, send time, execution time, or an exact-time visibility guarantee.

The message may become visible later because of Lane backlog, target throttling, retries, Broker dispatch, or consumer availability.

## Action time (`actionAt`) {#action-at}

`actionAt` is the earliest instant at which Nereus Delay may start the destination action needed to satisfy `deliverAt`.

- Kafka managed delivery uses `actionAt = deliverAt`.
- Pulsar ordinary managed delivery also waits for the delivery boundary before sending.
- A certified Pulsar delayed handoff may begin earlier only after applying the fixed target clock ahead bound so the Broker cannot make the message visible before `deliverAt`.

## Trusted UTC interval {#trusted-utc-interval}

The scheduler derives a bounded estimate `[earliestUtcNow, latestUtcNow]` from monitored clock synchronization and monotonic elapsed time. The decision is fail-closed:

```text
allow Publish Admission  only when latestUtcNow < expireAt
declare expired         only when earliestUtcNow >= expireAt
otherwise               pause without Admission or early EXPIRED
```

Clock uncertainty can therefore make delivery later, but cannot authorize early publication or premature expiration.

## `expireAt` is a durable admission boundary {#expire-at}

`expireAt` is the latest time for a new Publish Admission to be durably persisted and qualify. It is not a fresh Worker wall-clock sample and it does not revoke an already admitted operation. If an Admission was persisted inside its boundary but is applied later because of source lag or replay, the same durable attempt must be reconstructed.

For a first Schedule or successful Reschedule, V1 validates timing against the Command's Broker persistence time `bp`:

```text
expireAt >= max(deliverAt, bp) + minDeliveryWindow
deliverAt <= bp + maxDelayHorizon
expireAt  <= bp + maxMessageLifetime
```

## What this does not mean {#what-this-does-not-mean}

`deliverAt` is not a Scheduler tick, an SLO for consumer processing, or permission to recalculate the target from current Broker metadata. The exact formulas and allowed ranges are fixed by the V1 design and Registry-backed configuration.
