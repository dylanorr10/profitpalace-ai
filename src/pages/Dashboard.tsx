import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LogOut, Settings, Sparkles, Users, Mail, BookOpen, Award, TrendingUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UrgentBanner } from "@/components/UrgentBanner";
import { MonthlyFocusCard } from "@/components/MonthlyFocusCard";
import ProfilePrompt from "@/components/ProfilePrompt";
import { getActiveSeasonalTriggers, SeasonalTrigger } from "@/utils/seasonalTriggers";
import { getActiveProactiveTriggers, ThresholdTrigger } from "@/utils/proactiveTriggers";
import { calculateLessonPriority } from "@/utils/lessonPriority";
import { getMonthlyFocus } from "@/utils/monthlyFocus";
import { getRecommendedLessons } from "@/utils/lessonRecommendations";
import { OnboardingWelcome } from "@/components/OnboardingWelcome";
import { NextUpCard } from "@/components/NextUpCard";
import { JourneyPath } from "@/components/JourneyPath";
import { MilestoneModal } from "@/components/MilestoneModal";

interface Lesson {
  id: string;
  title: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: number;
  emoji: string;
  order_index: number;
  seasonal_tags?: string[];
}

interface UserProfile {
  business_structure: string;
  industry: string;
  experience_level: string;
  pain_point: string;
  learning_goal: string;
  has_purchased: boolean;
  waitlist_joined: boolean;
  subscription_status: string | null;
  subscription_type: string | null;
  subscription_ends_at: string | null;
  business_start_date?: string;
  accounting_year_end?: string;
  annual_turnover?: string;
  vat_registered?: boolean;
  mtd_status?: string;
  next_vat_return_due?: string | null;
  turnover_last_updated?: string | null;
  onboarding_completed?: boolean;
  time_commitment?: string;
  last_milestone_celebrated?: string;
}

interface UserProgress {
  lesson_id: string;
  completion_rate: number;
  completed_at?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [userProgress, setUserProgress] = useState<UserProgress[]>([]);
  const [progress, setProgress] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [triggers, setTriggers] = useState<(SeasonalTrigger | ThresholdTrigger)[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [nextUpLesson, setNextUpLesson] = useState<Lesson | null>(null);
  const [upcomingLessons, setUpcomingLessons] = useState<Lesson[]>([]);
  const [showMilestone, setShowMilestone] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState<'first_lesson' | '25_percent' | '50_percent' | '75_percent' | '100_percent'>('first_lesson');

  useEffect(() => {
    checkUser();
    checkSubscription();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      if (error) throw error;
      console.log('Subscription status:', data);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setUser(user);
    
    // Fetch user profile
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    setProfile(profileData);

    // Fetch user progress
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('lesson_id, completion_rate, completed_at')
      .eq('user_id', user.id);

    setUserProgress(progressData || []);
    const completed = (progressData || []).filter(p => p.completion_rate === 100).length;
    setCompletedCount(completed);

    // Fetch lessons with seasonal tags
    const { data: lessonsData } = await supabase
      .from('lessons')
      .select('id, title, category, difficulty, duration, emoji, order_index, seasonal_tags')
      .order('order_index');

    if (lessonsData && profileData) {
      // Calculate seasonal and proactive triggers
      const seasonalTriggers = getActiveSeasonalTriggers({
        business_structure: profileData.business_structure,
        accounting_year_end: profileData.accounting_year_end,
        next_vat_return_due: profileData.next_vat_return_due ? new Date(profileData.next_vat_return_due) : null,
        vat_registered: profileData.vat_registered,
      });

      const proactiveTriggers = getActiveProactiveTriggers({
        annual_turnover: profileData.annual_turnover,
        vat_registered: profileData.vat_registered,
        mtd_status: profileData.mtd_status,
        turnover_last_updated: profileData.turnover_last_updated ? new Date(profileData.turnover_last_updated) : null,
      });

      const allTriggers = [...seasonalTriggers, ...proactiveTriggers];
      setTriggers(allTriggers);

      // Use recommendation engine
      const recommendations = await getRecommendedLessons(user.id, profileData);
      
      // Set next up lesson
      if (recommendations.primary) {
        const foundLesson = lessonsData.find(l => l.id === recommendations.primary?.id);
        setNextUpLesson(foundLesson ? foundLesson as Lesson : null);
      }

      // Use prioritization for upcoming lessons
      const prioritized = calculateLessonPriority(lessonsData, {
        business_structure: profileData.business_structure,
        industry: profileData.industry,
        experience_level: profileData.experience_level,
        pain_point: profileData.pain_point,
        learning_goal: profileData.learning_goal,
        accounting_year_end: profileData.accounting_year_end,
        next_vat_return_due: profileData.next_vat_return_due ? new Date(profileData.next_vat_return_due) : null,
        vat_registered: profileData.vat_registered,
        annual_turnover: profileData.annual_turnover,
        mtd_status: profileData.mtd_status,
        turnover_last_updated: profileData.turnover_last_updated ? new Date(profileData.turnover_last_updated) : null,
      });

      // Map prioritized lessons
      const sortedLessons = prioritized.map(p => 
        lessonsData.find(l => l.id === p.lessonId)
      ).filter(Boolean) as Lesson[];

      setLessons(sortedLessons);
      
      // Set upcoming lessons (next 3 after primary)
      const foundLesson = lessonsData.find(l => l.id === recommendations.primary?.id);
      const upcoming = sortedLessons.filter(l => l.id !== foundLesson?.id).slice(0, 3);
      setUpcomingLessons(upcoming);

      // Calculate progress
      const total = lessonsData?.length || 1;
      const progressPercent = (completed / total) * 100;
      setProgress(progressPercent);

      // Check for milestones (once migration is approved, this field will exist)
      checkMilestones(completed, total, (profileData as any).last_milestone_celebrated);

      // Show onboarding for new users
      if (!profileData.onboarding_completed && completed === 0 && progressData?.length === 0) {
        setShowOnboarding(true);
      }
    }
  };

  const checkMilestones = (completed: number, total: number, lastCelebrated?: string) => {
    const percent = (completed / total) * 100;
    
    if (completed === 1 && lastCelebrated !== 'first_lesson') {
      setCurrentMilestone('first_lesson');
      setShowMilestone(true);
      updateMilestoneCelebrated('first_lesson');
    } else if (percent >= 25 && percent < 50 && lastCelebrated !== '25_percent' && !['50_percent', '75_percent', '100_percent'].includes(lastCelebrated || '')) {
      setCurrentMilestone('25_percent');
      setShowMilestone(true);
      updateMilestoneCelebrated('25_percent');
    } else if (percent >= 50 && percent < 75 && lastCelebrated !== '50_percent' && !['75_percent', '100_percent'].includes(lastCelebrated || '')) {
      setCurrentMilestone('50_percent');
      setShowMilestone(true);
      updateMilestoneCelebrated('50_percent');
    } else if (percent >= 75 && percent < 100 && lastCelebrated !== '75_percent' && lastCelebrated !== '100_percent') {
      setCurrentMilestone('75_percent');
      setShowMilestone(true);
      updateMilestoneCelebrated('75_percent');
    } else if (percent === 100 && lastCelebrated !== '100_percent') {
      setCurrentMilestone('100_percent');
      setShowMilestone(true);
      updateMilestoneCelebrated('100_percent');
    }
  };

  const updateMilestoneCelebrated = async (milestone: string) => {
    if (user) {
      await (supabase as any)
        .from('user_profiles')
        .update({ last_milestone_celebrated: milestone })
        .eq('user_id', user.id);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "See you next time!",
    });
    navigate("/");
  };

  const handleManageSubscription = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      if (error) throw error;
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open subscription management.",
        variant: "destructive"
      });
    }
  };

  const handleStartJourney = async () => {
    setShowOnboarding(false);
    if (user) {
      await (supabase as any)
        .from('user_profiles')
        .update({ onboarding_completed: true })
        .eq('user_id', user.id);
    }
    navigate("/first-day");
  };

  const getBusinessTypeLabel = () => {
    if (!profile) return 'Business Owner';
    const labels: { [key: string]: string } = {
      'Sole Trader': 'Sole Trader',
      'Limited Company': 'Limited Company Owner',
      'Partnership': 'Partner',
      'Just exploring': 'Future Business Owner'
    };
    return labels[profile.business_structure] || 'Business Owner';
  };

  const monthlyFocus = profile ? getMonthlyFocus({
    business_structure: profile.business_structure,
    vat_registered: profile.vat_registered,
    accounting_year_end: profile.accounting_year_end,
  }) : null;

  // Determine lesson status for journey path
  const getJourneyPathLessons = () => {
    return lessons.slice(0, 8).map(lesson => {
      const progressItem = userProgress.find(p => p.lesson_id === lesson.id);
      let status: 'completed' | 'current' | 'next' | 'locked' = 'locked';
      
      if (progressItem?.completion_rate === 100) {
        status = 'completed';
      } else if (lesson.id === nextUpLesson?.id) {
        status = 'current';
      } else if (upcomingLessons.some(l => l.id === lesson.id)) {
        status = 'next';
      }

      return {
        id: lesson.id,
        title: lesson.title,
        emoji: lesson.emoji,
        status,
      };
    });
  };

  const getNextUpProgress = () => {
    if (!nextUpLesson) return 0;
    const progressItem = userProgress.find(p => p.lesson_id === nextUpLesson.id);
    return progressItem?.completion_rate || 0;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Onboarding Modal */}
      <OnboardingWelcome 
        isOpen={showOnboarding}
        onClose={() => setShowOnboarding(false)}
        onStartJourney={handleStartJourney}
      />

      {/* Milestone Modal */}
      <MilestoneModal
        isOpen={showMilestone}
        onClose={() => setShowMilestone(false)}
        milestone={currentMilestone}
        lessonsCompleted={completedCount}
        totalLessons={lessons.length}
      />

      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎣</span>
            <h1 className="text-xl font-bold">Reelin</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/curriculum')}>
              <BookOpen className="w-4 h-4 mr-2" />
              Curriculum
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/glossary')}>
              Glossary
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/community')}>
              <Users className="w-4 h-4 mr-2" />
              Community
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">
            Welcome back, {getBusinessTypeLabel()}! 👋
          </h2>
          <p className="text-muted-foreground">
            {profile?.learning_goal || 'Continue your learning journey'}
          </p>
        </div>

        {/* Profile Completion Prompt */}
        {profile && user && (
          <ProfilePrompt profile={profile} userId={user.id} />
        )}

        {/* Urgent Banner */}
        <UrgentBanner 
          triggers={triggers} 
          onActionClick={(lessonId) => navigate(`/lesson/${lessonId}`)}
          isSubscribed={profile?.subscription_status === 'active'}
        />

        {/* Monthly Focus Card */}
        {monthlyFocus && (
          <MonthlyFocusCard
            currentMonth={monthlyFocus.currentMonth}
            focusAreas={monthlyFocus.focusAreas}
            upcomingDeadlines={monthlyFocus.upcomingDeadlines}
          />
        )}

        {/* Subscription Banner (compact) */}
        {profile?.subscription_status !== 'active' && (
          <Card className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 mb-8">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <p className="text-sm font-medium">Unlock all lessons for £9.99/month</p>
              </div>
              <Button size="sm" onClick={() => navigate("/pricing")}>
                Subscribe
              </Button>
            </div>
          </Card>
        )}

        {/* Compact Progress Card */}
        <Card className="p-6 mb-8 bg-gradient-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <span className="font-bold text-2xl">{Math.round(progress)}%</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <span className="text-sm">{completedCount}/{lessons.length} lessons</span>
              </div>
              {completedCount > 0 && (
                <Badge variant="secondary" className="gap-1">
                  🔥 {completedCount} day streak
                </Badge>
              )}
            </div>
            <Button variant="outline" size="sm" onClick={() => navigate('/progress')}>
              View Details
            </Button>
          </div>
          <Progress value={progress} className="h-3" />
        </Card>

        {/* Journey Path Visualization */}
        {lessons.length > 0 && (
          <JourneyPath lessons={getJourneyPathLessons()} />
        )}

        {/* First Day CTA (for brand new users) */}
        {completedCount === 0 && userProgress.length === 0 && (
          <Card className="p-8 mb-8 bg-gradient-to-br from-primary/10 via-primary/5 to-background border-2 border-primary/20">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="text-6xl">🎯</div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold mb-2">Start Here: Your First Day in Business</h3>
                <p className="text-muted-foreground mb-4">
                  Complete beginner? This 10-minute lesson covers the absolute essentials for day 1.
                </p>
                <Button 
                  size="lg" 
                  onClick={() => navigate("/first-day")}
                  className="w-full md:w-auto"
                >
                  Start Your Journey →
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Next Up Card (Primary Recommendation) */}
        {nextUpLesson && completedCount > 0 && (
          <NextUpCard 
            lesson={nextUpLesson}
            reason={profile?.pain_point ? `Based on: ${profile.pain_point}` : undefined}
            isInProgress={getNextUpProgress() > 0}
            progressPercent={getNextUpProgress()}
          />
        )}

        {/* Upcoming Preview */}
        {upcomingLessons.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Coming Up Next</h3>
              <Button variant="ghost" size="sm" onClick={() => navigate('/curriculum')}>
                View Full Curriculum →
              </Button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {upcomingLessons.map((lesson) => (
                <Card 
                  key={lesson.id}
                  className="p-4 opacity-60 hover:opacity-80 transition-opacity"
                >
                  <div className="text-4xl mb-3">{lesson.emoji}</div>
                  <h4 className="font-semibold text-sm mb-2 line-clamp-2">{lesson.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="text-xs">{lesson.duration} min</Badge>
                    <Badge variant="outline" className="text-xs">{lesson.difficulty}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* AI Study Buddy CTA */}
        <Card className="p-6 bg-gradient-primary text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-bold mb-1">AI Study Buddy</h3>
                <p className="text-white/90">
                  Get instant answers to your UK business finance questions
                </p>
              </div>
            </div>
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 whitespace-nowrap"
              onClick={() => navigate("/chat")}
            >
              Start Chat →
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
