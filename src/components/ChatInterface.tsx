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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Check if user has scrolled up
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

  useEffect(scrollToBottom, [messages]);

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
  ] : [
    'What expenses can I claim for my business?',
    'When do I need to register for VAT?',
    'How do I file a Self Assessment tax return?',
  ];

  return (
    <div className="flex flex-col h-full relative">
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="mb-6 animate-fade-in">
              <div className="w-20 h-20 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-primary" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-foreground">AI Study Buddy</h3>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Ask me anything about UK business finances, tax, or bookkeeping
              </p>
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
