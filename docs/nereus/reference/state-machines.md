---
title: State machines
description: Quick reference for stream, generation, physical-root, and append-outcome state.
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

# State machines {#state-machines}

These compact machines show durable lifecycle boundaries. Workflow status does not automatically
change protocol visibility; the authority column remains decisive.

## Stream {#stream}

```mermaid
stateDiagram-v2
  [*] --> CREATING
  CREATING --> ACTIVE
  ACTIVE --> SEALED
  SEALED --> DELETING
  ACTIVE --> DELETING
  DELETING --> DELETED
```

`ACTIVE` permits append/read, `SEALED` permits historical read but blocks new append, `DELETING`
blocks new ordinary operations, and `DELETED` is the logical terminal state while physical GC may
continue.

## Higher generation {#higher-generation}

```mermaid
stateDiagram-v2
  [*] --> PREPARED
  PREPARED --> COMMITTED: generation-index CAS
  PREPARED --> ABORTED: preparation failure
  COMMITTED --> DRAINING: valid replacement supersedes
  COMMITTED --> QUARANTINED: identity or checksum failure
  DRAINING --> RETIRED: references and leases drain
  QUARANTINED --> RETIRED: evidence cleared or replacement proof
```

Only `COMMITTED` index publication makes a generation a reader candidate.

## Physical Object root {#object-root}

```mermaid
stateDiagram-v2
  [*] --> ACTIVE
  ACTIVE --> MARKED: complete reference snapshot
  MARKED --> ACTIVE: drift or new veto
  MARKED --> DELETING: drain and final proof
  DELETING --> DELETED: journaled delete and root CAS
  DELETED --> RETIRED: delayed audit absence
```

Object LIST discovers possible orphans but cannot authorize a transition. A deletion journal makes
`DELETING` restartable after process or response failure.

## Append outcome {#append-outcome}

```text
KNOWN_NOT_COMMITTED  -> safe to start a new attempt
MAY_HAVE_COMMITTED   -> recover the original attempt and suspend the stream lane
KNOWN_COMMITTED      -> do not append again; finish index/Object completion or return the result
```

The outcome describes commit certainty and is orthogonal to timeout, fencing, and metadata-unavailable
error codes.

## Source anchors {#source-anchors}

- [`StreamState.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-api/src/main/java/com/nereusstream/api/StreamState.java)
- [`GenerationLifecycle.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-metadata-oxia/src/main/java/com/nereusstream/metadata/oxia/records/GenerationLifecycle.java)
- [`PhysicalGcMarkStatus.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-materialization/src/main/java/com/nereusstream/materialization/gc/PhysicalGcMarkStatus.java)
- [`AppendOutcome.java`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/nereus-api/src/main/java/com/nereusstream/api/AppendOutcome.java)
