/**
 * CLIENT-SIDE ACCESS CONTROL UTILITIES
 * 
 * ⚠️ SECURITY WARNING: These functions are for UI hints ONLY.
 * They do NOT provide security - actual access control is enforced by:
 * - Database RLS policies on the 'lessons' table
 * - Server-side validation in edge functions
 * 
 * Never rely on these for security decisions. Users can bypass client-side
 * checks via DevTools or direct API calls. Always verify access server-side.
 */

export const hasAccessToLesson = (
  lessonOrderIndex: number,
  subscriptionStatus?: string
): boolean => {
  // UI HINT ONLY - RLS policies enforce actual access control
  if (subscriptionStatus === 'active') return true;
  return lessonOrderIndex <= 3;
};

export const getRemainingFreeQuestions = (
  messagesCount: number,
  subscriptionStatus?: string
): number => {
  // UI HINT ONLY - Server-side edge function enforces actual limits
  if (subscriptionStatus === 'active') return Infinity;
  return Math.max(0, 10 - messagesCount);
};
