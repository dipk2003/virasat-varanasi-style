import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { AppRole } from "@/lib/commerce";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roles: AppRole[];
  isCustomer: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  roles: [],
  isCustomer: false,
  isAdmin: false,
  isSuperAdmin: false,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [rolesLoading, setRolesLoading] = useState(true);
  const [roles, setRoles] = useState<AppRole[]>([]);

  useEffect(() => {
    let active = true;

    const applySession = (nextSession: Session | null) => {
      if (!active) return;

      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setRolesLoading(Boolean(nextSession?.user));
      setAuthLoading(false);
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      // Avoid additional Supabase queries inside the auth callback to prevent
      // lock contention in browsers using the Web Locks API for auth storage.
      applySession(nextSession);
    });

    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        applySession(session);
      })
      .catch(() => {
        applySession(null);
      });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadRoles = async () => {
      if (!user?.id) {
        setRoles([]);
        setRolesLoading(false);
        return;
      }

      setRolesLoading(true);

      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id);

      if (!active) return;

      if (error) {
        setRoles([]);
        setRolesLoading(false);
        return;
      }

      const nextRoles = Array.from(
        new Set(
          ((data || []) as Array<{ role: AppRole | null }>)
            .map((entry) => entry.role)
            .filter((role): role is AppRole => role === "user" || role === "admin" || role === "super_admin")
        )
      );

      setRoles(nextRoles);
      setRolesLoading(false);
    };

    void loadRoles();

    return () => {
      active = false;
    };
  }, [user?.id]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const loading = authLoading || rolesLoading;
  const isCustomer = roles.includes("user");
  const isSuperAdmin = roles.includes("super_admin");
  const isAdmin = isSuperAdmin || roles.includes("admin");

  return (
    <AuthContext.Provider value={{ user, session, loading, roles, isCustomer, isAdmin, isSuperAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
