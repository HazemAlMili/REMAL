"use client";

import { cn } from "@/lib/utils/cn";
import { UnitOverviewTab } from "./tabs/UnitOverviewTab";
import { UnitImagesTab } from "./tabs/UnitImagesTab";
import { UnitAmenitiesTab } from "./tabs/UnitAmenitiesTab";
import { UnitDateBlocksTab } from "./tabs/UnitDateBlocksTab";
import { UnitSeasonalPricingTab } from "./tabs/UnitSeasonalPricingTab";
import { UnitAvailabilityTab } from "./tabs/UnitAvailabilityTab";
import type { UnitDetailsResponse } from "@/lib/types";

export type UnitTab =
  | "overview"
  | "images"
  | "amenities"
  | "date-blocks"
  | "seasonal-pricing"
  | "availability";

const TABS: { key: UnitTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "images", label: "Images" },
  { key: "amenities", label: "Amenities" },
  { key: "date-blocks", label: "Date Blocks" },
  { key: "seasonal-pricing", label: "Seasonal Pricing" },
  { key: "availability", label: "Availability" },
];

export interface UnitDetailTabsProps {
  unitId: string;
  activeTab: UnitTab;
  onTabChange: (tab: UnitTab) => void;
  unit: UnitDetailsResponse;
}

export function UnitDetailTabs({
  activeTab,
  onTabChange,
  unit,
}: UnitDetailTabsProps) {
  return (
    <div className="space-y-6">
      {/* Tab navigation */}
      <div className="border-b border-neutral-200">
        <nav className="-mb-px flex gap-1 overflow-x-auto">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onTabChange(tab.key)}
              className={cn(
                "whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors",
                activeTab === tab.key
                  ? "border-primary-600 text-primary-700"
                  : "border-transparent text-neutral-500 hover:border-neutral-300 hover:text-neutral-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "overview" && <UnitOverviewTab unit={unit} />}
        {activeTab === "images" && <UnitImagesTab unitId={unit.id} />}
        {activeTab === "amenities" && <UnitAmenitiesTab unitId={unit.id} />}
        {activeTab === "date-blocks" && <UnitDateBlocksTab unitId={unit.id} />}
        {activeTab === "seasonal-pricing" && (
          <UnitSeasonalPricingTab
            unitId={unit.id}
            basePricePerNight={unit.basePricePerNight}
          />
        )}
        {activeTab === "availability" && (
          <UnitAvailabilityTab unitId={unit.id} />
        )}
      </div>
    </div>
  );
}
