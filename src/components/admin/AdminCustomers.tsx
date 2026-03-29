import { useEffect, useState } from "react";
import { roleLabels, AppRole, untypedDb } from "@/lib/commerce";
import { useAuth } from "@/contexts/AuthContext";

const AdminCustomers = () => {
  const db = untypedDb;
  const { isSuperAdmin } = useAuth();
  const [customers, setCustomers] = useState<Array<{
    id: string;
    user_id: string;
    full_name: string | null;
    phone: string | null;
    city: string | null;
    created_at: string;
    roles: AppRole[];
    orders: number;
    inquiries: number;
  }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCustomers = async () => {
      const [profiles, roles, orders, inquiries] = await Promise.all([
        db.from("profiles").select("*").order("created_at", { ascending: false }),
        db.from("user_roles").select("user_id, role"),
        db.from("orders").select("id, user_id"),
        db.from("custom_designs").select("id, user_id"),
      ]);

      const roleMap = new Map<string, AppRole[]>();
      ((roles.data || []) as Array<{ user_id: string; role: AppRole }>).forEach((entry) => {
        roleMap.set(entry.user_id, Array.from(new Set([...(roleMap.get(entry.user_id) || []), entry.role])));
      });

      const orderMap = new Map<string, number>();
      (orders.data || []).forEach((entry) => {
        orderMap.set(entry.user_id, (orderMap.get(entry.user_id) || 0) + 1);
      });

      const inquiryMap = new Map<string, number>();
      (inquiries.data || []).forEach((entry) => {
        inquiryMap.set(entry.user_id, (inquiryMap.get(entry.user_id) || 0) + 1);
      });

      setCustomers(
        ((profiles.data || []) as Array<{ id: string; user_id: string; full_name: string | null; phone: string | null; city: string | null; created_at: string }>).map((profile) => ({
          ...profile,
          roles: roleMap.get(profile.user_id) || [],
          orders: orderMap.get(profile.user_id) || 0,
          inquiries: inquiryMap.get(profile.user_id) || 0,
        }))
      );
      setLoading(false);
    };

    fetchCustomers();
  }, []);

  if (loading) return <div className="font-body text-muted-foreground">Loading...</div>;

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-display text-3xl font-light text-foreground">Customers</h2>
        <p className="font-body text-sm text-muted-foreground mt-2">
          Customers, inquiry activity, and access visibility ek hi jagah. {isSuperAdmin ? "Detailed role control Team & Platform tab me milega." : "Role changes super admin handle karega."}
        </p>
      </div>
      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Name", "Role", "Orders", "Inquiries", "Phone", "City", "Joined"].map((h) => (
                <th key={h} className="text-left p-4 font-ui text-xs tracking-wider uppercase text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.map((c) => (
              <tr key={c.id}>
                <td className="p-4 font-display text-sm text-foreground">{c.full_name || "—"}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {c.roles.length > 0 ? (
                      c.roles.map((role) => (
                        <span key={role} className="px-2 py-1 bg-accent/10 text-accent font-ui text-[10px] tracking-wider uppercase">
                          {roleLabels[role]}
                        </span>
                      ))
                    ) : (
                      <span className="font-body text-xs text-muted-foreground">No role assigned</span>
                    )}
                  </div>
                </td>
                <td className="p-4 font-body text-sm text-muted-foreground">{c.orders}</td>
                <td className="p-4 font-body text-sm text-muted-foreground">{c.inquiries}</td>
                <td className="p-4 font-body text-sm text-muted-foreground">{c.phone || "—"}</td>
                <td className="p-4 font-body text-sm text-muted-foreground">{c.city || "—"}</td>
                <td className="p-4 font-body text-sm text-muted-foreground">
                  {new Date(c.created_at).toLocaleDateString("en-IN")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && <p className="p-8 text-center font-body text-muted-foreground">No customers yet</p>}
      </div>
    </div>
  );
};

export default AdminCustomers;
