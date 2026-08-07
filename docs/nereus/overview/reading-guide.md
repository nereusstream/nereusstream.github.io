---
title: Reading guide
description: The dependency order for understanding Nereus architecture and end-to-end flows.
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

# Reading guide {#reading-guide}

The architecture source is intentionally read in dependency order. Following the order prevents `generation`, `cursor`, or GC state from appearing as unexplained implementation vocabulary.

## Recommended route {#recommended-route}

1. [Why Nereus?](/docs/nereus/overview/why-nereus) establishes the protocol/storage boundary.
2. [Architecture](/docs/nereus/overview/architecture) identifies layers and authorities.
3. [Stream, record, entry, and offset](/docs/nereus/concepts/stream-record-entry-offset) defines the common coordinate model.
4. [Logical and physical coordinates](/docs/nereus/concepts/protocol-logical-physical-coordinates) explains adapter mapping.
5. [Primary WAL](/docs/nereus/concepts/primary-wal) separates durability from visibility.
6. [Stream head and commit chain](/docs/nereus/concepts/stream-head-and-commit-chain) defines the logical commit point.
7. [CAS and linearization](/docs/nereus/concepts/cas-and-linearization-point) explains concurrency and recovery.
8. [Read targets and offset indexes](/docs/nereus/concepts/read-target-and-offset-index) connects logical ranges to bytes.

The next migration stages continue with append outcomes, storage profiles, generation lifecycle, reads, Pulsar, Native Kafka, materialization, retention, failure, observability, security, examples, and reference maps.

## Three review questions {#review-questions}

When reading any Nereus state or field, ask:

- Is it describing logical stream data or a physical representation?
- Is it an authority or a repairable projection?
- If a response was lost, what exact identity lets recovery distinguish the same operation from a retry?

These questions are part of the documentation review standard. They are more reliable than inferring semantics from a class name or a successful provider call.
