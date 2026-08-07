---
title: Non-goals
description: Explicit boundaries that prevent reserved interfaces or enum values from being mistaken for support.
sidebar_position: 2
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline commit="c820391dc1de4229362ddf833487066c32609cba" verified="2026-08-07" />

# Non-goals {#non-goals}

These are deliberate boundaries in the current architecture. They are not missing implementation
details that an adapter may safely infer.

## Storage and identity {#storage-and-identity}

- No online primary-WAL profile migration. The default changes new streams only; higher generations
  may change the preferred physical representation without changing the profile.
- No physical ID as protocol ID: BookKeeper ledger IDs do not enter Pulsar MessageId, Object keys do
  not become Kafka offsets, virtual ledger IDs do not reach BookKeeper clients, and local Kafka paths
  do not become stream identity.
- No cross-stream atomic append. Single-stream head CAS is the shared primitive; cross-stream
  transactions require a separate protocol.

## Correctness and recovery {#correctness-and-recovery}

- No Object LIST, watch, or cache as correctness authority. They are discovery or acceleration hints.
- No automatic business-level deduplication in L0. Append recovery prevents duplicate continuation of
  one uncertain attempt; producer-level dedup remains a Pulsar/Kafka protocol responsibility.
- No generation fallback across read views. `TOPIC_COMPACTED` cannot serve as ordinary `COMMITTED`
  fallback or vice versa.
- No physical delete authorized by one configuration switch. Durable capability, coverage,
  activation, root, reference, journal, and final revalidation are required.

## Native Kafka and external systems {#native-kafka-external}

- Native Kafka remains KRaft-only in the initial model, with RF=1 as the primary Nereus data-replica
  model; existing local logs cannot be migrated online.
- No implicit mixture of stock and Nereus partition logs after activation; stock remote log is disabled
  for Nereus partitions.
- Native Kafka and KoP mappings do not read one another’s projections.
- Lakehouse SBT/SDT, external catalogs, and table files may reference committed ranges and lineage,
  but catalog success/failure cannot change producer success, stream head, or ordinary reader truth.

## Source anchors {#source-anchors}

- [`StorageProfile.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-api/src/main/java/com/nereusstream/api/StorageProfile.java)
- [`Native Kafka storage contract`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/phase-9-kafka-native-storage/README.md)
- [`Future 4 compaction and generation`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/design/nereus-future4-compaction-generation.md)
