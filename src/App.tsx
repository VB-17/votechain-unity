
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SupabaseAuthProvider } from "./context/SuperbaseAuthContext";
import { AuthProvider } from "./context/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import AdminSignup from "./pages/AdminSignup";
import Polls from "./pages/Polls";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import ElectionDetail from "./pages/ElectionDetail";
import AdminElectionDetail from "./pages/AdminElectionDetail";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <SupabaseAuthProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/admin-signup" element={<AdminSignup />} />
              <Route path="/polls" element={<Polls />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/elections/:id" element={<ElectionDetail />} />
              <Route path="/admin/elections/:id" element={<AdminElectionDetail />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </SupabaseAuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
