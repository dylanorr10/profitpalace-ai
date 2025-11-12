import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Lock, CheckCircle2, ArrowLeft, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { hasAccessToLesson } from "@/utils/accessControl";

interface Lesson {
  id: string;
  title: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: number;
  emoji: string;
  order_index: number;
}

const Curriculum = () => {
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [filteredLessons, setFilteredLessons] = useState<Lesson[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [profile, setProfile] = useState<any>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterLessons();
  }, [searchQuery, selectedCategory, selectedDifficulty, lessons]);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Fetch profile
    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    setProfile(profileData);

    // Fetch lessons
    const { data: lessonsData } = await supabase
      .from('lessons')
      .select('*')
      .order('order_index');
    setLessons((lessonsData || []) as Lesson[]);

    // Fetch completed lessons
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('lesson_id, completion_rate')
      .eq('user_id', user.id)
      .eq('completion_rate', 100);
    
    if (progressData) {
      setCompletedLessonIds(new Set(progressData.map(p => p.lesson_id)));
    }
  };

  const filterLessons = () => {
    let filtered = lessons;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(l => l.category === selectedCategory);
    }

    // Filter by difficulty
    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(l => l.difficulty === selectedDifficulty);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(l => 
        l.title.toLowerCase().includes(query) ||
        l.category.toLowerCase().includes(query)
      );
    }

    setFilteredLessons(filtered);
  };

  const categories = ["all", ...Array.from(new Set(lessons.map(l => l.category)))];
  const difficulties = ["all", "Beginner", "Intermediate", "Advanced"];

  const difficultyColors = {
    Beginner: "bg-success/10 text-success",
    Intermediate: "bg-primary/10 text-primary",
    Advanced: "bg-destructive/10 text-destructive",
  };

  const canAccessLesson = (orderIndex: number) => {
    return hasAccessToLesson(orderIndex, profile?.subscription_status);
  };

  const getLessonStatus = (lessonId: string, orderIndex: number) => {
    if (completedLessonIds.has(lessonId)) return 'completed';
    if (!canAccessLesson(orderIndex)) return 'locked';
    return 'available';
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-3"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold">Full Curriculum</h1>
          <p className="text-muted-foreground">
            Browse all {lessons.length} lessons at your own pace
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search lessons..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12"
            />
          </div>

          {/* Category Tabs */}
          <div>
            <p className="text-sm font-medium mb-2">Category</p>
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
              <TabsList className="w-full justify-start flex-wrap h-auto">
                {categories.map(cat => (
                  <TabsTrigger key={cat} value={cat} className="capitalize">
                    {cat}
                    {cat !== 'all' && (
                      <Badge variant="secondary" className="ml-2">
                        {lessons.filter(l => l.category === cat).length}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>

          {/* Difficulty Tabs */}
          <div>
            <p className="text-sm font-medium mb-2">Difficulty</p>
            <Tabs value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <TabsList>
                {difficulties.map(diff => (
                  <TabsTrigger key={diff} value={diff} className="capitalize">
                    {diff}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredLessons.length} {filteredLessons.length === 1 ? 'lesson' : 'lessons'}
        </p>

        {/* Lessons Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredLessons.map((lesson) => {
            const hasAccess = canAccessLesson(lesson.order_index);
            const status = getLessonStatus(lesson.id, lesson.order_index);
            
            return (
              <Card 
                key={lesson.id}
                className={`p-6 hover:shadow-lg transition-all relative overflow-hidden ${
                  hasAccess ? 'cursor-pointer group' : 'opacity-60 cursor-not-allowed'
                }`}
                onClick={() => hasAccess && navigate(`/lesson/${lesson.id}`)}
              >
                {status === 'locked' && (
                  <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
                    <div className="text-center">
                      <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Upgrade to unlock</p>
                    </div>
                  </div>
                )}

                {status === 'completed' && (
                  <div className="absolute top-4 right-4 z-10">
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

        {filteredLessons.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No lessons found matching your filters.</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Curriculum;
