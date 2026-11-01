# ADR-010: Public accountability data and live refresh

- **Status:** Accepted
- **Date:** 2026-10-18
- **Deciders:** Project owner (witness names, design); Claude (data shape, refresh mechanism)
- **Related:** spec §6, §7, §9; FRONTEND_ROADMAP F3.1 to F3.7; BACKEND_ROADMAP B5.2, B5.3, B8.2, B8.3, B9.2, B9.3; ADR-002, ADR-003

## Context

F3 puts the full money trail on every public campaign page: witness confirmations, expenses with receipts, evidence photos, spent versus held, updates, and live figures. Several choices shape the API contract the backend will build to, and what the public can see. The spec doesn't settle them.

## Options considered

### Who confirmed a delivery

- **Option A: name the witness publicly** ("Confirmed by Ustadh Ibrahim Yusuf"). Pros: a named, respected person is the strongest trust signal, and it is what makes the witness independent in the donor's eyes. Cons: the witness's name becomes public, so they must agree to that when they're assigned.
- **Option B: anonymous** ("Confirmed by an independent witness"). Pros: no personal data on the page. Cons: weaker trust signal; donors can't tell who vouched.

### How "spent" reaches the page

- **Option A: derived on the page from the published expenses.** Pros: one source of truth; the figure always matches the expenses list. Cons: the API must send every expense (fine at MVP sizes).
- **Option B: a separate `spentAmount` field.** Pros: works with paginated expenses. Cons: two numbers that can disagree.

### Keeping figures live

- **Option A: poll every 15 seconds with TanStack Query while the tab is visible.** Pros: no new dependency; works with any backend; trivial to test. Cons: up to 15 seconds' delay; some wasted requests (reduced later with ETag, B5.3).
- **Option B: server-sent events.** Pros: instant. Cons: needs B5.3 server support that doesn't exist yet; harder to run through the service worker and proxies.

### Showing where a photo was taken

- **Option A: coordinates linking to OpenStreetMap.** Pros: no key, no script, nothing extra downloaded. Cons: the reader leaves the page to see the map.
- **Option B: a static map image.** Pros: visible in place. Cons: needs a map provider key and adds an image per photo on slow connections.

## Decision

- Witnesses are **named publicly**, with the date of their confirmation or dispute. A dispute always carries the witness's comment, and a disputed item is never shown as delivered: the contract rejects a response where the item's status and the confirmation disagree.
- **Spent is derived** from the published expenses (spec §6). The contract rejects expenses that add up to more than was raised, and the page refuses to show a negative balance.
- **Polling every 15 seconds** while the tab is visible, pausing when it is hidden, with an indicator of how fresh the figures are. On failure or offline, the last good figures stay with their time. Responses are held only in memory and never cached (ADR-002).
- **Coordinates with an OpenStreetMap link**, or "Location unavailable".
- The server upload time is the **authoritative time** on evidence and receipts ("Recorded by Amanah"); the phone's own time is shown only when it differs.

## Rationale

Trust is the product. A named witness, one spent figure that always reconciles, and figures that say how old they are all make the page harder to doubt, without adding dependencies or backend features that don't exist yet.

## Consequences

- Positive: the accountability page is fully demonstrable against the mock API; the contract is explicit for the backend (B5.2, B8.2, B8.3, B9.2, B9.3).
- Negative or risks: witnesses' names are public, so witness assignment (F9.2, B9.1) must tell the witness this and record their agreement. Polling costs a request every 15 seconds per open page until ETag support (B5.3) lands.
- Follow-up: F9.2 and B9.1 (witness consent to being named); B5.3 (ETag or SSE, after which this can be revisited); F4.1 (disable giving while the figures may be stale).
