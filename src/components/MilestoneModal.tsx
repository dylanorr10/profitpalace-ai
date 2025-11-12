import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Target, Award } from "lucide-react";
import Confetti from "react-confetti";
import { useEffect, useState } from "react";
import reelinLogo from "@/assets/reelin-logo.jpg";

interface MilestoneModalProps {
  isOpen: boolean;
  onClose: () => void;
  milestone: 'first_lesson' | '25_percent' | '50_percent' | '75_percent' | '100_percent';
  lessonsCompleted: number;
  totalLessons: number;
}

const milestoneData = {
  first_lesson: {
    icon: 'logo',
    title: "🎉 You're Off to a Great Start!",
    message: "First lesson complete! You've taken the first step toward mastering UK business finance.",
    color: "from-primary to-primary/70",
  },
  '25_percent': {
    icon: Target,
    title: "💪 Quarter Way There!",
    message: "You've completed 25% of your journey. Keep up the momentum!",
    color: "from-blue-500 to-blue-600",
  },
  '50_percent': {
    icon: Trophy,
    title: "🚀 Halfway Through Your Journey!",
    message: "Amazing progress! You're halfway to becoming a business finance pro.",
    color: "from-purple-500 to-purple-600",
  },
  '75_percent': {
    icon: Award,
    title: "⭐ Almost There, Champion!",
    message: "75% complete! The finish line is in sight. You're doing brilliantly!",
    color: "from-orange-500 to-orange-600",
  },
  '100_percent': {
    icon: Trophy,
    title: "🏆 Journey Complete!",
    message: "Congratulations! You're now a UK business finance master!",
    color: "from-success to-success/70",
  },
};

export const MilestoneModal = ({ isOpen, onClose, milestone, lessonsCompleted, totalLessons }: MilestoneModalProps) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const data = milestoneData[milestone];
  const Icon = data.icon === 'logo' ? null : data.icon;

  useEffect(() => {
    if (isOpen) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}
      
      <DialogContent className="max-w-md text-center">
        <div className={`bg-gradient-to-br ${data.color} text-white rounded-t-lg -m-6 mb-6 p-6 md:p-8`}>
          <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 mb-4 backdrop-blur-sm">
            {Icon ? (
              <Icon className="w-8 h-8 md:w-10 md:h-10 text-white" />
            ) : (
              <img src={reelinLogo} alt="Reelin Logo" className="w-12 h-12 md:w-16 md:h-16 rounded-full object-contain" />
            )}
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2 md:mb-3">{data.title}</h2>
          <p className="text-base md:text-lg text-white/90">{data.message}</p>
        </div>

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Your Progress</p>
            <p className="text-3xl font-bold">
              {lessonsCompleted}
            </p>
            <p className="text-sm text-muted-foreground">
              {lessonsCompleted === 1 ? 'Lesson' : 'Lessons'} Completed
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              {milestone === '100_percent' 
                ? "You've mastered all the fundamentals of UK business finance!"
                : "Keep learning at your own pace!"}
            </p>
          </div>

          <Button 
            size="lg" 
            className="w-full"
            onClick={onClose}
          >
            {milestone === '100_percent' ? 'Celebrate! 🎉' : 'Continue Learning →'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
