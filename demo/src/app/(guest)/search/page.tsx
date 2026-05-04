'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MOCK_UNITS, MOCK_AREAS } from '@/lib/mock-data';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { MapPin, Search, SlidersHorizontal, Users, Map as MapIcon, List as ListIcon, Star, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SearchPage() {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate network request for premium "fetching" feel
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-24 lg:pb-8 font-sans">
      <div className={`container mx-auto px-4 h-full flex flex-col ${viewMode === 'map' ? 'lg:h-[calc(100vh-6rem)] overflow-hidden' : ''}`}>
        {/* Premium Search Header */}
        <div className="mb-6 z-10 bg-white/80 backdrop-blur-xl p-4 lg:p-6 rounded-[2rem] shadow-sm border border-gray-100 sticky top-20">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <h1 className="text-2xl lg:text-3xl font-black text-brand-950 w-full md:w-auto">
              اكتشف الوجهات ({MOCK_UNITS.length} وحدة متاحة)
            </h1>

            {/* Map/List Toggle */}
            <div className="bg-gray-100 p-1 rounded-2xl flex items-center justify-between w-full md:w-auto">
              <button 
                onClick={() => setViewMode('list')}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-brand-950' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <ListIcon className="w-4 h-4" /> القائمة
              </button>
              <button 
                onClick={() => setViewMode('map')}
                className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${viewMode === 'map' ? 'bg-white shadow-sm text-brand-950' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <MapIcon className="w-4 h-4" /> الخريطة
              </button>
            </div>
          </div>
          
          <div className="mt-4 flex flex-col md:flex-row gap-3 items-center w-full">
            <div className="flex-1 w-full flex items-center gap-3 px-5 py-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer border border-transparent focus-within:border-brand-200">
              <MapPin className="text-brand-500 w-5 h-5 shrink-0" />
              <select className="bg-transparent border-none outline-none w-full text-brand-950 font-bold cursor-pointer">
                <option value="">كل مناطق الساحل</option>
                {MOCK_AREAS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            
            <div className="flex-1 w-full flex items-center gap-3 px-5 py-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer border border-transparent focus-within:border-brand-200">
              <Users className="text-brand-500 w-5 h-5 shrink-0" />
              <select className="bg-transparent border-none outline-none w-full text-brand-950 font-bold cursor-pointer">
                <option>أي عدد للضيوف</option>
                <option>شخصين</option>
                <option>عائلة (4 أفراد)</option>
              </select>
            </div>

            <Button className="w-full md:w-auto rounded-2xl px-8 h-[52px] bg-brand-950 text-white font-bold hover:bg-brand-800 shadow-md">
              <Search className="w-4 h-4 ml-2" />
              بحث
            </Button>
            
            {/* Filter Drawer Trigger */}
            <Button variant="outline" className="w-full md:w-auto rounded-2xl border-gray-200 text-gray-700 h-[52px] font-bold hover:bg-gray-50">
              <Filter className="w-4 h-4 ml-2" />
              فلاتر
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className={`flex-1 ${viewMode === 'map' ? 'flex flex-col lg:flex-row gap-6 overflow-hidden' : ''}`}>
          
          {/* List View or Map-Side List */}
          <div className={`${viewMode === 'map' ? 'lg:w-[60%] lg:overflow-y-auto lg:pr-2 hidden lg:block custom-scrollbar pb-32' : 'w-full'}`}>
            <AnimatePresence mode="wait">
              {isLoading ? (
                /* Premium Skeleton Loaders */
                <motion.div 
                  key="skeletons"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className={`grid gap-6 ${viewMode === 'list' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4' : 'grid-cols-1 md:grid-cols-2'}`}
                >
                  {[1,2,3,4,5,6,7,8].map(i => (
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
              ) : (
                <motion.div 
                  key="results"
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
                  className={`grid gap-6 ${viewMode === 'list' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1 sm:grid-cols-2'}`}
                >
                  {MOCK_UNITS.map(unit => (
                    <Link href={`/units/${unit.id}`} key={unit.id} className="block group">
                      <Card padding="none" className="overflow-hidden group/card hover:border-brand-200 transition-all duration-300 cursor-pointer h-full flex flex-col rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 bg-white">
                        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                          {/* Top Badges */}
                          <div className="absolute top-4 right-4 z-10 flex gap-2 flex-wrap justify-end">
                            <Badge variant="success" className="backdrop-blur-md bg-white/90 text-brand-950 font-black shadow-md border-none">
                              <Star className="w-3 h-3 ml-1 fill-brand-950 inline" /> {unit.rating}
                            </Badge>
                            {unit.images.length > 3 && (
                              <Badge className="bg-brand-950/80 text-white backdrop-blur-md font-bold shadow-md border-none">
                                مميز
                              </Badge>
                            )}
                          </div>
                          
                          <img src={unit.images[0]} alt={unit.name} className="w-full h-full object-cover transition-transform duration-700 group-hover/card:scale-110" />
                        </div>
                        
                        <div className="p-5 flex flex-col flex-grow">
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-xs text-brand-600 font-black uppercase tracking-wider">{unit.type} • {MOCK_AREAS.find(a => a.id === unit.areaId)?.name}</div>
                          </div>
                          <h3 className="text-lg font-black text-brand-950 mb-1 leading-tight line-clamp-1">{unit.name}</h3>
                          <div className="text-sm font-medium text-gray-500 mb-4 line-clamp-1">{unit.description}</div>
                          
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                            <div className="flex flex-col">
                              <span className="text-xl font-black text-brand-950">EGP {unit.basePrice.toLocaleString()}</span>
                              <span className="text-[10px] uppercase font-bold text-gray-400">لليلة الواحدة</span>
                            </div>
                            <Button size="sm" className="rounded-xl font-bold bg-gray-100 text-brand-950 hover:bg-brand-950 hover:text-white transition-colors">
                              اختيار
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Map View Dummy Map */}
          {viewMode === 'map' && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              className="flex-1 rounded-[2rem] overflow-hidden sticky lg:top-48 bg-gray-200 border border-gray-200 h-[calc(100vh-200px)] lg:h-auto shadow-inner relative"
            >
              {/* Dummy Map Visualizer - Just an image to look like google maps */}
              <img 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2074&auto=format&fit=crop" 
                alt="Map Area" 
                className="w-full h-full object-cover opacity-60 saturate-50 mix-blend-multiply" 
              />
              
              {/* Fake Map Markers */}
              {MOCK_UNITS.map((unit, idx) => (
                <Link href={`/units/${unit.id}`} key={unit.id}>
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.8 + (idx * 0.1) }}
                    className="absolute bg-white px-3 py-1.5 rounded-full shadow-lg font-black text-brand-950 text-sm border border-gray-100 hover:scale-110 hover:bg-brand-950 hover:text-white transition-all cursor-pointer z-10 flex items-center justify-center"
                    style={{ 
                      top: `${30 + (idx * 15)}%`, 
                      left: `${20 + (idx * 20)}%` 
                    }}
                  >
                    EGP {unit.basePrice}
                  </motion.div>
                </Link>
              ))}

              {/* Map Floating UI */}
              <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
                 <button className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center font-bold text-xl hover:bg-gray-50">+</button>
                 <button className="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center font-bold text-xl hover:bg-gray-50">-</button>
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