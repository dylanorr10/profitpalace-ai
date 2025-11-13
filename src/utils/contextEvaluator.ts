import { Database } from "@/integrations/supabase/types";

type UserProfile = Database['public']['Tables']['user_profiles']['Row'];

export interface RelevanceCondition {
  field: keyof UserProfile;
  operator: 'equals' | 'notEquals' | 'greaterThan' | 'lessThan' | 'contains' | 'exists';
  value?: any;
}

export interface ContentSection {
  title?: string;
  content?: string;
  type?: string;
  relevance_conditions?: RelevanceCondition[];
  priority_for?: string[]; // User characteristics that make this highly relevant
  hide_for?: string[]; // User characteristics that make this irrelevant
}

/**
 * Evaluates if content is relevant to user based on their profile
 */
export const evaluateRelevance = (
  userProfile: UserProfile | null,
  conditions?: RelevanceCondition[]
): boolean => {
  if (!conditions || conditions.length === 0) return true;
  if (!userProfile) return true; // Show all content if no profile

  return conditions.every(condition => {
    const userValue = userProfile[condition.field];
    
    switch (condition.operator) {
      case 'equals':
        return userValue === condition.value;
      
      case 'notEquals':
        return userValue !== condition.value;
      
      case 'greaterThan':
        if (typeof userValue === 'string') {
          // Handle turnover ranges like "50000-85000"
          const numValue = parseInt(userValue.split('-')[1] || userValue);
          return numValue > condition.value;
        }
        return (userValue as number) > condition.value;
      
      case 'lessThan':
        if (typeof userValue === 'string') {
          const numValue = parseInt(userValue.split('-')[0] || userValue);
          return numValue < condition.value;
        }
        return (userValue as number) < condition.value;
      
      case 'contains':
        if (Array.isArray(userValue)) {
          return userValue.includes(condition.value);
        }
        if (typeof userValue === 'string') {
          return userValue.toLowerCase().includes(condition.value.toLowerCase());
        }
        return false;
      
      case 'exists':
        return userValue !== null && userValue !== undefined && userValue !== '';
      
      default:
        return true;
    }
  });
};

/**
 * Check if content is high priority for this user
 */
export const isPriorityContent = (
  userProfile: UserProfile | null,
  section: ContentSection
): boolean => {
  if (!section.priority_for || !userProfile) return false;

  return section.priority_for.some(characteristic => {
    // Check various user characteristics
    if (characteristic === 'vat_registered' && userProfile.vat_registered) return true;
    if (characteristic === 'vat_threshold_approaching' && userProfile.vat_threshold_approaching) return true;
    if (characteristic === 'first_year' && userProfile.business_start_date) {
      const startDate = new Date(userProfile.business_start_date);
      const monthsSinceStart = (Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      return monthsSinceStart < 12;
    }
    if (characteristic === 'has_employees' && userProfile.employees_count && userProfile.employees_count !== '0') return true;
    if (userProfile.industry?.toLowerCase().includes(characteristic.toLowerCase())) return true;
    if (userProfile.pain_point?.toLowerCase().includes(characteristic.toLowerCase())) return true;
    if (userProfile.business_structure?.toLowerCase().includes(characteristic.toLowerCase())) return true;
    
    return false;
  });
};

/**
 * Check if content should be hidden for this user
 */
export const shouldHideContent = (
  userProfile: UserProfile | null,
  section: ContentSection
): boolean => {
  if (!section.hide_for || !userProfile) return false;

  return section.hide_for.some(characteristic => {
    if (characteristic === 'not_vat_registered' && !userProfile.vat_registered) return true;
    if (characteristic === 'no_employees' && (!userProfile.employees_count || userProfile.employees_count === '0')) return true;
    if (characteristic === 'low_turnover' && userProfile.annual_turnover) {
      const turnover = parseInt(userProfile.annual_turnover.split('-')[0] || '0');
      return turnover < 50000;
    }
    
    return false;
  });
};

/**
 * Get relevance score (0-100) for content
 */
export const getRelevanceScore = (
  userProfile: UserProfile | null,
  section: ContentSection
): number => {
  if (!userProfile) return 50; // Neutral score

  let score = 50; // Start neutral

  // Boost for priority content
  if (isPriorityContent(userProfile, section)) {
    score += 30;
  }

  // Penalty if should be hidden
  if (shouldHideContent(userProfile, section)) {
    score -= 40;
  }

  // Boost based on relevance conditions
  if (section.relevance_conditions) {
    const isRelevant = evaluateRelevance(userProfile, section.relevance_conditions);
    if (isRelevant) score += 20;
  }

  return Math.max(0, Math.min(100, score));
};

/**
 * Smart content filtering with rules
 */
export const filterAndSortContent = (
  sections: ContentSection[],
  userProfile: UserProfile | null,
  options = { hideIrrelevant: true, sortByRelevance: true }
): ContentSection[] => {
  let filtered = sections;

  // Filter out completely irrelevant content
  if (options.hideIrrelevant) {
    filtered = filtered.filter(section => {
      if (shouldHideContent(userProfile, section)) return false;
      if (section.relevance_conditions && !evaluateRelevance(userProfile, section.relevance_conditions)) {
        return false;
      }
      return true;
    });
  }

  // Sort by relevance score
  if (options.sortByRelevance) {
    filtered = [...filtered].sort((a, b) => {
      const scoreA = getRelevanceScore(userProfile, a);
      const scoreB = getRelevanceScore(userProfile, b);
      return scoreB - scoreA;
    });
  }

  return filtered;
};
