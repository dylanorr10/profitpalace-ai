import { useEffect, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Flame, Award, Sparkles } from "lucide-react";
import Confetti from "react-confetti";

interface WelcomeAnimationProps {
  isOpen: boolean;
  onClose: () => void;
  currentStreak: number;
  lessonsCompleted: number;
}

export const WelcomeAnimation = ({ isOpen, onClose, currentStreak, lessonsCompleted }: WelcomeAnimationProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      setStep(0);
      
      const stepTimer = setInterval(() => {
        setStep(prev => {
          if (prev >= 2) {
            clearInterval(stepTimer);
            return prev;
          }
          return prev + 1;
        });
      }, 1000);

      const confettiTimer = setTimeout(() => setShowConfetti(false), 4000);
      
      return () => {
        clearInterval(stepTimer);
        clearTimeout(confettiTimer);
      };
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {showConfetti && <Confetti numberOfPieces={300} recycle={false} />}
      
      <DialogContent className="max-w-lg text-center overflow-hidden">
        <div className="bg-gradient-to-br from-primary to-primary/70 text-white rounded-t-lg -m-6 mb-6 p-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-4 backdrop-blur-sm">
            <Sparkles className="w-10 h-10 text-white animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold mb-3">Welcome to Your Demo! 🎉</h2>
          <p className="text-lg text-white/90">Here's what you've "achieved" in this demo account</p>
        </div>

        <div className="space-y-6 py-4">
          {/* Streak Highlight */}
          <div 
            className={`transform transition-all duration-500 ${
              step >= 0 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 rounded-lg p-6 border-2 border-orange-500/30">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="p-3 rounded-full bg-gradient-to-br from-orange-500 to-red-500 animate-pulse">
                  <Flame className="w-8 h-8 text-white" />
                </div>
                <span className="text-5xl font-bold">{currentStreak}</span>
              </div>
              <p className="text-lg font-semibold">Day Learning Streak</p>
              <p className="text-sm text-muted-foreground mt-1">Consistency is key! 🔥</p>
            </div>
          </div>

          {/* Lessons Completed */}
          <div 
            className={`transform transition-all duration-500 delay-300 ${
              step >= 1 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <div className="bg-muted/50 rounded-lg p-6">
              <div className="flex items-center justify-center gap-3 mb-2">
                <Award className="w-8 h-8 text-primary" />
                <span className="text-4xl font-bold">{lessonsCompleted}</span>
              </div>
              <p className="text-lg font-semibold">Lessons Completed</p>
              <p className="text-sm text-muted-foreground mt-1">You're making great progress!</p>
            </div>
          </div>

          {/* AI Chat Feature */}
          <div 
            className={`transform transition-all duration-500 delay-500 ${
              step >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'
            }`}
          >
            <div className="bg-primary/10 rounded-lg p-6 border border-primary/20">
              <Sparkles className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-lg font-semibold">AI Study Buddy Available</p>
              <p className="text-sm text-muted-foreground mt-1">Get personalized help anytime! 🤖</p>
            </div>
          </div>
        </div>

        <Button 
          size="lg" 
          className="w-full mt-4"
          onClick={onClose}
        >
          Explore Dashboard →
        </Button>

        <p className="text-xs text-muted-foreground mt-3">
          This is a demo account. Sign up to save your real progress!
        </p>
      </DialogContent>
    </Dialog>
  );
};
