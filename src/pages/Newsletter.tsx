import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Mail, Loader2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

const Newsletter = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [content, setContent] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [generatedAt, setGeneratedAt] = useState<string>('');

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }
  };

  const generateNewsletter = async () => {
    setIsGenerating(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-newsletter`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate newsletter');
      }

      const data = await response.json();
      setContent(data.content);
      setProfile(data.profile);
      setGeneratedAt(data.generated_at);

      toast({
        title: 'Newsletter Generated',
        description: 'Your personalized newsletter is ready!',
      });
    } catch (error) {
      console.error('Newsletter generation error:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to generate newsletter',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadNewsletter = () => {
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reelin-newsletter-${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
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
              <Mail className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold">Personalized Newsletter</h1>
            </div>
          </div>
          {content && (
            <Button
              variant="outline"
              size="sm"
              onClick={downloadNewsletter}
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </Button>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {!content ? (
          <Card className="p-8 text-center">
            <Mail className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h2 className="text-2xl font-bold mb-2">Generate Your Newsletter</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Get a personalized monthly newsletter with deadlines, tips, and recommendations 
              tailored to your business profile and the current tax season.
            </p>
            <Button
              size="lg"
              onClick={generateNewsletter}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Mail className="w-5 h-5 mr-2" />
                  Generate Newsletter
                </>
              )}
            </Button>
          </Card>
        ) : (
          <>
            <Card className="p-8 mb-6">
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <div>
                  <h2 className="text-2xl font-bold mb-1">
                    Your Personalized Newsletter
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Generated for {profile?.business_structure} in {profile?.industry}
                    {generatedAt && ` • ${new Date(generatedAt).toLocaleDateString('en-GB', { 
                      day: 'numeric', 
                      month: 'long', 
                      year: 'numeric' 
                    })}`}
                  </p>
                </div>
                <Button
                  onClick={generateNewsletter}
                  disabled={isGenerating}
                  variant="outline"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Regenerate'
                  )}
                </Button>
              </div>

              <div className="prose prose-slate dark:prose-invert max-w-none">
                <ReactMarkdown>{content}</ReactMarkdown>
              </div>
            </Card>

            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => setContent('')}
              >
                Generate New Newsletter
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Newsletter;
