export const hasAccessToLesson = (
  lessonOrderIndex: number,
  subscriptionStatus?: string
): boolean => {
  // Active subscribers get full access
  if (subscriptionStatus === 'active') return true;
  
  // Free users only get first 3 lessons
  return lessonOrderIndex <= 3;
};

export const getRemainingFreeQuestions = (
  messagesCount: number,
  subscriptionStatus?: string
): number => {
  if (subscriptionStatus === 'active') return Infinity;
  return Math.max(0, 10 - messagesCount);
};
