import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';

interface ScrollProgressProps {
  color?: string;
  height?: number;
  position?: 'top' | 'bottom';
  ariaLabel?: string;
}

export function ScrollProgress({ 
  color = 'var(--brand-gradient)',
  height = 3,
  position = 'top',
  ariaLabel = 'Scrollfortschritt'
}: ScrollProgressProps) {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    return scrollYProgress.on('change', (latest: number) => {
      setProgress(Math.round(latest * 100));
    });
  }, [scrollYProgress]);

  const positionClass = position === 'top' ? 'top-0' : 'bottom-0';

  return (
    <motion.div
      className={`scroll-progress fixed left-0 right-0 ${positionClass} z-50`}
      style={{
        height: `${height}px`,
        background: 'var(--muted)',
      }}
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuenow={progress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className="scroll-progress-bar h-full"
        style={{
          scaleX,
          transformOrigin: '0%',
          background: color,
        }}
        aria-hidden="true"
      />
    </motion.div>
  );
}

export default ScrollProgress;