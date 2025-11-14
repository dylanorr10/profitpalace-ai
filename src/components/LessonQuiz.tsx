import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { checkAndAwardAchievements } from "@/utils/achievements";
import { QuizAnswerCard } from "@/components/QuizAnswerCard";
import { QuizResults } from "@/components/QuizResults";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

interface LessonQuizProps {
  lessonId: string;
  userId: string;
  questions: QuizQuestion[];
  passingScore?: number;
  onComplete: (score: number, passed: boolean) => void;
}

export const LessonQuiz = ({ lessonId, userId, questions, passingScore = 60, onComplete }: LessonQuizProps) => {
  const { toast } = useToast();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [quizComplete, setQuizComplete] = useState(false);
  const [score, setScore] = useState(0);

  // Swipe gesture state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Minimum swipe distance (in px) to trigger navigation
  const minSwipeDistance = 50;

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Touch event handlers for swipe gestures
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    // Left swipe = next question (if explanation is shown)
    if (isLeftSwipe && showExplanation) {
      handleNextQuestion();
    }
    
    // Right swipe = previous question (only if not on first question and no answer selected)
    if (isRightSwipe && currentQuestionIndex > 0 && !showExplanation) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(null);
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showExplanation) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;

    const isCorrect = selectedAnswer === currentQuestion.correct_answer;
    setAnswers([...answers, isCorrect]);
    setShowExplanation(true);
  };

  const handleNextQuestion = async () => {
    if (isLastQuestion) {
      // Calculate final score
      const correctAnswers = answers.filter(Boolean).length;
      const finalScore = Math.round((correctAnswers / questions.length) * 100);
      setScore(finalScore);
      setQuizComplete(true);

      // Save quiz results
      const passed = finalScore >= passingScore;
      try {
        const { data: progressData } = await supabase
          .from("user_progress")
          .select("quiz_attempts")
          .eq("user_id", userId)
          .eq("lesson_id", lessonId)
          .single();

        await supabase
          .from("user_progress")
          .update({
            quiz_score: finalScore,
            quiz_attempts: (progressData?.quiz_attempts || 0) + 1,
            quiz_completed_at: new Date().toISOString(),
            completion_rate: passed ? 100 : 50,
            completed_at: passed ? new Date().toISOString() : null,
          })
          .eq("user_id", userId)
          .eq("lesson_id", lessonId);

        // Check for achievements
        if (finalScore === 100) {
          await checkAndAwardAchievements(userId, "quiz_ace", {
            lesson_id: lessonId,
            score: finalScore,
          });
        }

        onComplete(finalScore, passed);
      } catch (error) {
        console.error("Error saving quiz results:", error);
      }
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const handleRetakeQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnswers([]);
    setQuizComplete(false);
    setScore(0);
  };

  if (quizComplete) {
    const passed = score >= passingScore;
    const correctAnswers = answers.filter(Boolean).length;

    return (
      <QuizResults
        score={score}
        correctAnswers={correctAnswers}
        totalQuestions={questions.length}
        passingScore={passingScore}
        onRetake={handleRetakeQuiz}
        onContinue={onComplete}
      />
    );
  }

  return (
    <Card 
      className="mt-8"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary">
            Question {currentQuestionIndex + 1} of {questions.length}
          </Badge>
          <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <CardTitle className="text-xl mt-4">{currentQuestion.question}</CardTitle>
        {showExplanation && (
          <p className="text-xs text-muted-foreground mt-2">💡 Swipe left for next question</p>
        )}
        {!showExplanation && currentQuestionIndex > 0 && (
          <p className="text-xs text-muted-foreground mt-2">💡 Swipe right to go back</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => (
            <QuizAnswerCard
              key={index}
              option={option}
              index={index}
              isSelected={selectedAnswer === index}
              isCorrect={index === currentQuestion.correct_answer}
              showExplanation={showExplanation}
              onSelect={handleAnswerSelect}
            />
          ))}
        </div>

        {showExplanation && (
          <div className="mt-4 p-4 bg-secondary/50 rounded-lg border">
            <div className="flex items-start gap-2">
              <Sparkles className="w-5 h-5 mt-0.5 text-primary" />
              <div>
                <p className="font-semibold mb-1">Explanation</p>
                <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          {!showExplanation ? (
            <Button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswer === null}
              className="w-full"
            >
              Submit Answer
            </Button>
          ) : (
            <Button onClick={handleNextQuestion} className="w-full">
              {isLastQuestion ? "See Results" : "Next Question"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
