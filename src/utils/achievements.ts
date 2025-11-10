import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface AchievementMetadata {
  [key: string]: any;
}

const ACHIEVEMENTS = {
  first_lesson: {
    name: "First Lesson Complete",
    description: "You've started your learning journey!",
    emoji: "🎓",
  },
  quiz_ace: {
    name: "Quiz Ace",
    description: "Score 100% on a quiz",
    emoji: "🧠",
  },
  streak_7: {
    name: "7-Day Streak",
    description: "Study 7 days in a row",
    emoji: "🔥",
  },
  all_free_lessons: {
    name: "Course Explorer",
    description: "Complete all free lessons",
    emoji: "📚",
  },
  weekly_warrior: {
    name: "Weekly Warrior",
    description: "Hit your weekly goal 4 weeks in a row",
    emoji: "🎯",
  },
  perfect_student: {
    name: "Perfect Student",
    description: "100% on all quizzes",
    emoji: "💎",
  },
  speed_learner: {
    name: "Speed Learner",
    description: "Complete course in 2 weeks",
    emoji: "🚀",
  },
  early_bird: {
    name: "Early Bird",
    description: "Study before 9am (5 times)",
    emoji: "⏰",
  },
  night_owl: {
    name: "Night Owl",
    description: "Study after 9pm (5 times)",
    emoji: "🌙",
  },
  ai_buddy: {
    name: "AI Companion",
    description: "Ask 50 questions to AI Study Buddy",
    emoji: "💬",
  },
  note_taker: {
    name: "Note Taker",
    description: "Add notes to 10 lessons",
    emoji: "📝",
  },
  course_complete: {
    name: "Course Champion",
    description: "Complete the entire course",
    emoji: "🏆",
  },
};

export const checkAndAwardAchievements = async (
  userId: string,
  achievementType: keyof typeof ACHIEVEMENTS,
  metadata?: AchievementMetadata
) => {
  try {
    // Check if user already has this achievement
    const { data: existing } = await supabase
      .from("achievements")
      .select("id")
      .eq("user_id", userId)
      .eq("achievement_type", achievementType)
      .maybeSingle();

    if (existing) {
      return; // Already has this achievement
    }

    const achievement = ACHIEVEMENTS[achievementType];

    // Award the achievement
    const { error } = await supabase.from("achievements").insert({
      user_id: userId,
      achievement_type: achievementType,
      achievement_name: achievement.name,
      achievement_description: achievement.description,
      metadata: metadata || {},
    });

    if (error) throw error;

    // Show toast notification
    toast({
      title: `${achievement.emoji} Achievement Unlocked!`,
      description: `${achievement.name}: ${achievement.description}`,
      duration: 5000,
    });
  } catch (error) {
    console.error("Error awarding achievement:", error);
  }
};

export const checkStreakAchievement = async (userId: string, streakDays: number) => {
  if (streakDays === 7) {
    await checkAndAwardAchievements(userId, "streak_7", { streak_days: streakDays });
  }
};

export const checkTimeBasedAchievement = async (userId: string, studyHour: number) => {
  // Check early bird (before 9am)
  if (studyHour < 9) {
    const { data: sessions } = await supabase
      .from("user_progress")
      .select("started_at")
      .eq("user_id", userId);

    const earlyBirdCount = sessions?.filter((s) => {
      const hour = new Date(s.started_at).getHours();
      return hour < 9;
    }).length;

    if (earlyBirdCount === 5) {
      await checkAndAwardAchievements(userId, "early_bird", { count: earlyBirdCount });
    }
  }

  // Check night owl (after 9pm)
  if (studyHour >= 21) {
    const { data: sessions } = await supabase
      .from("user_progress")
      .select("started_at")
      .eq("user_id", userId);

    const nightOwlCount = sessions?.filter((s) => {
      const hour = new Date(s.started_at).getHours();
      return hour >= 21;
    }).length;

    if (nightOwlCount === 5) {
      await checkAndAwardAchievements(userId, "night_owl", { count: nightOwlCount });
    }
  }
};

export const checkAIUsageAchievement = async (userId: string) => {
  const { data: aiUsage } = await supabase
    .from("ai_usage")
    .select("messages_count")
    .eq("user_id", userId)
    .maybeSingle();

  if (aiUsage && aiUsage.messages_count >= 50) {
    await checkAndAwardAchievements(userId, "ai_buddy", { messages_count: aiUsage.messages_count });
  }
};

export const checkNoteTakingAchievement = async (userId: string) => {
  const { data: progress } = await supabase
    .from("user_progress")
    .select("notes")
    .eq("user_id", userId)
    .not("notes", "is", null);

  if (progress && progress.length >= 10) {
    await checkAndAwardAchievements(userId, "note_taker", { notes_count: progress.length });
  }
};

export const checkCourseCompletionAchievements = async (userId: string) => {
  const { data: progress } = await supabase
    .from("user_progress")
    .select("lesson_id, completion_rate, quiz_score")
    .eq("user_id", userId)
    .eq("completion_rate", 100);

  const { data: lessons } = await supabase.from("lessons").select("id");

  if (!progress || !lessons) return;

  // Check if all lessons completed
  if (progress.length === lessons.length) {
    await checkAndAwardAchievements(userId, "course_complete", {
      lessons_completed: progress.length,
    });

    // Check if all quizzes are 100%
    const allPerfect = progress.every((p) => p.quiz_score === 100);
    if (allPerfect) {
      await checkAndAwardAchievements(userId, "perfect_student", {
        lessons_completed: progress.length,
      });
    }
  }

  // Check free lessons completion (first 3 lessons)
  const freeLessonsCompleted = progress.filter((p, idx) => idx < 3).length;
  if (freeLessonsCompleted === 3) {
    await checkAndAwardAchievements(userId, "all_free_lessons");
  }
};

export { ACHIEVEMENTS };
