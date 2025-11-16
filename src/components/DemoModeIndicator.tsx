import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';

export const DemoModeIndicator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    setIsDemoMode(user?.email === 'demo@reelin.co.uk');
  }, [user]);

  if (!isDemoMode) return null;

  return (
    <>
      {/* Floating demo badge */}
      <div className="fixed top-4 right-4 z-50 animate-in fade-in slide-in-from-top-2 duration-500">
        <div className="bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 flex items-center gap-2 shadow-lg">
          <Sparkles className="h-4 w-4 text-primary animate-pulse" />
          <span className="text-sm font-medium text-primary">Demo Mode</span>
        </div>
      </div>

      {/* Sticky bottom CTA bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-5 duration-700 delay-1000">
        <div className="bg-gradient-to-r from-primary to-primary/80 backdrop-blur-sm border-t border-primary/20 shadow-2xl">
          <div className="container mx-auto px-4 py-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-center sm:text-left">
                <p className="text-primary-foreground font-semibold text-sm sm:text-base">
                  You're viewing a demo account with 45 days of progress! 🎉
                </p>
                <p className="text-primary-foreground/80 text-xs sm:text-sm">
                  Sign up to save your progress and start learning for real
                </p>
              </div>
              <Button 
                size="lg"
                variant="secondary"
                onClick={() => navigate('/signup')}
                className="shrink-0 shadow-lg hover:shadow-xl transition-shadow font-semibold min-w-[180px]"
              >
                Sign Up to Keep Learning
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
