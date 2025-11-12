import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { SUBSCRIPTION_TIERS } from '@/lib/subscriptions';

const MONTHLY_PRICE_ID = SUBSCRIPTION_TIERS.MONTHLY.price_id;
const ANNUAL_PRICE_ID = SUBSCRIPTION_TIERS.ANNUAL.price_id;

const Pricing = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { subscription } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const isCurrentPlan = (productId: string) => {
    return subscription.isSubscribed && subscription.productId === productId;
  };

  const handleCheckout = async (priceId: string, subscriptionType: string) => {
    setIsLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign up or log in to continue",
          variant: "destructive"
        });
        navigate('/signup');
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId, subscriptionType }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Reel in Your Finances
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Helping the self-employed reel in their finances. Choose your plan and start learning today.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Tier */}
          <Card className="p-8 relative">
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Free Preview</h3>
              <p className="text-muted-foreground">
                Try before you buy
              </p>
            </div>

            <div className="text-4xl font-bold mb-6">
              £0
            </div>

            <Button 
              variant="outline" 
              className="w-full mb-6"
              onClick={() => navigate('/signup')}
            >
              Start Free Trial
            </Button>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5" />
                <span>First 3 lessons</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5" />
                <span>Seasonal alerts & recommendations</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5" />
                <span>Community Q&A (read-only)</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5" />
                <span>10 AI Study Buddy questions</span>
              </div>
              <div className="flex items-start gap-2">
                <X className="w-5 h-5 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">Full course access</span>
              </div>
              <div className="flex items-start gap-2">
                <X className="w-5 h-5 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">Post in Community Q&A</span>
              </div>
              <div className="flex items-start gap-2">
                <X className="w-5 h-5 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">Weekly personalized newsletter</span>
              </div>
            </div>
          </Card>

          {/* Monthly Plan */}
          <Card className={`p-8 relative ${isCurrentPlan(SUBSCRIPTION_TIERS.MONTHLY.product_id) ? 'border-2 border-green-500' : ''}`}>
            {isCurrentPlan(SUBSCRIPTION_TIERS.MONTHLY.product_id) && (
              <Badge className="absolute -top-3 right-4 bg-green-500">Current Plan</Badge>
            )}
            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Monthly</h3>
              <p className="text-muted-foreground">
                Perfect for getting started
              </p>
            </div>

            <div className="text-4xl font-bold mb-6">
              £9.99
              <span className="text-lg font-normal text-muted-foreground">/month</span>
            </div>

            <Button 
              className="w-full mb-6"
              onClick={() => handleCheckout(MONTHLY_PRICE_ID, 'monthly')}
              disabled={isLoading || isCurrentPlan(SUBSCRIPTION_TIERS.MONTHLY.product_id)}
            >
              {isCurrentPlan(SUBSCRIPTION_TIERS.MONTHLY.product_id) 
                ? 'Current Plan' 
                : isLoading ? 'Loading...' : 'Get Started'}
            </Button>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5" />
                <span className="font-semibold">All 20+ lessons</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5" />
                <span className="font-semibold">Seasonal smart suggestions</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5" />
                <span className="font-semibold">Post in Community Q&A</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5" />
                <span className="font-semibold">Weekly personalized newsletter</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5" />
                <span className="font-semibold">Unlimited AI Study Buddy</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5" />
                <span>Industry-specific examples</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5" />
                <span>Downloadable templates</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </Card>

          {/* Annual Plan */}
          <Card className={`p-8 relative ${isCurrentPlan(SUBSCRIPTION_TIERS.ANNUAL.product_id) ? 'border-2 border-green-500 shadow-lg' : 'border-2 border-primary shadow-lg'}`}>
            {isCurrentPlan(SUBSCRIPTION_TIERS.ANNUAL.product_id) ? (
              <Badge className="absolute -top-3 right-4 bg-green-500">Current Plan</Badge>
            ) : (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
                BEST VALUE - SAVE 33%
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Annual</h3>
              <p className="text-muted-foreground">
                Save £40 per year
              </p>
            </div>

            <div className="text-4xl font-bold mb-2">
              £79.99
              <span className="text-lg font-normal text-muted-foreground">/year</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              That's just £6.67/month
            </p>

            <Button 
              className="w-full mb-6"
              onClick={() => handleCheckout(ANNUAL_PRICE_ID, 'annual')}
              disabled={isLoading || isCurrentPlan(SUBSCRIPTION_TIERS.ANNUAL.product_id)}
            >
              {isCurrentPlan(SUBSCRIPTION_TIERS.ANNUAL.product_id)
                ? 'Current Plan'
                : isLoading ? 'Loading...' : 'Get Started'}
            </Button>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5" />
                <span className="font-semibold">All 20+ lessons</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5" />
                <span>Personalized learning path</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5" />
                <span className="font-semibold">Unlimited AI Study Buddy</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5" />
                <span>Industry-specific examples</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5" />
                <span>Downloadable templates</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5" />
                <span>Progress tracking</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5" />
                <span>Priority email support</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5" />
                <span className="font-semibold">Lifetime updates</span>
              </div>
            </div>

            <div className="mt-8 p-4 bg-primary/10 rounded-lg">
              <p className="text-sm font-semibold mb-1">🎣 Launch Bonus</p>
              <p className="text-sm text-muted-foreground">
                First 100 customers get exclusive templates and priority support
              </p>
            </div>
          </Card>
        </div>

        <div className="text-center mt-12 max-w-2xl mx-auto">
          <p className="text-sm text-muted-foreground">
            ✓ 30-day money-back guarantee • ✓ Secure payment • ✓ Instant access
          </p>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
