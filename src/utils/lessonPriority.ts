import { SeasonalTrigger, getActiveSeasonalTriggers } from "./seasonalTriggers";
import { ThresholdTrigger, getActiveProactiveTriggers } from "./proactiveTriggers";

export interface PrioritizedLesson {
  lessonId: string;
  priorityScore: number;
  reasons: string[];
  urgencyLevel: "urgent" | "high" | "medium" | "low";
}

export interface UserContext {
  business_structure?: string;
  industry?: string;
  experience_level?: string;
  pain_point?: string;
  learning_goal?: string;
  time_commitment?: string;
  accounting_year_end?: string;
  next_vat_return_due?: Date | null;
  vat_registered?: boolean;
  annual_turnover?: string;
  mtd_status?: string;
  turnover_last_updated?: Date | null;
}

/**
 * Calculate priority score for lessons based on user context and triggers
 */
export function calculateLessonPriority(
  availableLessons: Array<{ id: string; title: string; category?: string; seasonal_tags?: string[] }>,
  userContext: UserContext
): PrioritizedLesson[] {
  const seasonalTriggers = getActiveSeasonalTriggers(userContext);
  const proactiveTriggers = getActiveProactiveTriggers(userContext);
  const allTriggers = [...seasonalTriggers, ...proactiveTriggers];

  const prioritizedLessons = availableLessons.map((lesson) => {
    let score = 0;
    const reasons: string[] = [];
    let urgencyLevel: "urgent" | "high" | "medium" | "low" = "low";

    // 1. Urgent triggers (highest priority)
    const urgentTriggers = allTriggers.filter(
      (t) => t.priority === "urgent" && t.lessonIds.includes(lesson.id)
    );
    if (urgentTriggers.length > 0) {
      score += 100;
      urgencyLevel = "urgent";
      reasons.push(`🚨 ${urgentTriggers[0].title}`);
    }

    // 2. Warning triggers (high priority)
    const warningTriggers = allTriggers.filter(
      (t) => t.priority === "warning" && t.lessonIds.includes(lesson.id)
    );
    if (warningTriggers.length > 0) {
      score += 70;
      urgencyLevel = urgencyLevel === "urgent" ? "urgent" : "high";
      reasons.push(`⚠️ ${warningTriggers[0].title}`);
    }

    // 3. Seasonal relevance
    if (lesson.seasonal_tags) {
      const currentSeason = getCurrentSeasonTag();
      if (lesson.seasonal_tags.includes(currentSeason)) {
        score += 40;
        urgencyLevel = urgencyLevel === "low" ? "medium" : urgencyLevel;
        reasons.push("📅 Seasonally relevant");
      }
    }

    // 4. Pain point match
    if (userContext.pain_point && lesson.category) {
      if (isPainPointMatch(lesson.category, userContext.pain_point)) {
        score += 30;
        reasons.push("🎯 Matches your challenge");
      }
    }

    // 5. Learning goal alignment
    if (userContext.learning_goal && lesson.title) {
      if (isGoalMatch(lesson.title, userContext.learning_goal)) {
        score += 25;
        reasons.push("🎓 Aligns with your goal");
      }
    }

    // 6. Industry relevance
    if (userContext.industry && lesson.category) {
      if (isIndustryMatch(lesson.category, userContext.industry)) {
        score += 20;
        reasons.push("🏢 Industry-specific");
      }
    }

    return {
      lessonId: lesson.id,
      priorityScore: score,
      reasons,
      urgencyLevel: urgencyLevel === "low" && score > 50 ? "medium" : urgencyLevel,
    };
  });

  // Sort by priority score (highest first)
  return prioritizedLessons.sort((a, b) => b.priorityScore - a.priorityScore);
}

/**
 * Get current season tag for matching
 */
function getCurrentSeasonTag(): string {
  const now = new Date();
  const month = now.getMonth() + 1;

  if (month === 12 || month === 1) return "self_assessment_prep";
  if (month === 3 || month === 4) return "year_end_planning";
  if (month >= 4 && month <= 6) return "new_tax_year";

  return "general";
}

/**
 * Check if lesson matches user's pain point
 */
function isPainPointMatch(category: string, painPoint: string): boolean {
  const matches: Record<string, string[]> = {
    "Understanding tax obligations": ["tax", "hmrc", "compliance"],
    "Keeping accurate records": ["bookkeeping", "records", "expenses"],
    "Cash flow management": ["cash flow", "forecasting", "finance"],
    "Knowing what expenses I can claim": ["expenses", "deductions", "claims"],
    "Pricing my services correctly": ["pricing", "profit", "margins"],
    "VAT registration and returns": ["vat", "registration", "returns"],
  };

  const keywords = matches[painPoint] || [];
  return keywords.some((keyword) => category.toLowerCase().includes(keyword));
}

/**
 * Check if lesson matches user's learning goal
 */
function isGoalMatch(title: string, goal: string): boolean {
  const matches: Record<string, string[]> = {
    "Save money on taxes": ["tax", "deductions", "savings", "relief"],
    "Save time on bookkeeping": ["bookkeeping", "automation", "efficiency"],
    "Understand my finances better": ["reports", "analysis", "understanding"],
    "Prepare for growth": ["scaling", "growth", "planning", "forecasting"],
    "Stay compliant with HMRC": ["compliance", "hmrc", "deadlines", "penalties"],
  };

  const keywords = matches[goal] || [];
  return keywords.some((keyword) => title.toLowerCase().includes(keyword));
}

/**
 * Check if lesson is relevant to user's industry
 */
function isIndustryMatch(category: string, industry: string): boolean {
  const industryCategories: Record<string, string[]> = {
    Trades: ["construction", "cis", "trades", "equipment"],
    "Creative & Tech": ["freelance", "ir35", "intellectual property", "equipment"],
    "Professional Services": ["services", "professional", "consulting"],
    "Health & Beauty": ["retail", "services", "stock"],
    "Transport & Delivery": ["vehicle", "mileage", "transport"],
    "Retail & Hospitality": ["stock", "inventory", "retail", "hospitality"],
    Property: ["property", "landlord", "rental", "capital gains"],
  };

  const keywords = industryCategories[industry] || [];
  return keywords.some((keyword) => category.toLowerCase().includes(keyword));
}

/**
 * Get top priority lessons for dashboard display
 */
export function getTopPriorityLessons(
  availableLessons: Array<{ id: string; title: string; category?: string; seasonal_tags?: string[] }>,
  userContext: UserContext,
  limit: number = 3
): PrioritizedLesson[] {
  const prioritized = calculateLessonPriority(availableLessons, userContext);
  return prioritized.slice(0, limit);
}
