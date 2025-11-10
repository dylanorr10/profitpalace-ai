import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Rocket, Check } from 'lucide-react';

const Waitlist = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // Update user profile
        const { error } = await supabase
          .from('user_profiles')
          .update({
            waitlist_joined: true,
            waitlist_joined_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        // Just capture email
        const { error } = await supabase
          .from('email_subscribers')
          .insert({
            email,
            source: 'waitlist',
            tags: ['waitlist', 'early_access'],
          });

        if (error && !error.message.includes('duplicate')) throw error;
      }

      setSubmitted(true);
      toast({
        title: 'You\'re on the list! 🎉',
        description: 'We\'ll notify you when we launch.',
      });
    } catch (error) {
      console.error('Waitlist error:', error);
      toast({
        title: 'Error',
        description: 'Failed to join waitlist. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full p-8 text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold mb-2">You're In! 🎉</h2>
          <p className="text-muted-foreground mb-6">
            We'll send you an email as soon as we launch. Keep an eye on your inbox!
          </p>
          <Button onClick={() => window.location.href = '/dashboard'}>
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <Rocket className="w-16 h-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold mb-4">
              Coming Soon: Your Complete Business Management Platform
            </h1>
            <p className="text-xl text-muted-foreground">
              Be the first to access our all-in-one platform for UK business owners
            </p>
          </div>

          <Card className="p-8 mb-8">
            <h2 className="text-2xl font-bold mb-4">What's Coming?</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Automated Bookkeeping</h3>
                  <p className="text-sm text-muted-foreground">
                    Connect your bank, automatically categorize transactions, and track expenses in real-time
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Tax Estimation & Filing</h3>
                  <p className="text-sm text-muted-foreground">
                    Know exactly how much tax you owe, set aside funds automatically, and file directly with HMRC
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">Invoicing & Payments</h3>
                  <p className="text-sm text-muted-foreground">
                    Create professional invoices, accept payments online, and automate payment reminders
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold">AI-Powered Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Get personalized recommendations to save money, improve cash flow, and grow your business
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-8">
            <h2 className="text-2xl font-bold mb-4 text-center">Join the Waitlist</h2>
            <p className="text-center text-muted-foreground mb-6">
              Get early access, exclusive pricing, and help shape the product
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="Your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-lg"
              />
              <Button 
                type="submit" 
                className="w-full h-12 text-lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Joining...' : 'Get Early Access'}
              </Button>
            </form>

            <div className="mt-6 p-4 bg-primary/10 rounded-lg">
              <h3 className="font-semibold mb-2">🎁 Waitlist Perks</h3>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• 20% off launch pricing (forever)</li>
                <li>• First access to new features</li>
                <li>• Free 1-on-1 onboarding call</li>
                <li>• Priority support for life</li>
              </ul>
            </div>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Launching Q2 2025 • 500+ business owners already waiting
          </p>
        </div>
      </div>
    </div>
  );
};

export default Waitlist;
