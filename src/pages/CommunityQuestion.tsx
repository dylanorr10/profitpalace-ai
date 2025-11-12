import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, ThumbsUp, MessageSquare, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Answer {
  id: string;
  content: string;
  upvotes: number;
  is_verified: boolean;
  created_at: string;
  user_id: string;
}

interface Question {
  id: string;
  title: string;
  content: string;
  tags: string[];
  upvotes: number;
  answer_count: number;
  is_answered: boolean;
  created_at: string;
  user_id: string;
}

const CommunityQuestion = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [question, setQuestion] = useState<Question | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [newAnswer, setNewAnswer] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [userId, setUserId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    checkAuth();
    fetchQuestion();
    fetchAnswers();
  }, [id]);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserId(user.id);
      const { data } = await supabase.functions.invoke('check-subscription');
      setIsSubscribed(data?.subscribed || false);
    }
  };

  const fetchQuestion = async () => {
    const { data, error } = await supabase
      .from('community_questions')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      toast({
        title: "Error",
        description: "Question not found.",
        variant: "destructive",
      });
      navigate('/community');
      return;
    }

    setQuestion(data);
  };

  const fetchAnswers = async () => {
    const { data, error } = await supabase
      .from('community_answers')
      .select('*')
      .eq('question_id', id)
      .order('upvotes', { ascending: false });

    if (!error && data) {
      setAnswers(data);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!userId) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to answer.",
        variant: "destructive",
      });
      navigate('/login');
      return;
    }

    if (!isSubscribed) {
      toast({
        title: "Subscription Required",
        description: "Upgrade to post answers in the community.",
        variant: "destructive",
      });
      navigate('/pricing');
      return;
    }

    if (!newAnswer.trim()) {
      toast({
        title: "Empty answer",
        description: "Please write an answer before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('community_answers')
        .insert({
          question_id: id,
          user_id: userId,
          content: newAnswer,
        });

      if (error) throw error;

      toast({
        title: "Answer posted!",
        description: "Thank you for helping the community.",
      });

      setNewAnswer("");
      fetchAnswers();
    } catch (error) {
      console.error('Error posting answer:', error);
      toast({
        title: "Error",
        description: "Failed to post answer. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpvote = async (answerId: string) => {
    if (!userId) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to vote.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Check if already voted
      const { data: existingVote } = await supabase
        .from('community_votes')
        .select('*')
        .eq('user_id', userId)
        .eq('target_id', answerId)
        .eq('vote_type', 'answer')
        .single();

      if (existingVote) {
        // Remove vote
        await supabase
          .from('community_votes')
          .delete()
          .eq('user_id', userId)
          .eq('target_id', answerId);

        // Decrement upvote count
        const answer = answers.find(a => a.id === answerId);
        if (answer) {
          await supabase
            .from('community_answers')
            .update({ upvotes: Math.max(0, answer.upvotes - 1) })
            .eq('id', answerId);
        }
      } else {
        // Add vote
        await supabase
          .from('community_votes')
          .insert({
            user_id: userId,
            target_id: answerId,
            vote_type: 'answer',
          });

        // Increment upvote count
        const answer = answers.find(a => a.id === answerId);
        if (answer) {
          await supabase
            .from('community_answers')
            .update({ upvotes: answer.upvotes + 1 })
            .eq('id', answerId);
        }
      }

      fetchAnswers();
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  if (!question) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/community")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Community
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Question */}
        <Card className="p-8 mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="flex flex-col items-center gap-1">
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <ThumbsUp className="w-5 h-5" />
              </Button>
              <span className="text-sm font-semibold">{question.upvotes}</span>
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-4">{question.title}</h1>
              <p className="text-lg mb-4 whitespace-pre-wrap">{question.content}</p>
              
              <div className="flex items-center gap-3 flex-wrap">
                {question.tags.map((tag, idx) => (
                  <Badge key={idx} variant="outline">{tag}</Badge>
                ))}
                <span className="text-sm text-muted-foreground ml-auto">
                  Asked {formatDistanceToNow(new Date(question.created_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Answers */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            {question.answer_count} {question.answer_count === 1 ? 'Answer' : 'Answers'}
          </h2>

          {answers.length === 0 ? (
            <Card className="p-8 text-center">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No answers yet. Be the first to help!</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {answers.map((answer) => (
                <Card key={answer.id} className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex flex-col items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleUpvote(answer.id)}
                      >
                        <ThumbsUp className="w-5 h-5" />
                      </Button>
                      <span className="text-sm font-semibold">{answer.upvotes}</span>
                    </div>
                    
                    <div className="flex-1">
                      <p className="text-lg mb-3 whitespace-pre-wrap">{answer.content}</p>
                      {answer.is_verified && (
                        <Badge className="bg-success/10 text-success mb-2">✓ Verified Answer</Badge>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Answered {formatDistanceToNow(new Date(answer.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        <Separator className="my-8" />

        {/* Answer Form */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold mb-4">Your Answer</h3>
          
          {!isSubscribed && (
            <div className="mb-4 p-4 bg-muted rounded-lg flex items-start gap-3">
              <Lock className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium mb-1">Premium Feature</p>
                <p className="text-sm text-muted-foreground">
                  Upgrade to post answers and help the community.
                </p>
                <Button size="sm" className="mt-2" onClick={() => navigate('/pricing')}>
                  View Plans
                </Button>
              </div>
            </div>
          )}

          <Textarea
            placeholder={isSubscribed ? "Share your knowledge and help others..." : "Subscribe to post answers"}
            value={newAnswer}
            onChange={(e) => setNewAnswer(e.target.value)}
            disabled={!isSubscribed}
            className="min-h-[150px] mb-4"
          />

          <Button
            onClick={handleSubmitAnswer}
            disabled={!isSubscribed || isSubmitting || !newAnswer.trim()}
            size="lg"
          >
            {isSubmitting ? "Posting..." : "Post Answer"}
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default CommunityQuestion;
