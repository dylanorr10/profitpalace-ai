import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Clock, TrendingUp, Users, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Landing = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      // Save email to database
      try {
        await supabase.from('email_subscribers').insert({
          email,
          source: 'landing_page',
          tags: ['course_interest']
        });
      } catch (error) {
        console.log('Email already exists or error saving');
      }

      toast({
        title: "Thanks for your interest!",
        description: "Let's get you started.",
      });
      navigate("/signup", { state: { email } });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 px-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
        
        <div className="container mx-auto max-w-6xl relative z-10">
          <div className="text-center space-y-6 animate-slide-up">
            <div className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium mb-4">
              ⚡ Save 10+ hours per month on bookkeeping
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight">
              Reel in Your Finances 🎣
            </h1>
            
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Helping the self-employed reel in their finances. Learn tax, bookkeeping, and business finances in bite-sized lessons.
            </p>

            <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto mt-8 flex gap-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white text-foreground flex-1 h-12 text-lg"
                required
              />
              <Button type="submit" size="lg" className="h-12 px-8 bg-white text-primary hover:bg-white/90 font-semibold shadow-lg">
                Start Free →
              </Button>
            </form>

            <p className="text-white/70 text-sm">
              Get 3 free lessons • £9.99/month or £79.99/year
            </p>
          </div>
        </div>
      </section>

      {/* Social Proof Stats */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { icon: Users, label: "Business Owners", value: "2,500+" },
              { icon: Clock, label: "Hours Saved", value: "10,000+" },
              { icon: TrendingUp, label: "Avg. Tax Saved", value: "£2,400" },
              { icon: Zap, label: "Completion Rate", value: "94%" },
            ].map((stat) => (
              <div key={stat.label} className="space-y-2">
                <stat.icon className="w-8 h-8 mx-auto text-primary" />
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Built for <span className="text-primary">UK Business Owners</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Whether you're a sole trader, limited company, or just starting out - 
              we've got you covered with UK-specific guidance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Personalized Learning",
                description: "Content tailored to your business type, industry, and experience level.",
                emoji: "🎯"
              },
              {
                title: "Real Examples",
                description: "Learn with actual scenarios from trades, creative, professional services, and more.",
                emoji: "💡"
              },
              {
                title: "Interactive Tools",
                description: "Built-in calculators for profit, tax estimates, mileage, and expenses.",
                emoji: "🛠️"
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-gradient-card p-8 rounded-2xl shadow-md hover:shadow-lg transition-all">
                <div className="text-5xl mb-4">{feature.emoji}</div>
                <h3 className="text-2xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What You'll Learn */}
      <section className="py-20 px-4 bg-secondary/20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Master UK Business Finances
            </h2>
            <p className="text-xl text-muted-foreground">
              20+ comprehensive lessons covering everything you need to know
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              "Understanding Profit & Loss",
              "Making Tax Digital (MTD) Basics",
              "Claiming Expenses Correctly",
              "VAT Explained Simply",
              "Mileage & Home Office Deductions",
              "CIS for Construction Industry",
              "Invoicing Clients Professionally",
              "Tax Planning Strategies",
              "Record Keeping Best Practices",
              "Automating Your Bookkeeping",
            ].map((lesson) => (
              <div key={lesson} className="flex items-start gap-3 p-4 bg-card rounded-lg">
                <div className="mt-1 flex-shrink-0">
                  <Check className="w-5 h-5 text-success" />
                </div>
                <span className="text-lg">{lesson}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground">
              Choose your plan. Everything included. Cancel anytime.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card border-2 border-border p-8 rounded-2xl shadow-md">
              <h3 className="text-2xl font-bold mb-2">Monthly</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold">£9.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Access to all 20+ lessons",
                  "Interactive calculators",
                  "Unlimited AI Study Buddy",
                  "Downloadable resources",
                  "Cancel anytime",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-success" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full h-12" size="lg" onClick={() => navigate("/signup")}>
                Start Free Trial
              </Button>
            </div>

            <div className="bg-gradient-primary p-8 rounded-2xl shadow-glow text-white relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-white/20 px-3 py-1 rounded-full text-sm font-semibold">
                SAVE 33%
              </div>
              <h3 className="text-2xl font-bold mb-2">Annual</h3>
              <div className="mb-6">
                <span className="text-5xl font-bold">£79.99</span>
                <span className="text-white/80">/year</span>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Everything in Monthly",
                  "Just £6.67/month",
                  "Priority email support",
                  "Exclusive templates",
                  "Save £40 per year",
                ].map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-white" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full h-12 bg-white text-primary hover:bg-white/90" size="lg" onClick={() => navigate("/signup")}>
                Start Free Trial
              </Button>
            </div>
          </div>

          <p className="text-center text-muted-foreground mt-8">
            3 free lessons to start • Cancel anytime • No hidden fees
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 bg-gradient-primary text-white">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Master Your Business Finances?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Join 2,500+ UK business owners who've already saved thousands in tax and countless hours.
          </p>
          <Button 
            size="lg" 
            className="h-14 px-12 text-lg bg-white text-primary hover:bg-white/90 shadow-glow"
            onClick={() => navigate("/signup")}
          >
            Start Your Free Trial Today →
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Landing;
