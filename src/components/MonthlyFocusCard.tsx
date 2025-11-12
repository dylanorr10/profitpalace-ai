import { Card } from "@/components/ui/card";
import { Calendar, TrendingUp } from "lucide-react";
import { format } from "date-fns";

interface MonthlyFocusCardProps {
  currentMonth: string;
  focusAreas: string[];
  upcomingDeadlines?: Array<{ name: string; date: Date }>;
}

export const MonthlyFocusCard = ({ currentMonth, focusAreas, upcomingDeadlines }: MonthlyFocusCardProps) => {
  return (
    <Card className="p-6 mb-6 bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
      <div className="flex items-start gap-3 mb-4">
        <Calendar className="h-6 w-6 text-primary mt-1" />
        <div>
          <h2 className="text-xl font-semibold text-foreground">This Month's Focus</h2>
          <p className="text-sm text-muted-foreground">{currentMonth}</p>
        </div>
      </div>

      {focusAreas.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Priority Areas
          </h3>
          <ul className="space-y-2">
            {focusAreas.map((area, index) => (
              <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                <span>{area}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {upcomingDeadlines && upcomingDeadlines.length > 0 && (
        <div className="pt-4 border-t border-border/50">
          <h3 className="text-sm font-medium text-foreground mb-2">Upcoming Deadlines</h3>
          <ul className="space-y-2">
            {upcomingDeadlines.map((deadline, index) => (
              <li key={index} className="text-sm flex justify-between items-center">
                <span className="text-muted-foreground">{deadline.name}</span>
                <span className="text-foreground font-medium">{format(deadline.date, "MMM d")}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
};
