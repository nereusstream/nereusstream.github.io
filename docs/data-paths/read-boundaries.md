---
title: Read boundaries
description: Trim, EOF, entry-boundary, and size-limit rules for semantic reads.
sidebar_position: 5
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline commit="c820391dc1de4229362ddf833487066c32609cba" verified="2026-08-07" />

# Read boundaries {#read-boundaries}

## Logical boundaries {#logical-boundaries}

| Request position | Result |
| --- | --- |
| `offset < trimOffset` | `OFFSET_TRIMMED`; old physical bytes are not returned to a normal reader. |
| `trimOffset <= offset < committedEndOffset` | Resolve and read a committed range. |
| `offset >= committedEndOffset` | Normal EOF for the current snapshot. |

The stream lifecycle also matters: `ACTIVE` is readable/writable, `SEALED` is readable but cannot append, `CREATING` is normally retryable, and `DELETING`/`DELETED` reject or treat the stream as absent according to the adapter contract.

## Entry boundary modes {#entry-boundary-modes}

### `EXACT_START` {#exact-start}

The first returned entry must start at the requested logical offset. This is the normal Pulsar Entry behavior.

### `CONTAINING_ENTRY` {#containing-entry}

The first returned entry may contain the requested offset. For example, a Kafka ranged entry `[100,104)` can be returned when a fetch starts at 102; the adapter receives the complete RecordBatch and applies Kafka's semantic boundary without cutting its bytes into an invalid partial batch.

## Size limits and first entry policy {#size-limits}

The reader enforces `maxRecords` and `maxBytes`, but an indivisible first entry can itself exceed the limit. `FirstEntryPolicy` makes the behavior explicit:

- strict mode returns `READ_LIMIT_TOO_SMALL` if the first complete entry cannot fit;
- allow-first-overflow returns that one complete entry and stops.

The policy must be selected by the protocol adapter, not guessed by a provider reader.

## Continuous committed reads {#continuous-reads}

`COMMITTED` results must be logically dense: each next range starts at the previous range's end. A gap or overlap is a metadata/provider invariant violation. `TOPIC_COMPACTED` may be sparse, but it must report coverage so the caller knows which logical range has been processed.

## Source anchors {#source-anchors}

- [`ReadBoundaryMode.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-api/src/main/java/com/nereusstream/api/ReadBoundaryMode.java)
- [`FirstEntryPolicy.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-api/src/main/java/com/nereusstream/api/FirstEntryPolicy.java)
- [`docs/design/nereus-terminology.md`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/design/nereus-terminology.md)
