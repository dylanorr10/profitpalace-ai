import { Card } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

interface SuggestionCardProps {
  question: string;
  onClick: (question: string) => void;
}

export const SuggestionCard = ({ question, onClick }: SuggestionCardProps) => {
  return (
    <Card
      onClick={() => onClick(question)}
      className="p-4 cursor-pointer hover:border-primary hover:shadow-lg hover:scale-[1.02] transition-all active:scale-[0.98] border-border/50 touch-manipulation"
    >
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg shrink-0">
          <MessageSquare className="w-4 h-4 text-primary" />
        </div>
        <span className="text-sm flex-1">{question}</span>
      </div>
    </Card>
  );
};
