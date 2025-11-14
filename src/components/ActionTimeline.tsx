import { useState } from "react";
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ActionTimelineProps {
  steps: string[];
}

export const ActionTimeline = ({ steps }: ActionTimelineProps) => {
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());

  const toggleStep = (index: number) => {
    setCompletedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const toggleExpanded = (index: number) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const progress = (completedSteps.size / steps.length) * 100;

  return (
    <div className="space-y-4">
      {/* Progress indicator */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
          {completedSteps.size} of {steps.length}
        </span>
      </div>

      {/* Timeline */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isCompleted = completedSteps.has(index);
          const isExpanded = expandedSteps.has(index);
          const isLast = index === steps.length - 1;

          return (
            <div key={index} className="flex gap-4">
              {/* Timeline line and circle */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => toggleStep(index)}
                  className={cn(
                    "w-10 h-10 rounded-full border-2 flex items-center justify-center transition-all hover:scale-110",
                    isCompleted 
                      ? "bg-primary border-primary text-primary-foreground" 
                      : "bg-background border-border hover:border-primary"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-semibold">{index + 1}</span>
                  )}
                </button>
                {!isLast && (
                  <div className={cn(
                    "w-0.5 flex-1 min-h-[40px] transition-colors",
                    isCompleted ? "bg-primary" : "bg-border"
                  )} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 pb-4">
                <div 
                  className={cn(
                    "p-4 rounded-lg border transition-all cursor-pointer hover:shadow-md",
                    isCompleted 
                      ? "bg-primary/5 border-primary/20" 
                      : "bg-card border-border"
                  )}
                  onClick={() => toggleExpanded(index)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className={cn(
                      "flex-1 transition-colors",
                      isCompleted && "line-through text-muted-foreground"
                    )}>
                      {step.split('\n')[0]}
                    </p>
                    {step.includes('\n') && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpanded(index);
                        }}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </Button>
                    )}
                  </div>
                  {isExpanded && step.includes('\n') && (
                    <div className="mt-3 pt-3 border-t text-sm text-muted-foreground">
                      {step.split('\n').slice(1).join('\n')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
