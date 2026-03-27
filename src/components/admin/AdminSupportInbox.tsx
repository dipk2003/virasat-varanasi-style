import { useEffect, useMemo, useState } from "react";
import { Headset, Send, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  SupportMessage,
  SupportTicket,
  TicketPriority,
  TicketStatus,
  isMissingRelationError,
  untypedDb,
} from "@/lib/commerce";

type ProfileSnippet = {
  user_id: string;
  full_name: string | null;
  phone: string | null;
};

type ProductSnippet = {
  id: string;
  name: string;
};

const statusOptions: TicketStatus[] = ["open", "in_progress", "waiting_for_customer", "resolved", "closed"];
const priorityOptions: TicketPriority[] = ["low", "medium", "high", "urgent"];

const AdminSupportInbox = () => {
  const db = untypedDb;
  const { user, isSuperAdmin } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [profiles, setProfiles] = useState<ProfileSnippet[]>([]);
  const [products, setProducts] = useState<ProductSnippet[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingTicket, setSavingTicket] = useState(false);
  const [sendingReply, setSendingReply] = useState(false);
  const [reply, setReply] = useState("");
  const [relationReady, setRelationReady] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, { status: TicketStatus; priority: TicketPriority }>>({});

  const profilesByUserId = useMemo(
    () =>
      profiles.reduce<Record<string, ProfileSnippet>>((acc, profile) => {
        acc[profile.user_id] = profile;
        return acc;
      }, {}),
    [profiles]
  );

  const productsById = useMemo(
    () =>
      products.reduce<Record<string, ProductSnippet>>((acc, product) => {
        acc[product.id] = product;
        return acc;
      }, {}),
    [products]
  );

  const fetchBaseData = async () => {
    const [ticketRes, profileRes, productRes] = await Promise.all([
      db
        .from("support_tickets")
        .select("*")
        .order("last_message_at", { ascending: false })
        .order("created_at", { ascending: false }),
      db.from("profiles").select("user_id, full_name, phone"),
      db.from("products").select("id, name").order("created_at", { ascending: false }).limit(200),
    ]);

    if (ticketRes.error) {
      if (isMissingRelationError(ticketRes.error)) {
        setRelationReady(false);
      } else {
        toast({ title: "Error", description: ticketRes.error.message, variant: "destructive" });
      }
      setLoading(false);
      return;
    }

    const nextTickets = (ticketRes.data || []) as SupportTicket[];
    setRelationReady(true);
    setTickets(nextTickets);
    setProfiles((profileRes.data || []) as ProfileSnippet[]);
    setProducts((productRes.data || []) as ProductSnippet[]);
    setActiveTicketId((current) => {
      if (current && nextTickets.some((ticket) => ticket.id === current)) return current;
      return nextTickets[0]?.id || null;
    });
    setLoading(false);
  };

  const fetchMessages = async (ticketId: string) => {
    const { data, error } = await db
      .from("support_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at", { ascending: true });

    if (error) {
      if (!isMissingRelationError(error)) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
      return;
    }

    setMessages((data || []) as SupportMessage[]);
  };

  useEffect(() => {
    void fetchBaseData();
  }, []);

  useEffect(() => {
    if (!activeTicketId) {
      setMessages([]);
      return;
    }

    void fetchMessages(activeTicketId);
  }, [activeTicketId]);

  useEffect(() => {
    if (!relationReady) return;

    const channel = supabase.channel(`admin-support-${activeTicketId || "none"}`);

    channel.on("postgres_changes", { event: "*", schema: "public", table: "support_tickets" }, () => {
      void fetchBaseData();
    });

    if (activeTicketId) {
      channel.on(
        "postgres_changes",
        { event: "*", schema: "public", table: "support_messages", filter: `ticket_id=eq.${activeTicketId}` },
        () => void fetchMessages(activeTicketId)
      );
    }

    channel.subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [activeTicketId, relationReady]);

  const activeTicket = tickets.find((ticket) => ticket.id === activeTicketId) || null;
  const activeDraft = activeTicket
    ? drafts[activeTicket.id] || { status: activeTicket.status, priority: activeTicket.priority }
    : null;

  const saveTicket = async () => {
    if (!activeTicket || !activeDraft) return;

    setSavingTicket(true);
    const { error } = await db
      .from("support_tickets")
      .update({
        status: activeDraft.status,
        priority: activeDraft.priority,
        assigned_to: user?.id || null,
      })
      .eq("id", activeTicket.id);

    setSavingTicket(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "Support ticket updated" });
    await fetchBaseData();
  };

  const sendReply = async () => {
    if (!activeTicket || !user || !reply.trim()) return;

    setSendingReply(true);
    const { error } = await db.from("support_messages").insert({
      ticket_id: activeTicket.id,
      sender_id: user.id,
      sender_role: isSuperAdmin ? "super_admin" : "admin",
      message: reply.trim(),
    });

    if (!error) {
      await db
        .from("support_tickets")
        .update({
          status: "waiting_for_customer",
          assigned_to: user.id,
        })
        .eq("id", activeTicket.id);
    }

    setSendingReply(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setReply("");
    await fetchMessages(activeTicket.id);
    await fetchBaseData();
  };

  if (loading) return <div className="font-body text-muted-foreground">Loading support inbox...</div>;

  if (!relationReady) {
    return (
      <div className="rounded-[24px] border border-border bg-card p-6">
        <h2 className="font-display text-2xl text-foreground">Support Inbox</h2>
        <p className="mt-3 font-body text-sm leading-7 text-muted-foreground">
          Support inbox UI ready hai, but support chat migration abhi DB me apply nahi hui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-border bg-card p-6">
        <p className="font-ui text-[10px] tracking-[0.24em] uppercase text-accent">Support Inbox</p>
        <h2 className="mt-3 font-display text-3xl text-foreground">Customer Conversations</h2>
        <p className="mt-3 max-w-3xl font-body text-sm leading-7 text-muted-foreground">
          Product queries, delivery issues, aur after-sales support threads yahin live handle honge.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-[360px,minmax(0,1fr)]">
        <div className="rounded-[24px] border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent">
              <Headset size={18} />
            </div>
            <div>
              <p className="font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">Active Threads</p>
              <h3 className="mt-1 font-display text-2xl text-foreground">Support Tickets</h3>
            </div>
          </div>

          <div className="mt-5 space-y-3">
            {tickets.length === 0 ? (
              <p className="font-body text-sm text-muted-foreground">No support chats yet.</p>
            ) : (
              tickets.map((ticket) => {
                const profile = ticket.user_id ? profilesByUserId[ticket.user_id] : null;
                return (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => setActiveTicketId(ticket.id)}
                    className={`w-full rounded-[20px] border p-4 text-left ${
                      activeTicketId === ticket.id
                        ? "border-accent/30 bg-accent/5"
                        : "border-border bg-background/40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-lg text-foreground">{ticket.subject}</p>
                        <p className="mt-1 font-body text-sm text-muted-foreground">
                          {profile?.full_name || "Customer"} • {productsById[ticket.product_id || ""]?.name || "General"}
                        </p>
                      </div>
                      <span className="rounded-full border border-border px-2 py-1 font-ui text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
                        {ticket.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="mt-3 font-ui text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
                      {new Date(ticket.last_message_at || ticket.updated_at).toLocaleString("en-IN")}
                    </p>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-border bg-card p-5">
          {activeTicket && activeDraft ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
                <div>
                  <p className="font-ui text-[10px] tracking-[0.22em] uppercase text-accent">Live Thread</p>
                  <h3 className="mt-2 font-display text-3xl text-foreground">{activeTicket.subject}</h3>
                  <p className="mt-2 font-body text-sm text-muted-foreground">
                    {activeTicket.user_id ? profilesByUserId[activeTicket.user_id]?.full_name || "Customer" : "Guest"} • {productsById[activeTicket.product_id || ""]?.name || "General support"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-3">
                  <select
                    value={activeDraft.status}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [activeTicket.id]: { ...activeDraft, status: event.target.value as TicketStatus },
                      }))
                    }
                    className="rounded-full border border-border bg-background px-4 py-2 font-ui text-[10px] tracking-[0.18em] uppercase text-foreground focus:border-accent focus:outline-none"
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status.replace(/_/g, " ")}
                      </option>
                    ))}
                  </select>
                  <select
                    value={activeDraft.priority}
                    onChange={(event) =>
                      setDrafts((current) => ({
                        ...current,
                        [activeTicket.id]: { ...activeDraft, priority: event.target.value as TicketPriority },
                      }))
                    }
                    className="rounded-full border border-border bg-background px-4 py-2 font-ui text-[10px] tracking-[0.18em] uppercase text-foreground focus:border-accent focus:outline-none"
                  >
                    {priorityOptions.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => void saveTicket()}
                    disabled={savingTicket}
                    className="rounded-full bg-accent px-5 py-2 font-ui text-[10px] tracking-[0.2em] uppercase text-accent-foreground transition-colors hover:bg-gold-dark disabled:opacity-50"
                  >
                    {savingTicket ? "Saving..." : "Save Ticket"}
                  </button>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {messages.map((message) => {
                  const isAdminMessage = message.sender_role === "admin" || message.sender_role === "super_admin";
                  return (
                    <div key={message.id} className={`flex ${isAdminMessage ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] rounded-[20px] px-4 py-3 ${isAdminMessage ? "bg-accent text-accent-foreground" : "border border-border bg-background/60 text-foreground"}`}>
                        <p className="font-ui text-[10px] tracking-[0.16em] uppercase opacity-80">
                          {isAdminMessage ? "Support" : "Customer"}
                        </p>
                        <p className="mt-2 font-body text-sm leading-6">{message.message}</p>
                        <p className="mt-2 font-ui text-[10px] tracking-[0.16em] uppercase opacity-70">
                          {new Date(message.created_at).toLocaleString("en-IN")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 rounded-[22px] border border-border bg-background/50 p-4">
                <div className="mb-3 flex items-center gap-2 text-accent">
                  <Sparkles size={15} />
                  <p className="font-ui text-[10px] tracking-[0.2em] uppercase">Reply to customer</p>
                </div>
                <textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  rows={4}
                  placeholder="Type your reply..."
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 font-body text-foreground focus:border-accent focus:outline-none resize-none"
                />
                <button
                  type="button"
                  onClick={() => void sendReply()}
                  disabled={sendingReply || !reply.trim()}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 font-ui text-[10px] tracking-[0.22em] uppercase text-accent-foreground transition-colors hover:bg-gold-dark disabled:opacity-50"
                >
                  <Send size={14} />
                  {sendingReply ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </>
          ) : (
            <div className="py-16 text-center font-body text-muted-foreground">
              Select a support ticket to start replying.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupportInbox;
