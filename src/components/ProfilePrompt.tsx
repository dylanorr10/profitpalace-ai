import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, TrendingUp, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface ProfilePromptProps {
  profile: {
    annual_turnover?: string;
    vat_registered?: boolean;
    accounting_year_end?: string;
    business_start_date?: string;
    prompts_dismissed?: any;
  };
  userId: string;
}

const ProfilePrompt = ({ profile, userId }: ProfilePromptProps) => {
  const navigate = useNavigate();
  const [isDismissed, setIsDismissed] = useState(false);

  // Check which data points are missing
  const missingFields: string[] = [];
  if (!profile.annual_turnover) missingFields.push('annual turnover');
  if (profile.vat_registered === undefined || profile.vat_registered === null) missingFields.push('VAT status');
  if (!profile.accounting_year_end) missingFields.push('year-end date');
  if (!profile.business_start_date) missingFields.push('business start date');

  // Don't show if all fields completed or already dismissed
  const dismissedPrompts = profile.prompts_dismissed || {};
  if (missingFields.length === 0 || isDismissed || dismissedPrompts.profile_completion) {
    return null;
  }

  const handleDismiss = async () => {
    setIsDismissed(true);
    
    // Update database to remember dismissal
    await supabase
      .from('user_profiles')
      .update({
        prompts_dismissed: {
          ...dismissedPrompts,
          profile_completion: true,
          dismissed_at: new Date().toISOString(),
        }
      })
      .eq('user_id', userId);
  };

  const handleComplete = () => {
    navigate('/settings');
  };

  return (
    <Card className="p-6 mb-6 bg-gradient-to-r from-accent/10 to-accent/5 border-accent/20 relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-8 w-8"
        onClick={handleDismiss}
      >
        <X className="w-4 h-4" />
      </Button>

      <div className="flex items-start gap-4 pr-8">
        <div className="p-3 bg-accent/10 rounded-full flex-shrink-0">
          <TrendingUp className="w-6 h-6 text-accent" />
        </div>
        
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-2">
            Get Even More Personalized Recommendations
          </h3>
          <p className="text-muted-foreground mb-3">
            Complete your financial profile to unlock hyper-personalized alerts, deadline reminders, 
            and lessons tailored exactly to your business situation.
          </p>
          
          <div className="flex items-start gap-2 mb-4 p-3 bg-background/50 rounded-lg">
            <Info className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
            <p className="text-sm text-muted-foreground">
              Missing: {missingFields.join(', ')}. Adding these will help us provide VAT threshold alerts, 
              MTD reminders, and seasonal tax planning specific to your numbers.
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={handleComplete} size="sm">
              Complete Profile
            </Button>
            <Button onClick={handleDismiss} variant="ghost" size="sm">
              Maybe Later
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfilePrompt;
