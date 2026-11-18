export type EnquirySource =
  | "property_dealer"
  | "property_callback"
  | "listing_contact"
  | "project_enquiry"
  | "city_enquiry"
  | "service_home_loan"
  | "service_legal_verification"
  | "service_rent_agreement"
  | "service_property_valuation";

export interface EnquiryPayload {
  source: EnquirySource;
  phone: string;
  name?: string;
  message?: string;
  role?: "individual" | "dealer" | "tenant" | "owner";
  propertyTitle?: string;
  propertyId?: string;
  propertyRef?: string;
  dealer?: string;
  /** Honeypot: must stay empty. */
  website?: string;
}

/** Sends an enquiry to /api/enquiry, which stores it in the WordPress Enquiries inbox. */
export async function sendEnquiry(payload: EnquiryPayload): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const res = await fetch("/api/enquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (!res.ok || !data.ok) {
      return { ok: false, error: data.error || "Something went wrong. Please try again." };
    }
    return { ok: true };
  } catch {
    return { ok: false, error: "Couldn't reach the server. Check your connection and try again." };
  }
}
