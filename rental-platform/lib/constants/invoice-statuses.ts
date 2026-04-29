
import type { InvoiceStatus } from "@/lib/types/booking.types";

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  Draft: "Draft",
  Issued: "Issued",
  Cancelled: "Cancelled",
};

