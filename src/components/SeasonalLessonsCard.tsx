import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, X, ArrowRight, AlertCircle } from "lucide-react";
import { SeasonalLessonGroup } from "@/utils/seasonalLessons";

interface SeasonalLessonsCardProps {
  seasonalGroups: SeasonalLessonGroup[];
  onLessonClick: (lessonId: string) => void;
  onDismiss?: (groupId: string) => void;
  isSubscribed?: boolean;
}

export const SeasonalLessonsCard = ({ 
  seasonalGroups, 
  onLessonClick, 
  onDismiss,
  isSubscribed = true 
}: SeasonalLessonsCardProps) => {
  if (seasonalGroups.length === 0) return null;

  // Show the most urgent group
  const primaryGroup = seasonalGroups[0];

  const getUrgencyStyles = (urgency: string) => {
    switch (urgency) {
      case "urgent":
        return {
          border: "border-destructive/30",
          gradient: "bg-gradient-to-br from-destructive/20 to-destructive/10",
          badge: "bg-destructive text-destructive-foreground",
          textColor: "text-destructive",
        };
      case "important":
        return {
          border: "border-orange-500/30",
          gradient: "bg-gradient-to-br from-orange-500/20 to-orange-500/10",
          badge: "bg-orange-500/10 text-orange-600 border-orange-500/20",
          textColor: "text-orange-600",
        };
      default:
        return {
          border: "border-primary/30",
          gradient: "bg-gradient-to-br from-primary/20 to-primary/10",
          badge: "bg-primary/10 text-primary border-primary/20",
          textColor: "text-primary",
        };
    }
  };

  const styles = getUrgencyStyles(primaryGroup.urgency);

  return (
    <Card className={`${styles.border} ${styles.gradient} overflow-hidden transition-all hover:shadow-lg mb-8`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <div className={`text-3xl ${primaryGroup.urgency === 'urgent' ? 'animate-pulse' : ''}`}>
              {primaryGroup.emoji}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-xl">{primaryGroup.title}</CardTitle>
                {primaryGroup.urgency === "urgent" && (
                  <Badge variant="destructive" className="animate-pulse">
                    URGENT
                  </Badge>
                )}
              </div>
              {primaryGroup.daysRemaining !== undefined && (
                <div className={`flex items-center gap-1 text-sm font-medium ${styles.textColor}`}>
                  <Clock className="w-4 h-4" />
                  <span>{primaryGroup.daysRemaining} day{primaryGroup.daysRemaining !== 1 ? 's' : ''} remaining</span>
                </div>
              )}
            </div>
          </div>
          
          {primaryGroup.dismissible && onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 shrink-0"
              onClick={() => onDismiss(primaryGroup.id)}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Message */}
        <div className="p-4 bg-background/50 rounded-lg border">
          <p className="text-sm font-medium">
            {primaryGroup.message}
          </p>
        </div>

        {/* Lessons List */}
        <div className="space-y-2">
          {primaryGroup.lessons.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => onLessonClick(lesson.id)}
              className="w-full p-3 bg-background/50 hover:bg-background rounded-lg border transition-all hover:shadow-sm text-left group"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-xl shrink-0">{lesson.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-sm group-hover:text-primary transition-colors truncate">
                        {lesson.title}
                      </p>
                      <Badge variant="secondary" className="text-xs bg-primary/10 text-primary border-primary/20 shrink-0">
                        🎁 Seasonal Bonus
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{lesson.duration} min</span>
                      <Badge variant="outline" className="text-xs">
                        {lesson.difficulty}
                      </Badge>
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </div>
            </button>
          ))}
        </div>

        {/* CTA Button */}
        <div className="flex items-center justify-between pt-2">
          <Button 
            onClick={() => onLessonClick(primaryGroup.lessons[0].id)}
            className="w-full sm:w-auto"
            variant={primaryGroup.urgency === "urgent" ? "default" : "outline"}
          >
            {isSubscribed ? "Start First Lesson" : "Unlock Lessons"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
          
          {!isSubscribed && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertCircle className="w-3 h-3" />
              <span>Subscribe to access</span>
            </div>
          )}
        </div>

        {/* Show count if there are more groups */}
        {seasonalGroups.length > 1 && (
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground text-center">
              +{seasonalGroups.length - 1} more seasonal topic{seasonalGroups.length > 2 ? 's' : ''} available
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
