import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/Navbar";
import Login from "@/pages/Login";
import Home from "@/pages/Home";
import Config from "@/pages/Config";
import Review from "@/pages/Review";
import ExamReview from "@/pages/ExamReview";
import Results from "@/pages/Results";
import Library from "@/pages/Library";
import Progress from "@/pages/Progress";
import EditCard from "@/pages/EditCard";
import ResetPassword from "@/pages/ResetPassword";
import ForgotPassword from "@/pages/ForgotPassword";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-transparent border-t-primary animate-spin-slow" />
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="*" element={<Login />} />
      </Routes>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/config" element={<Config />} />
        <Route path="/review" element={<Review />} />
        <Route path="/exam" element={<ExamReview />} />
        <Route path="/results" element={<Results />} />
        <Route path="/library" element={<Library />} />
        <Route path="/progress" element={<Progress />} />
        <Route path="/edit" element={<EditCard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
      <SpeedInsights />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
