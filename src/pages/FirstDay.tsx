import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2, ArrowRight, AlertCircle } from "lucide-react";
import { GlossaryTooltip } from "@/components/GlossaryTooltip";

const FirstDay = () => {
  const navigate = useNavigate();
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    {
      id: 1,
      title: "Register as Self-Employed",
      description: "Register with HMRC within 3 months of starting",
      urgent: true,
      action: "Register at gov.uk/register-for-self-assessment",
    },
    {
      id: 2,
      title: "Open Business Bank Account",
      description: "Separate your business money from personal",
      action: "Compare Starling, Tide, or Monzo business accounts",
    },
    {
      id: 3,
      title: "Start Tracking Money",
      description: "Record every penny of income and expenses",
      action: "Choose accounting software or use spreadsheet",
    },
    {
      id: 4,
      title: "Save Receipts",
      description: "Photo every receipt immediately - they fade fast",
      action: "Use phone camera or receipt scanning app",
    },
    {
      id: 5,
      title: "Put Tax Aside",
      description: "Save 30% of every payment for tax",
      action: "Set up separate savings account for tax",
    },
  ];

  const toggleStep = (stepId: number) => {
    setCompletedSteps(prev =>
      prev.includes(stepId)
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-4xl font-bold mb-4">Your First Day in Business</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Congratulations on starting your journey! These are the 5 essential tasks for your first month.
          </p>
        </div>

        {/* Deadline Alert */}
        <Card className="p-6 mb-8 bg-orange-500/10 border-orange-500/50">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-lg mb-2">3-Month Registration Deadline</h3>
              <p className="text-muted-foreground">
                You MUST register with <GlossaryTooltip term="HMRC">HMRC</GlossaryTooltip> as{" "}
                <GlossaryTooltip term="Self-Employed">self-employed</GlossaryTooltip> within 3 months of
                starting. Late registration = automatic £100 penalty. Don't wait!
              </p>
            </div>
          </div>
        </Card>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Your Progress</span>
            <span className="text-sm text-muted-foreground">
              {completedSteps.length} of {steps.length} complete
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-4 mb-12">
          {steps.map(step => (
            <Card
              key={step.id}
              className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
                completedSteps.includes(step.id) ? 'bg-primary/5 border-primary' : ''
              }`}
              onClick={() => toggleStep(step.id)}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                    completedSteps.includes(step.id)
                      ? 'bg-primary border-primary'
                      : 'border-muted-foreground'
                  }`}
                >
                  {completedSteps.includes(step.id) && (
                    <CheckCircle2 className="w-4 h-4 text-primary-foreground" />
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg">{step.title}</h3>
                    {step.urgent && (
                      <span className="text-xs bg-orange-500/20 text-orange-700 dark:text-orange-400 px-2 py-1 rounded">
                        URGENT
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-2">{step.description}</p>
                  <p className="text-sm font-medium text-primary">{step.action}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* What Happens Next */}
        <Card className="p-6 mb-8 bg-muted/50">
          <h3 className="font-bold text-xl mb-4">What Happens After Registration?</h3>
          <ul className="space-y-3">
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">Within 10 days:</span> You'll receive your{" "}
                <GlossaryTooltip term="UTR">UTR number</GlossaryTooltip> by post - this is your tax ID
              </div>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">First tax return:</span> Due 31 January following your first{" "}
                <GlossaryTooltip term="Tax Year">tax year</GlossaryTooltip> (16+ months away)
              </div>
            </li>
            <li className="flex gap-3">
              <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-medium">Tax savings:</span> Keep saving 30% of income weekly so tax bill is painless
              </div>
            </li>
          </ul>
        </Card>

        {/* Next Steps */}
        <div className="flex gap-4">
          <Button
            onClick={() => navigate('/dashboard')}
            variant="outline"
            className="flex-1"
          >
            Back to Dashboard
          </Button>
          <Button
            onClick={() => navigate('/lesson/1')}
            className="flex-1 gap-2"
          >
            Next: Sole Trader vs Limited Company
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FirstDay;
