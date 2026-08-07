---
title: "Example: BookKeeper sync Object timeout"
description: Why a producer timeout after head CAS is KNOWN_COMMITTED rather than a new append.
sidebar_position: 3
product: nereus
source_repository: nereusstream/nereus
source_commit: c820391dc1de4229362ddf833487066c32609cba
last_verified: 2026-08-07
status: current-main
authority: reader-facing-summary
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline product="Nereus" repository="nereusstream/nereus" authority="reader-facing-summary" commit="c820391dc1de4229362ddf833487066c32609cba" verified="2026-08-07" />

# Example: BookKeeper sync Object timeout {#bookkeeper-sync-object-timeout}

`BOOKKEEPER_WAL_SYNC_OBJECT` has a completion boundary beyond the logical head. That distinction is
visible when the required Object generation is slow.

## Scenario {#scenario}

The stream end is `200`, and the producer appends `[200,201)`:

1. The BookKeeper entry succeeds.
2. Head CAS succeeds; committed end is now `201`.
3. Generation-0 BK index is confirmed.
4. The required Object generation task starts.
5. Object Store is slow and the producer wait expires.

The true state is:

```text
logical message = committed
generation 0 = readable from BookKeeper
required Object generation = not yet confirmed
producer completion = timed out
AppendOutcome = KNOWN_COMMITTED
AppendAttemptId = original attempt
```

## Correct recovery {#recovery}

The producer or Broker must not write a second BK entry. Recovery reuses the stable append, exact BK
range, deterministic materialization task, and output identity. If the PUT actually completed, HEAD
and full verification reuse the same Object. After generation publication and read admission, the
original `AppendResult` can be reconstructed.

## Why head is not delayed {#why-head-is-not-delayed}

Waiting for Object completion before head CAS would create a second logical commit protocol whose
offset visibility depends on an Object response. The shared design keeps the head as the single
logical truth and lets each profile choose its producer completion boundary afterward.

## Source anchors {#source-anchors}

- [`RequiredObjectGenerationCompletion.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-core/src/main/java/com/nereusstream/core/append/RequiredObjectGenerationCompletion.java)
- [`RequiredObjectGenerationProof.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-core/src/main/java/com/nereusstream/core/append/RequiredObjectGenerationProof.java)
- [`Append outcomes`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-api/src/main/java/com/nereusstream/api/AppendOutcome.java)
