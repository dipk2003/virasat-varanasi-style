import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type LeadRequestInsert = Database["public"]["Tables"]["lead_requests"]["Insert"];

const emptyToNull = (value?: string | null) => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

export const submitLeadRequest = async (payload: LeadRequestInsert) => {
  const { error } = await supabase.from("lead_requests").insert({
    full_name: payload.full_name.trim(),
    phone: payload.phone.trim(),
    company_name: emptyToNull(payload.company_name),
    email: emptyToNull(payload.email),
    machine_interest: emptyToNull(payload.machine_interest),
    quantity: emptyToNull(payload.quantity),
    message: emptyToNull(payload.message),
    source: payload.source ?? "website",
  });

  if (error) {
    throw error;
  }
};
