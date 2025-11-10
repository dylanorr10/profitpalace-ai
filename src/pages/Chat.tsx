import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import ChatInterface from '@/components/ChatInterface';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { getRemainingFreeQuestions } from '@/utils/accessControl';

const Chat = () => {
  const navigate = useNavigate();
  const [remainingQuestions, setRemainingQuestions] = useState<number | undefined>();
  const [hasPurchased, setHasPurchased] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('has_purchased')
        .eq('user_id', user.id)
        .single();

      const purchased = profile?.has_purchased || false;
      setHasPurchased(purchased);

      if (!purchased) {
        const { data: usage } = await supabase
          .from('ai_usage')
          .select('messages_count')
          .eq('user_id', user.id)
          .single();

        setRemainingQuestions(getRemainingFreeQuestions(usage?.messages_count || 0, purchased));
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex flex-col">
      <div className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">AI Study Buddy</h1>
            </div>
          </div>
          {!hasPurchased && (
            <Button
              size="sm"
              onClick={() => navigate('/pricing')}
            >
              Upgrade for Unlimited
            </Button>
          )}
        </div>
      </div>

      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <Card className="h-[calc(100vh-12rem)] flex flex-col">
          <ChatInterface remainingQuestions={remainingQuestions} />
        </Card>
      </div>
    </div>
  );
};

export default Chat;
