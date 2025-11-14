import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

interface ScrollToBottomProps {
  onClick: () => void;
  show: boolean;
}

export const ScrollToBottom = ({ onClick, show }: ScrollToBottomProps) => {
  if (!show) return null;

  return (
    <div className="absolute bottom-20 right-4 z-10 animate-fade-in">
      <Button
        onClick={onClick}
        size="icon"
        className="rounded-full shadow-lg hover:scale-110 transition-transform"
      >
        <ArrowDown className="w-4 h-4" />
      </Button>
    </div>
  );
};
