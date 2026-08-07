---
title: Why Nereus?
description: Why protocol systems and shared stream storage need separate responsibilities.
sidebar_position: 1
product: nereus
source_repository: nereusstream/nereus
source_commit: c820391dc1de4229362ddf833487066c32609cba
last_verified: 2026-08-07
status: current-main
authority: reader-facing-summary
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline product="Nereus" repository="nereusstream/nereus" authority="reader-facing-summary" commit="c820391dc1de4229362ddf833487066c32609cba" verified="2026-08-07" />

# Why Nereus? {#why-nereus}

## Two systems solve two different problems {#two-responsibilities}

A messaging system must answer two groups of questions:

1. **Protocol questions:** what is a topic or partition, who is the leader, which consumer owns a subscription, what does a transaction mean, and which response is visible to a client?
2. **Storage questions:** where are durable bytes, which logical offsets are committed, how can a new broker recover them, and when can an old physical representation be reclaimed?

Pulsar and Kafka are responsible for the first group. Nereus supplies a shared answer to the second group without pretending that Pulsar and Kafka have the same protocol model.

## Shared storage means shared logical truth {#shared-logical-truth}

Nereus is not a new client protocol and it is not merely an object-store replacement. It is a storage layer below protocol-specific broker paths:

```text
Pulsar client  -> Pulsar broker  -> ManagedLedger / Pulsar adapter  ┐
                                                                     ├─> Nereus stream truth
Kafka client   -> Kafka broker   -> Native Kafka adapter              ┘
```

The shared part is the logical stream model: `streamId`, logical `offset`, committed head, physical targets, and recovery rules. The adapters still translate protocol-specific coordinates and state.

## What belongs to Nereus {#nereus-responsibilities}

Nereus owns:

- durable append and read operations over a stream;
- the commit chain and stream-head version CAS;
- offset-index and generation metadata used to resolve logical ranges;
- BookKeeper and Object WAL implementations;
- materialization, source protection, retention, and physical GC;
- recovery rules for uncertain outcomes and stale writers.

The broker remains responsible for protocol-facing topics, partitions, subscriptions, transactions, leader epochs, and client-visible responses. A physical provider is not allowed to become the authority for logical visibility merely because its I/O completed first.

## The key separation {#key-separation}

The same logical append may have several physical events:

1. a WAL write makes bytes durable;
2. a commit intent records a recoverable operation;
3. a stream-head CAS publishes the logical range;
4. a required profile-specific object or index becomes visible;
5. a later generation replaces a physical representation.

These events have different meanings and different recovery obligations. Keeping them separate is what lets Nereus support multiple storage profiles while preserving one logical coordinate system.

## Current boundary {#current-boundary}

The public site documents stable architecture and implementation contracts. It does not turn every internal Future, benchmark result, or development phase into a product promise. Current source status and migration coverage are tracked in [Project status](/docs/nereus/development/project-status).

## Related topics {#related-topics}

- [Architecture](/docs/nereus/overview/architecture)
- [Logical and physical coordinates](/docs/nereus/concepts/protocol-logical-physical-coordinates)
- [Primary WAL](/docs/nereus/concepts/primary-wal)
- [Document baseline](/docs/nereus/reference/document-baseline)
