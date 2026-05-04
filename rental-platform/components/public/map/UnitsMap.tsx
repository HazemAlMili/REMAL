// ═══════════════════════════════════════════════════════════
// components/public/map/UnitsMap.tsx
// Mapbox GL interactive map — client-only (dynamic loaded)
// ═══════════════════════════════════════════════════════════

"use client";
import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import { ROUTES } from "@/lib/constants/routes";
import {
  getAreaCoordinates,
  MAP_CENTER,
  MAP_ZOOM,
} from "@/lib/constants/area-coordinates";
import type { AreaResponse } from "@/lib/types/area.types";

import "mapbox-gl/dist/mapbox-gl.css";

// Token from environment — NEVER hardcoded
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";
if (MAPBOX_TOKEN) {
  mapboxgl.accessToken = MAPBOX_TOKEN;
}

interface UnitsMapProps {
  areas: AreaResponse[];
}

export function UnitsMap({ areas }: UnitsMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize map (skipped if no token)
  useEffect(() => {
    if (!MAPBOX_TOKEN || !mapContainerRef.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: MAP_CENTER,
      zoom: MAP_ZOOM,
      scrollZoom: false, // disabled by default — prevents scroll hijacking
      attributionControl: false, // custom position below
    });

    // Add minimal controls
    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right"
    );
    map.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-left"
    );

    map.on("load", () => setMapLoaded(true));

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Add markers when map is loaded and areas are available
  useEffect(() => {
    if (!MAPBOX_TOKEN || !mapRef.current || !mapLoaded) return;

    const markers: mapboxgl.Marker[] = [];

    areas.forEach((area) => {
      const coords = getAreaCoordinates(area.id);
      if (!coords) return; // skip areas without coordinates

      // Custom marker element — terracotta circle with pulsing ring
      const el = document.createElement("div");
      el.className = "mapbox-area-marker";
      el.innerHTML = `
        <div class="relative">
          <div class="w-4 h-4 rounded-full bg-primary-500 border-2 border-white shadow-md z-10 relative"></div>
          <div class="absolute inset-0 w-4 h-4 rounded-full bg-primary-500/30 animate-ping motion-reduce:animate-none"></div>
        </div>
      `;
      el.style.cursor = "pointer";

      // Popup content
      const popup = new mapboxgl.Popup({
        offset: 12,
        closeButton: true,
        closeOnClick: true,
        maxWidth: "220px",
      }).setHTML(`
        <div style="font-family: Inter, sans-serif; padding: 4px 0;">
          <p style="font-weight: 600; font-size: 14px; margin: 0 0 6px 0; color: #1a1a1a;">
            ${area.name}
          </p>
          ${
            area.description
              ? `<p style="font-size: 12px; color: #666; margin: 0 0 8px 0; line-height: 1.4;">${area.description.slice(0, 80)}${area.description.length > 80 ? "..." : ""}</p>`
              : ""
          }
          <a
            href="${ROUTES.unitsList}?areaId=${area.id}"
            style="display: inline-block; font-size: 12px; font-weight: 500; color: #c2754a; text-decoration: none;"
          >
            Browse ${area.name} →
          </a>
        </div>
      `);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat(coords)
        .setPopup(popup)
        .addTo(mapRef.current!);

      markers.push(marker);
    });

    return () => {
      markers.forEach((m) => m.remove());
    };
  }, [areas, mapLoaded]);

  // Fallback when no Mapbox token is configured
  if (!MAPBOX_TOKEN) {
    return (
      <div className="h-[400px] w-full lg:h-[500px] flex items-center justify-center bg-stone-100 rounded-lg border border-stone-200">
        <div className="text-center text-stone-400 space-y-1">
          <p className="text-sm font-medium">Map not available</p>
          <p className="text-xs">Configure NEXT_PUBLIC_MAPBOX_TOKEN to enable</p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={mapContainerRef}
      className="h-[400px] w-full lg:h-[500px]"
      aria-label="Map showing property locations across Egypt"
    />
  );
}
