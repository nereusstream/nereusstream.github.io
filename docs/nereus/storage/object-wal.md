---
title: Object WAL
description: Immutable Object WAL layout, multi-stream slices, and physical root ownership.
sidebar_position: 2
product: nereus
source_repository: nereusstream/nereus
source_commit: c820391dc1de4229362ddf833487066c32609cba
last_verified: 2026-08-07
status: current-main
authority: reader-facing-summary
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline product="Nereus" repository="nereusstream/nereus" authority="reader-facing-summary" commit="c820391dc1de4229362ddf833487066c32609cba" verified="2026-08-07" />

# Object WAL {#object-wal}

## Immutable physical bytes {#immutable-bytes}

Object stores provide PUT, GET, HEAD, range read, and DELETE rather than an atomic appendable file. Nereus treats every successful Object WAL upload as immutable. Physical evolution writes a new key, metadata version, and generation; it never overwrites an object already referenced by a commit.

## Multi-stream slices {#multi-stream-slices}

One Object WAL object may pack slices for several streams to reduce small-object and PUT overhead:

```text
Object X
├── stream A slice
├── stream B slice
└── stream C slice
```

Each slice has its own commit and protection identity. A can be committed while B is fenced and C is still recovering. The existence of Object X does not make every slice logically visible.

## Object contents {#object-contents}

The format contains a fixed header, WAL header section, stream-slice directory, payload blocks, entry index, footer, and layered checksums. The entry index maps relative logical offsets to byte ranges inside the slice. The final logical offset is assigned when the head commits the append range; object encoding does not become the offset authority.

## Bytes, manifest, and physical root {#three-facts}

| Fact | Responsibility |
| --- | --- |
| Object bytes | Immutable provider content |
| Manifest | Format, length, slices, checksum, and audit metadata |
| Physical object root | Nereus lifecycle, deletion fencing, and root identity |

None of these facts alone proves that an offset is committed. The stream head and reachable commit chain remain the logical authority.

## GC consequence {#gc-consequence}

Object storage deletes whole objects, not individual slices. A trimmed stream A cannot authorize deletion of Object X while stream B still references X. GC therefore aggregates every reference domain before retiring the root.

## Source anchors {#source-anchors}

- [`docs/design/nereus-storage-object-format.md`](https://github.com/nereusstream/nereus/blob/c820391dc1de4229362ddf833487066c32609cba/docs/design/nereus-storage-object-format.md)
- [`nereus-object-store`](https://github.com/nereusstream/nereus/tree/c820391dc1de4229362ddf833487066c32609cba/nereus-object-store)
