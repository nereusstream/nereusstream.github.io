---
title: Native Kafka integration
description: The Native Kafka boundary that keeps KRaft and Kafka protocol state while replacing the partition data plane.
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

# Native Kafka integration {#native-kafka}

Native Kafka is a Kafka Broker fork path, not a Kafka request projected through Pulsar. The Kafka
client reaches the native Broker, `ReplicaManager`/`Partition`/`UnifiedLog` seams, the Nereus Kafka
adapter, and then `StreamStorage`. Kafka retains KRaft, leader, producer, transaction, consumer-group,
and internal-topic semantics; Nereus replaces the partition log’s durable data plane.

## Authority split {#authority-split}

| Authority | Owns |
| --- | --- |
| KRaft | Topic/partition metadata, leader and leader epoch, broker membership, ISR/reassignment, feature level, config history |
| Nereus/Oxia | `topicId + partition -> streamId` binding, append session, stream head, commit chain, generation index, profile, trim, physical references |
| Kafka internal topics | Consumer-group and transaction coordinator state in `__consumer_offsets` and `__transaction_state` |

The internal-topic bytes may use Nereus storage, but Oxia does not become a parallel coordinator truth.

## Partition binding and activation {#binding-activation}

The durable binding key is Kafka cluster identity plus `topicId + partition`. It records stream ID,
profile, lifecycle/incarnation, observed offsets, checkpoint references, and activation facts. An
observed offset accelerates startup only; the current Nereus head remains authoritative.

Cluster activation is a capability barrier:

1. Validate Kafka and Nereus configuration.
2. Establish Oxia, Object Store, and optional BookKeeper runtimes.
3. Exchange exact profile/capability digests among Brokers.
4. Let the KRaft controller aggregate the active Broker set and metadata snapshot.
5. Create or recover the Oxia activation record.
6. Wait for `ACTIVE`, readiness, and source-proof agreement.
7. Install the Nereus-backed log seams before allowing leader traffic.

Activation proves that the cluster understands the same durable contract; it is not a stream append
commit.

## Leader open {#leader-open}

When KRaft assigns a partition leader, the adapter resolves the binding, obtains an append session
with the KRaft leader authority, reads the stable stream head, validates the recovery checkpoint,
replays the committed tail, and rebuilds Kafka producer/transaction/epoch/index state. Only then is
the Nereus-backed log published as writable.

After leadership loss, the old Broker stops new admission. Provider completions are revalidated
against the KRaft authority and Nereus head CAS, so a stale leader cannot publish a logical append.

## LEO, HW, and LSO {#leo-hw-lso}

These offsets remain distinct:

- **LEO** is the next record offset and is backed by the stable Nereus append end.
- **HW** is Kafka’s consumer-visible replicated boundary; the initial Nereus model uses RF=1,
  with Kafka state advancing after a stable append and derived-state update.
- **LSO** is the `READ_COMMITTED` transaction boundary and may trail HW while a transaction is open.

Storage returns committed bytes and coverage. The Kafka adapter still applies HW, LSO, and aborted
transaction ranges before building a Fetch response.

## Initial compatibility boundary {#compatibility}

The current Native Kafka model is KRaft-only with RF=1 as the primary Nereus data-replica model.
Profile choice is immutable after stream creation; implicit stock-log/Nereus mixing and online local
log migration are not supported. Stock Kafka remote log/tiered storage is disabled for Nereus
partitions. Delete, compact, and compact+delete use the Nereus retention/materialization paths, while
consumer groups and transactions continue to use native internal topics.

## Source anchors {#source-anchors}

- [`KafkaPartitionStorage.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-kafka-adapter/src/main/java/com/nereusstream/kafka/partition/KafkaPartitionStorage.java)
- [`KafkaPartitionStorageManager.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-kafka-adapter/src/main/java/com/nereusstream/kafka/partition/KafkaPartitionStorageManager.java)
- [`Native Kafka storage contract`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/phase-9-kafka-native-storage/README.md)
