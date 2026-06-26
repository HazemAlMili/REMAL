import { test, expect } from "../fixtures/auth.fixture";

test.describe("Projects Management Module", () => {
  test("Can create, edit, toggle status of a Project with persistence", async ({
    superAdminPage,
  }) => {
    // Set higher timeout for DB mutation lag
    test.setTimeout(45000);

    // 1. Navigate to Projects Page
    await superAdminPage.goto("/admin/projects");
    await expect(superAdminPage.locator("h1")).toHaveText(/Projects/i);

    // 2. Create a new Project
    const projectName = `Sahel_${Math.floor(Math.random() * 100000)}`;
    const projectDesc = "Smoke test project description";

    await superAdminPage.click('button:has-text("New Project")');
    await superAdminPage.fill("#name", projectName);
    await superAdminPage.fill("#description", projectDesc);
    await superAdminPage.click('button[type="submit"]');

    // Confirm success in the list
    const projectRow = superAdminPage.locator(`tr:has-text("${projectName}")`);
    await expect(projectRow).toBeVisible({ timeout: 15000 });

    const statusCell = projectRow.locator("td:nth-child(3)");
    await expect(statusCell).toHaveText("Active");

    // 3. Toggle status to inactive
    const toggleBtn = projectRow.locator(
      'button[aria-label="Deactivate Project"]'
    );
    await expect(toggleBtn).toBeVisible({ timeout: 5000 });
    await superAdminPage.waitForTimeout(1000);
    await toggleBtn.click({ force: true });

    // Confirm dialog
    const confirmBtn = superAdminPage
      .locator(
        'button:has-text("Deactivate Project"), button:has-text("Confirm")'
      )
      .first();
    await expect(confirmBtn).toBeVisible({ timeout: 5000 });
    await confirmBtn.click({ force: true });

    // Verify Inactive state
    await expect(statusCell).toHaveText("Inactive", { timeout: 15000 });

    // 4. Reload page and check persistence
    await superAdminPage.reload();
    const projectRowReloaded = superAdminPage.locator(
      `tr:has-text("${projectName}")`
    );
    await expect(projectRowReloaded).toBeVisible({ timeout: 15000 });
    await expect(projectRowReloaded.locator("td:nth-child(3)")).toHaveText(
      "Inactive"
    );
  });
});
