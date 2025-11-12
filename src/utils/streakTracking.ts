import { supabase } from "@/integrations/supabase/client";

/**
 * Logs daily activity for a user
 * This automatically updates the user's streak via database trigger
 */
export const logDailyActivity = async (
  userId: string,
  lessonsCompleted: number = 1,
  timeSpentMinutes: number = 0
) => {
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  try {
    // Try to insert or update today's activity
    const { data: existingActivity } = await (supabase as any)
      .from('daily_activity')
      .select('*')
      .eq('user_id', userId)
      .eq('activity_date', today)
      .single();

    if (existingActivity) {
      // Update existing activity
      await (supabase as any)
        .from('daily_activity')
        .update({
          lessons_completed: existingActivity.lessons_completed + lessonsCompleted,
          time_spent_minutes: existingActivity.time_spent_minutes + timeSpentMinutes,
        })
        .eq('user_id', userId)
        .eq('activity_date', today);
    } else {
      // Insert new activity
      await (supabase as any)
        .from('daily_activity')
        .insert({
          user_id: userId,
          activity_date: today,
          lessons_completed: lessonsCompleted,
          time_spent_minutes: timeSpentMinutes,
        });
    }

    return { success: true };
  } catch (error) {
    console.error('Error logging daily activity:', error);
    return { success: false, error };
  }
};

/**
 * Gets streak information for a user
 */
export const getStreakInfo = async (userId: string) => {
  try {
    const { data: profile } = await (supabase as any)
      .from('user_profiles')
      .select('current_streak, longest_streak, total_study_days, last_activity_date')
      .eq('user_id', userId)
      .single();

    return {
      currentStreak: profile?.current_streak || 0,
      longestStreak: profile?.longest_streak || 0,
      totalStudyDays: profile?.total_study_days || 0,
      lastActivityDate: profile?.last_activity_date,
    };
  } catch (error) {
    console.error('Error fetching streak info:', error);
    return {
      currentStreak: 0,
      longestStreak: 0,
      totalStudyDays: 0,
      lastActivityDate: undefined,
    };
  }
};

/**
 * Checks if user has completed a lesson today
 */
export const hasStudiedToday = async (userId: string): Promise<boolean> => {
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const { data } = await (supabase as any)
      .from('daily_activity')
      .select('id')
      .eq('user_id', userId)
      .eq('activity_date', today)
      .single();

    return !!data;
  } catch (error) {
    return false;
  }
};

/**
 * Gets activity calendar for the last 30 days
 */
export const getActivityCalendar = async (userId: string, days: number = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  try {
    const { data } = await (supabase as any)
      .from('daily_activity')
      .select('activity_date, lessons_completed')
      .eq('user_id', userId)
      .gte('activity_date', startDate.toISOString().split('T')[0])
      .order('activity_date', { ascending: true });

    return data || [];
  } catch (error) {
    console.error('Error fetching activity calendar:', error);
    return [];
  }
};
