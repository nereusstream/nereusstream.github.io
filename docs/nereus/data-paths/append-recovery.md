---
title: Append recovery
description: The bounded recovery procedure for an append whose result is uncertain.
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

# Append recovery {#append-recovery}

## Recovery preserves identity {#preserve-identity}

Recovery is not a fresh append. It waits for the original mutation runner to stop, reuses the original append identity, and resolves whether the existing operation is committed. It must not allocate a new offset, Object key, or BookKeeper range while the first result is uncertain.

## Bounded procedure {#procedure}

1. Read the current stream head.
2. If the head still ends at the original expected start, reuse the original commit intent and physical target and attempt the original publication.
3. If the head has advanced, page through the reachable commit chain or a recovery checkpoint looking for the exact attempt identity.
4. If found, reconstruct the same `AppendResult` and continue any profile-specific completion.
5. If the evidence proves the attempt did not commit, return `KNOWN_NOT_COMMITTED` and release the lane.
6. If the evidence is incomplete, retain `MAY_HAVE_COMMITTED` and continue bounded retry or expose the recovery handle.

## Pagination and timeout are part of correctness {#bounded-search}

The commit chain can be large. Recovery uses a maximum scan, page size, continuation cursor, and an overall timeout. Exhausting a page budget means “not resolved within this budget”, not “not committed”. The caller receives a retryable resolution failure rather than a false negative.

## Recovery after head commit {#after-head-commit}

If head CAS succeeded but generation-0 index or required Object completion failed, the outcome is `KNOWN_COMMITTED`. The offset is already visible in logical truth. Recovery reuses the same committed range and deterministic materialization task; it does not write another WAL record or roll back the head.

## Stale owner fencing {#stale-owner}

Session epoch and token are checked again during recovery. A new owner may complete an old attempt only through the exact identity and current authority rules. An old owner cannot regain write authority by replaying a saved success callback.

## Source anchors {#source-anchors}

- [`AppendCoordinator.startRecovery`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-core/src/main/java/com/nereusstream/core/append/AppendCoordinator.java)
- [`MetadataAppendRecoverySearcher.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-core/src/main/java/com/nereusstream/core/append/MetadataAppendRecoverySearcher.java)
- [`docs/phase-1-core-stream-storage/09-legacy-oxia-multi-key-commit-design.md`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/phase-1-core-stream-storage/09-legacy-oxia-multi-key-commit-design.md)
