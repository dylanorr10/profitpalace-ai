import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Clock, TrendingUp, Users, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const Landing = () => {
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // SEO: Update page metadata
    document.title = "Reelin - UK Business Finance Made Simple | Learn Tax & Bookkeeping";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Master UK business finances with bite-sized lessons on tax, bookkeeping, VAT & expenses. Built by an ex-accountant. Start with 3 free lessons. £9.99/month."
      );
    }

    // Add structured data for SEO
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": "UK Business Finance Mastery Course",
      "description": "Comprehensive course on UK business finances covering tax, bookkeeping, VAT, expenses, and financial management for self-employed individuals and business owners",
      "provider": {
        "@type": "Organization",
        "name": "Reelin",
        "description": "UK Business Finance Education Platform"
      },
      "coursePrerequisites": "None - suitable for beginners",
      "educationalLevel": "Beginner to Intermediate",
      "inLanguage": "en-GB",
      "hasCourseInstance": {
        "@type": "CourseInstance",
        "courseMode": "online",
        "courseWorkload": "PT20H"
      },
      "offers": [
        {
          "@type": "Offer",
          "category": "Subscription",
          "price": "9.99",
          "priceCurrency": "GBP",
          "availability": "https://schema.org/InStock",
          "validFrom": new Date().toISOString().split('T')[0]
        },
        {
          "@type": "Offer",
          "category": "Subscription",
          "price": "79.99",
          "priceCurrency": "GBP",
          "availability": "https://schema.org/InStock",
          "validFrom": new Date().toISOString().split('T')[0],
          "priceValidUntil": new Date(Date.now() + 365*24*60*60*1000).toISOString().split('T')[0]
        }
      ],
      "audience": {
        "@type": "EducationalAudience",
        "educationalRole": "Business Owner",
        "audienceType": "Self-employed, Sole traders, Limited companies"
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const emailSchema = z.object({
    email: z.string()
      .trim()
      .toLowerCase()
      .email({ message: 'Please enter a valid email address' })
      .max(255, { message: 'Email must be less than 255 characters' })
  });

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email input
    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      toast({
        title: 'Invalid email',
        description: result.error.errors[0].message,
        variant: 'destructive'
      });
      return;
    }

    // Save validated email to database
    try {
      await supabase.from('email_subscribers').insert({
        email: result.data.email,
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
    navigate("/signup", { state: { email: result.data.email } });
  };

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden bg-gradient-hero py-20 px-4" role="banner">
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
                maxLength={255}
              />
              <Button type="submit" size="lg" className="h-12 px-8 bg-white text-primary hover:bg-white/90 font-semibold shadow-lg">
                Start Free →
              </Button>
            </form>

            <div className="mt-6 inline-block px-6 py-3 bg-white/10 backdrop-blur-sm rounded-lg border-2 border-white/30">
              <p className="text-white text-lg font-semibold">
                Get 3 free lessons • £9.99/month or £79.99/year
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* About the Creator */}
      <section className="py-20 px-4 bg-secondary/20" aria-labelledby="about-creator">
        <div className="container mx-auto max-w-4xl">
          <article className="text-center space-y-6">
            <h2 id="about-creator" className="text-4xl md:text-5xl font-bold mb-4">
              Built by Someone Who's <span className="text-primary">Been There</span>
            </h2>
            <div className="max-w-3xl mx-auto space-y-4 text-lg text-muted-foreground">
              <p>
                After studying accounting and working in the field, I saw many business owners 
                struggling with their finances. They'd come asking for advice, often after making 
                costly mistakes or spending hours trying to figure things out on their own.
              </p>
              <p>
                I realized that most business owners don't need a full accounting degree - they 
                just need practical, bite-sized guidance on the essentials. That's why I created 
                Reelin: to empower business owners to take control of their finances with confidence.
              </p>
              <p className="font-semibold text-foreground">
                My mission is simple: help you master the financial skills that will save you time, 
                money, and stress - without overwhelming you with jargon.
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-20 px-4" aria-labelledby="value-proposition">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 id="value-proposition" className="text-4xl md:text-5xl font-bold mb-4">
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
      <section className="py-20 px-4 bg-secondary/20" aria-labelledby="curriculum">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 id="curriculum" className="text-4xl md:text-5xl font-bold mb-4">
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
      <section className="py-20 px-4" aria-labelledby="pricing">
        <div className="container mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 id="pricing" className="text-4xl md:text-5xl font-bold mb-4">
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
      <section className="py-20 px-4 bg-gradient-primary text-white" aria-labelledby="cta">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 id="cta" className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Master Your Business Finances?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Built by an ex-accountant who's helped countless business owners master their finances. 
            Take control of your business with confidence.
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

      {/* Footer */}
      <footer className="bg-card border-t py-8 px-4" role="contentinfo">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Reelin. All rights reserved.
            </p>
            <div className="flex gap-6">
              <button
                onClick={() => navigate("/terms")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Terms of Service
              </button>
              <button
                onClick={() => navigate("/privacy")}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Privacy Policy
              </button>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Landing;
