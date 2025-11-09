import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, CheckCircle2, XCircle, Lightbulb } from "lucide-react";

const Lesson = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Sample lesson data - in real app, fetch from database based on id
  const lesson = {
    id: "1",
    title: "Understanding Profit & Loss",
    category: "Tax",
    difficulty: "Beginner",
    duration: 3,
    emoji: "💰",
    content: {
      intro: "Understanding your profit is the foundation of running a successful business. Let's break it down in simple terms.",
      sections: [
        {
          title: "What is Profit?",
          content: "Profit is simply what's left after you subtract all your business expenses from your income. It's the money you actually get to keep.",
          formula: "Profit = Income - Expenses"
        },
        {
          title: "Real Example: Trades Business",
          content: "Let's say you're a plumber. This month you earned £5,000 from jobs. Your expenses were:",
          bullets: [
            "Materials and parts: £1,200",
            "Van fuel: £300",
            "Insurance: £150",
            "Phone and internet: £50",
            "Tools: £200"
          ],
          calculation: "£5,000 - (£1,200 + £300 + £150 + £50 + £200) = £3,100 profit"
        }
      ],
      canDo: [
        "Claim all legitimate business expenses",
        "Track expenses as they happen",
        "Keep receipts for everything",
        "Use accounting software to automate tracking"
      ],
      cantDo: [
        "Claim personal expenses as business expenses",
        "Forget to track cash payments",
        "Mix personal and business money",
        "Wait until tax return time to organize"
      ],
      proTips: [
        "Set aside 25-30% of profit for tax",
        "Review your profit monthly, not just yearly",
        "Look for patterns - which months are most profitable?",
        "If profit is low, check if you're claiming all allowable expenses"
      ],
      actionSteps: [
        "Download our Profit Calculator spreadsheet",
        "List all your income sources this month",
        "List all your business expenses",
        "Calculate your profit"
      ]
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Lesson Header */}
        <div className="mb-8">
          <div className="flex items-start gap-4 mb-4">
            <div className="text-6xl">{lesson.emoji}</div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-success/10 text-success">{lesson.difficulty}</Badge>
                <Badge variant="outline">{lesson.category}</Badge>
                <div className="flex items-center gap-1 text-muted-foreground text-sm">
                  <Clock className="w-4 h-4" />
                  <span>{lesson.duration} min</span>
                </div>
              </div>
              <h1 className="text-4xl font-bold mb-2">{lesson.title}</h1>
              <p className="text-xl text-muted-foreground">{lesson.content.intro}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {lesson.content.sections.map((section, idx) => (
            <Card key={idx} className="p-6 bg-gradient-card">
              <h2 className="text-2xl font-bold mb-4">{section.title}</h2>
              <p className="text-lg mb-4">{section.content}</p>
              
              {section.formula && (
                <div className="bg-primary/10 p-4 rounded-lg text-center font-mono text-lg mb-4">
                  {section.formula}
                </div>
              )}

              {section.bullets && (
                <ul className="space-y-2 mb-4">
                  {section.bullets.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}

              {section.calculation && (
                <div className="bg-success/10 p-4 rounded-lg">
                  <div className="font-semibold mb-2">Calculation:</div>
                  <div className="font-mono">{section.calculation}</div>
                </div>
              )}
            </Card>
          ))}

          {/* What You CAN Do */}
          <Card className="p-6 border-success">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-6 h-6 text-success" />
              <h2 className="text-2xl font-bold">What You CAN Do ✅</h2>
            </div>
            <ul className="space-y-3">
              {lesson.content.canDo.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* What You CAN'T Do */}
          <Card className="p-6 border-destructive">
            <div className="flex items-center gap-2 mb-4">
              <XCircle className="w-6 h-6 text-destructive" />
              <h2 className="text-2xl font-bold">Common Mistakes to Avoid ❌</h2>
            </div>
            <ul className="space-y-3">
              {lesson.content.cantDo.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-destructive mt-0.5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Pro Tips */}
          <Card className="p-6 bg-gradient-primary text-white">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="w-6 h-6" />
              <h2 className="text-2xl font-bold">Pro Tips 💡</h2>
            </div>
            <ul className="space-y-3">
              {lesson.content.proTips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <Lightbulb className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </Card>

          {/* Action Steps */}
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-4">Your Action Steps 🎯</h2>
            <div className="space-y-3">
              {lesson.content.actionSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 bg-secondary/30 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    {idx + 1}
                  </div>
                  <span className="mt-1">{step}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Lesson Complete */}
        <div className="mt-12 flex justify-between items-center">
          <Button variant="outline" onClick={() => navigate("/dashboard")}>
            Back to Lessons
          </Button>
          <Button size="lg" className="bg-gradient-primary">
            Mark as Complete ✓
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Lesson;
