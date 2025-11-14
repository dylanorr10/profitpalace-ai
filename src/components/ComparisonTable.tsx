import { CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";

interface ComparisonTableProps {
  canDo: string[];
  cantDo: string[];
}

export const ComparisonTable = ({ canDo, cantDo }: ComparisonTableProps) => {
  const maxLength = Math.max(canDo.length, cantDo.length);
  
  return (
    <div className="grid md:grid-cols-2 gap-4">
      {/* Can Do Column */}
      <Card className="border-l-4 border-l-green-500 bg-green-50 dark:bg-green-950/20">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400" />
            <h3 className="text-xl font-semibold text-green-900 dark:text-green-100">
              What You CAN Do
            </h3>
          </div>
          <ul className="space-y-3">
            {canDo.map((item, index) => (
              <li 
                key={index}
                className="flex items-start gap-3 p-3 bg-white dark:bg-green-950/40 rounded-lg animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                <span className="text-sm text-green-900 dark:text-green-100">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>

      {/* Can't Do Column */}
      <Card className="border-l-4 border-l-red-500 bg-red-50 dark:bg-red-950/20">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
            <h3 className="text-xl font-semibold text-red-900 dark:text-red-100">
              What You CAN'T Do
            </h3>
          </div>
          <ul className="space-y-3">
            {cantDo.map((item, index) => (
              <li 
                key={index}
                className="flex items-start gap-3 p-3 bg-white dark:bg-red-950/40 rounded-lg animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <XCircle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <span className="text-sm text-red-900 dark:text-red-100">{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </Card>
    </div>
  );
};
