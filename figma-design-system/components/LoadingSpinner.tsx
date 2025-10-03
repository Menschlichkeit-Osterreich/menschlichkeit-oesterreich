import React from 'react';
import { motion } from 'motion/react';
import { Loader2, TreePine } from 'lucide-react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  fullScreen?: boolean;
  variant?: 'default' | 'brand';
}

export function LoadingSpinner({ 
  size = 'md', 
  text, 
  fullScreen = false,
  variant = 'default'
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm'
    : 'flex items-center justify-center p-4';

  if (variant === 'brand') {
    return (
      <div className={containerClasses}>
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 180, 360]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
            className="relative"
          >
            <div className={`${sizeClasses[size]} bg-brand-gradient rounded-xl flex items-center justify-center shadow-lg`}>
              <TreePine className={`${sizeClasses[size === 'sm' ? 'sm' : size === 'md' ? 'sm' : size === 'lg' ? 'md' : 'lg']} text-white`} fill="currentColor" />
            </div>
            {/* Pulse rings */}
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-brand-orange"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 0, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut'
              }}
            />
            <motion.div
              className="absolute inset-0 rounded-xl border-2 border-brand-red"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.7, 0, 0.7]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: 1
              }}
            />
          </motion.div>
          {text && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-muted-foreground"
            >
              {text}
            </motion.p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center gap-3">
        <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
        {text && (
          <p className="text-sm text-muted-foreground">{text}</p>
        )}
      </div>
    </div>
  );
}

// Skeleton Loader für Content
export function SkeletonLoader({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-muted rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-muted rounded w-5/6"></div>
    </div>
  );
}

// Card Skeleton
export function CardSkeleton() {
  return (
    <div className="card-modern p-6 animate-pulse">
      <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-muted rounded"></div>
        <div className="h-4 bg-muted rounded w-5/6"></div>
        <div className="h-4 bg-muted rounded w-3/4"></div>
      </div>
    </div>
  );
}

export default LoadingSpinner;