import { test, expect, Page } from "@playwright/test";

/**
 * Dashboard RBAC gating (mocked) — verifies the frontend never fires an
 * analytics/units request its permission set forbids, and that the nav hides
 * tabs the role can't reach. Fully mocked: it intercepts every /api/** call,
 * so it is independent of the (separately deployed) backend.
 *
 * Models the units/analytics permission split: Finance keeps `analytics:read`
 * (financial reports + the Analytics tab) but NOT `units:read`, so the
 * Units section and its dashboard widgets disappear for Finance. A units-reader
 * role (Sales/SuperAdmin/Tech) has both.
 */

const PAGE_ORIGIN = "http://localhost:3001";

// Finance: reports yes, units inventory no.
const FINANCE_PERMS = [
  "finance:overview",
  "finance:manage",
  "finance:payouts",
  "bookings:read",
  "clients:read",
  "owners:read",
  "analytics:read",
];

// Sales: units inventory + analytics.
const SALES_PERMS = [
  "crm:read",
  "crm:write",
  "crm:assign",
  "bookings:read",
  "bookings:write",
  "reviews:moderate",
  "clients:read",
  "clients:write",
  "owners:read",
  "units:read",
  "analytics:read",
];

const CORS = {
  "Access-Control-Allow-Origin": PAGE_ORIGIN,
  "Access-Control-Allow-Credentials": "true",
  "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type,Authorization",
};

/** Intercept every API call. Refresh returns an Admin session for the given
 * role with the supplied permission list; everything else returns a benign
 * empty envelope. */
async function mockAdminSession(
  page: Page,
  role: "Finance" | "Sales",
  permissions: string[]
) {
  // middleware.ts gates /admin/* on the presence of this cookie (value is not
  // checked); the actual refresh call is fully mocked below.
  await page.context().addCookies([
    { name: "refresh_token", value: "mock-refresh", domain: "localhost", path: "/" },
  ]);

  await page.route("**/api/**", async (route) => {
    if (route.request().method() === "OPTIONS") {
      return route.fulfill({ status: 204, headers: CORS, body: "" });
    }

    const url = route.request().url();
    const json = (data: unknown) =>
      route.fulfill({
        status: 200,
        headers: { ...CORS, "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

    if (url.includes("/api/auth/refresh")) {
      return json({
        success: true,
        data: {
          accessToken: "mock-access-token",
          expiresInSeconds: 900,
          subjectType: "Admin",
          adminRole: role,
          roleName: role,
          user: {
            userId: "11111111-1111-1111-1111-111111111111",
            identifier: `${role.toLowerCase()}.dev@rental.local`,
            subjectType: "Admin",
            adminRole: role,
            name: `${role} User`,
          },
          permissions,
        },
      });
    }

    if (url.includes("/api/internal/crm/leads/open-count")) {
      return json({ success: true, data: 0 });
    }

    // Benign empty payload for any other endpoint (lists, summaries, etc.).
    return json({
      success: true,
      data: [],
      pagination: { totalCount: 0, page: 1, pageSize: 20, totalPages: 1 },
    });
  });
}

test.describe("Dashboard RBAC gating", () => {
  test("Finance (no units read): no /api/internal/units request, no Units tab, keeps Analytics", async ({
    page,
  }) => {
    const unitsRequests: string[] = [];
    page.on("request", (req) => {
      if (req.url().includes("/api/internal/units")) unitsRequests.push(req.url());
    });

    await mockAdminSession(page, "Finance", FINANCE_PERMS);
    await page.goto("/admin/dashboard");

    await expect(
      page.getByRole("main").getByRole("heading", { name: "Operations dashboard" })
    ).toBeVisible({ timeout: 20000 });
    await page.waitForLoadState("networkidle");

    // The gate: a role that can't reach the units endpoint never fires it.
    expect(unitsRequests, "no internal/units request should be made").toHaveLength(
      0
    );

    const nav = page.locator("nav");
    await expect(nav.getByRole("link", { name: "Units", exact: true })).toHaveCount(
      0
    );
    // Finance keeps the things it legitimately has.
    await expect(
      nav.getByRole("link", { name: "Analytics", exact: true })
    ).toHaveCount(1);
    await expect(
      nav.getByRole("link", { name: "Finance hub", exact: true })
    ).toHaveCount(1);
  });

  test("Sales (units read): fires /api/internal/units and shows the Units tab", async ({
    page,
  }) => {
    const unitsRequests: string[] = [];
    page.on("request", (req) => {
      if (req.url().includes("/api/internal/units")) unitsRequests.push(req.url());
    });

    await mockAdminSession(page, "Sales", SALES_PERMS);
    await page.goto("/admin/dashboard");

    await expect(
      page.getByRole("main").getByRole("heading", { name: "Operations dashboard" })
    ).toBeVisible({ timeout: 20000 });
    await page.waitForLoadState("networkidle");

    expect(
      unitsRequests.length,
      "internal/units should be fetched when permitted"
    ).toBeGreaterThan(0);

    const nav = page.locator("nav");
    await expect(
      nav.getByRole("link", { name: "Units", exact: true })
    ).toHaveCount(1);
  });
});
