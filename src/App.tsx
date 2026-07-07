import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import GlobalLanguageToggle from "@/components/GlobalLanguageToggle";
import AIChatWidget from "@/components/AIChatWidget";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Billing from "./pages/Billing";
import ResultPortal from "./pages/ResultPortal";
import DemoPortal from "./pages/DemoPortal";
import AdminDashboard from "./pages/AdminDashboard";
import EarnWithUs from "./pages/EarnWithUs";
import Terms from "./pages/Terms";
import Help from "./pages/Help";
import NotFound from "./pages/NotFound";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import BlogCategory from "./pages/BlogCategory";
import FAQ from "./pages/FAQ";

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const isResultPortal = location.pathname.startsWith('/results/') || location.pathname.startsWith('/demo/');

  return (
    <>
      {!isResultPortal && <GlobalLanguageToggle />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/billing" element={<Billing />} />
        <Route path="/results/:slug" element={<ResultPortal />} />
        <Route path="/demo/:templateId" element={<DemoPortal />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/earn" element={<EarnWithUs />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/help" element={<Help />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/category/:slug" element={<BlogCategory />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      {!isResultPortal && <AIChatWidget />}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <LanguageProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AuthProvider>
              <AppContent />
            </AuthProvider>
          </BrowserRouter>
        </TooltipProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
