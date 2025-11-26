import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { ExpenseQuestion } from "@/data/expenseQuestions";

interface SwipeCardProps {
  question: ExpenseQuestion;
  onSwipe: (isRight: boolean) => void;
  isActive: boolean;
  style?: React.CSSProperties;
}

export const SwipeCard = ({ question, onSwipe, isActive, style }: SwipeCardProps) => {
  const [touchStart, setTouchStart] = useState(0);
  const [touchCurrent, setTouchCurrent] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isActive) return;
    setTouchStart(e.touches[0].clientX);
    setTouchCurrent(e.touches[0].clientX);
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isActive || !isDragging) return;
    setTouchCurrent(e.touches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!isActive || !isDragging) return;
    const diff = touchCurrent - touchStart;
    const threshold = 100;

    if (Math.abs(diff) > threshold) {
      onSwipe(diff > 0);
    }

    setIsDragging(false);
    setTouchStart(0);
    setTouchCurrent(0);
  };

  const dragOffset = isDragging ? touchCurrent - touchStart : 0;
  const rotation = dragOffset / 20;
  const opacity = 1 - Math.abs(dragOffset) / 300;

  const showLeftIndicator = dragOffset < -30;
  const showRightIndicator = dragOffset > 30;

  const difficultyColor = {
    easy: 'bg-green-500/10 text-green-700 dark:text-green-300',
    medium: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300',
    hard: 'bg-red-500/10 text-red-700 dark:text-red-300',
  };

  return (
    <Card
      className={cn(
        "absolute inset-0 p-8 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none",
        "transition-all duration-200 shadow-xl",
        !isActive && "pointer-events-none"
      )}
      style={{
        ...style,
        transform: `translateX(${dragOffset}px) rotate(${rotation}deg)`,
        opacity: isDragging ? opacity : 1,
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Left indicator (Not Claimable) */}
      <div
        className={cn(
          "absolute left-8 top-8 px-6 py-3 rounded-xl border-4 border-red-500 bg-red-500/20 text-red-500 font-bold text-xl transition-all duration-200",
          showLeftIndicator ? "opacity-100 scale-110" : "opacity-0 scale-90"
        )}
      >
        ❌ NOPE
      </div>

      {/* Right indicator (Claimable) */}
      <div
        className={cn(
          "absolute right-8 top-8 px-6 py-3 rounded-xl border-4 border-green-500 bg-green-500/20 text-green-500 font-bold text-xl transition-all duration-200",
          showRightIndicator ? "opacity-100 scale-110" : "opacity-0 scale-90"
        )}
      >
        ✅ CLAIM
      </div>

      {/* Card content */}
      <div className="flex flex-col items-center justify-center gap-6 text-center max-w-md">
        <div className="flex gap-2">
          <Badge variant="secondary" className={difficultyColor[question.difficulty]}>
            {question.difficulty}
          </Badge>
          <Badge variant="outline">{question.category}</Badge>
        </div>

        <div className="text-6xl mb-4">{question.description.split(' ')[0]}</div>
        
        <h3 className="text-2xl font-bold leading-tight">
          {question.description.split(' ').slice(1).join(' ')}
        </h3>

        <div className="mt-8 flex gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👈</span>
            <span>Not Claimable</span>
          </div>
          <div className="w-px bg-border" />
          <div className="flex items-center gap-2">
            <span>Claimable</span>
            <span className="text-2xl">👉</span>
          </div>
        </div>
      </div>
    </Card>
  );
};
