import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import logo from "@/assets/logo.png";

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast({ title: "Welcome back!", description: "Successfully logged in." });
        navigate("/");
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
        toast({ title: "Account created!", description: "Please check your email to verify your account." });
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
            {isLogin ? "Welcome Back" : "Join Virasat"}
          </h1>
          <p className="font-body text-muted-foreground mt-2">
            {isLogin ? "Sign in to your account" : "Create your account"}
          </p>
        </div>

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
          <Link to="/" className="font-ui text-xs tracking-wider uppercase text-muted-foreground hover:text-accent transition-colors">
            ← Back to Store
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
