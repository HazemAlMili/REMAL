import { test, expect } from "../fixtures/auth.fixture";

test.describe("Role-Based Access Control (RBAC) Verification", () => {
  // --- SALES ROLE ---
  test("Sales role has access to CRM but not Finance", async ({ salesPage }) => {
    await salesPage.goto("/admin/dashboard");
    
    const crmLink = salesPage.getByRole("navigation").getByRole("link", { name: "Leads pipeline" });
    const financeLink = salesPage.getByRole("navigation").getByRole("link", { name: "Finance hub" });
    
    await expect(crmLink).toBeVisible();
    await expect(financeLink).not.toBeVisible();

    await salesPage.goto("/admin/finance");
    await salesPage.waitForURL("**/admin/dashboard");
    await expect(salesPage).toHaveURL(/\/admin\/dashboard/);
  });

  // --- FINANCE ROLE ---
  test("Finance role has access to Finance but not CRM", async ({ financePage }) => {
    await financePage.goto("/admin/dashboard");

    const financeLink = financePage.getByRole("navigation").getByRole("link", { name: "Finance hub" });
    const crmLink = financePage.getByRole("navigation").getByRole("link", { name: "Leads pipeline" });

    await expect(financeLink).toBeVisible();
    await expect(crmLink).not.toBeVisible();

    await financePage.goto("/admin/crm");
    await financePage.waitForURL("**/admin/dashboard");
    await expect(financePage).toHaveURL(/\/admin\/dashboard/);
  });

  // --- TECH ROLE ---
  test("Tech role has access to Units setup but not Finance", async ({ techPage }) => {
    await techPage.goto("/admin/dashboard");

    const unitsLink = techPage.getByRole("navigation").getByRole("link", { name: "Units", exact: true });
    const financeLink = techPage.getByRole("navigation").getByRole("link", { name: "Finance hub" });

    await expect(unitsLink).toBeVisible();
    await expect(financeLink).not.toBeVisible();

    await techPage.goto("/admin/finance");
    await techPage.waitForURL("**/admin/dashboard");
    await expect(techPage).toHaveURL(/\/admin\/dashboard/);
  });

  // --- SUPERADMIN ROLE ---
  test("SuperAdmin role has unfettered access across all modules", async ({ superAdminPage }) => {
    await superAdminPage.goto("/admin/dashboard");

    const nav = superAdminPage.getByRole("navigation");
    await expect(nav.getByRole("link", { name: "Leads pipeline" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Finance hub" })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Units", exact: true })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Resort areas" })).toBeVisible();

    // Accessing settings should be allowed
    await superAdminPage.goto("/admin/settings");
    await expect(
      superAdminPage.getByRole("main").getByRole("heading", { name: "Admin settings" })
    ).toBeVisible();
  });
});
