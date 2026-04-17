import { invoiceStatusLabel } from "@/lib/expert/mock-data";
import type { InvoiceStatus } from "@/lib/expert/types";

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return (
    <span className="inline-flex items-center rounded-xl border border-[#BBF7D0] bg-[#F0FDF4] px-2.5 py-1 text-xs font-medium text-[#4D7D54]">
      {invoiceStatusLabel[status]}
    </span>
  );
}
