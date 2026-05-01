// ═══════════════════════════════════════════════════════════
// components/public/hero/HeroSearchBar.tsx
// Glass morphism search bar — floats over hero
// ═══════════════════════════════════════════════════════════

"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { usePublicAreas } from "@/lib/hooks/usePublic";
import { ROUTES } from "@/lib/constants/routes";
import { GuestSelector } from "./GuestSelector";
import { Search } from "lucide-react";

export function HeroSearchBar() {
  const router = useRouter();

  // Areas from API
  const { data: areas, isLoading: areasLoading } = usePublicAreas();

  // Form state
  const [areaId, setAreaId] = useState("");
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState(2);

  // Validation
  const checkOutMin = useMemo(() => {
    if (!checkIn) return "";
    const next = new Date(checkIn);
    next.setDate(next.getDate() + 1);
    return next.toISOString().split("T")[0];
  }, [checkIn]);

  const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

  // Reset checkOut if it becomes invalid after checkIn changes
  const handleCheckInChange = (value: string) => {
    setCheckIn(value);
    if (checkOut && value >= checkOut) {
      setCheckOut("");
    }
  };

  // Submit → navigate to units listing with URL params
  const handleSearch = () => {
    const params = new URLSearchParams();
    if (areaId) params.set("areaId", areaId);
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests !== 2) params.set("guests", String(guests)); // omit default

    const query = params.toString();
    router.push(query ? `${ROUTES.unitsList}?${query}` : ROUTES.unitsList);
  };

  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 p-2 backdrop-blur-md lg:p-3">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:gap-0">
        {/* Location / Area */}
        <div className="flex-1 px-3 py-2 lg:border-r lg:border-white/10">
          <label className="mb-1 block font-body text-[10px] uppercase tracking-wider text-white/50">
            Location
          </label>
          <select
            value={areaId}
            onChange={(e) => setAreaId(e.target.value)}
            className="w-full cursor-pointer appearance-none border-none bg-transparent text-sm text-white outline-none placeholder:text-white/40"
          >
            <option value="" className="text-neutral-800">
              All Areas
            </option>
            {areasLoading ? (
              <option disabled className="text-neutral-800">
                Loading...
              </option>
            ) : (
              (areas ?? [])
                .filter((area) => area.isActive)
                .map((area) => (
                  <option
                    key={area.id}
                    value={area.id}
                    className="text-neutral-800"
                  >
                    {area.name}
                  </option>
                ))
            )}
          </select>
        </div>

        {/* Check-in Date */}
        <div className="flex-1 px-3 py-2 lg:border-r lg:border-white/10">
          <label className="mb-1 block font-body text-[10px] uppercase tracking-wider text-white/50">
            Check-in
          </label>
          <input
            type="date"
            value={checkIn}
            min={todayStr}
            onChange={(e) => handleCheckInChange(e.target.value)}
            className="w-full border-none bg-transparent text-sm text-white outline-none [color-scheme:dark]"
          />
        </div>

        {/* Check-out Date */}
        <div className="flex-1 px-3 py-2 lg:border-r lg:border-white/10">
          <label className="mb-1 block font-body text-[10px] uppercase tracking-wider text-white/50">
            Check-out
          </label>
          <input
            type="date"
            value={checkOut}
            min={checkOutMin || todayStr}
            disabled={!checkIn}
            onChange={(e) => setCheckOut(e.target.value)}
            className="w-full border-none bg-transparent text-sm text-white outline-none [color-scheme:dark] disabled:cursor-not-allowed disabled:opacity-40"
          />
        </div>

        {/* Guests */}
        <div className="flex-1 px-3 py-2 lg:border-r lg:border-white/10">
          <label className="mb-1 block font-body text-[10px] uppercase tracking-wider text-white/50">
            Guests
          </label>
          <GuestSelector value={guests} onChange={setGuests} min={1} max={20} />
        </div>

        {/* Search Button */}
        <div className="px-2 py-1 lg:py-0">
          <button
            onClick={handleSearch}
            className="
              flex w-full
              items-center justify-center gap-2 rounded-xl
              bg-primary-500 px-6
              py-3 text-sm font-medium
              text-white transition-colors duration-200
              hover:bg-primary-600 active:scale-[0.98]
              lg:w-auto
            "
          >
            <Search className="h-4 w-4" />
            <span>Search</span>
          </button>
        </div>
      </div>
    </div>
  );
}
