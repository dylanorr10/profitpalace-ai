import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from "react-router-dom";
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
  const [termData, setTermData] = useState<TermData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchTerm();
  }, [term]);

  const fetchTerm = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('glossary_terms')
      .select('term, simple_explanation, category')
      .ilike('term', term)
      .single();
    
    setTermData(data);
    setIsLoading(false);
  };

  if (isLoading || !termData) {
    return <span className="underline decoration-dotted cursor-help">{children || term}</span>;
  }

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="underline decoration-dotted decoration-primary/50 cursor-help text-primary font-medium">
            {children || term}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-4" side="top">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-bold text-sm">{termData.term}</h4>
              <Link 
                to={`/glossary?search=${encodeURIComponent(term)}`}
                className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
              >
                <ExternalLink className="w-3 h-3" />
                View full
              </Link>
            </div>
            <p className="text-sm text-muted-foreground">{termData.simple_explanation}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
