"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { ProductImage } from "@/types/product";
import { cn } from "@/lib/utils";

interface ProductImageGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductImageGallery({ images, productName }: ProductImageGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const activeImage = images[activeIndex];
  const hasMultiple = images.length > 1;

  function goPrev() {
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  }

  function goNext() {
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  }

  if (images.length === 0) {
    return (
      <div className="aspect-square w-full rounded-2xl bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <span className="text-6xl">🥦</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative group aspect-square w-full overflow-hidden rounded-2xl bg-gray-50 border border-gray-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            <Image
              src={activeImage.url}
              alt={activeImage.alt ?? productName}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              unoptimized
            />
          </motion.div>
        </AnimatePresence>

        {/* Zoom button */}
        <button
          onClick={() => setLightboxOpen(true)}
          className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-xl bg-white/90 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Phóng to ảnh"
        >
          <ZoomIn className="h-4 w-4 text-gray-600" />
        </button>

        {/* Nav arrows */}
        {hasMultiple && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="Ảnh sau"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}

        {/* Dot indicators */}
        {hasMultiple && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === activeIndex ? "w-4 bg-[#22c55e]" : "w-1.5 bg-white/70"
                )}
                aria-label={`Ảnh ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {hasMultiple && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={cn(
                "shrink-0 h-16 w-16 rounded-xl overflow-hidden border-2 transition-all",
                i === activeIndex
                  ? "border-[#22c55e] shadow-md"
                  : "border-transparent hover:border-gray-300"
              )}
              aria-label={`Xem ảnh ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={img.alt ?? `${productName} ${i + 1}`}
                width={64}
                height={64}
                className="h-full w-full object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
            onClick={() => setLightboxOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-3xl w-full max-h-[90vh] aspect-square"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={activeImage.url}
                alt={activeImage.alt ?? productName}
                fill
                className="object-contain"
                unoptimized
              />
              <button
                onClick={() => setLightboxOpen(false)}
                className="absolute top-2 right-2 flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
                aria-label="Đóng"
              >
                ✕
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
