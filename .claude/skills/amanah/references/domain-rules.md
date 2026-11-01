# Amanah domain rules

Source of truth: `docs/amanah-mvp-spec.md`. This file condenses the rules an implementer must not get wrong. If this file and the spec disagree, the spec wins — flag the mismatch.

## Contents

1. Money
2. The donation cap (spec §4)
3. Campaign lifecycle (spec §5)
4. Roles and access (spec §3)
5. Evidence and witnesses (spec §7)
6. Privacy (spec §9, NDPA)
7. Copy and terminology
8. Open decisions and their defaults (spec §11)

---

## 1. Money

- Unit: **kobo**, integer. ₦1 = 100 kobo. ₦500,000 = `50_000_000`.
- API fields are kobo integers (`targetAmount`, `raisedAmount`, `availableAmount`). Zod schema: `z.number().int().nonnegative()`.
- Display: `formatNaira(kobo)` → `₦500,000` (whole) or `₦1,500.50`.
- Input: `parseNairaToKobo(text)` → kobo or `null`. Accepts `1500`, `1,500`, `₦1,500.50`; rejects anything else.
- Progress: `progressPercent(raised, target)` → floored, clamped integer 0–100.
- Item totals: `total_cost = quantity × unit_cost` (integers). **Sum of item totals must equal `target_amount`.**
- Derived values on the accountability page:
  - Remaining to raise = `target − raised`
  - Spent = Σ expenses
  - Balance held = `raised − spent`
  - Progress = `raised / target`
- Total expenses can never exceed `raised`.

## 2. The donation cap (spec §4)

The organisation may never receive more than its target.

- `available = target − raised − active reservations`. The API returns it as `availableAmount`; the frontend never recomputes it from stale data.
- Checkout creates a **reservation** (default TTL 15 min, D6) inside a locked DB transaction; the reservation ID is the payment reference.
- Over-remaining (D1 default: **offer the remaining amount**): API returns `409 AMOUNT_EXCEEDS_AVAILABLE` with `availableAmount` → UI offers "Give ₦X instead" / Cancel.
- `409 TARGET_REACHED` when `available == 0`; `409 CAMPAIGN_NOT_ACCEPTING` when not LIVE.
- Confirmation only via verified webhook. The result page polls `GET /api/donations/:reference` and **never claims success before the backend confirms**.
- Late payment beyond target → `ExcessRecord` (PENDING_RETURN → RETURNED or SENT_TO_BAYT_AL_MAL), handled manually by a platform admin.

### Donate panel UI states (exact)

| Condition                              | Button                   | Copy                                                           |
| -------------------------------------- | ------------------------ | -------------------------------------------------------------- |
| `available > 0` and status LIVE        | Enabled, shows remaining | "₦X remaining"                                                 |
| `available == 0` and `raised < target` | Disabled                 | "Target nearly reached. Pending payments are being processed." |
| status FUNDED                          | Disabled permanently     | "Target reached. Donations closed."                            |
| CLOSED / COMPLETED / not LIVE          | Disabled                 | Status-appropriate message                                     |
| Offline                                | Disabled                 | Offline explanation                                            |

## 3. Campaign lifecycle (spec §5)

```
DRAFT → PENDING_REVIEW → LIVE → FUNDED (automatic at target) → COMPLETED
              ↓            ↓
          REJECTED       CLOSED (org ends early / end date) → COMPLETED
              ↓
            DRAFT
```

- Only `LIVE` accepts donations.
- Expenses, evidence and witness confirmations allowed in `LIVE`, `FUNDED`, `CLOSED`.
- `target_amount` is **immutable after the first donation** (and title/purpose/items too if D8 purpose lock is approved — not yet).
- Only a `VERIFIED` organisation can submit a campaign.
- The UI only offers transitions the diagram allows for the current role.

## 4. Roles and access (spec §3)

| Role                           | Area         | Can                                                                                   |
| ------------------------------ | ------------ | ------------------------------------------------------------------------------------- |
| Donor (guest, no account — D7) | public       | browse, donate, view accountability                                                   |
| `ORG_ADMIN`                    | `/org/*`     | own organisation only: campaigns, expenses, evidence, updates, witnesses, close early |
| `WITNESS`                      | `/witness/*` | assigned campaigns only: confirm or dispute delivery                                  |
| `PLATFORM_ADMIN`               | `/admin/*`   | verify orgs, review campaigns, resolve excess, read audit log                         |

- A witness **cannot** be an admin of the organisation running the campaign (`409 WITNESS_CONFLICT`).
- Protected pages render no data before the session is confirmed; wrong role → 403 page.
- Tokens/sessions never in localStorage.

## 5. Evidence and witnesses (spec §7)

- Capture with `<input type="file" accept="image/*" capture="environment">` + Geolocation API; record client capture time.
- **Server upload time is authoritative** — label it as such in the UI; show client time only as secondary.
- Compress client-side (≈1600px long edge, < 400 KB) before upload; slow networks are the norm.
- Location denied is allowed — show "location unavailable", don't block.
- Honest limitation: a browser can't prove a photo came from the camera. Trust signal = location + server timestamp + witness confirmation. Never claim more in copy.
- A **disputed** item can never be shown or marked as delivered. Dispute requires a comment.

## 6. Privacy (spec §9, Nigeria Data Protection Act)

- Collect only name, email, phone at checkout.
- Public pages and public API responses never include donor email or phone.
- Anonymous giving toggle only if D8 approves it.

## 7. Copy and terminology

- British spelling ("organisation", "colour"); Nigerian context (₦, `en-NG`, Africa/Lagos time).
- Tone: calm, dignified, plain. Trust is earned by precision, not superlatives. No guilt-tripping donors, no exaggerated impact claims.
- Never: zakat, zakah, waqf, awqaf (out of scope permanently).
- Islamic terms already in the spec: Amanah, Sharia, riba, Bayt al-Mal (excess handling). Confirm with the team before introducing any other religious terminology.

## 8. Open decisions (spec §11) — defaults in use

| ID  | Topic                                                         | Default (until the team decides)                   |
| --- | ------------------------------------------------------------- | -------------------------------------------------- |
| D1  | Over-remaining donation                                       | Offer remaining amount                             |
| D2  | Witness channel                                               | In-app                                             |
| D3  | Payment provider                                              | Paystack test mode                                 |
| D4  | Settlement                                                    | Record only                                        |
| D5  | Stack                                                         | Frontend ADR-001/006. Backend ADR-004 (FastAPI)    |
| D6  | Reservation TTL                                               | 15 min                                             |
| D7  | Donor accounts                                                | Guest only                                         |
| D8  | Purpose lock, no riba, permissible purposes, anonymous giving | **None** until approved — don't build them         |
| D9  | Scholarly advisor / excess ruling                             | Placeholder                                        |
| D10 | End dates                                                     | Optional                                           |
| D11 | Email receipts                                                | Placeholder — on-screen receipt is always required |

Changing any default needs the user's decision and an ADR.
