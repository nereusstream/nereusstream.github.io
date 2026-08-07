---
title: CAS and the linearization point
description: How conditional metadata updates serialize append visibility.
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

# CAS and the linearization point {#cas-and-linearization-point}

## CAS in this context {#cas-definition}

Compare-and-set (CAS) means: update a metadata value only if it still equals an expected value. For a stream head, the expected version protects append order and prevents two writers from publishing incompatible successors.

```text
update head
where version == expectedVersion
to      version = expectedVersion + 1
```

The conditional update is not a general transaction over every provider key. It is the narrow serialization point for logical visibility.

## Why the head CAS is the linearization point {#linearization}

The system must choose one instant at which an append becomes part of the logical stream. Nereus uses the successful stream-head CAS for that purpose:

- before it: bytes may be durable, protected, or represented by a commit intent, but the range is not committed;
- after it: the range is part of the committed chain and must be visible to subsequent consistent reads;
- if the response is unknown: recovery resolves the exact request rather than guessing from provider bytes.

## CAS failure {#cas-failure}

A clear conditional failure means another writer advanced the head or the session is stale. The append must not overwrite the newer head. Recovery may inspect the commit chain and retry only when the exact operation is known to be safe.

## Why not one giant transaction? {#why-not-one-giant-transaction}

BookKeeper, object storage, and metadata have different durability and failure models. Requiring one cross-provider transaction would not remove uncertainty; it would hide the same failure cuts behind a larger protocol. A durable intent plus a narrow head CAS gives recovery a stable identity and keeps provider-specific work explicit.

## Source anchors {#source-anchors}

- [`docs/design/nereus-commit-protocol.md`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/design/nereus-commit-protocol.md)
- [`docs/phase-1-core-stream-storage/08-risk-register-and-design-compromises.md`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/phase-1-core-stream-storage/08-risk-register-and-design-compromises.md)
