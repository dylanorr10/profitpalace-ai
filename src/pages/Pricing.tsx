import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Pricing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">
            Master UK Business Finances
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            One-time payment. Lifetime access. Learn at your own pace.
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
              Start Free
            </Button>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5" />
                <span>First 3 lessons</span>
              </div>
              <div className="flex items-start gap-2">
                <Check className="w-5 h-5 text-primary mt-0.5" />
                <span>Personalized learning path</span>
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
                <span className="text-muted-foreground">Unlimited AI questions</span>
              </div>
              <div className="flex items-start gap-2">
                <X className="w-5 h-5 text-muted-foreground mt-0.5" />
                <span className="text-muted-foreground">Downloadable templates</span>
              </div>
            </div>
          </Card>

          {/* Premium Tier */}
          <Card className="p-8 relative border-2 border-primary shadow-lg">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-semibold">
              BEST VALUE
            </div>

            <div className="mb-6">
              <h3 className="text-2xl font-bold mb-2">Full Course</h3>
              <p className="text-muted-foreground">
                Everything you need to master UK business finances
              </p>
            </div>

            <div className="text-4xl font-bold mb-2">
              £149
              <span className="text-lg font-normal text-muted-foreground line-through ml-2">
                £199
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              One-time payment • Lifetime access
            </p>

            <Button 
              className="w-full mb-6"
              onClick={() => {
                // Placeholder for payment - manual for now
                alert('Payment integration coming soon! Please contact support@ukbusinessacademy.com to purchase.');
              }}
            >
              Get Full Access
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
              <p className="text-sm font-semibold mb-1">🎁 Launch Bonus</p>
              <p className="text-sm text-muted-foreground">
                First 100 customers get early access to our upcoming business management app
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
