import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { SwipeCard } from "@/components/game/SwipeCard";
import { SwipeGameResults } from "@/components/game/SwipeGameResults";
import { expenseQuestions, ExpenseQuestion } from "@/data/expenseQuestions";
import { toast } from "sonner";

type GameMode = 'menu' | 'playing' | 'results';

export default function ExpenseSwiper() {
  const navigate = useNavigate();
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [questions, setQuestions] = useState<ExpenseQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answers, setAnswers] = useState<Array<{
    question: ExpenseQuestion;
    userAnswer: boolean;
    isCorrect: boolean;
  }>>([]);

  const startGame = (mode: 'quick' | 'practice') => {
    const shuffled = [...expenseQuestions].sort(() => Math.random() - 0.5);
    const selected = mode === 'quick' ? shuffled.slice(0, 10) : shuffled;
    setQuestions(selected);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setAnswers([]);
    setGameMode('playing');
  };

  const handleSwipe = (isRight: boolean) => {
    const currentQuestion = questions[currentIndex];
    const isCorrect = isRight === currentQuestion.isClaimable;

    setAnswers(prev => [...prev, {
      question: currentQuestion,
      userAnswer: isRight,
      isCorrect,
    }]);

    if (isCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
      
      if (streak + 1 >= 3 && (streak + 1) % 3 === 0) {
        toast.success(`🔥 ${streak + 1} in a row! You're on fire!`);
      } else {
        toast.success("✅ Correct!");
      }
    } else {
      setStreak(0);
      toast.error("❌ Not quite!");
    }

    // Show explanation briefly
    setTimeout(() => {
      toast.info(currentQuestion.explanation, { duration: 3000 });
    }, 500);

    // Move to next question or end game
    setTimeout(() => {
      if (currentIndex + 1 < questions.length) {
        setCurrentIndex(prev => prev + 1);
      } else {
        setGameMode('results');
      }
    }, 2000);
  };

  const handlePlayAgain = () => {
    setGameMode('menu');
  };

  if (gameMode === 'results') {
    return (
      <SwipeGameResults
        answers={answers}
        score={score}
        totalQuestions={questions.length}
        onPlayAgain={handlePlayAgain}
      />
    );
  }

  if (gameMode === 'menu') {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
          <Button
            variant="ghost"
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>

          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader className="text-center">
              <div className="text-6xl mb-4">🎮</div>
              <CardTitle className="text-4xl">Expense Swiper</CardTitle>
              <CardDescription className="text-lg mt-2">
                Can you tell what's claimable?
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>How to Play</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">👉</div>
                <div>
                  <div className="font-semibold">Swipe Right</div>
                  <div className="text-sm text-muted-foreground">
                    If the expense is claimable for your business
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">👈</div>
                <div>
                  <div className="font-semibold">Swipe Left</div>
                  <div className="text-sm text-muted-foreground">
                    If the expense is NOT claimable
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="text-2xl">🔥</div>
                <div>
                  <div className="font-semibold">Build Streaks</div>
                  <div className="text-sm text-muted-foreground">
                    Get multiple answers in a row for bonus points!
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="text-3xl mb-2">⚡</div>
                <CardTitle>Quick Play</CardTitle>
                <CardDescription>10 questions • Test your knowledge</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={() => startGame('quick')} className="w-full" size="lg">
                  Start Quick Game
                </Button>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1">
              <CardHeader>
                <div className="text-3xl mb-2">📚</div>
                <CardTitle>Practice Mode</CardTitle>
                <CardDescription>All questions • Learn at your pace</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={() => startGame('practice')}
                  variant="outline"
                  className="w-full"
                  size="lg"
                >
                  Start Practice
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Playing mode
  const progress = ((currentIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setGameMode('menu')}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Exit
            </Button>
            <div className="flex gap-2">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                Score: {score}
              </Badge>
              {streak >= 3 && (
                <Badge className="text-lg px-3 py-1 animate-pulse bg-orange-500">
                  🔥 {streak}
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Question {currentIndex + 1} of {questions.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        {/* Card Stack */}
        <div className="relative h-[500px] mb-8">
          {questions.slice(currentIndex, currentIndex + 3).map((question, index) => (
            <SwipeCard
              key={question.id}
              question={question}
              onSwipe={handleSwipe}
              isActive={index === 0}
              style={{
                zIndex: 10 - index,
                transform: `scale(${1 - index * 0.05}) translateY(${index * 20}px)`,
                opacity: 1 - index * 0.3,
              }}
            />
          ))}
        </div>

        {/* Instructions */}
        <div className="text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-8">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center text-xl">
                ❌
              </div>
              <span>Swipe left if not claimable</span>
            </div>
            <div className="flex items-center gap-2">
              <span>Swipe right if claimable</span>
              <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center text-xl">
                ✅
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
