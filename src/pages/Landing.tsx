import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Clock, TrendingUp, Users, Zap, CheckCircle2, AlertTriangle, Brain, Target, Shield, TrendingDown, Calendar, PoundSterling, FileWarning } from "lucide-react";
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
    document.title = "Reelin - Know Your Numbers | UK Business Finance Education";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "UK business owners: you NEED to know your numbers. Master tax, bookkeeping, VAT & expenses in 10 mins/day. Built by an accountant who's helped family and friends take control. Start free."
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

    // Save validated email to database with comprehensive tags
    try {
      await supabase.from('email_subscribers').insert({
        email: result.data.email,
        source: 'landing_page_hero',
        tags: ['newsletter', 'lead_magnet', 'expenses_checklist']
      });
    } catch (error) {
      console.log('Email already exists or error saving');
    }

    // Trigger free checklist PDF download as bonus
    const link = document.createElement('a');
    link.href = '/ReelinChecklist.pdf';
    link.download = 'Reelin-UK-Business-Expenses-Checklist.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Success! Check your downloads",
      description: "Your free checklist is downloading. Taking you to signup...",
    });

    // Navigate to signup with email prefilled
    setTimeout(() => {
      navigate("/signup", { state: { email: result.data.email } });
    }, 1000);
  };

  return (
    <main className="min-h-screen bg-background">
      {/* HERO SECTION - COHESION: "You NEED to know your numbers" */}
      <header className="relative overflow-hidden bg-gradient-hero min-h-[95vh] flex items-center px-4 py-12" role="banner">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-[#03fff6]/5 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#03fff6]/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-[#03fff6]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }}></div>
          
          {/* Floating elements */}
          <div className="absolute top-40 right-20 text-4xl animate-float opacity-20" style={{ animationDelay: '1s' }}>📊</div>
          <div className="absolute bottom-40 left-20 text-4xl animate-float opacity-20" style={{ animationDelay: '3s' }}>💪</div>
          <div className="absolute top-60 left-1/4 text-4xl animate-float opacity-20" style={{ animationDelay: '5s' }}>🎯</div>
        </div>
        
        <div className="container mx-auto max-w-7xl relative z-10">
          {/* Top Navigation Bar */}
          <div className="flex justify-between items-center mb-8 md:mb-12">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🎣</div>
              <span className="text-[#03fff6] font-bold text-xl hidden sm:inline">Reelin</span>
            </div>
            <Button 
              variant="ghost" 
              className="text-[#03fff6] hover:bg-[#03fff6]/10 border border-[#03fff6]/20 backdrop-blur-sm"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
          </div>

          {/* Split Hero Layout */}
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Animated Dashboard Video Preview */}
            <div className="relative order-2 lg:order-1 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-2 border-[#03fff6]/20 bg-gradient-to-br from-[#03fff6]/5 to-[#03fff6]/10 backdrop-blur-sm">
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-auto rounded-xl"
                  aria-label="Reelin dashboard demonstration showing learning progress, streak tracking, and personalized lessons"
                >
                  <source src="/dashboard-demo.mov" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                {/* Floating stats overlay */}
                <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-[#03fff6]/90 backdrop-blur-md px-2 py-1 md:px-4 md:py-2 rounded-lg shadow-lg animate-float">
                  <div className="text-white font-bold text-sm md:text-lg">45 🔥</div>
                  <div className="text-white/80 text-xs">Day Streak</div>
                </div>
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#03fff6]/20 to-transparent rounded-2xl blur-3xl -z-10 animate-pulse"></div>
            </div>

            {/* Right: Copy - COHESION MESSAGING */}
            <div className="space-y-8 text-center lg:text-left order-1 lg:order-2">
              {/* Main Headline - COHESION */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-[#03fff6] leading-[1.1] animate-slide-up">
                The Best Business Owners Know Their Numbers
              </h1>
              
              {/* Enhanced Credibility Badge */}
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-[#03fff6]/15 backdrop-blur-md rounded-full text-[#03fff6] text-base font-semibold border border-[#03fff6]/20 shadow-lg animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <CheckCircle2 className="w-5 h-5" />
                <span>Built for business owners who want to understand, not just outsource</span>
              </div>
              
              {/* Subheadline - Empowerment */}
              <p className="text-xl md:text-2xl text-[#03fff6]/90 leading-relaxed animate-slide-up" style={{ animationDelay: '0.2s' }}>
                You didn't start a business to hand over your finances to someone else. <span className="font-semibold text-[#03fff6]">Take control in just 10 minutes a day.</span>
                <span className="inline-block bg-[#03fff6]/20 px-3 py-1 rounded-full text-sm font-semibold mt-2 ml-2">+ Free expenses checklist</span>
              </p>

              {/* Three Pillars Pills */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 animate-slide-up" style={{ animationDelay: '0.25s' }}>
                <div className="flex items-center gap-2 bg-[#03fff6]/10 px-4 py-2 rounded-full border border-[#03fff6]/20">
                  <span className="text-lg">📊</span>
                  <span className="text-[#03fff6] font-medium text-sm">Know Your Numbers</span>
                </div>
                <div className="flex items-center gap-2 bg-[#03fff6]/10 px-4 py-2 rounded-full border border-[#03fff6]/20">
                  <span className="text-lg">💪</span>
                  <span className="text-[#03fff6] font-medium text-sm">Make Confident Decisions</span>
                </div>
                <div className="flex items-center gap-2 bg-[#03fff6]/10 px-4 py-2 rounded-full border border-[#03fff6]/20">
                  <span className="text-lg">🎯</span>
                  <span className="text-[#03fff6] font-medium text-sm">Stop Flying Blind</span>
                </div>
              </div>

              {/* CTA Form */}
              <form onSubmit={handleEmailSubmit} className="mt-10 animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col sm:flex-row gap-4 p-2 bg-[#03fff6]/10 backdrop-blur-md rounded-2xl border border-[#03fff6]/20 shadow-2xl">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/95 text-foreground flex-1 h-14 text-lg border-0 rounded-xl focus:ring-2 focus:ring-[#03fff6]/50"
                      required
                      maxLength={255}
                    />
                    <Button type="submit" size="lg" className="h-14 px-10 bg-[#03fff6] text-[#687b88] hover:bg-[#03fff6]/90 font-bold text-lg rounded-xl shadow-xl hover:scale-105 transition-transform">
                      Start Learning →
                    </Button>
                  </div>
                  
                  <p className="text-[#03fff6]/90 text-base font-medium">
                    🎁 Get instant access + free UK expenses checklist
                  </p>
                </div>
              </form>

              {/* Trust Indicators */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-6 mt-6 text-[#03fff6]/90 animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <span className="text-sm font-medium">3 free lessons</span>
                <div className="hidden sm:block w-1 h-1 bg-[#03fff6]/50 rounded-full"></div>
                <span className="text-sm font-medium">10 mins/day</span>
                <div className="hidden sm:block w-1 h-1 bg-[#03fff6]/50 rounded-full"></div>
                <span className="text-sm font-medium">No card required</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* WHY NOW? SECTION - URGENCY */}
      <section className="py-20 px-4 bg-destructive/5 border-y border-destructive/20" aria-labelledby="why-now">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-destructive/10 rounded-full text-destructive text-sm font-semibold mb-4">
              <AlertTriangle className="w-4 h-4" />
              <span>2024 Changed Everything</span>
            </div>
            <h2 id="why-now" className="text-4xl md:text-5xl font-bold mb-4">
              Why UK Business Owners <span className="text-destructive">Need This Now</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              The rules are changing. The economy is uncertain. And financial confusion costs more than ever.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* MTD Card */}
            <div className="bg-card p-8 rounded-2xl shadow-md border-l-4 border-l-destructive">
              <div className="w-12 h-12 bg-destructive/10 rounded-xl flex items-center justify-center mb-4">
                <FileWarning className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="text-xl font-bold mb-3">Making Tax Digital (MTD)</h3>
              <p className="text-muted-foreground">
                From April 2024, HMRC requires digital records. Do you know what that means for your business? The penalties for non-compliance are real.
              </p>
            </div>

            {/* Economic Uncertainty Card */}
            <div className="bg-card p-8 rounded-2xl shadow-md border-l-4 border-l-orange-500">
              <div className="w-12 h-12 bg-orange-500/10 rounded-xl flex items-center justify-center mb-4">
                <TrendingDown className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Economic Uncertainty</h3>
              <p className="text-muted-foreground">
                Rising costs, interest rates, cash flow pressure. Business owners who understand their numbers adapt faster and survive longer.
              </p>
            </div>

            {/* Cost of Confusion Card */}
            <div className="bg-card p-8 rounded-2xl shadow-md border-l-4 border-l-primary">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <PoundSterling className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">The Cost of Confusion</h3>
              <p className="text-muted-foreground">
                Panic, overwhelm, and costly mistakes happen when you don't understand your finances. It doesn't have to be this way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDER STORY - EMPATHY & TRUST */}
      <section className="py-20 px-4 bg-secondary/20" aria-labelledby="about-creator">
        <div className="container mx-auto max-w-4xl">
          <article className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-semibold mb-2">
              <span>👋</span>
              <span>It's Personal</span>
            </div>
            <h2 id="about-creator" className="text-4xl md:text-5xl font-bold mb-4">
              Why I Built This
            </h2>
            <div className="max-w-3xl mx-auto space-y-6 text-lg text-muted-foreground leading-relaxed">
              <p className="text-xl">
                When <span className="font-semibold text-foreground">my dad went self-employed</span>, he was completely lost. 
                Tax returns, expenses, VAT thresholds - it was overwhelming. He's a smart guy, but this stuff made him feel stupid.
              </p>
              <p>
                Then my friends started their own businesses and came to me with the same questions. 
                <span className="font-semibold text-foreground"> "What expenses can I claim?" "Do I need to register for VAT?" "How does Making Tax Digital work?"</span>
              </p>
              <p>
                As an accountant, I saw a pattern: <span className="font-semibold text-foreground">smart, capable people who felt lost when it came to their finances</span>. 
                Not because they couldn't understand it - but because no one explained it in a way that made sense.
              </p>
              <p className="text-xl font-semibold text-foreground bg-primary/5 p-6 rounded-xl border border-primary/20">
                That's why I created Reelin. Not to replace your accountant, but to make sure you never feel lost, confused, 
                or at the mercy of someone else's advice again. <span className="text-primary">You built your business. You should understand what makes it tick financially.</span>
              </p>
            </div>
          </article>
        </div>
      </section>

      {/* VALUE PROPOSITION - CAPABILITY */}
      <section className="py-20 px-4" aria-labelledby="value-proposition">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-success/10 rounded-full text-success text-sm font-semibold mb-4">
              <CheckCircle2 className="w-4 h-4" />
              <span>You CAN Do This</span>
            </div>
            <h2 id="value-proposition" className="text-4xl md:text-5xl font-bold mb-4">
              Master Your Finances in <span className="text-primary">10 Minutes a Day</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              You CAN understand this. No jargon. No overwhelm. Just practical knowledge that compounds over time.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Compound Learning",
                description: "5-10 minutes a day adds up. In 30 days, you'll understand more than most business owners learn in years.",
                emoji: "🧠",
                icon: Brain
              },
              {
                title: "Real UK Examples",
                description: "Not generic advice. Actual scenarios for self-employed, sole traders, and limited companies in the UK.",
                emoji: "💡",
                icon: Target
              },
              {
                title: "Bite-Sized & Practical",
                description: "No 2-hour courses. Each lesson teaches you something useful you can apply today.",
                emoji: "🎯",
                icon: Zap
              },
              {
                title: "Built for Busy People",
                description: "Fit learning around your business. On the train, during lunch, before bed. It works around you.",
                emoji: "⏰",
                icon: Clock
              },
            ].map((feature) => (
              <div key={feature.title} className="bg-gradient-card p-6 rounded-2xl shadow-md hover:shadow-lg transition-all border border-border/50">
                <div className="text-4xl mb-4">{feature.emoji}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.description}</p>
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

      {/* RISK SECTION - What's the Cost of Not Knowing? */}
      <section className="py-20 px-4 bg-card border-y" aria-labelledby="risk-section">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <h2 id="risk-section" className="text-4xl md:text-5xl font-bold mb-4">
              What's the Cost of <span className="text-destructive">Financial Confusion?</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              When you don't understand your finances, everything becomes harder and more expensive.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <PoundSterling className="w-8 h-8 text-destructive" />
              </div>
              <h3 className="text-xl font-bold mb-2">Expensive Mistakes</h3>
              <p className="text-muted-foreground text-sm">
                Claiming the wrong expenses, missing deadlines, overpaying tax - ignorance is expensive.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Slower Decisions</h3>
              <p className="text-muted-foreground text-sm">
                When you don't know your numbers, every financial decision feels risky and takes longer.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-500/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-purple-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Stress & Anxiety</h3>
              <p className="text-muted-foreground text-sm">
                That knot in your stomach when you think about your accounts? It doesn't have to be there.
              </p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <TrendingDown className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-2">Competitive Disadvantage</h3>
              <p className="text-muted-foreground text-sm">
                Business owners who understand their finances spot opportunities faster and adapt quicker.
              </p>
            </div>
          </div>

          <p className="text-center text-xl font-semibold text-foreground mt-12">
            Knowledge isn't just power. <span className="text-primary">It's peace of mind.</span>
          </p>
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

      {/* FINAL CTA - Tie It All Together */}
      <section className="py-20 px-4 bg-gradient-primary text-white" aria-labelledby="cta">
        <div className="container mx-auto max-w-4xl text-center">
          <h2 id="cta" className="text-4xl md:text-5xl font-bold mb-6">
            You Built Your Business.<br />
            <span className="text-white/90">Now Understand Its Finances.</span>
          </h2>
          <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
            Join thousands of UK business owners who stopped outsourcing their understanding and started taking control. 
            10 minutes a day. Real knowledge. Real confidence.
          </p>
          <Button 
            size="lg" 
            className="h-14 px-12 text-lg bg-white text-primary hover:bg-white/90 shadow-glow"
            onClick={() => navigate("/signup")}
          >
            Start Learning Today →
          </Button>
          <p className="mt-6 text-white/70 text-sm">
            No card required • 3 free lessons • Cancel anytime
          </p>
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
