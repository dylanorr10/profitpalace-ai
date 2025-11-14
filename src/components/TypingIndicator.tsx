import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles } from "lucide-react";

export const TypingIndicator = () => {
  return (
    <div className="flex gap-3 animate-fade-in">
      <Avatar className="w-8 h-8 shrink-0 border-2 border-primary/20">
        <AvatarFallback className="bg-primary/10">
          <Sparkles className="w-4 h-4 text-primary" />
        </AvatarFallback>
      </Avatar>

      <Card className="bg-card border-border p-4">
        <div className="flex gap-1.5">
          <div
            className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <div
            className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <div
            className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </Card>
    </div>
  );
};
