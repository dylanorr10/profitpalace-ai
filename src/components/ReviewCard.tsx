import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { ReviewLesson, getMasteryLabel, getMasteryColor } from "@/utils/reviewSchedule";
import { Brain, Calendar, Target } from "lucide-react";

interface ReviewCardProps {
  reviewLessons: ReviewLesson[];
}

export const ReviewCard = ({ reviewLessons }: ReviewCardProps) => {
  const navigate = useNavigate();

  if (reviewLessons.length === 0) {
    return null;
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-6 h-6 text-purple-500" />
          <h3 className="text-xl font-bold text-foreground">Review Mode</h3>
        </div>
        <Badge variant="secondary" className="bg-purple-500/20 text-purple-500 border-purple-500/30">
          {reviewLessons.length} {reviewLessons.length === 1 ? "lesson" : "lessons"} due
        </Badge>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        These lessons are ready for review to strengthen your memory. Complete them to improve your mastery level!
      </p>

      <div className="space-y-3 mb-4">
        {reviewLessons.slice(0, 3).map((lesson) => (
          <div
            key={lesson.id}
            className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border hover:border-purple-500/30 transition-colors cursor-pointer"
            onClick={() => navigate(`/lesson/${lesson.id}`)}
          >
            <div className="flex items-center gap-3 flex-1">
              <span className="text-2xl">{lesson.emoji}</span>
              <div className="flex-1">
                <h4 className="font-semibold text-sm text-foreground">{lesson.title}</h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">
                    {lesson.category}
                  </Badge>
                  <span className={`text-xs font-medium ${getMasteryColor(lesson.masteryLevel)}`}>
                    {getMasteryLabel(lesson.masteryLevel)}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Target className="w-3 h-3" />
              <span>Score: {lesson.lastScore}%</span>
            </div>
          </div>
        ))}
      </div>

      {reviewLessons.length > 3 && (
        <p className="text-xs text-muted-foreground mb-4">
          + {reviewLessons.length - 3} more {reviewLessons.length - 3 === 1 ? "lesson" : "lessons"} due for review
        </p>
      )}

      <Button
        onClick={() => navigate(`/lesson/${reviewLessons[0].id}`)}
        className="w-full bg-purple-500 hover:bg-purple-600 text-white"
      >
        Start Reviewing
      </Button>
    </Card>
  );
};
