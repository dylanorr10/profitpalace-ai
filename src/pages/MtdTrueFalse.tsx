import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { mtdQuestions, type MtdQuestion } from "@/data/mtdQuestions";
import { TrueFalseResults } from "@/components/game/TrueFalseResults";
import { toast } from "sonner";

type GameMode = 'menu' | 'playing' | 'results';

interface GameAnswer {
  question: string;
  userAnswer: boolean;
  correctAnswer: boolean;
  isCorrect: boolean;
  explanation: string;
}

export default function MtdTrueFalse() {
  const navigate = useNavigate();
  const [gameMode, setGameMode] = useState<GameMode>('menu');
  const [questions, setQuestions] = useState<MtdQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [answers, setAnswers] = useState<GameAnswer[]>([]);
  const [showExplanation, setShowExplanation] = useState(false);

  const startGame = (mode: 'quick' | 'practice') => {
    const shuffled = [...mtdQuestions].sort(() => Math.random() - 0.5);
    const selected = mode === 'quick' ? shuffled.slice(0, 10) : shuffled;
    setQuestions(selected);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setAnswers([]);
    setShowExplanation(false);
    setGameMode('playing');
  };

  const handleAnswer = (userAnswer: boolean) => {
    if (showExplanation) return;

    const currentQuestion = questions[currentIndex];
    const isCorrect = userAnswer === currentQuestion.isTrue;
    
    const newAnswer: GameAnswer = {
      question: currentQuestion.statement,
      userAnswer,
      correctAnswer: currentQuestion.isTrue,
      isCorrect,
      explanation: currentQuestion.explanation
    };

    setAnswers(prev => [...prev, newAnswer]);

    if (isCorrect) {
      setScore(prev => prev + 1);
      setStreak(prev => prev + 1);
      toast.success("Correct! 🎉", {
        description: currentQuestion.explanation
      });
    } else {
      setStreak(0);
      toast.error("Not quite!", {
        description: currentQuestion.explanation
      });
    }

    setShowExplanation(true);

    // Move to next question or end game
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setShowExplanation(false);
      } else {
        setGameMode('results');
      }
    }, 2500);
  };

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  if (gameMode === 'results') {
    return (
      <TrueFalseResults
        answers={answers}
        score={score}
        total={questions.length}
        onPlayAgain={() => startGame('quick')}
      />
    );
  }

  if (gameMode === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background p-4">
        <div className="max-w-2xl mx-auto pt-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <Card className="p-8 text-center space-y-6">
            <div className="text-6xl mb-4">📱</div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              MTD True or False
            </h1>
            <p className="text-xl text-muted-foreground">
              Test your knowledge of Making Tax Digital
            </p>

            <div className="bg-accent/50 rounded-lg p-6 space-y-3 text-left">
              <h3 className="font-bold text-lg">How to Play:</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Read each statement about MTD</li>
                <li>• Click TRUE or FALSE</li>
                <li>• Get immediate feedback with explanations</li>
                <li>• Build your streak for bonus points!</li>
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
              <Button
                size="lg"
                onClick={() => startGame('quick')}
                className="h-24 text-lg"
              >
                <div>
                  <div className="font-bold">Quick Play</div>
                  <div className="text-sm opacity-80">10 questions</div>
                </div>
              </Button>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => startGame('practice')}
                className="h-24 text-lg"
              >
                <div>
                  <div className="font-bold">Practice Mode</div>
                  <div className="text-sm opacity-80">All {mtdQuestions.length} questions</div>
                </div>
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-background p-4">
      <div className="max-w-2xl mx-auto pt-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            onClick={() => setGameMode('menu')}
            size="sm"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Exit
          </Button>
          <div className="flex items-center gap-4">
            <div className="text-sm font-medium">
              Score: {score}/{questions.length}
            </div>
            {streak > 1 && (
              <div className="text-sm font-bold text-primary animate-pulse">
                🔥 {streak} streak!
              </div>
            )}
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="p-8 space-y-8">
          <div className="text-center space-y-4">
            <div className="text-5xl mb-4">📱</div>
            <h2 className="text-2xl font-bold leading-relaxed">
              {currentQuestion.statement}
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-4">
            <Button
              size="lg"
              onClick={() => handleAnswer(true)}
              disabled={showExplanation}
              className="h-24 text-xl font-bold bg-green-600 hover:bg-green-700 text-white"
            >
              <Check className="w-8 h-8 mr-2" />
              TRUE
            </Button>
            <Button
              size="lg"
              onClick={() => handleAnswer(false)}
              disabled={showExplanation}
              className="h-24 text-xl font-bold bg-red-600 hover:bg-red-700 text-white"
            >
              <X className="w-8 h-8 mr-2" />
              FALSE
            </Button>
          </div>

          {showExplanation && (
            <div className={`p-4 rounded-lg animate-scale-in ${
              answers[answers.length - 1]?.isCorrect 
                ? 'bg-green-50 dark:bg-green-950/30 border-2 border-green-500' 
                : 'bg-red-50 dark:bg-red-950/30 border-2 border-red-500'
            }`}>
              <p className="font-medium">
                {currentQuestion.explanation}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
