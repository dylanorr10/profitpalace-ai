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
import { logDailyActivity } from "@/utils/streakTracking";

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

    // Fetch lesson - support both UUID and order_index
    let lessonData;
    let error;
    
    // Check if id is a number (order_index) or UUID
    const isOrderIndex = !isNaN(Number(id));
    
    if (isOrderIndex) {
      const result = await supabase
        .from('lessons')
        .select('*')
        .eq('order_index', Number(id))
        .maybeSingle();
      lessonData = result.data;
      error = result.error;
    } else {
      const result = await supabase
        .from('lessons')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      lessonData = result.data;
      error = result.error;
    }

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
      .eq('lesson_id', lessonData.id)
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
        lesson_id: lessonData.id,
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
      const timeSpentMinutes = Math.ceil(timeSpent / 60);
      
      // Update progress
      await supabase
        .from('user_progress')
        .update({
          completed_at: new Date().toISOString(),
          completion_rate: 100,
          time_spent: timeSpent,
        })
        .eq('user_id', userId)
        .eq('lesson_id', lesson?.id);

      // Log daily activity for streak tracking
      await logDailyActivity(userId, 1, timeSpentMinutes);

      // Fetch next lesson for smooth navigation
      const { data: nextLesson } = await supabase
        .from('lessons')
        .select('id, title, order_index')
        .gt('order_index', lesson?.order_index || 0)
        .order('order_index', { ascending: true })
        .limit(1)
        .maybeSingle();

      toast({
        title: 'Lesson Complete! 🎉',
        description: `You scored ${score}% on the quiz. ${nextLesson ? 'Ready for the next one?' : 'Keep your streak going!'}`,
      });

      // Smooth transition to next lesson after a moment
      if (nextLesson) {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 500);
      }
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
        <div className="container mx-auto px-4 py-3 md:py-4 flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="text-xs md:text-sm">
            <ArrowLeft className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Back to Dashboard</span>
            <span className="sm:hidden">Back</span>
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
            className="text-xs md:text-sm"
          >
            <MessageSquare className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
            <span className="hidden sm:inline">Ask AI About This</span>
            <span className="sm:hidden">Ask AI</span>
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl overflow-x-hidden">
        {/* Lesson Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex items-start gap-3 md:gap-4 mb-4">
            <div className="text-4xl md:text-6xl">{lesson.emoji}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge className="bg-success/10 text-success text-xs md:text-sm">{lesson.difficulty}</Badge>
                <Badge variant="outline" className="text-xs md:text-sm">{lesson.category}</Badge>
                <div className="flex items-center gap-1 text-muted-foreground text-xs md:text-sm">
                  <Clock className="w-3 h-3 md:w-4 md:h-4" />
                  <span>{lesson.duration} min</span>
                </div>
              </div>
              <h1 className="text-2xl md:text-4xl font-bold mb-2 break-words">{lesson.title}</h1>
              <p className="text-base md:text-xl text-muted-foreground">{lesson.content.intro}</p>
            </div>
          </div>
        </div>

        {/* Industry-Specific Example */}
        {industryExample && industryExample !== 'Example for your business type' && (
          <Card className="p-4 md:p-6 bg-primary/10 border-primary mb-6 md:mb-8">
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-sm md:text-base">
              <span>💡</span> For Your Industry ({userIndustry})
            </h3>
            <p className="text-sm md:text-base">{industryExample}</p>
          </Card>
        )}

        {/* Main Content */}
        <div className="space-y-6 md:space-y-8">
          {lesson.content.sections.map((section, idx) => (
            <Card key={idx} className="p-4 md:p-6 bg-gradient-card">
              <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">{section.heading}</h2>
              <p className="text-base md:text-lg mb-3 md:mb-4 whitespace-pre-line">
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
          <Card className="p-4 md:p-6 border-success">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-success" />
              <h2 className="text-xl md:text-2xl font-bold">What You CAN Do ✅</h2>
            </div>
            <ul className="space-y-2 md:space-y-3">
              {lesson.content.canDo.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 md:gap-3 text-sm md:text-base">
                  <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-success mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Common Mistakes */}
          <Card className="p-4 md:p-6 border-destructive">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <XCircle className="w-5 h-5 md:w-6 md:h-6 text-destructive" />
              <h2 className="text-xl md:text-2xl font-bold">Common Mistakes to Avoid ❌</h2>
            </div>
            <ul className="space-y-2 md:space-y-3">
              {lesson.content.cantDo.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 md:gap-3 text-sm md:text-base">
                  <XCircle className="w-4 h-4 md:w-5 md:h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Pro Tips */}
          <Card className="p-4 md:p-6 bg-gradient-primary text-white">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <Lightbulb className="w-5 h-5 md:w-6 md:h-6" />
              <h2 className="text-xl md:text-2xl font-bold">Pro Tips 💡</h2>
            </div>
            <ul className="space-y-2 md:space-y-3">
              {lesson.content.proTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-2 md:gap-3 text-sm md:text-base">
                  <Lightbulb className="w-4 h-4 md:w-5 md:h-5 mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </Card>

        {/* Action Steps */}
        <Card className="p-4 md:p-6">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Your Action Steps 🎯</h2>
          <div className="space-y-3">
            {lesson.content.actionSteps.map((step, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0 text-sm md:text-base">
                  {idx + 1}
                </div>
                <span className="mt-1 text-sm md:text-base">{step}</span>
              </div>
            ))}
          </div>
        </Card>
        </div>

        {/* Notes Section */}
        <Card className="p-4 md:p-6 mt-6 md:mt-8">
          <Label htmlFor="notes" className="text-base md:text-lg font-semibold mb-2">Your Notes 📝</Label>
          <Textarea
            id="notes"
            placeholder="Write your thoughts, questions, or key takeaways..."
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            className="mt-2 min-h-[120px] text-sm md:text-base"
          />
          <p className="text-xs text-muted-foreground mt-2">
            Auto-saved • Visible only to you
          </p>
        </Card>

        {/* Quiz Section */}
        {lesson.content.quiz && !quizCompleted && (
          <div className="mt-6 md:mt-8">
            {!showQuiz ? (
              <Card className="p-6 md:p-8 text-center">
                <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Ready to test your knowledge?</h2>
                <p className="text-sm md:text-base text-muted-foreground mb-4 md:mb-6">
                  Complete the quiz to finish this lesson
                </p>
                <Button size="lg" onClick={() => setShowQuiz(true)} className="w-full sm:w-auto">
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
        <div className="mt-12 flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
          <Button variant="outline" onClick={() => navigate("/dashboard")} className="w-full sm:w-auto">
            Back to Lessons
          </Button>
          {quizCompleted && (
            <Button 
              size="lg" 
              className="bg-gradient-primary w-full sm:w-auto"
              onClick={async () => {
                // Fetch next lesson
                const { data: nextLesson } = await supabase
                  .from('lessons')
                  .select('id, order_index')
                  .gt('order_index', lesson?.order_index || 0)
                  .order('order_index', { ascending: true })
                  .limit(1)
                  .maybeSingle();

                if (nextLesson) {
                  navigate(`/lesson/${nextLesson.id}`);
                } else {
                  navigate("/dashboard");
                }
              }}
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
