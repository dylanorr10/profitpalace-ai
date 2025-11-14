import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bookmark, BookOpen, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RecentNote {
  id: string;
  lesson_id: string;
  lesson_title: string;
  lesson_emoji: string;
  notes: string;
  bookmarked: boolean;
  last_noted_at: string;
}

export default function NotesWidget() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [recentNotes, setRecentNotes] = useState<RecentNote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchRecentNotes();
    }
  }, [user]);

  const fetchRecentNotes = async () => {
    try {
      const { data, error } = await supabase
        .from("user_progress")
        .select(`
          id,
          lesson_id,
          notes,
          bookmarked,
          last_noted_at,
          completed_at,
          lessons (
            title,
            emoji
          )
        `)
        .eq("user_id", user?.id)
        .or("notes.not.is.null,bookmarked.eq.true")
        .order("last_noted_at", { ascending: false, nullsFirst: false })
        .limit(5);

      if (error) throw error;

      const formatted: RecentNote[] = (data || []).map((item: any) => ({
        id: item.id,
        lesson_id: item.lesson_id,
        lesson_title: item.lessons?.title || "Unknown Lesson",
        lesson_emoji: item.lessons?.emoji || "📚",
        notes: item.notes || "",
        bookmarked: item.bookmarked || false,
        last_noted_at: item.last_noted_at || item.completed_at,
      }));

      setRecentNotes(formatted);
    } catch (error) {
      console.error("Error fetching recent notes:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Recent Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-16 bg-muted rounded-lg" />
            <div className="h-16 bg-muted rounded-lg" />
            <div className="h-16 bg-muted rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recentNotes.length === 0) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Recent Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full bg-muted mx-auto mb-3 flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              No notes or bookmarks yet
            </p>
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate("/curriculum")}
            >
              Start Learning
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="text-xl flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Recent Notes
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/notes")}
          className="text-primary hover:text-primary"
        >
          View All
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[280px]">
          <div className="space-y-3 pr-4">
            {recentNotes.map((note) => (
              <div
                key={note.id}
                onClick={() => navigate(`/lesson/${note.lesson_id}`)}
                className="group p-3 rounded-lg bg-muted/50 hover:bg-muted transition-all cursor-pointer border border-transparent hover:border-border"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl shrink-0">{note.lesson_emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                        {note.lesson_title}
                      </h4>
                      {note.bookmarked && (
                        <Bookmark className="h-3 w-3 fill-primary text-primary shrink-0" />
                      )}
                    </div>
                    {note.notes && (
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {note.notes}
                      </p>
                    )}
                    {!note.notes && note.bookmarked && (
                      <Badge variant="outline" className="text-xs mt-1">
                        Bookmarked
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
