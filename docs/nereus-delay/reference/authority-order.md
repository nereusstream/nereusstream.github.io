---
title: Authority order
description: Which Nereus Delay source controls semantics, bytes, architecture decisions, status, audit, and terminology.
sidebar_position: 2
product: nereus-delay
source_repository: nereusstream/nereus-delay
source_commit: 9281890f42772cc01b6b2b607fd93e31de64879b
source_paths:
  - docs/README.md
  - docs/Nereus Delay V1 设计.md
  - docs/V1-PROTOCOL-REGISTRY.md
  - docs/adr/README.md
  - docs/IMPLEMENTATION-STATUS.md
  - docs/V1-DESIGN-AUDIT.md
  - CONTEXT.md
last_verified: 2026-08-07
status: current-main
authority: authority-index
spec_revision: V1-FROZEN-2026-08-01
---

import DocBaseline from '@site/src/components/DocBaseline';

<DocBaseline product="Nereus Delay" repository="nereusstream/nereus-delay" authority="reader-facing-summary" commit="9281890f42772cc01b6b2b607fd93e31de64879b" verified="2026-08-07" />

# Authority order {#authority-order}

When a website summary conflicts with a product source, the summary is wrong and must be corrected. The V1 repository defines this order:

1. **`docs/Nereus Delay V1 设计.md`** — V1 semantics, lifecycle, recovery, resource, security, and acceptance baseline.
2. **`docs/V1-PROTOCOL-REGISTRY.md`** — exact wire fields, enum values, canonical bytes, key tags, stable codes, and union/presence rules.
3. **`docs/adr/`** — accepted architecture decisions and the reasons for them.
4. **`docs/IMPLEMENTATION-STATUS.md`** — current code and test evidence plus remaining release blockers. It cannot relax the design.
5. **`docs/V1-DESIGN-AUDIT.md`** — cross-document drift and release-evidence view. It is not a new protocol authority.
6. **`CONTEXT.md`** — fixed terminology and forbidden substitutions. It does not add protocol semantics.

## Website policy {#website-policy}

The website keeps a fixed source commit, verification date, and authority label on every Delay page. It summarizes reader-facing concepts and links to the exact repository material for normative details. A future full Registry mirror would need automated content and hash verification; manual copying is not a second source of truth.

## Status versus semantics {#status-versus-semantics}

An implementation-status row can say that a codec or local projection exists; it cannot turn a missing production Broker adapter, Oxia authority, or release-evidence artifact into a V1 guarantee. The public state remains `V1 in development` until the release gates are satisfied.
