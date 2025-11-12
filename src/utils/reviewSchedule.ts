import { supabase } from "@/integrations/supabase/client";

export interface ReviewLesson {
  id: string;
  title: string;
  category: string;
  emoji: string;
  masteryLevel: number;
  reviewCount: number;
  nextReviewDate: string;
  lastScore: number;
}

/**
 * Gets lessons that are due for review today
 */
export const getLessonsDueForReview = async (userId: string): Promise<ReviewLesson[]> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await (supabase as any)
      .from('user_progress')
      .select(`
        lesson_id,
        mastery_level,
        review_count,
        next_review_date,
        quiz_score,
        lessons (
          id,
          title,
          category,
          emoji
        )
      `)
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .lte('next_review_date', today)
      .order('next_review_date', { ascending: true });

    if (error) throw error;

    return (data || []).map((item: any) => ({
      id: item.lessons.id,
      title: item.lessons.title,
      category: item.lessons.category,
      emoji: item.lessons.emoji,
      masteryLevel: item.mastery_level || 0,
      reviewCount: item.review_count || 0,
      nextReviewDate: item.next_review_date,
      lastScore: item.quiz_score || 0,
    }));
  } catch (error) {
    console.error('Error fetching lessons due for review:', error);
    return [];
  }
};

/**
 * Gets upcoming review lessons (next 7 days)
 */
export const getUpcomingReviews = async (userId: string, days: number = 7): Promise<ReviewLesson[]> => {
  try {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    
    const { data, error } = await (supabase as any)
      .from('user_progress')
      .select(`
        lesson_id,
        mastery_level,
        review_count,
        next_review_date,
        quiz_score,
        lessons (
          id,
          title,
          category,
          emoji
        )
      `)
      .eq('user_id', userId)
      .not('completed_at', 'is', null)
      .gt('next_review_date', today.toISOString().split('T')[0])
      .lte('next_review_date', futureDate.toISOString().split('T')[0])
      .order('next_review_date', { ascending: true });

    if (error) throw error;

    return (data || []).map((item: any) => ({
      id: item.lessons.id,
      title: item.lessons.title,
      category: item.lessons.category,
      emoji: item.lessons.emoji,
      masteryLevel: item.mastery_level || 0,
      reviewCount: item.review_count || 0,
      nextReviewDate: item.next_review_date,
      lastScore: item.quiz_score || 0,
    }));
  } catch (error) {
    console.error('Error fetching upcoming reviews:', error);
    return [];
  }
};

/**
 * Gets mastery level label
 */
export const getMasteryLabel = (level: number): string => {
  switch (level) {
    case 0: return "Learning";
    case 1: return "Familiar";
    case 2: return "Proficient";
    case 3: return "Mastered";
    default: return "Unknown";
  }
};

/**
 * Gets mastery color for UI
 */
export const getMasteryColor = (level: number): string => {
  switch (level) {
    case 0: return "text-muted-foreground";
    case 1: return "text-blue-500";
    case 2: return "text-purple-500";
    case 3: return "text-yellow-500";
    default: return "text-muted-foreground";
  }
};
