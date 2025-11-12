import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { ExternalLink } from "lucide-react";

interface GlossaryTooltipProps {
  term: string;
  children?: React.ReactNode;
}

interface TermData {
  term: string;
  simple_explanation: string;
  category: string;
}

export const GlossaryTooltip = ({ term, children }: GlossaryTooltipProps) => {
  const navigate = useNavigate();
  const [termData, setTermData] = useState<TermData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTerm();
  }, [term]);

  const fetchTerm = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await (supabase as any)
        .from('glossary_terms')
        .select('term, simple_explanation, category')
        .ilike('term', term)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching glossary term:', error);
        setTermData(null);
      } else {
        setTermData(data);
      }
    } catch (err) {
      console.error('Glossary fetch exception:', err);
      setTermData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = () => {
    navigate(`/glossary?search=${encodeURIComponent(term)}`);
  };

  if (isLoading || !termData) {
    return <span className="underline decoration-dotted cursor-help">{children || term}</span>;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span 
            onClick={handleClick}
            className="underline decoration-dotted decoration-primary/50 cursor-pointer text-primary font-medium hover:text-primary/80 transition-colors"
          >
            {children || term}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-4 bg-popover z-50" side="top">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-sm">{termData.term}</h4>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <ExternalLink className="w-3 h-3" />
                Click to view full
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{termData.simple_explanation}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
