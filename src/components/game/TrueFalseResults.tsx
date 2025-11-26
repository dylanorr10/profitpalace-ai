import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Confetti from "react-confetti";

interface GameAnswer {
  question: string;
  userAnswer: boolean;
  correctAnswer: boolean;
  isCorrect: boolean;
  explanation: string;
}

interface TrueFalseResultsProps {
  answers: GameAnswer[];
  score: number;
  total: number;
  onPlayAgain: () => void;
}

export const TrueFalseResults = ({ answers, score, total, onPlayAgain }: TrueFalseResultsProps) => {
  const navigate = useNavigate();
  const [showConfetti, setShowConfetti] = useState(false);
  const percentage = Math.round((score / total) * 100);

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
    if (percentage >= 90) return "🎉 MTD Expert!";
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
              {score} / {total} correct
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
                    <div className="font-semibold mb-2">
                      {answer.question}
                    </div>
                    <div className="flex gap-2 items-center text-sm mb-2">
                      <span className="text-muted-foreground">You answered:</span>
                      <span className={answer.userAnswer ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                        {answer.userAnswer ? "TRUE" : "FALSE"}
                      </span>
                      <span className="text-muted-foreground">Correct answer:</span>
                      <span className={answer.correctAnswer ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                        {answer.correctAnswer ? "TRUE" : "FALSE"}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground bg-background/50 p-3 rounded">
                      💡 {answer.explanation}
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
          📚 Learn More About MTD
        </Button>
      </div>
    </div>
  );
};
