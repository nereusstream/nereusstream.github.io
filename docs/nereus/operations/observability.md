---
title: Observability
description: Metrics, typed outcomes, and diagnostic dimensions for append, read, materialization, GC, and adapters.
sidebar_position: 6
product: nereus
source_repository: nereusstream/nereus
source_commit: c820391dc1de4229362ddf833487066c32609cba
last_verified: 2026-08-07
status: current-main
authority: reader-facing-summary
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline product="Nereus" repository="nereusstream/nereus" authority="reader-facing-summary" commit="c820391dc1de4229362ddf833487066c32609cba" verified="2026-08-07" />

# Observability {#observability}

Metrics should reveal which correctness boundary or resource is limiting progress. Logs and error
messages provide context, but they are not state contracts; recovery uses typed errors, enums,
records, versions, and durable roots.

## Metric families {#metric-families}

| Area | Examples |
| --- | --- |
| Append | Primary-WAL latency, head-CAS latency/conflicts, generation-0/required-generation completion, outcome counts, fenced sessions, offset conflicts, retained attempts, suspended lanes |
| Read | Resolve latency, cache hit/miss, index-repair pages, candidate counts, pin/revalidation failures, payload/index bytes, same-view fallback, quarantines |
| Materialization | Lag records/bytes/age, task states, source count, staging spill, PUT/verification latency, publication CAS conflicts/response loss, checkpoint progress, retirement blockers |
| GC | Root counts by state, lease/protection vetoes, inventory pages/coverage, deletion response loss, orphan grace, BookKeeper late-create hazards, dry-run candidates, actual deletes |
| Protocol adapters | Pulsar binding/capability/owner handoff, cursor hydration/ack/snapshot, Kafka activation/open/replay, HW/LSO/logStart publication, mandatory internal-topic generation health |

Dimensions should keep stream/partition, profile, read view, generation, provider, and failure class
available without putting secrets or unbounded payload data into labels.

## Failure classification {#failure-classification}

Append metrics distinguish `KNOWN_NOT_COMMITTED`, `MAY_HAVE_COMMITTED`, and `KNOWN_COMMITTED`.
Read metrics distinguish repair, cache staleness, candidate rejection, provider failure, quarantine,
and trim/EOF outcomes. Materialization distinguishes source retirement, verification mismatch,
publication conflict, and retryable provider failure. GC distinguishes reference veto, root drift,
inventory incompleteness, and provider response loss.

The same typed classification must drive alerts and recovery. Do not infer “not committed” from a
message containing `timeout`, or infer a safe delete from a provider string such as `not found`.

## Source anchors {#source-anchors}

- [`AppendCoordinator.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-core/src/main/java/com/nereusstream/core/append/AppendCoordinator.java)
- [`ReadMetricsObserver.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-core/src/main/java/com/nereusstream/core/read/ReadMetricsObserver.java)
- [`MaterializationMetricsObserver.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-materialization/src/main/java/com/nereusstream/materialization/MaterializationMetricsObserver.java)
- [`PhysicalReadFailureKind.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-core/src/main/java/com/nereusstream/core/read/PhysicalReadFailureKind.java)
