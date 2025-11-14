import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface InteractiveCardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  variant?: "default" | "hover-lift" | "hover-glow";
}

export const InteractiveCard = ({
  children,
  onClick,
  className,
  variant = "hover-lift",
}: InteractiveCardProps) => {
  const variants = {
    default: "",
    "hover-lift": "hover:shadow-lg hover:-translate-y-1",
    "hover-glow": "hover:shadow-[0_0_20px_rgba(3,255,246,0.3)] hover:border-primary/50",
  };

  return (
    <Card
      onClick={onClick}
      className={cn(
        "transition-all duration-300 cursor-pointer active:scale-[0.98]",
        variants[variant],
        onClick && "hover:border-primary/30",
        className
      )}
    >
      {children}
    </Card>
  );
};
