---
title: Backpressure and timeouts
description: Admission limits, operation-wide deadlines, and cancellation behavior that preserve correctness.
sidebar_position: 5
product: nereus
source_repository: nereusstream/nereus
source_commit: c820391dc1de4229362ddf833487066c32609cba
last_verified: 2026-08-07
status: current-main
authority: reader-facing-summary
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline product="Nereus" repository="nereusstream/nereus" authority="reader-facing-summary" commit="c820391dc1de4229362ddf833487066c32609cba" verified="2026-08-07" />

# Backpressure and timeouts {#backpressure-and-timeouts}

Nereus has several independent bottlenecks: BookKeeper quorum, Object PUT/GET, Oxia CAS, generation-0
repair, materialization lag, staging resources, reader leases, cursor snapshots, and protocol
coordinator recovery. One global “busy” switch would let an unhealthy target stall unrelated streams.

## Admission domains {#admission-domains}

| Path | Admission facts |
| --- | --- |
| Append | In-flight append count, buffered bytes, retained uncertain attempts, per-stream lane, installed profile capability, materialization lag, activation, and session lifetime |
| Read | Concurrent physical reads, read-buffer bytes, range/candidate limits, repair scan budget, request timeout, and first-entry overflow policy |
| Materialization/GC | Global worker count, per-stream coalescing, staging budget, source/record/page bounds, operation deadline, and close deadline |

If a request can be rejected before provider I/O, reject it there; writing bytes that will become an
orphan is the expensive failure mode. Resource exhaustion returns an explicit backpressure error and
does not return a partial result as if it were a complete read.

Async profiles may reject new appends when materialization lag exceeds the configured bound. This
protects the primary WAL and does not roll back already committed ranges.

## One monotonic deadline {#monotonic-deadline}

An operation can cross metadata reads, provider I/O, HEAD verification, CAS, and revalidation. Each
step receives the remaining time from one monotonic deadline:

```text
operation deadline
  -> metadata read budget
  -> provider I/O budget
  -> identity verification budget
  -> CAS/revalidation budget
```

Refreshing the full timeout at every step would allow an operation to run without a bound. Child
operations must fail with the parent’s remaining budget and preserve enough context for recovery.

## Cancellation and drain {#cancellation}

Completing a caller Future does not prove that the provider operation stopped. For SDK operations that
cannot be cancelled, the runtime observes the source completion, returns permits, and classifies any
response-loss outcome. Close stops new admission, drains accepted work until its deadline, and uses
recoverable cancellation only after the bounded wait expires.

## Source anchors {#source-anchors}

- [`MaterializationLagGate.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-core/src/main/java/com/nereusstream/core/backpressure/MaterializationLagGate.java)
- [`ReadOperationDeadline.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-core/src/main/java/com/nereusstream/core/read/ReadOperationDeadline.java)
- [`AppendCoordinator.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-core/src/main/java/com/nereusstream/core/append/AppendCoordinator.java)
- [`Future 4 task recovery and checkpoint`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/phase-4-compaction-generation/04-task-recovery-async-and-checkpoint.md)
