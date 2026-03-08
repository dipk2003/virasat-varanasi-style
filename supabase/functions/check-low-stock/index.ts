import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Find products where stock is at or below threshold
    const { data: lowStockProducts, error: productsError } = await supabase
      .from("products")
      .select("id, name, stock_quantity, low_stock_threshold")
      .filter("is_active", "eq", true);

    if (productsError) throw productsError;

    const alerts = (lowStockProducts || []).filter(
      (p) => p.stock_quantity <= p.low_stock_threshold
    );

    if (alerts.length === 0) {
      return new Response(JSON.stringify({ message: "No low stock items", count: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get all admin user IDs
    const { data: adminRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("user_id")
      .eq("role", "admin");

    if (rolesError) throw rolesError;

    const adminIds = (adminRoles || []).map((r) => r.user_id);

    if (adminIds.length === 0) {
      return new Response(JSON.stringify({ message: "No admins to notify", count: alerts.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create notification for each admin
    const outOfStock = alerts.filter((p) => p.stock_quantity === 0);
    const lowStock = alerts.filter((p) => p.stock_quantity > 0);

    const title = `⚠️ Stock Alert: ${alerts.length} product(s) need attention`;
    const lines: string[] = [];

    if (outOfStock.length > 0) {
      lines.push(`🔴 Out of stock (${outOfStock.length}): ${outOfStock.map((p) => p.name).join(", ")}`);
    }
    if (lowStock.length > 0) {
      lines.push(`🟡 Low stock (${lowStock.length}): ${lowStock.map((p) => `${p.name} (${p.stock_quantity} left)`).join(", ")}`);
    }

    const message = lines.join("\n");

    const notifications = adminIds.map((user_id) => ({
      user_id,
      title,
      message,
      type: "stock_alert",
      link: "/admin",
    }));

    const { error: notifError } = await supabase.from("notifications").insert(notifications);
    if (notifError) throw notifError;

    return new Response(
      JSON.stringify({
        message: `Notified ${adminIds.length} admin(s) about ${alerts.length} low stock product(s)`,
        alerts: alerts.map((p) => ({ name: p.name, stock: p.stock_quantity, threshold: p.low_stock_threshold })),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
