import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { PublicRoute } from "@/components/PublicRoute";
import Landing from "./pages/Landing";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Lesson from "./pages/Lesson";
import Pricing from "./pages/Pricing";
import Waitlist from "./pages/Waitlist";
import Chat from "./pages/Chat";
import Progress from "./pages/Progress";
import NotFound from "./pages/NotFound";
import Settings from "./pages/Settings";
import Community from "./pages/Community";
import CommunityQuestion from "./pages/CommunityQuestion";
import Newsletter from "./pages/Newsletter";
import Glossary from "./pages/Glossary";
import FirstDay from "./pages/FirstDay";
import Curriculum from "./pages/Curriculum";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotesLibrary from "./pages/NotesLibrary";
import FreeChecklist from "./pages/FreeChecklist";
import ExpenseSwiper from "./pages/ExpenseSwiper";
import MtdTrueFalse from "./pages/MtdTrueFalse";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/free-checklist" element={<FreeChecklist />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/waitlist" element={<Waitlist />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            
            {/* Auth routes - redirect to dashboard if already logged in */}
            <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            
            {/* Protected routes - require authentication */}
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/lesson/:id" element={<ProtectedRoute><Lesson /></ProtectedRoute>} />
            <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
            <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><Community /></ProtectedRoute>} />
            <Route path="/community/question/:id" element={<ProtectedRoute><CommunityQuestion /></ProtectedRoute>} />
            <Route path="/newsletter" element={<ProtectedRoute><Newsletter /></ProtectedRoute>} />
            <Route path="/glossary" element={<ProtectedRoute><Glossary /></ProtectedRoute>} />
            <Route path="/first-day" element={<ProtectedRoute><FirstDay /></ProtectedRoute>} />
            <Route path="/curriculum" element={<ProtectedRoute><Curriculum /></ProtectedRoute>} />
            <Route path="/notes" element={<ProtectedRoute><NotesLibrary /></ProtectedRoute>} />
            <Route path="/game/expense-swiper" element={<ProtectedRoute><ExpenseSwiper /></ProtectedRoute>} />
            <Route path="/game/mtd-true-false" element={<ProtectedRoute><MtdTrueFalse /></ProtectedRoute>} />
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
