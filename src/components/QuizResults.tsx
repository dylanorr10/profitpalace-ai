import { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Award, Star, Target, RotateCcw } from "lucide-react";

interface QuizResultsProps {
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  passingScore: number;
  onRetake: () => void;
  onContinue: (score: number, passed: boolean) => void;
}

export const QuizResults = ({
  score,
  correctAnswers,
  totalQuestions,
  passingScore,
  onRetake,
  onContinue,
}: QuizResultsProps) => {
  const passed = score >= passingScore;
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (passed) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [passed]);

  useEffect(() => {
    const updateSize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  // Performance badges
  const getBadges = () => {
    const badges = [];
    if (score === 100) badges.push({ icon: Trophy, label: "Perfect Score!", color: "text-yellow-500" });
    if (score >= 90) badges.push({ icon: Star, label: "Excellent!", color: "text-purple-500" });
    if (score >= passingScore) badges.push({ icon: Award, label: "Passed!", color: "text-green-500" });
    if (correctAnswers === totalQuestions && totalQuestions > 0)
      badges.push({ icon: Target, label: "Ace!", color: "text-cyan-500" });
    return badges;
  };

  const badges = getBadges();

  return (
    <>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          recycle={false}
          numberOfPieces={500}
          gravity={0.3}
        />
      )}

      <Card className="mt-8 border-2 animate-fade-in">
        <CardHeader className="text-center pb-4">
          {/* Large circular progress */}
          <div className="mx-auto mb-6 relative">
            <div className="relative w-40 h-40 mx-auto">
              {/* Background circle */}
              <svg className="w-40 h-40 transform -rotate-90">
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  className="text-muted"
                />
                {/* Progress circle */}
                <circle
                  cx="80"
                  cy="80"
                  r="70"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 70}`}
                  strokeDashoffset={`${2 * Math.PI * 70 * (1 - score / 100)}`}
                  className={passed ? "text-green-500" : "text-orange-500"}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
                />
              </svg>
              {/* Score text in center */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-5xl font-bold">{score}%</div>
                <div className="text-sm text-muted-foreground">Score</div>
              </div>
            </div>
          </div>

          {/* Emoji and title */}
          <div className="text-6xl mb-3 animate-scale-in">
            {score === 100 ? "🏆" : passed ? "🎉" : "📚"}
          </div>
          
          <CardTitle className="text-3xl mb-2">
            {score === 100 ? "Perfect Score!" : passed ? "Great Work!" : "Keep Learning!"}
          </CardTitle>
          
          <CardDescription className="text-lg">
            You answered {correctAnswers} out of {totalQuestions} questions correctly
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Performance badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {badges.map((badge, idx) => (
                <Badge
                  key={idx}
                  variant="secondary"
                  className="py-2 px-4 text-sm gap-2 animate-fade-in"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <badge.icon className={`w-4 h-4 ${badge.color}`} />
                  {badge.label}
                </Badge>
              ))}
            </div>
          )}

          {/* Stats breakdown */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-secondary/30 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {correctAnswers}
              </div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {totalQuestions - correctAnswers}
              </div>
              <div className="text-xs text-muted-foreground">Incorrect</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{score}%</div>
              <div className="text-xs text-muted-foreground">Score</div>
            </div>
          </div>

          {/* Pass/Fail indicator */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Passing Score</span>
              <span className="font-semibold">{passingScore}%</span>
            </div>
            <Progress value={score} className="h-3" />
          </div>

          {passed ? (
            <div className="text-center p-4 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <Badge className="bg-green-600 hover:bg-green-700 mb-2">
                ✓ Quiz Passed
              </Badge>
              <p className="text-sm text-muted-foreground">
                You've successfully completed this lesson!
              </p>
            </div>
          ) : (
            <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <Badge variant="secondary" className="mb-2">
                Score {passingScore}% or higher to pass
              </Badge>
              <p className="text-sm text-muted-foreground">
                Review the lesson material and try again.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 pt-4">
            {!passed && (
              <Button onClick={onRetake} variant="outline" className="flex-1 gap-2">
                <RotateCcw className="w-4 h-4" />
                Retake Quiz
              </Button>
            )}
            <Button onClick={() => onContinue(score, passed)} className="flex-1">
              {passed ? "Continue" : "Review Lesson"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
