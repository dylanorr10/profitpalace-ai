import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sparkles, User } from "lucide-react";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface MessageBubbleProps {
  role: "user" | "assistant";
  content: string;
}

export const MessageBubble = ({ role, content }: MessageBubbleProps) => {
  const isUser = role === "user";

  return (
    <div className={`flex gap-3 animate-fade-in ${isUser ? "justify-end" : "justify-start"}`}>
      {/* Avatar - only show for assistant */}
      {!isUser && (
        <Avatar className="w-8 h-8 shrink-0 border-2 border-primary/20">
          <AvatarFallback className="bg-primary/10">
            <Sparkles className="w-4 h-4 text-primary" />
          </AvatarFallback>
        </Avatar>
      )}

      {/* Message content */}
      <Card
        className={`max-w-[85%] md:max-w-[75%] overflow-hidden ${
          isUser
            ? "bg-primary text-primary-foreground border-primary shadow-md"
            : "bg-card border-border shadow-sm hover:shadow-md transition-shadow"
        }`}
      >
        <div className={`p-4 ${isUser ? '' : 'prose prose-sm max-w-none dark:prose-invert'}`}>
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{content}</p>
          ) : (
            <div className="space-y-2">
              <MarkdownRenderer content={content} />
            </div>
          )}
        </div>
      </Card>

      {/* Avatar - only show for user */}
      {isUser && (
        <Avatar className="w-8 h-8 shrink-0 border-2 border-primary">
          <AvatarFallback className="bg-primary text-primary-foreground">
            <User className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};
