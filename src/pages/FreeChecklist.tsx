import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle2, Download, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";

const FreeChecklist = () => {
  const [email, setEmail] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [source, setSource] = useState("tiktok");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // SEO: Update page metadata
    document.title = "Free UK Business Expenses Checklist | Reelin";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        "content",
        "Download your free UK business expenses checklist. 50+ allowable expenses organized by category. HMRC compliant. Never miss a tax deduction again."
      );
    }

    // Add Open Graph tags for better social sharing (TikTok preview)
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', 'Free UK Business Expenses Checklist');

    let ogDescription = document.querySelector('meta[property="og:description"]');
    if (!ogDescription) {
      ogDescription = document.createElement('meta');
      ogDescription.setAttribute('property', 'og:description');
      document.head.appendChild(ogDescription);
    }
    ogDescription.setAttribute('content', '50+ allowable expenses organized by category. HMRC compliant. Save thousands in tax.');

    // Capture UTM parameters and TikTok-specific params for tracking
    const params = new URLSearchParams(window.location.search);
    const utmSource = params.get('utm_source') || 'tiktok';
    const utmCampaign = params.get('utm_campaign') || 'organic';
    const utmContent = params.get('utm_content') || '';
    setSource(`${utmSource}_${utmCampaign}${utmContent ? `_${utmContent}` : ''}`);
  }, []);

  const emailSchema = z.object({
    email: z.string()
      .trim()
      .toLowerCase()
      .email({ message: 'Please enter a valid email address' })
      .max(255, { message: 'Email must be less than 255 characters' })
  });

  const handleDownload = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDownloading(true);
    
    // Validate email input
    const result = emailSchema.safeParse({ email });
    if (!result.success) {
      toast({
        title: 'Invalid email',
        description: result.error.errors[0].message,
        variant: 'destructive'
      });
      setIsDownloading(false);
      return;
    }

    // Save validated email to database with source tracking
    try {
      await supabase.from('email_subscribers').insert({
        email: result.data.email,
        source: source,
        tags: ['lead_magnet', 'expenses_checklist', 'tiktok']
      });
    } catch (error) {
      console.log('Email already exists or error saving');
    }

    // Trigger PDF download
    const link = document.createElement('a');
    link.href = '/ReelinChecklist.pdf';
    link.download = 'Reelin-UK-Business-Expenses-Checklist.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setIsDownloading(false);
    setDownloadSuccess(true);
    
    toast({
      title: "Success! Check your downloads",
      description: "Your free checklist is downloading now.",
    });
  };

  if (downloadSuccess) {
    return (
      <main className="min-h-screen bg-gradient-hero flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md mx-auto text-center animate-fade-in">
          {/* Success State */}
          <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border-2 border-primary/20">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6 animate-scale-in">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            
            <h1 className="text-3xl font-bold text-foreground mb-3">
              Success! 🎉
            </h1>
            
            <p className="text-muted-foreground mb-8">
              Your checklist is downloading now. Check your downloads folder.
            </p>

            {/* Re-download Button */}
            <Button
              onClick={() => {
                const link = document.createElement('a');
                link.href = '/ReelinChecklist.pdf';
                link.download = 'Reelin-UK-Business-Expenses-Checklist.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              variant="outline"
              className="w-full mb-4 h-14"
            >
              <Download className="mr-2" />
              Re-download Checklist
            </Button>

            {/* Upsell to Course */}
            <div className="bg-primary/5 rounded-xl p-6 mt-8 border border-primary/20">
              <div className="flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5 text-primary mr-2" />
                <h2 className="text-lg font-semibold text-foreground">
                  Want to Master UK Business Finances?
                </h2>
              </div>
              
              <p className="text-sm text-muted-foreground mb-6">
                Join 500+ business owners learning tax, VAT, bookkeeping & more with bite-sized lessons.
              </p>

              <Button
                onClick={() => navigate("/signup")}
                className="w-full h-14 text-base shadow-glow"
              >
                Start Free Lessons
                <ArrowRight className="ml-2" />
              </Button>

              <p className="text-xs text-muted-foreground mt-4">
                3 free lessons • No credit card required • £9.99/month after trial
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-hero flex items-center justify-center px-4 py-6 safe-area-inset">
      <div className="w-full max-w-md mx-auto">
        {/* Logo/Brand */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="text-5xl mb-3">🎣</div>
          <span className="text-primary font-bold text-2xl">Reelin</span>
        </div>

        {/* Main Card */}
        <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border-2 border-primary/20 animate-slide-up">
          {/* Headline */}
          <h1 className="text-3xl font-bold text-foreground text-center mb-4 leading-tight">
            Free UK Business Expenses Checklist
          </h1>

          {/* Subheadline with Social Proof */}
          <p className="text-center text-muted-foreground mb-8 text-lg">
            Join 500+ UK business owners who never miss a deductible expense
          </p>

          {/* Visual Preview */}
          <div className="flex justify-center mb-8">
            <div className="w-24 h-24 bg-primary/10 rounded-2xl flex items-center justify-center border-2 border-primary/20 animate-pulse-glow">
              <Download className="w-12 h-12 text-primary" />
            </div>
          </div>

          {/* Value Bullets */}
          <div className="space-y-3 mb-8">
            {[
              "50+ allowable expenses organized by category",
              "HMRC compliant and up-to-date",
              "Save thousands in tax every year",
              "Instant PDF download - no waiting"
            ].map((benefit, index) => (
              <div key={index} className="flex items-start gap-3 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                <span className="text-foreground">{benefit}</span>
              </div>
            ))}
          </div>

          {/* Email Form */}
          <form onSubmit={handleDownload} className="space-y-4">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-14 text-base"
              aria-label="Email address"
            />

            <Button
              type="submit"
              disabled={isDownloading}
              className="w-full h-14 text-lg font-semibold shadow-glow hover:scale-[1.02] active:scale-[0.98] transition-transform"
            >
              {isDownloading ? (
                <>
                  <div className="animate-spin mr-2 h-5 w-5 border-2 border-background border-t-transparent rounded-full" />
                  Downloading...
                </>
              ) : (
                <>
                  <Download className="mr-2" />
                  Download Free Checklist
                </>
              )}
            </Button>
          </form>

          {/* Trust Signals */}
          <p className="text-center text-sm text-muted-foreground mt-6">
            No spam. Unsubscribe anytime. We respect your privacy.
          </p>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Created by an ex-accountant for UK business owners
        </p>
      </div>
    </main>
  );
};

export default FreeChecklist;
