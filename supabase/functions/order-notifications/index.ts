import "jsr:@supabase/functions-js/edge-runtime.d.ts";
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
    const { order_id, type } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch order with items
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("*, order_items:order_items(*)")
      .eq("id", order_id)
      .single();

    if (orderError || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch user email
    const { data: userData } = await supabase.auth.admin.getUserById(order.user_id);
    const email = userData?.user?.email;
    if (!email) {
      return new Response(JSON.stringify({ error: "User email not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Fetch profile for name
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("user_id", order.user_id)
      .maybeSingle();

    const customerName = profile?.full_name || "Valued Customer";

    // Create notification in database
    let notifTitle = "";
    let notifMessage = "";

    switch (type || "order_confirmed") {
      case "order_confirmed":
        notifTitle = "Order Confirmed! 🎉";
        notifMessage = `Your order #${order.order_number} has been confirmed. Total: ₹${Number(order.total).toLocaleString("en-IN")}. We'll start preparing your kurti right away!`;
        break;
      case "order_dispatched":
        notifTitle = "Order Dispatched! 📦";
        notifMessage = `Your order #${order.order_number} has been dispatched${order.tracking_number ? `. Tracking: ${order.tracking_number}` : ""}. It's on its way to you!`;
        break;
      case "order_delivered":
        notifTitle = "Order Delivered! ✨";
        notifMessage = `Your order #${order.order_number} has been delivered. We hope you love your Virasat kurti! Please leave a review.`;
        break;
      case "status_update":
        notifTitle = "Order Update";
        notifMessage = `Your order #${order.order_number} status has been updated to: ${order.status.replace(/_/g, " ").toUpperCase()}.`;
        break;
      default:
        notifTitle = "Order Update";
        notifMessage = `Update on your order #${order.order_number}.`;
    }

    // Insert notification
    await supabase.from("notifications").insert({
      user_id: order.user_id,
      title: notifTitle,
      message: notifMessage,
      type: "order",
      link: "/dashboard",
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: `Notification sent to ${customerName}`,
        notification: { title: notifTitle, message: notifMessage },
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
