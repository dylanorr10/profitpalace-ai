import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Clock, CheckCircle2, XCircle, Lightbulb, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { hasAccessToLesson } from "@/utils/accessControl";
import { LessonQuiz } from "@/components/LessonQuiz";
import { checkAndAwardAchievements, checkTimeBasedAchievement } from "@/utils/achievements";
import { GlossaryTooltip } from "@/components/GlossaryTooltip";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer: number;
  explanation: string;
}

interface LessonContent {
  intro: string;
  sections: Array<{
    heading: string;
    content: string;
    bullets?: string[];
  }>;
  industry_examples: { [key: string]: string };
  canDo: string[];
  cantDo: string[];
  proTips: string[];
  actionSteps: string[];
  quiz?: {
    questions: QuizQuestion[];
    passing_score?: number;
  };
}

interface LessonData {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  duration: number;
  emoji: string;
  content: LessonContent;
  order_index: number;
}

const Lesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [userIndustry, setUserIndustry] = useState<string>('general');
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>();
  const [userId, setUserId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  const notesTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    fetchLesson();
  }, [id]);

  const fetchLesson = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }
    
    setUserId(user.id);

    // Track time-based achievement
    const hour = new Date().getHours();
    await checkTimeBasedAchievement(user.id, hour);

    // Fetch user profile
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('industry, subscription_status, has_purchased')
      .eq('user_id', user.id)
      .single();

    let isActive = false;
    if (profile) {
      setUserIndustry(profile.industry?.toLowerCase() || 'general');
      isActive = (profile.subscription_status === 'active') || !!profile.has_purchased;
      setSubscriptionStatus(isActive ? 'active' : undefined);
    }

    // Fetch lesson
    const { data: lessonData, error } = await supabase
      .from('lessons')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !lessonData) {
      toast({
        title: 'Lesson not found',
        description: 'This lesson could not be loaded.',
        variant: 'destructive',
      });
      navigate('/dashboard');
      return;
    }

    // Check access (use latest profile value)
    const effectiveStatus = isActive ? 'active' : undefined;
    if (!hasAccessToLesson(lessonData.order_index, effectiveStatus)) {
      toast({
        title: 'Upgrade Required',
        description: 'This lesson requires a premium account.',
        variant: 'destructive',
      });
      navigate('/pricing');
      return;
    }

    setLesson({
      ...lessonData,
      content: lessonData.content as unknown as LessonContent
    } as LessonData);

    // Create or fetch user progress record
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('notes, quiz_score')
      .eq('user_id', user.id)
      .eq('lesson_id', id)
      .maybeSingle();

    if (progressData) {
      setNotes(progressData.notes || '');
      if (progressData.quiz_score !== null) {
        setQuizCompleted(true);
      }
    } else {
      // Create progress record
      await supabase.from('user_progress').insert({
        user_id: user.id,
        lesson_id: id,
        started_at: new Date().toISOString(),
      });

      // Check for first lesson achievement
      const { data: allProgress } = await supabase
        .from('user_progress')
        .select('id')
        .eq('user_id', user.id);

      if (allProgress && allProgress.length === 1) {
        await checkAndAwardAchievements(user.id, 'first_lesson');
      }
    }
  };

  const handleNotesChange = (value: string) => {
    setNotes(value);
    
    // Debounce save
    if (notesTimeoutRef.current) {
      clearTimeout(notesTimeoutRef.current);
    }

    notesTimeoutRef.current = setTimeout(async () => {
      await supabase
        .from('user_progress')
        .update({ notes: value })
        .eq('user_id', userId)
        .eq('lesson_id', id);
    }, 1000);
  };

  const handleQuizComplete = async (score: number, passed: boolean) => {
    if (passed) {
      setQuizCompleted(true);
      
      // Calculate time spent
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      // Update progress
      await supabase
        .from('user_progress')
        .update({
          completed_at: new Date().toISOString(),
          completion_rate: 100,
          time_spent: timeSpent,
        })
        .eq('user_id', userId)
        .eq('lesson_id', id);

      toast({
        title: 'Lesson Complete! 🎉',
        description: `You scored ${score}% on the quiz.`,
      });
    } else {
      setShowQuiz(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  if (!lesson) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading lesson...</p>
      </div>
    );
  }

  const industryExample = lesson.content.industry_examples[userIndustry] || 
                         lesson.content.industry_examples.general || 
                         'Example for your business type';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/chat', { 
              state: { 
                lessonContext: { 
                  id: lesson.id, 
                  title: lesson.title, 
                  category: lesson.category 
                }
              }
            })}
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Ask AI About This
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Lesson Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="text-6xl">{lesson.emoji}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge className="bg-success/10 text-success">{lesson.difficulty}</Badge>
                <Badge variant="outline">{lesson.category}</Badge>
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{lesson.duration} min</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-2">{lesson.title}</h1>
              <p className="text-xl text-muted-foreground">{lesson.content.intro}</p>
            </div>
          </div>
        </div>

        {/* Industry-Specific Example */}
        {industryExample && industryExample !== 'Example for your business type' && (
          <Card className="p-6 bg-primary/10 border-primary mb-8">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span>💡</span> For Your Industry ({userIndustry})
            </h3>
            <p>{industryExample}</p>
          </Card>
        )}

        {/* Main Content */}
        <div className="space-y-8">
          {lesson.content.sections.map((section, idx) => (
            <Card key={idx} className="p-6 bg-gradient-card">
              <h2 className="text-2xl font-bold mb-4">{section.heading}</h2>
              <p className="text-lg mb-4 whitespace-pre-line">
                {section.content.split(/\b(HMRC|Self Assessment|VAT|PAYE|NI|National Insurance|UTR|Corporation Tax|Capital Allowances|Self-Employed|Limited Company|Sole Trader|Payment on Account|CIS|MTD|Making Tax Digital)\b/g).map((part, i) => {
                  const glossaryTerms = ['HMRC', 'Self Assessment', 'VAT', 'PAYE', 'NI', 'National Insurance', 'UTR', 'Corporation Tax', 'Capital Allowances', 'Self-Employed', 'Limited Company', 'Sole Trader', 'Payment on Account', 'CIS', 'MTD', 'Making Tax Digital'];
                  if (glossaryTerms.includes(part)) {
                    return <GlossaryTooltip key={i} term={part}>{part}</GlossaryTooltip>;
                  }
                  return part;
                })}
              </p>

              {section.bullets && (
                <ul className="space-y-2">
                  {section.bullets.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          ))}

          {/* What You CAN Do */}
          <Card className="p-6 border-success">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-6 h-6 text-success" />
              <h2 className="text-2xl font-bold">What You CAN Do ✅</h2>
            </div>
            <ul className="space-y-3">
              {lesson.content.canDo.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Common Mistakes */}
          <Card className="p-6 border-destructive">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="w-6 h-6 text-destructive" />
              <h2 className="text-2xl font-bold">Common Mistakes to Avoid ❌</h2>
            </div>
            <ul className="space-y-3">
              {lesson.content.cantDo.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Pro Tips */}
          <Card className="p-6 bg-gradient-primary text-white">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Pro Tips 💡</h2>
            </div>
            <ul className="space-y-3">
              {lesson.content.proTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Action Steps */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Your Action Steps 🎯</h2>
            <div className="space-y-3">
              {lesson.content.actionSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <span className="mt-1">{step}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Notes Section */}
        <Card className="p-6 mt-8">
          <Label htmlFor="notes" className="text-lg font-semibold mb-2">Your Notes 📝</Label>
          <Textarea
            id="notes"
            placeholder="Write your thoughts, questions, or key takeaways..."
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            className="mt-2 min-h-[120px]"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Auto-saved • Visible only to you
          </p>
        </Card>

        {/* Quiz Section */}
        {lesson.content.quiz && !quizCompleted && (
          <div className="mt-8">
            {!showQuiz ? (
              <Card className="p-8 text-center">
                <h2 className="text-2xl font-bold mb-4">Ready to test your knowledge?</h2>
                <p className="text-muted-foreground mb-6">
                  Complete the quiz to finish this lesson
                </p>
                <Button size="lg" onClick={() => setShowQuiz(true)}>
                  Start Quiz
                </Button>
              </Card>
            ) : (
              <LessonQuiz
                lessonId={lesson.id}
                userId={userId}
                questions={lesson.content.quiz.questions}
                passingScore={lesson.content.quiz.passing_score}
                onComplete={handleQuizComplete}
              />
            )}
          </div>
        )}

        {/* Lesson Navigation */}
        <div className="mt-12 flex justify-between items-center">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back to Lessons
          </Button>
          {quizCompleted && (
            <Button 
              size="lg" 
              className="bg-gradient-primary"
              onClick={() => navigate("/dashboard")}
            >
              Continue Learning →
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Lesson;
