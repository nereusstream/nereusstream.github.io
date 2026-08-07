---
title: Append outcomes
description: Why append errors must distinguish whether logical publication is known.
sidebar_position: 2
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline commit="c820391dc1de4229362ddf833487066c32609cba" verified="2026-08-07" />

# Append outcomes {#append-outcomes}

## Error is not commitment certainty {#certainty}

An error code explains why an operation did not return normally. It does not always say whether the logical append committed. Nereus exposes that second dimension explicitly as `AppendOutcome`.

| Outcome | Meaning | May the caller create a new physical append? |
| --- | --- | --- |
| `KNOWN_NOT_COMMITTED` | The attempt is proven not to have advanced the stream head. | Yes, after the lane is released. |
| `MAY_HAVE_COMMITTED` | A mutation may have applied, but the response was lost or the state is not yet resolved. | No. Recover the same attempt first. |
| `KNOWN_COMMITTED` | The head is known to include the attempt; a later index/object completion failed or timed out. | No. Resume completion/recovery for the same append. |

Examples:

- profile/capability validation before WAL I/O → `KNOWN_NOT_COMMITTED`;
- head CAS sent and response lost → `MAY_HAVE_COMMITTED`;
- head committed but required Object generation timed out → `KNOWN_COMMITTED`.

## `AppendAttemptId` {#append-attempt-id}

When certainty is unavailable, the core returns an `AppendAttemptId` that identifies the exact recovery handle for the original batch, physical target, commit request, and stream lane. It is not a permanent business message ID and not a producer deduplication key.

Kafka PID/epoch/sequence/transaction state and Pulsar producer deduplication remain protocol responsibilities. Nereus prevents a single storage attempt from being duplicated during recovery; it does not deduplicate two intentionally different business attempts.

## Why the lane suspends {#lane-suspension}

If append A might cover `[100,104)`, the next append cannot safely choose 100 or 104 until A converges. The per-stream lane therefore suspends B and C. A bounded recovery operation resolves A, then releases the lane with the determined result.

Suspension is a correctness boundary, not a performance optimization. Letting later writes pass an uncertain predecessor would create gaps, duplicate ranges, or an irreversible ambiguity in the commit chain.

## Source anchors {#source-anchors}

- [`AppendOutcome.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-api/src/main/java/com/nereusstream/api/AppendOutcome.java)
- [`StreamStorage.recoverAppend`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-api/src/main/java/com/nereusstream/api/StreamStorage.java)
- [`docs/design/nereus-commit-protocol.md`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/design/nereus-commit-protocol.md)
