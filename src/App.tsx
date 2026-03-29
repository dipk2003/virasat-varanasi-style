import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import UserDashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import ProductEditorPage from "./pages/ProductEditorPage";
import ProductListing from "./pages/ProductListing";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const LoadingScreen = () => (
  <div className="min-h-screen flex items-center justify-center font-body text-muted-foreground">Loading...</div>
);

const CustomerRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isCustomer, isAdmin, isSuperAdmin } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/auth" replace state={{ redirectTo: `${location.pathname}${location.search}` }} />;
  if (!isCustomer) {
    return <Navigate to={isSuperAdmin ? "/super-admin" : isAdmin ? "/admin" : "/shop"} replace state={{ deniedCustomer: true }} />;
  }
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAdmin, isCustomer } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingScreen />;
  if (!user) {
    return <Navigate to="/admin/login" replace state={{ redirectTo: `${location.pathname}${location.search}`, requiresAdmin: true }} />;
  }
  if (!isAdmin) return <Navigate to={isCustomer ? "/dashboard" : "/shop"} replace state={{ deniedAdmin: true }} />;
  return <>{children}</>;
};

const SuperAdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isSuperAdmin, isAdmin, isCustomer } = useAuth();
  const location = useLocation();
  if (loading) return <LoadingScreen />;
  if (!user) {
    return <Navigate to="/superadmin" replace state={{ redirectTo: `${location.pathname}${location.search}`, requiresAdmin: true }} />;
  }
  if (!isSuperAdmin) return <Navigate to={isAdmin ? "/admin" : isCustomer ? "/dashboard" : "/shop"} replace />;
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <AnimatePresence mode="wait">
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage portal="customer" />} />
                <Route path="/admin/login" element={<AuthPage portal="admin" />} />
                <Route path="/superadmin" element={<AuthPage portal="super-admin" />} />
                <Route path="/super-admin/login" element={<Navigate to="/superadmin" replace />} />
                <Route path="/shop" element={<ProductListing />} />
                <Route path="/product/:slug" element={<ProductDetail />} />
                <Route path="/checkout" element={<CustomerRoute><Checkout /></CustomerRoute>} />
                <Route path="/dashboard" element={<CustomerRoute><UserDashboard /></CustomerRoute>} />
                <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
                <Route path="/admin/products/new" element={<AdminRoute><ProductEditorPage portal="admin" /></AdminRoute>} />
                <Route path="/admin/products/:productId/edit" element={<AdminRoute><ProductEditorPage portal="admin" /></AdminRoute>} />
                <Route path="/super-admin" element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>} />
                <Route path="/super-admin/products/new" element={<SuperAdminRoute><ProductEditorPage portal="super-admin" /></SuperAdminRoute>} />
                <Route path="/super-admin/products/:productId/edit" element={<SuperAdminRoute><ProductEditorPage portal="super-admin" /></SuperAdminRoute>} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AnimatePresence>
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
