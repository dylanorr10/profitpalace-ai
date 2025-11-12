/**
 * Mobile-first optimization utilities and best practices
 * 
 * Key mobile-first principles implemented:
 * 1. Touch targets: Minimum 48px (12 in Tailwind = 48px)
 * 2. Text size: Minimum 16px to prevent zoom on input focus
 * 3. One-thumb navigation: Bottom-aligned CTAs, sticky headers
 * 4. No horizontal scroll: max-w-full, overflow-x-hidden
 * 5. Responsive spacing: Larger touch areas on mobile
 */

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface MobileContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * Mobile-optimized container with proper spacing and no horizontal scroll
 */
export const MobileContainer = ({ children, className }: MobileContainerProps) => {
  return (
    <div className={cn(
      "w-full max-w-full overflow-x-hidden",
      "px-4 md:px-6 lg:px-8", // Progressive spacing
      className
    )}>
      {children}
    </div>
  );
};

interface TouchTargetProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
}

/**
 * Ensures minimum 48px touch target for mobile accessibility
 */
export const TouchTarget = ({ children, onClick, className, disabled }: TouchTargetProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "min-h-[48px] min-w-[48px]",
        "flex items-center justify-center",
        "touch-manipulation", // Optimizes touch behavior
        "active:scale-95 transition-transform", // Touch feedback
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </button>
  );
};

interface StickyHeaderProps {
  children: ReactNode;
  className?: string;
}

/**
 * Sticky header optimized for mobile one-thumb navigation
 */
export const StickyHeader = ({ children, className }: StickyHeaderProps) => {
  return (
    <header className={cn(
      "sticky top-0 z-50",
      "bg-background/95 backdrop-blur-sm",
      "border-b border-border",
      "h-14 md:h-16", // Compact on mobile
      className
    )}>
      <div className="container mx-auto px-4 h-full flex items-center">
        {children}
      </div>
    </header>
  );
};

interface BottomCTAProps {
  children: ReactNode;
  className?: string;
}

/**
 * Bottom-aligned CTA for easy thumb access on mobile
 */
export const BottomCTA = ({ children, className }: BottomCTAProps) => {
  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-40",
      "bg-background/95 backdrop-blur-sm",
      "border-t border-border",
      "p-4 pb-safe", // Safe area padding for iOS
      "md:relative md:p-0 md:border-0", // Normal on desktop
      className
    )}>
      {children}
    </div>
  );
};

/**
 * CSS utilities for mobile optimization
 */
export const mobileOptimizedClasses = {
  // Prevent horizontal scroll
  noHorizontalScroll: "max-w-full overflow-x-hidden",
  
  // Touch-friendly spacing
  touchSpacing: "space-y-3 md:space-y-4",
  
  // Minimum text size (prevents zoom on iOS)
  minTextSize: "text-base", // 16px
  
  // Touch target
  touchTarget: "min-h-[48px] min-w-[48px]",
  
  // One-thumb reach zone (bottom third of screen)
  thumbZone: "sticky bottom-0 pb-safe",
  
  // Active touch feedback
  touchFeedback: "active:scale-95 transition-transform touch-manipulation",
};
