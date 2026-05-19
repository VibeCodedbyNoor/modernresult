import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import GlobalLanguageToggle from "@/components/GlobalLanguageToggle";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
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

const queryClient = new QueryClient();

function AppContent() {
  const location = useLocation();
  const isResultPortal = location.pathname.startsWith('/results/') || location.pathname.startsWith('/demo/');

  useEffect(() => {
    if (isResultPortal) {
      // Remove existing Noorify widget script
      const existingScript = document.querySelector('script[data-business-id="f9dc4584-70e3-4b42-b152-2758c93e4265"]');
      if (existingScript) existingScript.remove();
      // Remove any widget elements the script may have injected
      document.querySelectorAll('[id*="noorify"], [class*="noorify"], iframe[src*="noorify"]').forEach(el => el.remove());
    } else {
      // Inject the widget script if not already present
      const existingScript = document.querySelector('script[data-business-id="f9dc4584-70e3-4b42-b152-2758c93e4265"]');
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = 'https://noorify-always-on.lovable.app/widget.js';
        script.setAttribute('data-business-id', 'f9dc4584-70e3-4b42-b152-2758c93e4265');
        script.async = true;
        document.body.appendChild(script);
      }
    }
  }, [isResultPortal]);

  return (
    <>
      {!isResultPortal && <GlobalLanguageToggle />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/results/:slug" element={<ResultPortal />} />
        <Route path="/demo/:templateId" element={<DemoPortal />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/earn" element={<EarnWithUs />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/help" element={<Help />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/category/:slug" element={<BlogCategory />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
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
