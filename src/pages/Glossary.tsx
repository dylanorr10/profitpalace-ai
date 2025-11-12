import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookmarkIcon, Search, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface GlossaryTerm {
  id: string;
  term: string;
  definition: string;
  simple_explanation: string;
  example: string | null;
  category: string;
  synonyms: string[];
  isBookmarked?: boolean;
}

const Glossary = () => {
  const navigate = useNavigate();
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [filteredTerms, setFilteredTerms] = useState<GlossaryTerm[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [bookmarkedTermIds, setBookmarkedTermIds] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTerms();
    fetchBookmarks();
  }, []);

  useEffect(() => {
    filterTerms();
  }, [searchQuery, selectedCategory, terms, bookmarkedTermIds]);

  const fetchTerms = async () => {
    const { data, error } = await supabase
      .from('glossary_terms')
      .select('*')
      .order('term');
    
    if (error) {
      console.error('Error fetching glossary:', error);
      toast.error("Failed to load glossary terms");
      return;
    }
    
    setTerms(data || []);
    setIsLoading(false);
  };

  const fetchBookmarks = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_glossary_bookmarks')
      .select('term_id')
      .eq('user_id', user.id);
    
    if (data) {
      setBookmarkedTermIds(new Set(data.map(b => b.term_id)));
    }
  };

  const filterTerms = () => {
    let filtered = terms;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(t => t.category === selectedCategory);
    }

    // Filter by search query (term, definition, or synonyms)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => 
        t.term.toLowerCase().includes(query) ||
        t.simple_explanation.toLowerCase().includes(query) ||
        t.definition.toLowerCase().includes(query) ||
        t.synonyms.some(s => s.toLowerCase().includes(query))
      );
    }

    // Add bookmark status
    filtered = filtered.map(t => ({
      ...t,
      isBookmarked: bookmarkedTermIds.has(t.id)
    }));

    setFilteredTerms(filtered);
  };

  const toggleBookmark = async (termId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please log in to bookmark terms");
      return;
    }

    const isBookmarked = bookmarkedTermIds.has(termId);

    if (isBookmarked) {
      await supabase
        .from('user_glossary_bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('term_id', termId);
      
      setBookmarkedTermIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(termId);
        return newSet;
      });
    } else {
      await supabase
        .from('user_glossary_bookmarks')
        .insert({ user_id: user.id, term_id: termId });
      
      setBookmarkedTermIds(prev => new Set([...prev, termId]));
    }
  };

  const categories = [
    { value: 'all', label: 'All Terms', count: terms.length },
    { value: 'tax', label: 'Tax', count: terms.filter(t => t.category === 'tax').length },
    { value: 'expenses', label: 'Expenses', count: terms.filter(t => t.category === 'expenses').length },
    { value: 'structure', label: 'Business Structure', count: terms.filter(t => t.category === 'structure').length },
    { value: 'dates', label: 'Important Dates', count: terms.filter(t => t.category === 'dates').length },
    { value: 'compliance', label: 'Compliance', count: terms.filter(t => t.category === 'compliance').length },
    { value: 'general', label: 'General', count: terms.filter(t => t.category === 'general').length },
  ];

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      tax: 'bg-red-500/10 text-red-700 dark:text-red-400',
      expenses: 'bg-green-500/10 text-green-700 dark:text-green-400',
      structure: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
      dates: 'bg-purple-500/10 text-purple-700 dark:text-purple-400',
      compliance: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
      general: 'bg-gray-500/10 text-gray-700 dark:text-gray-400',
    };
    return colors[category] || colors.general;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container max-w-6xl mx-auto px-4 py-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          
          <h1 className="text-4xl font-bold mb-2">Tax & Business Glossary</h1>
          <p className="text-muted-foreground">
            Simple explanations of tax and business terms. Bookmark your favorites for quick reference.
          </p>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
          <Input
            placeholder="Search terms, definitions, or synonyms..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 text-lg"
          />
        </div>

        {/* Category Tabs */}
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="mb-8">
          <TabsList className="w-full justify-start flex-wrap h-auto">
            {categories.map(cat => (
              <TabsTrigger key={cat.value} value={cat.value} className="gap-2">
                {cat.label}
                <Badge variant="secondary" className="ml-1">{cat.count}</Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {/* Results Count */}
        <p className="text-sm text-muted-foreground mb-4">
          Showing {filteredTerms.length} {filteredTerms.length === 1 ? 'term' : 'terms'}
        </p>

        {/* Terms List */}
        {isLoading ? (
          <div className="text-center py-12">Loading glossary...</div>
        ) : filteredTerms.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No terms found matching your search.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTerms.map(term => (
              <Card key={term.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold">{term.term}</h3>
                      <Badge className={getCategoryColor(term.category)}>
                        {term.category}
                      </Badge>
                    </div>
                    
                    <p className="text-lg text-foreground mb-3">
                      {term.simple_explanation}
                    </p>
                    
                    <p className="text-muted-foreground mb-4">
                      {term.definition}
                    </p>

                    {term.example && (
                      <div className="bg-muted/50 rounded-lg p-4 mb-3">
                        <p className="text-sm font-semibold mb-1">Example:</p>
                        <p className="text-sm">{term.example}</p>
                      </div>
                    )}

                    {term.synonyms && term.synonyms.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-sm text-muted-foreground">Also known as:</span>
                        {term.synonyms.map((syn, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {syn}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleBookmark(term.id)}
                    className={term.isBookmarked ? 'text-primary' : 'text-muted-foreground'}
                  >
                    <BookmarkIcon 
                      className="w-5 h-5" 
                      fill={term.isBookmarked ? 'currentColor' : 'none'}
                    />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Glossary;
