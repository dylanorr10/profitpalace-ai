import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionData {
  isSubscribed: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
  subscriptionType: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscription: SubscriptionData;
  signOut: () => Promise<void>;
  checkSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionData>({
    isSubscribed: false,
    productId: null,
    subscriptionEnd: null,
    subscriptionType: null,
  });
  const { toast } = useToast();

  const checkSubscription = async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (!currentSession) {
        setSubscription({
          isSubscribed: false,
          productId: null,
          subscriptionEnd: null,
          subscriptionType: null,
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${currentSession.access_token}`,
        },
      });

      if (error) {
        console.error('Subscription check error:', error);
        return;
      }

      setSubscription({
        isSubscribed: data?.subscribed || false,
        productId: data?.product_id || null,
        subscriptionEnd: data?.subscription_end || null,
        subscriptionType: data?.subscription_type || null,
      });
    } catch (error) {
      console.error('Failed to check subscription:', error);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        // Check subscription when auth state changes
        if (currentSession?.user && event === 'SIGNED_IN') {
          setTimeout(() => {
            checkSubscription();
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          setSubscription({
            isSubscribed: false,
            productId: null,
            subscriptionEnd: null,
            subscriptionType: null,
          });
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
      
      // Check subscription if user is logged in
      if (currentSession?.user) {
        checkSubscription();
      }
    });

    return () => authSubscription.unsubscribe();
  }, []);

  // Auto-refresh subscription status every 10 seconds
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        checkSubscription();
      }, 10000); // 10 seconds

      return () => clearInterval(interval);
    }
  }, [user]);

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Signed out",
        description: "You've been successfully signed out.",
      });
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    session,
    loading,
    subscription,
    signOut,
    checkSubscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
