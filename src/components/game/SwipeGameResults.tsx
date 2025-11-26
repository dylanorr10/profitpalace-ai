import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";
import { ExpenseQuestion } from "@/data/expenseQuestions";

interface GameAnswer {
  question: ExpenseQuestion;
  userAnswer: boolean;
  isCorrect: boolean;
}

interface SwipeGameResultsProps {
  answers: GameAnswer[];
  score: number;
  totalQuestions: number;
  onPlayAgain: () => void;
}

export const SwipeGameResults = ({ answers, score, totalQuestions, onPlayAgain }: SwipeGameResultsProps) => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);
  const percentage = Math.round((score / totalQuestions) * 100);

  const getStarRating = () => {
    if (percentage >= 90) return 3;
    if (percentage >= 70) return 2;
    return 1;
  };

  const stars = getStarRating();

  useEffect(() => {
    if (percentage >= 70) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [percentage]);

  const getMessage = () => {
    if (percentage >= 90) return "🎉 Tax Expert!";
    if (percentage >= 70) return "💪 Well Done!";
    if (percentage >= 50) return "📚 Keep Learning!";
    return "🌱 Room to Grow!";
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {showConfetti && <Confetti recycle={false} numberOfPieces={500} />}
      
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        {/* Score Card */}
        <Card className="text-center bg-gradient-to-br from-primary/10 to-primary/5">
          <CardHeader>
            <CardTitle className="text-4xl">{getMessage()}</CardTitle>
            <div className="flex justify-center gap-2 text-4xl my-4">
              {[...Array(3)].map((_, i) => (
                <span key={i} className={i < stars ? "opacity-100" : "opacity-20"}>
                  ⭐
                </span>
              ))}
            </div>
            <CardDescription className="text-2xl font-bold text-foreground">
              {score} / {totalQuestions} correct
            </CardDescription>
            <div className="text-5xl font-bold text-primary mt-2">{percentage}%</div>
          </CardHeader>
        </Card>

        {/* Wrong Answers */}
        {answers.filter(a => !a.isCorrect).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Learn from Mistakes</CardTitle>
              <CardDescription>
                Review these to improve your score next time
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {answers
                .filter(a => !a.isCorrect)
                .map((answer, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg border border-destructive/20 bg-destructive/5 space-y-2"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="font-semibold text-sm mb-1">
                          {answer.question.description}
                        </div>
                        <div className="flex gap-2 mb-2">
                          <Badge variant="outline" className="text-xs">
                            {answer.question.category}
                          </Badge>
                          <Badge
                            variant={answer.question.isClaimable ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {answer.question.isClaimable ? "✅ Claimable" : "❌ Not Claimable"}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-2xl">
                        {answer.userAnswer ? "👉" : "👈"}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground bg-background/50 p-3 rounded">
                      💡 {answer.question.explanation}
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <Button onClick={onPlayAgain} size="lg" className="flex-1">
            🔄 Play Again
          </Button>
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            size="lg"
            className="flex-1"
          >
            📊 Dashboard
          </Button>
        </div>

        <Button
          onClick={() => navigate("/curriculum")}
          variant="ghost"
          className="w-full"
        >
          📚 Learn More About Expenses
        </Button>
      </div>
    </div>
  );
};
