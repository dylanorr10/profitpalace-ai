import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bookmark, Search, Calendar, BookOpen, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface NoteItem {
  id: string;
  lesson_id: string;
  lesson_title: string;
  lesson_category: string;
  lesson_emoji: string;
  notes: string;
  bookmarked: boolean;
  tags: string[];
  last_noted_at: string;
  completed_at: string;
}

export default function NotesLibrary() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<NoteItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<"all" | "bookmarked" | "notes">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotes();
    }
  }, [user]);

  useEffect(() => {
    filterNotes();
  }, [searchQuery, selectedFilter, notes]);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from("user_progress")
        .select(`
          id,
          lesson_id,
          notes,
          bookmarked,
          tags,
          last_noted_at,
          completed_at,
          lessons (
            title,
            category,
            emoji
          )
        `)
        .eq("user_id", user?.id)
        .or("notes.not.is.null,bookmarked.eq.true")
        .order("last_noted_at", { ascending: false, nullsFirst: false });

      if (error) throw error;

      const formattedNotes: NoteItem[] = (data || []).map((item: any) => ({
        id: item.id,
        lesson_id: item.lesson_id,
        lesson_title: item.lessons?.title || "Unknown Lesson",
        lesson_category: item.lessons?.category || "Uncategorized",
        lesson_emoji: item.lessons?.emoji || "📚",
        notes: item.notes || "",
        bookmarked: item.bookmarked || false,
        tags: item.tags || [],
        last_noted_at: item.last_noted_at || item.completed_at,
        completed_at: item.completed_at,
      }));

      setNotes(formattedNotes);
    } catch (error: any) {
      toast.error("Failed to load notes");
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterNotes = () => {
    let filtered = notes;

    // Filter by type
    if (selectedFilter === "bookmarked") {
      filtered = filtered.filter((note) => note.bookmarked);
    } else if (selectedFilter === "notes") {
      filtered = filtered.filter((note) => note.notes && note.notes.trim() !== "");
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.lesson_title.toLowerCase().includes(query) ||
          note.lesson_category.toLowerCase().includes(query) ||
          note.notes.toLowerCase().includes(query) ||
          note.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    setFilteredNotes(filtered);
  };

  const toggleBookmark = async (noteId: string, currentBookmarked: boolean) => {
    try {
      const { error } = await supabase
        .from("user_progress")
        .update({ bookmarked: !currentBookmarked })
        .eq("id", noteId);

      if (error) throw error;

      setNotes(
        notes.map((note) =>
          note.id === noteId ? { ...note, bookmarked: !currentBookmarked } : note
        )
      );
      toast.success(!currentBookmarked ? "Bookmarked!" : "Bookmark removed");
    } catch (error) {
      toast.error("Failed to update bookmark");
    }
  };

  const goToLesson = (lessonId: string) => {
    navigate(`/lesson/${lessonId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
        <div className="container mx-auto max-w-6xl py-8">
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-muted rounded-lg w-1/3" />
            <div className="h-64 bg-muted rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-4">
      <div className="container mx-auto max-w-6xl py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/dashboard")}
              className="hover:bg-accent"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                📚 My Notes
              </h1>
              <p className="text-muted-foreground mt-1">
                All your saved notes and bookmarked lessons in one place
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notes, lessons, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={selectedFilter === "all" ? "default" : "outline"}
              onClick={() => setSelectedFilter("all")}
              size="sm"
            >
              All
            </Button>
            <Button
              variant={selectedFilter === "bookmarked" ? "default" : "outline"}
              onClick={() => setSelectedFilter("bookmarked")}
              size="sm"
            >
              <Bookmark className="h-4 w-4 mr-1" />
              Bookmarked
            </Button>
            <Button
              variant={selectedFilter === "notes" ? "default" : "outline"}
              onClick={() => setSelectedFilter("notes")}
              size="sm"
            >
              <BookOpen className="h-4 w-4 mr-1" />
              With Notes
            </Button>
          </div>
        </div>

        {/* Notes List */}
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="space-y-4 pr-4">
            {filteredNotes.length === 0 ? (
              <Card className="p-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <BookOpen className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold mb-2">No notes found</h3>
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? "Try a different search term"
                        : "Start taking notes in your lessons or bookmark important content"}
                    </p>
                  </div>
                  <Button onClick={() => navigate("/curriculum")}>
                    Browse Lessons
                  </Button>
                </div>
              </Card>
            ) : (
              filteredNotes.map((note) => (
                <Card
                  key={note.id}
                  className="group hover:shadow-lg transition-all duration-200 cursor-pointer"
                  onClick={() => goToLesson(note.lesson_id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{note.lesson_emoji}</span>
                          <CardTitle className="text-lg group-hover:text-primary transition-colors">
                            {note.lesson_title}
                          </CardTitle>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {note.lesson_category}
                          </Badge>
                          {note.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleBookmark(note.id, note.bookmarked);
                        }}
                        className="shrink-0"
                      >
                        <Bookmark
                          className={`h-5 w-5 ${
                            note.bookmarked ? "fill-primary text-primary" : "text-muted-foreground"
                          }`}
                        />
                      </Button>
                    </div>
                  </CardHeader>
                  {note.notes && (
                    <CardContent>
                      <div className="bg-muted/50 rounded-lg p-4">
                        <p className="text-sm text-foreground/80 line-clamp-3">
                          {note.notes}
                        </p>
                      </div>
                      {note.last_noted_at && (
                        <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>
                            Last edited:{" "}
                            {new Date(note.last_noted_at).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Summary */}
        {filteredNotes.length > 0 && (
          <div className="flex items-center justify-between text-sm text-muted-foreground border-t pt-4">
            <span>
              Showing {filteredNotes.length} of {notes.length} items
            </span>
            <div className="flex gap-4">
              <span>{notes.filter((n) => n.bookmarked).length} bookmarked</span>
              <span>{notes.filter((n) => n.notes).length} with notes</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
