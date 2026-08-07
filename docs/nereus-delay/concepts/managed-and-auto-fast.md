---
title: Managed and AUTO_FAST delivery
description: The default managed branch and the explicit prepared native Pulsar branch.
sidebar_position: 4
product: nereus-delay
source_repository: nereusstream/nereus-delay
source_commit: 9281890f42772cc01b6b2b607fd93e31de64879b
source_paths:
  - CONTEXT.md
  - docs/Nereus Delay V1 设计.md
  - docs/adr/0002-require-opt-in-for-native-fast-delivery.md
  - docs/adr/0031-choose-auto-fast-before-io-and-return-a-receipt-union.md
last_verified: 2026-08-07
status: current-main
authority: reader-facing-summary
spec_revision: V1-FROZEN-2026-08-01
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline product="Nereus Delay" repository="nereusstream/nereus-delay" authority="reader-facing-summary" commit="9281890f42772cc01b6b2b607fd93e31de64879b" verified="2026-08-07" />

# Managed and AUTO_FAST delivery {#managed-and-auto-fast}

## Managed is the default {#managed-is-the-default}

`MANAGED` always enters the Command Topic and the Delay Shard state machine. It provides the server-side boundaries needed for query, applied results, cancellation, rescheduling, quota, audit, checkpoint, DLQ, and replay.

The managed branch is prepared before I/O. Its exact route, IDs, canonical bytes, hash, and retry boundary remain stable across physical enqueue retries.

## AUTO_FAST is explicit permission {#auto-fast-is-explicit}

`AUTO_FAST` means that the caller allows the SDK to choose between:

```text
ManagedPreparedCommand
NativePreparedDelivery
```

The choice occurs before any network I/O and returns a sealed, serializable prepared object. `submit()` accepts that exact object; a retry after a crash or uncertainty cannot silently choose a different branch.

The native branch is a certified Pulsar delayed-delivery handoff. It is bound to the exact Broker Resource Incarnation, resource guard, partition, capability, credential-binding generation, and trusted-time validity that were checked during preparation. A native receipt is not a managed Delayed Message receipt.

## No hidden fallback {#no-hidden-fallback}

Once native I/O begins, Nereus Delay does not automatically fall back to managed delivery. A prerequisite failure before Producer ownership can produce a typed definitely-not-queued result. A response loss after ownership is an uncertain native outcome and must reuse the original prepared identity/bytes.

Native delivery does not gain the managed branch's server query, cancel, reschedule, quota, or audit capabilities. Callers needing those controls use `MANAGED`.

## Source anchors {#source-anchors}

- `docs/Nereus Delay V1 设计.md`, sections 3.2 and 6.
- `docs/adr/0002-require-opt-in-for-native-fast-delivery.md`.
- `docs/adr/0031-choose-auto-fast-before-io-and-return-a-receipt-union.md`.
