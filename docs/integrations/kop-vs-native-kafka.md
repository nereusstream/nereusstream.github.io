---
title: KoP versus Native Kafka
description: The two Kafka integration directions in Nereus and why their correctness boundaries differ.
sidebar_position: 4
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline commit="c820391dc1de4229362ddf833487066c32609cba" verified="2026-08-07" />

# KoP versus Native Kafka {#kop-vs-native-kafka}

Nereus has two Kafka-facing directions. They are not interchangeable and should not be described as
one execution path.

| Path | Request route | Protocol authority | Nereus integration boundary |
| --- | --- | --- | --- |
| KoP | Kafka client -> Kafka-on-Pulsar adapter -> Pulsar Broker/ManagedLedger -> Nereus | Pulsar Topic, ownership, Position, subscription, and its protocol projection | ManagedLedger facade and Pulsar cursor semantics |
| Native Kafka | Kafka client -> native Kafka Broker fork -> ReplicaManager/Partition/UnifiedLog -> Nereus Kafka adapter | KRaft Topic/partition, leader, producer, transaction, group, and Fetch/Produce semantics | Partition log storage, binding, checkpoint, and Kafka state reconstruction |

## Why the distinction matters {#why}

KoP can inherit the Pulsar projection and the one-Entry/one-offset mapping. Native Kafka must preserve
Kafka ranged RecordBatch entries, KRaft leadership, LEO/HW/LSO, transaction visibility, internal
topics, and native recovery. A design that is correct for the ManagedLedger facade is not automatically
correct for a Kafka `Partition`.

The shared Nereus core still owns protocol-neutral facts—stream head, commit intent, storage profile,
generation index, physical target identity, and recovery contracts. Each adapter owns its protocol
validation and final response assembly.

## Current scope {#scope}

The Native Kafka path is the active architecture described by the phase-9 contract. The KoP adapter
is kept as a separate module boundary and is not a shortcut for Native Kafka compatibility claims.
When documenting a feature, name the path explicitly and identify which authority owns the state.

## Source anchors {#source-anchors}

- [`nereus-kop-adapter`](https://github.com/nereusstream/nereus/tree/c820391dc1de4229362ddf833487066c32609cba/nereus-kop-adapter)
- [`nereus-kafka-adapter`](https://github.com/nereusstream/nereus/tree/c820391dc1de4229362ddf833487066c32609cba/nereus-kafka-adapter)
- [`Native Kafka storage contract`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/phase-9-kafka-native-storage/README.md)
