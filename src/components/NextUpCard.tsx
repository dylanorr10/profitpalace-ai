import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import reelinLogo from "@/assets/reelin-logo.jpg";

interface Lesson {
  id: string;
  title: string;
  emoji: string;
  duration: number;
  difficulty: string;
  category: string;
}

interface NextUpCardProps {
  lesson: Lesson;
  reason?: string;
  isInProgress?: boolean;
  progressPercent?: number;
}

export const NextUpCard = ({ lesson, reason, isInProgress = false, progressPercent = 0 }: NextUpCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-2 border-primary/20 hover:border-primary/40 transition-all">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
      
      <div className="relative p-4 md:p-8">
        <div className="flex items-start justify-between mb-4 gap-2">
          <Badge variant="secondary" className="mb-2 gap-1.5 flex-shrink-0">
            <img src={reelinLogo} alt="" className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full object-contain" />
            <span className="text-xs md:text-sm">Next Up</span>
          </Badge>
          {reason && (
            <Badge variant="outline" className="text-xs flex-shrink-0">
              {reason}
            </Badge>
          )}
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6 items-start mb-6">
          <div className="text-5xl md:text-7xl">{lesson.emoji}</div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl md:text-3xl font-bold mb-2 md:mb-3 leading-tight">
              {lesson.title}
            </h3>
            
            <div className="flex flex-wrap gap-2 md:gap-3 mb-4">
              <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                <Clock className="w-3.5 h-3.5 md:w-4 md:h-4" />
                <span>{lesson.duration} minutes</span>
              </div>
              <Badge variant="outline" className="text-xs">{lesson.difficulty}</Badge>
              <Badge variant="outline" className="text-xs">{lesson.category}</Badge>
            </div>

            {isInProgress && progressPercent > 0 && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-xs md:text-sm mb-2">
                  <span className="text-muted-foreground">Your progress</span>
                  <span className="font-medium">{progressPercent}%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Button 
            size="lg" 
            className="flex-1 h-12 md:h-14 text-base md:text-lg"
            onClick={() => navigate(`/lesson/${lesson.id}`)}
          >
            {isInProgress ? "Continue Learning" : "Start Lesson"} →
          </Button>
          {isInProgress && (
            <Button 
              size="lg" 
              variant="outline"
              className="h-12 md:h-14 px-4"
              onClick={() => navigate(`/lesson/${lesson.id}`)}
            >
              <TrendingUp className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
