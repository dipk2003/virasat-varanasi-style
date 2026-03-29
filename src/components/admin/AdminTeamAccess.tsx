import { useEffect, useState } from "react";
import { ShieldCheck, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { AdminBootstrapSettings, AppRole, roleLabels, untypedDb } from "@/lib/commerce";

type TeamMember = {
  profileId: string;
  user_id: string;
  full_name: string | null;
  phone: string | null;
  city: string | null;
  created_at: string;
  roles: AppRole[];
};

const roleOrder: AppRole[] = ["user", "admin", "super_admin"];

const AdminTeamAccess = () => {
  const db = untypedDb;
  const { toast } = useToast();
  const { user } = useAuth();

  const [members, setMembers] = useState<TeamMember[]>([]);
  const [bootstrapSettings, setBootstrapSettings] = useState<AdminBootstrapSettings>({
    id: true,
    bootstrap_admin_email: "admin@example.com",
    bootstrap_super_admin_email: "owner@example.com",
    auto_assign_on_signup: true,
  });
  const [loading, setLoading] = useState(true);
  const [savingBootstrap, setSavingBootstrap] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);

    const [profilesRes, rolesRes, bootstrapRes] = await Promise.all([
      db.from("profiles").select("*").order("created_at", { ascending: false }),
      db.from("user_roles").select("user_id, role"),
      db.from("admin_bootstrap_settings").select("*").limit(1).maybeSingle(),
    ]);

    const rolesMap = new Map<string, AppRole[]>();
    ((rolesRes.data || []) as Array<{ user_id: string; role: AppRole }>).forEach((entry) => {
      rolesMap.set(entry.user_id, Array.from(new Set([...(rolesMap.get(entry.user_id) || []), entry.role])));
    });

    const nextMembers = ((profilesRes.data || []) as Array<{
      id: string;
      user_id: string;
      full_name: string | null;
      phone: string | null;
      city: string | null;
      created_at: string;
    }>).map((profile) => ({
      profileId: profile.id,
      user_id: profile.user_id,
      full_name: profile.full_name,
      phone: profile.phone,
      city: profile.city,
      created_at: profile.created_at,
      roles: rolesMap.get(profile.user_id) || [],
    }));

    setMembers(nextMembers);

    if (bootstrapRes.data) {
      setBootstrapSettings({
        id: true,
        bootstrap_admin_email: bootstrapRes.data.bootstrap_admin_email || "",
        bootstrap_super_admin_email: bootstrapRes.data.bootstrap_super_admin_email || "",
        auto_assign_on_signup: !!bootstrapRes.data.auto_assign_on_signup,
      });
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const saveBootstrapSettings = async () => {
    setSavingBootstrap(true);
    const { error } = await db.from("admin_bootstrap_settings").upsert(
      {
        id: true,
        bootstrap_admin_email: bootstrapSettings.bootstrap_admin_email || null,
        bootstrap_super_admin_email: bootstrapSettings.bootstrap_super_admin_email || null,
        auto_assign_on_signup: bootstrapSettings.auto_assign_on_signup,
      },
      { onConflict: "id" }
    );
    setSavingBootstrap(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Bootstrap access emails updated" });
    fetchData();
  };

  const setUserRole = async (targetUserId: string, targetRole: AppRole) => {
    if (user?.id === targetUserId && targetRole !== "super_admin") {
      toast({
        title: "Action blocked",
        description: "Apna khud ka super admin access yahan se remove mat karo.",
        variant: "destructive",
      });
      return;
    }

    setUpdatingUserId(targetUserId);

    const { error: insertError } = await db
      .from("user_roles")
      .upsert(
        [{ user_id: targetUserId, role: targetRole }],
        { onConflict: "user_id,role" }
      );

    if (insertError) {
      setUpdatingUserId(null);
      toast({ title: "Error", description: insertError.message, variant: "destructive" });
      return;
    }

    const { error: deleteError } = await db
      .from("user_roles")
      .delete()
      .eq("user_id", targetUserId)
      .neq("role", targetRole);

    setUpdatingUserId(null);

    if (deleteError) {
      toast({ title: "Error", description: deleteError.message, variant: "destructive" });
      return;
    }

    toast({ title: "Access updated" });
    fetchData();
  };

  if (loading) return <div className="font-body text-muted-foreground">Loading team access...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-3xl font-light text-foreground">Team & Platform Access</h2>
        <p className="font-body text-sm text-muted-foreground mt-2">
          Yahan se bootstrap emails aur user roles control honge. Admin aur super admin dono multiple ho sakte hain.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[360px,1fr] gap-6">
        <div className="border border-border bg-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck size={20} className="text-accent" />
            <h3 className="font-display text-xl text-foreground">Bootstrap Emails</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="font-ui text-xs tracking-wider uppercase text-muted-foreground block mb-2">Auto Admin Email</label>
              <input
                type="email"
                value={bootstrapSettings.bootstrap_admin_email || ""}
                onChange={(event) =>
                  setBootstrapSettings((current) => ({ ...current, bootstrap_admin_email: event.target.value }))
                }
                className="w-full px-4 py-3 bg-background border border-border font-body text-foreground focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="font-ui text-xs tracking-wider uppercase text-muted-foreground block mb-2">Auto Super Admin Email</label>
              <input
                type="email"
                value={bootstrapSettings.bootstrap_super_admin_email || ""}
                onChange={(event) =>
                  setBootstrapSettings((current) => ({ ...current, bootstrap_super_admin_email: event.target.value }))
                }
                className="w-full px-4 py-3 bg-background border border-border font-body text-foreground focus:outline-none focus:border-accent"
              />
            </div>
            <label className="flex items-center gap-3 font-body text-sm text-foreground">
              <input
                type="checkbox"
                checked={bootstrapSettings.auto_assign_on_signup}
                onChange={(event) =>
                  setBootstrapSettings((current) => ({ ...current, auto_assign_on_signup: event.target.checked }))
                }
              />
              Auto assign elevated roles on signup
            </label>

            <button
              type="button"
              onClick={saveBootstrapSettings}
              disabled={savingBootstrap}
              className="px-5 py-3 bg-accent text-accent-foreground font-ui text-xs tracking-[0.2em] uppercase disabled:opacity-50"
            >
              {savingBootstrap ? "Saving..." : "Save Bootstrap Rules"}
            </button>
          </div>
        </div>

        <div className="border border-border bg-card overflow-x-auto">
          <div className="p-6 border-b border-border flex items-center gap-3">
            <Users size={20} className="text-accent" />
            <div>
              <h3 className="font-display text-xl text-foreground">Role Management</h3>
              <p className="font-body text-sm text-muted-foreground">
                Existing signed-up users ko customer, admin, ya super admin bana sakte ho.
              </p>
            </div>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Member", "Current Access", "Location", "Joined", "Actions"].map((heading) => (
                  <th key={heading} className="text-left p-4 font-ui text-xs tracking-wider uppercase text-muted-foreground">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {members.map((member) => (
                <tr key={member.profileId}>
                  <td className="p-4">
                    <p className="font-display text-sm text-foreground">{member.full_name || "Unnamed user"}</p>
                    <p className="font-body text-xs text-muted-foreground">{member.phone || member.user_id}</p>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {member.roles.length > 0 ? (
                        member.roles
                          .slice()
                          .sort((a, b) => roleOrder.indexOf(a) - roleOrder.indexOf(b))
                          .map((role) => (
                            <span key={role} className="px-2 py-1 bg-accent/10 text-accent font-ui text-[10px] tracking-wider uppercase">
                              {roleLabels[role]}
                            </span>
                          ))
                      ) : (
                        <span className="font-body text-xs text-muted-foreground">No role assigned</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 font-body text-sm text-muted-foreground">{member.city || "—"}</td>
                  <td className="p-4 font-body text-sm text-muted-foreground">{new Date(member.created_at).toLocaleDateString("en-IN")}</td>
                  <td className="p-4">
                    <div className="flex flex-wrap gap-2">
                      {roleOrder.map((role) => (
                        <button
                          key={role}
                          type="button"
                          onClick={() => setUserRole(member.user_id, role)}
                          disabled={updatingUserId === member.user_id}
                          className={`px-3 py-2 font-ui text-[10px] tracking-wider uppercase border ${
                            member.roles.includes(role)
                              ? "border-accent bg-accent/10 text-accent"
                              : "border-border text-muted-foreground"
                          }`}
                        >
                          {roleLabels[role]}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {members.length === 0 && (
            <p className="p-8 text-center font-body text-muted-foreground">No users available yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTeamAccess;
