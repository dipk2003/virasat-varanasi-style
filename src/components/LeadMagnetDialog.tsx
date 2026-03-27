import { useEffect, useState } from "react";
import { ArrowRight, Gift, LoaderCircle, ShieldCheck } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { submitLeadRequest } from "@/lib/leadRequests";
import { useToast } from "@/hooks/use-toast";

type LeadMagnetDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  machineOptions: string[];
  onRequestDetailedQuote: (machine?: string) => void;
};

const LeadMagnetDialog = ({
  open,
  onOpenChange,
  machineOptions,
  onRequestDetailedQuote,
}: LeadMagnetDialogProps) => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    machineInterest: machineOptions[0] ?? "",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) {
      setSubmitting(false);
    }
  }, [open]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await submitLeadRequest({
        full_name: form.fullName,
        phone: form.phone,
        machine_interest: form.machineInterest,
        source: "lead-magnet-popup",
      });

      localStorage.setItem("spectra-pack-lead-submitted-at", Date.now().toString());
      toast({
        title: "Lead captured",
        description: "Your request is saved. The team can now follow up with a proposal.",
      });
      onOpenChange(false);
      setForm({
        fullName: "",
        phone: "",
        machineInterest: machineOptions[0] ?? "",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Submission failed",
        description: "The popup form could not save your details. Use the full quote form below.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden border-white/10 bg-[#08101d] p-0 text-foreground sm:max-w-4xl">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative overflow-hidden border-b border-white/10 p-8 lg:border-b-0 lg:border-r">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.16),transparent_32%),linear-gradient(180deg,rgba(5,10,20,0.96),rgba(8,16,29,0.92))]" />
            <div className="absolute inset-0 bg-industrial-grid opacity-30" />
            <div className="relative">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 font-ui text-[10px] uppercase tracking-[0.28em] text-accent">
                <Gift size={14} />
                Free Lead Magnet
              </div>
              <DialogHeader className="space-y-4 text-left">
                <DialogTitle className="font-display text-3xl text-foreground">
                  Get a free packaging line recommendation
                </DialogTitle>
                <DialogDescription className="max-w-md font-body text-lg leading-relaxed text-muted-foreground">
                  Share your machine interest and phone number. The site captures the lead immediately and the detailed quote form stays available below for a full RFQ.
                </DialogDescription>
              </DialogHeader>

              <div className="mt-8 space-y-4">
                {[
                  "Shortlist the right machine family faster",
                  "Capture leads without forcing login",
                  "Keep the page readable for Google and AI crawlers",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <ShieldCheck size={18} className="mt-1 text-primary" />
                    <p className="font-body text-base text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-8">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block font-ui text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
                  Full Name
                </label>
                <Input
                  required
                  value={form.fullName}
                  onChange={(event) => setForm((current) => ({ ...current, fullName: event.target.value }))}
                  placeholder="Your name"
                  className="h-12 border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground/70"
                />
              </div>

              <div>
                <label className="mb-2 block font-ui text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
                  Phone
                </label>
                <Input
                  required
                  value={form.phone}
                  onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))}
                  placeholder="Mobile number"
                  className="h-12 border-white/10 bg-white/5 text-foreground placeholder:text-muted-foreground/70"
                />
              </div>

              <div>
                <label className="mb-2 block font-ui text-[10px] uppercase tracking-[0.26em] text-muted-foreground">
                  Machine Interest
                </label>
                <select
                  value={form.machineInterest}
                  onChange={(event) => setForm((current) => ({ ...current, machineInterest: event.target.value }))}
                  className="flex h-12 w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 font-ui text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {machineOptions.map((option) => (
                    <option key={option} value={option} className="bg-[#08101d]">
                      {option}
                    </option>
                  ))}
                </select>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="h-12 w-full rounded-full bg-accent px-6 font-ui text-[11px] uppercase tracking-[0.3em] text-accent-foreground hover:bg-accent/90"
              >
                {submitting ? <LoaderCircle className="animate-spin" /> : "Get Free Callback"}
              </Button>
            </form>

            <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <p className="font-ui text-[10px] uppercase tracking-[0.24em] text-primary">
                Need a fuller brief?
              </p>
              <p className="mt-2 font-body text-base leading-relaxed text-muted-foreground">
                Open the detailed quote form to share company name, email, quantity, and application notes for a more accurate proposal.
              </p>
              <Button
                type="button"
                variant="ghost"
                onClick={() => {
                  onOpenChange(false);
                  onRequestDetailedQuote(form.machineInterest);
                }}
                className="mt-4 h-auto p-0 font-ui text-[11px] uppercase tracking-[0.26em] text-accent hover:bg-transparent hover:text-accent"
              >
                Open Detailed Quote Form
                <ArrowRight />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default LeadMagnetDialog;
