import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Circle, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PathLesson {
  id: string;
  title: string;
  emoji: string;
  status: 'completed' | 'current' | 'next' | 'locked';
}

interface JourneyPathProps {
  lessons: PathLesson[];
}

export const JourneyPath = ({ lessons }: JourneyPathProps) => {
  const navigate = useNavigate();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/20 text-success border-success';
      case 'current':
        return 'bg-primary/20 text-primary border-primary';
      case 'next':
        return 'bg-muted text-muted-foreground border-border';
      case 'locked':
        return 'bg-muted/50 text-muted-foreground border-muted';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'current':
        return <Circle className="w-5 h-5 fill-current" />;
      case 'next':
        return <Circle className="w-5 h-5" />;
      case 'locked':
        return <Lock className="w-4 h-4" />;
      default:
        return <Circle className="w-5 h-5" />;
    }
  };

  return (
    <Card className="p-6 mb-8">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        Your Learning Path
        <Badge variant="secondary" className="ml-2">
          {lessons.filter(l => l.status === 'completed').length} of {lessons.length} complete
        </Badge>
      </h3>

      <div className="relative">
        {/* Connection line */}
        <div className="absolute top-8 left-0 right-0 h-0.5 bg-border" />
        
        {/* Lessons */}
        <div className="relative flex justify-between gap-4 overflow-x-auto pb-4">
          {lessons.map((lesson, index) => (
            <div key={lesson.id} className="flex flex-col items-center min-w-[120px]">
              {/* Lesson Circle */}
              <button
                onClick={() => lesson.status !== 'locked' && navigate(`/lesson/${lesson.id}`)}
                disabled={lesson.status === 'locked'}
                className={`
                  relative w-16 h-16 rounded-full border-2 flex items-center justify-center
                  transition-all duration-300 mb-3
                  ${getStatusColor(lesson.status)}
                  ${lesson.status !== 'locked' ? 'hover:scale-110 cursor-pointer' : 'cursor-not-allowed opacity-50'}
                  ${lesson.status === 'current' ? 'ring-4 ring-primary/20 animate-pulse' : ''}
                `}
              >
                {lesson.status === 'locked' ? (
                  getStatusIcon(lesson.status)
                ) : (
                  <span className="text-2xl">{lesson.emoji}</span>
                )}
                {lesson.status === 'completed' && (
                  <div className="absolute -top-1 -right-1 bg-success rounded-full p-0.5">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
              </button>

              {/* Status Badge */}
              <Badge 
                variant={lesson.status === 'current' ? 'default' : 'outline'} 
                className="mb-2 text-xs"
              >
                {lesson.status === 'completed' ? '✓ Done' : 
                 lesson.status === 'current' ? '▶ Current' :
                 lesson.status === 'next' ? 'Next' : '🔒 Locked'}
              </Badge>

              {/* Lesson Title */}
              <p className="text-xs text-center text-muted-foreground line-clamp-2 max-w-[120px]">
                {lesson.title}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};
