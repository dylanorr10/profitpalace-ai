import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

type QuizStep = "account" | "business" | "industry" | "experience" | "pain" | "goal";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [step, setStep] = useState<QuizStep>("account");
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: location.state?.email || "",
    password: "",
    businessStructure: "",
    industry: "",
    experience: "",
    painPoint: "",
    goal: "",
  });

  const handleSignup = async () => {
    if (!formData.email || !formData.password) {
      toast({
        title: "Missing information",
        description: "Please provide email and password.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (error) throw error;

      if (data.user) {
        // Save quiz answers to profile
        const { error: profileError } = await supabase
          .from("user_profiles")
          .insert({
            user_id: data.user.id,
            business_structure: formData.businessStructure,
            industry: formData.industry,
            experience_level: formData.experience,
            pain_point: formData.painPoint,
            learning_goal: formData.goal,
            onboarding_completed: true,
          });

        if (profileError) {
          console.error("Profile creation error:", profileError);
        }

        toast({
          title: "Welcome aboard! 🎉",
          description: "Your account has been created. Let's start learning!",
        });
        
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Signup failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    const steps: QuizStep[] = ["account", "business", "industry", "experience", "pain", "goal"];
    const currentIndex = steps.indexOf(step);
    
    if (currentIndex === 0 && (!formData.email || !formData.password)) {
      toast({
        title: "Missing information",
        description: "Please provide email and password.",
        variant: "destructive",
      });
      return;
    }

    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
    } else {
      handleSignup();
    }
  };

  const renderStep = () => {
    switch (step) {
      case "account":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
          </div>
        );

      case "business":
        return (
          <div className="space-y-4">
            <Label>What's your business structure?</Label>
            <RadioGroup
              value={formData.businessStructure}
              onValueChange={(value) => setFormData({ ...formData, businessStructure: value })}
            >
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-secondary/50 cursor-pointer">
                <RadioGroupItem value="sole-trader" id="sole-trader" />
                <Label htmlFor="sole-trader" className="cursor-pointer flex-1">Sole Trader</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-secondary/50 cursor-pointer">
                <RadioGroupItem value="limited" id="limited" />
                <Label htmlFor="limited" className="cursor-pointer flex-1">Limited Company</Label>
              </div>
              <div className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-secondary/50 cursor-pointer">
                <RadioGroupItem value="unsure" id="unsure" />
                <Label htmlFor="unsure" className="cursor-pointer flex-1">Not sure yet</Label>
              </div>
            </RadioGroup>
          </div>
        );

      case "industry":
        return (
          <div className="space-y-4">
            <Label>What industry are you in?</Label>
            <RadioGroup
              value={formData.industry}
              onValueChange={(value) => setFormData({ ...formData, industry: value })}
            >
              {["Trades (plumbing, building, etc.)", "Creative/Tech", "Professional Services", "Health/Beauty", "Transport/Delivery", "Other"].map((ind) => (
                <div key={ind} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-secondary/50 cursor-pointer">
                  <RadioGroupItem value={ind} id={ind} />
                  <Label htmlFor={ind} className="cursor-pointer flex-1">{ind}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case "experience":
        return (
          <div className="space-y-4">
            <Label>How long have you been in business?</Label>
            <RadioGroup
              value={formData.experience}
              onValueChange={(value) => setFormData({ ...formData, experience: value })}
            >
              {["Just started", "0-2 years", "3+ years"].map((exp) => (
                <div key={exp} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-secondary/50 cursor-pointer">
                  <RadioGroupItem value={exp} id={exp} />
                  <Label htmlFor={exp} className="cursor-pointer flex-1">{exp}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case "pain":
        return (
          <div className="space-y-4">
            <Label>What's your biggest challenge?</Label>
            <RadioGroup
              value={formData.painPoint}
              onValueChange={(value) => setFormData({ ...formData, painPoint: value })}
            >
              {["Tax confusion", "Bookkeeping takes too long", "Missing deadlines", "Understanding expenses"].map((pain) => (
                <div key={pain} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-secondary/50 cursor-pointer">
                  <RadioGroupItem value={pain} id={pain} />
                  <Label htmlFor={pain} className="cursor-pointer flex-1">{pain}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );

      case "goal":
        return (
          <div className="space-y-4">
            <Label>What's your main learning goal?</Label>
            <RadioGroup
              value={formData.goal}
              onValueChange={(value) => setFormData({ ...formData, goal: value })}
            >
              {["Save time on bookkeeping", "Save money on taxes", "Understand my finances better", "Stay compliant with HMRC"].map((goal) => (
                <div key={goal} className="flex items-center space-x-2 p-3 border rounded-lg hover:bg-secondary/50 cursor-pointer">
                  <RadioGroupItem value={goal} id={goal} />
                  <Label htmlFor={goal} className="cursor-pointer flex-1">{goal}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        );
    }
  };

  const stepTitles = {
    account: "Create Your Account",
    business: "Let's Personalize Your Experience",
    industry: "What Industry Are You In?",
    experience: "Business Experience",
    pain: "Your Biggest Challenge",
    goal: "Your Learning Goal",
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg p-8 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-primary">{stepTitles[step]}</h1>
          <p className="text-muted-foreground">
            {step === "account" ? "Join 2,500+ UK business owners" : "Just a few quick questions (2 min)"}
          </p>
        </div>

        {renderStep()}

        <div className="flex gap-3">
          {step !== "account" && (
            <Button 
              variant="outline" 
              onClick={() => {
                const steps: QuizStep[] = ["account", "business", "industry", "experience", "pain", "goal"];
                const currentIndex = steps.indexOf(step);
                if (currentIndex > 0) setStep(steps[currentIndex - 1]);
              }}
              className="flex-1"
            >
              Back
            </Button>
          )}
          <Button 
            onClick={handleNext} 
            disabled={loading}
            className="flex-1"
          >
            {step === "goal" ? (loading ? "Creating..." : "Complete Signup") : "Continue"}
          </Button>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-primary hover:underline font-medium"
            >
              Log in
            </button>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Signup;
