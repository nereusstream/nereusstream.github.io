---
title: Stream, record, entry, and offset
description: The common logical coordinate model used by Nereus adapters.
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

# Stream, record, entry, and offset {#stream-record-entry-offset}

## Why provider coordinates are not enough {#why-provider-coordinates-are-not-enough}

Pulsar ledgers and Kafka segments are useful physical or protocol structures, but neither is a universal coordinate for a storage layer shared by both systems. A broker can roll a ledger, replace an object, or change a Kafka segment boundary without changing the logical stream range.

Nereus therefore names the logical stream explicitly and treats provider coordinates as physical targets behind that model.

## Definitions {#definitions}

| Term | Meaning in Nereus |
| --- | --- |
| `stream` | The append-only logical sequence owned by one storage profile and one lifecycle. |
| `record` | The smallest logical unit that consumes one Nereus offset. |
| `entry` | An indivisible physical/protocol payload submitted to a provider. |
| `batch` | A group of entries submitted by one API operation. |
| `offset` | A logical position in a stream, represented as a half-open range for reads and writes. |

The mapping from an entry to records is protocol-specific. Nereus does not force Pulsar and Kafka to pretend that their batches have the same shape.

## Offset ranges are half-open {#half-open-ranges}

An append or read range uses:

```text
[startOffset, endOffset)
```

The start is included and the end is excluded. This makes adjacent ranges composable and allows a committed head to be represented as the first offset after the committed data.

## Pulsar mapping {#pulsar-mapping}

For the Pulsar projection, one complete Entry is the normal unit mapped to one Nereus offset. The adapter preserves the stable `MessageId`/`Position` relationship while storing the logical range below it.

Batch-message details can require a projection of sub-message acknowledgement state; they do not change the stream's logical append order.

## Kafka mapping {#kafka-mapping}

For Native Kafka, one `RecordBatch` is represented as a ranged entry. A single physical entry can therefore cover multiple Kafka offsets. The adapter validates Kafka batch boundaries and maps the range to `streamId + offset` without making the Kafka segment identity part of the core coordinate.

## What this model is not {#not-this}

- `offset` is not a BookKeeper entry ID.
- `offset` is not an object byte position.
- `entry` is not always one record.
- A higher physical generation does not contain newer logical messages; it is another representation of an existing range.

## Source anchors {#source-anchors}

- [`docs/design/nereus-terminology.md`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/design/nereus-terminology.md)
- [`docs/phase-9-kafka-native-storage/02-ranged-entry-api-and-object-format.md`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/phase-9-kafka-native-storage/02-ranged-entry-api-and-object-format.md)
