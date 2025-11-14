import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { LogOut, Settings, Sparkles, Users, Mail, BookOpen, Award, TrendingUp, GraduationCap } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { UrgentBanner } from "@/components/UrgentBanner";
import { MonthlyFocusCard } from "@/components/MonthlyFocusCard";
import ProfilePrompt from "@/components/ProfilePrompt";
import { DashboardSkeleton } from "@/components/LoadingSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { InteractiveCard } from "@/components/InteractiveCard";
import { IconBadge } from "@/components/IconBadge";
import { getActiveSeasonalTriggers, SeasonalTrigger } from "@/utils/seasonalTriggers";
import { getActiveProactiveTriggers, ThresholdTrigger } from "@/utils/proactiveTriggers";
import { calculateLessonPriority } from "@/utils/lessonPriority";
import { getMonthlyFocus } from "@/utils/monthlyFocus";
import { getRecommendedLessons } from "@/utils/lessonRecommendations";
import { OnboardingWelcome } from "@/components/OnboardingWelcome";
import { NextUpCard } from "@/components/NextUpCard";
import { JourneyPath } from "@/components/JourneyPath";
import { MilestoneModal } from "@/components/MilestoneModal";
import { StreakCard } from "@/components/StreakCard";
import { SeasonalLessonsCard } from "@/components/SeasonalLessonsCard";
import { logDailyActivity, getStreakInfo } from "@/utils/streakTracking";
import { getSeasonalLessons, SeasonalLessonGroup } from "@/utils/seasonalLessons";
import { getLessonsDueForReview, ReviewLesson } from "@/utils/reviewSchedule";
import { ReviewCard } from "@/components/ReviewCard";

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
  first_name?: string;
  full_name?: string;
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
  prompts_dismissed?: any;
}

interface UserProgress {
  lesson_id: string;
  completion_rate: number;
  completed_at?: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, signOut } = useAuth();
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
  const [streakInfo, setStreakInfo] = useState({
    currentStreak: 0,
    longestStreak: 0,
    totalStudyDays: 0,
    lastActivityDate: undefined as string | undefined,
  });
  const [seasonalLessonGroups, setSeasonalLessonGroups] = useState<SeasonalLessonGroup[]>([]);
  const [reviewLessons, setReviewLessons] = useState<ReviewLesson[]>([]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user) return;
    
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

      // Calculate seasonal lessons
      const seasonalGroups = getSeasonalLessons(
        lessonsData as Lesson[],
        profileData,
        progressData || []
      );
      
      // Filter out dismissed seasonal sections
      const dismissedPrompts = (profileData.prompts_dismissed as any) || {};
      const activeSeasonalGroups = seasonalGroups.filter(
        group => !dismissedPrompts[`seasonal_${group.id}`]
      );
      setSeasonalLessonGroups(activeSeasonalGroups);

      // Calculate progress
      const total = lessonsData?.length || 1;
      const progressPercent = (completed / total) * 100;
      setProgress(progressPercent);

      // Check for milestones
      checkMilestones(completed, total);

      // Show onboarding for new users
      if (!profileData.onboarding_completed && completed === 0 && progressData?.length === 0) {
        setShowOnboarding(true);
      }
    }

    // Fetch streak information
    if (user) {
      const streak = await getStreakInfo(user.id);
      setStreakInfo(streak);
      
      // Fetch lessons due for review
      const reviewDue = await getLessonsDueForReview(user.id);
      setReviewLessons(reviewDue);
    }
  };

  const checkMilestones = (completed: number, total: number) => {
    const percent = (completed / total) * 100;
    
    // Simple milestone checking without database updates
    if (completed === 1) {
      setCurrentMilestone('first_lesson');
      setShowMilestone(true);
    } else if (percent >= 25 && percent < 50) {
      setCurrentMilestone('25_percent');
      setShowMilestone(true);
    } else if (percent >= 50 && percent < 75) {
      setCurrentMilestone('50_percent');
      setShowMilestone(true);
    } else if (percent >= 75 && percent < 100) {
      setCurrentMilestone('75_percent');
      setShowMilestone(true);
    } else if (percent === 100) {
      setCurrentMilestone('100_percent');
      setShowMilestone(true);
    }
  };

  const handleLogout = async () => {
    await signOut();
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
    // Sort lessons by order_index for proper sequential display
    const sortedLessons = [...lessons].sort((a, b) => a.order_index - b.order_index);
    
    // Find the first incomplete lesson to mark as current
    const firstIncomplete = sortedLessons.find(lesson => {
      const progressItem = userProgress.find(p => p.lesson_id === lesson.id);
      return progressItem?.completion_rate !== 100;
    });

    return sortedLessons.slice(0, 8).map(lesson => {
      const progressItem = userProgress.find(p => p.lesson_id === lesson.id);
      let status: 'completed' | 'current' | 'next' | 'locked' = 'locked';
      
      // Mark completed lessons
      if (progressItem?.completion_rate === 100) {
        status = 'completed';
      }
      // Mark the current lesson (first incomplete)
      else if (firstIncomplete && lesson.id === firstIncomplete.id) {
        status = 'current';
      }
      // Mark next few lessons after current as 'next'
      else if (firstIncomplete) {
        const currentIndex = sortedLessons.findIndex(l => l.id === firstIncomplete.id);
        const thisIndex = sortedLessons.findIndex(l => l.id === lesson.id);
        if (thisIndex > currentIndex && thisIndex <= currentIndex + 2) {
          status = 'next';
        }
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

  const handleDismissSeasonalSection = async (groupId: string) => {
    if (!user) return;
    
    const currentPrompts = (profile?.prompts_dismissed as any) || {};
    const updatedPrompts = {
      ...currentPrompts,
      [`seasonal_${groupId}`]: true,
    };
    
    await (supabase as any)
      .from('user_profiles')
      .update({ prompts_dismissed: updatedPrompts })
      .eq('user_id', user.id);
    
    // Update local state
    setSeasonalLessonGroups(prev => prev.filter(g => g.id !== groupId));
    
    toast({
      title: "Seasonal section dismissed",
      description: "You can always find these lessons in the curriculum.",
    });
  };

  return (
    <div className="min-h-screen bg-background page-transition">
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
      <header className="border-b border-primary/20 bg-[hsl(var(--slate-bg))] sticky top-0 z-10 h-14 md:h-16">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-2 touch-manipulation">
            <span className="text-2xl">🎣</span>
            <h1 className="text-xl font-bold text-primary">Reelin</h1>
          </div>
          <div className="flex items-center gap-1 md:gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/curriculum')} className="hidden md:flex hover:text-primary">
              <BookOpen className="w-4 h-4 mr-2" />
              Curriculum
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/curriculum')} className="md:hidden hover:text-primary">
              <BookOpen className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/glossary')} className="hidden md:inline-flex hover:text-primary">
              Glossary
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/community')} className="hidden md:flex hover:text-primary">
              <Users className="w-4 h-4 mr-2" />
              Community
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/community')} className="md:hidden hover:text-primary">
              <Users className="w-4 h-4" />
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => navigate('/settings')} className="hover:text-primary">
              <Settings className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="hover:text-primary">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 md:py-8 max-w-6xl overflow-x-hidden">
        {/* Welcome Section */}
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">
            Welcome back{profile?.first_name ? `, ${profile.first_name}` : ''}! 👋
          </h2>
          <p className="text-muted-foreground text-sm md:text-base">
            {profile?.learning_goal || 'Continue your learning journey'}
          </p>
        </div>

        {/* Next Up Card (Primary Recommendation) - Prioritized at top */}
        {nextUpLesson && completedCount > 0 && (
          <div className="mb-6 md:mb-8">
            <NextUpCard 
              lesson={nextUpLesson}
              reason={profile?.pain_point ? `Based on: ${profile.pain_point}` : undefined}
              isInProgress={getNextUpProgress() > 0}
              progressPercent={getNextUpProgress()}
            />
          </div>
        )}

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
          <Card className="p-3 md:p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20 mb-6 md:mb-8">
            <div className="flex items-center justify-between gap-3 md:gap-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-primary flex-shrink-0" />
                <p className="text-xs md:text-sm font-medium">Unlock all lessons for £9.99/month</p>
              </div>
              <Button size="sm" onClick={() => navigate("/pricing")} className="flex-shrink-0">
                Subscribe
              </Button>
            </div>
          </Card>
        )}

        {/* Seasonal Lessons Section */}
        {seasonalLessonGroups.length > 0 && (
          <SeasonalLessonsCard
            seasonalGroups={seasonalLessonGroups}
            onLessonClick={(lessonId) => navigate(`/lesson/${lessonId}`)}
            onDismiss={handleDismissSeasonalSection}
            isSubscribed={profile?.subscription_status === 'active'}
          />
        )}

        {/* Streak Card & Progress */}
        <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
          {/* Streak Tracking */}
          <StreakCard
            currentStreak={streakInfo.currentStreak}
            longestStreak={streakInfo.longestStreak}
            totalStudyDays={streakInfo.totalStudyDays}
            lastActivityDate={streakInfo.lastActivityDate}
          />

          {/* Compact Progress Card */}
          <Card className="p-6 bg-gradient-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                <div>
                  <div className="font-bold text-3xl">{completedCount}</div>
                  <div className="text-sm text-muted-foreground">
                    {completedCount === 1 ? 'Lesson' : 'Lessons'} Completed
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/progress')}>
                View Details
              </Button>
            </div>
            <Progress value={progress} className="h-3 mb-3" />
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>{completedCount} {completedCount === 1 ? 'lesson' : 'lessons'} completed</span>
              <div className="flex items-center gap-1">
                {completedCount >= 5 && <Badge variant="secondary" className="text-xs">🏆 5+</Badge>}
                {completedCount >= 10 && <Badge variant="secondary" className="text-xs">⭐ 10+</Badge>}
                {completedCount >= 25 && <Badge variant="secondary" className="text-xs">💎 25+</Badge>}
                {completedCount >= 50 && <Badge variant="secondary" className="text-xs">👑 50+</Badge>}
                {completedCount > 0 && completedCount < 5 && (
                  <Badge variant="secondary" className="gap-1">
                    <Award className="w-3 h-3" />
                    {completedCount === lessons.length ? 'Complete!' : 'In Progress'}
                  </Badge>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Review Mode - Spaced Repetition */}
        <div className="mb-8">
          <ReviewCard reviewLessons={reviewLessons} />
        </div>

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
