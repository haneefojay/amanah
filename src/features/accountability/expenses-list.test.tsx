import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { campaignDetail } from "@/lib/api/schemas";
import { campaignDetails } from "@/test/fixtures";
import { expectNoA11yViolations } from "@/test/axe";
import { ExpensesList } from "./expenses-list";

const ramadan = campaignDetails["ramadan-food-drive-offa"]!;
const table = () => screen.getByRole("table", { name: "Expenses with receipts" });

describe("ExpensesList (F3.3)", () => {
  it("says nothing has been spent yet when the list is empty", async () => {
    const { container } = render(<ExpensesList expenses={[]} items={ramadan.items} />);
    expect(screen.getByRole("heading", { name: "Expenses" })).toBeInTheDocument();
    expect(
      screen.getByText("No spending yet. Each purchase will appear here with its receipt."),
    ).toBeInTheDocument();
    expect(screen.queryByRole("table")).toBeNull();
    await expectNoA11yViolations(container);
  });

  it("lists expenses with vendor, linked item, date, amount and total spent", async () => {
    const { container } = render(
      <ExpensesList expenses={ramadan.expenses} items={ramadan.items} />,
    );
    expect(screen.getByText("2 expenses, newest first")).toBeInTheDocument();
    const rice = within(table()).getByRole("row", { name: /Rice, 5 bags of 50 kg/ });
    expect(within(rice).getByText("Musa & Sons Grains, Offa Main Market")).toBeInTheDocument();
    expect(within(rice).getByText("Rice, 50 kg bags")).toBeInTheDocument();
    expect(within(rice).getByText("12 Oct 2026")).toBeInTheDocument();
    expect(within(rice).getByText("₦275,000")).toBeInTheDocument();
    expect(
      within(rice).getByRole("button", { name: "View the receipt for Rice, 5 bags of 50 kg" }),
    ).toBeInTheDocument();

    const transport = within(table()).getByRole("row", { name: /Transport of the rice/ });
    expect(within(transport).getByText("General")).toBeInTheDocument();
    expect(within(transport).getByText("No receipt")).toBeInTheDocument();
    expect(within(transport).queryByRole("button")).toBeNull();

    const total = within(table()).getByRole("rowheader", { name: "Total spent" });
    expect(total.nextElementSibling).toHaveTextContent("₦280,000");
    expect(
      within(screen.getByRole("list", { name: "Expenses" })).getAllByRole("listitem"),
    ).toHaveLength(2);
    await expectNoA11yViolations(container);
  });

  it("loads thumbnails lazily and only shows the full receipt once opened", () => {
    render(<ExpensesList expenses={ramadan.expenses} items={ramadan.items} />);
    const thumbnail = within(table()).getByRole("button", { name: /View the receipt/ });
    expect(thumbnail.querySelector("img")).toHaveAttribute("loading", "lazy");
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens a receipt in the viewer and returns focus when closed with Escape", async () => {
    const user = userEvent.setup();
    render(<ExpensesList expenses={ramadan.expenses} items={ramadan.items} />);
    const thumbnail = within(table()).getByRole("button", {
      name: "View the receipt for Rice, 5 bags of 50 kg",
    });
    await user.click(thumbnail);
    const dialog = await screen.findByRole("dialog", { name: "Receipt: Rice, 5 bags of 50 kg" });
    expect(
      within(dialog).getByText("Musa & Sons Grains, Offa Main Market · ₦275,000 · 12 Oct 2026"),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByRole("img", {
        name: "Receipt from Musa & Sons Grains, Offa Main Market for ₦275,000",
      }),
    ).toBeInTheDocument();
    expect(
      within(dialog).getByText(/Uploaded 12 Oct 2026, 12:20 pm · Recorded by Amanah/),
    ).toBeInTheDocument();
    expect(within(dialog).getByRole("link", { name: /Open full size/ })).toHaveAttribute(
      "href",
      "/images/receipts/ramadan-food-drive-offa-1.svg",
    );
    await expectNoA11yViolations(dialog);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(thumbnail).toHaveFocus();
  });

  it("closes from the close button", async () => {
    const user = userEvent.setup();
    render(<ExpensesList expenses={ramadan.expenses} items={ramadan.items} />);
    await user.click(within(table()).getByRole("button", { name: /View the receipt/ }));
    await user.click(await screen.findByRole("button", { name: "Close receipt" }));
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("campaignDetail contract", () => {
  it("rejects expenses that add up to more than was raised", () => {
    const over = {
      ...ramadan,
      expenses: [{ ...ramadan.expenses[0]!, amount: ramadan.raisedAmount + 1 }],
    };
    expect(campaignDetail.safeParse(over).success).toBe(false);
  });

  it("accepts every fixture campaign, and their expenses fit within what was raised", () => {
    for (const c of Object.values(campaignDetails)) {
      expect(campaignDetail.safeParse(c).success, c.slug).toBe(true);
    }
  });
});
