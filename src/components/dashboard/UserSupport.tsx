import { FormEvent, useEffect, useMemo, useState } from "react";
import { Headset, MessageSquare, Plus, Send, Sparkles } from "lucide-react";
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

type ProductOption = {
  id: string;
  name: string;
  slug: string;
};

const defaultTicketForm = {
  subject: "",
  description: "",
  priority: "medium" as TicketPriority,
  product_id: "",
};

const priorityOptions: TicketPriority[] = ["low", "medium", "high", "urgent"];
const openStatuses: TicketStatus[] = ["open", "in_progress", "waiting_for_customer"];

const UserSupport = () => {
  const db = untypedDb;
  const { user } = useAuth();
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [ticketForm, setTicketForm] = useState(defaultTicketForm);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [sending, setSending] = useState(false);
  const [relationReady, setRelationReady] = useState(true);

  const productsById = useMemo(
    () =>
      products.reduce<Record<string, ProductOption>>((acc, product) => {
        acc[product.id] = product;
        return acc;
      }, {}),
    [products]
  );

  const fetchProducts = async () => {
    const { data } = await db
      .from("products")
      .select("id, name, slug")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(100);

    setProducts((data || []) as ProductOption[]);
  };

  const fetchTickets = async () => {
    if (!user) return;

    const { data, error } = await db
      .from("support_tickets")
      .select("*")
      .eq("user_id", user.id)
      .order("last_message_at", { ascending: false })
      .order("created_at", { ascending: false });

    if (error) {
      if (isMissingRelationError(error)) {
        setRelationReady(false);
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
      setLoading(false);
      return;
    }

    const nextTickets = (data || []) as SupportTicket[];
    setRelationReady(true);
    setTickets(nextTickets);
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
    if (!user) return;
    void Promise.all([fetchProducts(), fetchTickets()]);
  }, [user?.id]);

  useEffect(() => {
    if (!activeTicketId) {
      setMessages([]);
      return;
    }

    void fetchMessages(activeTicketId);
  }, [activeTicketId]);

  useEffect(() => {
    if (!user || !relationReady) return;

    const channel = supabase.channel(`customer-support-${user.id}-${activeTicketId || "none"}`);

    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table: "support_tickets", filter: `user_id=eq.${user.id}` },
      () => void fetchTickets()
    );

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
  }, [activeTicketId, relationReady, user?.id]);

  const createTicket = async (event: FormEvent) => {
    event.preventDefault();
    if (!user) return;

    setCreating(true);
    const { data: ticket, error } = await db
      .from("support_tickets")
      .insert({
        user_id: user.id,
        subject: ticketForm.subject.trim(),
        description: ticketForm.description.trim(),
        priority: ticketForm.priority,
        product_id: ticketForm.product_id || null,
        source: "web",
      })
      .select("*")
      .single();

    if (error || !ticket) {
      setCreating(false);
      toast({ title: "Error", description: error?.message || "Ticket could not be created", variant: "destructive" });
      return;
    }

    const { error: messageError } = await db.from("support_messages").insert({
      ticket_id: ticket.id,
      sender_id: user.id,
      sender_role: "user",
      message: ticketForm.description.trim(),
    });

    setCreating(false);

    if (messageError) {
      toast({ title: "Error", description: messageError.message, variant: "destructive" });
      return;
    }

    toast({ title: "Support chat started", description: "Team ko aapka message mil gaya hai." });
    setTicketForm(defaultTicketForm);
    await fetchTickets();
    setActiveTicketId(ticket.id);
    await fetchMessages(ticket.id);
  };

  const sendReply = async () => {
    if (!user || !activeTicketId || !reply.trim()) return;

    setSending(true);
    const activeTicket = tickets.find((ticket) => ticket.id === activeTicketId);

    const { error } = await db.from("support_messages").insert({
      ticket_id: activeTicketId,
      sender_id: user.id,
      sender_role: "user",
      message: reply.trim(),
    });

    if (!error && activeTicket?.status === "waiting_for_customer") {
      await db.from("support_tickets").update({ status: "open" }).eq("id", activeTicketId);
    }

    setSending(false);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }

    setReply("");
    await fetchMessages(activeTicketId);
    await fetchTickets();
  };

  const activeTicket = tickets.find((ticket) => ticket.id === activeTicketId) || null;
  const openCount = tickets.filter((ticket) => openStatuses.includes(ticket.status)).length;

  if (loading) return <div className="font-body text-muted-foreground">Loading support desk...</div>;

  if (!relationReady) {
    return (
      <div className="rounded-[28px] border border-border/80 bg-card/95 p-6">
        <h2 className="font-display text-2xl text-foreground">Support Desk</h2>
        <p className="mt-3 font-body text-sm leading-7 text-muted-foreground">
          Support chat UI ready hai, but `support_messages` migration abhi database me apply nahi hui.
          New support chat migration run karte hi live conversation yahan activate ho jayegi.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-border/80 bg-[linear-gradient(160deg,hsl(var(--accent)/0.08),transparent_36%),linear-gradient(180deg,hsl(var(--card)),hsl(var(--card)))] p-6 sm:p-7">
        <p className="font-ui text-[10px] tracking-[0.26em] uppercase text-accent">Support Concierge</p>
        <h2 className="mt-3 font-display text-3xl text-foreground">Ask About Products, Orders, or Delivery</h2>
        <p className="mt-3 max-w-3xl font-body text-sm leading-7 text-muted-foreground">
          Product-related sawaal, order issue, delivery follow-up, ya styling support ke liye direct live thread shuru karo.
          Admin ya support team same thread me reply karegi.
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-border bg-background/70 px-3 py-1.5 font-ui text-[10px] tracking-[0.18em] uppercase text-muted-foreground">
            {tickets.length} total chats
          </span>
          <span className="rounded-full border border-border bg-background/70 px-3 py-1.5 font-ui text-[10px] tracking-[0.18em] uppercase text-muted-foreground">
            {openCount} active
          </span>
          <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 font-ui text-[10px] tracking-[0.18em] uppercase text-accent">
            Live updates enabled
          </span>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[360px,minmax(0,1fr)]">
        <div className="space-y-6">
          <form onSubmit={createTicket} className="rounded-[28px] border border-border/80 bg-card/95 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent">
                <Plus size={18} />
              </div>
              <div>
                <p className="font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">New Chat</p>
                <h3 className="mt-1 font-display text-2xl text-foreground">Start Support Conversation</h3>
              </div>
            </div>

            <div className="mt-5 space-y-4">
              <input
                type="text"
                value={ticketForm.subject}
                onChange={(event) => setTicketForm((current) => ({ ...current, subject: event.target.value }))}
                placeholder="Subject"
                required
                className="w-full rounded-2xl border border-border bg-background/70 px-4 py-3 font-body text-foreground focus:border-accent focus:outline-none"
              />

              <select
                value={ticketForm.product_id}
                onChange={(event) => setTicketForm((current) => ({ ...current, product_id: event.target.value }))}
                className="w-full rounded-2xl border border-border bg-background/70 px-4 py-3 font-body text-foreground focus:border-accent focus:outline-none"
              >
                <option value="">General support</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>

              <select
                value={ticketForm.priority}
                onChange={(event) => setTicketForm((current) => ({ ...current, priority: event.target.value as TicketPriority }))}
                className="w-full rounded-2xl border border-border bg-background/70 px-4 py-3 font-body text-foreground focus:border-accent focus:outline-none"
              >
                {priorityOptions.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority.replace("_", " ")}
                  </option>
                ))}
              </select>

              <textarea
                value={ticketForm.description}
                onChange={(event) => setTicketForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Apna question ya issue yahan likho..."
                rows={5}
                required
                className="w-full rounded-2xl border border-border bg-background/70 px-4 py-3 font-body text-foreground focus:border-accent focus:outline-none resize-none"
              />

              <button
                type="submit"
                disabled={creating}
                className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 font-ui text-[10px] tracking-[0.22em] uppercase text-accent-foreground transition-colors hover:bg-gold-dark disabled:opacity-50"
              >
                <Send size={14} />
                {creating ? "Starting..." : "Start Chat"}
              </button>
            </div>
          </form>

          <div className="rounded-[28px] border border-border/80 bg-card/95 p-5 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent">
                <Headset size={18} />
              </div>
              <div>
                <p className="font-ui text-[10px] tracking-[0.22em] uppercase text-muted-foreground">Your Threads</p>
                <h3 className="mt-1 font-display text-2xl text-foreground">Support Chats</h3>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              {tickets.length === 0 ? (
                <p className="font-body text-sm text-muted-foreground">No support chats yet.</p>
              ) : (
                tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    type="button"
                    onClick={() => setActiveTicketId(ticket.id)}
                    className={`w-full rounded-[22px] border p-4 text-left transition-colors ${
                      activeTicketId === ticket.id
                        ? "border-accent/35 bg-accent/5"
                        : "border-border bg-background/45 hover:border-accent/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-display text-lg text-foreground">{ticket.subject}</p>
                        <p className="mt-1 font-body text-sm text-muted-foreground">
                          {productsById[ticket.product_id || ""]?.name || "General support"}
                        </p>
                      </div>
                      <span className="rounded-full border border-border px-2 py-1 font-ui text-[10px] tracking-[0.16em] uppercase text-muted-foreground">
                        {ticket.status.replace(/_/g, " ")}
                      </span>
                    </div>
                    <p className="mt-3 font-ui text-[10px] tracking-[0.18em] uppercase text-muted-foreground">
                      {new Date(ticket.last_message_at || ticket.updated_at).toLocaleString("en-IN")}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-border/80 bg-card/95 p-5 sm:p-6">
          {activeTicket ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
                <div>
                  <p className="font-ui text-[10px] tracking-[0.22em] uppercase text-accent">Live Thread</p>
                  <h3 className="mt-2 font-display text-3xl text-foreground">{activeTicket.subject}</h3>
                  <p className="mt-2 font-body text-sm text-muted-foreground">
                    {productsById[activeTicket.product_id || ""]?.name || "General support inquiry"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-border px-3 py-1.5 font-ui text-[10px] tracking-[0.18em] uppercase text-muted-foreground">
                    {activeTicket.priority}
                  </span>
                  <span className="rounded-full border border-accent/20 bg-accent/10 px-3 py-1.5 font-ui text-[10px] tracking-[0.18em] uppercase text-accent">
                    {activeTicket.status.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                {messages.map((message) => {
                  const isUserMessage = message.sender_role === "user";
                  return (
                    <div
                      key={message.id}
                      className={`flex ${isUserMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[85%] rounded-[22px] px-4 py-3 ${
                          isUserMessage
                            ? "bg-accent text-accent-foreground"
                            : "border border-border bg-background/60 text-foreground"
                        }`}
                      >
                        <p className="font-ui text-[10px] tracking-[0.18em] uppercase opacity-80">
                          {isUserMessage ? "You" : "Support Team"}
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

              <div className="mt-6 rounded-[24px] border border-border bg-background/55 p-4">
                <div className="mb-3 flex items-center gap-2 text-accent">
                  <Sparkles size={15} />
                  <p className="font-ui text-[10px] tracking-[0.2em] uppercase">Reply</p>
                </div>
                <textarea
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  rows={4}
                  placeholder="Apna next message bhejo..."
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 font-body text-foreground focus:border-accent focus:outline-none resize-none"
                />
                <button
                  type="button"
                  onClick={() => void sendReply()}
                  disabled={sending || !reply.trim()}
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 font-ui text-[10px] tracking-[0.22em] uppercase text-accent-foreground transition-colors hover:bg-gold-dark disabled:opacity-50"
                >
                  <Send size={14} />
                  {sending ? "Sending..." : "Send Reply"}
                </button>
              </div>
            </>
          ) : (
            <div className="py-16 text-center">
              <MessageSquare size={42} className="mx-auto text-muted-foreground/30" />
              <h3 className="mt-4 font-display text-2xl text-foreground">No active support thread</h3>
              <p className="mt-3 font-body text-sm leading-7 text-muted-foreground">
                Left side se new chat start karo ya existing support thread open karo.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserSupport;
