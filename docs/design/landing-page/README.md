# Landing page design

- **Status:** The modern redesign was approved by the project owner on 2026-10-18 and replaces the first approved design ("the open ledger", in git history before this change).
- **Canvas (live, editable):** https://claude.ai/artifact/FCJs8QR2Pp9VkjWsyBR3Nt. Boards "Modern: desktop" and "Modern: mobile (390px)". It's private: the owner shares it from the canvas's Share menu.
- **Source snapshot:** [`landing-page.dc.html`](./landing-page.dc.html), the "Modern: desktop" board at approval time. The canvas is the source of truth if the two differ.
- **Roadmap:** F2.6, the public landing page.

## Concept: "the open courtyard"

A light, open page (white and soft off-white) with deep green as the anchor colour and gold used sparingly. No gradients, and no shadow under every card. The Islamic character comes from two motifs used with restraint:

- **The mihrab arch**, the same shape as the logo: the hero's "window", the step-number tiles and the witness icon tile.
- **The eight-point star (khatam) lattice**, in thin gold lines: inside the hero arch and on the organisations panel only.

أمانة appears twice: at the crown of the hero arch and beside the large wordmark in the footer.

## Tokens used

| Role                           | Token                                                                            |
| ------------------------------ | -------------------------------------------------------------------------------- |
| Page                           | white; section bands `mist-50`                                                   |
| Headings                       | `brand-950`                                                                      |
| Anchor (arch, buttons, panels) | `brand-900`; progress and success `brand-700`                                    |
| Mint surfaces                  | `brand-150` (badge, photo card), `brand-300` (photo tile, outline border)        |
| Accent                         | `gold-500`, sparingly: أمانة, the lattice, step 5, the organisations button      |
| Dark                           | `ink-900` cap panel; `brand-950` footer                                          |
| Text                           | `ink-900`, `ink-650` (nav, trust points), `ink-600` (body), `ink-500` (captions) |
| Type                           | Schibsted Grotesk 400–800; Reem Kufi 700 for أمانة only (ADR-007)                |

## Sections (top to bottom)

1. Header on white: logo, four section links, "Register your organisation" (outline) and "Give now".
2. Hero: badge "Verified Islamic organisations in Nigeria", the headline, a one-sentence intro, "Browse campaigns" and "See how it works", three trust points. On the right, the arch window with أمانة, the example campaign card overlapping it, the "Witness confirmed delivery" tag and the meaning of Amānah underneath.
3. Raising now: up to three campaign cards (cover photo with city, title, verified organisation, progress, how much is left or the funded state, and one action), with "See all campaigns". Live campaigns first, then funded ones. Desktop shows a row; phones scroll the cards sideways. Data comes from the API; the section renders nothing while loading, on error or when there are no campaigns, so the live site never shows placeholder campaigns.
4. Statement: "Most giving ends at the payment. On Amanah, it ends at the delivery."
5. Accountability as a grid of cards: raised/spent/held, item by item, receipts, photos with time and place, the independent witness.
6. How it works: five step cards with arch number tiles.
7. The cap: the rule and a dark panel with the over-remaining dialog (₦300,000 entered, ₦200,000 offered).
8. Who it's for: donors, organisations, witnesses, the Amanah team.
9. For organisations: an inset green panel with the lattice.
10. Footer: brand and "Browse campaigns", link columns (Give, Organisations, Trust), the large wordmark beside أمانة, and the legal line.

## Responsive behaviour

- **Phones (below 600px):** everything stacks to one column. The arch window follows the hero text and is shorter (420px); the example card overlaps its lower part. The hero buttons share one line from 380px. The lattice on the organisations panel is left out.
- **600px to 900px:** cards in two columns. The section links collapse into the menu button below 900px.
- **900px to 1180px** (including "desktop site" on a phone, about 980px): the desktop layout. The separate "Register your organisation" button and the witness tag appear from 1180px, so the header and the arch stay uncluttered.
- **Above 1180px:** the full desktop design.

## Implementation notes

- Copy is production copy. Never add internal, pilot or hackathon wording to public pages.
- The example campaign is static content until live campaigns exist (F2.1, F3). It stays labelled "Example campaign".
- Evidence shows the **upload (server) time** as the official time, labelled for donors as "Uploaded …" (spec §7).
- The design's footer "Privacy" link is left out until the privacy notice exists (F4.6).

## Campaign cover photos (mock data)

The mock campaigns use free photos from Unsplash (Unsplash License), stored in `public/images/campaigns/`. They stand in until organisations upload their own covers.

| File                  | Source                                                                              |
| --------------------- | ----------------------------------------------------------------------------------- |
| `food-drive.jpg`      | https://unsplash.com/photos/a-person-carrying-a-bag-of-food-1RQ0iIh5L8A             |
| `school-supplies.jpg` | https://unsplash.com/photos/boy-writing-on-notepad-bsk8f6BVSHc                      |
| `borehole.jpg`        | https://unsplash.com/photos/children-stand-by-a-water-pump-in-a-village-e0N0tpl26EU |

Photos were chosen so that no identifiable child is presented as a beneficiary of a named campaign (for example, an "orphans" card).
