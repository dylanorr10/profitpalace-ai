import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, Award, LogOut, Settings, Lock, Sparkles, Users, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { hasAccessToLesson } from "@/utils/accessControl";
import { UrgentBanner } from "@/components/UrgentBanner";
import { MonthlyFocusCard } from "@/components/MonthlyFocusCard";
import ProfilePrompt from "@/components/ProfilePrompt";
import { getActiveSeasonalTriggers, SeasonalTrigger } from "@/utils/seasonalTriggers";
import { getActiveProactiveTriggers, ThresholdTrigger } from "@/utils/proactiveTriggers";
import { calculateLessonPriority } from "@/utils/lessonPriority";
import { getMonthlyFocus } from "@/utils/monthlyFocus";

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
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [progress, setProgress] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [triggers, setTriggers] = useState<(SeasonalTrigger | ThresholdTrigger)[]>([]);

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

      // Use new prioritization logic
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

      // Map prioritized lessons back to lesson objects
      const sortedLessons = prioritized.map(p => 
        lessonsData.find(l => l.id === p.lessonId)
      ).filter(Boolean) as Lesson[];

      setLessons(sortedLessons);
    }

    // Calculate progress (simplified - would track actual completion)
    const completed = 0; // TODO: Track real completion
    const total = lessonsData?.length || 1;
    setProgress((completed / total) * 100);
    setCompletedCount(completed);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out",
      description: "See you next time!",
    });
    navigate("/");
  };

  const difficultyColors = {
    Beginner: "bg-success/10 text-success",
    Intermediate: "bg-primary/10 text-primary",
    Advanced: "bg-destructive/10 text-destructive",
  };

  const canAccessLesson = (orderIndex: number) => {
    return hasAccessToLesson(orderIndex, profile?.subscription_status || undefined);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎣</span>
            <h1 className="text-xl font-bold">Reelin</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => navigate('/community')}>
              <Users className="w-4 h-4 mr-2" />
              Community
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/newsletter')}>
              <Mail className="w-4 h-4 mr-2" />
              Newsletter
            </Button>
            <Button variant="ghost" size="sm" onClick={() => navigate('/settings')}>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            {profile?.subscription_status !== 'active' && (
              <Button size="sm" onClick={() => navigate('/pricing')}>
                Subscribe
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
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

        {/* Urgent Banner (Seasonal/Proactive Triggers) */}
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

        {/* Subscription Status Banner */}
        {profile?.subscription_status === 'active' && (
          <Card className="p-6 bg-gradient-to-r from-success to-success/70 text-white mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-1">
                  Active Subscription - {profile.subscription_type === 'annual' ? 'Annual Plan' : 'Monthly Plan'}
                </h3>
                <p className="text-white/90">
                  Full access to all lessons and features
                  {profile.subscription_ends_at && ` • Renews on ${new Date(profile.subscription_ends_at).toLocaleDateString()}`}
                </p>
              </div>
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 whitespace-nowrap"
                onClick={handleManageSubscription}
              >
                Manage Subscription
              </Button>
            </div>
          </Card>
        )}

        {/* Upgrade Banner (for free users) */}
        {profile?.subscription_status !== 'active' && (
          <Card className="p-6 bg-gradient-to-r from-primary to-primary/70 text-white mb-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold mb-1">Reel in Full Access</h3>
                <p className="text-white/90">£9.99/month or £79.99/year • Save 33% with annual</p>
              </div>
              <Button 
                size="lg" 
                className="bg-white text-primary hover:bg-white/90 whitespace-nowrap"
                onClick={() => navigate("/pricing")}
              >
                Subscribe Now
              </Button>
            </div>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{Math.round(progress)}%</div>
                <div className="text-sm text-muted-foreground">Course Progress</div>
              </div>
            </div>
            <Progress value={progress} className="mt-4" />
          </Card>

          <Card className="p-6 bg-gradient-card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-full">
                <Clock className="w-6 h-6 text-success" />
              </div>
              <div>
                <div className="text-2xl font-bold">{completedCount}/{lessons.length}</div>
                <div className="text-sm text-muted-foreground">Lessons Complete</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-full">
                <Award className="w-6 h-6 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold">{completedCount > 0 ? 1 : 0}</div>
                <div className="text-sm text-muted-foreground">Badges Earned</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Lessons Grid */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-6">
            Your Lessons
            {profile?.pain_point && profile?.subscription_status !== 'active' && (
              <span className="text-base font-normal text-muted-foreground ml-2">
                (prioritized for: {profile.pain_point})
              </span>
            )}
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => {
              const hasAccess = canAccessLesson(lesson.order_index);
              
              return (
                <Card 
                  key={lesson.id}
                  className={`p-6 hover:shadow-lg transition-all relative overflow-hidden ${
                    hasAccess ? 'cursor-pointer group' : 'opacity-60 cursor-not-allowed'
                  }`}
                  onClick={() => hasAccess && navigate(`/lesson/${lesson.id}`)}
                >
                  {!hasAccess && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
                      <div className="text-center">
                        <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">Upgrade to unlock</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                    {lesson.emoji}
                  </div>
                  
                  <h4 className="font-bold text-lg mb-2 line-clamp-2">{lesson.title}</h4>
                  
                  <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{lesson.duration} min</span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={difficultyColors[lesson.difficulty]}>
                      {lesson.difficulty}
                    </Badge>
                    <Badge variant="outline">{lesson.category}</Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* AI Study Buddy CTA */}
        <Card className="p-6 bg-gradient-primary text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-8 h-8" />
              <div>
                <h3 className="text-xl font-bold mb-1">AI Study Buddy</h3>
                <p className="text-white/90">
                  Get instant answers to your UK business finance questions
                  {profile?.subscription_status !== 'active' && ' (10 free questions)'}
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
