import { AlertCircle, Clock, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { SeasonalTrigger } from "@/utils/seasonalTriggers";
import { ThresholdTrigger } from "@/utils/proactiveTriggers";

interface UrgentBannerProps {
  triggers: (SeasonalTrigger | ThresholdTrigger)[];
  onActionClick?: (lessonId: string) => void;
}

export const UrgentBanner = ({ triggers, onActionClick }: UrgentBannerProps) => {
  if (triggers.length === 0) return null;

  const urgentTrigger = triggers[0]; // Show the most urgent one

  const getIcon = () => {
    switch (urgentTrigger.priority) {
      case "urgent":
        return <AlertCircle className="h-5 w-5" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };

  const getVariant = () => {
    return urgentTrigger.priority === "urgent" ? "destructive" : "default";
  };

  return (
    <Alert variant={getVariant()} className="mb-6">
      {getIcon()}
      <AlertTitle>{urgentTrigger.title}</AlertTitle>
      <AlertDescription className="mt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <span>{urgentTrigger.message}</span>
        {urgentTrigger.lessonIds.length > 0 && onActionClick && (
          <Button
            size="sm"
            variant={urgentTrigger.priority === "urgent" ? "secondary" : "outline"}
            onClick={() => onActionClick(urgentTrigger.lessonIds[0])}
          >
            Start Lesson
          </Button>
        )}
      </AlertDescription>
      {urgentTrigger.daysUntilExpiry && urgentTrigger.daysUntilExpiry <= 14 && (
        <p className="text-xs text-muted-foreground mt-2">
          ⏰ {urgentTrigger.daysUntilExpiry} days remaining
        </p>
      )}
    </Alert>
  );
};
