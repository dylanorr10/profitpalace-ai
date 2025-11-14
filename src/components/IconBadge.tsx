import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface IconBadgeProps {
  icon: LucideIcon;
  variant?: "default" | "primary" | "success" | "warning" | "muted";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const variantStyles = {
  default: "bg-secondary text-secondary-foreground",
  primary: "bg-primary/10 text-primary",
  success: "bg-green-100 dark:bg-green-950/30 text-green-600 dark:text-green-400",
  warning: "bg-orange-100 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400",
  muted: "bg-muted text-muted-foreground",
};

const sizeStyles = {
  sm: "p-1.5",
  md: "p-2",
  lg: "p-3",
};

const iconSizes = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-6 h-6",
};

export const IconBadge = ({
  icon: Icon,
  variant = "default",
  size = "md",
  className,
}: IconBadgeProps) => {
  return (
    <div
      className={cn(
        "rounded-lg inline-flex items-center justify-center shrink-0",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
    >
      <Icon className={iconSizes[size]} />
    </div>
  );
};
