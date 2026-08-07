---
title: Index repair and fallback
description: How missing derived indexes and failed physical candidates are resolved safely.
sidebar_position: 6
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline commit="c820391dc1de4229362ddf833487066c32609cba" verified="2026-08-07" />

# Index repair and fallback {#index-repair-and-fallback}

## A missing index is not a missing message {#missing-index}

If an offset is below the committed end but its generation-0 index is absent, the logical record is already part of the committed stream. The resolver treats this as derived-state loss, not as a negative read result.

Repair starts at the current head anchor or a published recovery checkpoint, pages through reachable commits, verifies range and commit-version continuity, validates the exact target identity, and rebuilds the generation-0 index/replay marker within a bounded budget.

If the budget expires, the result is a retryable resolution failure. “Not found in this page” is never converted into `KNOWN_NOT_COMMITTED` or EOF.

## Candidate fallback {#candidate-fallback}

When a higher generation is missing, corrupt, or temporarily unavailable:

1. classify the physical error;
2. release the failed candidate's reader pin;
3. quarantine the exact generation/root when evidence is permanent;
4. fresh-resolve candidates in the same read view;
5. choose a lower healthy generation that still covers the requested range.

Fallback cannot cross `COMMITTED` and `TOPIC_COMPACTED`, use a retired/deleted target, ignore a checksum/identity failure, or bypass a mandatory Kafka compacted-generation coverage contract.

## Cache rules {#cache-rules}

Positive offset-index results may be cached and invalidated by metadata watch/version changes, TTL, physical failure, or failed pin revalidation. The cache does not own generation truth. A negative “no candidate” result is not kept indefinitely because head advancement or index repair can make the candidate appear later.

## Fresh resolve after physical failure {#fresh-resolve}

A stale target can hide a newly published generation. After a classified physical target failure, the read path clears the stream's offset-index cache and resolves without cache. If the candidate set is unchanged, it returns the same error or enters the permitted fallback/quarantine path.

## Source anchors {#source-anchors}

- [`GenerationReadResolver.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-core/src/main/java/com/nereusstream/core/read/GenerationReadResolver.java)
- [`ReadTargetDispatcher.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-core/src/main/java/com/nereusstream/core/read/ReadTargetDispatcher.java)
- [`docs/phase-4-compaction-generation/README.md`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/phase-4-compaction-generation/README.md)
