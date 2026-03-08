import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("profiles").select("*").order("created_at", { ascending: false }).then(({ data }) => {
      setCustomers(data || []);
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="font-body text-muted-foreground">Loading...</div>;

  return (
    <div>
      <h2 className="font-display text-3xl font-light text-foreground mb-6">Customers</h2>
      <div className="border border-border bg-card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Name", "Phone", "City", "Joined"].map((h) => (
                <th key={h} className="text-left p-4 font-ui text-xs tracking-wider uppercase text-muted-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {customers.map((c) => (
              <tr key={c.id}>
                <td className="p-4 font-display text-sm text-foreground">{c.full_name || "—"}</td>
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
