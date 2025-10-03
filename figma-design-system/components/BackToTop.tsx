import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUp } from 'lucide-react';
import { Button } from './ui/button';

interface BackToTopProps {
  showAfter?: number; // Pixel-Wert ab wann Button erscheint
}

export function BackToTop({ showAfter = 400 }: BackToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > showAfter) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, [showAfter]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-6 right-6 z-40 md:bottom-8 md:right-8"
          style={{
            bottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
          }}
        >
          <Button
            onClick={scrollToTop}
            size="icon"
            className="btn-primary-gradient shadow-lg h-12 w-12 rounded-full"
            aria-label="Nach oben scrollen"
          >
            <ArrowUp className="w-5 h-5" />
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default BackToTop;