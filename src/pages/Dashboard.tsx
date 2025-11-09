import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, TrendingUp, Award, LogOut, BookOpen, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Lesson {
  id: string;
  title: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: number;
  emoji: string;
  completed?: boolean;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);
  const [progress, setProgress] = useState(0);

  // Sample lessons - in real app, fetch from database
  const lessons: Lesson[] = [
    { id: "1", title: "Understanding Profit & Loss", category: "Tax", difficulty: "Beginner", duration: 3, emoji: "💰", completed: true },
    { id: "2", title: "Making Tax Digital Basics", category: "Tax", difficulty: "Beginner", duration: 4, emoji: "📱" },
    { id: "3", title: "Claiming Expenses Correctly", category: "Expenses", difficulty: "Beginner", duration: 5, emoji: "🧾" },
    { id: "4", title: "VAT Explained Simply", category: "VAT", difficulty: "Intermediate", duration: 4, emoji: "📊" },
    { id: "5", title: "Mileage & Travel Deductions", category: "Expenses", difficulty: "Beginner", duration: 3, emoji: "🚗" },
    { id: "6", title: "Home Office Deductions", category: "Expenses", difficulty: "Intermediate", duration: 4, emoji: "🏠" },
    { id: "7", title: "CIS for Construction", category: "Tax", difficulty: "Intermediate", duration: 5, emoji: "🏗️" },
    { id: "8", title: "Professional Invoicing", category: "Admin", difficulty: "Beginner", duration: 3, emoji: "💼" },
  ];

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setUser(user);
    
    // Calculate progress (simplified)
    const completed = lessons.filter(l => l.completed).length;
    setProgress((completed / lessons.length) * 100);
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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">UK Business Academy</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back! 👋</h2>
          <p className="text-muted-foreground">Continue your learning journey</p>
        </div>

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
                <div className="text-2xl font-bold">2.5h</div>
                <div className="text-sm text-muted-foreground">Time Saved</div>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-card">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-full">
                <Award className="w-6 h-6 text-accent" />
              </div>
              <div>
                <div className="text-2xl font-bold">3</div>
                <div className="text-sm text-muted-foreground">Badges Earned</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Lessons Grid */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold mb-6">Your Lessons</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <Card 
                key={lesson.id}
                className="p-6 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden"
                onClick={() => navigate(`/lesson/${lesson.id}`)}
              >
                {lesson.completed && (
                  <div className="absolute top-3 right-3">
                    <CheckCircle2 className="w-6 h-6 text-success" />
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

                <div className="flex items-center gap-2">
                  <Badge className={difficultyColors[lesson.difficulty]}>
                    {lesson.difficulty}
                  </Badge>
                  <Badge variant="outline">{lesson.category}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="p-6 bg-gradient-primary text-white">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold mb-2">Need help? Ask our AI Study Buddy!</h3>
              <p className="text-white/80">Get instant answers to your business finance questions</p>
            </div>
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90"
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
