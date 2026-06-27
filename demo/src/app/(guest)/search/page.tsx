"use client";

import React, { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  MapPin,
  Search,
  Users,
  Map as MapIcon,
  List as ListIcon,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useProjects, useUnits } from "@/lib/hooks/useCatalog";
import { resolveProjectId } from "@/lib/constants/project-slugs";
import { getImageUrls } from "@/lib/utils/image";
import { formatCurrency } from "@/lib/utils/format";
import type { UnitListItem } from "@/lib/api/types";

function SearchContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("project");

  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [touched, setTouched] = useState(false);
  const [projectFilter, setProjectFilter] = useState("");
  const [minGuests, setMinGuests] = useState<number | undefined>(undefined);

  const { data: projects } = useProjects();

  // Resolve the URL slug (e.g. ?project=abraj → "Abraj Al Alamein") against the
  // live project list. Until projects load we hold the results in a loading state
  // so we never flash the wrong project's units.
  const resolvedProjectId = useMemo(
    () => resolveProjectId(slug, projects ?? []),
    [slug, projects]
  );

  const projectsReady = !slug || projects !== null;
  const effectiveProjectId = touched
    ? projectFilter
    : resolvedProjectId ?? "";

  const { data: units, isLoading } = useUnits({
    page: 1,
    pageSize: 24,
    projectId: projectsReady ? effectiveProjectId || undefined : undefined,
    minGuests,
  });

  const showLoading = isLoading || !projectsReady;
  const results = units ?? [];

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-24 lg:pb-8 font-sans">
      <div
        className={`container mx-auto px-4 h-full flex flex-col ${viewMode === "map" ? "lg:h-[calc(100vh-6rem)] overflow-hidden" : ""}`}
      >
        {/* Search Header */}
        <div className="mb-6 z-10 bg-white/80 backdrop-blur-xl p-4 lg:p-6 rounded-[2rem] shadow-sm border border-gray-100 sticky top-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h1 className="text-2xl lg:text-3xl font-black text-brand-950 w-full md:w-auto">
              اكتشف الوجهات{" "}
              <span className="tabular-nums">
                ({showLoading ? "…" : results.length} وحدة متاحة)
              </span>
            </h1>

            {/* Map/List Toggle */}
            <div className="bg-gray-100 p-1 rounded-2xl flex items-center justify-between w-full md:w-auto">
              <button
                onClick={() => setViewMode("list")}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${viewMode === "list" ? "bg-white shadow-sm text-brand-950" : "text-gray-500 hover:text-gray-900"}`}
              >
                <ListIcon className="w-4 h-4" /> القائمة
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${viewMode === "map" ? "bg-white shadow-sm text-brand-950" : "text-gray-500 hover:text-gray-900"}`}
              >
                <MapIcon className="w-4 h-4" /> الخريطة
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col md:flex-row gap-3 items-center w-full">
            <div className="flex-1 w-full flex items-center gap-3 px-5 py-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors border border-transparent focus-within:border-brand-200">
              <MapPin className="text-brand-500 w-5 h-5 shrink-0" />
              <select
                className="bg-transparent border-none outline-none w-full text-brand-950 font-bold cursor-pointer"
                value={effectiveProjectId}
                onChange={(e) => {
                  setTouched(true);
                  setProjectFilter(e.target.value);
                }}
              >
                <option value="">كل مشروعات الساحل</option>
                {(projects ?? []).map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex-1 w-full flex items-center gap-3 px-5 py-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors border border-transparent focus-within:border-brand-200">
              <Users className="text-brand-500 w-5 h-5 shrink-0" />
              <select
                className="bg-transparent border-none outline-none w-full text-brand-950 font-bold cursor-pointer"
                value={minGuests ?? ""}
                onChange={(e) =>
                  setMinGuests(
                    e.target.value ? Number(e.target.value) : undefined
                  )
                }
              >
                <option value="">أي عدد للضيوف</option>
                <option value="2">شخصين أو أكثر</option>
                <option value="4">عائلة (4 أفراد)</option>
              </select>
            </div>

            <Button className="w-full md:w-auto rounded-2xl px-8 h-[52px] bg-brand-950 text-white font-bold hover:bg-brand-800 shadow-md">
              <Search className="w-4 h-4 ml-2" />
              بحث
            </Button>

            <Button
              variant="outline"
              className="w-full md:w-auto rounded-2xl border-gray-200 text-gray-700 h-[52px] font-bold hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 ml-2" />
              فلاتر
            </Button>
          </div>
        </div>

        {/* Content region */}
        <div
          className={`flex-1 ${viewMode === "map" ? "flex flex-col lg:flex-row gap-6 overflow-hidden" : ""}`}
        >
          <div
            className={`${viewMode === "map" ? "lg:w-[60%] lg:overflow-y-auto lg:pr-2 hidden lg:block custom-scrollbar pb-32" : "w-full"}`}
          >
            <AnimatePresence mode="wait">
              {showLoading ? (
                <motion.div
                  key="skeletons"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={`grid gap-6 ${viewMode === "list" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-4" : "grid-cols-1 md:grid-cols-2"}`}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                    <div key={i} className="animate-pulse flex flex-col gap-4">
                      <div className="w-full aspect-[4/3] bg-gray-200 rounded-3xl" />
                      <div className="space-y-3 px-2">
                        <div className="h-4 bg-gray-200 rounded-full w-2/3" />
                        <div className="h-6 bg-gray-200 rounded-full w-full" />
                        <div className="h-4 bg-gray-200 rounded-full w-1/3" />
                      </div>
                    </div>
                  ))}
                </motion.div>
              ) : results.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-24 text-center"
                >
                  <p className="text-lg font-bold text-brand-950">
                    لا توجد وحدات متاحة في هذا المشروع حالياً
                  </p>
                  <p className="mt-2 text-gray-500 font-medium">
                    جرّب مشروعًا آخر أو وسّع نطاق البحث.
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`grid gap-6 ${viewMode === "list" ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1 sm:grid-cols-2"}`}
                >
                  {results.map((unit) => (
                    <ResultCard key={unit.id} unit={unit} />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Map View */}
          {viewMode === "map" && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex-1 rounded-[2rem] overflow-hidden sticky lg:top-48 bg-gray-200 border border-gray-200 h-[calc(100vh-200px)] lg:h-auto shadow-inner relative"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-brand-100 via-gray-100 to-brand-50" />
              {results.map((unit, idx) => (
                <Link href={`/units/${unit.id}`} key={unit.id}>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    className="absolute bg-white px-3 py-1.5 rounded-full shadow-lg font-black text-brand-950 text-xs tabular-nums border border-gray-100 hover:scale-110 hover:bg-brand-950 hover:text-white transition-all cursor-pointer z-10 flex items-center justify-center"
                    style={{ top: `${20 + (idx % 5) * 15}%`, left: `${15 + (idx % 4) * 20}%` }}
                  >
                    {formatCurrency(unit.basePricePerNight)}
                  </motion.div>
                </Link>
              ))}

              <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                <button className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center font-bold text-xl hover:bg-gray-50">
                  +
                </button>
                <button className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center font-bold text-xl hover:bg-gray-50">
                  -
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
}

function ResultCard({ unit }: { unit: UnitListItem }) {
  const images = getImageUrls(unit.images);
  const cover = images[0];

  return (
    <Link href={`/units/${unit.id}`} className="block group">
      <Card
        padding="none"
        className="overflow-hidden group/card hover:border-brand-200 transition-all duration-300 cursor-pointer h-full flex flex-col rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 bg-white"
      >
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {cover ? (
            <img
              src={cover}
              alt={unit.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-brand-100 via-brand-50 to-gray-100 flex items-center justify-center">
              <span className="text-brand-300 font-black text-xl tracking-tighter">
                Kaza Booking
              </span>
            </div>
          )}
        </div>

        <div className="p-5 flex flex-col flex-grow">
          <div
            dir="auto"
            className="text-xs text-brand-600 font-black uppercase tracking-wider mb-2"
          >
            {unit.unitType} • {unit.projectName}
          </div>
          <h3
            dir="auto"
            className="text-lg font-black text-brand-950 mb-1 leading-tight line-clamp-1"
          >
            {unit.name}
          </h3>
          <div className="text-sm font-medium text-gray-500 mb-4">
            حتى {unit.maxGuests} أفراد • {unit.bedrooms} غرف
          </div>

          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
            <div className="flex flex-col">
              <span className="text-xl font-black text-brand-950 tabular-nums">
                {formatCurrency(unit.basePricePerNight)}
              </span>
              <span className="text-[10px] uppercase font-bold text-gray-400">
                لليلة الواحدة
              </span>
            </div>
            <Button
              size="sm"
              className="rounded-xl font-bold bg-gray-100 text-brand-950 hover:bg-brand-950 hover:text-white transition-colors"
            >
              اختيار
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={<div className="min-h-screen bg-gray-50 pt-24 pb-20" />}
    >
      <SearchContent />
    </Suspense>
  );
}
