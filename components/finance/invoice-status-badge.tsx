import { invoiceStatusLabel } from "@/lib/expert/mock-data";
import type { InvoiceStatus } from "@/lib/expert/types";
import { Badge } from "@/components/ui/badge";

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return <Badge variant="success" dot>{invoiceStatusLabel[status]}</Badge>;
}
