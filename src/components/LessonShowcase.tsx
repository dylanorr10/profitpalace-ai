import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, ChevronRight } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface Lesson {
  id: string;
  title: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: number;
  emoji: string;
  order_index: number;
}

interface LessonShowcaseProps {
  lessons: Lesson[];
  onLessonClick?: (lessonId: string) => void;
}

export const LessonShowcase = ({ lessons, onLessonClick }: LessonShowcaseProps) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "Intermediate":
        return "bg-yellow-500/10 text-yellow-600 border-yellow-500/20";
      case "Advanced":
        return "bg-red-500/10 text-red-600 border-red-500/20";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const showcaseLessons = lessons.slice(0, 10);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">See What You'll Learn</h2>
          <p className="text-sm text-muted-foreground">Bite-sized lessons tailored for UK business owners</p>
        </div>
      </div>

      <ScrollArea className="w-full whitespace-nowrap rounded-lg">
        <div className="flex gap-4 pb-4">
          {showcaseLessons.map((lesson, index) => (
            <Card
              key={lesson.id}
              className="inline-block w-[280px] p-4 cursor-pointer hover:shadow-lg hover:border-primary/30 transition-all hover:-translate-y-1 animate-fade-in touch-manipulation"
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => onLessonClick?.(lesson.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{lesson.emoji}</div>
                <Badge className={getDifficultyColor(lesson.difficulty)} variant="outline">
                  {lesson.difficulty}
                </Badge>
              </div>

              <h3 className="font-semibold text-base mb-2 line-clamp-2 whitespace-normal">
                {lesson.title}
              </h3>

              <div className="flex items-center justify-between mt-3 pt-3 border-t">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{lesson.duration} min</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {lesson.category}
                </Badge>
              </div>

              <div className="flex items-center justify-end mt-2 text-xs text-primary">
                Start Lesson
                <ChevronRight className="w-3 h-3 ml-1" />
              </div>
            </Card>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
