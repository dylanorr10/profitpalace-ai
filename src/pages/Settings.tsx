import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, ExternalLink, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { SUBSCRIPTION_TIERS, getSubscriptionTierByProductId } from "@/lib/subscriptions";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, subscription, signOut } = useAuth();
  const [userId, setUserId] = useState<string>("");
  const [profile, setProfile] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    setUserId(user.id);

    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (data) {
      setProfile(data);
    }
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({
          annual_turnover: profile.annual_turnover,
          vat_registered: profile.vat_registered,
          business_start_date: profile.business_start_date,
          accounting_year_end: profile.accounting_year_end,
          mtd_status: profile.mtd_status,
          next_vat_return_due: profile.next_vat_return_due,
          turnover_last_updated: new Date().toISOString(),
          newsletter_subscribed: profile.newsletter_subscribed,
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Settings saved",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save settings. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleManageSubscription = async () => {
    setIsLoadingPortal(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to open customer portal",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPortal(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const currentTier = subscription.productId 
    ? getSubscriptionTierByProductId(subscription.productId)
    : null;

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <Tabs defaultValue="financial" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="financial">Financial Profile</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          <TabsContent value="financial" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">
                Financial Information
                <span className="text-sm font-normal text-muted-foreground ml-2">(Optional)</span>
              </h3>
              <p className="text-muted-foreground mb-6">
                Help us personalize your learning experience with accurate recommendations and timely alerts.
              </p>

              <div className="space-y-6">
                <div>
                  <Label htmlFor="turnover">Annual Turnover</Label>
                  <Input
                    id="turnover"
                    type="text"
                    placeholder="e.g., £50,000"
                    value={profile.annual_turnover || ""}
                    onChange={(e) => setProfile({ ...profile, annual_turnover: e.target.value })}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Used to calculate VAT thresholds and personalize content
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="vat">VAT Registered?</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enables VAT-specific content and deadline alerts
                    </p>
                  </div>
                  <Switch
                    id="vat"
                    checked={profile.vat_registered || false}
                    onCheckedChange={(checked) => setProfile({ ...profile, vat_registered: checked })}
                  />
                </div>

                {profile.vat_registered && (
                  <>
                    <div>
                      <Label htmlFor="vat-return">Next VAT Return Due</Label>
                      <Input
                        id="vat-return"
                        type="date"
                        value={profile.next_vat_return_due || ""}
                        onChange={(e) => setProfile({ ...profile, next_vat_return_due: e.target.value })}
                        className="mt-2"
                      />
                    </div>

                    <div>
                      <Label>Making Tax Digital Status</Label>
                      <RadioGroup
                        value={profile.mtd_status || "not_required"}
                        onValueChange={(value) => setProfile({ ...profile, mtd_status: value })}
                        className="mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="not_required" id="mtd-not" />
                          <Label htmlFor="mtd-not">Not Required</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="required" id="mtd-req" />
                          <Label htmlFor="mtd-req">Required (not yet setup)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="compliant" id="mtd-comp" />
                          <Label htmlFor="mtd-comp">Compliant</Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </>
                )}

                <div>
                  <Label htmlFor="start-date">Business Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={profile.business_start_date || ""}
                    onChange={(e) => setProfile({ ...profile, business_start_date: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Accounting Year-End</Label>
                  <RadioGroup
                    value={profile.accounting_year_end || "april_5"}
                    onValueChange={(value) => setProfile({ ...profile, accounting_year_end: value })}
                    className="mt-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="april_5" id="ye-april" />
                      <Label htmlFor="ye-april">April 5 (UK Tax Year)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="december_31" id="ye-dec" />
                      <Label htmlFor="ye-dec">December 31</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="march_31" id="ye-march" />
                      <Label htmlFor="ye-march">March 31</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>

              <Button 
                onClick={handleSaveProfile} 
                disabled={isSaving}
                className="mt-6"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Financial Profile"}
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="subscription" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Subscription Status</h3>
              
              {subscription.isSubscribed ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Current Plan</p>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-lg font-semibold">
                          {currentTier ? SUBSCRIPTION_TIERS[currentTier].name : 'Active'}
                        </p>
                        <Badge variant="default">Active</Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      {currentTier && (
                        <p className="text-2xl font-bold">
                          {SUBSCRIPTION_TIERS[currentTier].price}
                          <span className="text-sm font-normal text-muted-foreground">
                            /{SUBSCRIPTION_TIERS[currentTier].interval}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {subscription.subscriptionEnd && (
                    <div>
                      <p className="text-sm text-muted-foreground">Next billing date</p>
                      <p className="font-medium">
                        {new Date(subscription.subscriptionEnd).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  )}

                  <div className="pt-4 border-t">
                    <Button 
                      onClick={handleManageSubscription} 
                      disabled={isLoadingPortal}
                      variant="outline"
                      className="w-full"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      {isLoadingPortal ? "Loading..." : "Manage Subscription"}
                    </Button>
                    <p className="text-xs text-muted-foreground mt-2 text-center">
                      Update payment method, cancel subscription, or view invoices
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">
                      You're currently on the free trial
                    </p>
                    <p className="text-sm">
                      Upgrade to unlock all lessons and features
                    </p>
                  </div>
                  
                  <Button 
                    onClick={() => navigate('/pricing')}
                    className="w-full"
                  >
                    View Pricing Plans
                  </Button>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Email Preferences</h3>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="newsletter">Weekly Newsletter</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Get personalized tips, upcoming deadlines, and lesson recommendations
                  </p>
                </div>
                <Switch
                  id="newsletter"
                  checked={profile.newsletter_subscribed || false}
                  onCheckedChange={(checked) => setProfile({ ...profile, newsletter_subscribed: checked })}
                />
              </div>

              <Button 
                onClick={handleSaveProfile} 
                disabled={isSaving}
                className="mt-6"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? "Saving..." : "Save Preferences"}
              </Button>
            </Card>
          </TabsContent>

          <TabsContent value="account" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm text-muted-foreground">Email</Label>
                  <p className="font-medium">{user?.email}</p>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">
                    For password reset, please use the "Forgot Password" option on the login page.
                  </p>
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    onClick={handleSignOut}
                    variant="destructive"
                    className="w-full"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <p className="text-xs text-muted-foreground text-center">
                    <button
                      onClick={() => navigate("/terms")}
                      className="underline hover:text-foreground"
                    >
                      Terms of Service
                    </button>
                    {" "}•{" "}
                    <button
                      onClick={() => navigate("/privacy")}
                      className="underline hover:text-foreground"
                    >
                      Privacy Policy
                    </button>
                  </p>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
