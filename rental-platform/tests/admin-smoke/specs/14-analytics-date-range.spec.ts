import { test, expect } from "../fixtures/auth.fixture";

/**
 * Analytics date-range (real backend) — proves the page lands on a range that
 * contains data (default: last 3 months, which includes the seeded May
 * activity) and that the new preset control actually drives the query: picking
 * an empty period ("This month") swaps the cards for the empty-period hint.
 *
 * Requires the dev server (:3001) and API (:5001) running with seeded data.
 */

test.describe("Analytics date range", () => {
  test("default range shows real amounts; switching to an empty period shows the hint", async ({
    financePage,
  }) => {
    await financePage.goto("/admin/analytics");

    await expect(
      financePage.getByRole("heading", { name: "Performance analytics" })
    ).toBeVisible({ timeout: 20000 });

    // Default = last 3 months → includes seeded May data → non-zero invoiced.
    const invoicedCard = financePage
      .locator("div.rounded-lg", { hasText: "Invoiced amount" })
      .last();
    await expect(invoicedCard).toBeVisible({ timeout: 15000 });
    await expect(async () => {
      const txt = await invoicedCard.innerText();
      expect(txt, "invoiced amount should be non-zero").toMatch(/[1-9]/);
    }).toPass({ timeout: 15000 });

    // Switch to the current month (no seeded activity) → empty-period hint.
    await financePage
      .getByLabel("Reporting period")
      .selectOption("thisMonth");
    await expect(
      financePage.getByText(/No financial activity in this period/i)
    ).toBeVisible({ timeout: 15000 });

    // And back to "All time" → real amounts return.
    await financePage.getByLabel("Reporting period").selectOption("all");
    await expect(async () => {
      const txt = await invoicedCard.innerText();
      expect(txt, "invoiced amount should be non-zero for all-time").toMatch(
        /[1-9]/
      );
    }).toPass({ timeout: 15000 });
  });
});
