---
title: "Example: Kafka transaction and DeleteRecords"
description: A Native Kafka ranged Produce, transaction-aware Fetch, leader takeover, and trim scenario.
sidebar_position: 4
product: nereus
source_repository: nereusstream/nereus
source_commit: c820391dc1de4229362ddf833487066c32609cba
last_verified: 2026-08-07
status: current-main
authority: reader-facing-summary
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline product="Nereus" repository="nereusstream/nereus" authority="reader-facing-summary" commit="c820391dc1de4229362ddf833487066c32609cba" verified="2026-08-07" />

# Example: Kafka transaction and DeleteRecords {#kafka-transaction-and-delete-records}

This example keeps Kafka’s protocol state separate from Nereus’s committed bytes.

## Initial state {#initial-state}

| Fact | Value |
| --- | --- |
| Topic ID / partition | `T1 / 0` |
| Binding stream | `S-kafka-1` |
| `logStartOffset` | `0` |
| Stable end / HW / LSO | `100 / 100 / 100` |
| Request | Open transaction, one RecordBatch with four records |

## Produce and transaction visibility {#produce}

1. KRaft confirms the current leader epoch.
2. Kafka validates producer ID, epoch, sequence, and transaction state.
3. Kafka assigns base offset `100`.
4. The adapter stores the complete RecordBatch as one ranged entry with `recordCount=4` and range
   `[100,104)`.
5. Nereus WAL and head commit; stable end becomes `104`.
6. Kafka records the open transaction in ProducerStateManager.
7. HW may advance to `104`, while LSO remains `100`.
8. Produce completes.

`READ_UNCOMMITTED` can read within HW. `READ_COMMITTED` cannot expose the open transaction until the
Kafka commit marker and transaction state advance LSO. Nereus supplies stable bytes/range; Kafka
decides transaction visibility.

## Broker takeover {#takeover}

The new leader obtains a higher KRaft epoch and Nereus append authority, hydrates an NKC1 checkpoint,
replays its covered tail to the current head, and rebuilds producer/transaction/virtual-segment state.
The old leader’s later head CAS is fenced. Any physical bytes it wrote without a commit do not advance
LEO.

## DeleteRecords to offset 60 {#delete-records}

1. Kafka retention publishes an NKC1 checkpoint covering the pre-trim state.
2. Nereus advances logical trim to `60`.
3. Binding and local log start become `60`.
4. Fetch below `60` returns Kafka out-of-range/trim semantics.
5. Objects and ledgers remain until source retirement and physical GC.

If the Broker is killed after trim, a new Broker reloads head, trim, and checkpoint. Retrying target
`60` does not publish a second checkpoint or modify the head again.

## Source anchors {#source-anchors}

- [`DefaultKafkaPartitionStorage.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-kafka-adapter/src/main/java/com/nereusstream/kafka/partition/DefaultKafkaPartitionStorage.java)
- [`Kafka checkpoint recovery`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-kafka-adapter/src/main/java/com/nereusstream/kafka/recovery/KafkaCheckpointRecoveryCoordinator.java)
- [`Kafka DeleteRecords coordinator`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-kafka-adapter/src/main/java/com/nereusstream/kafka/retention/KafkaDeleteRecordsCoordinator.java)
