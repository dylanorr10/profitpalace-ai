import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Flame, Trophy, Target, TrendingUp } from "lucide-react";

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  totalStudyDays: number;
  lastActivityDate?: string;
}

export const StreakCard = ({ 
  currentStreak, 
  longestStreak, 
  totalStudyDays,
  lastActivityDate 
}: StreakCardProps) => {
  
  const getStreakMessage = () => {
    if (currentStreak === 0) {
      return "Start your streak today! 🚀";
    } else if (currentStreak === 1) {
      return "Great start! Come back tomorrow! ✨";
    } else if (currentStreak < 7) {
      return `Keep it up! ${7 - currentStreak} more days to reach a week! 💪`;
    } else if (currentStreak === 7) {
      return "Amazing! You've hit a 7-day streak! 🎉";
    } else if (currentStreak < 30) {
      return `Outstanding! ${30 - currentStreak} more days to reach a month! 🔥`;
    } else if (currentStreak === 30) {
      return "Incredible! 30-day streak achieved! 🏆";
    } else {
      return `Unstoppable! ${currentStreak} days and counting! 🌟`;
    }
  };

  const getStreakColor = () => {
    if (currentStreak === 0) return "from-muted to-muted";
    if (currentStreak < 7) return "from-orange-500/20 to-orange-600/20";
    if (currentStreak < 30) return "from-red-500/20 to-orange-500/20";
    return "from-red-600/20 to-yellow-500/20";
  };

  const getStreakBadgeColor = () => {
    if (currentStreak === 0) return "bg-muted text-muted-foreground";
    if (currentStreak < 7) return "bg-orange-500/10 text-orange-600 border-orange-500/20";
    if (currentStreak < 30) return "bg-red-500/10 text-red-600 border-red-500/20";
    return "bg-gradient-to-r from-red-500 to-yellow-500 text-white border-0";
  };

  // Check if streak is at risk (last activity was yesterday or earlier)
  const isStreakAtRisk = lastActivityDate && 
    new Date(lastActivityDate).toDateString() !== new Date().toDateString();

  return (
    <Card className={`p-6 bg-gradient-to-br ${getStreakColor()} border-2 transition-all hover:shadow-lg`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-full ${
            currentStreak > 0 ? 'bg-gradient-to-br from-orange-500 to-red-500 animate-pulse' : 'bg-muted'
          }`}>
            <Flame className={`w-6 h-6 ${currentStreak > 0 ? 'text-white' : 'text-muted-foreground'}`} />
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold">{currentStreak}</span>
              <span className="text-lg text-muted-foreground">day{currentStreak !== 1 ? 's' : ''}</span>
            </div>
            <p className="text-sm text-muted-foreground">Current Streak</p>
          </div>
        </div>
        
        {currentStreak > 0 && (
          <Badge className={getStreakBadgeColor()}>
            🔥 On Fire!
          </Badge>
        )}
      </div>

      {/* Encouraging Message */}
      <div className="mb-4 p-3 bg-background/50 rounded-lg">
        <p className="text-sm font-medium text-center">
          {getStreakMessage()}
        </p>
      </div>

      {/* At Risk Warning */}
      {isStreakAtRisk && currentStreak > 0 && (
        <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm font-medium text-destructive text-center flex items-center justify-center gap-2">
            ⚠️ Complete a lesson today to maintain your streak!
          </p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span className="text-2xl font-bold">{longestStreak}</span>
          </div>
          <p className="text-xs text-muted-foreground">Longest Streak</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-2xl font-bold">{totalStudyDays}</span>
          </div>
          <p className="text-xs text-muted-foreground">Total Study Days</p>
        </div>
      </div>

      {/* Milestone Progress */}
      {currentStreak > 0 && currentStreak < 30 && (
        <div className="mt-4 pt-4 border-t">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-muted-foreground">Next Milestone</span>
            <span className="font-medium">
              {currentStreak < 7 ? '7 days' : '30 days'}
            </span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
              style={{ 
                width: `${currentStreak < 7 
                  ? (currentStreak / 7) * 100 
                  : ((currentStreak - 7) / 23) * 100}%` 
              }}
            />
          </div>
        </div>
      )}

      {/* Perfect Streak Badge */}
      {currentStreak === 30 && (
        <div className="mt-4 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg">
          <p className="text-sm font-bold text-center flex items-center justify-center gap-2">
            🏆 Perfect Month Achievement Unlocked!
          </p>
        </div>
      )}
    </Card>
  );
};
