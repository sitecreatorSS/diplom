'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductImageSliderProps {
  images: { url: string; alt?: string }[];
  className?: string;
}

export function ProductImageSlider({ images, className = '' }: ProductImageSliderProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const nextImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDirection(1);
    setCurrentImageIndex((prevIndex) =>
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDirection(-1);
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Auto-advance images every 5 seconds when not hovered
  useEffect(() => {
    if (images.length <= 1) return;
    
    const timer = setInterval(() => {
      if (!isHovered) {
        nextImage();
      }
    }, 5000);
    
    return () => clearInterval(timer);
  }, [currentImageIndex, isHovered, images.length]);

  if (!images || images.length === 0) {
    return (
      <div className={`w-full h-full bg-gray-100 flex items-center justify-center ${className}`}>
        <span className="text-gray-400">Изображение отсутствует</span>
      </div>
    );
  }

  return (
    <div 
      className={`relative w-full h-full overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={currentImageIndex}
          custom={direction}
          initial={{ opacity: 0, x: direction > 0 ? 100 : -100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: direction > 0 ? -100 : 100 }}
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="w-full h-full"
        >
          {/* Placeholder for the Image component */}
        </motion.div>
      </AnimatePresence>

      {images.length > 1 && (
        <>
          {/* Navigation Arrows */}
          <AnimatePresence>
            {isHovered && (
              <>
                <motion.button
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 0.8 }}
                  exit={{ x: -20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full shadow-lg z-10 transition-all hover:scale-110 backdrop-blur-sm"
                  aria-label="Предыдущее изображение"
                >
                  <ChevronLeft className="w-5 h-5" />
                </motion.button>
                <motion.button
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 0.8 }}
                  exit={{ x: 20, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full shadow-lg z-10 transition-all hover:scale-110 backdrop-blur-sm"
                  aria-label="Следующее изображение"
                >
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </>
            )}
          </AnimatePresence>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 px-2">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setDirection(index > currentImageIndex ? 1 : -1);
                  setCurrentImageIndex(index);
                }}
                className={`h-1 rounded-full transition-all ${
                  index === currentImageIndex 
                    ? 'bg-white w-6 shadow-md' 
                    : 'bg-white/50 w-3 hover:bg-white/75'
                }`}
                aria-label={`Перейти к изображению ${index + 1}`}
                aria-current={index === currentImageIndex}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
