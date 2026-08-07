---
title: Protocol Registry guide
description: How to use the Nereus Delay V1 Protocol Registry without treating the website summary as a wire contract.
sidebar_position: 3
product: nereus-delay
source_repository: nereusstream/nereus-delay
source_commit: 9281890f42772cc01b6b2b607fd93e31de64879b
source_paths:
  - docs/V1-PROTOCOL-REGISTRY.md
  - docs/README.md
last_verified: 2026-08-07
status: current-main
authority: linked-normative-source
spec_revision: V1-FROZEN-2026-08-01
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline product="Nereus Delay" repository="nereusstream/nereus-delay" authority="reader-facing-summary" commit="9281890f42772cc01b6b2b607fd93e31de64879b" verified="2026-08-07" />

# Protocol Registry guide {#protocol-registry-guide}

The [V1 Protocol Registry](https://github.com/nereusstream/nereus-delay/blob/9281890f42772cc01b6b2b607fd93e31de64879b/docs/V1-PROTOCOL-REGISTRY.md) is the normative numeric and byte-level contract for Nereus Delay V1. It applies only to `V1-FROZEN-2026-08-01`; unlisted enum values, tags, fields, and stable codes are unknown.

## What the Registry fixes {#what-the-registry-fixes}

- `NDL1` Shard Log framing, version, kind, length, and CRC32C boundary.
- Fixed-width integer and identity encodings.
- Canonical Protobuf field order, presence, enum validation, and round-trip bytes.
- Command and System Mutation envelopes, body hashes, and signature preimages.
- RocksDB Column Family key tags, widths, ordering, and checkpoint JSON.
- Stable result codes, retryability, uncertainty branches, and conformance vectors.

## How to read a website summary {#how-to-read-a-summary}

The product pages and concept pages explain why a boundary exists and how it relates to the end-to-end flow. They intentionally do not reproduce the complete Registry tables. For implementation, compatibility, or conformance work, open the pinned Registry commit and verify the exact field/value rule there.

## Conflict rule {#conflict-rule}

The Registry does not replace the design's business context, and prose does not authorize an unregistered wire extension. If the design, Registry, and accepted ADRs conflict, the V1 release gate fails until all affected artifacts are revised together.
