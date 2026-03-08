import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const UserProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("*").eq("user_id", user.id).single().then(({ data }) => {
      setProfile(data);
      setLoading(false);
    });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("profiles").update({
      full_name: profile.full_name,
      phone: profile.phone,
      address_line1: profile.address_line1,
      address_line2: profile.address_line2,
      city: profile.city,
      state: profile.state,
      pincode: profile.pincode,
    }).eq("user_id", user!.id);
    setSaving(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Profile updated!", description: "Your changes have been saved." });
    }
  };

  if (loading) return <div className="font-body text-muted-foreground">Loading...</div>;

  const fields = [
    { key: "full_name", label: "Full Name", type: "text" },
    { key: "phone", label: "Phone", type: "tel" },
    { key: "address_line1", label: "Address Line 1", type: "text" },
    { key: "address_line2", label: "Address Line 2", type: "text" },
    { key: "city", label: "City", type: "text" },
    { key: "state", label: "State", type: "text" },
    { key: "pincode", label: "Pincode", type: "text" },
  ];

  return (
    <div>
      <h2 className="font-display text-2xl font-light text-foreground mb-6">My Profile</h2>
      <form onSubmit={handleSave} className="max-w-lg space-y-4">
        {fields.map((f) => (
          <div key={f.key}>
            <label className="font-ui text-xs tracking-wider uppercase text-muted-foreground block mb-2">{f.label}</label>
            <input
              type={f.type}
              value={profile?.[f.key] || ""}
              onChange={(e) => setProfile({ ...profile, [f.key]: e.target.value })}
              className="w-full px-4 py-3 bg-card border border-border font-body text-foreground focus:outline-none focus:border-accent transition-colors"
            />
          </div>
        ))}
        <button type="submit" disabled={saving} className="px-8 py-3 bg-accent text-accent-foreground font-ui text-sm tracking-[0.2em] uppercase hover:bg-gold-dark transition-colors disabled:opacity-50">
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default UserProfile;
