import { SeasonalTrigger } from "./seasonalTriggers";
import { UK_TAX_CALENDAR } from "./seasonalTriggers";

export interface ThresholdTrigger extends SeasonalTrigger {
  thresholdType: "vat" | "mtd" | "turnover_review";
  currentValue?: number;
  thresholdValue: number;
  percentageToThreshold: number;
}

/**
 * Check if user is approaching VAT registration threshold
 */
export function checkVATThresholdProximity(
  annualTurnover: string | undefined,
  vatRegistered: boolean
): ThresholdTrigger | null {
  if (vatRegistered) return null; // Already registered

  const turnoverNum = parseTurnover(annualTurnover);
  if (!turnoverNum) return null;

  const threshold = UK_TAX_CALENDAR.VAT_THRESHOLD_2024;
  const percentageToThreshold = (turnoverNum / threshold) * 100;

  // Critical: Within £10k of threshold (>88% of threshold)
  if (turnoverNum >= threshold - 10000 && turnoverNum < threshold) {
    return {
      triggerId: "vat_threshold_critical",
      thresholdType: "vat",
      priority: "urgent",
      title: "VAT Registration Required Soon!",
      message: `Your turnover (£${turnoverNum.toLocaleString()}) is approaching the VAT threshold (£${threshold.toLocaleString()}). You must register when you exceed it.`,
      lessonIds: ["vat_registration", "vat_schemes_comparison"],
      currentValue: turnoverNum,
      thresholdValue: threshold,
      percentageToThreshold,
    };
  }

  // Warning: Within £20k of threshold (>77% of threshold)
  if (turnoverNum >= threshold - 20000 && turnoverNum < threshold - 10000) {
    return {
      triggerId: "vat_threshold_warning",
      thresholdType: "vat",
      priority: "warning",
      title: "Consider VAT Registration",
      message: `Your turnover is £${(threshold - turnoverNum).toLocaleString()} away from the VAT threshold. Start planning now.`,
      lessonIds: ["vat_intro", "voluntary_vat_registration"],
      currentValue: turnoverNum,
      thresholdValue: threshold,
      percentageToThreshold,
    };
  }

  return null;
}

/**
 * Check if user needs to prepare for Making Tax Digital (MTD)
 */
export function checkMTDRequirement(
  annualTurnover: string | undefined,
  vatRegistered: boolean,
  mtdStatus: string | undefined
): ThresholdTrigger | null {
  if (!vatRegistered) return null; // MTD only applies to VAT-registered businesses
  if (mtdStatus === "compliant") return null; // Already compliant

  const turnoverNum = parseTurnover(annualTurnover);
  if (!turnoverNum) return null;

  const threshold = UK_TAX_CALENDAR.MTD_THRESHOLD;

  // Already required to use MTD
  if (turnoverNum >= threshold) {
    return {
      triggerId: "mtd_required",
      thresholdType: "mtd",
      priority: "urgent",
      title: "Making Tax Digital Required",
      message: `Your turnover exceeds £${threshold.toLocaleString()}. You must use MTD-compatible software for VAT.`,
      lessonIds: ["mtd_setup", "mtd_software_selection"],
      currentValue: turnoverNum,
      thresholdValue: threshold,
      percentageToThreshold: (turnoverNum / threshold) * 100,
    };
  }

  // Approaching MTD threshold
  if (turnoverNum >= threshold - 15000) {
    return {
      triggerId: "mtd_approaching",
      thresholdType: "mtd",
      priority: "warning",
      title: "Prepare for Making Tax Digital",
      message: "You're approaching the MTD threshold. Start planning your software setup.",
      lessonIds: ["mtd_intro"],
      currentValue: turnoverNum,
      thresholdValue: threshold,
      percentageToThreshold: (turnoverNum / threshold) * 100,
    };
  }

  return null;
}

/**
 * Check if user should update their turnover estimate
 */
export function checkTurnoverReviewNeeded(
  turnoverLastUpdated?: Date | null
): ThresholdTrigger | null {
  if (!turnoverLastUpdated) {
    return {
      triggerId: "turnover_review_initial",
      thresholdType: "turnover_review",
      priority: "info",
      title: "Update Your Turnover Estimate",
      message: "Help us personalize your learning by providing your current annual turnover.",
      lessonIds: [],
      thresholdValue: 0,
      percentageToThreshold: 0,
    };
  }

  const now = new Date();
  const lastUpdated = new Date(turnoverLastUpdated);
  const monthsSinceUpdate = Math.floor(
    (now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24 * 30)
  );

  if (monthsSinceUpdate >= 3) {
    return {
      triggerId: "turnover_review_quarterly",
      thresholdType: "turnover_review",
      priority: "info",
      title: "Quarterly Turnover Check-In",
      message: "Update your turnover estimate to ensure accurate recommendations.",
      lessonIds: [],
      thresholdValue: 0,
      percentageToThreshold: 0,
    };
  }

  return null;
}

/**
 * Get all active proactive triggers for a user
 */
export function getActiveProactiveTriggers(profile: {
  annual_turnover?: string;
  vat_registered?: boolean;
  mtd_status?: string;
  turnover_last_updated?: Date | null;
}): ThresholdTrigger[] {
  const triggers: ThresholdTrigger[] = [];

  // Only show proactive triggers if we have some data
  // Don't check VAT threshold if no turnover data
  if (profile.annual_turnover) {
    const vatTrigger = checkVATThresholdProximity(
      profile.annual_turnover,
      profile.vat_registered || false
    );
    if (vatTrigger) triggers.push(vatTrigger);

    // Check MTD requirement
    const mtdTrigger = checkMTDRequirement(
      profile.annual_turnover,
      profile.vat_registered || false,
      profile.mtd_status
    );
    if (mtdTrigger) triggers.push(mtdTrigger);
  }

  // Only prompt for turnover update after 3 months, not immediately
  // This gives users time to explore without being prompted
  
  return triggers;
}

/**
 * Parse turnover string to number
 */
function parseTurnover(turnover: string | undefined): number | null {
  if (!turnover) return null;

  // Handle common formats
  const cleaned = turnover.replace(/[£,\s]/g, "");

  // Handle range formats like "50000-80000"
  if (cleaned.includes("-")) {
    const parts = cleaned.split("-");
    const avg = (parseInt(parts[0]) + parseInt(parts[1])) / 2;
    return isNaN(avg) ? null : avg;
  }

  // Handle "100k+" format
  if (cleaned.toLowerCase().includes("k")) {
    const num = parseFloat(cleaned.replace(/k/gi, ""));
    return isNaN(num) ? null : num * 1000;
  }

  const num = parseInt(cleaned);
  return isNaN(num) ? null : num;
}
