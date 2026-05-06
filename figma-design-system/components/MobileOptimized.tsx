import React from 'react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';

/**
 * Mobile-Optimized Wrapper Components
 * Optimiert für Touch-Interaktion und kleinere Bildschirme
 */

interface MobileContainerProps {
  children: React.ReactNode;
  className?: string;
}

// Mobile-optimierter Container mit besserem Padding
export function MobileContainer({ children, className = '' }: MobileContainerProps) {
  return (
    <div className={`container-mobile ${className}`}>
      {children}
    </div>
  );
}

interface MobileCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

// Mobile-optimierte Karte mit Touch-Feedback
export function MobileCard({ children, className = '', onClick }: MobileCardProps) {
  return (
    <motion.div
      whileTap={{ scale: onClick ? 0.98 : 1 }}
      transition={{ duration: 0.1 }}
    >
      <Card 
        className={`card-mobile touch-spacing ${onClick ? 'cursor-pointer' : ''} ${className}`}
        onClick={onClick}
      >
        {children}
      </Card>
    </motion.div>
  );
}

interface MobileButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'ghost';
  fullWidth?: boolean;
  className?: string;
}

// Touch-optimierter Button (min 44px height)
export function MobileButton({ 
  children, 
  onClick, 
  variant = 'default', 
  fullWidth = false,
  className = '' 
}: MobileButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant={variant}
      className={`btn-touch ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {children}
    </Button>
  );
}

interface MobileGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3;
  className?: string;
}

// Responsive Grid mit Mobile-First
export function MobileGrid({ children, columns = 3, className = '' }: MobileGridProps) {
  const gridClass = columns === 2 ? 'grid-tablet' : 'grid-mobile';
  
  return (
    <div className={`${gridClass} ${className}`}>
      {children}
    </div>
  );
}

interface MobileStackProps {
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Vertikaler Stack für Mobile, horizontal für Desktop
export function MobileStack({ children, spacing = 'md', className = '' }: MobileStackProps) {
  const spacingClass = {
    sm: 'gap-2 md:gap-3',
    md: 'gap-4 md:gap-6',
    lg: 'gap-6 md:gap-8'
  }[spacing];

  return (
    <div className={`stack-mobile ${spacingClass} ${className}`}>
      {children}
    </div>
  );
}

interface MobileSectionProps {
  children: React.ReactNode;
  padding?: 'sm' | 'md' | 'lg';
  className?: string;
}

// Section mit Mobile-optimiertem Padding
export function MobileSection({ children, padding = 'md', className = '' }: MobileSectionProps) {
  const paddingClass = {
    sm: 'section-padding-sm',
    md: 'section-padding',
    lg: 'section-padding-lg'
  }[padding];

  return (
    <section className={`${paddingClass} ${className}`}>
      {children}
    </section>
  );
}

interface ResponsiveTextProps {
  children: React.ReactNode;
  variant?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'lead';
  className?: string;
}

// Responsive Text mit automatischer Mobile-Anpassung
export function ResponsiveText({ children, variant = 'p', className = '' }: ResponsiveTextProps) {
  const Component = variant === 'lead' ? 'p' : variant;
  const variantClass = variant === 'lead' ? 'lead' : '';
  
  return React.createElement(
    Component,
    { className: `${variantClass} ${className}` },
    children
  );
}

// Touch-optimierte Card mit Swipe-Unterstützung (placeholder für zukünftige Implementierung)
export function SwipeableCard({ children, onSwipeLeft, onSwipeRight, className = '' }: {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  className?: string;
}) {
  // Einfache Implementierung ohne externe Library
  return (
    <MobileCard className={className}>
      {children}
    </MobileCard>
  );
}

// Bottom Sheet für Mobile (Alternative zu Modal auf kleinen Bildschirmen)
export function MobileBottomSheet({ 
  isOpen, 
  onClose, 
  children,
  title 
}: {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/50 md:hidden"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {title && (
          <CardHeader className="px-0 pt-0">
            <CardTitle>{title}</CardTitle>
          </CardHeader>
        )}
        <CardContent className="px-0">
          {children}
        </CardContent>
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-12 h-1 bg-muted-foreground/30 rounded-full" />
      </motion.div>
    </motion.div>
  );
}

// Floating Action Button (FAB) für Mobile
export function FloatingActionButton({ 
  onClick, 
  icon, 
  label,
  position = 'bottom-right' 
}: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  position?: 'bottom-right' | 'bottom-left';
}) {
  const positionClass = position === 'bottom-right' 
    ? 'bottom-6 right-6' 
    : 'bottom-6 left-6';

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`fixed ${positionClass} z-40 w-14 h-14 rounded-full bg-brand-gradient shadow-lg flex items-center justify-center md:hidden`}
      aria-label={label}
    >
      {icon}
    </motion.button>
  );
}

// Mobile-optimierte Tab-Navigation (Horizontal Scroll)
export function MobileTabNav({ 
  tabs, 
  activeTab, 
  onChange 
}: {
  tabs: Array<{ id: string; label: string; icon?: React.ReactNode }>;
  activeTab: string;
  onChange: (tabId: string) => void;
}) {
  return (
    <div className="scroll-mobile flex gap-2 pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap
            transition-all min-h-[44px]
            ${activeTab === tab.id 
              ? 'bg-primary text-primary-foreground' 
              : 'bg-muted text-muted-foreground hover:bg-muted-hover'
            }
          `}
        >
          {tab.icon}
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

export default {
  MobileContainer,
  MobileCard,
  MobileButton,
  MobileGrid,
  MobileStack,
  MobileSection,
  ResponsiveText,
  SwipeableCard,
  MobileBottomSheet,
  FloatingActionButton,
  MobileTabNav
};({ 
  tabs, 
  activeTab, 
  onTabChange 
}: {
  tabs: Array<{ id: string; label: string; icon?: React.ReactNode }>;
  activeTab: string;
  onTabChange: (tabId: string) => void;
}) {
  return (
    <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
      <div className="flex gap-2 min-w-max md:min-w-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 rounded-lg whitespace-nowrap transition-all
              ${activeTab === tab.id 
                ? 'bg-primary text-primary-foreground shadow-md' 
                : 'bg-muted text-muted-foreground hover:bg-muted-hover'
              }
            `}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// Sticky Header für Mobile (bleibt beim Scrollen oben)
export function MobileStickyHeader({ 
  children, 
  className = '' 
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b py-4 -mx-4 px-4 md:static md:bg-transparent md:backdrop-blur-none md:border-0 md:mx-0 md:px-0 ${className}`}>
      {children}
    </div>
  );
}

// Pull-to-Refresh Indicator (Visual Feedback)
export function PullToRefreshIndicator({ isRefreshing }: { isRefreshing: boolean }) {
  if (!isRefreshing) return null;

  return (
    <div className="fixed top-16 left-0 right-0 z-40 flex justify-center py-2 bg-primary/10 backdrop-blur-sm">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full"
      />
    </div>
  );
}

export default {
  MobileContainer,
  MobileCard,
  MobileButton,
  MobileGrid,
  MobileStack,
  MobileSection,
  ResponsiveText,
  SwipeableCard,
  MobileBottomSheet,
  FloatingActionButton,
  MobileTabNav,
  MobileStickyHeader,
  PullToRefreshIndicator
};