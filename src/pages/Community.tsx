import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, Search, TrendingUp, Plus, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Question {
  id: string;
  title: string;
  content: string;
  tags: string[];
  upvotes: number;
  answer_count: number;
  is_answered: boolean;
  created_at: string;
}

const Community = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkSubscription();
    fetchQuestions();
  }, []);

  const checkSubscription = async () => {
    try {
      const { data } = await supabase.functions.invoke('check-subscription');
      setIsSubscribed(data?.subscribed || false);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const fetchQuestions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('community_questions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setQuestions(data || []);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredQuestions = questions.filter(q =>
    q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleAskQuestion = () => {
    if (!isSubscribed) {
      toast({
        title: "Subscription Required",
        description: "Upgrade to ask questions in the community.",
        variant: "destructive",
      });
      navigate('/pricing');
      return;
    }
    navigate('/community/ask');
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <Button onClick={handleAskQuestion}>
            {isSubscribed ? (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Ask Question
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 mr-2" />
                Ask Question (Premium)
              </>
            )}
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Community Q&A 💬</h1>
          <p className="text-muted-foreground">
            Get help from fellow business owners and our experts
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-8 h-8 text-primary" />
              <div>
                <div className="text-2xl font-bold">{questions.length}</div>
                <div className="text-sm text-muted-foreground">Total Questions</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-success" />
              <div>
                <div className="text-2xl font-bold">
                  {questions.filter(q => q.is_answered).length}
                </div>
                <div className="text-sm text-muted-foreground">Answered</div>
              </div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center gap-3">
              <div className="text-2xl">👥</div>
              <div>
                <div className="text-2xl font-bold">500+</div>
                <div className="text-sm text-muted-foreground">Members</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Questions List */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading questions...</p>
          </div>
        ) : filteredQuestions.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground mb-4">
              {searchQuery ? "No questions found matching your search." : "No questions yet. Be the first to ask!"}
            </p>
            <Button onClick={handleAskQuestion}>Ask the First Question</Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((question) => (
              <Card
                key={question.id}
                className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => navigate(`/community/question/${question.id}`)}
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center gap-1 text-muted-foreground">
                    <TrendingUp className="w-5 h-5" />
                    <span className="text-sm font-semibold">{question.upvotes}</span>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-2 hover:text-primary">
                      {question.title}
                    </h3>
                    <p className="text-muted-foreground mb-3 line-clamp-2">
                      {question.content}
                    </p>
                    
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MessageSquare className="w-4 h-4" />
                        <span>{question.answer_count} {question.answer_count === 1 ? 'answer' : 'answers'}</span>
                      </div>
                      
                      {question.is_answered && (
                        <Badge className="bg-success/10 text-success">✓ Answered</Badge>
                      )}
                      
                      {question.tags.map((tag, idx) => (
                        <Badge key={idx} variant="outline">{tag}</Badge>
                      ))}
                      
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Community;
