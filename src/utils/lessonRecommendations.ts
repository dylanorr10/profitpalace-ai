import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  time_commitment?: string;
  pain_point?: string;
  learning_goal?: string;
  preferred_study_time?: string;
  study_days?: string[];
}

interface Lesson {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  duration: number;
  order_index: number;
}

interface UserProgress {
  lesson_id: string;
  completion_rate: number;
  quiz_score?: number;
}

interface RecommendationResult {
  primary: Lesson | null;
  quickWin: Lesson | null;
  challenge: Lesson | null;
  review: Lesson | null;
}

export const getRecommendedLessons = async (
  userId: string,
  profile: UserProfile,
  availableTime?: number
): Promise<RecommendationResult> => {
  try {
    // Fetch user progress
    const { data: progressData } = await supabase
      .from("user_progress")
      .select("lesson_id, completion_rate, quiz_score")
      .eq("user_id", userId);

    const progress: UserProgress[] = progressData || [];
    const completedLessonIds = progress
      .filter((p) => p.completion_rate === 100)
      .map((p) => p.lesson_id);

    // Fetch all lessons
    const { data: allLessons } = await supabase
      .from("lessons")
      .select("*")
      .order("order_index");

    if (!allLessons) {
      return { primary: null, quickWin: null, challenge: null, review: null };
    }

    const incompleteLessons = allLessons.filter((l) => !completedLessonIds.includes(l.id));

    // Determine time available (from profile or parameter)
    const timeAvailable = availableTime || getTimeFromCommitment(profile.time_commitment);

    // PRIMARY RECOMMENDATION: Next logical lesson based on pain point and time
    let primary: Lesson | null = null;
    if (incompleteLessons.length > 0) {
      // Prioritize by pain point
      const painPointLessons = incompleteLessons.filter((l) =>
        isPainPointMatch(l.category, profile.pain_point)
      );

      // Filter by time available
      const timeAppropriateLessons = incompleteLessons.filter(
        (l) => l.duration <= timeAvailable
      );

      // Find best match
      primary =
        painPointLessons.find((l) => l.duration <= timeAvailable) ||
        timeAppropriateLessons[0] ||
        incompleteLessons[0];
    }

    // QUICK WIN: Shortest incomplete lesson (easy difficulty preferred)
    const quickWin =
      incompleteLessons
        .filter((l) => l.difficulty === "beginner")
        .sort((a, b) => a.duration - b.duration)[0] ||
      incompleteLessons.sort((a, b) => a.duration - b.duration)[0] ||
      null;

    // CHALLENGE: Hardest incomplete lesson
    const challenge =
      incompleteLessons
        .filter((l) => l.difficulty === "advanced")
        .sort((a, b) => b.duration - a.duration)[0] || null;

    // REVIEW: Lesson with lowest quiz score (for retake)
    const struggledLessons = progress
      .filter((p) => p.quiz_score && p.quiz_score < 80)
      .sort((a, b) => (a.quiz_score || 100) - (b.quiz_score || 100));

    const review = struggledLessons.length > 0
      ? allLessons.find((l) => l.id === struggledLessons[0].lesson_id) || null
      : null;

    return { primary, quickWin, challenge, review };
  } catch (error) {
    console.error("Error getting lesson recommendations:", error);
    return { primary: null, quickWin: null, challenge: null, review: null };
  }
};

const getTimeFromCommitment = (commitment?: string): number => {
  switch (commitment) {
    case "15min":
      return 15;
    case "30min":
      return 30;
    case "1hour":
      return 60;
    case "2hours":
      return 120;
    default:
      return 30; // Default to 30 minutes
  }
};

const isPainPointMatch = (category: string, painPoint?: string): boolean => {
  if (!painPoint) return false;

  const painPointMap: Record<string, string[]> = {
    "Tax confusion": ["Tax", "VAT", "Self Assessment"],
    "Bookkeeping takes too long": ["Bookkeeping", "Expenses", "Invoicing"],
    "Missing deadlines": ["Deadlines", "Compliance", "HMRC"],
    "Understanding expenses": ["Expenses", "Allowances", "Mileage"],
  };

  const relevantCategories = painPointMap[painPoint] || [];
  return relevantCategories.some((cat) =>
    category.toLowerCase().includes(cat.toLowerCase())
  );
};

export const shouldStudyToday = (profile: UserProfile): boolean => {
  const dayNames = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];
  const todayName = dayNames[new Date().getDay()];

  if (!profile.study_days || profile.study_days.length === 0) {
    return true; // No preference means any day is fine
  }

  return profile.study_days.includes(todayName);
};

export const getEstimatedCompletionWeeks = (
  totalLessons: number,
  timeCommitment?: string
): number => {
  const avgLessonDuration = 25; // minutes
  const timePerDay = getTimeFromCommitment(timeCommitment);
  const lessonsPerDay = Math.max(1, Math.floor(timePerDay / avgLessonDuration));
  const daysNeeded = Math.ceil(totalLessons / lessonsPerDay);
  const weeksNeeded = Math.ceil(daysNeeded / 5); // Assuming 5 study days per week

  return weeksNeeded;
};
