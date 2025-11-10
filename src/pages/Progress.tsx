import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, TrendingUp, Target, Award, Calendar } from "lucide-react";
import { ACHIEVEMENTS } from "@/utils/achievements";

interface ProgressData {
  lessonsCompleted: number;
  totalLessons: number;
  averageQuizScore: number;
  totalTimeSpent: number;
  currentStreak: number;
  achievements: any[];
  recentProgress: any[];
}

const Progress = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ProgressData | null>(null);

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate("/login");
        return;
      }

      // Fetch completed lessons
      const { data: progressData } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id);

      // Fetch total lessons
      const { data: lessonsData } = await supabase
        .from("lessons")
        .select("id");

      // Fetch achievements
      const { data: achievementsData } = await supabase
        .from("achievements")
        .select("*")
        .eq("user_id", user.id)
        .order("earned_at", { ascending: false });

      if (!progressData || !lessonsData) {
        setLoading(false);
        return;
      }

      const completed = progressData.filter((p) => p.completion_rate === 100);
      const totalTime = progressData.reduce((sum, p) => sum + (p.time_spent || 0), 0);
      const avgScore = completed.length > 0
        ? completed.reduce((sum, p) => sum + (p.quiz_score || 0), 0) / completed.length
        : 0;

      // Calculate current streak
      const streak = calculateStreak(progressData);

      setData({
        lessonsCompleted: completed.length,
        totalLessons: lessonsData.length,
        averageQuizScore: Math.round(avgScore),
        totalTimeSpent: totalTime,
        currentStreak: streak,
        achievements: achievementsData || [],
        recentProgress: progressData.slice(0, 5),
      });
    } catch (error) {
      console.error("Error fetching progress:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStreak = (progressData: any[]): number => {
    const completedDates = progressData
      .filter((p) => p.completed_at)
      .map((p) => new Date(p.completed_at).toDateString())
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    let currentDate = new Date();

    for (let i = 0; i < completedDates.length; i++) {
      const progressDate = new Date(completedDates[i]);
      const diffDays = Math.floor(
        (currentDate.getTime() - progressDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays === i) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">No progress data available</p>
          <Button onClick={() => navigate("/dashboard")} className="mt-4">
            Go to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const completionPercentage = (data.lessonsCompleted / data.totalLessons) * 100;

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/dashboard")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Your Progress</h1>
            <p className="text-muted-foreground">Track your learning journey</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Course Progress</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{Math.round(completionPercentage)}%</div>
              <ProgressBar value={completionPercentage} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {data.lessonsCompleted} of {data.totalLessons} lessons
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Quiz Score</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{data.averageQuizScore}%</div>
              <p className="text-xs text-muted-foreground mt-2">
                Across {data.lessonsCompleted} quizzes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-2">
                {data.currentStreak}
                {data.currentStreak > 0 && <span>🔥</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {data.currentStreak === 1 ? "day" : "days"} in a row
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Time Invested</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatTime(data.totalTimeSpent)}</div>
              <p className="text-xs text-muted-foreground mt-2">Total learning time</p>
            </CardContent>
          </Card>
        </div>

        {/* Achievements */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Your Achievements</CardTitle>
            <CardDescription>
              {data.achievements.length} of {Object.keys(ACHIEVEMENTS).length} unlocked
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {data.achievements.map((achievement) => {
                const achievementInfo = ACHIEVEMENTS[achievement.achievement_type as keyof typeof ACHIEVEMENTS];
                return (
                  <div
                    key={achievement.id}
                    className="text-center p-4 bg-secondary/50 rounded-lg"
                  >
                    <div className="text-4xl mb-2">{achievementInfo?.emoji}</div>
                    <p className="text-xs font-medium">{achievement.achievement_name}</p>
                  </div>
                );
              })}
              {Object.entries(ACHIEVEMENTS)
                .filter(([type]) => !data.achievements.find((a) => a.achievement_type === type))
                .map(([type, info]) => (
                  <div
                    key={type}
                    className="text-center p-4 bg-secondary/20 rounded-lg opacity-50"
                  >
                    <div className="text-4xl mb-2 grayscale">🔒</div>
                    <p className="text-xs font-medium">{info.name}</p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Back to Dashboard */}
        <div className="flex justify-center">
          <Button onClick={() => navigate("/dashboard")} size="lg">
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Progress;
