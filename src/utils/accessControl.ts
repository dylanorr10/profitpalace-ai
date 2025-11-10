export const hasAccessToLesson = (
  lessonOrderIndex: number,
  hasPurchased: boolean
): boolean => {
  // Paid users get full access
  if (hasPurchased) return true;
  
  // Free users only get first 3 lessons
  return lessonOrderIndex <= 3;
};

export const getRemainingFreeQuestions = (
  messagesCount: number,
  hasPurchased: boolean
): number => {
  if (hasPurchased) return Infinity;
  return Math.max(0, 10 - messagesCount);
};
