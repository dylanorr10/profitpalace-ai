import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizAnswerCardProps {
  option: string;
  index: number;
  isSelected: boolean;
  isCorrect: boolean;
  showExplanation: boolean;
  onSelect: (index: number) => void;
}

const letterLabels = ["A", "B", "C", "D", "E", "F"];

export const QuizAnswerCard = ({
  option,
  index,
  isSelected,
  isCorrect,
  showExplanation,
  onSelect,
}: QuizAnswerCardProps) => {
  const showCorrect = showExplanation && isCorrect;
  const showIncorrect = showExplanation && isSelected && !isCorrect;

  return (
    <button
      onClick={() => onSelect(index)}
      disabled={showExplanation}
      className={cn(
        "w-full text-left p-4 rounded-lg border-2 transition-all min-h-[64px] relative overflow-hidden",
        "hover:shadow-md active:scale-[0.98]",
        showCorrect && "border-green-500 bg-green-50 dark:bg-green-950/30 animate-scale-in",
        showIncorrect && "border-red-500 bg-red-50 dark:bg-red-950/30 animate-[shake_0.5s]",
        !showExplanation && isSelected && "border-primary bg-primary/10 shadow-md scale-[1.02]",
        !showExplanation && !isSelected && "border-border hover:border-primary/50 hover:bg-accent/50",
        showExplanation && "cursor-not-allowed opacity-90"
      )}
    >
      <div className="flex items-center gap-3">
        {/* Letter label */}
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 transition-colors",
            showCorrect && "bg-green-600 text-white",
            showIncorrect && "bg-red-600 text-white",
            !showExplanation && isSelected && "bg-primary text-primary-foreground",
            !showExplanation && !isSelected && "bg-muted text-muted-foreground"
          )}
        >
          {letterLabels[index]}
        </div>

        {/* Option text */}
        <span className="flex-1 text-sm md:text-base">{option}</span>

        {/* Status icon */}
        <div className="shrink-0">
          {showCorrect && (
            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 animate-scale-in" />
          )}
          {showIncorrect && (
            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400 animate-scale-in" />
          )}
        </div>
      </div>

      {/* Glow effect for correct answer */}
      {showCorrect && (
        <div className="absolute inset-0 bg-green-500/10 animate-pulse pointer-events-none" />
      )}
    </button>
  );
};
