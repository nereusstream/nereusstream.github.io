---
title: Kafka recovery and compaction
description: Recovery checkpoints, mandatory compacted coverage, DeleteRecords, and Kafka key compaction.
sidebar_position: 3
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline commit="c820391dc1de4229362ddf833487066c32609cba" verified="2026-08-07" />

# Kafka recovery and compaction {#kafka-recovery-and-compaction}

Kafka Broker state contains expensive derived structures: producer epochs and sequences, open
transactions, aborted ranges, leader epochs, virtual segments, and indexes. Nereus checkpoints make
restart bounded without replacing Kafka’s own metadata authority.

## NKC1 recovery checkpoint {#recovery-checkpoint}

The immutable checkpoint contains a stable-head anchor, producer/transaction state, virtual
segment/index state, exact coverage, and checksums. A Broker restart:

1. Reads the current Nereus head.
2. Chooses a checkpoint that does not lead the head.
3. Verifies the object, root, and binding reference.
4. Hydrates the checkpoint boundary.
5. Replays the committed tail to the current head.
6. Applies current durable trim.
7. Publishes the partition readable/writable.

The checkpoint accelerates replay; it cannot rewrite the stream head or internal-topic coordinator
truth.

## Mandatory compacted coverage {#mandatory-compacted-coverage}

`__consumer_offsets` and `__transaction_state` have key-compacted semantics. If a coordinator has
activated a compacted generation set, a missing or corrupt set cannot fall back to an ordinary
`COMMITTED` generation: old compacted-away values could be resurrected.

The activation constraint therefore verifies HEAD, CRC, ETag, full SHA, exact generation-set
identity, and coverage. Corruption quarantines the set and blocks coordinator open until the exact
bytes/root/index are repaired and coverage is activated again.

## DeleteRecords and retention {#delete-records}

Kafka’s logical deletion boundary is derived from DeleteRecords, retention time/bytes,
`cleanup.policy`, HW/segment rules, and the stock retention oracle. A consumer-group committed
offset is not a retention floor.

The durable sequence is:

```text
compute new logStartOffset
  -> publish pre-trim NKC1 checkpoint
  -> StreamStorage.trim(newStart)
  -> verify durable trim
  -> update binding observed log start and local canonical state
  -> run physical GC asynchronously
```

If the trim response is lost, a fresh Broker reloads head, trim, and checkpoint. Retrying the same
target is idempotent and must not create a second checkpoint or trim mutation.

## Kafka key compaction {#key-compaction}

Key compaction is semantic view generation, not a local segment swap:

1. Freeze closed virtual segments, HW, LSO, cleanup policy, and exact source generations.
2. Scan once to choose key winners, tombstones, and transaction/control handling.
3. Re-read the exact source set and emit sparse `NTC2` rows.
4. Guarded-PUT and fully verify the output.
5. Publish a `TOPIC_COMPACTED` generation.
6. Activate gap-free compacted coverage in the binding.
7. Read the compacted prefix from that view while the active tail remains in `COMMITTED`.

Tasks, plans, and staging files are workflow state. Final generation publication and binding coverage
activation decide what Fetch may use; a higher generation alone is not enough.

## Source anchors {#source-anchors}

- [`Kafka native storage contract`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/phase-9-kafka-native-storage/README.md)
- [`Kafka producer, transactions, compaction, and retention`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/phase-9-kafka-native-storage/05-producer-state-transactions-compaction-and-retention.md)
- [`Kafka binding, session, and checkpoint`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/phase-9-kafka-native-storage/04-oxia-binding-session-checkpoint-and-lifecycle.md)
