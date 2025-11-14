import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, Sparkles } from 'lucide-react';
import { MessageBubble } from '@/components/MessageBubble';
import { SuggestionCard } from '@/components/SuggestionCard';
import { TypingIndicator } from '@/components/TypingIndicator';
import { ScrollToBottom } from '@/components/ScrollToBottom';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatInterfaceProps {
  lessonContext?: {
    id: string;
    title: string;
    category: string;
  };
  remainingQuestions?: number;
}

const ChatInterface = ({ lessonContext, remainingQuestions }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('display_name, business_structure, industry, experience_level')
        .eq('user_id', user.id)
        .single();

      setUserProfile(profile);

      // Add personalized greeting message if chat is empty
      if (messages.length === 0 && profile) {
        const greeting = getGreetingMessage(profile);
        setMessages([{ role: 'assistant', content: greeting }]);
      }
    };

    fetchProfile();
  }, []);

  const getGreetingMessage = (profile: any) => {
    const name = profile?.display_name || 'there';
    const industry = profile?.industry || 'your business';
    const structure = profile?.business_structure || 'your business';
    const level = profile?.experience_level || 'beginner';
    
    return `Hey ${name}! 👋

I'm your AI Study Buddy, here to help with **${industry}** finances and **${structure}** tax questions.

I know you're at a **${level}** level with finances, so I'll keep things clear and practical. Feel free to ask me anything about:

💡 **Expenses & deductions** for your ${industry} business
📊 **VAT and tax** specific to ${structure}
📝 **Bookkeeping tips** that actually work
⚠️ **Common mistakes** to avoid

What would you like to know today?`;
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Check if user has scrolled up and only auto-scroll on initial load
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
      setShowScrollButton(!isNearBottom && messages.length > 3);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [messages]);

  // Only auto-scroll for the very first message exchange
  useEffect(() => {
    if (messages.length <= 2) {
      scrollToBottom();
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Not authenticated',
          description: 'Please log in to use AI Study Buddy',
          variant: 'destructive',
        });
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: [...messages, userMessage],
            lessonContext,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.upgrade_required) {
          toast({
            title: 'Upgrade Required',
            description: errorData.error,
            variant: 'destructive',
          });
          return;
        }
        throw new Error(errorData.error || 'Failed to get response');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              const profileUpdated = parsed.choices?.[0]?.delta?.profile_updated;
              const updates = parsed.choices?.[0]?.delta?.updates;
              
              if (content) {
                // Remove profile update markers from displayed content
                const cleanContent = content.replace(/\[PROFILE_UPDATE:[^\]]+\]/g, '');
                assistantMessage += cleanContent;
                setMessages(prev => {
                  const newMessages = [...prev];
                  newMessages[newMessages.length - 1].content = assistantMessage;
                  return newMessages;
                });
              }
              
              if (profileUpdated && updates) {
                // Show toast notification about profile update
                const fieldNames: Record<string, string> = {
                  annual_turnover: 'annual turnover',
                  vat_registered: 'VAT registration status',
                  accounting_year_end: 'accounting year-end',
                  business_start_date: 'business start date'
                };
                
                const updatedFields = Object.keys(updates)
                  .map(key => fieldNames[key] || key)
                  .join(', ');
                
                toast({
                  title: 'Profile Updated',
                  description: `I've updated your ${updatedFields} based on our conversation. You'll now get more personalized recommendations!`,
                });
              }
            } catch (e) {
              console.error('Error parsing chunk:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to send message',
        variant: 'destructive',
      });
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = lessonContext ? [
    `Explain ${lessonContext.title} with an example from my industry`,
    'What are common mistakes people make with this?',
    'How does this apply to my business structure?',
  ] : userProfile?.industry ? [
    `What expenses can I claim for my ${userProfile.industry} business?`,
    `As a ${userProfile.business_structure}, when should I register for VAT?`,
    `What tax deadlines should I know about for my ${userProfile.business_structure}?`,
  ] : [
    'What expenses can I claim for my business?',
    'When do I need to register for VAT?',
    'How do I file a Self Assessment tax return?',
  ];

  const getPersonalizedGreeting = () => {
    const name = userProfile?.display_name || 'there';
    const industry = userProfile?.industry || 'your business';
    const structure = userProfile?.business_structure || 'your business';
    
    return `Hey ${name}! 👋 I'm here to help with ${industry} finances and ${structure} tax questions. What would you like to know?`;
  };

  return (
    <div className="flex flex-col h-full relative">
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="mb-6 animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-primary rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3 text-foreground">
                {userProfile?.display_name ? `Hey ${userProfile.display_name}! 👋` : 'AI Study Buddy'}
              </h3>
              {userProfile ? (
                <div className="space-y-2">
                  <p className="text-muted-foreground text-base max-w-md mx-auto">
                    I'm here to help with your <span className="font-semibold text-primary">{userProfile.industry || 'business'}</span> finances
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Tailored advice for {userProfile.business_structure || 'your business'} • {userProfile.experience_level || 'All levels'}
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground text-base max-w-md mx-auto mb-2">
                  Get quick, clear answers about UK business finances
                </p>
              )}
              <div className="flex items-center justify-center gap-2 text-sm text-primary mt-4">
                <span>✨ Personal</span>
                <span>•</span>
                <span>📊 Visual</span>
                <span>•</span>
                <span>💡 Actionable</span>
              </div>
            </div>
            
            <div className="grid gap-3 max-w-lg mx-auto mt-8">
              <p className="text-sm text-muted-foreground mb-2">Try asking:</p>
              {suggestedQuestions.map((question, i) => (
                <SuggestionCard
                  key={i}
                  question={question}
                  onClick={setInput}
                />
              ))}
            </div>
          </div>
        )}

        {messages.map((message, i) => (
          <MessageBubble
            key={i}
            role={message.role}
            content={message.content}
          />
        ))}

        {isLoading && <TypingIndicator />}

        <div ref={messagesEndRef} />
      </div>

      <ScrollToBottom show={showScrollButton} onClick={scrollToBottom} />

      <div className="border-t p-4">
        {remainingQuestions !== undefined && remainingQuestions !== Infinity && (
          <p className="text-sm text-muted-foreground mb-2">
            {remainingQuestions} free questions remaining
          </p>
        )}
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask me anything about UK business finances..."
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <Button
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-[60px] w-[60px]"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
