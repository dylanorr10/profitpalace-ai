import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { checkAndAwardAchievements } from "@/utils/achievements";

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

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

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
      <Card className="mt-8">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            {passed ? (
              <div className="text-6xl">🎉</div>
            ) : (
              <div className="text-6xl">📚</div>
            )}
          </div>
          <CardTitle className="text-3xl">
            {passed ? "Great Work!" : "Keep Learning!"}
          </CardTitle>
          <CardDescription className="text-lg">
            You scored {score}% ({correctAnswers}/{questions.length} correct)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {passed ? (
            <>
              <Badge className="w-full justify-center py-2 text-base bg-success">
                ✓ Quiz Passed
              </Badge>
              <p className="text-center text-muted-foreground">
                You've successfully completed this lesson!
              </p>
            </>
          ) : (
            <>
              <Badge variant="secondary" className="w-full justify-center py-2 text-base">
                Score {passingScore}% or higher to pass
              </Badge>
              <p className="text-center text-muted-foreground">
                Review the lesson material and try again. You can retake the quiz as many times as you need.
              </p>
            </>
          )}
          <div className="flex gap-3 pt-4">
            {!passed && (
              <Button onClick={handleRetakeQuiz} variant="outline" className="flex-1">
                Retake Quiz
              </Button>
            )}
            <Button onClick={() => onComplete(score, passed)} className="flex-1">
              {passed ? "Continue" : "Review Lesson"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="secondary">
            Question {currentQuestionIndex + 1} of {questions.length}
          </Badge>
          <span className="text-sm text-muted-foreground">{Math.round(progressPercentage)}%</span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <CardTitle className="text-xl mt-4">{currentQuestion.question}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {currentQuestion.options.map((option, index) => {
            const isSelected = selectedAnswer === index;
            const isCorrect = index === currentQuestion.correct_answer;
            const showCorrect = showExplanation && isCorrect;
            const showIncorrect = showExplanation && isSelected && !isCorrect;

            return (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                disabled={showExplanation}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  showCorrect
                    ? "border-success bg-success/10"
                    : showIncorrect
                    ? "border-destructive bg-destructive/10"
                    : isSelected
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-secondary/50"
                } ${showExplanation ? "cursor-not-allowed" : "cursor-pointer"}`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex-1">{option}</span>
                  {showCorrect && <CheckCircle2 className="w-5 h-5 text-success" />}
                  {showIncorrect && <XCircle className="w-5 h-5 text-destructive" />}
                </div>
              </button>
            );
          })}
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
