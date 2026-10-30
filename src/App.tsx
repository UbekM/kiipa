import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// Pages
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import CreateKeep from "./pages/CreateKeep";
import KeepDetails from "./pages/KeepDetails";
import KeepReveal from "./pages/KeepReveal";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import FallbackClaim from "./pages/FallbackClaim";
import Documentation from "./pages/Documentation";

const queryClient = new QueryClient();

function AppRoutes() {
  const location = useLocation();
  const isSplash = location.pathname === "/";

  const FooterLinks = () => (
    <footer className="app-footer-bar flex justify-center">
      <nav className="app-footer-inner" aria-label="App links">
        <a href="/fallback-claim" className="app-footer-link">
          Fallback claim
        </a>
        <span className="text-border" aria-hidden>
          ·
        </span>
        <a href="/documentation" className="app-footer-link">
          Documentation
        </a>
      </nav>
    </footer>
  );

  return (
    <>
      <Routes>
        {/* Main routes */}
        <Route
          path="/"
          element={
            <Onboarding
            // If your logo/icon is inside Onboarding, pass a prop or use context to handle click:
            // Example: <img src="logo.png" onClick={() => navigate('/dashboard')} />
            />
          }
        />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/create" element={<CreateKeep />} />
        <Route path="/keep/:id" element={<KeepDetails />} />
        <Route path="/keep/:id/reveal" element={<KeepReveal />} />
        <Route path="/keep/:id/edit" element={<CreateKeep />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/fallback-claim" element={<FallbackClaim />} />
        <Route path="/documentation" element={<Documentation />} />
        {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      {/* Show footer links on all pages except splash */}
      {!isSplash && <FooterLinks />}
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
