import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppRole } from "@/lib/commerce";
import logo from "@/assets/logo.png";

type AuthLocationState = {
  redirectTo?: string;
  requiresAdmin?: boolean;
};

type PortalMode = "customer" | "admin" | "super-admin";

const AuthPage = ({ portal = "customer" }: { portal?: PortalMode }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const redirectTo = (location.state as AuthLocationState | null)?.redirectTo;
  const requiresAdmin = (location.state as AuthLocationState | null)?.requiresAdmin;
  const isAdminPortal = portal === "admin";
  const isSuperAdminPortal = portal === "super-admin";
  const isBusinessPortal = isAdminPortal || isSuperAdminPortal;

  const resolveRoles = async (userId: string) => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    return ((data || []) as Array<{ role: AppRole | null }>)
      .map((entry) => entry.role)
      .filter((role): role is AppRole => role === "user" || role === "admin" || role === "super_admin");
  };

  const buildNextRoute = (roles: AppRole[]) => {
    const isSuperAdmin = roles.includes("super_admin");
    const isAdmin = roles.includes("admin");
    const hasAdminAccess = isAdmin || isSuperAdmin;

    if (redirectTo) {
      if (redirectTo.startsWith("/admin") && !hasAdminAccess) {
        return "/shop";
      }

      if ((redirectTo.startsWith("/super-admin") || redirectTo.startsWith("/superadmin")) && !isSuperAdmin) {
        return hasAdminAccess ? "/admin" : "/shop";
      }

      return redirectTo;
    }

    if (isSuperAdminPortal) {
      return isSuperAdmin ? "/super-admin" : isAdmin ? "/admin" : "/shop";
    }

    if (isAdminPortal) {
      return isSuperAdmin ? "/super-admin" : isAdmin ? "/admin" : "/shop";
    }

    return isSuperAdmin ? "/super-admin" : isAdmin ? "/admin" : "/shop";
  };

  const handleGoogleAuth = async () => {
    setLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${redirectTo || (isSuperAdminPortal ? "/super-admin" : isAdminPortal ? "/admin" : "/shop")}`,
        queryParams: {
          prompt: "select_account",
        },
      },
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        const signedInUser = data.user ?? data.session?.user;
        const roles = signedInUser ? await resolveRoles(signedInUser.id) : [];
        const nextRoute = buildNextRoute(roles);

        toast({ title: "Welcome back!", description: "Successfully logged in." });
        navigate(nextRoute, { replace: true });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
            emailRedirectTo: window.location.origin,
          },
        });
        if (error) throw error;
        toast({
          title: "Account created!",
          description: requiresAdmin
            ? "Admin or super-admin signup submitted. Verify the email, then sign in to continue."
            : "Please check your email to verify your account, then continue shopping.",
        });
        setIsLogin(true);
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Link to="/">
            <img src={logo} alt="Virasat" className="h-20 w-auto mx-auto mb-4" />
          </Link>
          <h1 className="font-display text-3xl font-light text-foreground">
            {isSuperAdminPortal ? (isLogin ? "Super Admin Access" : "Create Super Admin Access") : isAdminPortal ? (isLogin ? "Admin Access" : "Create Admin Access") : isLogin ? "Welcome Back" : "Join Virasat"}
          </h1>
          <p className="font-body text-muted-foreground mt-2">
            {isSuperAdminPortal
              ? "Sign in to the platform owner console"
              : isAdminPortal
                ? "Sign in to the operations console"
                : isLogin
                  ? "Sign in to your account"
                  : "Create your account"}
          </p>
          {requiresAdmin && (
            <p className="mt-4 border border-accent/30 bg-accent/10 px-4 py-3 text-sm font-body text-foreground">
              {isSuperAdminPortal
                ? "Super admin console protected hai. Pehle super admin account se sign in karo, ya bootstrap super admin email se sign up karke verify karo."
                : "Admin panel protected hai. Pehle admin account se sign in karo. Agar pehli baar setup kar rahe ho, bootstrap admin ya super-admin email se sign up karke verify karo, phir wapas yahin sign in karo."}
            </p>
          )}
        </div>

        {!isBusinessPortal && (
          <div className="space-y-3 mb-4">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full py-3 border border-border bg-card text-foreground font-ui text-sm tracking-[0.12em] uppercase hover:border-accent transition-colors disabled:opacity-50"
            >
              Continue With Google
            </button>
            <p className="text-center font-ui text-[10px] tracking-[0.2em] uppercase text-muted-foreground">
              Or continue with email
            </p>
          </div>
        )}

        {isBusinessPortal && (
          <div className="mb-4 border border-border bg-card px-4 py-3 text-center">
            <p className="font-ui text-[10px] tracking-[0.18em] uppercase text-muted-foreground">
              Business portal access via email and password only
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="font-ui text-xs tracking-wider uppercase text-muted-foreground block mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-3 bg-card border border-border font-body text-foreground focus:outline-none focus:border-accent transition-colors"
                required
              />
            </div>
          )}

          <div>
            <label className="font-ui text-xs tracking-wider uppercase text-muted-foreground block mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 bg-card border border-border font-body text-foreground focus:outline-none focus:border-accent transition-colors"
              required
            />
          </div>

          <div>
            <label className="font-ui text-xs tracking-wider uppercase text-muted-foreground block mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-card border border-border font-body text-foreground focus:outline-none focus:border-accent transition-colors"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-accent text-accent-foreground font-ui text-sm tracking-[0.2em] uppercase hover:bg-gold-dark transition-colors disabled:opacity-50"
          >
            {loading ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
          </button>
        </form>

        <p className="text-center mt-6 font-body text-muted-foreground">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-accent hover:underline font-medium"
          >
            {isLogin ? "Sign up" : "Sign in"}
          </button>
        </p>

        <div className="text-center mt-4">
          <div className="space-y-2">
            {(isAdminPortal || isSuperAdminPortal) && (
              <Link
                to="/auth"
                state={{ redirectTo: redirectTo || "/shop" }}
                className="block font-ui text-xs tracking-wider uppercase text-muted-foreground hover:text-accent transition-colors"
              >
                Customer Login
              </Link>
            )}
            {isSuperAdminPortal && (
              <Link
                to="/admin/login"
                state={{ redirectTo: redirectTo || "/admin", requiresAdmin: true }}
                className="block font-ui text-xs tracking-wider uppercase text-muted-foreground hover:text-accent transition-colors"
              >
                Admin Login
              </Link>
            )}
            {isAdminPortal && (
              <Link
                to="/superadmin"
                state={{ redirectTo: redirectTo || "/super-admin", requiresAdmin: true }}
                className="block font-ui text-xs tracking-wider uppercase text-muted-foreground hover:text-accent transition-colors"
              >
                Super Admin Login
              </Link>
            )}
            <Link to="/" className="block font-ui text-xs tracking-wider uppercase text-muted-foreground hover:text-accent transition-colors">
              ← Back to Store
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
