import { ReactNode } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface VisualSectionProps {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "info" | "primary";
  badge?: ReactNode;
}

const variantStyles = {
  default: "border-l-4 border-l-border",
  success: "border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/20",
  warning: "border-l-4 border-l-orange-500 bg-orange-50 dark:bg-orange-950/20",
  info: "border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-950/20",
  primary: "border-l-4 border-l-primary bg-primary/5"
};

const iconStyles = {
  default: "text-foreground",
  success: "text-green-600 dark:text-green-400",
  warning: "text-orange-600 dark:text-orange-400",
  info: "text-blue-600 dark:text-blue-400",
  primary: "text-primary"
};

export const VisualSection = ({ 
  icon: Icon, 
  title, 
  children, 
  variant = "default",
  badge 
}: VisualSectionProps) => {
  return (
    <Card className={cn("animate-fade-in", variantStyles[variant])}>
      <CardHeader className="flex flex-row items-center gap-3 pb-3">
        <Icon className={cn("w-6 h-6 shrink-0", iconStyles[variant])} />
        <CardTitle className="text-xl flex-1">{title}</CardTitle>
        {badge}
      </CardHeader>
      <CardContent className="space-y-3">
        {children}
      </CardContent>
    </Card>
  );
};
