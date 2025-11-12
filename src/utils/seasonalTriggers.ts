import { differenceInDays, differenceInWeeks, addMonths, parse, format } from "date-fns";

// UK Tax Calendar Constants
export const UK_TAX_CALENDAR = {
  SELF_ASSESSMENT_DEADLINE: { month: 1, day: 31 }, // January 31
  TAX_YEAR_END: { month: 4, day: 5 }, // April 5
  TAX_YEAR_START: { month: 4, day: 6 }, // April 6
  VAT_THRESHOLD_2024: 90000,
  MTD_THRESHOLD: 85000,
};

// VAT Quarter End Dates (Standard Quarters)
export const VAT_QUARTERS = {
  Q1: { month: 2, day: 28 }, // End Feb
  Q2: { month: 5, day: 31 }, // End May
  Q3: { month: 8, day: 31 }, // End Aug
  Q4: { month: 11, day: 30 }, // End Nov
};

export interface SeasonalTrigger {
  triggerId: string;
  priority: "urgent" | "warning" | "info";
  title: string;
  message: string;
  lessonIds: string[];
  daysUntilExpiry?: number;
}

/**
 * Get current tax season based on date
 */
export function getCurrentTaxSeason(): string {
  const now = new Date();
  const month = now.getMonth() + 1; // 1-12
  const day = now.getDate();

  // Self Assessment season (Dec 1 - Jan 31)
  if ((month === 12) || (month === 1 && day <= 31)) {
    return "self_assessment_deadline";
  }

  // Year-end planning (March - April 5)
  if (month === 3 || (month === 4 && day <= 5)) {
    return "tax_year_end";
  }

  // New tax year setup (April 6 - May)
  if ((month === 4 && day >= 6) || month === 5) {
    return "new_tax_year";
  }

  return "general";
}

/**
 * Check proximity to Self Assessment deadline
 */
export function checkSelfAssessmentProximity(businessStructure: string): SeasonalTrigger | null {
  if (businessStructure !== "Sole Trader" && businessStructure !== "Partnership") {
    return null;
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const deadline = new Date(currentYear, 0, 31); // Jan 31 of current year

  // If deadline passed, look at next year
  if (now > deadline) {
    deadline.setFullYear(currentYear + 1);
  }

  const daysUntil = differenceInDays(deadline, now);

  if (daysUntil <= 14 && daysUntil > 0) {
    return {
      triggerId: "self_assessment_urgent",
      priority: "urgent",
      title: "Self Assessment Due in 2 Weeks!",
      message: `Your Self Assessment deadline is ${format(deadline, "MMMM d, yyyy")}. Complete it now to avoid £100 penalty.`,
      lessonIds: ["self_assessment_sprint"],
      daysUntilExpiry: daysUntil,
    };
  }

  if (daysUntil <= 30 && daysUntil > 14) {
    return {
      triggerId: "self_assessment_warning",
      priority: "warning",
      title: "Self Assessment Due Soon",
      message: "Start gathering your receipts and income records for Self Assessment.",
      lessonIds: ["self_assessment_prep"],
      daysUntilExpiry: daysUntil,
    };
  }

  return null;
}

/**
 * Check VAT return deadline proximity
 */
export function checkVATReturnProximity(nextVatReturnDue?: Date | null): SeasonalTrigger | null {
  if (!nextVatReturnDue) return null;

  const now = new Date();
  const deadline = new Date(nextVatReturnDue);
  const daysUntil = differenceInDays(deadline, now);

  if (daysUntil <= 7 && daysUntil > 0) {
    return {
      triggerId: "vat_return_urgent",
      priority: "urgent",
      title: "VAT Return Due This Week!",
      message: `Submit your VAT return by ${format(deadline, "MMMM d, yyyy")}.`,
      lessonIds: ["vat_return_walkthrough"],
      daysUntilExpiry: daysUntil,
    };
  }

  if (daysUntil <= 21 && daysUntil > 7) {
    return {
      triggerId: "vat_return_warning",
      priority: "warning",
      title: "VAT Return Due Soon",
      message: "Start preparing your VAT return for this quarter.",
      lessonIds: ["vat_return_prep"],
      daysUntilExpiry: daysUntil,
    };
  }

  return null;
}

/**
 * Check accounting year-end proximity
 */
export function checkYearEndProximity(
  accountingYearEnd: string,
  businessStructure: string
): SeasonalTrigger | null {
  if (businessStructure !== "Limited Company") return null;

  const now = new Date();
  let yearEndDate: Date;

  if (accountingYearEnd === "april_5") {
    yearEndDate = new Date(now.getFullYear(), 3, 5); // April 5
  } else if (accountingYearEnd === "december_31") {
    yearEndDate = new Date(now.getFullYear(), 11, 31); // Dec 31
  } else if (accountingYearEnd === "march_31") {
    yearEndDate = new Date(now.getFullYear(), 2, 31); // March 31
  } else {
    // Custom date format: "YYYY-MM-DD"
    try {
      yearEndDate = parse(accountingYearEnd, "yyyy-MM-dd", now);
    } catch {
      return null;
    }
  }

  // If year-end passed, look at next year
  if (now > yearEndDate) {
    yearEndDate = addMonths(yearEndDate, 12);
  }

  const weeksUntil = differenceInWeeks(yearEndDate, now);

  if (weeksUntil <= 12 && weeksUntil > 0) {
    return {
      triggerId: "year_end_planning",
      priority: "warning",
      title: "Year-End Planning Time",
      message: `Your accounting year ends ${format(yearEndDate, "MMMM d, yyyy")}. Start preparing now.`,
      lessonIds: ["year_end_planning", "tax_planning"],
      daysUntilExpiry: differenceInDays(yearEndDate, now),
    };
  }

  return null;
}

/**
 * Get all active seasonal triggers for a user
 */
export function getActiveSeasonalTriggers(profile: {
  business_structure?: string;
  accounting_year_end?: string;
  next_vat_return_due?: Date | null;
  vat_registered?: boolean;
}): SeasonalTrigger[] {
  const triggers: SeasonalTrigger[] = [];

  // Check Self Assessment (show generic if no business structure)
  if (profile.business_structure) {
    const saTrigger = checkSelfAssessmentProximity(profile.business_structure);
    if (saTrigger) triggers.push(saTrigger);
  } else {
    // Show generic Self Assessment alert during season
    const season = getCurrentTaxSeason();
    if (season === "self_assessment_deadline") {
      triggers.push({
        triggerId: "self_assessment_generic",
        priority: "info",
        title: "Self Assessment Season",
        message: "It's Self Assessment season. Complete your profile for personalized reminders.",
        lessonIds: [],
      });
    }
  }

  // Check VAT returns
  if (profile.vat_registered && profile.next_vat_return_due) {
    const vatTrigger = checkVATReturnProximity(profile.next_vat_return_due);
    if (vatTrigger) triggers.push(vatTrigger);
  }

  // Check year-end
  if (profile.business_structure === "Limited Company" && profile.accounting_year_end) {
    const yearEndTrigger = checkYearEndProximity(
      profile.accounting_year_end,
      profile.business_structure
    );
    if (yearEndTrigger) triggers.push(yearEndTrigger);
  }

  // Sort by priority (urgent first)
  return triggers.sort((a, b) => {
    const priorityOrder = { urgent: 0, warning: 1, info: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}
