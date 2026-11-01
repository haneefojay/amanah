import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { evidencePhoto, type EvidencePhoto } from "@/lib/api/schemas";
import { campaignDetails } from "@/test/fixtures";
import { expectNoA11yViolations } from "@/test/axe";
import {
  EvidenceGallery,
  formatCoordinates,
  mapLink,
  phoneTimeIfDifferent,
} from "./evidence-gallery";

const ramadan = campaignDetails["ramadan-food-drive-offa"]!;
const eid = campaignDetails["eid-clothes-30-children"]!;

const photo = (over: Partial<EvidencePhoto>): EvidencePhoto => ({
  ...ramadan.evidence[0]!,
  ...over,
});

const renderGallery = (evidence: EvidencePhoto[], c = ramadan) =>
  render(<EvidenceGallery evidence={evidence} items={c.items} expenses={c.expenses} />);

const card = () => screen.getAllByRole("listitem")[0]!;
const value = (label: string) => within(card()).getByText(label).nextElementSibling;

describe("EvidenceGallery (F3.4)", () => {
  it("shows the server time as authoritative, the phone time when it differs, and the location", async () => {
    const { container } = renderGallery(ramadan.evidence);
    expect(within(card()).getByRole("img", { name: "Photo for Rice, 50 kg bags" })).toHaveAttribute(
      "loading",
      "lazy",
    );
    expect(within(card()).getByText("Rice, 50 kg bags")).toBeInTheDocument();
    // 15:42 UTC is 4:42 pm in Lagos.
    expect(value("Uploaded")).toHaveTextContent("14 Oct 2026, 4:42 pm");
    expect(value("Uploaded")).toHaveTextContent("Recorded by Amanah");
    expect(value("Taken on the phone")).toHaveTextContent("14 Oct 2026, 4:05 pm");
    const map = within(card()).getByRole("link", { name: /8\.14921, 4\.72036/ });
    expect(map).toHaveAttribute(
      "href",
      "https://www.openstreetmap.org/?mlat=8.14921&mlon=4.72036#map=17/8.14921/4.72036",
    );
    expect(map).toHaveAttribute("target", "_blank");
    expect(map).toHaveAttribute("rel", expect.stringContaining("noopener"));
    await expectNoA11yViolations(container);
  });

  it("says when the location is unavailable, and labels a photo by its expense", () => {
    renderGallery(eid.evidence, eid);
    expect(value("Location")).toHaveTextContent("Location unavailable");
    expect(within(card()).queryByRole("link")).toBeNull();
    expect(within(card()).getByText("Eid outfits for 30 children")).toBeInTheDocument();
  });

  it("hides the phone time when it reads the same as the upload time, or is missing", () => {
    renderGallery([
      photo({
        capturedAtClient: "2026-10-14T15:42:05Z",
        uploadedAtServer: "2026-10-14T15:42:40Z",
      }),
    ]);
    expect(within(card()).queryByText("Taken on the phone")).toBeNull();
    expect(phoneTimeIfDifferent(photo({ capturedAtClient: null }))).toBeNull();
  });

  it("labels a photo linked to nothing as General", () => {
    renderGallery([photo({ itemId: null, expenseId: null })]);
    expect(within(card()).getByText("General")).toBeInTheDocument();
    expect(
      within(card()).getByRole("img", { name: "Photo from the organisation" }),
    ).toBeInTheDocument();
  });

  it("shows an empty state before any photos", () => {
    renderGallery([]);
    expect(
      screen.getByText(
        "No photos yet. Photos taken when items are bought and delivered will appear here.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("list")).toBeNull();
  });

  it("formats coordinates to five decimals and builds a map link", () => {
    expect(formatCoordinates(8.1247, 4.254)).toBe("8.12470, 4.25400");
    expect(mapLink(-1.5, 30)).toBe(
      "https://www.openstreetmap.org/?mlat=-1.50000&mlon=30.00000#map=17/-1.50000/30.00000",
    );
  });
});

describe("evidencePhoto contract", () => {
  it("rejects a latitude without a longitude", () => {
    expect(evidencePhoto.safeParse(photo({ longitude: null })).success).toBe(false);
  });

  it("rejects coordinates off the globe", () => {
    expect(evidencePhoto.safeParse(photo({ latitude: 91 })).success).toBe(false);
  });
});
