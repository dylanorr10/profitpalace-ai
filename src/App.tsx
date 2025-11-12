import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/lesson/:id" element={<Lesson />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/waitlist" element={<Waitlist />} />
          <Route path="/chat" element={<Chat />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/community" element={<Community />} />
          <Route path="/community/question/:id" element={<CommunityQuestion />} />
          <Route path="/newsletter" element={<Newsletter />} />
          <Route path="/glossary" element={<Glossary />} />
          <Route path="/first-day" element={<FirstDay />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
