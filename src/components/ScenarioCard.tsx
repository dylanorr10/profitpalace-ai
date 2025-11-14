import { Building2, User, Briefcase } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ScenarioCardProps {
  industry: string;
  content: string;
}

const industryIcons: { [key: string]: typeof Building2 } = {
  retail: Building2,
  hospitality: User,
  construction: Briefcase,
  freelance: User,
  default: Building2
};

const industryColors: { [key: string]: string } = {
  retail: "bg-purple-100 dark:bg-purple-950/30 border-purple-300 dark:border-purple-700",
  hospitality: "bg-blue-100 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700",
  construction: "bg-orange-100 dark:bg-orange-950/30 border-orange-300 dark:border-orange-700",
  freelance: "bg-cyan-100 dark:bg-cyan-950/30 border-cyan-300 dark:border-cyan-700",
  default: "bg-muted border-border"
};

export const ScenarioCard = ({ industry, content }: ScenarioCardProps) => {
  const Icon = industryIcons[industry.toLowerCase()] || industryIcons.default;
  const colorClass = industryColors[industry.toLowerCase()] || industryColors.default;

  return (
    <Card className={`${colorClass} hover:shadow-lg transition-shadow animate-fade-in`}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white dark:bg-black/20 rounded-lg">
            <Icon className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <Badge variant="secondary" className="capitalize">
              {industry}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed">{content}</p>
      </CardContent>
    </Card>
  );
};
