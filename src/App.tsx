
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import ActivityLogPage from "./pages/ActivityLogPage";
import { AuthProvider, useAuth } from "./contexts/AuthContext";

const queryClient = new QueryClient();

// Componente para rotas protegidas
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  
  // Enquanto estiver carregando, exibir nada (ou spinner)
  if (loading) {
    return null;
  }
  
  // Se não estiver autenticado, redirecionar para login
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  // Se estiver autenticado, renderizar filho
  return <>{children}</>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/auth" element={<AuthPage />} />
    
    <Route path="/" element={
      <ProtectedRoute>
        <Index />
      </ProtectedRoute>
    } />
    
    <Route path="/profile" element={
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    } />
    
    <Route path="/activity" element={
      <ProtectedRoute>
        <ActivityLogPage />
      </ProtectedRoute>
    } />
    
    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
    <Route path="*" element={<NotFound />} />
  </Routes>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
