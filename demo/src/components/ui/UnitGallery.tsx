'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function UnitGallery({ images }: { images: string[] }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:h-[500px] rounded-2xl overflow-hidden group">
        <div 
          className="md:col-span-2 h-[300px] md:h-full relative overflow-hidden cursor-pointer"
          onClick={() => openLightbox(0)}
        >
          <img src={images[0]} alt="Main" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
        </div>
        <div className="hidden md:flex flex-col gap-2 h-full">
          <div 
            className="h-[calc(50%-0.25rem)] relative overflow-hidden cursor-pointer"
            onClick={() => openLightbox(1)}
          >
            <img src={images[1]} alt="Gallery 1" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
          <div 
            className="h-[calc(50%-0.25rem)] relative overflow-hidden cursor-pointer"
            onClick={() => openLightbox(2)}
          >
            <img src={images[2]} alt="Gallery 2" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
        </div>
        <div className="hidden md:flex flex-col gap-2 h-full">
          <div 
            className="h-[calc(50%-0.25rem)] relative overflow-hidden cursor-pointer"
            onClick={() => openLightbox(3)}
          >
            <img src={images[3]} alt="Gallery 3" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </div>
          <div 
            className="h-[calc(50%-0.25rem)] relative overflow-hidden cursor-pointer"
            onClick={() => openLightbox(4)}
          >
            <img src={images[4]} alt="Gallery 4" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute bottom-4 right-4">
              <Button 
                variant="outline" 
                className="bg-white/90 backdrop-blur-md border-none text-brand-950 font-bold hover:bg-white shadow-lg"
                onClick={(e) => {
                  e.stopPropagation();
                  openLightbox(0);
                }}
              >
                عرض كل التشكيلة
              </Button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col backdrop-blur-sm"
          >
            <div className="flex justify-between items-center p-6 text-white absolute top-0 w-full z-10">
              <div className="font-medium text-sm text-gray-300">
                {currentIndex + 1} / {images.length}
              </div>
              <button 
                onClick={closeLightbox}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 flex items-center justify-center relative px-4" onClick={closeLightbox}>
              <button 
                onClick={prevImage}
                className="absolute left-6 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10 hidden md:block"
              >
                <ChevronLeft size={32} />
              </button>

              <motion.img
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={images[currentIndex]}
                alt={`Image ${currentIndex + 1}`}
                className="max-h-[85vh] max-w-full object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />

              <button 
                onClick={nextImage}
                className="absolute right-6 p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10 hidden md:block"
              >
                <ChevronRight size={32} />
              </button>
            </div>
            
            {/* Mobile swipe hints or generic footer */}
            <div className="absolute bottom-6 flex justify-center w-full z-10 md:hidden">
              <div className="flex gap-2">
                {images.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`w-2 h-2 rounded-full ${idx === currentIndex ? 'bg-white' : 'bg-white/30'}`} 
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}