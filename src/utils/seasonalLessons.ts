import { getCurrentTaxSeason } from "./seasonalTriggers";
import { differenceInDays, parse } from "date-fns";

interface Lesson {
  id: string;
  title: string;
  category: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  duration: number;
  emoji: string;
  order_index: number;
  seasonal_tags?: string[];
}

interface UserProfile {
  business_structure?: string;
  vat_registered?: boolean;
  mtd_status?: string;
  annual_turnover?: string;
  accounting_year_end?: string;
  next_vat_return_due?: string | null;
}

interface UserProgress {
  lesson_id: string;
  completion_rate: number;
}

export interface SeasonalLessonGroup {
  id: string;
  title: string;
  emoji: string;
  message: string;
  urgency: "urgent" | "important" | "helpful";
  lessons: Lesson[];
  daysRemaining?: number;
  dismissible: boolean;
}

/**
 * Get seasonal emoji based on current season
 */
export function getSeasonalEmoji(season: string, urgency: string): string {
  if (urgency === "urgent") return "⏰";
  
  const emojiMap: { [key: string]: string } = {
    self_assessment_deadline: "📋",
    tax_year_end: "🌸",
    new_tax_year: "🎯",
    vat_quarter: "📊",
    mtd: "💻",
    general: "📚",
  };
  
  return emojiMap[season] || "📚";
}

/**
 * Check if user is approaching VAT quarter end
 */
function checkVATQuarter(nextVatReturnDue?: string | null): { isNear: boolean; daysRemaining?: number } {
  if (!nextVatReturnDue) return { isNear: false };
  
  const now = new Date();
  const deadline = new Date(nextVatReturnDue);
  const daysUntil = differenceInDays(deadline, now);
  
  return {
    isNear: daysUntil <= 30 && daysUntil > 0,
    daysRemaining: daysUntil > 0 ? daysUntil : undefined,
  };
}

/**
 * Check if user is approaching MTD threshold
 */
function checkMTDThreshold(annualTurnover?: string, mtdStatus?: string): boolean {
  if (mtdStatus === 'enrolled' || mtdStatus === 'not_required') return false;
  
  // Parse turnover ranges
  const turnoverMap: { [key: string]: number } = {
    '0-10k': 5000,
    '10k-30k': 20000,
    '30k-60k': 45000,
    '60k-85k': 72500,
    '85k-150k': 117500,
    '150k-300k': 225000,
    '300k+': 400000,
  };
  
  const turnover = turnoverMap[annualTurnover || ''] || 0;
  return turnover >= 60000; // Approaching £85k threshold
}

/**
 * Get all seasonal lessons relevant to the user right now
 */
export function getSeasonalLessons(
  allLessons: Lesson[],
  profile: UserProfile,
  userProgress: UserProgress[]
): SeasonalLessonGroup[] {
  const groups: SeasonalLessonGroup[] = [];
  const currentSeason = getCurrentTaxSeason();
  const now = new Date();
  
  // Get VAT quarter proximity
  const vatQuarter = checkVATQuarter(profile.next_vat_return_due);
  
  // Get MTD threshold status
  const approachingMTD = checkMTDThreshold(profile.annual_turnover, profile.mtd_status);
  
  // Filter lessons that have seasonal_tags
  const seasonalLessons = allLessons.filter(lesson => 
    lesson.seasonal_tags && lesson.seasonal_tags.length > 0
  );
  
  // Filter out completed lessons
  const incompleteLessons = seasonalLessons.filter(lesson => {
    const progress = userProgress.find(p => p.lesson_id === lesson.id);
    return !progress || progress.completion_rate < 100;
  });

  // Self Assessment Season (Dec-Jan)
  if (currentSeason === "self_assessment_deadline" && 
      (profile.business_structure === "Sole Trader" || profile.business_structure === "Partnership")) {
    
    const saLessons = incompleteLessons.filter(lesson =>
      lesson.seasonal_tags?.includes("self_assessment_deadline")
    );
    
    if (saLessons.length > 0) {
      const deadline = new Date(now.getFullYear(), 0, 31); // Jan 31
      if (now > deadline) deadline.setFullYear(now.getFullYear() + 1);
      const daysRemaining = differenceInDays(deadline, now);
      
      groups.push({
        id: `self_assessment_${now.getFullYear()}`,
        title: daysRemaining <= 14 ? "URGENT: Self Assessment Deadline" : "Self Assessment Season",
        emoji: getSeasonalEmoji("self_assessment_deadline", daysRemaining <= 14 ? "urgent" : "important"),
        message: daysRemaining <= 14 
          ? `Don't get caught out! Complete your Self Assessment before the £100 penalty.`
          : `It's Self Assessment season. Start gathering your receipts and income records now.`,
        urgency: daysRemaining <= 14 ? "urgent" : "important",
        lessons: saLessons.slice(0, 4),
        daysRemaining: daysRemaining > 0 ? daysRemaining : undefined,
        dismissible: daysRemaining > 14,
      });
    }
  }

  // Tax Year End (March - April 5)
  if (currentSeason === "tax_year_end" && profile.business_structure === "Limited Company") {
    const yearEndLessons = incompleteLessons.filter(lesson =>
      lesson.seasonal_tags?.includes("tax_year_end")
    );
    
    if (yearEndLessons.length > 0) {
      const deadline = new Date(now.getFullYear(), 3, 5); // April 5
      const daysRemaining = differenceInDays(deadline, now);
      
      groups.push({
        id: `tax_year_end_${now.getFullYear()}`,
        title: "Tax Year End Planning",
        emoji: getSeasonalEmoji("tax_year_end", "important"),
        message: `Make every penny count before April 5th. Optimize your tax position now.`,
        urgency: "important",
        lessons: yearEndLessons.slice(0, 3),
        daysRemaining: daysRemaining > 0 ? daysRemaining : undefined,
        dismissible: true,
      });
    }
  }

  // New Tax Year (April 6 - May)
  if (currentSeason === "new_tax_year") {
    const newYearLessons = incompleteLessons.filter(lesson =>
      lesson.seasonal_tags?.includes("new_tax_year")
    );
    
    if (newYearLessons.length > 0) {
      groups.push({
        id: `new_tax_year_${now.getFullYear()}`,
        title: "New Tax Year 2025/26",
        emoji: getSeasonalEmoji("new_tax_year", "helpful"),
        message: `Get ahead with these timely lessons for the new tax year starting April 6th.`,
        urgency: "helpful",
        lessons: newYearLessons.slice(0, 3),
        dismissible: true,
      });
    }
  }

  // VAT Quarter End (if VAT registered and approaching deadline)
  if (profile.vat_registered && vatQuarter.isNear) {
    const vatLessons = incompleteLessons.filter(lesson =>
      lesson.seasonal_tags?.includes("vat_quarter")
    );
    
    if (vatLessons.length > 0) {
      const isUrgent = (vatQuarter.daysRemaining || 0) <= 7;
      
      groups.push({
        id: `vat_quarter_${now.getFullYear()}_${Math.floor((now.getMonth() + 1) / 3)}`,
        title: isUrgent ? "URGENT: VAT Return Due" : "VAT Quarter End Approaching",
        emoji: getSeasonalEmoji("vat_quarter", isUrgent ? "urgent" : "important"),
        message: isUrgent
          ? `Your VAT return is due this week! Don't miss these essential steps.`
          : `Start preparing your VAT return for this quarter.`,
        urgency: isUrgent ? "urgent" : "important",
        lessons: vatLessons.slice(0, 2),
        daysRemaining: vatQuarter.daysRemaining,
        dismissible: !isUrgent,
      });
    }
  }

  // MTD Threshold (if approaching £85k threshold)
  if (approachingMTD) {
    const mtdLessons = incompleteLessons.filter(lesson =>
      lesson.seasonal_tags?.includes("mtd")
    );
    
    if (mtdLessons.length > 0) {
      groups.push({
        id: `mtd_threshold_${now.getFullYear()}`,
        title: "Making Tax Digital: Time to Prepare",
        emoji: getSeasonalEmoji("mtd", "important"),
        message: `Your turnover suggests you may need to register for MTD soon. Get ready now.`,
        urgency: "important",
        lessons: mtdLessons.slice(0, 2),
        dismissible: true,
      });
    }
  }

  // Sort by urgency (urgent first, then important, then helpful)
  return groups.sort((a, b) => {
    const urgencyOrder = { urgent: 0, important: 1, helpful: 2 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });
}
