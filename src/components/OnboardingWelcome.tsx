import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface OnboardingWelcomeProps {
  isOpen: boolean;
  onClose: () => void;
  onStartJourney: () => void;
}

export const OnboardingWelcome = ({ isOpen, onClose, onStartJourney }: OnboardingWelcomeProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-3xl text-center mb-4">
            Welcome to Your Learning Journey! 🎯
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-4">
              <Sparkles className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Your 30-Day Journey Starts Here</h3>
            <p className="text-lg text-muted-foreground">
              We'll guide you step-by-step through UK business finance. No overwhelm, just progress.
            </p>
          </div>

          <div className="grid gap-4 py-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
              <div>
                <h4 className="font-semibold mb-1">Personalized Path</h4>
                <p className="text-sm text-muted-foreground">We've organized lessons based on your business type and goals</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">2</div>
              <div>
                <h4 className="font-semibold mb-1">One Step at a Time</h4>
                <p className="text-sm text-muted-foreground">Focus on one lesson at a time - no information overload</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">3</div>
              <div>
                <h4 className="font-semibold mb-1">Celebrate Progress</h4>
                <p className="text-sm text-muted-foreground">Earn badges and track your journey to becoming a finance pro</p>
              </div>
            </div>
          </div>

          <div className="bg-muted/50 rounded-lg p-4 text-center">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Pro Tip:</strong> Most people complete their first lesson in under 15 minutes
            </p>
          </div>

          <Button 
            size="lg" 
            className="w-full text-lg h-14"
            onClick={onStartJourney}
          >
            Start Your First Day →
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
