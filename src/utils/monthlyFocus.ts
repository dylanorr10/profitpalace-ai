import { getCurrentTaxSeason, UK_TAX_CALENDAR } from "./seasonalTriggers";

export interface MonthlyFocus {
  currentMonth: string;
  focusAreas: string[];
  upcomingDeadlines: Array<{ name: string; date: Date }>;
}

/**
 * Get monthly focus areas and deadlines based on current date and user profile
 */
export function getMonthlyFocus(profile: {
  business_structure?: string;
  vat_registered?: boolean;
  accounting_year_end?: string;
}): MonthlyFocus {
  const now = new Date();
  const currentMonth = now.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  const month = now.getMonth() + 1; // 1-12
  
  const focusAreas: string[] = [];
  const upcomingDeadlines: Array<{ name: string; date: Date }> = [];

  // January focus (Self Assessment)
  if (month === 1) {
    if (profile.business_structure === "Sole Trader" || profile.business_structure === "sole-trader") {
      focusAreas.push("Complete Self Assessment tax return");
      upcomingDeadlines.push({
        name: "Self Assessment Deadline",
        date: new Date(now.getFullYear(), 0, 31),
      });
    }
    focusAreas.push("Review last year's financial performance");
    focusAreas.push("Set financial goals for the new year");
  }

  // December focus (Year-end prep)
  if (month === 12) {
    if (profile.business_structure === "Sole Trader" || profile.business_structure === "sole-trader") {
      focusAreas.push("Gather receipts and records for Self Assessment");
      focusAreas.push("Calculate your tax liability estimate");
    }
    focusAreas.push("Review your expenses for the year");
    focusAreas.push("Plan for tax payments in January");
  }

  // March-April focus (Tax year-end)
  if (month === 3 || month === 4) {
    focusAreas.push("Maximize tax-deductible expenses before year-end");
    if (profile.business_structure === "Limited Company" || profile.business_structure === "limited") {
      focusAreas.push("Review dividend vs salary split");
      focusAreas.push("Consider pension contributions for tax relief");
    }
    upcomingDeadlines.push({
      name: "Tax Year End",
      date: new Date(now.getFullYear(), 3, 5),
    });
  }

  // VAT quarters
  if (profile.vat_registered) {
    const currentQuarter = Math.ceil(month / 3);
    const quarterEndMonths = [2, 5, 8, 11]; // Feb, May, Aug, Nov
    
    if (quarterEndMonths.includes(month)) {
      focusAreas.push("Prepare VAT return for this quarter");
      const quarterEndDate = new Date(now.getFullYear(), month - 1, [28, 31, 31, 30][currentQuarter - 1]);
      upcomingDeadlines.push({
        name: `Q${currentQuarter} VAT Return`,
        date: quarterEndDate,
      });
    }
  }

  // General seasonal focus
  const season = getCurrentTaxSeason();
  if (season === "new_tax_year" && focusAreas.length === 0) {
    focusAreas.push("Set up your bookkeeping for the new tax year");
    focusAreas.push("Review your business structure efficiency");
  }

  // Default if no specific focus
  if (focusAreas.length === 0) {
    focusAreas.push("Maintain consistent bookkeeping habits");
    focusAreas.push("Review your cash flow regularly");
    focusAreas.push("Stay on top of expense tracking");
  }

  return {
    currentMonth,
    focusAreas,
    upcomingDeadlines: upcomingDeadlines.filter(d => d.date > now), // Only future deadlines
  };
}
